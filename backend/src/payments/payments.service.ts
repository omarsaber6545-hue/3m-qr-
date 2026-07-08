import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private stripe: Stripe;
  private isConfigured = false;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService
  ) {
    const apiKey = this.configService.get<string>('STRIPE_API_KEY');
    if (apiKey && apiKey !== 'sk_test_placeholder') {
      this.stripe = new Stripe(apiKey, {
        apiVersion: '2023-10-16' as any,
      });
      this.isConfigured = true;
      this.logger.log('Stripe client configured successfully.');
    } else {
      this.logger.warn('STRIPE_API_KEY is missing or placeholder. Running in Payment Simulation mode.');
    }
  }

  /**
   * Creates a checkout session for subscription or credit purchase.
   */
  async createCheckoutSession(userId: string, planType: string): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');

    // MOCK MODE IF STRIPE IS NOT CONFIGURED
    if (!this.isConfigured) {
      this.logger.log(`[SIMULATION] Creating checkout session for user ${userId} - plan: ${planType}`);
      // Simulate success callback by appending query params
      return `${frontendUrl}/dashboard/billing?status=success&session_id=mock_session_${Date.now()}&plan=${planType}`;
    }

    try {
      let priceId = '';
      let mode: 'payment' | 'subscription' = 'subscription';
      let metadata: any = { userId, planType };

      if (planType === 'STARTER') {
        priceId = this.configService.get<string>('STRIPE_STARTER_PRICE_ID');
      } else if (planType === 'PRO') {
        priceId = this.configService.get<string>('STRIPE_PRO_PRICE_ID');
      } else if (planType === 'ENTERPRISE') {
        priceId = this.configService.get<string>('STRIPE_ENTERPRISE_PRICE_ID');
      } else if (planType === 'CREDITS_50') {
        // One-time credit top up
        mode = 'payment';
        metadata.credits = '50';
        priceId = 'price_credits_50_placeholder'; // Replace or dynamic price creation
      } else if (planType === 'CREDITS_200') {
        mode = 'payment';
        metadata.credits = '200';
        priceId = 'price_credits_200_placeholder';
      }

      if (!priceId) {
        throw new BadRequestException(`Invalid plan or price ID for type: ${planType}`);
      }

      const session = await this.stripe.checkout.sessions.create({
        customer_email: user.email,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode,
        success_url: `${frontendUrl}/dashboard/billing?status=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/dashboard/billing?status=canceled`,
        metadata,
      });

      return session.url;
    } catch (error) {
      this.logger.error('Failed to create Stripe checkout session', error.stack);
      throw new BadRequestException(`Stripe Checkout Error: ${error.message}`);
    }
  }

  /**
   * Processes Stripe Webhooks
   */
  async handleWebhook(rawBody: string, signature: string): Promise<any> {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!this.isConfigured) {
      this.logger.warn('[SIMULATION] Stripe webhook received but Stripe is unconfigured.');
      return { received: true, simulated: true };
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    this.logger.log(`Processing stripe event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.handleCheckoutSessionCompleted(session);
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.handleSubscriptionUpdated(subscription);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.handleSubscriptionDeleted(subscription);
        break;
      }
      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  /**
   * Simulation webhook triggers for local testing
   */
  async triggerMockSubscription(userId: string, plan: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE') {
    this.logger.log(`[SIMULATION] Triggering subscription upgrade: User ${userId} -> Plan ${plan}`);
    let credits = 10;
    if (plan === 'STARTER') credits = 100;
    else if (plan === 'PRO') credits = 500;
    else if (plan === 'ENTERPRISE') credits = 5000;

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionPlan: plan,
        subscriptionStatus: plan === 'FREE' ? 'INACTIVE' : 'ACTIVE',
        credits: {
          increment: credits,
        },
      },
    });
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    const planType = session.metadata?.planType;
    const creditCountStr = session.metadata?.credits;

    if (!userId) {
      this.logger.error('No UserID in Stripe checkout session metadata.');
      return;
    }

    // Capture payment in DB
    await this.prisma.payment.create({
      data: {
        stripeSessionId: session.id,
        amount: session.amount_total ? session.amount_total / 100 : 0,
        currency: session.currency || 'usd',
        status: 'COMPLETED',
        type: planType && planType.includes('CREDITS') ? 'CREDITS' : 'SUBSCRIPTION',
        creditsAdded: creditCountStr ? parseInt(creditCountStr, 10) : 0,
        userId,
      },
    });

    if (planType && planType.includes('CREDITS')) {
      const creditsToAdd = creditCountStr ? parseInt(creditCountStr, 10) : 0;
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          credits: {
            increment: creditsToAdd,
          },
        },
      });
      this.logger.log(`Added ${creditsToAdd} credits to User ${userId}`);
    } else if (planType) {
      // It's a subscription checkout
      let initialCredits = 100;
      if (planType === 'PRO') initialCredits = 500;
      if (planType === 'ENTERPRISE') initialCredits = 5000;

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionPlan: planType as any,
          subscriptionStatus: 'ACTIVE',
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          credits: {
            increment: initialCredits,
          },
        },
      });
      this.logger.log(`Updated user ${userId} to plan ${planType}`);
    }
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const customerId = subscription.customer as string;
    const user = await this.prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (!user) {
      this.logger.error(`No user found matching stripe customer: ${customerId}`);
      return;
    }

    // Determine status
    const status = subscription.status === 'active' ? 'ACTIVE' : 'INACTIVE';
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: status,
      },
    });
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const customerId = subscription.customer as string;
    const user = await this.prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (!user) {
      this.logger.error(`No user found matching stripe customer: ${customerId}`);
      return;
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionPlan: 'FREE',
        subscriptionStatus: 'INACTIVE',
        stripeSubscriptionId: null,
      },
    });
    this.logger.log(`Subscription cancelled for user ${user.id}`);
  }
}

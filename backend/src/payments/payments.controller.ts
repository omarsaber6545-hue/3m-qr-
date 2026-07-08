import { Controller, Post, Body, Get, Req, Headers, UseGuards, HttpCode, HttpStatus, RawBodyRequest, BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('checkout')
  @UseGuards(AuthGuard('jwt'))
  async createCheckout(@Req() req, @Body() body: { planType: string }) {
    const userId = req.user.id;
    const checkoutUrl = await this.paymentsService.createCheckoutSession(userId, body.planType);
    return { checkoutUrl };
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string
  ) {
    if (!signature) {
      throw new BadRequestException('Stripe signature missing');
    }
    
    // Express raw body parsing is required for Stripe signature verification
    const rawBody = (req as any).rawBody ? (req as any).rawBody.toString() : '';
    return this.paymentsService.handleWebhook(rawBody, signature);
  }

  @Post('mock-upgrade')
  @UseGuards(AuthGuard('jwt'))
  async mockUpgrade(@Req() req, @Body() body: { plan: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE' }) {
    const userId = req.user.id;
    const updatedUser = await this.paymentsService.triggerMockSubscription(userId, body.plan);
    return {
      success: true,
      message: `Simulated subscription upgrade to ${body.plan} succeeded`,
      user: {
        subscriptionPlan: updatedUser.subscriptionPlan,
        subscriptionStatus: updatedUser.subscriptionStatus,
        credits: updatedUser.credits,
      },
    };
  }
}

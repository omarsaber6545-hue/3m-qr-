'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/utils/api';
import { 
  CreditCard, Check, Coins, ArrowUpRight, Loader2, Sparkles, AlertCircle
} from 'lucide-react';

export default function BillingPage() {
  const { user, updateSubscription, addCredits } = useAuthStore();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Monitor query parameters on redirect (success callbacks)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const plan = params.get('plan');

    if (status === 'success') {
      setAlertMsg({
        type: 'success',
        text: `Thank you! Your payment succeeded.`,
      });
      // Hydrate local client store values if simulation bypassed Stripe callback
      if (plan) {
        updateSubscription(plan, 'ACTIVE');
      }
    } else if (status === 'canceled') {
      setAlertMsg({
        type: 'error',
        text: 'Payment canceled. No charges were made.',
      });
    }

    fetchPaymentLogs();
  }, []);

  const fetchPaymentLogs = async () => {
    try {
      // Mock log loader or load admin payments
      // In NestJS, payments are created on Stripe completed callback
      // We load custom payments associated with current user
      // We will create a dummy route or fetch payments. Let's load the endpoint.
      // If we don't have user specific payments endpoint, we fetch from standard path
      const response = await api.get('/admin/payments?limit=10'); // Admin API fallback or route
      // Filter logs for user
      if (response.data && response.data.payments) {
        setPayments(response.data.payments.filter((p: any) => p.userId === user?.id));
      }
    } catch (e) {
      console.log('Failed to fetch payments logs.');
    }
  };

  const handleCheckout = async (planType: string) => {
    setLoadingPlan(planType);
    setAlertMsg(null);
    try {
      const response = await api.post('/payments/checkout', { planType });
      // Redirect to Stripe Checkout session url (or simulation callback url)
      window.location.href = response.data.checkoutUrl;
    } catch (err: any) {
      setAlertMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to initialize checkout session.',
      });
      setLoadingPlan(null);
    }
  };

  const handleMockUpgrade = async (plan: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE') => {
    setLoadingPlan(plan);
    setAlertMsg(null);
    try {
      const res = await api.post('/payments/mock-upgrade', { plan });
      const { user: updatedData } = res.data;
      updateSubscription(updatedData.subscriptionPlan, updatedData.subscriptionStatus);
      // Synchronize credits
      addCredits(updatedData.credits - (user?.credits || 0));
      
      setAlertMsg({
        type: 'success',
        text: `Simulated subscription upgraded successfully to ${plan}!`,
      });
    } catch (err: any) {
      setAlertMsg({
        type: 'error',
        text: 'Failed to process mock subscription upgrade.',
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-extrabold flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-purple-500" /> Billing & Subscriptions
        </h1>
        <p className="text-xs text-gray-500 mt-1">Manage plans, buy generation credits, and review purchase logs.</p>
      </div>

      {/* ALERT MESSAGE BANNER */}
      {alertMsg && (
        <div className={`
          p-4 rounded-xl border flex gap-3 items-center text-sm
          ${alertMsg.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}
        `}>
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{alertMsg.text}</span>
        </div>
      )}

      {/* CURRENT STATUS PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl bg-white/5 border border-white/5 col-span-2 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-inner">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Active Plan</div>
              <h2 className="text-xl font-extrabold text-white mt-0.5">{user.subscriptionPlan} Tier</h2>
              <span className="inline-block text-[10px] uppercase font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded mt-1.5">
                {user.subscriptionStatus === 'ACTIVE' ? 'Active & Renewing' : 'Free Sandbox Mode'}
              </span>
            </div>
          </div>
          <div className="text-center md:text-right">
            <span className="block text-2xl font-black text-white">{user.credits}</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Credits Available</span>
          </div>
        </div>

        {/* TOP UP QUICK BUY BOX */}
        <div className="glass-panel p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-sm text-gray-200">Need more credits?</h3>
          </div>
          <p className="text-xs text-gray-500 mt-2">Buy instant credit refills starting at only $5.</p>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button 
              onClick={() => handleCheckout('CREDITS_50')}
              className="py-2.5 rounded-xl border border-white/10 hover:border-purple-500/50 bg-white/5 text-xs font-semibold text-gray-200 hover:text-white transition flex items-center justify-center gap-1.5"
            >
              50 Credits ($5)
            </button>
            <button 
              onClick={() => handleCheckout('CREDITS_200')}
              className="py-2.5 rounded-xl border border-white/10 hover:border-purple-500/50 bg-white/5 text-xs font-semibold text-gray-200 hover:text-white transition flex items-center justify-center gap-1.5"
            >
              200 Credits ($15)
            </button>
          </div>
        </div>
      </div>

      {/* PLANS SELECTION CARD GRID */}
      <div className="space-y-4">
        <h3 className="font-bold text-base text-gray-200">Select Subscription Tier</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { id: 'STARTER', name: 'Starter', price: 9, credits: 100, features: ['100 AI Credits / mo', '100+ AI Art Styles', 'Standard PNG & WEBP downloads'] },
            { id: 'PRO', name: 'Pro', price: 29, credits: 500, features: ['500 AI Credits / mo', 'Embed Brand Logo overlay', 'High-res PNG, SVG, PDF formats', 'Priority processing queues'] },
            { id: 'ENTERPRISE', name: 'Enterprise', price: 99, credits: 5000, features: ['5000 AI Credits / mo', 'Direct API integrations', 'Custom ComfyUI JSON workflows', '24/7 Priority SLA support'] },
          ].map((plan) => {
            const isCurrent = user.subscriptionPlan === plan.id;
            return (
              <div 
                key={plan.id}
                className={`
                  glass-panel p-6 rounded-2xl border flex flex-col justify-between h-80 bg-white/5
                  ${isCurrent ? 'border-purple-500 bg-purple-950/5' : 'border-white/5'}
                `}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-base text-white">{plan.name}</span>
                    {isCurrent && <span className="text-[8px] uppercase tracking-wider font-extrabold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">Current</span>}
                  </div>
                  <div className="text-2xl font-black text-white mt-2 mb-4">
                    ${plan.price}<span className="text-xs text-gray-500">/mo</span>
                  </div>

                  <ul className="space-y-2 text-xs text-gray-400">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2 mt-6">
                  {/* Stripe checkout */}
                  <button 
                    onClick={() => handleCheckout(plan.id)}
                    disabled={isCurrent || loadingPlan !== null}
                    className="flex-1 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-purple-950 disabled:text-gray-400 disabled:opacity-50 text-white font-bold text-xs transition flex items-center justify-center gap-1 shadow-lg shadow-purple-500/10 glow-btn"
                  >
                    {loadingPlan === plan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Subscribe'}
                  </button>
                  {/* Sandbox simulator shortcut */}
                  <button 
                    onClick={() => handleMockUpgrade(plan.id as any)}
                    disabled={isCurrent}
                    className="px-3 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-400 hover:text-white transition border border-white/5"
                    title="Simulate Upgrade (Sandbox Mode)"
                  >
                    Simulate
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TRANSACTION LOGS */}
      <div className="space-y-4">
        <h3 className="font-bold text-base text-gray-200">Billing History</h3>
        <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden bg-white/5">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-white/5 text-gray-400 border-b border-white/5 uppercase tracking-wider font-semibold">
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">No payments logged yet. Upgrades via simulation do not create transaction records.</td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 text-gray-300">
                    <td className="px-6 py-4 font-mono">{p.stripeSessionId.slice(0, 15)}...</td>
                    <td className="px-6 py-4 font-semibold uppercase">{p.type}</td>
                    <td className="px-6 py-4">${p.amount}</td>
                    <td className="px-6 py-4 text-green-400 font-bold uppercase">{p.status}</td>
                    <td className="px-6 py-4">{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

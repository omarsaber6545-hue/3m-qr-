'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  QrCode, Sparkles, Zap, Shield, HelpCircle, ArrowRight, CheckCircle2, 
  Menu, X, Play, Image as ImageIcon, Download, Check
} from 'lucide-react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoText, setDemoText] = useState('https://google.com');
  const [isDemoGenerating, setIsDemoGenerating] = useState(false);
  const [demoResult, setDemoResult] = useState<string | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How does AI QR generation work?',
      a: 'We combine a standard QR code matrix with a Stable Diffusion diffusion model using ControlNet. This directs the AI model to shape the generated image output around the contrast patterns of the QR code, preserving scannability while adding high-end art.',
    },
    {
      q: 'Are these AI QR Codes really scannable?',
      a: 'Yes, absolutely! We optimize the ControlNet weights and use high error correction levels (Level H, which can recover up to 30% lost data) to ensure maximum compatibility across iOS and Android scanners.',
    },
    {
      q: 'Can I add my own custom logo?',
      a: 'Yes, our Pro and Enterprise plans allow uploading custom SVG/PNG brand logos to embed at the center of the QR matrix before the AI styling begins.',
    },
    {
      q: 'Can I use ComfyUI workflows directly?',
      a: 'Enterprise tier customers can upload their custom JSON ComfyUI API workflows, allowing them to hook up their own fine-tuned models and LoRAs directly into our processing queue.',
    },
  ];

  const handleDemoGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoText) return;
    setIsDemoGenerating(true);
    setDemoResult(null);
    
    // Simulate generation delay
    setTimeout(() => {
      setIsDemoGenerating(false);
      // Use standard google QR code API or a placeholder for demo styling
      setDemoResult(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(demoText)}`);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#030307] text-gray-100 overflow-x-hidden">
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 glass-panel bg-[#030307]/70 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
              3M <span className="text-purple-500">QR Studio</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#demo" className="hover:text-white transition">Live Demo</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
            <a href="#faq" className="hover:text-white transition">FAQ</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition">
              Sign In
            </Link>
            <Link href="/signup" className="px-4 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 text-sm font-semibold transition flex items-center justify-center glow-btn">
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-gray-400 hover:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#05050a] border-b border-white/10 px-4 py-6 flex flex-col gap-4 text-center"
            >
              <a href="#features" className="text-gray-300 py-2 border-b border-white/5" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#demo" className="text-gray-300 py-2 border-b border-white/5" onClick={() => setMobileMenuOpen(false)}>Live Demo</a>
              <a href="#pricing" className="text-gray-300 py-2 border-b border-white/5" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
              <a href="#faq" className="text-gray-300 py-2 border-b border-white/5" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
              <div className="flex flex-col gap-2 pt-4">
                <Link href="/login" className="text-gray-300 py-2 font-medium" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                <Link href="/signup" className="px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 font-semibold transition" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-400 mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen AI QR Technology
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            Create Gorgeous, Scan-Worthy <br/>
            <span className="gradient-text">Artistic AI QR Codes</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg text-gray-400 mb-10">
            Stop pasting boring black & white square boxes. Generate production-ready, highly stylized, scannable QR artworks matching your brand aesthetics instantly.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
            <Link href="/signup" className="flex-1 px-8 py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 glow-btn">
              Start Generating Free <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#demo" className="flex-1 px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 font-bold transition border border-white/15 flex items-center justify-center gap-2">
              Try Live Demo
            </a>
          </div>
        </motion.div>

        {/* HERO IMAGE SHOWCASE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-16 max-w-4xl mx-auto relative rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-purple-500/5 aspect-video bg-gray-900/50 flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#030307] via-transparent to-transparent z-10" />
          
          {/* Splitted before/after frame showcase */}
          <div className="w-full h-full flex flex-col md:flex-row relative">
            <div className="flex-1 bg-gradient-to-br from-indigo-950/20 to-black p-8 flex flex-col justify-center items-center gap-4">
              <span className="text-xs uppercase tracking-wider text-gray-500 font-bold">Standard Boring QR</span>
              <div className="w-40 h-40 bg-white p-2 rounded-xl flex items-center justify-center shadow-lg">
                {/* Standard placeholder QR */}
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://3mqrstudio.com" alt="Standard QR" className="w-full h-full" />
              </div>
            </div>
            
            <div className="w-px bg-white/10 h-full relative z-20 hidden md:block">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-purple-600 border border-white/20 flex items-center justify-center shadow-lg cursor-pointer">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>

            <div className="flex-1 bg-gradient-to-br from-purple-950/20 to-black p-8 flex flex-col justify-center items-center gap-4">
              <span className="text-xs uppercase tracking-wider text-purple-400 font-bold">AI QR Studio Art</span>
              <div className="w-40 h-40 rounded-xl overflow-hidden relative border-2 border-purple-500 shadow-2xl shadow-purple-500/30 flex items-center justify-center bg-gray-800">
                {/* Stylized QR placeholder */}
                <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80" alt="Artistic QR" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                  <QrCode className="w-24 h-24 text-white/40 mix-blend-overlay" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Complete Production Suite</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Everything you need to build, track, scale, and convert standard configurations into beautiful designer codes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl glass-panel border border-white/5 hover:border-purple-500/30 transition duration-300">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6">
              <Sparkles className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">AI QR Art Engine</h3>
            <p className="text-gray-400">Harness Stable Diffusion XL combined with QR ControlNet to mold prompts into beautiful scannable vector landscapes.</p>
          </div>

          <div className="p-8 rounded-2xl glass-panel border border-white/5 hover:border-purple-500/30 transition duration-300">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-6">
              <QrCode className="w-6 h-6 text-indigo-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">11+ Source Formats</h3>
            <p className="text-gray-400">Generate instantly from URL, Email, Phone, WhatsApp, WiFi, SMS, PDF files, vCards, Locations, and Calendar Events.</p>
          </div>

          <div className="p-8 rounded-2xl glass-panel border border-white/5 hover:border-purple-500/30 transition duration-300">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center mb-6">
              <Zap className="w-6 h-6 text-pink-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">Real-time WebSockets</h3>
            <p className="text-gray-400">Enjoy queue processing updates inside the creative studio with live status indicators and real-time generation percentages.</p>
          </div>
        </div>
      </section>

      {/* LIVE DEMO SECTION */}
      <section id="demo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400 mb-6">
              <Play className="w-3 h-3 fill-current" /> Live Generator Sandbox
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Test the scan speed</h2>
            <p className="text-gray-400 mb-8">
              Input a destination link, submit the generation, and check how quickly modern smartphone cameras can resolve artistic structures.
            </p>

            <form onSubmit={handleDemoGenerate} className="flex gap-2 max-w-md">
              <input 
                type="text" 
                value={demoText}
                onChange={(e) => setDemoText(e.target.value)}
                placeholder="Enter destination URL..." 
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 h-12 text-sm focus:outline-none focus:border-purple-500 transition"
              />
              <button 
                type="submit" 
                disabled={isDemoGenerating}
                className="px-6 h-12 rounded-xl bg-purple-600 hover:bg-purple-500 font-semibold transition disabled:opacity-50 flex items-center gap-2"
              >
                {isDemoGenerating ? 'Styling...' : 'Generate'}
              </button>
            </form>
          </div>

          <div className="flex justify-center">
            <div className="w-80 h-80 rounded-3xl glass-panel border border-white/10 p-6 flex flex-col items-center justify-center relative overflow-hidden aspect-square bg-[#05050c]">
              {isDemoGenerating ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
                  <span className="text-sm text-purple-400 animate-pulse font-medium">Baking AI weights...</span>
                </div>
              ) : demoResult ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-4 w-full h-full"
                >
                  <div className="w-56 h-56 bg-white p-2 rounded-2xl flex items-center justify-center shadow-lg">
                    <img src={demoResult} alt="Generated QR" className="w-full h-full" />
                  </div>
                  <button 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = demoResult;
                      link.download = '3m-qr-demo.png';
                      link.click();
                    }}
                    className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Download PNG
                  </button>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-center text-gray-500">
                  <QrCode className="w-16 h-16 mb-2" />
                  <span className="font-semibold text-sm">Waiting for input</span>
                  <span className="text-xs max-w-xs">Type a link and click Generate to see the result here</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Pricing Plans</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Get started with a free tier or scale up with advanced priority generation cycles.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* FREE */}
          <div className="p-8 rounded-2xl glass-panel border border-white/5 flex flex-col justify-between">
            <div>
              <span className="text-sm font-semibold text-purple-400 uppercase tracking-wider">Free</span>
              <div className="text-3xl font-extrabold mt-2 mb-6">$0</div>
              <ul className="space-y-3 text-sm text-gray-400 mb-8">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> 10 Credits / mo</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Standard QR Types</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> PNG Downloads</li>
              </ul>
            </div>
            <Link href="/signup" className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-center font-bold border border-white/10 transition">
              Get Started
            </Link>
          </div>

          {/* STARTER */}
          <div className="p-8 rounded-2xl glass-panel border border-white/5 flex flex-col justify-between">
            <div>
              <span className="text-sm font-semibold text-purple-400 uppercase tracking-wider">Starter</span>
              <div className="text-3xl font-extrabold mt-2 mb-6">$9<span className="text-sm text-gray-500">/mo</span></div>
              <ul className="space-y-3 text-sm text-gray-400 mb-8">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> 100 AI Credits / mo</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Access to 100+ Styles</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> PNG & WEBP formats</li>
              </ul>
            </div>
            <Link href="/signup" className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-center font-bold border border-white/10 transition">
              Subscribe
            </Link>
          </div>

          {/* PRO */}
          <div className="p-8 rounded-2xl glass-panel border border-purple-500/50 bg-gradient-to-b from-purple-950/10 to-transparent flex flex-col justify-between relative shadow-xl shadow-purple-500/5">
            <div className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 rounded-full bg-purple-500 text-xs font-bold text-white uppercase tracking-wider">Popular</div>
            <div>
              <span className="text-sm font-semibold text-purple-400 uppercase tracking-wider">Pro</span>
              <div className="text-3xl font-extrabold mt-2 mb-6">$29<span className="text-sm text-gray-500">/mo</span></div>
              <ul className="space-y-3 text-sm text-gray-300 mb-8">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-500" /> 500 AI Credits / mo</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-500" /> Upload custom Brand Logo</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-500" /> High-res PNG, SVG, PDF</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-500" /> Priority Generation Queue</li>
              </ul>
            </div>
            <Link href="/signup" className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-center font-bold transition shadow-lg shadow-purple-500/20 glow-btn">
              Upgrade Pro
            </Link>
          </div>

          {/* ENTERPRISE */}
          <div className="p-8 rounded-2xl glass-panel border border-white/5 flex flex-col justify-between">
            <div>
              <span className="text-sm font-semibold text-purple-400 uppercase tracking-wider">Enterprise</span>
              <div className="text-3xl font-extrabold mt-2 mb-6">$99<span className="text-sm text-gray-500">/mo</span></div>
              <ul className="space-y-3 text-sm text-gray-400 mb-8">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> 5000 AI Credits / mo</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Custom ComfyUI Workflows</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Dedicated API Endpoint</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> 24/7 SLA Support</li>
              </ul>
            </div>
            <Link href="/signup" className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-center font-bold border border-white/10 transition">
              Upgrade Enterprise
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 py-24 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="rounded-xl glass-panel border border-white/5 overflow-hidden">
              <button 
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full px-6 py-5 text-left font-bold text-base flex justify-between items-center"
              >
                {faq.q}
                <HelpCircle className={`w-5 h-5 text-gray-500 transition-transform ${activeFaq === idx ? 'rotate-180 text-purple-500' : ''}`} />
              </button>
              <AnimatePresence>
                {activeFaq === idx && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-6 pb-5 text-sm text-gray-400 border-t border-white/5 pt-4"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-[#010103]/80 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center">
              <QrCode className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight">3M QR Studio</span>
          </div>
          
          <p className="text-xs text-gray-500">
            &copy; 2026 3M QR Studio. Built with Next.js 15, NestJS, and Stable Diffusion. All Rights Reserved.
          </p>
          
          <div className="flex gap-4 text-xs text-gray-400">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
            <a href="#" className="hover:text-white transition">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

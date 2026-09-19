'use client';
import Link from 'next/link';
import { Zap, ShieldCheck, QrCode, Store, Award, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="space-y-20 py-12 md:py-20 px-4 sm:px-6 max-w-6xl mx-auto">
      
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-full text-amber-400 text-xs font-semibold">
          <Zap className="h-3.5 w-3.5" /> Next-Gen Electrical Loyalty Program
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
          Rewards Powered Directly by <span className="text-amber-400">Wire Scans</span>
        </h1>

        <p className="text-slate-400 text-sm md:text-base leading-relaxed">
          WireRewards connects manufacturers, authorized dealers, and professional electricians in a single transparent ecosystem with automated dual-credit point distribution.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/login/electrician"
            className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition"
          >
            <span>Electrician Portal</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login/dealer"
            className="w-full sm:w-auto bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold px-6 py-3 rounded-xl text-xs flex items-center justify-center transition"
          >
            Dealer Portal
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl space-y-3">
          <div className="bg-amber-400/10 text-amber-400 p-2.5 rounded-xl w-fit">
            <QrCode className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-slate-200 text-sm">Instant Scanning</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Electricians scan QR codes printed directly on wire products to claim point rewards instantly to their digital wallet.
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl space-y-3">
          <div className="bg-amber-400/10 text-amber-400 p-2.5 rounded-xl w-fit">
            <Store className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-slate-200 text-sm">Dual-Credit Commissions</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Dealers earn automatic 20% commission shares on every dispatched coupon redeemed through their local sales channel.
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl space-y-3">
          <div className="bg-amber-400/10 text-amber-400 p-2.5 rounded-xl w-fit">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-slate-200 text-sm">Atomic Ledger Safety</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Database transactions ensure both electrician and dealer updates succeed together atomically without balance drift.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-900/30 border border-slate-800 p-8 rounded-3xl space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-slate-200">How The Network Operates</h2>
          <p className="text-xs text-slate-400">3 simple steps from factory dispatch to cash rewards</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="space-y-2 bg-slate-900 p-4 rounded-xl border border-slate-800/80">
            <span className="font-mono text-amber-400 font-bold">01. Staff Dispatch</span>
            <p className="text-slate-400">Warehouse teams assign generated QR coupons to target dealers during dispatch.</p>
          </div>
          <div className="space-y-2 bg-slate-900 p-4 rounded-xl border border-slate-800/80">
            <span className="font-mono text-amber-400 font-bold">02. Electrician Redemption</span>
            <p className="text-slate-400">Electricians scan coupons using camera or manual code entry on installation sites.</p>
          </div>
          <div className="space-y-2 bg-slate-900 p-4 rounded-xl border border-slate-800/80">
            <span className="font-mono text-amber-400 font-bold">03. Dual-Credit Allocation</span>
            <p className="text-slate-400">Electricians get full points and dealers collect 20% parallel commission instantly.</p>
          </div>
        </div>
      </section>

    </div>
  );
}
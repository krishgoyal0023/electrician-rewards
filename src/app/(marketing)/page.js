'use client';
import Link from 'next/link';
import { Zap, ShieldCheck, QrCode, Store, ArrowRight, Award, Layers, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  const productsPreview = [
    {
      title: 'FR-LSH House Wires',
      description: 'Flame Retardant Low Smoke & Halogen wires for residential safety.',
      points: 'Up to 50 PTS per coil',
      tag: 'Best Seller'
    },
    {
      title: 'Heavy Duty Armored Cables',
      description: 'Industrial-grade underground copper and aluminum cables.',
      points: 'Up to 200 PTS per drum',
      tag: 'Industrial'
    },
    {
      title: 'Submersible Flat Cables',
      description: 'Water-resistant multi-core cables built for agricultural pumps.',
      points: 'Up to 120 PTS per coil',
      tag: 'Agriculture'
    }
  ];

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
            <span>Become a Partner</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/products"
            className="w-full sm:w-auto bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold px-6 py-3 rounded-xl text-xs flex items-center justify-center transition"
          >
            Explore Product Catalog
          </Link>
        </div>
      </section>

      {/* Why Choose Us / Quality Highlights */}
      <section className="bg-slate-900/40 border border-slate-800/80 p-8 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-start gap-4">
          <div className="bg-amber-400/10 text-amber-400 p-3 rounded-2xl shrink-0">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-200 text-sm">ISI & ISO Certified</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Manufactured to meet strict national quality and safety standards.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="bg-amber-400/10 text-amber-400 p-3 rounded-2xl shrink-0">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-200 text-sm">Guaranteed Pure Copper</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              100% electrolytic grade copper for maximum conductivity and durability.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="bg-amber-400/10 text-amber-400 p-3 rounded-2xl shrink-0">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-200 text-sm">20+ Years Excellence</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Trusted by contractors, verified dealers, and skilled electricians region-wide.
            </p>
          </div>
        </div>
      </section>

      {/* Flagship Product Lines Preview */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-200">Flagship Product Lines</h2>
            <p className="text-xs text-slate-400">High-grade wiring with embedded reward coupons</p>
          </div>
          <Link
            href="/products"
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
          >
            Full Catalog <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {productsPreview.map((item, index) => (
            <div
              key={index}
              className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
            >
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full">
                  {item.tag}
                </span>
                <h3 className="font-bold text-slate-200 text-sm pt-1">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
              </div>

              <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono text-[11px]">{item.points}</span>
                <Link
                  href="/login/electrician"
                  className="text-amber-400 hover:underline font-medium text-[11px] flex items-center gap-1"
                >
                  Scan & Earn <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
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

    </div>
  );
}
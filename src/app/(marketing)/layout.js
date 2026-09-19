'use client';
import Link from 'next/link';
import { Zap, ArrowRight, ShieldCheck, Phone, Mail, MapPin } from 'lucide-react';

export default function MarketingLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950">
      
      {/* Shared Navbar */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-amber-400 p-1.5 rounded-xl group-hover:scale-105 transition">
              <Zap className="h-5 w-5 text-slate-950 fill-slate-950" />
            </div>
            <span className="font-black text-base tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              WireRewards
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-400">
            <Link href="/" className="hover:text-amber-400 transition">Home</Link>
            <Link href="/products" className="hover:text-amber-400 transition">Products</Link>
            <Link href="/about" className="hover:text-amber-400 transition">About Us</Link>
            <Link href="/contact" className="hover:text-amber-400 transition">Contact</Link>
          </nav>

          {/* Portal Gateway Login Button */}
          <div className="flex items-center gap-3">
            <Link
              href="/login/electrician"
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-400/10 transition"
            >
              <span>Portal Login</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Shared Footer */}
      <footer className="bg-slate-900/60 border-t border-slate-800/80 pt-12 pb-8 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Company Bio */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <span className="font-bold text-slate-200 text-sm">WireRewards</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Direct loyalty & reward distribution network empowering electricians and verified dealers.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <span className="text-slate-200 font-bold block mb-2 text-[11px] uppercase tracking-wider">Quick Navigation</span>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link href="/" className="hover:text-amber-400 transition">Home</Link></li>
              <li><Link href="/products" className="hover:text-amber-400 transition">Products</Link></li>
              <li><Link href="/about" className="hover:text-amber-400 transition">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-amber-400 transition">Contact</Link></li>
            </ul>
          </div>

          {/* Portals */}
          <div className="space-y-2">
            <span className="text-slate-200 font-bold block mb-2 text-[11px] uppercase tracking-wider">Access Portals</span>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link href="/login/electrician" className="hover:text-amber-400 transition">Electrician Wallet</Link></li>
              <li><Link href="/login/dealer" className="hover:text-amber-400 transition">Dealer Portal</Link></li>
              <li><Link href="/login/staff" className="hover:text-amber-400 transition">Staff Dispatch</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-2">
            <span className="text-slate-200 font-bold block mb-2 text-[11px] uppercase tracking-wider">Support</span>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>support@wirerewards.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>Punjab, India</span>
              </div>
            </div>
          </div>

        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500">
          <span>&copy; {new Date().getFullYear()} WireRewards Inc. All rights reserved.</span>
          <div className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Encrypted Dual-Credit Verification System</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
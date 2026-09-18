'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Zap,
  ShieldCheck,
  Award,
  ChevronRight,
  User,
  Store,
  Briefcase,
  Shield,
  Layers,
  Cpu,
  PhoneCall,
  Menu,
  X,
} from 'lucide-react';

export default function LandingPage() {
  const [showPortalModal, setShowPortalModal] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const router = useRouter();

  const handleRoleSelect = (role) => {
    setShowPortalModal(false);
    if (role === 'electrician') {
      router.push('/login/electrician');
    } else if (role === 'dealer') {
      router.push('/login/dealer');
    } else if (role === 'staff') {
      router.push('/login/staff');
    } else if (role === 'admin') {
      router.push('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Announcement Bar */}
      <div className="bg-amber-400 text-slate-950 text-xs font-bold py-2 px-4 text-center flex items-center justify-center gap-2">
        <Zap className="h-4 w-4 fill-slate-950" />
        <span>WireRewards B2B Loyalty Program is now live! Scan QR codes inside every wire roll to earn cash rewards.</span>
      </div>

      {/* Main Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
            <div className="bg-amber-400 p-2 rounded-xl">
              <Zap className="h-6 w-6 text-slate-950 font-bold" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white block">WIRE<span className="text-amber-400">REWARDS</span></span>
              <span className="text-[10px] text-slate-400 font-mono tracking-widest block -mt-1 uppercase">Industries Ltd.</span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#about" className="hover:text-amber-400 transition">About Us</a>
            <a href="#products" className="hover:text-amber-400 transition">Products</a>
            <a href="#loyalty" className="hover:text-amber-400 transition">Rewards Program</a>
            <a href="#contact" className="hover:text-amber-400 transition">Contact</a>
          </nav>

          {/* Action Button */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setShowPortalModal(true)}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-2 shadow-lg shadow-amber-400/10"
            >
              <User className="h-4 w-4" /> Login / Portal Access
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="md:hidden text-slate-400 hover:text-white p-2"
          >
            {mobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenu && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-3">
            <a href="#about" onClick={() => setMobileMenu(false)} className="block text-slate-300 py-1">About Us</a>
            <a href="#products" onClick={() => setMobileMenu(false)} className="block text-slate-300 py-1">Products</a>
            <a href="#loyalty" onClick={() => setMobileMenu(false)} className="block text-slate-300 py-1">Rewards Program</a>
            <a href="#contact" onClick={() => setMobileMenu(false)} className="block text-slate-300 py-1">Contact</a>
            <button
              onClick={() => {
                setMobileMenu(false);
                setShowPortalModal(true);
              }}
              className="w-full bg-amber-400 text-slate-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 mt-2"
            >
              <User className="h-4 w-4" /> Login / Portal Access
            </button>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <span className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-full">
                <ShieldCheck className="h-4 w-4" /> ISO 9001:2026 Certified Electrical Wires
              </span>
              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none">
                Powering Industries. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
                  Rewarding Professionals.
                </span>
              </h1>
              <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto lg:mx-0">
                Premium flame-retardant electrical wires & cables engineered for maximum safety. Integrated with instantaneous QR code cash rewards for electricians and dealers nationwide.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => setShowPortalModal(true)}
                  className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold px-8 py-4 rounded-xl transition flex items-center justify-center gap-2 text-base shadow-xl shadow-amber-400/20"
                >
                  Enter Portal <ChevronRight className="h-5 w-5" />
                </button>
                <a
                  href="#products"
                  className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-8 py-4 rounded-xl border border-slate-700 transition text-center text-base"
                >
                  Explore Products
                </a>
              </div>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm space-y-3">
                <Award className="h-8 w-8 text-amber-400" />
                <h3 className="font-bold text-lg text-white">99.99% Pure Copper</h3>
                <p className="text-xs text-slate-400">Ultra-low electrical loss with maximum current carrying capacity and thermal conductivity.</p>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm space-y-3">
                <Zap className="h-8 w-8 text-amber-400" />
                <h3 className="font-bold text-lg text-white">Instant QR Cashbacks</h3>
                <p className="text-xs text-slate-400">Scan QR codes inside packaging rolls to earn instant redeemable cash points.</p>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm space-y-3">
                <Layers className="h-8 w-8 text-amber-400" />
                <h3 className="font-bold text-lg text-white">HRFR PVC Insulation</h3>
                <p className="text-xs text-slate-400">Heat-resistant, flame-retardant insulation engineered for extreme safety standards.</p>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm space-y-3">
                <Store className="h-8 w-8 text-amber-400" />
                <h3 className="font-bold text-lg text-white">Dealer Network</h3>
                <p className="text-xs text-slate-400">Pan-India distribution network supporting distributors and retail partner growth.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Showcase Section */}
      <section id="products" className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-xs font-extrabold text-amber-400 uppercase tracking-widest">Our Engineering Range</h2>
            <p className="text-3xl font-extrabold text-white sm:text-4xl">High-Performance Cables & Wires</p>
            <p className="text-slate-400 text-sm">Engineered for residential, commercial, and heavy industrial applications.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Product 1 */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden hover:border-amber-400/40 transition group">
              <div className="h-48 bg-slate-800/60 flex items-center justify-center p-6 border-b border-slate-800">
                <Zap className="h-16 w-16 text-amber-400 group-hover:scale-110 transition" />
              </div>
              <div className="p-6 space-y-3">
                <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full uppercase">House Wires</span>
                <h3 className="text-xl font-bold text-white">Zero Halogen FR-LSH Wires</h3>
                <p className="text-xs text-slate-400">Flame-retardant low smoke halogen wires designed for domestic indoor safety.</p>
                <div className="pt-2 border-t border-slate-800/80 flex justify-between text-xs text-slate-500 font-mono">
                  <span>90m & 180m Rolls</span>
                  <span className="text-emerald-400 font-bold">+100 QR Points</span>
                </div>
              </div>
            </div>

            {/* Product 2 */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden hover:border-amber-400/40 transition group">
              <div className="h-48 bg-slate-800/60 flex items-center justify-center p-6 border-b border-slate-800">
                <Cpu className="h-16 w-16 text-amber-400 group-hover:scale-110 transition" />
              </div>
              <div className="p-6 space-y-3">
                <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full uppercase">Industrial</span>
                <h3 className="text-xl font-bold text-white">Multicore Flex Cables</h3>
                <p className="text-xs text-slate-400">High-grade flexible copper cables ideal for heavy machinery and factory panels.</p>
                <div className="pt-2 border-t border-slate-800/80 flex justify-between text-xs text-slate-500 font-mono">
                  <span>Industrial Drums</span>
                  <span className="text-emerald-400 font-bold">+250 QR Points</span>
                </div>
              </div>
            </div>

            {/* Product 3 */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden hover:border-amber-400/40 transition group">
              <div className="h-48 bg-slate-800/60 flex items-center justify-center p-6 border-b border-slate-800">
                <ShieldCheck className="h-16 w-16 text-amber-400 group-hover:scale-110 transition" />
              </div>
              <div className="p-6 space-y-3">
                <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full uppercase">Solar</span>
                <h3 className="text-xl font-bold text-white">DC Solar Armored Cables</h3>
                <p className="text-xs text-slate-400">UV-resistant and weather-proof cables for rooftop solar installations.</p>
                <div className="pt-2 border-t border-slate-800/80 flex justify-between text-xs text-slate-500 font-mono">
                  <span>Custom Cut Lengths</span>
                  <span className="text-emerald-400 font-bold">+500 QR Points</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Portal Selection Modal */}
      {showPortalModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowPortalModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-1">
              <h3 className="text-2xl font-bold text-white">Select Portal Access</h3>
              <p className="text-xs text-slate-400">Choose your role to log in or register for your dashboard.</p>
            </div>

            <div className="grid gap-3">
              {/* Electrician Option */}
              <button
                onClick={() => handleRoleSelect('electrician')}
                className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-400 p-4 rounded-xl flex items-center justify-between text-left transition group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-amber-400/10 border border-amber-400/20 p-3 rounded-lg text-amber-400 group-hover:bg-amber-400 group-hover:text-slate-950 transition">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Electrician Portal</h4>
                    <p className="text-xs text-slate-400">Scan QR codes, check wallet balance & claim cash payouts</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-amber-400 transition" />
              </button>

              {/* Dealer Option */}
              <button
                onClick={() => handleRoleSelect('dealer')}
                className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-400 p-4 rounded-xl flex items-center justify-between text-left transition group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-amber-400/10 border border-amber-400/20 p-3 rounded-lg text-amber-400 group-hover:bg-amber-400 group-hover:text-slate-950 transition">
                    <Store className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Dealer & Distributor Portal</h4>
                    <p className="text-xs text-slate-400">Manage wire inventory orders, stock & sales points</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-amber-400 transition" />
              </button>

              {/* Staff Option */}
              <button
                onClick={() => handleRoleSelect('staff')}
                className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-400 p-4 rounded-xl flex items-center justify-between text-left transition group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-amber-400/10 border border-amber-400/20 p-3 rounded-lg text-amber-400 group-hover:bg-amber-400 group-hover:text-slate-950 transition">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Sales Representative / Staff</h4>
                    <p className="text-xs text-slate-400">Field electrician verification and territory monitoring</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-amber-400 transition" />
              </button>

              {/* Admin Option */}
              <button
                onClick={() => handleRoleSelect('admin')}
                className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-400 p-4 rounded-xl flex items-center justify-between text-left transition group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-amber-400/10 border border-amber-400/20 p-3 rounded-lg text-amber-400 group-hover:bg-amber-400 group-hover:text-slate-950 transition">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Admin Control Panel</h4>
                    <p className="text-xs text-slate-400">Batch QR generation, payout approvals & system metrics</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-amber-400 transition" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-8 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div>
            <p className="font-bold text-slate-300">WireRewards Industries Ltd.</p>
            <p>© 2026 WireRewards Inc. All rights reserved.</p>
          </div>
          <div className="flex items-center gap-6">
            <a href="#about" className="hover:text-amber-400 transition">Privacy Policy</a>
            <a href="#products" className="hover:text-amber-400 transition">Terms of Service</a>
            <a href="#contact" className="hover:text-amber-400 transition">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
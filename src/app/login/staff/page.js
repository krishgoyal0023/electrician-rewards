'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, LogOut, QrCode, Search, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function StaffPortalPage() {
  const [staffCode, setStaffCode] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Simple staff verification (Passcode: 1234 or custom)
  const handleLogin = (e) => {
    e.preventDefault();
    if (staffCode === '1234' || staffCode === 'STAFF2026') {
      setAuthenticated(true);
    } else {
      alert('Invalid Staff Passcode. Use 1234 for testing.');
    }
  };

  const handleVerifyQR = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('qr_coupons')
      .select('*, dealers(name, phone)')
      .eq('secret_code', searchQuery.trim())
      .single();

    if (error || !data) {
      alert('QR Coupon Code not found in database.');
      setSearchResult(null);
    } else {
      setSearchResult(data);
    }
    setLoading(false);
  };

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="bg-blue-500/10 text-blue-400 p-3 rounded-xl inline-block border border-blue-500/20">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold">Field Staff & Executive Portal</h1>
            <p className="text-xs text-slate-400">Enter your assigned staff authentication code to verify field coupons & stock.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Staff Passcode</label>
              <input
                type="password"
                placeholder="Enter Staff Passcode (1234)"
                value={staffCode}
                onChange={(e) => setStaffCode(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-400 transition font-mono"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm"
            >
              Authenticate Staff Access
            </button>
          </form>

          <button
            onClick={() => router.push('/')}
            className="w-full text-xs text-slate-500 hover:text-slate-300 transition text-center block"
          >
            ← Back to Homepage
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-lg text-slate-950 font-bold">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-bold text-base">Field Verification Portal</h1>
              <p className="text-xs text-slate-400">WireRewards Executive Verification</p>
            </div>
          </div>
          <button
            onClick={() => setAuthenticated(false)}
            className="text-slate-400 hover:text-white text-xs flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-lg transition"
          >
            <LogOut className="h-3.5 w-3.5" /> Exit
          </button>
        </div>

        {/* QR Audit & Inspection Tool */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <QrCode className="h-4 w-4 text-blue-400" /> Verify Coupon Code Authenticity
          </h2>

          <form onSubmit={handleVerifyQR} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter coupon code (e.g. WIRE-100-ABC)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-400 font-mono"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition flex items-center gap-1"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Verify
            </button>
          </form>

          {searchResult && (
            <div className="mt-4 p-4 bg-slate-800/60 border border-slate-700 rounded-xl space-y-3">
              <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                <span className="text-xs text-slate-400">Status</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                  searchResult.is_redeemed ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {searchResult.is_redeemed ? 'Redeemed' : 'Valid / In Stock'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Points Value</span>
                  <span className="font-bold font-mono text-amber-400">+{searchResult.points} PTS</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Assigned Dealer</span>
                  <span className="font-medium text-slate-200">{searchResult.dealers?.name || 'Unassigned'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
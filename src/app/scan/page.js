'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Scanner from '../Scanner';
import { Zap, CheckCircle2, AlertCircle, Loader2, ArrowLeft, Keyboard } from 'lucide-react';

export default function ElectricianScanPage() {
  const [electrician, setElectrician] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [scanMessage, setScanMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('electrician');
    if (saved) {
      setElectrician(JSON.parse(saved));
    } else {
      router.push('/login/electrician');
    }
  }, [router]);

  const handleRedeemCode = async (scannedCode) => {
    const cleanCode = scannedCode.trim();
    if (!electrician || loading || !cleanCode) return;

    setLoading(true);
    setScanMessage(null);

    // Call the Supabase Postgres RPC Transaction Function
    const { data, error } = await supabase.rpc('redeem_coupon_dual_credit', {
      p_secret_code: cleanCode,
      p_electrician_id: electrician.id
    });

    if (error) {
      setScanMessage({ type: 'error', text: 'Redemption failed: ' + error.message });
      setLoading(false);
      return;
    }

    if (!data.success) {
      setScanMessage({ type: 'error', text: data.message });
      setLoading(false);
      return;
    }

    // Refresh electrician wallet locally
    const updatedPoints = (electrician.total_points || 0) + data.points;
    const updatedElectrician = { ...electrician, total_points: updatedPoints };
    localStorage.setItem('electrician', JSON.stringify(updatedElectrician));
    setElectrician(updatedElectrician);

    setScanMessage({
      type: 'success',
      text: `Successfully redeemed! +${data.points} points credited to your wallet.`
    });
    setManualCode('');
    setLoading(false);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    handleRedeemCode(manualCode);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-lg transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
          </button>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Your Wallet</span>
            <span className="text-sm font-bold text-amber-400 font-mono">
              {electrician?.total_points || 0} PTS
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <h1 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400" /> Redeem Wire Coupon
          </h1>

          <div className="rounded-xl overflow-hidden border border-slate-700">
            <Scanner onScanSuccess={handleRedeemCode} />
          </div>

          <form onSubmit={handleManualSubmit} className="pt-2 border-t border-slate-800 space-y-2">
            <label className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
              <Keyboard className="h-3.5 w-3.5 text-amber-400" /> Manual Code Input
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter coupon code (e.g. TEST-50-XXXXX)"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={loading || !manualCode}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Claim'}
              </button>
            </div>
          </form>

          {scanMessage && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                scanMessage.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              {scanMessage.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <span>{scanMessage.text}</span>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Scanner from '../Scanner';
import { ArrowLeft, CheckCircle, AlertTriangle, Clock, Loader2, Send } from 'lucide-react';

export default function ScanPage() {
  const [electrician, setElectrician] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('electrician');
    if (!stored) {
      router.push('/');
      return;
    }
    setElectrician(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const processCouponCode = async (codeToVerify) => {
    if (processing || cooldown > 0 || !codeToVerify) return;

    const cleanCode = codeToVerify.trim().toUpperCase();
    setProcessing(true);
    setScanResult(null);

    try {
      // 1. Check DB
      const { data: coupon, error: fetchError } = await supabase
        .from('qr_coupons')
        .select('*')
        .eq('secret_code', cleanCode)
        .maybeSingle();

      if (fetchError || !coupon) {
        setScanResult({
          success: false,
          message: 'Invalid code. Check physical coupon spelling.',
        });
        setCooldown(5);
        setProcessing(false);
        return;
      }

      // 2. Already redeemed check
      if (coupon.is_redeemed) {
        setScanResult({
          success: false,
          message: 'This coupon code was already redeemed.',
        });
        setCooldown(5);
        setProcessing(false);
        return;
      }

      // 3. Mark redeemed
      const { error: redeemError } = await supabase
        .from('qr_coupons')
        .update({
          is_redeemed: true,
          redeemed_by: electrician.id,
          redeemed_at: new Date().toISOString(),
        })
        .eq('id', coupon.id);

      if (redeemError) {
        setScanResult({
          success: false,
          message: 'Update error: ' + redeemError.message,
        });
        setCooldown(5);
        setProcessing(false);
        return;
      }

      // 4. Update wallet points
      const newPoints = (electrician.points || 0) + coupon.points;
      await supabase
        .from('electricians')
        .update({ points: newPoints })
        .eq('id', electrician.id);

      const updatedUser = { ...electrician, points: newPoints };
      localStorage.setItem('electrician', JSON.stringify(updatedUser));
      setElectrician(updatedUser);
      setManualCode('');

      setScanResult({
        success: true,
        message: `Success! +${coupon.points} Points added.`,
      });

      setCooldown(5);
    } catch (err) {
      setScanResult({
        success: false,
        message: 'Unexpected processing error.',
      });
      setCooldown(5);
    } finally {
      setProcessing(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    processCouponCode(manualCode);
  };

  if (!electrician) return null;

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4">
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1 text-slate-400 hover:text-white text-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
            {electrician.points} Points
          </span>
        </div>

        {/* Scanner View */}
        <div className="relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-2">
          <Scanner onScan={processCouponCode} />

          {cooldown > 0 && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10">
              <Clock className="h-10 w-10 text-amber-400 mb-2 animate-pulse" />
              <p className="font-bold text-lg">Scanner Cooldown</p>
              <div className="text-4xl font-extrabold text-amber-400 mt-2 font-mono">{cooldown}s</div>
            </div>
          )}

          {processing && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10">
              <Loader2 className="h-10 w-10 text-amber-400 animate-spin mb-2" />
              <p className="font-bold">Verifying Coupon...</p>
            </div>
          )}
        </div>

        {/* Manual Code Input Form */}
        <form onSubmit={handleManualSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <label className="block text-xs text-slate-400">Manual Code Entry</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              placeholder="e.g. WIRE-100-ABCDE"
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={processing || cooldown > 0 || !manualCode}
              className="bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg hover:bg-amber-300 transition flex items-center gap-1 disabled:opacity-50 text-sm"
            >
              <Send className="h-4 w-4" /> Submit
            </button>
          </div>
        </form>

        {/* Result Message */}
        {scanResult && (
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              scanResult.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            {scanResult.success ? (
              <CheckCircle className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold text-sm">{scanResult.success ? 'Points Added' : 'Scan Error'}</p>
              <p className="text-xs mt-0.5 opacity-90">{scanResult.message}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
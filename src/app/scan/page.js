'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Scanner from '@/Scanner';
import { ArrowLeft, CheckCircle, AlertTriangle, ShieldAlert, Clock, Loader2 } from 'lucide-react';

export default function ScanPage() {
  const [electrician, setElectrician] = useState(null);
  const [scanResult, setScanResult] = useState(null); // { success: bool, message: str }
  const [processing, setProcessing] = useState(false);
  const [cooldown, setCooldown] = useState(0); // Cooldown countdown in seconds
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('electrician');
    if (!stored) {
      router.push('/');
      return;
    }
    setElectrician(JSON.parse(stored));
  }, []);

  // Handle Cooldown Timer Ticks
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleScan = async (scannedCode) => {
    // Ignore scans while processing or during rate-limit cooldown
    if (processing || cooldown > 0 || !scannedCode) return;

    setProcessing(true);
    setScanResult(null);

    try {
      // 1. Check if QR exists in Database
      const { data: coupon, error: fetchError } = await supabase
        .from('qr_coupons')
        .select('*')
        .eq('secret_code', scannedCode)
        .maybeSingle();

      if (fetchError || !coupon) {
        setScanResult({
          success: false,
          message: 'Invalid QR Code. Please check the physical coupon code.',
        });
        startCooldown(5); // 5 second cooldown on bad scans
        setProcessing(false);
        return;
      }

      // 2. Check if already redeemed
      if (coupon.is_redeemed) {
        setScanResult({
          success: false,
          message: `This coupon was already claimed on ${new Date(coupon.redeemed_at || Date.now()).toLocaleDateString()}`,
        });
        startCooldown(5);
        setProcessing(false);
        return;
      }

      // 3. Mark coupon as redeemed
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
          message: 'Database update failed: ' + redeemError.message,
        });
        startCooldown(5);
        setProcessing(false);
        return;
      }

      // 4. Update user's points balance
      const newPoints = (electrician.points || 0) + coupon.points;
      const { error: userError } = await supabase
        .from('electricians')
        .update({ points: newPoints })
        .eq('id', electrician.id);

      if (userError) {
        setScanResult({
          success: false,
          message: 'Failed to update points balance.',
        });
        startCooldown(5);
        setProcessing(false);
        return;
      }

      // 5. Update Local Storage & UI
      const updatedUser = { ...electrician, points: newPoints };
      localStorage.setItem('electrician', JSON.stringify(updatedUser));
      setElectrician(updatedUser);

      setScanResult({
        success: true,
        message: `Success! +${coupon.points} Points added to your wallet.`,
      });

      startCooldown(5); // 5 second rate-limit cooldown before next scan
    } catch (err) {
      setScanResult({
        success: false,
        message: 'Unexpected error occurred during scan.',
      });
      startCooldown(5);
    } finally {
      setProcessing(false);
    }
  };

  const startCooldown = (seconds) => {
    setCooldown(seconds);
  };

  if (!electrician) return null;

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
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

        {/* Camera Scanner View */}
        <div className="relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-2">
          <Scanner onScan={handleScan} />

          {/* Cooldown Overlay */}
          {cooldown > 0 && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10">
              <Clock className="h-10 w-10 text-amber-400 mb-2 animate-pulse" />
              <p className="font-bold text-lg">Scanner Cooldown</p>
              <p className="text-xs text-slate-400 mt-1">Ready for next scan in:</p>
              <div className="text-4xl font-extrabold text-amber-400 mt-2 font-mono">
                {cooldown}s
              </div>
            </div>
          )}

          {/* Processing Loading Overlay */}
          {processing && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10">
              <Loader2 className="h-10 w-10 text-amber-400 animate-spin mb-2" />
              <p className="font-bold">Verifying Coupon...</p>
            </div>
          )}
        </div>

        {/* Scan Result Feedback Card */}
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
              <p className="font-bold text-sm">
                {scanResult.success ? 'Points Added' : 'Scan Blocked'}
              </p>
              <p className="text-xs mt-0.5 opacity-90">{scanResult.message}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
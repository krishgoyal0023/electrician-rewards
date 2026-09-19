'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Scanner from '../Scanner';
import { Zap, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

export default function ElectricianScanPage() {
  const [electrician, setElectrician] = useState(null);
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
    if (!electrician || loading) return;
    setLoading(true);
    setScanMessage(null);

    const cleanCode = scannedCode.trim();

    // 1. Fetch coupon details
    const { data: coupon, error: fetchError } = await supabase
      .from('qr_coupons')
      .select('*')
      .eq('secret_code', cleanCode)
      .single();

    if (fetchError || !coupon) {
      setScanMessage({ type: 'error', text: `Invalid QR Code: ${cleanCode}` });
      setLoading(false);
      return;
    }

    if (coupon.is_redeemed) {
      setScanMessage({ type: 'error', text: 'This QR code has already been redeemed!' });
      setLoading(false);
      return;
    }

    // 2. Mark coupon as redeemed
    const { error: redeemError } = await supabase
      .from('qr_coupons')
      .update({
        is_redeemed: true,
        status: 'redeemed',
        electrician_id: electrician.id,
        redeemed_at: new Date().toISOString()
      })
      .eq('id', coupon.id);

    if (redeemError) {
      setScanMessage({ type: 'error', text: 'Redemption failed: ' + redeemError.message });
      setLoading(false);
      return;
    }

    // 3. Credit Electrician Points
    const updatedElectricianPoints = (electrician.total_points || 0) + coupon.points;
    await supabase
      .from('electricians')
      .update({ total_points: updatedElectricianPoints })
      .eq('id', electrician.id);

    // Update local session storage
    const updatedElectrician = { ...electrician, total_points: updatedElectricianPoints };
    localStorage.setItem('electrician', JSON.stringify(updatedElectrician));
    setElectrician(updatedElectrician);

    // 4. Dual Credit: Credit Assigned Dealer (e.g. 10% or equal points commission)
    if (coupon.dealer_id) {
      const dealerCommission = Math.round(coupon.points * 0.2); // e.g. 20% dealer commission (or same amount)
      
      const { data: dealerData } = await supabase
        .from('dealers')
        .select('total_points')
        .eq('id', coupon.dealer_id)
        .single();

      if (dealerData) {
        await supabase
          .from('dealers')
          .update({ total_points: (dealerData.total_points || 0) + dealerCommission })
          .eq('id', coupon.dealer_id);
      }
    }

    setScanMessage({
      type: 'success',
      text: `Successfully redeemed! +${coupon.points} points credited to your wallet.`
    });
    setLoading(false);
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
            <Zap className="h-4 w-4 text-amber-400" /> Scan Wire Coupon
          </h1>

          <div className="rounded-xl overflow-hidden border border-slate-700">
            <Scanner onScanSuccess={handleRedeemCode} />
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-2 text-xs text-amber-400 py-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Processing redemption...
            </div>
          )}

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
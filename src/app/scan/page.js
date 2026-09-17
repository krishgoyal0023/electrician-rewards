'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { supabase } from '@/lib/supabase';
import { ArrowLeft } from 'lucide-react';

export default function ScanPage() {
  const [electrician, setElectrician] = useState(null);
  const [message, setMessage] = useState('');
  const [manualCode, setManualCode] = useState('');
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('electrician');
    if (!stored) {
      router.push('/');
      return;
    }
    setElectrician(JSON.parse(stored));

    const scanner = new Html5QrcodeScanner('reader', {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    });

    scanner.render(
      (decodedText) => handleRedeem(decodedText, JSON.parse(stored)),
      (error) => console.warn(error)
    );

    return () => scanner.clear().catch((e) => console.error(e));
  }, []);

  const handleRedeem = async (code, user) => {
    setMessage('Verifying code...');

    const { data: coupon, error } = await supabase
      .from('qr_coupons')
      .select('*')
      .eq('secret_code', code)
      .single();

    if (error || !coupon) {
      setMessage('Invalid QR code.');
      return;
    }

    if (coupon.is_redeemed) {
      setMessage('This QR code has already been redeemed.');
      return;
    }

    await supabase
      .from('qr_coupons')
      .update({ is_redeemed: true, redeemed_by: user.id })
      .eq('id', coupon.id);

    const { data: updatedUser } = await supabase
      .from('electricians')
      .select('points')
      .eq('id', user.id)
      .single();

    const newPoints = (updatedUser?.points || 0) + coupon.points;

    await supabase
      .from('electricians')
      .update({ points: newPoints })
      .eq('id', user.id);

    setMessage(`Success! Added ${coupon.points} points.`);
    setTimeout(() => router.push('/dashboard'), 2000);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4">
      <div className="max-w-md mx-auto space-y-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </button>

        <h1 className="text-xl font-bold">Scan Wire QR Code</h1>

        <div id="reader" className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800"></div>

        {message && (
          <p className="text-center font-bold text-amber-400 bg-slate-900 p-3 rounded-lg border border-slate-800">
            {message}
          </p>
        )}

        <div className="pt-4 border-t border-slate-800 space-y-2">
          <p className="text-xs text-slate-400">Manual Code Entry</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="e.g. WIRE-101-ALPHA"
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none"
            />
            <button
              onClick={() => handleRedeem(manualCode, electrician)}
              className="bg-amber-400 text-slate-950 font-bold px-4 rounded-lg text-sm"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
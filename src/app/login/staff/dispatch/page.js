'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Scanner from '@/Scanner';
import { Store, ArrowLeft, CheckCircle2, AlertCircle, PackageCheck, Loader2 } from 'lucide-react';

export default function StaffDispatchScanPage() {
  const [dealers, setDealers] = useState([]);
  const [selectedDealer, setSelectedDealer] = useState('');
  const [lastScanned, setLastScanned] = useState(null);
  const [scanMessage, setScanMessage] = useState(null);
  const [dispatchCount, setDispatchCount] = useState(0);
  const [loadingDealers, setLoadingDealers] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchDealers();
  }, []);

  const fetchDealers = async () => {
    const { data, error } = await supabase.from('dealers').select('*').order('name');
    if (!error && data) {
      setDealers(data);
    }
    setLoadingDealers(false);
  };

  const handleDispatchScan = async (scannedCode) => {
    if (!selectedDealer) {
      setScanMessage({ type: 'error', text: 'Please select a destination dealer first!' });
      return;
    }

    if (lastScanned === scannedCode) return; // Prevent duplicate immediate trigger
    setLastScanned(scannedCode);

    // 1. Verify coupon status
    const { data: coupon, error: fetchError } = await supabase
      .from('qr_coupons')
      .select('*')
      .eq('secret_code', scannedCode.trim())
      .single();

    if (fetchError || !coupon) {
      setScanMessage({ type: 'error', text: `Invalid QR Code: ${scannedCode}` });
      return;
    }

    if (coupon.is_redeemed || coupon.status === 'redeemed') {
      setScanMessage({ type: 'error', text: `Cannot dispatch: Code ${scannedCode} is already redeemed!` });
      return;
    }

    // 2. Update dealer_id and set status='dispatched'
    const { error: updateError } = await supabase
      .from('qr_coupons')
      .update({
        dealer_id: selectedDealer,
        status: 'dispatched'
      })
      .eq('id', coupon.id);

    if (updateError) {
      setScanMessage({ type: 'error', text: `Dispatch failed: ${updateError.message}` });
    } else {
      setDispatchCount((prev) => prev + 1);
      const targetDealer = dealers.find((d) => d.id === selectedDealer);
      setScanMessage({
        type: 'success',
        text: `Dispatched ${scannedCode} (+${coupon.points} pts) to ${targetDealer?.name || 'Dealer'}`
      });
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <button
            onClick={() => router.push('/login/staff')}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-lg transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Staff Portal
          </button>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Dispatched Session</span>
            <span className="text-sm font-mono font-bold text-amber-400">{dispatchCount} Items</span>
          </div>
        </div>

        {/* Dealer Selection Dropdown */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
            <Store className="h-4 w-4 text-amber-400" /> 1. Select Destination Dealer / Distributor
          </label>
          
          {loadingDealers ? (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
              <Loader2 className="h-4 w-4 animate-spin text-amber-400" /> Loading registered dealers...
            </div>
          ) : (
            <select
              value={selectedDealer}
              onChange={(e) => {
                setSelectedDealer(e.target.value);
                setScanMessage(null);
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-400 transition"
            >
              <option value="">-- Choose Target Dealer Before Scanning --</option>
              {dealers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.phone})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Dispatch Camera Scanner */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <h2 className="text-xs font-bold text-slate-300 flex items-center gap-2">
            <PackageCheck className="h-4 w-4 text-emerald-400" /> 2. Scan QR Code Box
          </h2>

          {!selectedDealer ? (
            <div className="p-8 text-center bg-slate-800/40 rounded-xl border border-dashed border-slate-700 text-xs text-slate-400">
              Please select a dealer from the dropdown above to activate the dispatch camera.
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden border border-slate-700">
              <Scanner onScanSuccess={handleDispatchScan} />
            </div>
          )}

          {/* Feedback Banner */}
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
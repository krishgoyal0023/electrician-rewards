'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Store, LogOut, History, ShieldCheck } from 'lucide-react';

export default function DealerDashboard() {
  const [dealer, setDealer] = useState(null);
  const [redeemedCoupons, setRedeemedCoupons] = useState([]);
  const [dispatchedCount, setDispatchedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchDealerData();
  }, []);

  const fetchDealerData = async () => {
    const saved = localStorage.getItem('dealer');
    if (!saved) {
      router.push('/login/dealer');
      return;
    }

    const localData = JSON.parse(saved);

    // 1. Fetch fresh dealer record from Supabase
    const { data: dbDealer } = await supabase
      .from('dealers')
      .select('*')
      .eq('id', localData.id)
      .single();

    if (dbDealer) {
      setDealer(dbDealer);
      localStorage.setItem('dealer', JSON.stringify(dbDealer));
    } else {
      setDealer(localData);
    }

    // 2. Fetch dispatched coupons count for this dealer
    const { count: activeCount } = await supabase
      .from('qr_coupons')
      .select('*', { count: 'exact', head: true })
      .eq('dealer_id', localData.id)
      .eq('status', 'dispatched');

    setDispatchedCount(activeCount || 0);

    // 3. Fetch redeemed coupons for this dealer (earned commission history)
    const { data: coupons } = await supabase
      .from('qr_coupons')
      .select('secret_code, points, redeemed_at')
      .eq('dealer_id', localData.id)
      .eq('status', 'redeemed')
      .order('redeemed_at', { ascending: false })
      .limit(10);

    if (coupons) {
      setRedeemedCoupons(coupons);
    }

    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('dealer');
    router.push('/login/dealer/dashboard');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="text-xs text-slate-400">Loading dealer portal...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-amber-400" />
            <span className="font-bold text-sm tracking-wide">WireRewards Dealer</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl transition"
          >
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
        </div>

        {/* Balance & Inventory Card */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-3xl text-slate-950 shadow-xl relative overflow-hidden space-y-4">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase opacity-80 block">
              Dealer Portal
            </span>
            <h1 className="text-2xl font-black tracking-tight">{dealer?.name}</h1>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-950/10 pt-4">
            <div>
              <span className="text-[11px] font-medium opacity-80 block">Commission Points</span>
              <div className="text-3xl font-black font-mono">
                {dealer?.total_points || 0}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-medium opacity-80 block">Active Stock</span>
              <div className="text-3xl font-black font-mono">
                {dispatchedCount} <span className="text-xs font-normal">Units</span>
              </div>
            </div>
          </div>

          <div className="absolute top-6 right-6 bg-slate-950/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/10">
            <ShieldCheck className="h-3.5 w-3.5 text-slate-950" />
            <span className="text-[10px] font-bold text-slate-950">Verified Partner</span>
          </div>
        </div>

        {/* Sales / Redeemed Coupons History */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
          <h2 className="text-xs font-bold text-slate-300 flex items-center gap-2">
            <History className="h-4 w-4 text-amber-400" /> Earned Commission Log
          </h2>

          {redeemedCoupons.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500">
              No sales recorded yet. When electricians scan your dispatched stock, your earnings will appear here!
            </div>
          ) : (
            <div className="space-y-2">
              {redeemedCoupons.map((coupon, i) => {
                const commission = Math.round((coupon.points || 0) * 0.20);
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-800 rounded-xl"
                  >
                    <div>
                      <span className="text-xs font-mono font-bold text-slate-200 block">
                        {coupon.secret_code}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(coupon.redeemed_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-400 font-mono block">
                        +{commission} PTS
                      </span>
                      <span className="text-[10px] text-slate-500">
                        (20% of {coupon.points} pts)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
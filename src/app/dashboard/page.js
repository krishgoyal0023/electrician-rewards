'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Zap, Gift, LogOut, ShieldCheck, History } from 'lucide-react';

export default function ElectricianDashboard() {
  const [electrician, setElectrician] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchProfileAndScans();
  }, []);

  const fetchProfileAndScans = async () => {
    const saved = localStorage.getItem('electrician');
    if (!saved) {
      router.push('/login/electrician');
      return;
    }

    const localData = JSON.parse(saved);

    // 1. Fetch fresh electrician record directly from Supabase
    const { data: dbElectrician } = await supabase
      .from('electricians')
      .select('*')
      .eq('id', localData.id)
      .single();

    if (dbElectrician) {
      setElectrician(dbElectrician);
      localStorage.setItem('electrician', JSON.stringify(dbElectrician));
    } else {
      setElectrician(localData);
    }

    // 2. Fetch recent scan history
    const { data: scans } = await supabase
      .from('qr_coupons')
      .select('secret_code, points, redeemed_at')
      .eq('electrician_id', localData.id)
      .order('redeemed_at', { ascending: false })
      .limit(5);

    if (scans) {
      setRecentScans(scans);
    }

    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('electrician');
    router.push('/login/electrician');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="text-xs text-slate-400">Loading wallet data...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-400" />
            <span className="font-bold text-sm tracking-wide">WireRewards</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl transition"
          >
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-3xl text-slate-950 shadow-xl relative overflow-hidden">
          <span className="text-[10px] font-bold tracking-wider uppercase opacity-80 block">
            Welcome Back
          </span>
          <h1 className="text-2xl font-black tracking-tight mb-4">{electrician?.name}</h1>

          <div className="space-y-1">
            <span className="text-[11px] font-medium opacity-80 block">Available Points</span>
            <div className="text-4xl font-black font-mono">
              {electrician?.total_points || 0}
            </div>
          </div>

          <div className="absolute top-6 right-6 bg-slate-950/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/10">
            <ShieldCheck className="h-3.5 w-3.5 text-slate-950" />
            <span className="text-[10px] font-bold text-slate-950">Verified Electrician</span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push('/scan')}
            className="bg-slate-900 border border-slate-800 hover:border-amber-400/50 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition group"
          >
            <Zap className="h-6 w-6 text-amber-400 group-hover:scale-110 transition" />
            <span className="text-xs font-bold text-slate-200">Scan QR Code</span>
          </button>

          <button
            onClick={() => alert('Redemption requests feature coming up!')}
            className="bg-slate-900 border border-slate-800 hover:border-amber-400/50 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition group"
          >
            <Gift className="h-6 w-6 text-amber-400 group-hover:scale-110 transition" />
            <span className="text-xs font-bold text-slate-200">Claim Rewards</span>
          </button>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
          <h2 className="text-xs font-bold text-slate-300 flex items-center gap-2">
            <History className="h-4 w-4 text-amber-400" /> Recent Activity
          </h2>

          {recentScans.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500">
              No transactions recorded yet. Start scanning QR codes!
            </div>
          ) : (
            <div className="space-y-2">
              {recentScans.map((scan, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-800 rounded-xl"
                >
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-200 block">
                      {scan.secret_code}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(scan.redeemed_at).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    +{scan.points} PTS
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
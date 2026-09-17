'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Zap, QrCode, Gift, LogOut, History, ArrowDownLeft, ArrowUpRight, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const [electrician, setElectrician] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('electrician');
    if (!stored) {
      router.push('/');
      return;
    }
    const user = JSON.parse(stored);
    setElectrician(user);
    fetchTransactionHistory(user.id);
  }, []);

  const fetchTransactionHistory = async (userId) => {
    setLoadingHistory(true);

    // 1. Fetch scanned QR coupons (Earned Points)
    const { data: scannedCoupons } = await supabase
      .from('qr_coupons')
      .select('id, secret_code, points, redeemed_at')
      .eq('redeemed_by', userId)
      .eq('is_redeemed', true);

    // 2. Fetch redemption requests (Spent Points)
    const { data: redemptions } = await supabase
      .from('redemption_requests')
      .select('id, points_spent, created_at, status, rewards(title)')
      .eq('electrician_id', userId);

    // Combine and format logs
    const earnedLogs = (scannedCoupons || []).map((c) => ({
      id: `earn-${c.id}`,
      type: 'earn',
      title: `Scanned Code (${c.secret_code})`,
      points: `+${c.points}`,
      date: c.redeemed_at ? new Date(c.redeemed_at) : new Date(),
    }));

    const spentLogs = (redemptions || []).map((r) => ({
      id: `spent-${r.id}`,
      type: 'spent',
      title: `Redeemed ${r.rewards?.title || 'Reward'}`,
      points: `-${r.points_spent}`,
      status: r.status,
      date: new Date(r.created_at),
    }));

    // Sort combined list newest first
    const combined = [...earnedLogs, ...spentLogs].sort((a, b) => b.date - a.date);
    setTransactions(combined);
    setLoadingHistory(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('electrician');
    router.push('/');
  };

  if (!electrician) return null;

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-amber-400" />
            <span className="font-bold">WireRewards</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-white text-xs flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-lg transition"
          >
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-slate-950 shadow-xl">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-950/70">Welcome Back</p>
          <h1 className="text-2xl font-extrabold mt-1">{electrician.name}</h1>
          <div className="mt-4 pt-4 border-t border-amber-400/30 flex justify-between items-end">
            <div>
              <p className="text-xs text-amber-950/70">Available Points</p>
              <p className="text-4xl font-black mt-0.5">{electrician.points || 0}</p>
            </div>
            <span className="bg-slate-950 text-amber-400 font-bold text-xs px-3 py-1.5 rounded-full">
              Verified Electrician
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => router.push('/scan')}
            className="bg-slate-900 border border-slate-800 hover:border-amber-400/50 p-4 rounded-xl flex flex-col items-center gap-2 transition group"
          >
            <QrCode className="h-8 w-8 text-amber-400 group-hover:scale-110 transition" />
            <span className="text-sm font-bold">Scan QR Code</span>
          </button>
          <button
            onClick={() => router.push('/rewards')}
            className="bg-slate-900 border border-slate-800 hover:border-amber-400/50 p-4 rounded-xl flex flex-col items-center gap-2 transition group"
          >
            <Gift className="h-8 w-8 text-amber-400 group-hover:scale-110 transition" />
            <span className="text-sm font-bold">Claim Rewards</span>
          </button>
        </div>

        {/* Transaction History Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-400">
            <History className="h-4 w-4" />
            <h2 className="text-sm font-bold uppercase tracking-wider">Recent Activity</h2>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl divide-y divide-slate-800 overflow-hidden">
            {loadingHistory ? (
              <div className="p-6 text-center text-slate-500 flex justify-center items-center gap-2 text-xs">
                <Loader2 className="h-4 w-4 animate-spin text-amber-400" /> Loading transaction logs...
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                No transactions recorded yet. Start scanning QR codes!
              </div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="p-3.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        tx.type === 'earn'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {tx.type === 'earn' ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-200">{tx.title}</p>
                      <p className="text-slate-500 text-[10px] mt-0.5">
                        {tx.date.toLocaleDateString()} at {tx.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-mono font-bold text-sm ${
                        tx.type === 'earn' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tx.points}
                    </p>
                    {tx.status && (
                      <span className="text-[10px] text-slate-400 capitalize bg-slate-800 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                        {tx.status}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
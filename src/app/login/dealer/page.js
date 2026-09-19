'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Store, QrCode, LogOut, PackageCheck, Layers, Users, Loader2, ArrowUpRight } from 'lucide-react';

export default function DealerDashboardPage() {
  const [dealer, setDealer] = useState(null);
  const [phone, setPhone] = useState('');
  const [coupons, setCoupons] = useState([]);
  const [metrics, setMetrics] = useState({ total: 0, inStock: 0, redeemed: 0 });
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('dealer');
    if (stored) {
      const parsedDealer = JSON.parse(stored);
      setDealer(parsedDealer);
      fetchDealerData(parsedDealer.id);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    // Find or register dealer
    let { data: existingDealer, error } = await supabase
      .from('dealers')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error && error.code === 'PGRST116') {
      // Create new dealer profile if not found
      const { data: newDealer, error: createError } = await supabase
        .from('dealers')
        .insert([{ phone, name: `Dealer (${phone.slice(-4)})` }])
        .select()
        .single();

      if (createError) {
        alert('Error creating dealer profile: ' + createError.message);
        setLoading(false);
        return;
      }
      existingDealer = newDealer;
    }

    localStorage.setItem('dealer', JSON.stringify(existingDealer));
    setDealer(existingDealer);
    fetchDealerData(existingDealer.id);
    setLoading(false);
  };

  const fetchDealerData = async (dealerId) => {
    setFetchingData(true);

    const { data: dealerCoupons } = await supabase
      .from('qr_coupons')
      .select('id, secret_code, points, status, is_redeemed, redeemed_at, redeemed_by')
      .eq('dealer_id', dealerId);

    const list = dealerCoupons || [];
    setCoupons(list);

    const inStock = list.filter((c) => c.status === 'in_stock' || (!c.is_redeemed && c.status !== 'dispatched')).length;
    const redeemed = list.filter((c) => c.is_redeemed || c.status === 'redeemed').length;

    setMetrics({
      total: list.length,
      inStock,
      redeemed,
    });

    setFetchingData(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('dealer');
    setDealer(null);
  };

  // Login View
  if (!dealer) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="bg-amber-400/10 text-amber-400 p-3 rounded-xl inline-block border border-amber-400/20">
              <Store className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold">Dealer & Distributor Portal</h1>
            <p className="text-xs text-slate-400">Enter your registered mobile number to access inventory & sales metrics.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Mobile Number</label>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400 transition font-mono"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Access Dealer Dashboard'}
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

  // Dashboard View
  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="bg-amber-400 p-2 rounded-lg text-slate-950">
              <Store className="h-5 w-5 font-bold" />
            </div>
            <div>
              <h1 className="font-bold text-base">{dealer.name || 'Dealer'}</h1>
              <p className="text-xs text-slate-400 font-mono">{dealer.phone}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-white text-xs flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-lg transition"
          >
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Layers className="h-4 w-4 text-amber-400" /> Allocated QRs
            </div>
            <p className="text-2xl font-bold">{metrics.total}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <PackageCheck className="h-4 w-4 text-emerald-400" /> Active Stock
            </div>
            <p className="text-2xl font-bold text-emerald-400">{metrics.inStock}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Users className="h-4 w-4 text-amber-400" /> Scanned / Redeemed
            </div>
            <p className="text-2xl font-bold text-amber-400">{metrics.redeemed}</p>
          </div>
        </div>

        {/* Inventory Coupon List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 font-bold text-sm flex items-center justify-between">
            <span>Allocated Coupon Stock</span>
            <span className="text-xs text-slate-400 font-normal">{coupons.length} Items</span>
          </div>

          {fetchingData ? (
            <div className="p-8 text-center text-slate-500 text-xs flex justify-center items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-amber-400" /> Loading allocated stock...
            </div>
          ) : coupons.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs space-y-1">
              <p>No coupons currently allocated to your store.</p>
              <p className="text-slate-600 text-[11px]">Admin can assign batch QR codes to your store phone number.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/50 text-slate-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">Coupon Code</th>
                    <th className="p-3">Points</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Redeemed Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {coupons.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-3 font-mono font-bold text-white">{c.secret_code}</td>
                      <td className="p-3 font-mono font-bold text-amber-400">+{c.points}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                            c.is_redeemed || c.status === 'redeemed'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : c.status === 'dispatched'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {c.is_redeemed ? 'redeemed' : c.status || 'in_stock'}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono text-slate-500">
                        {c.redeemed_at ? new Date(c.redeemed_at).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
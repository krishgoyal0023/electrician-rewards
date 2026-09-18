'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, Download, CheckCircle2, Clock, Users, QrCode, RefreshCw, PlusCircle, Loader2 } from 'lucide-react';

export default function AdminPage() {
  const [requests, setRequests] = useState([]);
  const [metrics, setMetrics] = useState({ users: 0, coupons: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  // Batch QR Form state
  const [prefix, setPrefix] = useState('WIRE');
  const [points, setPoints] = useState(100);
  const [quantity, setQuantity] = useState(5);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);

    // Fetch Redemption Requests with Electrician & Reward details
    const { data: redemptions } = await supabase
      .from('redemption_requests')
      .select('id, points_spent, status, created_at, electricians(name, phone, phone_number), rewards(title)')
      .order('created_at', { ascending: false });

    setRequests(redemptions || []);

    // Fetch High-level Analytics
    const { count: userCount } = await supabase.from('electricians').select('*', { count: 'exact', head: true });
    const { count: couponCount } = await supabase.from('qr_coupons').select('*', { count: 'exact', head: true });
    const pendingCount = (redemptions || []).filter((r) => r.status === 'pending').length;

    setMetrics({
      users: userCount || 0,
      coupons: couponCount || 0,
      pending: pendingCount,
    });

    setLoading(false);
  };

  // Generate Batch QRs
  const handleGenerateBatch = async (e) => {
    e.preventDefault();
    if (quantity < 1 || quantity > 100) {
      alert('Please enter a quantity between 1 and 100');
      return;
    }

    setGenerating(true);

    const newCoupons = [];
    for (let i = 0; i < quantity; i++) {
      const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
      const code = `${prefix}-${points}-${randomStr}`;
      newCoupons.push({
        secret_code: code,
        points: parseInt(points),
        is_redeemed: false,
      });
    }

    const { error } = await supabase.from('qr_coupons').insert(newCoupons);

    if (error) {
      alert('Error generating QR batch: ' + error.message);
    } else {
      alert(`Successfully generated ${quantity} QR codes!`);
      fetchAdminData();
    }
    setGenerating(false);
  };

  // Approve Payout Request
  const handleApprove = async (id) => {
    const { error } = await supabase
      .from('redemption_requests')
      .update({ status: 'approved' })
      .eq('id', id);

    if (error) {
      alert('Failed to approve request: ' + error.message);
      return;
    }

    fetchAdminData();
  };

  // Export Payouts to CSV
  const exportToCSV = () => {
    if (requests.length === 0) {
      alert('No requests available to export.');
      return;
    }

    const headers = ['Request ID', 'Electrician Name', 'Phone', 'Reward Title', 'Points Spent', 'Status', 'Date'];
    
    const rows = requests.map((req) => [
      req.id,
      `"${req.electricians?.name || 'N/A'}"`,
      `"${req.electricians?.phone || req.electricians?.phone_number || 'N/A'}"`,
      `"${req.rewards?.title || 'N/A'}"`,
      req.points_spent,
      req.status,
      new Date(req.created_at).toLocaleString(),
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `WireRewards_Payouts_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-amber-400" />
            <h1 className="text-xl font-bold">WireRewards Control Panel</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAdminData}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-2 rounded-lg flex items-center gap-1 transition"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
            <button
              onClick={exportToCSV}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1 transition"
            >
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Users className="h-4 w-4 text-amber-400" /> Registered Electricians
            </div>
            <p className="text-2xl font-bold">{metrics.users}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <QrCode className="h-4 w-4 text-amber-400" /> Total Generated QRs
            </div>
            <p className="text-2xl font-bold">{metrics.coupons}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Clock className="h-4 w-4 text-amber-400" /> Pending Payout Requests
            </div>
            <p className="text-2xl font-bold text-amber-400">{metrics.pending}</p>
          </div>
        </div>

        {/* Batch QR Generator Form */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
          <h2 className="font-bold text-sm text-slate-200">Batch QR Generator</h2>
          <form onSubmit={handleGenerateBatch} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Batch Prefix</label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Points Per Coupon</label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={generating}
                className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1 transition disabled:opacity-50"
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                Generate Batch
              </button>
            </div>
          </form>
        </div>

        {/* Payout Claims Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 font-bold text-sm">Payout Requests</div>

          {loading ? (
            <div className="p-8 text-center text-slate-500 text-xs">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">No redemption requests found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/50 text-slate-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">Electrician</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Reward</th>
                    <th className="p-3">Points Spent</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-3 font-medium text-white">{req.electricians?.name || 'Unknown'}</td>
                      <td className="p-3 font-mono">{req.electricians?.phone || req.electricians?.phone_number || 'N/A'}</td>
                      <td className="p-3">{req.rewards?.title || 'Reward'}</td>
                      <td className="p-3 font-mono font-bold text-amber-400">{req.points_spent}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                            req.status === 'approved'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {req.status === 'pending' ? (
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-2.5 py-1 rounded text-[11px] transition inline-flex items-center gap-1"
                          >
                            <CheckCircle2 className="h-3 w-3" /> Approve
                          </button>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Approved</span>
                        )}
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
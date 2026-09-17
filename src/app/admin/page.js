'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import QRCode from 'qrcode';
import { ShieldCheck, Download, PlusCircle, Loader2, Users, Award, Gift, CheckCircle, Clock } from 'lucide-react';

export default function AdminPage() {
  const [points, setPoints] = useState(100);
  const [quantity, setQuantity] = useState(5);
  const [prefix, setPrefix] = useState('WIRE');
  const [loading, setLoading] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState([]);

  // Analytics state
  const [stats, setStats] = useState({ totalElectricians: 0, totalCoupons: 0, pendingRequests: 0 });
  const [requests, setRequests] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoadingStats(true);
    
    // 1. Total Electricians
    const { count: userCount } = await supabase.from('electricians').select('*', { count: 'exact', head: true });
    
    // 2. Total QR Coupons
    const { count: couponCount } = await supabase.from('qr_coupons').select('*', { count: 'exact', head: true });

    // 3. Pending Redemption Requests
    const { data: reqData } = await supabase
      .from('redemption_requests')
      .select('*, electricians(name, phone, phone_number), rewards(title)')
      .order('created_at', { ascending: false });

    const pendingCount = reqData?.filter((r) => r.status === 'pending').length || 0;

    setStats({
      totalElectricians: userCount || 0,
      totalCoupons: couponCount || 0,
      pendingRequests: pendingCount,
    });

    if (reqData) setRequests(reqData);
    setLoadingStats(false);
  };

  const handleApproveRequest = async (requestId) => {
    const { error } = await supabase
      .from('redemption_requests')
      .update({ status: 'approved' })
      .eq('id', requestId);

    if (error) {
      alert('Error updating status: ' + error.message);
      return;
    }

    fetchAnalytics();
  };

  const handleGenerateBatch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setGeneratedCodes([]);

    const newCoupons = [];
    const displayItems = [];

    for (let i = 0; i < quantity; i++) {
      const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
      const secretCode = `${prefix}-${points}-${randomSuffix}`;
      
      newCoupons.push({
        secret_code: secretCode,
        points: parseInt(points),
        is_redeemed: false,
      });
    }

    const { data, error } = await supabase.from('qr_coupons').insert(newCoupons).select();

    if (error) {
      alert('Error inserting codes into database: ' + error.message);
      setLoading(false);
      return;
    }

    for (const item of data) {
      const qrDataUrl = await QRCode.toDataURL(item.secret_code, { width: 300, margin: 2 });
      displayItems.push({ ...item, qrDataUrl });
    }

    setGeneratedCodes(displayItems);
    setLoading(false);
    fetchAnalytics();
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-amber-400" />
            <h1 className="text-2xl font-bold">WireRewards Control Panel</h1>
          </div>
          <span className="bg-slate-800 text-xs px-3 py-1 rounded-full text-slate-400">Admin Live Portal</span>
        </div>

        {/* Analytics Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Registered Electricians</p>
              <p className="text-2xl font-extrabold text-amber-400 mt-1">{stats.totalElectricians}</p>
            </div>
            <Users className="h-8 w-8 text-slate-700" />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Total Generated QRs</p>
              <p className="text-2xl font-extrabold text-amber-400 mt-1">{stats.totalCoupons}</p>
            </div>
            <Award className="h-8 w-8 text-slate-700" />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Pending Payout Requests</p>
              <p className="text-2xl font-extrabold text-amber-400 mt-1">{stats.pendingRequests}</p>
            </div>
            <Gift className="h-8 w-8 text-slate-700" />
          </div>
        </div>

        {/* Generator Form */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-300">Batch QR Generator</h2>
          <form onSubmit={handleGenerateBatch} className="bg-slate-900 border border-slate-800 rounded-xl p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Batch Prefix</label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Points Per Coupon</label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                max="50"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
                required
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-400 text-slate-950 font-bold py-2 px-4 rounded-lg hover:bg-amber-300 transition flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                Generate Batch
              </button>
            </div>
          </form>
        </div>

        {/* Generated QRs Section */}
        {generatedCodes.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-300">Generated Batch Codes ({generatedCodes.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {generatedCodes.map((code) => (
                <div key={code.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col items-center gap-3 text-center">
                  <img src={code.qrDataUrl} alt={code.secret_code} className="w-40 h-40 rounded-lg bg-white p-2" />
                  <div>
                    <p className="font-mono text-xs font-bold text-amber-400">{code.secret_code}</p>
                    <p className="text-xs text-slate-400 mt-1">{code.points} Points</p>
                  </div>
                  <a
                    href={code.qrDataUrl}
                    download={`${code.secret_code}.png`}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-xs py-2 rounded-lg flex items-center justify-center gap-1 transition"
                  >
                    <Download className="h-3 w-3" /> Download PNG
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Redemption Payout Requests Table */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-300">Payout Requests</h2>
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800 text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="p-3">Electrician</th>
                  <th className="p-3">Reward</th>
                  <th className="p-3">Points Spent</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-slate-500">No redemption requests found.</td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req.id}>
                      <td className="p-3">
                        <p className="font-bold">{req.electricians?.name || 'Unknown'}</p>
                        <p className="text-slate-400">{req.electricians?.phone || req.electricians?.phone_number}</p>
                      </td>
                      <td className="p-3">{req.rewards?.title || 'Reward'}</td>
                      <td className="p-3 font-bold text-amber-400">{req.points_spent} Pts</td>
                      <td className="p-3">
                        {req.status === 'pending' ? (
                          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                            <Clock className="h-3 w-3" /> Pending
                          </span>
                        ) : (
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                            <CheckCircle className="h-3 w-3" /> Approved
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {req.status === 'pending' && (
                          <button
                            onClick={() => handleApproveRequest(req.id)}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1 rounded transition"
                          >
                            Mark Approved
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
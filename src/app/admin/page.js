'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import QRCode from 'qrcode';
import { ShieldCheck, Download, PlusCircle, Loader2 } from 'lucide-react';

export default function AdminPage() {
  const [points, setPoints] = useState(100);
  const [quantity, setQuantity] = useState(5);
  const [prefix, setPrefix] = useState('WIRE');
  const [loading, setLoading] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState([]);

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

    // Insert all coupons into Supabase at once
    const { data, error } = await supabase
      .from('qr_coupons')
      .insert(newCoupons)
      .select();

    if (error) {
      alert('Error inserting codes into database: ' + error.message);
      setLoading(false);
      return;
    }

    // Generate downloadable Data URLs for each code
    for (const item of data) {
      const qrDataUrl = await QRCode.toDataURL(item.secret_code, { width: 300, margin: 2 });
      displayItems.push({ ...item, qrDataUrl });
    }

    setGeneratedCodes(displayItems);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-amber-400" />
            <h1 className="text-2xl font-bold">Admin QR Batch Generator</h1>
          </div>
          <span className="bg-slate-800 text-xs px-3 py-1 rounded-full text-slate-400">Protected Portal</span>
        </div>

        {/* Generator Form */}
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
            <label className="block text-xs text-slate-400 mb-1">Quantity to Generate</label>
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

        {/* Display Generated QR Cards */}
        {generatedCodes.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-300">Generated Codes ({generatedCodes.length})</h2>
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
      </div>
    </main>
  );
}
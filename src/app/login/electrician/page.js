'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Phone, User, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ElectricianLoginPage() {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);

    // 1. Check if electrician already exists
    let { data: electrician, error } = await supabase
      .from('electricians')
      .select('*')
      .eq('phone_number', phone)
      .single();

    // 2. Register new electrician using 'name' column instead of 'full_name'
    if (error && error.code === 'PGRST116') {
      const { data: newElectrician, error: createError } = await supabase
        .from('electricians')
        .insert([{ 
          phone_number: phone, 
          name: name || `Electrician (${phone.slice(-4)})`, 
          total_points: 0 
        }])
        .select()
        .single();

      if (createError) {
        alert('Registration error: ' + createError.message);
        setLoading(false);
        return;
      }
      electrician = newElectrician;
    }

    // 3. Save session locally and redirect to points dashboard
    localStorage.setItem('electrician', JSON.stringify(electrician));
    setLoading(false);
    router.push('/dashboard');
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="bg-amber-400 p-3 rounded-xl inline-block text-slate-950">
            <Zap className="h-8 w-8 font-bold" />
          </div>
          <h1 className="text-2xl font-bold">Electrician Loyalty Portal</h1>
          <p className="text-xs text-slate-400">Scan QR codes on WireRewards cables to instantly earn & redeem cash points.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium">Mobile Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400 transition font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium">Your Name (Optional)</label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Access Points Dashboard <ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>

        <button
          onClick={() => router.push('/')}
          className="w-full text-xs text-slate-500 hover:text-slate-300 transition text-center flex items-center justify-center gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Homepage
        </button>
      </div>
    </main>
  );
}
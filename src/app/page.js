'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Zap } from 'lucide-react';

export default function Home() {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!phone || !name) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('electricians')
      .select('*')
      .eq('phone', phone)
      .maybeSingle();

    let user = data;

    if (!user) {
      const { data: newUser, error: createError } = await supabase
        .from('electricians')
        .insert([{ phone, name, points: 0 }])
        .select()
        .single();
      
      if (createError) {
        alert('Error creating account: ' + createError.message);
        setLoading(false);
        return;
      }
      user = newUser;
    }

    localStorage.setItem('electrician', JSON.stringify(user));
    router.push('/dashboard');
  };


  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex justify-center mb-4">
          <Zap className="h-12 w-12 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-center mb-6">WireRewards B2B</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Mobile Number</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter 10-digit number"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Your Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-400 text-slate-950 font-bold py-3 rounded-lg hover:bg-amber-300 transition"
          >
            {loading ? 'Logging in...' : 'Access Dashboard'}
          </button>
        </form>
      </div>
    </main>
  );
}
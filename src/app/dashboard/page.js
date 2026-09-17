'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { QrCode, LogOut, Award } from 'lucide-react';

export default function Dashboard() {
  const [electrician, setElectrician] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('electrician');
    if (!stored) {
      router.push('/');
      return;
    }
    const parsed = JSON.parse(stored);
    setElectrician(parsed);
    fetchLatestPoints(parsed.id);
  }, []);

  const fetchLatestPoints = async (id) => {
    const { data } = await supabase
      .from('electricians')
      .select('points')
      .eq('id', id)
      .single();
    if (data) {
      setElectrician((prev) => ({ ...prev, points: data.points }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('electrician');
    router.push('/');
  };

  if (!electrician) return null;

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
          <div>
            <h2 className="text-lg font-bold">{electrician.name}</h2>
            <p className="text-xs text-slate-400">{electrician.phone}</p>
          </div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-white">
            <LogOut className="h-5 w-5" />
          </button>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-slate-950 shadow-lg">
          <p className="text-sm font-semibold opacity-80">Total Earned Points</p>
          <div className="flex items-center gap-2 mt-2">
            <Award className="h-8 w-8" />
            <span className="text-4xl font-extrabold">{electrician.points}</span>
          </div>
        </div>

        <button
          onClick={() => router.push('/scan')}
          className="w-full bg-slate-900 border border-amber-400/30 hover:border-amber-400 text-amber-400 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition"
        >
          <QrCode className="h-5 w-5" />
          Open Camera Scanner
        </button>
      </div>
    </main>
  );
}
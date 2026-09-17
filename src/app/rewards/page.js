'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Gift, Award, CheckCircle2, Loader2 } from 'lucide-react';

export default function RewardsPage() {
  const [electrician, setElectrician] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('electrician');
    if (!stored) {
      router.push('/');
      return;
    }
    const parsed = JSON.parse(stored);
    setElectrician(parsed);
    fetchData(parsed.id);
  }, []);

  const fetchData = async (userId) => {
    setLoading(true);
    // Fetch latest user points
    const { data: userData } = await supabase
      .from('electricians')
      .select('points')
      .eq('id', userId)
      .single();

    if (userData) {
      setElectrician((prev) => ({ ...prev, points: userData.points }));
    }

    // Fetch active rewards
    const { data: rewardsData } = await supabase
      .from('rewards')
      .select('*')
      .eq('is_active', true)
      .order('points_required', { ascending: true });

    if (rewardsData) {
      setRewards(rewardsData);
    }
    setLoading(false);
  };

  const handleRedeem = async (reward) => {
    if (electrician.points < reward.points_required) {
      alert('Insufficient points for this reward!');
      return;
    }

    if (!confirm(`Redeem ${reward.title} for ${reward.points_required} points?`)) return;

    setProcessingId(reward.id);
    setMessage('');

    const newBalance = electrician.points - reward.points_required;

    // 1. Deduct points from electrician
    const { error: userError } = await supabase
      .from('electricians')
      .update({ points: newBalance })
      .eq('id', electrician.id);

    if (userError) {
      alert('Failed to deduct points. Please try again.');
      setProcessingId(null);
      return;
    }

    // 2. Create redemption request entry
    const { error: reqError } = await supabase
      .from('redemption_requests')
      .insert([
        {
          electrician_id: electrician.id,
          reward_id: reward.id,
          points_spent: reward.points_required,
          status: 'pending',
        },
      ]);

    if (reqError) {
      alert('Error creating redemption request.');
      setProcessingId(null);
      return;
    }

    // Update local storage and view state
    const updatedUser = { ...electrician, points: newBalance };
    localStorage.setItem('electrician', JSON.stringify(updatedUser));
    setElectrician(updatedUser);

    setMessage(`Success! Redeemed "${reward.title}". Your payout request is pending approval.`);
    setProcessingId(null);
  };

  if (!electrician) return null;

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </button>
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-xs font-bold text-amber-400">
            <Award className="h-4 w-4" />
            <span>{electrician.points} Pts</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Gift className="h-7 w-7 text-amber-400" />
          <h1 className="text-2xl font-bold">Rewards Catalog</h1>
        </div>

        {message && (
          <div className="bg-emerald-950/60 border border-emerald-500/50 p-4 rounded-xl flex items-start gap-3 text-emerald-300 text-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <p>{message}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 text-amber-400 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {rewards.map((item) => {
              const canAfford = electrician.points >= item.points_required;
              return (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-base text-white">{item.title}</h3>
                      <span className="bg-slate-800 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-md">
                        {item.points_required} Pts
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                  </div>

                  <button
                    onClick={() => handleRedeem(item)}
                    disabled={!canAfford || processingId === item.id}
                    className={`w-full font-bold py-2.5 rounded-lg text-xs transition flex items-center justify-center gap-2 ${
                      canAfford
                        ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {processingId === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : canAfford ? (
                      'Claim Reward'
                    ) : (
                      `Need ${item.points_required - electrician.points} More Points`
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
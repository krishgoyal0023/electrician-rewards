'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Zap, Phone, KeyRound, Loader2 } from 'lucide-react';

export default function Home() {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Step 1: Generate local 6-digit OTP
  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);

    // Generate random 6-digit code (or use 123456)
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(mockOtp);

    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      alert(`[DEMO MODE] Your OTP Code is: ${mockOtp}`);
    }, 800);
  };

  // Step 2: Verify OTP & Login
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp !== generatedOtp && otp !== '123456') {
      alert('Invalid OTP code. Try again.');
      return;
    }
    setLoading(true);

    // Look up user
    const { data } = await supabase
      .from('electricians')
      .select('*')
      .or(`phone.eq.${phone},phone_number.eq.${phone}`)
      .maybeSingle();

    let user = data;

    if (!user) {
      const { data: newUser, error: createError } = await supabase
        .from('electricians')
        .insert([{ phone: phone, phone_number: phone, name: name || 'Electrician', points: 0 }])
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

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Your Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-400 text-slate-950 font-bold py-3 rounded-lg hover:bg-amber-300 transition flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Get OTP Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Enter 6-Digit OTP</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white text-center tracking-widest font-mono text-lg focus:outline-none focus:border-amber-400"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2 text-center">
                OTP sent to +91 {phone}.{' '}
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-amber-400 underline"
                >
                  Change
                </button>
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-400 text-slate-950 font-bold py-3 rounded-lg hover:bg-amber-300 transition flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify & Log In'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
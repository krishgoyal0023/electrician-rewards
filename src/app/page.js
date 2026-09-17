'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Zap, Award, QrCode } from 'lucide-react'
import Scanner from './Scanner'

export default function Home() {
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [electrician, setElectrician] = useState(null)
  const [couponCode, setCouponCode] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [showScanner, setShowScanner] = useState(false)

  // Login / Register Electrician
  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    let { data, error } = await supabase
      .from('electricians')
      .select('*')
      .eq('phone_number', phone)
      .single()

    if (!data) {
      const { data: newUser, error: createError } = await supabase
        .from('electricians')
        .insert([{ phone_number: phone, name: name || 'Electrician' }])
        .select()
        .single()

      if (createError) {
        setMessage('Error creating account. Try again.')
        setLoading(false)
        return
      }
      data = newUser
    }

    setElectrician(data)
    setLoading(false)
  }

  // Core Coupon Redemption Logic
  const redeemCode = async (codeToRedeem) => {
    if (!codeToRedeem) return
    setLoading(true)
    setMessage('')

    const { data: coupon, error } = await supabase
      .from('qr_coupons')
      .select('*')
      .eq('secret_code', codeToRedeem.trim().toUpperCase())
      .single()

    if (error || !coupon) {
      setMessage('❌ Invalid QR / Secret Code!')
      setLoading(false)
      return
    }

    if (coupon.is_redeemed) {
      setMessage('⚠️ This code has already been redeemed!')
      setLoading(false)
      return
    }

    const { error: updateCouponErr } = await supabase
      .from('qr_coupons')
      .update({
        is_redeemed: true,
        redeemed_by: electrician.id,
        redeemed_at: new Date().toISOString()
      })
      .eq('id', coupon.id)

    if (updateCouponErr) {
      setMessage('Error redeeming code.')
      setLoading(false)
      return
    }

    const newTotal = (electrician.total_points || 0) + coupon.points_value
    await supabase
      .from('electricians')
      .update({ total_points: newTotal })
      .eq('id', electrician.id)

    setElectrician({ ...electrician, total_points: newTotal })
    setMessage(`🎉 Success! Added +${coupon.points_value} points to your account!`)
    setCouponCode('')
    setShowScanner(false)
    setLoading(false)
  }

  const handleManualRedeem = (e) => {
    e.preventDefault()
    redeemCode(couponCode)
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center p-4">
      <div className="w-full max-w-md my-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap className="text-amber-400 w-8 h-8" />
          <h1 className="text-2xl font-bold tracking-wide">WireRewards B2B</h1>
        </div>
        <p className="text-xs text-slate-400">Scan & Earn Points on Electrical Supplies</p>
      </div>

      <div className="w-full max-w-md bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl">
        {!electrician ? (
          <form onSubmit={handleAuth} className="space-y-4">
            <h2 className="text-lg font-semibold text-center mb-4">Electrician Login</h2>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Mobile Number</label>
              <input
                type="tel"
                required
                placeholder="Enter 10-digit number"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-amber-400"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Your Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-amber-400"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 font-bold py-3 rounded-lg text-slate-900 transition"
            >
              {loading ? 'Verifying...' : 'Access Dashboard'}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-slate-900 p-4 rounded-lg flex items-center justify-between border border-slate-700">
              <div>
                <p className="text-xs text-slate-400">Welcome,</p>
                <p className="font-semibold text-white">{electrician.name}</p>
                <p className="text-xs text-slate-400">{electrician.phone_number}</p>
              </div>
              <div className="text-right bg-amber-500/10 border border-amber-500/30 p-2 rounded-lg">
                <div className="flex items-center gap-1 text-amber-400">
                  <Award className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">Points</span>
                </div>
                <p className="text-xl font-bold text-amber-400">{electrician.total_points || 0}</p>
              </div>
            </div>

            {/* Camera Scanner Toggle */}
            <button
              onClick={() => setShowScanner(!showScanner)}
              className="w-full bg-slate-700 hover:bg-slate-600 font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 border border-slate-600 transition"
            >
              <QrCode className="w-5 h-5 text-amber-400" />
              {showScanner ? 'Close Camera Scanner' : 'Open QR Scanner Camera'}
            </button>

            {showScanner && (
              <Scanner onScanSuccess={(scannedText) => redeemCode(scannedText)} />
            )}

            {/* Manual Code Entry */}
            <form onSubmit={handleManualRedeem} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Or Enter Secret Code Manually</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. WIRE-102-BETA"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-3 text-white uppercase focus:outline-none focus:border-amber-400"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-amber-500 hover:bg-amber-600 font-bold px-4 rounded-lg text-slate-900 transition"
                  >
                    Redeem
                  </button>
                </div>
              </div>
            </form>

            {message && (
              <div className="p-3 bg-slate-900 border border-slate-700 rounded-lg text-sm text-center">
                {message}
              </div>
            )}

            <button
              onClick={() => { setElectrician(null); setMessage(''); setShowScanner(false); }}
              className="w-full text-xs text-slate-500 hover:text-slate-300 text-center block pt-2"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
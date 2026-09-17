'use client'

import { useEffect } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'

export default function Scanner({ onScanSuccess }) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'reader',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    )

    scanner.render(
      (decodedText) => {
        scanner.clear()
        onScanSuccess(decodedText)
      },
      (error) => {
        // Continuous scanning errors ignored
      }
    )

    return () => {
      scanner.clear().catch(() => {})
    }
  }, [onScanSuccess])

  return (
    <div className="w-full bg-slate-900 p-4 rounded-lg border border-slate-700">
      <div id="reader" className="w-full text-white"></div>
    </div>
  )
}
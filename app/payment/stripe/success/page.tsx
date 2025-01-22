'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import confetti from 'canvas-confetti'

export default function SuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // Käivita confetti efekt
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })

    // Võta localStorage'ist vajalikud ID-d
    const oneTimeOrderId = localStorage.getItem('pending_teavitus_order_id')
    const userId = localStorage.getItem('pending_teavitus_user_id')

    // Suuna kasutaja 3 sekundi pärast tagasi raportide lehele
    const timer = setTimeout(() => {
      if (userId && oneTimeOrderId) {
        router.push(`/kasutaja/minu-raportid/raport?user_id=${userId}&order_id=${oneTimeOrderId}`)
      } else {
        console.error('Missing required IDs:', { userId, oneTimeOrderId })
        router.push('/kasutaja/minu-raportid')
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="text-center p-8 rounded-lg">
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          Teavitused edukalt aktiveeritud!
        </h1>
        <p className="text-gray-600 mb-4">
          Suuname sind automaatselt tagasi analüüsi lehele...
        </p>
      </div>
    </div>
  )
} 
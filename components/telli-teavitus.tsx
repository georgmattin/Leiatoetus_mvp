'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { supabase } from "@/lib/supabaseClient"
import LoginForm from "./user_auth_components/login"

export default function PricingCard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [user, setUser] = useState<{ email: string | null; id: string | null }>({ email: null, id: null })
  const [activeSubscription, setActiveSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const isAuthenticated = !!session?.user
      setIsLoggedIn(isAuthenticated)
      
      if (isAuthenticated && session.user) {
        setUser({
          email: session.user.email,
          id: session.user.id
        })

        // Kontrolli aktiivset tellimust
        const { data: subscription } = await supabase
          .from('stripe_subscriptions')
          .select('*')
          .eq('email', session.user.email)
          .eq('status', 'active')
          .single()

        if (subscription) {
          setActiveSubscription(subscription)
        }
      }
    }
    checkUser()
  }, [])

  const handleSubscribe = async () => {
    if (!isLoggedIn) {
      setShowLoginModal(true)
      return
    }

    if (user.email) {
      // Kontrolli olemasolevat tellimust enne Stripe'i suunamist
      const { data: existingSubscription, error } = await supabase
        .from('stripe_subscriptions')
        .select('*')
        .eq('email', user.email)
        .eq('status', 'active')
        .single()

      if (existingSubscription) {
        alert('Sellel e-posti aadressil on juba aktiivne tellimus.')
        return
      }

      if (error && error.code !== 'PGRST116') { // PGRST116 on "not found" viga
        alert('Viga tellimuse kontrollimisel. Palun proovige hiljem uuesti.')
        return
      }

      // Kui aktiivset tellimust ei leitud, suuna Stripe'i
      const baseUrl = 'https://buy.stripe.com/test_aEU15lgLibyrfQs5kk'
      const params = new URLSearchParams({
        'client_reference_id': user.id!,
        'prefilled_email': user.email!,
        'locale': 'et'
      })
      window.location.href = `${baseUrl}?${params.toString()}`
    }
  }

  const handleLoginSuccess = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      setIsLoggedIn(true)
      setUser({
        email: session.user.email,
        id: session.user.id
      })
      setShowLoginModal(false)
      
      const baseUrl = 'https://buy.stripe.com/test_aEU15lgLibyrfQs5kk'
      const params = new URLSearchParams({
        'client_reference_id': session.user.id,
        'prefilled_email': session.user.email!,
        'locale': 'et'
      })
      window.location.href = `${baseUrl}?${params.toString()}`
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Kas olete kindel, et soovite tellimuse lõpetada?')) {
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('stripe_subscriptions')
        .update({ 
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', activeSubscription.id)

      if (error) throw error

      setActiveSubscription(null)
      alert('Tellimus on edukalt lõpetatud. Tellimus kehtib kuni perioodi lõpuni.')
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      alert('Viga tellimuse lõpetamisel. Palun proovige hiljem uuesti.')
    } finally {
      setLoading(false)
    }
  }

  const renderActionButton = () => {
    if (loading) {
      return (
        <Button variant="secondary" className="w-full sm:w-auto font-medium" disabled>
          Laadimine...
        </Button>
      )
    }

    if (activeSubscription) {
      return (
        <Button 
          variant="destructive" 
          className="w-full sm:w-auto font-medium"
          onClick={handleCancelSubscription}
        >
          Lõpeta aktiivne tellimus
        </Button>
      )
    }

    return (
      <Button 
        variant="secondary" 
        className="w-full sm:w-auto font-medium"
        onClick={handleSubscribe}
      >
        Telli teavitus
      </Button>
    )
  }

  return (
    <>
      <Card className="max-w-5xl overflow-hidden border-2">
        <CardContent className="p-0">
          <div className="grid lg:grid-cols-[400px_1fr]">
            <div className="bg-[#3B5FE5] text-white p-8">
              <div className="space-y-4">
                <div className="inline-flex px-3 py-1 bg-white/10 rounded-full text-sm">
                  Kõige populaarsem
                </div>
                <h2 className="text-2xl font-semibold">
                  Teavitusteenus
                </h2>
                <div className="space-y-1">
                  <div className="text-3xl font-bold">
                    €9/kuus
                  </div>
                  <p className="text-sm text-white/80">
                    ühe organisatsiooni kohta
                  </p>
                </div>
                {activeSubscription && (
                  <p className="text-sm bg-white/10 p-2 rounded">
                    Teie tellimus kehtib kuni: {new Date(activeSubscription.subscription_end_date).toLocaleDateString('et-EE')}
                  </p>
                )}
                {renderActionButton()}
              </div>
            </div>
            
            <div className="p-8 bg-white">
              <div className="space-y-2">
                <h3 className="font-medium">
                  Telli teavitus ja ära maga ühtegi toetust maha
                </h3>
                <ul className="space-y-4 text-sm text-gray-600">
                  <li className="flex gap-3">
                    <div className="flex-none">
                      <div className="w-2 h-2 mt-2 rounded-full bg-[#3B5FE5]" />
                    </div>
                    <p>
                      Sälista alaga – me jälgime toetusi sinu eest ja anname sulle teada kohe, 
                      kui mõnigi olulist liinub. Uued toetused jagatakse sageli piiratud 
                      summade alusel - kirus on edu võti.
                    </p>
                  </li>
                  <li className="flex gap-3">
                    <div className="flex-none">
                      <div className="w-2 h-2 mt-2 rounded-full bg-[#3B5FE5]" />
                    </div>
                    <p>
                      Kohandatud sinu ettevõttele: Saad ainult just sinu firmale hästi sobivaid 
                      teavitusi, mitte üleliigseid infot.
                    </p>
                  </li>
                  <li className="flex gap-3">
                    <div className="flex-none">
                      <div className="w-2 h-2 mt-2 rounded-full bg-[#3B5FE5]" />
                    </div>
                    <p>
                      Välke kuumakse võib viia suure toetusrahastuseni.
                    </p>
                  </li>
                  <li className="flex gap-3">
                    <div className="flex-none">
                      <div className="w-2 h-2 mt-2 rounded-full bg-[#3B5FE5]" />
                    </div>
                    <p>
                      Teavitused saadetakse mugavalt sinu{' '}
                      <Link href="/register" className="text-[#3B5FE5] hover:underline">
                        e-maili aadressile
                      </Link>
                      .
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Logi sisse</h2>
              <button 
                onClick={() => setShowLoginModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <LoginForm onLoginSuccess={handleLoginSuccess} />
          </div>
        </div>
      )}
    </>
  )
} 
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle } from 'lucide-react'
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import Header from "@/components/header"
import Footer from "@/components/footer"

export default function StripeSuccess() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const maxRetries = 5 // Maksimaalne katsete arv
  const retryDelay = 2000 // 2 sekundit katsete vahel

  useEffect(() => {
    let retryCount = 0
    let timeoutId: NodeJS.Timeout

    const checkSubscription = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push('/logi-sisse')
          return
        }

        const { data: subscription } = await supabase
          .from('stripe_subscriptions')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('status', 'active')
          .single()

        if (subscription) {
          setLoading(false)
          return true // Tellimus leitud
        }

        // Kui tellimust ei leitud ja katseid on veel
        if (retryCount < maxRetries) {
          retryCount++
          timeoutId = setTimeout(checkSubscription, retryDelay)
          return false
        }

        // Kui kõik katsed on läbi ja tellimust ei leitud
        setError(true)
        setLoading(false)
        return false
      } catch (error) {
        console.error('Error checking subscription:', error)
        setError(true)
        setLoading(false)
        return false
      }
    }

    checkSubscription()

    // Puhasta timeout kui komponent unmount'itakse
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [router])

  const renderContent = () => {
    if (loading) {
      return (
        <Card className="max-w-lg w-full">
          <CardContent className="pt-6 text-center">
            <div className="mb-6">
              <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"/>
            </div>
            <h1 className="text-2xl font-bold mb-4">Kinnitame teie tellimust...</h1>
            <p className="text-gray-600">
              Palun oodake, see võib võtta mõne hetke.
            </p>
          </CardContent>
        </Card>
      )
    }

    if (error) {
      return (
        <Card className="max-w-lg w-full">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold mb-4 text-red-600">
              {error === 'SUBSCRIPTION_EXISTS' 
                ? 'Aktiivne tellimus juba olemas'
                : 'Viga tellimuse kontrollimisel'}
            </h1>
            <p className="text-gray-600 mb-6">
              {error === 'SUBSCRIPTION_EXISTS'
                ? 'Sellel e-posti aadressil on juba aktiivne tellimus.'
                : 'Palun võtke ühendust klienditoega või proovige hiljem uuesti.'}
            </p>
            <Button asChild>
              <Link href="/telli-teavitus">
                Tagasi tellimuse lehele
              </Link>
            </Button>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className="max-w-lg w-full">
        <CardContent className="pt-6 text-center">
          <div className="mb-6">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Tellimus on aktiveeritud!</h1>
          <p className="text-gray-600 mb-6">
            Täname tellimuse eest. Hakkad nüüd saama personaalseid teavitusi toetuste kohta.
          </p>
          <Button asChild>
            <Link href="/minu-konto">
              Mine minu kontole
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-[#F6F9FC] flex items-center justify-center p-4">
        {renderContent()}
      </main>
      <Footer />
    </div>
  )
} 
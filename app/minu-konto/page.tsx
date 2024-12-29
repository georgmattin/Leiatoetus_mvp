'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import GrantsTable from '@/components/grants-table-full'
import confetti from 'canvas-confetti'
import Header from "@/components/header"
import MobileHeader from "@/components/mobileheader"
import { supabase } from "@/lib/supabaseClient"

export default function SobivadToetusedPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [animatedTotal, setAnimatedTotal] = useState(0)
  const [animatedTime, setAnimatedTime] = useState(0)
  const [animatedResults, setAnimatedResults] = useState(0)
  const [animatedGrants, setAnimatedGrants] = useState(0)
  const [allAnimationsComplete, setAllAnimationsComplete] = useState(false)

  const companyName = "Firma nimi OÜ"
  const resultsCount = "7"
  const savedTime = "90"
  const grantsTotal = "35000"
  const viewedGrants = "370"
  
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/logi-sisse')
        return
      }
      
      setIsLoading(false)
    }
    setIsLoading(false)
    //checkUser()
  }, [router])

  useEffect(() => {
    if (
      animatedTotal === parseInt(grantsTotal) &&
      animatedTime === parseInt(savedTime) &&
      animatedGrants === parseInt(viewedGrants) &&
      animatedResults === parseInt(resultsCount) &&
      !allAnimationsComplete
    ) {
      setAllAnimationsComplete(true)
      
      confetti({
        particleCount: 100,
        spread: 105,
        origin: { x: 0, y: 0.6 },
      })

      confetti({
        particleCount: 100,
        spread: 105,
        origin: { x: 1, y: 0.6 },
      })
    }
  }, [
    animatedTotal,
    animatedTime,
    animatedResults,
    animatedGrants,
    grantsTotal,
    savedTime,
    resultsCount,
    viewedGrants,
    allAnimationsComplete,
  ])

  useEffect(() => {
    const duration = 1000 // 2 seconds
    const steps = 60
    const increment = parseInt(grantsTotal) / steps
    let current = 0
    
    const timer = setInterval(() => {
      current += increment
      if (current >= parseInt(grantsTotal)) {
        setAnimatedTotal(parseInt(grantsTotal))
        clearInterval(timer)
      } else {
        setAnimatedTotal(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [grantsTotal])

  useEffect(() => {
    const duration = 1000 // 2 seconds
    const steps = 60
    const increment = parseInt(savedTime) / steps
    let current = 0
    
    const timer = setInterval(() => {
      current += increment
      if (current >= parseInt(savedTime)) {
        setAnimatedTime(parseInt(savedTime))
        clearInterval(timer)
      } else {
        setAnimatedTime(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [savedTime])

  useEffect(() => {
    const duration = 1000 // 2 seconds
    const steps = 60
    const increment = parseInt(resultsCount) / steps
    let current = 0
    
    const timer = setInterval(() => {
      current += increment
      if (current >= parseInt(resultsCount)) {
        setAnimatedResults(parseInt(resultsCount))
        clearInterval(timer)
      } else {
        setAnimatedResults(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [resultsCount])

  useEffect(() => {
    const duration = 1000; // 2 seconds
    const steps = 60;
    const increment = parseInt(viewedGrants) / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= parseInt(viewedGrants)) {
        setAnimatedGrants(parseInt(viewedGrants));
        clearInterval(timer);
      } else {
        setAnimatedGrants(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [viewedGrants]);

  if (isLoading) {
    return null
  }

  return (
    <>
      <Header />
      <MobileHeader />
      <section id="intro-section" className="w-full bg-[#F6F9FC] md:px-0 pt-[50px] pb-[40px]">
        <div className="max-w-[1200px] mx-auto px-[15px] md:px-[30px] py-[0px] bg-white/0 rounded-[15px]">
          <div className="text-center">
            <p className="text-[#133248] text-lg mb-2">{companyName}</p>
            <h2 className="font-sans text-[38.78px] font-[800] text-[#133248] text-[#133248] leading-[50px]">
              Leidsime <span className="text-[#3F5DB9]">{animatedResults}</span> sinu ettevõttele<br />
              sobivat toetust
            </h2>
          </div>
        </div>
      </section>

      <section id="stats-section" className="w-full bg-[#F6F9FC] px-[15px] md:px-0 py-[0px]">
        <div className="max-w-[1200px] mx-auto px-[15px] md:px-[40px] py-[0px] bg-white/0 rounded-[15px]">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">

            <div id="stats-section-column-1" className="text-center md:col-span-1 w-full md:min-w-[380px] max-w-[380px] p-[20px] rounded-[10px] shadow-[4px_6px_10px_#d2e5ff]">
              <p className="font-sans text-[47.78px] font-bold text-[#3F5DB9]">{animatedTime}h</p>
              <p className="font-sans text-[16px] text-[#3F5DB9]">
              <span className="font-[700]">KOKKUHOITUD AEG</span><br />toetuste otsimisel ja analüüsimisel
              </p>
            </div>

            <div id="stats-section-column-2" className="text-center md:col-span-1 w-full md:min-w-[380px] max-w-[380px] p-[20px] rounded-[10px] shadow-[4px_6px_10px_#d2e5ff]">
              <p className="font-sans text-[47.78px] font-bold text-[#3F5DB9]">{animatedTotal}€</p>
              <p className="font-sans text-[16px] text-[#3F5DB9]">
              <span className="font-[700]">LEITUD POTENTSIAALNE</span><br />toetuste kogusumma
              </p>
            </div>

            <div id="stats-section-column-2" className="text-center md:col-span-1 w-full md:min-w-[400px] max-w-[400px] p-[20px] rounded-[10px] shadow-[4px_6px_10px_#d2e5ff]">
              <p className="font-sans text-[47.78px] font-bold text-[#3F5DB9]">{animatedGrants}</p>
              <p className="font-sans text-[16px] text-[#3F5DB9]">
              <span className="font-[700]">LÄBIVAADATUD</span><br />toetuste arv
              </p>
            </div>

          </div>

        </div>
      </section>

      <section id="grants-section" className="w-full bg-[#F6F9FC] px-[15px] md:px-0 py-[30px]">
        <div id="grants-container" className="max-w-[1200px] mx-auto px-[15px] md:px-[30px] py-[30px] bg-white rounded-[15px]">
          <h1 id="grants-title" className="text-[27.65px] font-bold text-[#133248] mb-6">
            <span className="text-[#3F5DB9]">{companyName}</span>-le sobivad toetused
          </h1>
          <GrantsTable />
        </div>
      </section>
    </>
  )
}


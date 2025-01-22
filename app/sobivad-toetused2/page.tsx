'use client'

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Footer from "@/components/footer"
import { StatCard } from "@/components/stat-card"
import { GrantsTable } from "@/components/grants-table"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, PlayCircle, Clock, EuroIcon, SearchCheck, FileText, LockIcon } from 'lucide-react'
import { Separator } from "@/components/ui/separator"
import Link from 'next/link'
import Header from "@/components/header"

// Demo data
const demoGrants = [
  {
    status: "Avatud",
    suitability: "100%",
    provider: "EIS",
    name: "Toetame digipöörde ettevõtes",
    amount: "kuni 300 000€",
    period: "31.12.2023"
  },
  {
    status: "Avatud",
    suitability: "100%",
    provider: "KIK",
    name: "Toetame investeeringuid jäätmete ringlussevõtu võimaluste suurendamiseks",
    amount: "10 000€ - 3 000 000€",
    period: "Eelraha ammendumiseni"
  },
  {
    status: "Avatud",
    suitability: "100%",
    provider: "Tallinna Linnavalitsus",
    name: "Mitmetelundustegevuse toetamine kultuurivaldkonnas",
    amount: "1000€",
    period: "Läbi aasta"
  },
  {
    status: "Avatud",
    suitability: "100%",
    provider: "KLKA",
    name: "Arhitektuur",
    amount: "Oleneb projektist",
    period: "-"
  },
  {
    status: "Avatud",
    suitability: "100%",
    provider: "PRA",
    name: "EMKVF projektitoetus",
    amount: "kuni 400 000€",
    period: "30.03.2029"
  },
  {
    status: "Avatud",
    suitability: "100%",
    provider: "KÜSK",
    name: "Linna- ja valdade virtuaalsete taotlusvoor",
    amount: "Oleneb projektist",
    period: "-"
  },
  {
    status: "Avatud",
    suitability: "100%",
    provider: "Tartu Linnavalitsus",
    name: "Spordi valdkonnaprojekti toetus",
    amount: "Oleneb projektist",
    period: "-"
  }
]

export default function HomePage() {
  const isLoggedIn = false // või võta see oma auth loogikast

  const handleLogout = () => {
    // sinu logout loogika
  }

  return (
    <>
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#ECFDF5] to-white m-5 rounded-lg">
      <Header />

      <div>
        {/* Hero Section */}
        <section>
          <div className="max-w-[1200px] rounded mx-auto mt-12 mb-10 flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-6 text-center"
            >
              <Badge 
                variant="outline" 
                className="w-fit text-[#008834] leading-[0px] border-[#008834] text-[16px] font-[600]"
              >
                ANALÜÜSI TULEMUSED
              </Badge>
              
              <div className="space-y-2">
                <h1 className="text-3xl font-[900] text-[#111827]">
                  LEVEL TWO SOLUTIONS OÜ
                </h1>
                <p className="text-[23.04px] text-[#111827]">
                  Leidsime sulle <span className="text-[#008834] text-[27.65px] font-[900]">27</span> sobivat toetust
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <main>
          <div className="max-w-[1200px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="space-y-8"
            >
              {/* Stats Grid */}
              <div className=" rounded-lg "> 
             
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Leitud toetuste summa */}
                  <div className="text-center md:col-span-1 w-full max-w-[380px] p-[20px] rounded-[10px] shadow-[4px_6px_10px] shadow-[#059669]/20">
                  <h3 className="text-[38.16px] text-center  font-[900] text-[#111827]">150 000</h3>
                    <p className="text-[19.2px] text-center text-[#111827] font-medium">Leitud toetuste <br /> kogusumma (€).</p>
                  </div>

                  {/* Kokkuhoitud aeg */}
                  <div className="text-center md:col-span-1 w-full max-w-[380px] p-[20px] rounded-[10px] shadow-[4px_6px_10px] shadow-[#059669]/20">
                  <h3 className="text-[38.16px] text-center font-[900] text-[#111827]">316</h3>

                    <p className="text-[19.2px] text-center text-[#111827] font-medium">Kokkuhoitud aeg <br />(tundides).</p>
                  </div>

                  {/* Läbivaadatud toetused */}
                  <div className="text-center md:col-span-1 w-full max-w-[380px] p-[20px] rounded-[10px] shadow-[4px_6px_10px] shadow-[#059669]/20">
                  <h3 className="text-[38.16px] text-center font-[900] text-[#111827]">350</h3>
                    <p className="text-[19.2px] text-center text-[#111827] font-medium">Läbivaadatud <br /> toetuste arv (tk).</p>
                  </div>

                  {/* Läbitöötatud materjalid */}
                  <div className="text-center md:col-span-1 w-full max-w-[380px] p-[20px] rounded-[10px] shadow-[4px_6px_10px] shadow-[#059669]/20">
                  <h3 className="text-[38.16px] text-center font-[900] text-[#111827]">136</h3>

                    <p className="text-[19.2px] text-center text-[#111827] font-medium">A4 jagu läbitöötatud <br /> materjale.</p>
                  </div>
                </div>
              </div>

              {/* Grants Section */}
              <div className="space-y-6 bg-white p-8 rounded-lg  border border-[#059669]/20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <h2 className="text-[23.04px] font-[500] text-[#1A1C22]">
                     <span className=" font-[900] text-[#008834]">LEVEL TWO SOLUTIONS OÜ</span> sobivad toetused <span className="font-[900] text-[#008834]">(27tk)</span>
                    </h2>
                  </div>
                </div>

                {/* Limited Info Banner */}
                <Card className="p-8 bg-[#ECFDF5] border border-[#059669]/20 rounded-lg">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center space-x-4 ">
                      <LockIcon className="h-8 w-8 text-[#059669] mr-4" />
                      <div className="space-y-2">
                        <h3 className="text-[23.04px] font-[700] text-[#111827]">
                          Allpool näed piiratud infoga raportit!
                        </h3>
                        <p className="text-[#111827] text-[16px]">
                          Osta täisraport ja saa ligipääs detailsele ülevaatele. <span className="text-[#059669] font-semibold hover:underline underline cursor-pointer">Mida sisaldab täisraport?</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4">
                      <Button 
                        variant="outline"
                        className=" text-[19.2px] bg-white text-black border border-[#008834]/20 p-4 hover:border-[#008834] hover:bg-white hover:text-[#008834] "
                      >
                        Vaata demo
                      </Button>
                      
                  <Button className="bg-[#059669] text-white px-6 py-2 text-[19.2px] rounded hover:bg-[#047257]">
                      
                        Osta täisraport 35€
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Grants Table */}
                <GrantsTable grants={demoGrants} />
              </div>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
      </div>
    </>
  )
}


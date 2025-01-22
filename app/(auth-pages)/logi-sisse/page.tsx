'use client'

import dynamic from 'next/dynamic'
import Header from "@/components/header"
import MobileHeader from "@/components/mobileheader"
import Footer from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

// Dünaamiline import LoginForm komponendile
const LoginForm = dynamic(() => import("@/components/user_auth_components/login"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-[#00884B]">Laadime...</p>
      </div>
    </div>
  )
})

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#ECFDF5] to-white m-5 rounded-lg">
      <Header />
      <MobileHeader />
      
      <main className="flex-1 max-w-[1200px] mx-auto w-full py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-6 text-center mb-10"
        >
          <Badge 
            variant="outline" 
            className="w-fit text-[#00884B] leading-[0px] border-[#00884B] text-[16px] font-[600]"
          >
            LOGI SISSE
          </Badge>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-[900] text-[#111827]">
              Tere tulemast tagasi!
            </h1>
            <p className="text-[19.2px] text-[#111827]">
              Logi sisse, et jätkata oma ettevõtte toetuste otsimist
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="max-w-[500px] mx-auto">
            <div className="bg-white p-8 rounded-lg border border-[#059669]/20 shadow-[4px_6px_10px] shadow-[#059669]/20">
              <LoginForm />
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
"use client"

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import CancelSubscriptionModal from '@/components/cancel-subscription-modal'

interface Teavitus {
  id: string
  user_id: string
  stripe_subscription_id: string
  created_at: string
  status: string
  company_registry_code: number
  company_name: string
  payment_status: string
  last_analysis_date: string
  next_analysis_date: string
  cancelled_at: string | null
}

export default function MinuTeavitusedPage() {
  const [teavitused, setTeavitused] = useState<Teavitus[]>([])
  const [loading, setLoading] = useState(true)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedTeavitus, setSelectedTeavitus] = useState<Teavitus | null>(null)
  const supabase = createClientComponentClient()

  const handleCancelSubscription = async () => {
    if (!selectedTeavitus) return

    try {
      const { error } = await supabase
        .from('teavituste_tellimused')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', selectedTeavitus.id)

      if (error) throw error

      setTeavitused(teavitused.map(t => 
        t.id === selectedTeavitus.id 
          ? { ...t, status: 'cancelled', cancelled_at: new Date().toISOString() }
          : t
      ))

      setShowCancelModal(false)
      setSelectedTeavitus(null)
    } catch (error) {
      console.error('Viga teavituse tühistamisel:', error)
    }
  }

  useEffect(() => {
    const fetchTeavitused = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user?.id) {
        const { data: teavitusedData, error } = await supabase
          .from('teavituste_tellimused')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('payment_status', 'paid')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Viga teavituste laadimisel:', error)
        } else {
          setTeavitused(teavitusedData || [])
        }
      }
      
      setLoading(false)
    }

    fetchTeavitused()
  }, [supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[#00884B]">Laadime...</p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(to bottom, #ECFDF5 0%, white 100%)"
      }}
    >
      <Header />
      <main className="flex-1">
        <div className="max-w-[1200px] mx-auto py-8">
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
              MINU TEAVITUSED
            </Badge>
            <h1 className="text-3xl font-[900] text-[#111827]">
              Sinu aktiivsed teavituste tellimused
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {teavitused.length === 0 ? (
              <div className="text-center text-[#4B5563] py-10 bg-white rounded-lg border border-[#059669]/20">
                Sul pole veel ühtegi aktiivset teavituste tellimust.
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-[#059669]/20 shadow-sm overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#ECFDF5]">
                      <TableHead className="text-[#111827] font-semibold">Ettevõte</TableHead>
                      <TableHead className="text-[#111827] font-semibold">Registrikood</TableHead>
                      <TableHead className="text-[#111827] font-semibold">Viimane analüüs</TableHead>
                      <TableHead className="text-[#111827] font-semibold">Järgmine analüüs</TableHead>
                      <TableHead className="text-[#111827] font-semibold">Staatus</TableHead>
                      <TableHead className="text-[#111827] font-semibold">Tegevused</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teavitused.map((teavitus) => (
                      <TableRow key={teavitus.id} className="hover:bg-[#ECFDF5]/50 border-b border-[#059669]/20">
                        <TableCell className="font-medium text-[#111827]">
                          {teavitus.company_name}
                        </TableCell>
                        <TableCell className="font-mono text-[#4B5563]">
                          {teavitus.company_registry_code}
                        </TableCell>
                        <TableCell>
                          {teavitus.last_analysis_date ? 
                            format(new Date(teavitus.last_analysis_date), 'dd.MM.yyyy') : 
                            '-'
                          }
                        </TableCell>
                        <TableCell>
                          {teavitus.next_analysis_date ? 
                            format(new Date(teavitus.next_analysis_date), 'dd.MM.yyyy') : 
                            '-'
                          }
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            teavitus.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' :
                            teavitus.status === 'cancelled' ? 'bg-red-100 text-red-700 border-red-200' :
                            'bg-gray-100 text-gray-700 border-gray-200'
                          }>
                            {teavitus.status === 'active' ? 'Aktiivne' :
                             teavitus.status === 'cancelled' ? 'Tühistatud' :
                             teavitus.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {teavitus.status === 'active' && (
                            <Button
                              variant="outline"
                              className="border-red-500 text-red-500 hover:bg-red-50"
                              onClick={() => {
                                setSelectedTeavitus(teavitus)
                                setShowCancelModal(true)
                              }}
                            >
                              Katkesta teavitus
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />

      {showCancelModal && selectedTeavitus && (
        <CancelSubscriptionModal
          isOpen={showCancelModal}
          onClose={() => {
            setShowCancelModal(false)
            setSelectedTeavitus(null)
          }}
          onConfirm={handleCancelSubscription}
          subscriptionEndDate={null}
        />
      )}
    </div>
  )
}

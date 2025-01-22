'use client'

import { motion } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Check, Loader2, AlertCircle } from 'lucide-react'

interface LoadingModalProps {
  isOpen: boolean
}

const steps = [
  "Kogun andmeid kokku",
  "Analüüsin ettevõtte profiili",
  "Otsin sobivaid toetusi",
  "Hindan sobivust",
  "Koostan raportit",
  "Analüüs valmis, suunan edasi"
]

export default function LoadingModal({
  isOpen
}: LoadingModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="space-y-4 px-6 pt-6">
            <div className="text-left">
            <DialogTitle className="text-xl">
         
                <motion.span
                  animate={{ opacity: [1, 0.8, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  Analüüsime toetusi...
                </motion.span>
                </DialogTitle>
           
              <p className="text-sm text-[#41444C] mt-1">
              Otsime Sinu ettevõttele sobivaid toetusi.
              </p>
            </div>
          </div>
        </DialogHeader>

        <Separator className="bg-gray-200" />
        
        <div className="space-y-4 px-6">
          {steps.map((step, index) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 1.2,
                duration: 0.3,
                ease: "easeOut"
              }}
              className="flex items-center gap-3"
            >
              <div className="flex-shrink-0 w-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{
                    scale: 1,
                    transition: { delay: index * 1.2 + 1, duration: 0.2 }
                  }}
                >
                  {index === steps.length - 1 ? (
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [1, 0.8, 1],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Loader2 className="h-5 w-5 text-[#008834] animate-spin" />
                    </motion.div>
                  ) : (
                    <motion.div
                      className="rounded-full bg-[#008834]/10 p-1.5"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                      }}
                      transition={{ 
                        delay: index * 1.2 + 0.8, 
                        duration: 0.4,
                        type: "spring",
                        stiffness: 200,
                        damping: 20
                      }}
                    >
                      <Check className="h-4 w-4 text-[#008834] stroke-[2.5]" />
                    </motion.div>
                  )}
                </motion.div>
              </div>
              <span className="text-sm text-[#41444C]">{step}</span>
            </motion.div>
          ))}
        </div>

        <Separator className="bg-gray-200" />

        <div className="px-6 pb-6">
          <div className="bg-[#008834]/5 rounded-lg p-4 border border-[#008834]/10">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-[#008834]/10 p-1.5">
                <AlertCircle className="h-4 w-4 text-[#008834]" />
              </div>
              <p className="text-sm font-medium text-[#008834] text-[16px]">
                See võib võtta mõne minuti.<br />
                Palun ära sulge akent!
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


'use client'

import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface DemoPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function DemoPopup({ isOpen, onClose }: DemoPopupProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80"
        >
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-white/95 p-4 sm:p-6 md:p-12"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="w-full max-w-6xl space-y-8 pt-12">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900">Demo versioon</h2>
                <p className="mt-2 text-lg text-gray-600">
                  Siin näed, kuidas täisversioon välja näeb
                </p>
              </div>

              {/* Siia saab hiljem lisada demo sisu */}
              <div className="rounded-lg border border-gray-200 bg-white p-8">
                <p className="text-gray-600">Demo sisu tuleb siia...</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 
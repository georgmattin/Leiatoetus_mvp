'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import confetti from 'canvas-confetti'

interface ReactivateSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  subscriptionEndDate: string | null;
}

export default function ReactivateSubscriptionModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  subscriptionEndDate 
}: ReactivateSubscriptionModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      // Näita edukat aktiveerimist
      setShowSuccess(true)
      // Käivita confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
      // Sulge modal peale väikest viivitust
      setTimeout(() => {
        setShowSuccess(false)
        onClose()
      }, 2000)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null;

  const getFormattedDate = () => {
    try {
      if (!subscriptionEndDate) return 'jooksva perioodi lõpus'
      const date = new Date(subscriptionEndDate)
      if (isNaN(date.getTime())) return 'jooksva perioodi lõpus'
      return format(date, 'dd.MM.yyyy')
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'jooksva perioodi lõpus'
    }
  }

  const formattedDate = getFormattedDate()

  return (
    <div className="fixed inset-0 z-50 bg-black/40 transition-all duration-300">
      {/* Success overlay */}
      {showSuccess && (
        <div className="absolute inset-0 bg-emerald-500/20 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 shadow-xl transform scale-110 transition-all duration-200">
            <h3 className="text-2xl font-bold text-emerald-600 mb-2">
              Teavitused edukalt aktiveeritud!
            </h3>
            <p className="text-gray-600">
              Sinu tellimus on nüüd aktiivne.
            </p>
          </div>
        </div>
      )}

      <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] p-6">
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="relative p-8">
            {/* Close Button */}
            <div className="absolute right-4 top-4">
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:text-gray-500"
                disabled={isLoading || showSuccess}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Title */}
            <h2 className="mb-4 text-2xl font-bold tracking-tight text-gray-900">
              Teavituste aktiveerimine
            </h2>

            {/* Description */}
            <div className="mb-8 space-y-4">
              <p className="text-base text-gray-600">
                Kas soovid teavitused uuesti aktiveerida?
              </p>
              <p className="text-base text-gray-600">
                Järgmine makse toimub{' '}
                <span className="font-medium text-gray-900">
                  {formattedDate}
                </span>.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleConfirm}
                disabled={isLoading || showSuccess}
                className="relative inline-flex items-center justify-center rounded-full bg-emerald-600 px-8 py-3 text-base font-semibold text-white transition-all hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    <span>Aktiveerimine...</span>
                  </>
                ) : (
                  'Aktiveeri teavitused'
                )}
              </button>
              <button
                onClick={onClose}
                disabled={isLoading || showSuccess}
                className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-8 py-3 text-base font-semibold text-gray-700 transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Tagasi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
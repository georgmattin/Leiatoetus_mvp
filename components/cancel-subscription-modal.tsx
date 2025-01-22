'use client'

import { Loader2, X } from 'lucide-react'
import { useState } from 'react'
import { format } from 'date-fns'

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  subscriptionEndDate: string | null;
}

export default function CancelSubscriptionModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  subscriptionEndDate 
}: CancelSubscriptionModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null;

  const getFormattedDate = () => {
    try {
      if (!subscriptionEndDate) return 'jooksva perioodi lõpuni'
      const date = new Date(subscriptionEndDate)
      if (isNaN(date.getTime())) return 'jooksva perioodi lõpuni'
      return format(date, 'dd.MM.yyyy')
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'jooksva perioodi lõpuni'
    }
  }

  const formattedDate = getFormattedDate()

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 transition-all duration-300"
    >
      <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] p-6">
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="relative p-8">
            {/* Close Button */}
            <div className="absolute right-4 top-4">
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Title */}
            <h2 className="mb-4 text-2xl font-bold tracking-tight text-gray-900">
              Teavituste tühistamine
            </h2>

            {/* Description */}
            <div className="mb-8 space-y-4">
              <p className="text-base text-gray-600">
                Oled kindel, et soovid teavitused tühistada?
              </p>
              <p className="text-base text-gray-600">
                Sinu tellimus jääb aktiivseks kuni{' '}
                <span className="font-medium text-gray-900">
                  {formattedDate}
                </span>
                , kuid seejärel see lõpetatakse.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="relative inline-flex items-center justify-center rounded-full bg-red-600 px-8 py-3 text-base font-semibold text-white transition-all hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    <span>Tühistamine...</span>
                  </>
                ) : (
                  'Tühista teavitused'
                )}
              </button>
              <button
                onClick={onClose}
                disabled={isLoading}
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
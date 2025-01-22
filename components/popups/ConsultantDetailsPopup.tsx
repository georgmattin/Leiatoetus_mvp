"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Building2, Users2, Star, Mail, Phone, Globe } from "lucide-react"

interface ConsultantDetailsPopupProps {
  consultant: {
    name: string
    location: string
    type: string
    experience: string
    successRate: string
    projectCount: string
    specialization: string[]
    recommended: boolean
    description: string
    contact: {
      email: string
      phone: string
      website: string
    }
  } | null
  isOpen: boolean
  onClose: () => void
}

export function ConsultantDetailsPopup({ consultant, isOpen, onClose }: ConsultantDetailsPopupProps) {
  if (!consultant) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[700px]">
        <DialogHeader>
          <div className="space-y-4 px-6 pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <DialogTitle className="text-xl font-bold text-[#111827]">
                  {consultant.name}
                </DialogTitle>
                {consultant.recommended && (
                  <Badge className="bg-[#00884B] text-white border-none">
                    Leiatoetus.ee soovitab
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <Separator className="bg-gray-200" />

        {/* ... (ülejäänud sisu) ... */}

        <div className="px-6 pb-6 pt-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="flex-1 bg-white hover:bg-[#ECFDF5] text-[#00884B] border-[#00884B]"
              onClick={() => window.location.href = `mailto:${consultant.contact.email}`}
            >
              <Mail className="h-4 w-4 mr-2" />
              Saada e-kiri
            </Button>
            <Button
              className="flex-1 bg-[#00884B] hover:bg-[#00884B]/90"
              onClick={() => window.location.href = `tel:${consultant.contact.phone}`}
            >
              <Phone className="h-4 w-4 mr-2" />
              Helista
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
'use client'

import { useState, useEffect } from "react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { AlertCircle } from 'lucide-react'

interface EmailPopupProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { email: string; acceptMarketing: boolean; userId: string }) => void
  registryCode: string
}

export default function EmailPopup({
  isOpen,
  onClose,
  onSubmit,
  registryCode
}: EmailPopupProps) {
  const [email, setEmail] = useState("")
  const [acceptMarketing, setAcceptMarketing] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [existingUser, setExistingUser] = useState<{ id: string, email: string } | null>(null)
  const supabase = createClientComponentClient()

  // Kontrolli kas kasutaja on olemas kui email muutub
  useEffect(() => {
    const checkExistingUser = async () => {
      if (!email || !email.includes('@')) return

      const { data, error } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', email.toLowerCase())
        .single()

      if (error) {
        console.error('Error checking user:', error)
        return
      }

      setExistingUser(data)
    }

    const debounceTimer = setTimeout(checkExistingUser, 500)
    return () => clearTimeout(debounceTimer)
  }, [email, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (existingUser) {
        // Kui kasutaja on olemas, saada ainult sisselogimise link
        const { error } = await supabase.auth.signInWithOtp({
          email,
        })
        if (error) throw error
        toast.success("Sisselogimise link on saadetud teie e-postile")
        onClose()
        return
      }

      // Uue kasutaja loomine
      const { data: { user }, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          data: {
            acceptMarketing,
            registryCode
          }
        }
      })

      if (error) {
        toast.error("Viga kasutaja loomisel. Palun proovi uuesti.")
        return
      }

      if (user) {
        onSubmit({ 
          email, 
          acceptMarketing,
          userId: user.id
        })
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error("Midagi läks valesti. Palun proovi uuesti.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="space-y-4 px-6 pt-6">
            <div className="text-left">
              <DialogTitle className="text-xl">
                Sisesta oma e-posti aadress
              </DialogTitle>
              <p className="text-sm text-[#41444C] mt-1">
                Saadame kinnituse koos tulemustega Sinu e-posti aadressile.
              </p>
            </div>
          </div>
        </DialogHeader>

        <Separator className="bg-gray-200" />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="px-6">
            <p className="text-sm text-black mb-2 font-medium">
              E-post
            </p>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nimi@näide.ee"
              required
              disabled={isLoading}
              className="py-2 border border-gray-200 rounded text-[19.2px] text-[#133248] focus:outline-none focus:ring-2 focus:ring-[#fff]"
            />
            
            {existingUser && (
              <div className="mt-2 flex items-start gap-2 text-[#4383D7]">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  Selle e-postiga kasutaja on juba olemas.{' '}
                  <button 
                    type="submit"
                    className="text-[#4383D7] font-medium hover:underline focus:outline-none"
                  >
                    Logi sisse
                  </button>
                </p>
              </div>
            )}
          </div>

          {!existingUser && (
            <div className="flex items-start px-6">
              <Checkbox
                id="marketing"
                checked={acceptMarketing}
                onCheckedChange={(checked) => setAcceptMarketing(checked as boolean)}
                disabled={isLoading}
                className="mr-4 mt-[3px] text-[#4383D7] data-[state=checked]:bg-[#4383D7] border-[#4383D7]"
              />
              <Label 
                htmlFor="marketing" 
                className="text-sm leading-tight text-[#41444C]/70"
              >
                Lisaks uutele pakkumistele, soovin saada analüüsi tulemuste kohta ka edaspidi infot meilile.
              </Label>
            </div>
          )}

          <Separator className="bg-gray-200" />
          
          <div className="px-6 pb-6">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#3F5DB9] text-white px-7 py-2 text-[16px] rounded hover:bg-[#2C468C]"
            >
              {isLoading 
                ? 'Saadame lingi...' 
                : existingUser 
                  ? 'Logi sisse'
                  : 'Alusta analüüsi'
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


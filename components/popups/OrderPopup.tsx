"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { useState, useEffect } from "react"
import { Separator } from "@/components/ui/separator"
import axios from 'axios'
import debounce from 'lodash/debounce'
import { useAuth } from "@/hooks/useAuth"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

interface Company {
  evnimi: string
  ariregistri_kood: string
  evaadressid: {
    aadress_ads__ads_normaliseeritud_taisaadress: string
  }
}

interface OrderPopupProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (formData: OrderFormData) => void
  companyData?: {
    name: string
    registryCode: string
  }
}

interface OrderFormData {
  firstName: string
  lastName: string
  email: string
  invoiceType: 'private' | 'company'
  companyName?: string
  companyAddress?: string
  termsAccepted: boolean
}

export function OrderPopup({ isOpen, onClose, onConfirm, companyData }: OrderPopupProps) {
  const { user } = useAuth()
  const supabase = createClientComponentClient()
  const [formData, setFormData] = useState<OrderFormData>({
    firstName: '',
    lastName: '',
    email: '',
    invoiceType: 'private',
    termsAccepted: false
  })
  const [searchResults, setSearchResults] = useState<Company[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const loadUserProfile = async () => {
      if (user?.email) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('eesnimi, perenimi')
          .eq('email', user.email)
          .single()

        if (error) {
          console.error('Viga profiili laadimisel:', error)
          return
        }

        if (profile) {
          setFormData(prev => ({
            ...prev,
            firstName: profile.eesnimi || '',
            lastName: profile.perenimi || '',
            email: user.email || ''
          }))
        }
      }
    }

    if (isOpen) {
      loadUserProfile()
    }
  }, [isOpen, user, supabase])

  const searchCompany = async (query: string) => {
    if (!query || query.length < 3) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await axios.post('/api/company-search', { query })
      setSearchResults(response.data)
    } catch (error) {
      console.error('Viga ettevõtte otsingul:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const debouncedSearch = debounce(searchCompany, 300)

  const handleCompanySelect = (company: Company) => {
    setFormData({
      ...formData,
      companyName: company.evnimi,
      companyAddress: company.evaadressid?.aadress_ads__ads_normaliseeritud_taisaadress || ''
    })
    setSearchResults([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const searchParams = new URLSearchParams(window.location.search)
      const orderId = searchParams.get('order_id')
      
      if (!orderId) {
        throw new Error('Tellimuse ID puudub')
      }

      // Teisendame invoiceType väärtuse õigeks arve_saaja väärtuseks
      const arve_saaja = formData.invoiceType === 'private' ? 'eraisik' : 'firma'

      // Uuendame one_time_orders tabelit enne makse alustamist
      const { error: updateError } = await supabase
        .from('one_time_orders')
        .update({
          arve_saaja: arve_saaja,
          arve_saaja_juriidiline_aadress: formData.invoiceType === 'company' ? formData.companyAddress : null,
          tellija_eesnimi: formData.firstName,
          tellija_perenimi: formData.lastName,
          tellija_epost: formData.email,
          tellija_firma: formData.invoiceType === 'company' ? formData.companyName : null,
        })
        .eq('id', orderId)
        .eq('user_id', user?.id)

      if (updateError) {
        console.error('Update error:', updateError)
        throw new Error('Tellimuse andmete uuendamine ebaõnnestus')
      }

      // Kontrollime olemasolevat ostu
      const { data: existingPurchase, error: purchaseError } = await supabase
        .from('report_purchases')
        .select('*')
        .eq('registry_code', companyData?.registryCode)
        .single()

      if (existingPurchase) {
        setError('Selle registrikoodi analüüsi eest on juba makstud. Palun kontrollige oma tellimusi.')
        return
      }

      // Teeme makse päringu
      const response = await fetch('/api/createOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData,
          orderId,
          registryCode: companyData?.registryCode
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.details === 'ALREADY_PAID_FOR') {
          throw new Error('Selle registrikoodi analüüsi eest on juba makstud. Palun kontrollige oma tellimusi.')
        } else {
          throw new Error(data.details || 'Makse alustamine ebaõnnestus')
        }
      }

      // Kui kõik õnnestus, suuname kasutaja maksma
      window.location.href = data.paymentUrl
    } catch (error: any) {
      console.error('Makse viga:', error)
      setError(error.message || 'Makse alustamine ebaõnnestus. Palun proovige hiljem uuesti.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[600px] p-0">
        <DialogHeader className="px-6 pt-6">
          <div className="space-y-2">
            <DialogTitle className="text-2xl font-bold text-[#111827]">
              Täisraporti tellimine
            </DialogTitle>
            <p className="text-[#4B5563]">
              Täida vorm ja liigu edasi maksma
            </p>
          </div>
        </DialogHeader>

        <Separator className="bg-[#E5E7EB]" />

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-[#111827]">Eesnimi</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    required
                    className="border-[#00884B]/20 focus:border-[#00884B] focus:ring-[#00884B]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-[#111827]">Perekonnanimi</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    required
                    className="border-[#00884B]/20 focus:border-[#00884B] focus:ring-[#00884B]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#111827]">E-posti aadress</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nimi@näide.ee"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  className="border-[#00884B]/20 focus:border-[#00884B] focus:ring-[#00884B]"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-[#111827] font-medium">Arve saaja</Label>
                <RadioGroup
                  value={formData.invoiceType}
                  onValueChange={(value: 'private' | 'company') => 
                    setFormData({
                      ...formData,
                      invoiceType: value,
                      companyName: value === 'company' ? companyData?.name : undefined,
                      companyAddress: value === 'company' ? companyData?.registryCode : undefined
                    })
                  }
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="private" id="private" />
                    <Label htmlFor="private" className="text-[#4B5563]">Eraisik</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="company" id="company" />
                    <Label htmlFor="company" className="text-[#4B5563]">Ostan ettevõtte nimele</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.invoiceType === 'company' && (
                <div className="space-y-4 border border-[#00884B]/20 rounded-lg p-4 bg-[#ECFDF5]/50">
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-[#111827]">Ettevõtte nimi</Label>
                    <div className="relative">
                      <Input
                        id="companyName"
                        value={formData.companyName || ''}
                        onChange={(e) => {
                          setFormData({...formData, companyName: e.target.value})
                          debouncedSearch(e.target.value)
                        }}
                        required
                        className="border-[#00884B]/20 focus:border-[#00884B] focus:ring-[#00884B]"
                      />
                      {isSearching && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin h-4 w-4 border-2 border-[#00884B]/20 border-t-[#00884B] rounded-full" />
                        </div>
                      )}
                      {searchResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-[#00884B]/20 rounded-md shadow-lg">
                          {searchResults.map((company) => (
                            <button
                              key={company.ariregistri_kood}
                              type="button"
                              className="w-full px-4 py-2 text-left hover:bg-[#ECFDF5] focus:outline-none"
                              onClick={() => handleCompanySelect(company)}
                            >
                              <div className="font-medium">{company.evnimi}</div>
                              <div className="text-sm text-[#4B5563]">
                                {company.evaadressid?.aadress_ads__ads_normaliseeritud_taisaadress}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyAddress" className="text-[#111827]">Aadress</Label>
                    <Input
                      id="companyAddress"
                      value={formData.companyAddress || ''}
                      onChange={(e) => setFormData({...formData, companyAddress: e.target.value})}
                      required
                      className="border-[#00884B]/20 focus:border-[#00884B] focus:ring-[#00884B]"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={formData.termsAccepted}
                onCheckedChange={(checked) => 
                  setFormData({...formData, termsAccepted: checked as boolean})
                }
                required
              />
              <Label htmlFor="terms" className="text-sm text-[#4B5563]">
                Nõustun <a href="/kasutustingimused" className="text-[#00884B] hover:underline" target="_blank">kasutustingimustega</a>
              </Label>
            </div>
          </div>

          <Separator className="my-6 bg-[#E5E7EB]" />

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-[#00884B] text-[#00884B] hover:bg-[#ECFDF5]"
              disabled={isSubmitting}
            >
              Tühista tellimus
            </Button>
            <Button
              type="submit"
              className="bg-[#00884B] hover:bg-[#00884B]/90 text-white"
              disabled={!formData.termsAccepted || isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Ootan vastust...
                </div>
              ) : (
                'Liigu edasi maksma'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
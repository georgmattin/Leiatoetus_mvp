'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { CheckCircle2 } from 'lucide-react'
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/unustasin-parooli/loo-uus-parool`,
      })

      if (error) throw error

      setIsSuccess(true)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Parooli taastamine ebaõnnestus')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-[#14213D]">Taasta parool</h1>
            <p className="text-base text-muted-foreground">
              Sisesta oma e-posti aadress ja saadame sulle parooli taastamise lingi
            </p>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-post</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nimi@näide.ee"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 text-base"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium bg-[#3B5FE5] hover:bg-[#2C4BD6] transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Saadan...' : 'Saada taastamise link'}
              </Button>
              <div className="text-center">
                <Link 
                  href="/logi-sisse" 
                  className="text-[#3B5FE5] hover:underline font-medium text-base"
                >
                  Tagasi sisselogimise lehele
                </Link>
              </div>
            </form>
          ) : (
            <div className="flex items-center gap-2 text-green-600 text-base bg-green-50 p-4 rounded-md">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <p>Saatsime sulle e-kirja! Palun kontrolli oma postkasti ja järgi seal olevaid juhiseid parooli taastamiseks.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 
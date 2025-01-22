'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { CheckCircle2 } from 'lucide-react'
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"

export default function RegisterForm() {
  const [email, setEmail] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | JSX.Element | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Kontrollime esmalt, kas kasutaja juba eksisteerib
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()

      if (existingUser) {
        setError(
          <span>
            See e-posti aadress on juba registreeritud.{' '}
            <Link href="/logi-sisse" className="text-[#3B5FE5] hover:underline font-medium">
              Logi sisse
            </Link>
            {' '}või{' '}
            <Link href="/unustasin-parooli" className="text-[#3B5FE5] hover:underline font-medium">
              taasta parool
            </Link>
          </span>
        )
        setIsLoading(false)
        return
      }

      // Kui kasutajat pole, jätkame registreerimisega
      const tempPassword = Array(16)
        .fill(0)
        .map(() => Math.random().toString(36).charAt(2))
        .join('')

      const { data, error } = await supabase.auth.signUp({
        email,
        password: tempPassword,
        options: {
          emailRedirectTo: 'http://localhost:3002/loo-parool',
          data: {
            registration_completed: false
          }
        }
      })

      if (error) {
        console.error('Signup error details:', error)
        throw error
      }

      if (!data.user) {
        throw new Error('Kasutaja loomine ebaõnnestus. Palun proovi uuesti.')
      }

      setIsSuccess(true)
    } catch (error) {
      console.error('Registration error:', error)
      setError(error instanceof Error ? error.message : 'Registreerimine ebaõnnestus')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-[#14213D]">Loo konto</h1>
            <p className="text-base text-muted-foreground">
              Sul juba on konto olemas?{' '}
              <Link href="/logi-sisse" className="text-[#3B5FE5] hover:underline font-medium">
                Logi sisse
              </Link>
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
                {isLoading ? 'Saadan...' : 'Loo konto'}
              </Button>
            </form>
          ) : (
            <div className="flex items-center gap-2 text-green-600 text-base bg-green-50 p-4 rounded-md">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <p>Saatsime sulle e-kirja! Palun kontrolli oma postkasti ja kliki seal sisalduvale lingile konto aktiveerimiseks.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 
'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { supabase } from "@/lib/supabaseClient"

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Tõlgime Supabase vead eesti keelde
        switch (error.message) {
          case 'Invalid login credentials':
            throw new Error('Vale e-post või parool')
          case 'Email not confirmed':
            throw new Error('E-post pole kinnitatud')
          default:
            throw new Error(error.message)
        }
      }

      if (data?.user) {
        if (onLoginSuccess) {
          onLoginSuccess() // Kutsu callback välja eduka sisselogimise korral
        } else {
          router.push('/minu-konto')
          router.refresh()
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Sisselogimine ebaõnnestus')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-[#14213D]">Logi sisse</h1>
            <p className="text-base text-muted-foreground">
              Sul pole veel kontot?{' '}
              <Link href="/loo-konto" className="text-[#3B5FE5] hover:underline font-medium">
                Loo konto
              </Link>
            </p>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
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
                disabled={loading}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Parool</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 text-base"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium bg-[#3B5FE5] hover:bg-[#2C4BD6] transition-colors"
              disabled={loading}
            >
              {loading ? 'Sisselogimine...' : 'Logi sisse'}
            </Button>
          </form>
          <div>
            <Link 
              href="/unustasin-parooli"
              className="text-[#3B5FE5] hover:underline font-medium text-base inline-flex"
            >
              Unustasid parooli? Taasta parool
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 
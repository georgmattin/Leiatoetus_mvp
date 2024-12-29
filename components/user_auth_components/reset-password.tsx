'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { CheckCircle2 } from 'lucide-react'
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { supabase } from "@/lib/supabaseClient"

export default function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Paroolid ei kattu')
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Parool peab olema vähemalt 8 tähemärki pikk')
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      setIsSuccess(true)
      setTimeout(() => {
        router.push('/logi-sisse')
      }, 2000)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Parooli uuendamine ebaõnnestus')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-[#14213D]">Loo uus parool</h1>
            <p className="text-base text-muted-foreground">
              Sisesta oma uus parool
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
                <Label htmlFor="password">Uus parool</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 text-base"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Kinnita uus parool</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-12 text-base"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium bg-[#3B5FE5] hover:bg-[#2C4BD6] transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Salvestan...' : 'Salvesta uus parool'}
              </Button>
            </form>
          ) : (
            <div className="flex items-center gap-2 text-green-600 text-base bg-green-50 p-4 rounded-md">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <p>Parool on edukalt uuendatud! Suuname sind sisselogimise lehele...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 
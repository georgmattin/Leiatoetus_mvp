'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { CheckCircle2 } from 'lucide-react'
import Link from "next/link"

export default function RegisterForm() {
  const [email, setEmail] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Add your registration logic here
    console.log('Registration attempt with:', email)
    setIsSuccess(true)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-[#14213D]">Loo konto</h1>
            <p className="text-base text-muted-foreground">
              Sul juba on konto olemas?{' '}
              <Link href="/login" className="text-[#3B5FE5] hover:underline font-medium">
                Logi sisse
              </Link>
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="sr-only">E-post</Label>
              <Input
                id="email"
                type="email"
                placeholder="Sisesta e-post"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 text-base"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium bg-[#3B5FE5] hover:bg-[#2C4BD6] transition-colors"
            >
              Loo konto
            </Button>
          </form>
          {isSuccess && (
            <div className="flex items-center gap-2 text-green-600 text-base">
              <CheckCircle2 className="h-5 w-5" />
              <p>Konto loomine õnnestus! Kontrolli oma e-posti.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


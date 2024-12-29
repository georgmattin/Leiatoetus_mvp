'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { CheckCircle2 } from 'lucide-react'
import Link from "next/link"

export default function CreatePassword() {
  const [passwords, setPasswords] = useState({
    password: '',
    confirmPassword: ''
  })
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (passwords.password !== passwords.confirmPassword) {
      setError('Paroolid ei ühti')
      return
    }

    // Add your password creation logic here
    console.log('Creating password:', passwords.password)
    setIsSuccess(true)
  }

  const handlePasswordChange = (field: 'password' | 'confirmPassword', value: string) => {
    setPasswords(prev => ({
      ...prev,
      [field]: value
    }))
    setError('')
  }

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <p className="text-base">Parooli loomine õnnestus!{' '}
                <Link href="/login" className="text-[#3B5FE5] hover:underline font-medium">
                  Logi sisse
                </Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#14213D]">Loo parool</h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="sr-only">Parool</Label>
              <Input
                id="password"
                type="password"
                placeholder="Sisesta parool"
                value={passwords.password}
                onChange={(e) => handlePasswordChange('password', e.target.value)}
                required
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="sr-only">Kinnita parool</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Sisesta parool uuesti"
                value={passwords.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                required
                className="h-12 text-base"
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium bg-[#3B5FE5] hover:bg-[#2C4BD6] transition-colors"
            >
              Loo parool
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}


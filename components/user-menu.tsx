"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { ChevronDown, FileText, Bell, Receipt, UserCircle2, Settings } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface UserProfile {
  eesnimi: string
  perenimi: string
}

export function UserMenu() {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.email) {
        const { data, error } = await supabase
          .from('profiles')
          .select('eesnimi, perenimi')
          .eq('email', user.email)
          .single()

        if (error) {
          console.error('Error fetching profile:', error)
          return
        }

        if (data) {
          setProfile(data)
        }
      }
    }

    fetchProfile()
  }, [user, supabase])

  const getDisplayName = () => {
    if (profile?.eesnimi && profile?.perenimi) {
      return `${profile.eesnimi} ${profile.perenimi}`
    }
    return user?.email // Fallback emailile kui nime ei leita
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <UserCircle2 className="h-5 w-5 text-gray-600" />
          {getDisplayName()}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Minu konto</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href="/kasutaja">
          <DropdownMenuItem className="cursor-pointer">
            <UserCircle2 className="mr-2 h-4 w-4" />
            Minu konto
          </DropdownMenuItem>
        </Link>
        <Link href="/kasutaja/minu-raportid">
          <DropdownMenuItem className="cursor-pointer">
            <FileText className="mr-2 h-4 w-4" />
            Minu raportid
          </DropdownMenuItem>
        </Link>
        <Link href="/kasutaja/minu-teavitused">
          <DropdownMenuItem className="cursor-pointer">
            <Bell className="mr-2 h-4 w-4" />
            Minu teavitused
          </DropdownMenuItem>
        </Link>
        <Link href="/kasutaja/minu-arved">
          <DropdownMenuItem className="cursor-pointer">
            <Receipt className="mr-2 h-4 w-4" />
            Minu arved
          </DropdownMenuItem>
        </Link>
        <Link href="/kasutaja/minu-seadistused">
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Sätted
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer text-red-600" onClick={signOut}>
          Logi välja
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 
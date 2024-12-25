"use client";

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signInAction } from "@/app/actions"
import { FormMessage } from "@/components/form-message"

interface LoginFormProps {
  message?: Message;
}

export function LoginForm({ message }: LoginFormProps) {
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Logi sisse</CardTitle>
        <CardDescription>
          Sisesta oma e-posti aadress, et kontole sisse logida
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={signInAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">E-post</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="nimi@näide.ee"
              required
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Parool</Label>
              <Link href="#" className="ml-auto inline-block text-sm underline">
                Unustasid parooli?
              </Link>
            </div>
            <Input id="password" name="password" type="password" required />
          </div>
          <FormMessage message={message} />
          <Button type="submit" className="w-full">
            Logi sisse
          </Button>
          <div className="mt-4 text-center text-sm">
            Pole veel kontot?{" "}
            <Link href="/sign-up" className="underline">
              Registreeru
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

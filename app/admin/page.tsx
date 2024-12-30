'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Try to sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      })

      if (signInError) {
        console.error('Sign in error:', signInError)
        setError('Invalid email or password')
        return
      }

      if (!signInData.user) {
        setError('Login failed')
        return
      }

      // Get user metadata to check if super admin
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error('Failed to get user details:', userError)
        await supabase.auth.signOut()
        setError('Failed to verify admin status')
        return
      }

      // Check if user is super admin
      if (!user.app_metadata?.is_super_admin) {
        console.error('Not a super admin user')
        await supabase.auth.signOut()
        setError('Unauthorized access')
        return
      }

      // Navigate to admin panel
      router.push('/admin-grants-panel')
      router.refresh()
      
    } catch (err) {
      console.error('Login error:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F6F9FC] animate-fadeIn">
      <div className="mb-8 hover:scale-105 transition-transform duration-300">
        <Image 
          src="/logo.png"
          alt="Leiatoetus.ee logo"
          width={200}
          height={48}
          priority
          className="drop-shadow-lg"
        />
      </div>
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md backdrop-blur-sm bg-white/90 transition-all duration-300 hover:shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800 animate-slideDown">
          Admin Login
        </h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" "
              className="peer w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3F5DB9] focus:border-transparent transition-all duration-300 bg-gray-50/50 placeholder-transparent"
              required
            />
            <label className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-gray-600 transition-all duration-300 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#3F5DB9]">
              Email
            </label>
          </div>

          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" "
              className="peer w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3F5DB9] focus:border-transparent transition-all duration-300 bg-gray-50/50 placeholder-transparent"
              required
            />
            <label className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-gray-600 transition-all duration-300 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#3F5DB9]">
              Password
            </label>
          </div>

          <button
            type="submit" 
            disabled={loading}
            className={`relative w-full py-4 px-4 rounded-lg font-bold text-white overflow-hidden transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
              loading 
                ? 'bg-blue-300 cursor-not-allowed' 
                : 'bg-[#3F5DB9] hover:bg-[#2C468C]'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Logging in...
              </div>
            ) : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
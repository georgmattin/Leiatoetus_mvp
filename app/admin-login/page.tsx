'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:5000/api/admin-login', {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer toetus_api_key'
        },
        body: JSON.stringify({
          email,
          password
        })
      })

      const data = await response.json()

      if (data.status === 'success') {
        // Store token and redirect
        localStorage.setItem('adminToken', data.access_token)
        window.location.href = '/admin-grants-panel'
      } else {
        setError(data.message || 'Login failed. Please check your credentials.')
      }
    } catch (err) {
      setError('Login failed. Please try again later.')
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

          {error && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4 animate-fadeIn">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/utils/supabase/client'
import { login, signup } from './actions'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const supabase = createSupabaseBrowserClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleAuth = async (action: 'login' | 'signup') => {
    setLoading(true)
    setMessage(null)

    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)
    formData.append('role', 'candidate')

    try {
      if (action === 'signup') {
        const result = await signup(formData)
        if (result?.error) {
          setMessage({ type: 'error', text: result.error })
        } else if (result?.success) {
          setMessage({ type: 'success', text: result.message || 'Check your email' })
          setEmail('')
          setPassword('')
        }
      } else {
        const result = await login(formData)
        if (result?.error) {
          setMessage({ type: 'error', text: result.error })
        }
      }
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFFBED] text-black font-sans selection:bg-[#FF3366] selection:text-white px-4 py-12 relative overflow-hidden">
      {/* Brutalist Grid Background */}
      <div className="pointer-events-none absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '40px 40px' }} />

      <Link href="/" className="absolute top-6 left-6 border-4 border-black bg-white px-4 py-2 font-black uppercase text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all z-10">
        &larr; BACK
      </Link>

      <div className="w-full max-w-xl border-8 border-black bg-[#00E5FF] p-8 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] relative z-10 animate-in fade-in zoom-in-95 slide-in-from-bottom-12 duration-700 hover:-translate-y-2 hover:shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] transition-all">
        <div className="mb-8 border-b-8 border-black pb-6 text-center">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-black/70 animate-pulse">Authin</p>
          <h1 className="mt-2 text-5xl font-black uppercase tracking-tight text-black hover:scale-105 transition-transform duration-300">ENTER <br/>THE ARENA</h1>
        </div>

        <div className="space-y-6">
          <div className="space-y-6 bg-white p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="space-y-2">
              <label className="text-xl font-black uppercase text-black">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-4 border-black bg-[#FFFBED] px-4 py-4 text-xl font-bold text-black outline-none transition focus:bg-[#EAFF00] shadow-inner"
                placeholder="YOU@EXAMPLE.COM"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xl font-black uppercase text-black">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-4 border-black bg-[#FFFBED] px-4 py-4 text-xl font-bold text-black outline-none transition focus:bg-[#EAFF00] shadow-inner"
                placeholder="••••••••"
              />
            </div>

            {message && (
              <div
                className={`border-4 border-black p-4 text-lg font-black uppercase ${message.type === 'success'
                  ? 'bg-[#EAFF00] text-black'
                  : 'bg-[#FF3366] text-white'
                  } shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}
              >
                {message.text}
              </div>
            )}

            <div className="flex flex-col gap-4 mt-8 pt-6 border-t-4 border-black">
              <button
                onClick={() => handleAuth('login')}
                disabled={loading}
                className="w-full border-4 border-black bg-black px-4 py-4 text-xl font-black uppercase text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1.5 hover:translate-y-1.5 transition-all disabled:opacity-50"
              >
                {loading ? 'PROCESSING...' : 'LOG IN'}
              </button>
              <button
                onClick={() => handleAuth('signup')}
                disabled={loading}
                className="w-full border-4 border-black bg-[#EAFF00] px-4 py-4 text-xl font-black uppercase text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1.5 hover:translate-y-1.5 transition-all disabled:opacity-50"
              >
                {loading ? 'PROCESSING...' : 'SIGN UP'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

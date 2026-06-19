'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/utils/supabase/client'
import { login, signup } from './actions'

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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-lg ring-1 ring-slate-100">
        <div className="mb-8 flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="text-center md:text-left">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Authin</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">Authentication</h1>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                placeholder="••••••••"
              />
            </div>

            {message && (
              <div
                className={`rounded-xl p-3 text-sm ${message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-rose-50 text-rose-600'
                  }`}
              >
                {message.text}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => handleAuth('login')}
                disabled={loading}
                className="flex-1 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                {loading ? 'Processing...' : 'Log In'}
              </button>
              <button
                onClick={() => handleAuth('signup')}
                disabled={loading}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:opacity-60"
              >
                {loading ? 'Processing...' : 'Sign Up'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


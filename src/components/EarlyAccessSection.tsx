import { useState } from 'react'
import { motion } from 'framer-motion'
import { C, VP, fadeUp } from '../lib/design'
import { PrimaryButton } from './ui'

const API_URL = import.meta.env.VITE_API_URL

export default function EarlyAccessSection() {
  const [name,      setName]      = useState('')
  const [email,     setEmail]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [success,   setSuccess]   = useState(false)
  const [error,     setError]     = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/api/waitlist/signup`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: name.trim(), email: email.trim() }),
      })
      if (!res.ok) throw new Error('Something went wrong')
      setSuccess(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-12 md:py-24" style={{ background: C.creamWarm }}>
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={VP}
        className="container mx-auto px-4 md:px-6 flex justify-center"
      >
        <div
          className="w-full max-w-lg rounded-2xl p-8 text-center"
          style={{ background: C.white, border: `1px solid ${C.border}`, boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
            style={{ background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`, color: '#fff' }}
          >
            🔒 Private Beta
          </div>

          <h2 className="text-2xl md:text-3xl font-bold mb-3 leading-tight" style={{ color: C.navy }}>
            Join the Private Beta
          </h2>
          <p className="text-sm md:text-base mb-6 leading-relaxed" style={{ color: C.textMid }}>
            We're rolling out access gradually. Drop your email and we'll invite you when your spot is ready.
          </p>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-3 py-4 px-5 rounded-xl text-base font-semibold"
              style={{ background: 'rgba(22,163,74,0.07)', border: '1.5px solid rgba(22,163,74,0.25)', color: '#16A34A' }}
            >
              <span>✓</span>
              <span>You're on the list! We'll be in touch.</span>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ background: C.cream, border: `1.5px solid ${C.border}`, color: C.navy }}
                onFocus={(e)  => (e.target.style.borderColor = C.orange)}
                onBlur={(e)   => (e.target.style.borderColor = C.border)}
              />
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ background: C.cream, border: `1.5px solid ${C.border}`, color: C.navy }}
                onFocus={(e)  => (e.target.style.borderColor = C.orange)}
                onBlur={(e)   => (e.target.style.borderColor = C.border)}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <PrimaryButton onClick={undefined} className="w-full">
                {loading ? 'Joining…' : 'Request Access →'}
              </PrimaryButton>
            </form>
          )}
        </div>
      </motion.div>
    </section>
  )
}

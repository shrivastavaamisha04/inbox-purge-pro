import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { C } from '../lib/design'

const API_URL = import.meta.env.VITE_API_URL

const CONFETTI_COLORS = ['#FF6B35', '#FF8C42', '#FFD166', '#06D6A0', '#118AB2', '#EF476F']

// Pre-computed so values are stable across renders
const CONFETTI_PIECES = Array.from({ length: 24 }, (_, i) => {
  const angle = (i / 24) * 360
  const dist  = 70 + (i * 41 % 70)
  return {
    x:     Math.cos((angle * Math.PI) / 180) * dist,
    y:     Math.sin((angle * Math.PI) / 180) * dist,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size:  6 + (i * 11 % 7),
    rot:   angle * 2.5,
  }
})

function Confetti() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {CONFETTI_PIECES.map((p, i) => (
        <motion.div
          key={i}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
          animate={{ x: p.x, y: p.y + 100, opacity: 0, scale: 0.4, rotate: p.rot }}
          transition={{ duration: 1.1, delay: i * 0.025, ease: 'easeOut' }}
          className="absolute rounded-sm"
          style={{
            left: '50%',
            top: '35%',
            width: p.size,
            height: p.size,
            marginLeft: -p.size / 2,
            background: p.color,
          }}
        />
      ))}
    </div>
  )
}

export default function WaitlistModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [submitted, setSubmitted] = useState(false)

  // ESC to close + lock scroll
  const handleKey = useCallback(
    (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() },
    [onClose],
  )
  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [open, handleKey])

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => setSubmitted(false), 400)
      return () => clearTimeout(t)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    await fetch(`${API_URL}/api/waitlist/signup`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name: data.get('name'), email: data.get('email') }),
    })
    setSubmitted(true)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.72)' }}
            onClick={onClose}
          />

          {/* Panel */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.90, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: 'spring', stiffness: 340, damping: 30 }}
              className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
              style={{ background: C.white }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Orange top stripe */}
              <div
                className="h-1.5"
                style={{ background: `linear-gradient(90deg, ${C.orange}, ${C.orangeLight})` }}
              />

              <div className="relative px-8 py-8">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-colors hover:opacity-60"
                  style={{ color: C.textMid, background: C.cream }}
                >
                  ✕
                </button>

                <AnimatePresence mode="wait">
                  {submitted ? (
                    /* ── Success ── */
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative text-center py-6"
                    >
                      <Confetti />
                      <div className="text-5xl mb-4">🎉</div>
                      <h3 className="text-2xl font-bold mb-2" style={{ color: C.navy }}>
                        You're on the list!
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: C.textMid }}>
                        We'll email you on launch day with your exclusive early-access link.
                      </p>
                    </motion.div>
                  ) : (
                    /* ── Form ── */
                    <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div className="text-4xl text-center mb-4">📬</div>
                      <h2 className="text-2xl font-bold text-center mb-2" style={{ color: C.navy }}>
                        Request Early Access
                      </h2>
                      <p className="text-center text-sm mb-7 leading-relaxed" style={{ color: C.textMid }}>
                        We're rolling out access gradually. Drop your email and we'll send you a personal invite when your spot is ready.
                      </p>

                      <form onSubmit={handleSubmit} className="space-y-3">
                        <input
                          type="text"
                          name="name"
                          placeholder="Your name"
                          className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all"
                          style={{ background: C.cream, border: `1.5px solid ${C.border}`, color: C.text }}
                          onFocus={(e) => (e.target.style.borderColor = C.orange)}
                          onBlur={(e)  => (e.target.style.borderColor = C.border)}
                        />
                        <input
                          type="email"
                          name="email"
                          required
                          placeholder="you@example.com"
                          className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all"
                          style={{ background: C.cream, border: `1.5px solid ${C.border}`, color: C.text }}
                          onFocus={(e) => (e.target.style.borderColor = C.orange)}
                          onBlur={(e)  => (e.target.style.borderColor = C.border)}
                        />

                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.02, y: -1, boxShadow: '0 12px 32px rgba(255,107,53,0.38)' }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          className="w-full py-4 rounded-xl font-bold text-base text-white"
                          style={{
                            background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`,
                            boxShadow: `0 8px 24px rgba(255,107,53,0.30)`,
                          }}
                        >
                          Get Early Access →
                        </motion.button>
                      </form>

                      <div
                        className="text-center text-sm mt-4 px-4 py-2.5 rounded-xl font-semibold"
                        style={{
                          background: 'rgba(255,107,53,0.09)',
                          border: '1px solid rgba(255,107,53,0.25)',
                          color: C.orange,
                          boxShadow: '0 0 16px rgba(255,107,53,0.12)',
                        }}
                      >
                        ✨ First 100 users get 1 month FREE Premium access
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

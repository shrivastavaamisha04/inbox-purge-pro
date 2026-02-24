import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { C, fadeUp, ease } from '../../lib/design'
import { getUserEmail } from '../../utils/auth'

const API_URL = import.meta.env.VITE_API_URL

const WINDOW_OPTIONS = [
  { label: '12h',  value: 12  },
  { label: '18h',  value: 18  },
  { label: '24h',  value: 24  },
  { label: '48h',  value: 48  },
]

export default function Settings() {
  const navigate  = useNavigate()
  const userEmail = getUserEmail()
  const timezone  = Intl.DateTimeFormat().resolvedOptions().timeZone

  const [parseTime,        setParseTime]        = useState('08:00')
  const [parseWindowHours, setParseWindowHours] = useState(24)
  const [saving,           setSaving]           = useState(false)
  const [message,          setMessage]          = useState('')

  useEffect(() => {
    if (!userEmail) return
    fetch(`${API_URL}/api/users/settings?email=${encodeURIComponent(userEmail)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.parseTime)        setParseTime(data.parseTime)
        if (data.parseWindowHours) setParseWindowHours(data.parseWindowHours)
      })
      .catch(() => {})
  }, [userEmail])

  const handleSave = async () => {
    if (!userEmail) { setMessage('❌ Not signed in'); return }
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch(`${API_URL}/api/users/settings`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: userEmail, timezone, parseTime, parseWindowHours }),
      })
      if (!res.ok) throw new Error('Save failed')
      setMessage('✅ Settings saved!')
    } catch {
      setMessage('❌ Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  // Format time for preview (e.g. "08:00" → "8:00 AM")
  const formatTime12h = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    const ampm   = h >= 12 ? 'PM' : 'AM'
    const hour   = h % 12 || 12
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
  }

  // Digest is sent 30 minutes after parse
  const formatDigestTime = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    let dM = m + 30
    let dH = h
    if (dM >= 60) { dM -= 60; dH = (dH + 1) % 24 }
    const ampm = dH >= 12 ? 'PM' : 'AM'
    const hour = dH % 12 || 12
    return `${hour}:${String(dM).padStart(2, '0')} ${ampm}`
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.cream, color: C.text }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between"
        style={{ background: 'rgba(250,248,245,0.9)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${C.border}` }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm font-medium transition-opacity hover:opacity-60"
            style={{ color: C.navyMid }}
          >
            ← Dashboard
          </button>
          <span style={{ color: C.border }}>|</span>
          <h1 className="text-base font-bold" style={{ color: C.navy }}>Settings</h1>
        </div>
        {userEmail && (
          <span className="text-sm" style={{ color: C.textMid }}>{userEmail}</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center p-6 pt-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="w-full max-w-lg space-y-6"
        >
          <div>
            <h2 className="text-2xl font-bold" style={{ color: C.navy }}>Inbox Schedule</h2>
            <p className="text-sm mt-1" style={{ color: C.textMid }}>
              Configure when Inbox Purge Pro scans and organizes your inbox.
            </p>
          </div>

          {/* Card */}
          <div
            className="rounded-2xl p-6 space-y-6"
            style={{ background: C.white, border: `1px solid ${C.border}`, boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}
          >
            {/* Daily Parse Time */}
            <div className="space-y-2">
              <label className="text-sm font-semibold" style={{ color: C.navy }}>
                Daily Parse Time
              </label>
              <input
                type="time"
                value={parseTime}
                onChange={(e) => setParseTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all"
                style={{
                  background: C.creamWarm,
                  border: `1.5px solid ${C.border}`,
                  color: C.navy,
                }}
                onFocus={(e)  => (e.target.style.borderColor = C.orange)}
                onBlur={(e)   => (e.target.style.borderColor = C.border)}
              />
            </div>

            {/* Timezone (read-only) */}
            <div className="space-y-2">
              <label className="text-sm font-semibold" style={{ color: C.navy }}>
                Timezone
              </label>
              <div
                className="px-4 py-2.5 rounded-lg text-sm"
                style={{ background: C.creamWarm, border: `1.5px solid ${C.border}`, color: C.textMid }}
              >
                {timezone}
              </div>
              <p className="text-xs" style={{ color: C.textMid }}>Auto-detected from your browser.</p>
            </div>

            {/* Parse Window */}
            <div className="space-y-2">
              <label className="text-sm font-semibold" style={{ color: C.navy }}>
                Parse Window
              </label>
              <p className="text-xs" style={{ color: C.textMid }}>How far back each daily scan looks.</p>
              <div className="flex gap-2">
                {WINDOW_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setParseWindowHours(opt.value)}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                    style={
                      parseWindowHours === opt.value
                        ? { background: C.orange, color: '#fff', border: `1.5px solid ${C.orange}` }
                        : { background: C.creamWarm, color: C.navyMid, border: `1.5px solid ${C.border}` }
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview line */}
            <div
              className="rounded-lg px-4 py-3 text-sm"
              style={{ background: 'rgba(255,107,53,0.06)', border: `1px solid rgba(255,107,53,0.2)` }}
            >
              <span style={{ color: C.navyMid }}>
                Your inbox will be scanned at{' '}
                <strong style={{ color: C.orange }}>{formatTime12h(parseTime)}</strong>.
                {' '}Your digest will arrive at{' '}
                <strong style={{ color: C.orange }}>{formatDigestTime(parseTime)}</strong>{' '}
                — 30 minutes later.
              </span>
            </div>
          </div>

          {/* Save button */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
              style={{
                background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`,
                boxShadow: `0 4px 14px rgba(255,107,53,0.35)`,
              }}
            >
              {saving ? 'Saving…' : 'Save Settings'}
            </button>
            {message && (
              <motion.p
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, ease }}
                className="text-sm font-medium"
                style={{ color: message.startsWith('✅') ? C.green : C.red }}
              >
                {message}
              </motion.p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

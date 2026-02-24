import { useState } from 'react'
import { useNavigate }          from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { C }                    from '../../lib/design'
import { initiateGoogleLogin }  from '../../utils/auth'
import { saveAccount, setActiveEmail } from '../../utils/session'

const API_URL = import.meta.env.VITE_API_URL

type Persona = {
  id:          string
  icon:        string
  title:       string
  description: string
  rules:       string[]
}

const PERSONAS: Persona[] = [
  {
    id:          'startup_founder',
    icon:        '🚀',
    title:       'Startup Founder',
    description: 'Investors, product updates, and partnerships — signal over noise.',
    rules: [
      'Mark investor and VC emails as Important',
      'Archive mass marketing and newsletter digests',
      'Label cold sales pitches as Promotions',
    ],
  },
  {
    id:          'working_professional',
    icon:        '💼',
    title:       'Working Professional',
    description: 'Keep work comms clean. Kill off-hours noise.',
    rules: [
      'Prioritize emails from your company domain',
      'Archive promotional and coupon emails',
      'Archive weekend newsletters automatically',
    ],
  },
  {
    id:          'student',
    icon:        '🎓',
    title:       'Student',
    description: 'Class updates and deadlines front and centre. Trash the rest.',
    rules: [
      'Mark university and professor emails as Important',
      'Archive alumni and event announcement emails',
      'Label job boards and internship spam as Promotions',
    ],
  },
  {
    id:          'freelancer',
    icon:        '🎨',
    title:       'Freelancer / Creator',
    description: 'Client comms and collabs up top. Subscriptions out of sight.',
    rules: [
      'Mark client and contract-related emails as Important',
      'Archive SaaS tool billing and update digests',
      'Label brand partnership cold outreach as Promotions',
    ],
  },
]

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}
const cardVariant = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

// ── Progress dots ─────────────────────────────────────────────────────────────
function ProgressDots({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width:      i === step ? '24px' : '8px',
            height:     '8px',
            background: i === step
              ? `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`
              : i < step ? C.orange : C.border,
            opacity:    i < step ? 0.5 : 1,
          }}
        />
      ))}
    </div>
  )
}

export default function PersonaSelection() {
  const navigate = useNavigate()
  const [step,        setStep]       = useState(0)
  const [selected,    setSelected]   = useState<string | null>(null)
  const [loading,     setLoading]    = useState(false)
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null)
  const [accessToken,    setAccessToken]    = useState<string | null>(null)

  // ── Step 1: Persona selection ──────────────────────────────────────────────
  const handlePersonaContinue = () => {
    if (!selected) return
    setStep(1)
  }

  // ── Step 2: Connect Gmail ──────────────────────────────────────────────────
  const handleGmailConnect = async () => {
    setLoading(true)
    try {
      const data: { email: string; accessToken: string; name?: string } =
        await initiateGoogleLogin() as { email: string; accessToken: string; name?: string }

      setConnectedEmail(data.email)
      setAccessToken(data.accessToken)

      // Save account to multi-account store
      saveAccount({
        email:        data.email,
        name:         data.name || '',
        access_token: data.accessToken,
        persona:      selected || '',
      })
      setActiveEmail(data.email)

      // Persist persona + trigger welcome email + start trial clock
      await fetch(`${API_URL}/api/users/settings`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          email:       data.email,
          timezone:    Intl.DateTimeFormat().resolvedOptions().timeZone,
          parseTime:   '08:00',
          persona:     selected,
          accessToken: data.accessToken,
        }),
      })
    } catch (err) {
      console.error('Gmail connect failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStep2Continue = () => {
    if (!connectedEmail) return
    setStep(2)
  }

  // ── Step 3: "You're all set" → open dashboard ─────────────────────────────
  const handleOpenInbox = () => {
    if (selected)       localStorage.setItem('persona',   selected)
    if (accessToken)    localStorage.setItem('accessToken', accessToken)
    if (connectedEmail) localStorage.setItem('userEmail',   connectedEmail)
    localStorage.setItem('isPremium', 'true')
    navigate('/dashboard?plan=premium')
  }

  const slideVariants = {
    enter:  { opacity: 0, x: 40  },
    center: { opacity: 1, x: 0   },
    exit:   { opacity: 0, x: -40 },
  }

  return (
    <div
      className="min-h-screen overflow-y-auto px-4 md:px-6 py-8 flex flex-col items-center"
      style={{ background: C.cream }}
    >
      <AnimatePresence mode="wait">

        {/* ── Step 0: Persona ─────────────────────────────────────────────── */}
        {step === 0 && (
          <motion.div
            key="step0"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35 }}
            className="w-full max-w-3xl"
          >
            <ProgressDots step={0} />

            <div className="text-center mb-6">
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-3"
                style={{ background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`, color: '#fff' }}
              >
                ✨ 14 Days Free — No Card Required
              </div>
              <h1 className="text-3xl font-bold mb-1.5 leading-tight" style={{ color: C.navy }}>
                Who are you?
              </h1>
              <p className="text-sm leading-relaxed" style={{ color: C.textMid }}>
                Pick the profile that fits you best. We'll pre-load 3 smart rules you can tweak anytime.
              </p>
            </div>

            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="grid sm:grid-cols-2 gap-4 mb-5 items-stretch"
            >
              {PERSONAS.map((persona) => {
                const isSelected = selected === persona.id
                return (
                  <motion.button
                    key={persona.id}
                    variants={cardVariant}
                    onClick={() => setSelected(persona.id)}
                    className="text-left rounded-2xl p-4 md:p-5 transition-all h-full flex flex-col"
                    style={{
                      background: isSelected ? 'rgba(255,107,53,0.06)' : C.white,
                      border:     isSelected ? `2px solid ${C.orange}` : `1.5px solid ${C.border}`,
                      boxShadow:  isSelected ? `0 8px 28px rgba(255,107,53,0.15)` : '0 2px 12px rgba(0,0,0,0.05)',
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: isSelected ? 'rgba(255,107,53,0.12)' : C.creamWarm }}
                      >
                        {persona.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm" style={{ color: C.navy }}>{persona.title}</p>
                        <p className="text-xs leading-snug" style={{ color: C.textMid }}>{persona.description}</p>
                      </div>
                      {isSelected && (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ background: C.orange }}
                        >
                          ✓
                        </div>
                      )}
                    </div>
                    <ul className="space-y-1.5 mt-auto pt-3 flex-1">
                      {persona.rules.map((rule) => (
                        <li key={rule} className="flex items-start gap-2 text-xs" style={{ color: C.navyMid }}>
                          <span className="mt-0.5 flex-shrink-0" style={{ color: C.orange }}>→</span>
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </motion.button>
                )
              })}
            </motion.div>

            <div className="flex flex-col items-center gap-2 mt-1">
              <motion.button
                whileHover={selected ? { scale: 1.03, y: -2 } : {}}
                whileTap={selected ? { scale: 0.97 } : {}}
                onClick={handlePersonaContinue}
                disabled={!selected}
                className="px-12 py-3 rounded-xl font-bold text-base text-white disabled:opacity-40"
                style={{
                  background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`,
                  boxShadow:  selected ? `0 8px 24px rgba(255,107,53,0.30)` : 'none',
                  cursor:     selected ? 'pointer' : 'not-allowed',
                }}
              >
                Continue →
              </motion.button>
              <p className="text-xs" style={{ color: C.textMid }}>
                You can change or add rules anytime from your dashboard
              </p>
            </div>
          </motion.div>
        )}

        {/* ── Step 1: Connect Gmail ────────────────────────────────────────── */}
        {step === 1 && (
          <motion.div
            key="step1"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35 }}
            className="w-full max-w-md"
          >
            <ProgressDots step={1} />

            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: C.white, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
            >
              <div className="text-5xl mb-4">📧</div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: C.navy }}>
                Connect your Gmail
              </h2>
              <p className="text-sm mb-8" style={{ color: C.textMid }}>
                We'll use OAuth — we never see your password. Read-only access to scan, apply rules, and send your digest.
              </p>

              {!connectedEmail ? (
                <button
                  onClick={handleGmailConnect}
                  disabled={loading}
                  className="w-full bg-white border-2 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  style={{ borderColor: C.border }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {loading ? 'Connecting…' : 'Connect Gmail Account'}
                </button>
              ) : (
                <div
                  className="rounded-xl px-4 py-3 mb-6 flex items-center gap-3"
                  style={{ background: 'rgba(22,163,74,0.06)', border: '1.5px solid rgba(22,163,74,0.25)' }}
                >
                  <span className="text-green-600 text-xl">✓</span>
                  <span className="text-sm font-semibold" style={{ color: '#16A34A' }}>
                    Connected as {connectedEmail}
                  </span>
                </div>
              )}

              <div className="flex flex-col items-center gap-3 mt-6">
                <button
                  onClick={handleStep2Continue}
                  disabled={!connectedEmail}
                  className="px-12 py-4 rounded-xl font-bold text-base text-white w-full disabled:opacity-40"
                  style={{
                    background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`,
                    boxShadow:  connectedEmail ? `0 8px 24px rgba(255,107,53,0.30)` : 'none',
                  }}
                >
                  Continue →
                </button>
                <button
                  onClick={() => setStep(0)}
                  className="text-sm"
                  style={{ color: C.textMid }}
                >
                  ← Back
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Step 2: You're all set ───────────────────────────────────────── */}
        {step === 2 && (
          <motion.div
            key="step2"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35 }}
            className="w-full max-w-md"
          >
            <ProgressDots step={2} />

            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: C.white, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="text-6xl mb-4"
              >
                🎉
              </motion.div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: C.navy }}>
                You're all set!
              </h2>
              <p className="text-sm font-semibold mb-1" style={{ color: C.orange }}>
                14 days free — no card, no commitment
              </p>
              <p className="text-sm mb-8" style={{ color: C.textMid }}>
                After that, ₹89/month. Cancel anytime.
              </p>

              <ul className="space-y-3 mb-8 text-left">
                {[
                  'Unlimited inbox scans',
                  'Behavioral AI that learns your preferences',
                  'Custom rules in plain English',
                  'Daily digest 30 min after your scan',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm" style={{ color: C.navyMid }}>
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(22,163,74,0.1)' }}
                    >
                      <span style={{ color: '#16A34A', fontSize: '10px', fontWeight: 700 }}>✓</span>
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleOpenInbox}
                className="w-full py-4 rounded-xl font-bold text-base text-white"
                style={{
                  background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`,
                  boxShadow:  `0 8px 24px rgba(255,107,53,0.35)`,
                }}
              >
                Open My Inbox →
              </motion.button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}

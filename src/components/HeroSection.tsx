import { motion } from 'framer-motion'
import { C, ease, fadeUpChild } from '../lib/design'
import { PrimaryButton, SecondaryButton } from './ui'

const heroContainer = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.16, delayChildren: 0.3 } },
}

// ── Floating before/after email cards ────────────────────────────────────────
function EmailVisual() {
  return (
    <div className="relative w-full h-[280px] md:h-[420px] flex items-center justify-center select-none">

      {/* BEFORE card */}
      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-0 md:left-4 top-10 w-52 rounded-2xl p-5 shadow-xl"
        style={{ background: C.creamWarm, border: `1px solid ${C.border}` }}
      >
        <div className="text-xs font-mono font-bold mb-3 tracking-widest" style={{ color: C.red }}>
          BEFORE
        </div>
        <div className="text-3xl mb-1">😰</div>
        <div className="text-2xl font-bold mb-0.5" style={{ color: C.navy }}>6,342</div>
        <div className="text-sm mb-3" style={{ color: C.textMid }}>Unread emails</div>
        <div className="space-y-1.5">
          {['50% Off! Today only…', 'Weekly digest #148', 'You\'ve been selected!'].map((s) => (
            <div key={s} className="text-xs px-2.5 py-1 rounded-lg truncate" style={{ background: 'rgba(220,38,38,0.07)', color: '#DC2626' }}>
              {s}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Central spark */}
      <motion.div
        animate={{ scale: [1, 1.18, 1], rotate: [0, 10, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 flex items-center justify-center z-10"
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl shadow-lg"
          style={{ background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`, boxShadow: `0 8px 24px rgba(255,107,53,0.45)` }}
        >
          ✨
        </div>
      </motion.div>

      {/* AFTER card */}
      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
        className="absolute right-0 md:right-4 bottom-10 w-52 rounded-2xl p-5 shadow-xl"
        style={{ background: C.white, border: `1.5px solid rgba(255,107,53,0.30)` }}
      >
        <div className="text-xs font-mono font-bold mb-3 tracking-widest" style={{ color: C.orange }}>
          AFTER
        </div>
        <div className="text-3xl mb-1">🎉</div>
        <div className="text-2xl font-bold" style={{ color: C.navy }}>Inbox</div>
        <div className="text-2xl font-bold mb-3" style={{ color: C.orange }}>Zero</div>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: C.green }}>
          <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
          3 important emails
        </div>
        <div className="text-xs mt-1" style={{ color: C.textMid }}>
          6,342 cleaned in 2 min
        </div>
      </motion.div>

      {/* Orbiting dots */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{ background: `rgba(255,107,53,${0.3 + i * 0.15})` }}
          animate={{
            x: [Math.cos((i * 120 * Math.PI) / 180) * 80, Math.cos(((i * 120 + 180) * Math.PI) / 180) * 80],
            y: [Math.sin((i * 120 * Math.PI) / 180) * 60, Math.sin(((i * 120 + 180) * Math.PI) / 180) * 60],
          }}
          transition={{ duration: 4 + i, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: i * 0.6 }}
        />
      ))}
    </div>
  )
}

// ── HeroSection ───────────────────────────────────────────────────────────────
export default function HeroSection({ loading, onOpenModal }: { loading: boolean; onOpenModal: () => void }) {
  const scrollTo = (id: string) =>
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section className="container mx-auto px-4 md:px-6 pt-20 pb-10 md:pt-28 md:pb-16">
      <div className="flex flex-col md:flex-row items-center gap-12 md:gap-8">

        {/* ── Left: text ─────────────────────────────────────────────────── */}
        <motion.div
          className="flex-1 text-center md:text-left"
          variants={heroContainer}
          initial="hidden"
          animate={loading ? 'hidden' : 'visible'}
        >
          {/* Launch badge */}
          <motion.div variants={fadeUpChild} className="flex justify-center md:justify-start mb-3">
            <motion.div
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold"
              style={{ background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`, color: '#fff', boxShadow: `0 4px 16px rgba(255,107,53,0.40)` }}
            >
              ✨ BETA version live
            </motion.div>
          </motion.div>

          {/* Badge — hidden on mobile */}
          <motion.div variants={fadeUpChild} className="hidden md:flex justify-center md:justify-start mb-5">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium"
              style={{ background: 'rgba(255,107,53,0.08)', border: `1px solid rgba(255,107,53,0.22)`, color: C.orange }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.orange }} />
              AI that learns <em>your</em> behavior — not generic rules
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUpChild}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-5 leading-[1.06] tracking-tight"
            style={{ color: C.navy }}
          >
            Your Inbox,{' '}
            <br className="hidden md:block" />
            <span className="shimmer-text">But It Knows You</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p variants={fadeUpChild} className="text-xl mb-6 max-w-xl leading-relaxed" style={{ color: C.textMid }}>
            AI that learns from behavior, not generic rules.
          </motion.p>

          {/* Taglines — hidden on mobile */}
          <motion.div variants={fadeUpChild} className="hidden md:flex flex-col gap-2 mb-8">
            <div className="flex items-center gap-2 justify-center md:justify-start text-base font-medium" style={{ color: C.navyMid }}>
              🧠 <span><strong>Behavioral AI</strong> that learns your preferences — not generic rules</span>
            </div>
            <div className="flex items-center gap-2 justify-center md:justify-start text-base font-medium" style={{ color: C.navyMid }}>
              📝 <span><strong>Custom rules</strong> in plain English + daily digest at 7 PM</span>
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div variants={fadeUpChild} className="flex flex-wrap gap-4 justify-center md:justify-start">
            <PrimaryButton onClick={onOpenModal} className="px-8 py-4">Start Free — 14 Days Free</PrimaryButton>
            <SecondaryButton onClick={() => scrollTo('#problem')} className="px-7 py-4">
              See How It Works ↓
            </SecondaryButton>
          </motion.div>

          {/* Trust */}
          <motion.p variants={fadeUpChild} className="text-sm mt-5" style={{ color: C.textMid }}>
            ✓ No credit card required &nbsp;·&nbsp; ✓ Works with any Gmail &nbsp;·&nbsp; ✓ 2-min setup
          </motion.p>
        </motion.div>

        {/* ── Right: visual — hidden on mobile ─────────────────────────────── */}
        <motion.div
          className="hidden md:block flex-1 w-full max-w-sm md:max-w-none"
          initial={{ opacity: 0, x: 40 }}
          animate={loading ? { opacity: 0, x: 40 } : { opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease }}
        >
          <EmailVisual />
        </motion.div>
      </div>
    </section>
  )
}

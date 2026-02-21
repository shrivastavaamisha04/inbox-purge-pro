import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { C, VP, staggerSlow, scaleIn } from '../lib/design'
import { SectionHeading, TiltCard, PrimaryButton, SecondaryButton, CheckItem } from './ui'

const FREE_FEATURES = [
  'Clean 50 most recent emails',
  'Basic AI categorization',
  'See instant results',
  'No credit card required',
  'Access to dashboard',
]

const PRO_FEATURES_VISIBLE = [
  'Everything in Free',
  '♾️ Unlimited email cleanups',
  '🧠 AI learns YOUR preferences',
  '🎯 Behavioral tracking & scoring',
  '📝 Custom rules in plain English',
]

const PRO_FEATURES_HIDDEN = [
  '👔 4 persona templates',
  '🔄 Weekly auto-cleanup',
  '🧪 Test rules before applying',
  '💬 Priority support (email + chat)',
]

export default function PricingSection() {
  const [showAll, setShowAll] = useState(false)

  return (
    <section id="pricing" className="py-24" style={{ background: C.creamWarm }}>
      <div className="container mx-auto px-6">
        <SectionHeading
          label="💸 Simple pricing"
          title="Start Free. Upgrade When Ready."
          subtitle="No hidden fees. No lock-in. Cancel the monthly plan anytime from your dashboard."
        />

        <motion.div
          variants={staggerSlow}
          initial="hidden"
          whileInView="visible"
          viewport={VP}
          className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch"
        >
          {/* ── Free tier ── */}
          <motion.div variants={scaleIn} className="flex">
            <TiltCard
              className="p-8 flex flex-col w-full"
              style={{ background: C.white, border: `1px solid ${C.border}`, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
            >
              <div
                className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-5"
                style={{ background: 'rgba(44,62,80,0.07)', color: C.navyMid }}
              >
                🎯 Perfect to Try
              </div>
              <h3 className="text-2xl font-bold mb-1" style={{ color: C.navy }}>Basic AI</h3>
              <p className="text-sm mb-6" style={{ color: C.textMid }}>Forever free. No catch.</p>

              <div className="flex items-end gap-2 mb-8">
                <span className="text-6xl font-bold" style={{ color: C.navy }}>₹0</span>
                <span className="mb-2 text-sm font-medium" style={{ color: C.textMid }}>forever free</span>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {FREE_FEATURES.map((f) => <CheckItem key={f}>{f}</CheckItem>)}
              </ul>

              <div className="mt-auto">
                <SecondaryButton className="w-full">Start Free</SecondaryButton>
                <p className="text-xs text-center mt-3" style={{ color: C.textMid }}>
                  Perfect for trying out the magic ✨
                </p>
              </div>
            </TiltCard>
          </motion.div>

          {/* ── Premium tier ── */}
          <motion.div variants={scaleIn} className="flex">
            <TiltCard className="overflow-hidden flex flex-col w-full">
              {/* Orange header */}
              <div
                className="px-8 py-4 flex items-center justify-between flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})` }}
              >
                <div className="text-white font-bold text-sm flex items-center gap-2">
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ⭐
                  </motion.span>
                  MOST POPULAR
                </div>
                <div className="text-white/80 text-xs font-medium">7-day free trial</div>
              </div>

              <div
                className="p-8 flex flex-col flex-1"
                style={{
                  background: C.white,
                  border: `1.5px solid rgba(255,107,53,0.25)`,
                  borderTop: 'none',
                  borderRadius: '0 0 16px 16px',
                  boxShadow: '0 8px 32px rgba(255,107,53,0.12)',
                }}
              >
                <h3 className="text-2xl font-bold mb-1" style={{ color: C.navy }}>Smart AI</h3>
                <p className="text-sm mb-6" style={{ color: C.textMid }}>Full behavioral AI + unlimited rules</p>

                <div className="flex items-end gap-2 mb-1">
                  <span className="text-6xl font-bold" style={{ color: C.navy }}>₹89</span>
                  <span className="mb-2 text-sm font-medium" style={{ color: C.textMid }}>/month</span>
                </div>
                <div className="text-sm font-medium mb-8" style={{ color: C.orange }}>
                  Less than ₹3/day · 7-day free trial
                </div>

                <ul className="space-y-4 mb-4 flex-1">
                  {PRO_FEATURES_VISIBLE.map((f) => <CheckItem key={f}>{f}</CheckItem>)}

                  <AnimatePresence initial={false}>
                    {showAll && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        style={{ overflow: 'hidden' }}
                      >
                        <ul className="space-y-4 pt-2">
                          {PRO_FEATURES_HIDDEN.map((f) => <CheckItem key={f}>{f}</CheckItem>)}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </ul>

                <button
                  onClick={() => setShowAll((v) => !v)}
                  className="text-sm font-semibold mb-6 flex items-center gap-1 transition-opacity hover:opacity-70"
                  style={{ color: C.orange }}
                >
                  <motion.span animate={{ rotate: showAll ? 180 : 0 }} transition={{ duration: 0.25 }}>↓</motion.span>
                  {showAll ? 'Hide features' : 'View All Features'}
                </button>

                <div className="mt-auto">
                  <PrimaryButton className="w-full text-center">Start Free Trial</PrimaryButton>
                  <p className="text-xs text-center mt-3" style={{ color: C.textMid }}>
                    Cancel anytime · No contracts
                  </p>
                </div>
              </div>
            </TiltCard>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

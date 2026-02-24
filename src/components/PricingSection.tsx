import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { C, VP, scaleIn } from '../lib/design'
import { SectionHeading, TiltCard, PrimaryButton, CheckItem } from './ui'

const PRO_FEATURES_VISIBLE = [
  'Everything included from day one',
  '♾️ Unlimited email cleanups',
  '🧠 AI learns YOUR preferences',
  '🎯 Behavioral tracking & scoring',
  '📝 Custom rules in plain English',
]

const PRO_FEATURES_HIDDEN = [
  '👔 4 persona templates',
  '🔄 Daily auto-cleanup at 8 AM',
  '🧪 Test rules before applying',
  '📬 Daily digest at 7 PM',
  '💬 Priority support (email + chat)',
]

export default function PricingSection({ onPremium }: { onPremium: () => void }) {
  const [showAll, setShowAll] = useState(false)

  return (
    <section id="pricing" className="py-12 md:py-24" style={{ background: C.creamWarm }}>
      <div className="container mx-auto px-4 md:px-6">
        <SectionHeading
          label="💸 Simple pricing"
          title="One plan. Everything included."
          subtitle="One plan. Everything included. First 14 days free."
        />

        <motion.div
          variants={scaleIn}
          initial="hidden"
          whileInView="visible"
          viewport={VP}
          className="max-w-md mx-auto"
        >
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
              <div className="text-white/80 text-xs font-medium">14-day free trial</div>
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
                14 days free · ₹89/month after
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
                <PrimaryButton onClick={onPremium} className="w-full text-center">Start Free Trial — 14 Days</PrimaryButton>
                <p className="text-xs text-center mt-3" style={{ color: C.textMid }}>
                  No credit card · Cancel anytime
                </p>
              </div>
            </div>
          </TiltCard>
        </motion.div>
      </div>
    </section>
  )
}

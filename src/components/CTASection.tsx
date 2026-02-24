import { motion } from 'framer-motion'
import { C, VP, fadeUp } from '../lib/design'

const TRUST_BADGES = [
  { icon: '🇮🇳', label: 'Made in India' },
  { icon: '⚡', label: '2-min setup'    },
]

export default function CTASection({ onPremium }: { onPremium: () => void }) {
  return (
    <section
      className="py-12 md:py-24 text-center"
      style={{ background: `linear-gradient(135deg, ${C.orange} 0%, ${C.orangeLight} 40%, ${C.orangeDark} 100%)` }}
    >
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={VP}
        className="container mx-auto px-4 md:px-6 max-w-3xl"
      >
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-5 leading-tight">
          Ready for an Inbox That Actually Knows You?
        </h2>
        <p className="text-lg mb-10 text-white/80 max-w-xl mx-auto">
          Join 100+ users who've already cleaned 50,000+ emails. Takes 2 minutes to set up.
        </p>

        <div className="flex flex-wrap gap-4 justify-center mb-4">
          <motion.button
            whileHover={{ scale: 1.05, y: -3, boxShadow: '0 20px 40px rgba(0,0,0,0.22)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={onPremium}
            className="bg-white font-bold text-lg px-10 py-4 rounded-xl shadow-lg"
            style={{ color: C.orange }}
          >
            Start Free — No Card Required
          </motion.button>
        </div>

        <p className="text-sm text-white/70 mb-10">14-day free trial · ₹89/month after · Cancel anytime</p>

        {/* Trust badges */}
        <div className="flex flex-wrap gap-4 justify-center">
          {TRUST_BADGES.map(({ icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
              style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)' }}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

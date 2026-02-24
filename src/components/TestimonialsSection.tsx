import { motion } from 'framer-motion'
import { C, VP, stagger, fadeUpChild } from '../lib/design'
import { SectionHeading, PrimaryButton } from './ui'

const SKELETON_CARDS = [
  { avatar: '👩‍💼', name: '— — — — —', role: '— — — — — — —' },
  { avatar: '👨‍💻', name: '— — — — —', role: '— — — — — — —' },
  { avatar: '👩‍🔬', name: '— — — — —', role: '— — — — — — —' },
]

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-12 md:py-24" style={{ background: C.white }}>
      <div className="container mx-auto px-4 md:px-6">
        <SectionHeading
          label="✨ Coming Soon"
          title="Real Results from Real Users"
          subtitle="We're launching soon. Be among the first to share your inbox transformation story."
        />

        {/* Skeleton cards */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={VP}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          {SKELETON_CARDS.map((card, i) => (
            <motion.div key={i} variants={fadeUpChild}>
              <div
                className="relative rounded-2xl p-7 overflow-hidden"
                style={{ background: C.cream, border: `1px solid ${C.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
              >
                {/* Blurred content */}
                <div style={{ filter: 'blur(5px)', userSelect: 'none' }}>
                  <div className="flex gap-0.5 mb-4">
                    {Array(5).fill(0).map((_, j) => (
                      <span key={j} className="text-orange-400 text-sm">★</span>
                    ))}
                  </div>
                  <div className="space-y-2 mb-5">
                    <div className="h-3 rounded-full" style={{ background: 'rgba(0,0,0,0.10)', width: '92%' }} />
                    <div className="h-3 rounded-full" style={{ background: 'rgba(0,0,0,0.08)', width: '78%' }} />
                    <div className="h-3 rounded-full" style={{ background: 'rgba(0,0,0,0.08)', width: '84%' }} />
                    <div className="h-3 rounded-full" style={{ background: 'rgba(0,0,0,0.06)', width: '60%' }} />
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                      style={{ background: 'rgba(255,107,53,0.08)' }}
                    >
                      {card.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-sm" style={{ color: C.navy }}>{card.name}</div>
                      <div className="text-xs" style={{ color: C.textMid }}>{card.role}</div>
                    </div>
                  </div>
                </div>

                {/* Overlay */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
                  style={{ background: 'rgba(250,248,245,0.55)', backdropFilter: 'blur(1px)' }}
                >
                  <span className="text-2xl mb-2">🔒</span>
                  <p className="text-sm font-semibold text-center px-4" style={{ color: C.navyMid }}>
                    Your story could be here!
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center">
          <PrimaryButton className="px-10">
            Be Among the First 100 →
          </PrimaryButton>
          <p className="text-sm mt-3" style={{ color: C.textMid }}>
            Early adopters get lifetime 30% discount
          </p>
        </div>
      </div>
    </section>
  )
}

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { C, VP, stagger, fadeUpChild } from '../lib/design'
import { SectionHeading, TiltCard } from './ui'

const PERSONAS = [
  {
    icon: '👔',
    title: 'Busy Professional',
    desc: 'Prioritize meetings, archive newsletters, keep work tools',
    rules: [
      'Archive all newsletters + digests',
      'Flag emails with meeting / call / schedule',
      'Prioritize emails from your company domain',
      'Trash cold sales pitches from unknown senders',
    ],
  },
  {
    icon: '🚀',
    title: 'Entrepreneur / Founder',
    desc: 'Keep investor emails, trash sales pitches, prioritize customers',
    rules: [
      'Mark investor & VC emails as important',
      'Trash unsolicited partnership proposals',
      'Flag emails with customer, support, order',
      'Archive job applications (unless you\'re hiring)',
    ],
  },
  {
    icon: '🎓',
    title: 'Student',
    desc: 'Keep university updates, deadlines, student discounts',
    rules: [
      'Flag emails with deadline, assignment, exam',
      'Archive general university announcements',
      'Keep student discount & scholarship emails',
      'Trash promotional spam from brands',
    ],
  },
  {
    icon: '💼',
    title: 'Job Seeker',
    desc: 'Prioritize recruiters, LinkedIn alerts, interview invites',
    rules: [
      'Flag recruiter & HR emails as important',
      'Keep LinkedIn job alerts & connections',
      'Flag interview, offer, shortlist keywords',
      'Archive company newsletters while job hunting',
    ],
  },
]

export default function PersonaSection() {
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <section id="personas" className="py-12 md:py-24" style={{ background: C.creamWarm }}>
      <div className="container mx-auto px-4 md:px-6">
        <SectionHeading
          label="🧩 Persona Templates"
          title="Or Start With a Template That Matches You"
          subtitle="Choose a pre-built persona and we'll auto-generate smart rules for your inbox. Customise later."
        />

        {/* 4 persona cards */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={VP}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6"
        >
          {PERSONAS.map((p, i) => (
            <motion.div key={p.title} variants={fadeUpChild}>
              <TiltCard
                className="p-6 cursor-pointer transition-colors"
                style={{
                  background: selected === i ? C.white : C.white,
                  border: selected === i
                    ? `2px solid ${C.orange}`
                    : `1px solid ${C.border}`,
                  boxShadow: selected === i
                    ? `0 8px 32px rgba(255,107,53,0.18)`
                    : '0 2px 8px rgba(0,0,0,0.04)',
                }}
                onClick={() => setSelected(selected === i ? null : i)}
              >
                <div className="text-3xl mb-3">{p.icon}</div>
                <h3 className="font-bold text-base mb-1" style={{ color: C.navy }}>{p.title}</h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: C.textMid }}>{p.desc}</p>
                <div
                  className="text-sm font-semibold flex items-center gap-1"
                  style={{ color: selected === i ? C.orange : C.navyMid }}
                >
                  {selected === i ? 'Hide Rules ↑' : 'See Rules →'}
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Expanded rules panel */}
        <AnimatePresence>
          {selected !== null && (
            <motion.div
              key={selected}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <div
                className="rounded-2xl p-7 mb-8"
                style={{ background: C.white, border: `1.5px solid rgba(255,107,53,0.25)`, boxShadow: '0 4px 24px rgba(255,107,53,0.08)' }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-2xl">{PERSONAS[selected].icon}</span>
                  <div>
                    <div className="font-bold text-lg" style={{ color: C.navy }}>
                      {PERSONAS[selected].title} — Auto-Generated Rules
                    </div>
                    <div className="text-sm" style={{ color: C.textMid }}>
                      Premium: customise or add unlimited rules
                    </div>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {PERSONAS[selected].rules.map((rule, ri) => (
                    <motion.div
                      key={rule}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: ri * 0.08 }}
                      className="flex items-start gap-3 p-3 rounded-xl"
                      style={{ background: C.cream }}
                    >
                      <span className="text-xs font-bold mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(255,107,53,0.12)', color: C.orange }}>
                        {ri + 1}
                      </span>
                      <span className="text-sm" style={{ color: C.text }}>{rule}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-sm mt-2" style={{ color: C.textMid }}>
          Premium users get all 4 templates + unlimited custom rules
        </p>
      </div>
    </section>
  )
}

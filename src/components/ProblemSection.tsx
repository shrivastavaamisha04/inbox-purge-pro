import { useState } from 'react'
import { motion } from 'framer-motion'
import { C, VP, stagger, fadeUpChild } from '../lib/design'
import { SectionHeading, TiltCard } from './ui'

const CARDS = [
  {
    emoji: '📧',
    title: '6,342 Unread Emails',
    desc: 'Your inbox is drowning. Generic filters don\'t work because YOUR preferences are unique — what\'s spam to you is gold to someone else.',
  },
  {
    emoji: '🤖',
    title: 'One-Size-Fits-All Tools',
    desc: 'Most email tools use the same rules for everyone. But you\'re not everyone. Your inbox needs your brain, not a template.',
  },
  {
    emoji: '⏰',
    title: 'Hours Wasted Weekly',
    desc: 'Manually sorting, deleting, unsubscribing. You spend 30+ minutes a week on email maintenance. There\'s a smarter way.',
  },
]

function ProblemCard({ card }: { card: typeof CARDS[0] }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <TiltCard
      className="p-5 md:p-8 h-full"
      style={{ background: C.cream, border: `1px solid ${C.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
    >
      {/* Mobile: emoji + title inline */}
      <div className="flex items-center gap-3 md:block">
        <div className="text-3xl md:text-4xl flex-shrink-0 md:mb-5">{card.emoji}</div>
        <h3 className="text-base md:text-xl font-bold md:mb-3" style={{ color: C.navy }}>{card.title}</h3>
      </div>

      {/* Mobile: description with read more/less */}
      <div className="md:hidden mt-2">
        <p className="text-sm leading-relaxed" style={{ color: C.textMid, display: expanded ? 'block' : '-webkit-box', WebkitLineClamp: expanded ? undefined : 2, WebkitBoxOrient: 'vertical', overflow: expanded ? 'visible' : 'hidden' } as React.CSSProperties}>
          {card.desc}
        </p>
        <button
          onClick={() => setExpanded(e => !e)}
          className="text-xs font-semibold mt-1"
          style={{ color: C.orange }}
        >
          {expanded ? 'Read less ↑' : 'Read more ↓'}
        </button>
      </div>

      {/* Desktop: always show full description */}
      <p className="hidden md:block leading-relaxed mt-3" style={{ color: C.textMid }}>{card.desc}</p>
    </TiltCard>
  )
}

export default function ProblemSection() {
  return (
    <section id="problem" className="py-8 md:py-24" style={{ background: C.white }}>
      <div className="container mx-auto px-4 md:px-6">
        <SectionHeading
          label="😩 Sound familiar?"
          title="Email is broken for everyone"
          subtitle="You didn't sign up for inbox chaos. Here's what's really happening — and why generic tools fail."
        />

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={VP}
          className="grid md:grid-cols-3 gap-4 md:gap-6"
        >
          {CARDS.map((card) => (
            <motion.div key={card.title} variants={fadeUpChild}>
              <ProblemCard card={card} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

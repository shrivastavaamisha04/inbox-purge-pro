import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { C, VP, stagger, fadeUpChild } from '../lib/design'
import { SectionHeading } from './ui'

const FAQS = [
  {
    q: 'How does Smart AI work?',
    a: 'Smart AI tracks which emails you actually open, click, and delete. Over time, it learns YOUR unique patterns — not generic rules applied to everyone. The more you use it, the smarter it gets. You can also layer custom rules written in plain English on top.',
  },
  {
    q: 'What are "Custom Rules in Plain English"?',
    a: 'Just describe what you want! Example: "Archive promotional emails from fashion brands, except Zara." Our AI understands context, exceptions, and nuance — then creates the rule for you. No coding or complex filter syntax required.',
  },
  {
    q: "What's the difference between Free and Premium?",
    a: 'Free uses basic keyword rules applied the same way for everyone — good for a one-time clean of 50 emails. Premium uses Smart AI that learns from YOUR behavior, includes 4 persona templates, unlimited custom rules, weekly auto-cleanup, and gets personalised over time.',
  },
  {
    q: 'Can I test rules before applying them?',
    a: 'Yes! Premium users can preview any rule on 10 sample emails before applying it to the entire inbox. This prevents false positives and lets you fine-tune rules until they\'re perfect.',
  },
  {
    q: 'What are Persona Templates?',
    a: 'Pre-built rule sets for different user types: Busy Professional, Entrepreneur/Founder, Student, and Job Seeker. Choose one and we auto-generate smart rules tailored to your inbox context. You can customise them or add more rules.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Absolutely. No contracts, no lock-in. Cancel anytime from your dashboard and you\'ll retain access until the end of your billing period. We don\'t make cancellation difficult.',
  },
  {
    q: 'Is my data safe?',
    a: 'We read email metadata (sender, subject, date) for basic categorization. For advanced custom rules that require understanding email intent, our AI analyzes email content using secure, encrypted connections. Your emails are never stored — we only process them in real-time. All data is encrypted in transit and at rest.',
  },
  {
    q: 'How is this different from other email managers?',
    a: 'We\'re the only tool combining behavioral AI + plain English custom rules + persona templates. Most other email managers use the same rule sets for everyone. We build a model unique to you — the more you use it, the smarter it gets.',
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ borderBottom: `1px solid ${C.border}` }}>
      <button
        className="w-full text-left py-5 flex items-start justify-between gap-4"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="font-semibold text-base pr-2 leading-snug" style={{ color: C.navy }}>{q}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="flex-shrink-0 mt-0.5 font-bold"
          style={{ color: C.orange }}
        >
          ↓
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <p className="pb-5 text-sm leading-relaxed" style={{ color: C.textMid }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQSection() {
  return (
    <section id="faq" className="py-24" style={{ background: C.white }}>
      <div className="container mx-auto px-6">
        <SectionHeading
          label="❓ FAQs"
          title="Everything You Need to Know"
          subtitle="Everything answered. Use the contact form below if you need more help."
        />

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={VP}
          className="max-w-2xl mx-auto"
        >
          {FAQS.map((item) => (
            <motion.div key={item.q} variants={fadeUpChild}>
              <FAQItem q={item.q} a={item.a} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

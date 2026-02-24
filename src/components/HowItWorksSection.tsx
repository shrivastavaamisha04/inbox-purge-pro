import { motion } from 'framer-motion'
import { C, VP, slideLeft, slideRight, fadeUp } from '../lib/design'
import { SectionHeading } from './ui'

const STEPS = [
  {
    num: '01',
    title: 'Connect Gmail',
    desc: 'One-click OAuth. We never read email content — only metadata (sender, subject, date). Your emails stay private.',
    icon: '🔗',
    variants: slideLeft,
  },
  {
    num: '02',
    title: 'Choose Your Setup',
    desc: 'Pick a persona template (Professional, Entrepreneur, Student, Job Seeker) OR write custom rules in plain English.',
    icon: '⚙️',
    variants: fadeUp,
  },
  {
    num: '03',
    title: 'AI Analyses & Learns',
    desc: 'Smart AI tracks what you open, click, and delete. It builds a model of YOUR preferences — not a generic template.',
    icon: '🧠',
    variants: fadeUp,
  },
  {
    num: '04',
    title: 'Watch the Magic',
    desc: 'Emails automatically tagged, sorted, and archived. Inbox Zero achieved in under 2 minutes. Set and forget.',
    icon: '✨',
    variants: slideRight,
  },
]

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-12 md:py-24" style={{ background: C.cream }}>
      <div className="container mx-auto px-4 md:px-6">
        <SectionHeading
          label="⚡ Quick start"
          title="Inbox Zero in 4 Steps"
          subtitle="From chaotic inbox to Inbox Zero in under 2 minutes."
        />

        {/* Steps grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connector line (desktop only) */}
          <div
            className="hidden lg:block absolute top-8 left-[calc(12.5%+2rem)] right-[calc(12.5%+2rem)] h-px"
            style={{ background: `linear-gradient(to right, ${C.orange}40, ${C.orangeLight}40)` }}
          />

          {STEPS.map((step) => (
            <motion.div
              key={step.num}
              variants={step.variants}
              initial="hidden"
              whileInView="visible"
              viewport={VP}
              className="relative text-center"
            >
              {/* Number badge */}
              <motion.div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 relative z-10"
                style={{
                  background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`,
                  boxShadow: `0 8px 24px rgba(255,107,53,0.30)`,
                }}
                whileHover={{ scale: 1.12, boxShadow: `0 16px 36px rgba(255,107,53,0.45)`, rotate: 3 }}
                transition={{ type: 'spring', stiffness: 320 }}
              >
                <span className="text-2xl">{step.icon}</span>
              </motion.div>

              {/* Step number */}
              <div className="text-xs font-mono font-bold mb-2 tracking-widest" style={{ color: C.orange }}>
                STEP {step.num}
              </div>

              <h3 className="text-lg font-bold mb-2" style={{ color: C.navy }}>{step.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: C.textMid }}>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

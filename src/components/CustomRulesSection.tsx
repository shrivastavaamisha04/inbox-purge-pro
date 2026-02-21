import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { C, VP, fadeUp, stagger, fadeUpChild } from '../lib/design'
import { SectionHeading, PrimaryButton } from './ui'

interface Demo {
  chip: string
  input: string
  rule: { name: string; conditions: string; exceptions: string; action: string; score: string }
}

const DEMOS: Demo[] = [
  {
    chip: 'Fashion Brands',
    input: 'Archive all promotional emails from fashion brands, except Zara and H&M because I actually shop there',
    rule: { name: 'Fashion Promotions Filter', conditions: 'Promotional + fashion brand domains', exceptions: 'zara.com, hm.com', action: 'Archive', score: '8 / 10' },
  },
  {
    chip: 'Investor Emails → Keep',
    input: 'Filter investor emails and mark them as important',
    rule: { name: 'Investor Priority', conditions: 'Sender: VC, investor, venture, fund', exceptions: 'None', action: 'Mark Important', score: '2 / 10' },
  },
  {
    chip: 'Sales Pitches → Trash',
    input: 'Sales pitches should go to trash, except from people I\'ve talked to before',
    rule: { name: 'Cold Outreach Filter', conditions: 'cold pitch, unsolicited offer, partnership', exceptions: 'Known contacts (replied)', action: 'Trash', score: '9 / 10' },
  },
  {
    chip: 'University → Archive',
    input: 'University updates can be archived — I graduated last year!',
    rule: { name: 'Alumni Cleanup', conditions: 'Sender from *.edu / university domains', exceptions: 'None', action: 'Archive', score: '7 / 10' },
  },
]

const RULE_FIELDS = [
  { label: 'Rule Name',   key: 'name'       as const },
  { label: 'Conditions',  key: 'conditions'  as const },
  { label: 'Exceptions',  key: 'exceptions'  as const },
  { label: 'Action',      key: 'action'      as const },
  { label: 'Trashiness',  key: 'score'       as const },
]

// ── Typing hook ───────────────────────────────────────────────────────────────
function useTyping(text: string, speed = 36, active: boolean) {
  const [idx, setIdx] = useState(0)
  useEffect(() => { setIdx(0) }, [text])
  useEffect(() => {
    if (!active || idx >= text.length) return
    const t = setTimeout(() => setIdx((i) => i + 1), speed)
    return () => clearTimeout(t)
  }, [active, idx, text, speed])
  return { displayed: text.slice(0, idx), done: idx >= text.length }
}

// ── Demo panel ────────────────────────────────────────────────────────────────
function DemoPanel({ demoIdx, active }: { demoIdx: number; active: boolean }) {
  const demo = DEMOS[demoIdx]
  const { displayed, done } = useTyping(demo.input, 36, active)

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={demoIdx}
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -16 }}
        transition={{ duration: 0.3 }}
        className="grid md:grid-cols-2 gap-0 md:gap-0 rounded-2xl overflow-hidden"
        style={{ border: `1px solid ${C.border}`, boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}
      >
        {/* Left: user input */}
        <div className="p-7" style={{ background: C.cream, borderRight: `1px solid ${C.border}` }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-xs ml-2 font-medium" style={{ color: C.textMid }}>Your instruction</span>
          </div>
          <div
            className="min-h-[110px] text-base leading-relaxed font-mono"
            style={{ color: C.navy }}
          >
            {displayed}
            {!done && (
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-0.5 h-4 ml-0.5 rounded-full align-middle"
                style={{ background: C.orange }}
              />
            )}
          </div>
        </div>

        {/* Right: AI output */}
        <div className="p-7" style={{ background: C.white }}>
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white"
              style={{ background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})` }}
            >
              ✨
            </div>
            <span className="text-xs font-semibold" style={{ color: C.orange }}>AI Understands</span>
          </div>

          <AnimatePresence>
            {done && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
                className="space-y-3"
              >
                {RULE_FIELDS.map(({ label, key }) => (
                  <motion.div
                    key={key}
                    variants={{ hidden: { opacity: 0, x: 10 }, visible: { opacity: 1, x: 0 } }}
                    className="flex items-start gap-2"
                  >
                    <span className="text-xs mt-0.5 flex-shrink-0" style={{ color: C.orange }}>→</span>
                    <div>
                      <span className="text-xs font-semibold mr-2" style={{ color: C.textMid }}>{label}:</span>
                      <span className="text-sm font-medium" style={{ color: C.navy }}>{demo.rule[key]}</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {!done && (
            <div className="space-y-2">
              {[70, 50, 85, 45, 60].map((w, i) => (
                <div key={i} className="h-4 rounded-full animate-pulse" style={{ width: `${w}%`, background: `rgba(255,107,53,0.08)` }} />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── CustomRulesSection ────────────────────────────────────────────────────────
export default function CustomRulesSection({ onOpenModal }: { onOpenModal: () => void }) {
  const [demoIdx, setDemoIdx] = useState(0)
  const [active, setActive] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  // Trigger when section enters viewport
  useEffect(() => { if (inView) setActive(true) }, [inView])

  // Auto-advance demos
  const demo = DEMOS[demoIdx]
  const charsDone = demo.input.length

  useEffect(() => {
    if (!active) return
    // Typing at ~36ms/char + 3.5s pause
    const totalMs = charsDone * 36 + 3500
    const t = setTimeout(() => {
      setDemoIdx((i) => (i + 1) % DEMOS.length)
    }, totalMs)
    return () => clearTimeout(t)
  }, [active, demoIdx, charsDone])

  return (
    <section id="custom-rules" className="py-24" style={{ background: C.white }}>
      <div className="container mx-auto px-6" ref={ref}>
        <SectionHeading
          label="📝 Custom Rules"
          title={<><span className="shimmer-text">Just Tell Us What You Want.</span></>}
          subtitle="Describe any rule in plain English. Our AI parses it, creates conditions, handles exceptions, and applies it to your inbox."
        />

        {/* Chip selector */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={VP}
          className="flex flex-wrap gap-2 justify-center mb-8"
        >
          {DEMOS.map((d, i) => (
            <motion.button
              key={d.chip}
              variants={fadeUpChild}
              onClick={() => { setDemoIdx(i); setActive(true) }}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={{
                background: i === demoIdx ? 'rgba(255,107,53,0.12)' : C.cream,
                border: i === demoIdx ? `1.5px solid rgba(255,107,53,0.4)` : `1px solid ${C.border}`,
                color: i === demoIdx ? C.orange : C.textMid,
              }}
            >
              {d.chip}
            </motion.button>
          ))}
        </motion.div>

        {/* Demo */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={VP} className="max-w-3xl mx-auto mb-8">
          <DemoPanel demoIdx={demoIdx} active={active} />
        </motion.div>

        <div className="text-center">
          <PrimaryButton onClick={onOpenModal} className="px-10">Try It Free</PrimaryButton>
          <p className="text-sm mt-3" style={{ color: C.textMid }}>Included in Premium · Test rules before applying</p>
        </div>
      </div>
    </section>
  )
}

import { motion } from 'framer-motion'
import { C, VP, slideLeft, slideRight, fadeUp } from '../lib/design'
import { SectionHeading, TiltCard } from './ui'

const AI_CARDS = [
  {
    icon: '👀',
    title: 'Tracks What You Actually Read',
    desc: 'Opens, clicks, deletes — we analyze YOUR behavior patterns, not generic keyword rules that work the same for everyone.',
    stat: 'Learns from 100s of past interactions',
    statIcon: '📊',
    variants: slideLeft,
  },
  {
    icon: '🎯',
    title: 'Speaks Plain English',
    desc: 'Just describe what you want: "Archive sales emails except from Zara." Our AI understands context, exceptions, and nuance.',
    stat: 'No code. No complex filters.',
    statIcon: '💬',
    variants: fadeUp,
  },
  {
    icon: '📈',
    title: 'Gets Smarter Over Time',
    desc: 'Every email you process teaches the AI more about your unique preferences. Week 4 is smarter than Week 1.',
    stat: 'Accuracy improves weekly',
    statIcon: '🚀',
    variants: slideRight,
  },
]

// Mini sparkline for the "gets smarter" card
function SparkLine() {
  const points = [20, 35, 28, 50, 45, 65, 60, 78, 85, 94]
  const w = 120, h = 48
  const max = Math.max(...points), min = Math.min(...points)
  const toY = (v: number) => h - ((v - min) / (max - min)) * (h - 4) - 2
  const toX = (i: number) => (i / (points.length - 1)) * w
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(p)}`).join(' ')

  return (
    <svg width={w} height={h} className="overflow-visible">
      <defs>
        <linearGradient id="spark" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={C.orange} stopOpacity="0.5" />
          <stop offset="100%" stopColor={C.orangeLight} />
        </linearGradient>
      </defs>
      <path d={d} fill="none" stroke="url(#spark)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={toX(points.length - 1)} cy={toY(points[points.length - 1])} r={4} fill={C.orange} />
    </svg>
  )
}

export default function HowAIWorksSection() {
  return (
    <section id="how-ai-works" className="py-24" style={{ background: C.cream }}>
      <div className="container mx-auto px-6">
        <SectionHeading
          label="🧠 Smart AI"
          title="Three Ways Inbox Purge Gets Smarter"
          subtitle="This isn't keyword filtering. It's behavioral AI that adapts to you — and only you."
        />

        <div className="grid md:grid-cols-3 gap-6">
          {AI_CARDS.map((card) => (
            <motion.div
              key={card.title}
              variants={card.variants}
              initial="hidden"
              whileInView="visible"
              viewport={VP}
            >
              <TiltCard
                className="p-8 h-full"
                style={{ background: C.white, border: `1px solid ${C.border}`, boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}
              >
                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5"
                  style={{ background: 'rgba(255,107,53,0.08)' }}
                >
                  {card.icon}
                </div>

                <h3 className="text-xl font-bold mb-3" style={{ color: C.navy }}>{card.title}</h3>
                <p className="leading-relaxed mb-5" style={{ color: C.textMid }}>{card.desc}</p>

                {/* Stat / Visual */}
                {card.icon === '📈' ? (
                  <div className="mt-auto pt-3 border-t" style={{ borderColor: C.border }}>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-xs font-semibold mb-1" style={{ color: C.textMid }}>Accuracy</div>
                        <div className="text-2xl font-bold" style={{ color: C.orange }}>94%</div>
                      </div>
                      <SparkLine />
                    </div>
                  </div>
                ) : (
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium"
                    style={{ background: 'rgba(255,107,53,0.06)', color: C.orange }}
                  >
                    <span>{card.statIcon}</span>
                    <span>{card.stat}</span>
                  </div>
                )}
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

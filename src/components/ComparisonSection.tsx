import { motion } from 'framer-motion'
import { C, VP, fadeUp } from '../lib/design'
import { SectionHeading } from './ui'

const ROWS = [
  { feature: 'Emails cleaned',            free: '50 one-time',     premium: '♾️ Unlimited'           },
  { feature: 'AI type',                   free: '🤖 Keywords',     premium: '🧠 Behavioral learning'  },
  { feature: 'Learns from email opens',   free: false,             premium: true                      },
  { feature: 'Learns from clicks/deletes',free: false,             premium: true                      },
  { feature: 'Persona templates',         free: false,             premium: '✅ 4 pre-built'           },
  { feature: 'Custom rules',              free: false,             premium: '✅ Unlimited'             },
  { feature: 'Plain English rules',       free: false,             premium: '✅ AI-powered'            },
  { feature: 'Test rules before applying',free: false,             premium: '✅ Preview 10 emails'     },
  { feature: 'Weekly auto-cleanup',       free: false,             premium: true                      },
  { feature: 'Gets smarter over time',    free: false,             premium: true                      },
  { feature: 'Priority support',          free: false,             premium: '✅ Email + Chat'          },
]

function Cell({ value }: { value: boolean | string }) {
  if (value === true)  return <span className="text-green-500 text-lg">✅</span>
  if (value === false) return <span className="text-gray-300 text-lg">❌</span>
  return <span className="text-sm font-medium" style={{ color: C.text }}>{value}</span>
}

export default function ComparisonSection() {
  return (
    <section id="comparison" className="py-24" style={{ background: C.cream }}>
      <div className="container mx-auto px-6">
        <SectionHeading
          label="⚖️ Compare plans"
          title="Basic AI vs Smart AI"
          subtitle="See exactly what changes when you upgrade — no surprises."
        />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={VP}
          className="max-w-3xl mx-auto overflow-x-auto"
        >
          <table className="w-full min-w-[520px] rounded-2xl overflow-hidden" style={{ borderCollapse: 'separate', borderSpacing: 0, border: `1px solid ${C.border}` }}>
            {/* Header */}
            <thead>
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold" style={{ background: C.creamWarm, color: C.textMid, borderBottom: `1px solid ${C.border}` }}>
                  Feature
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold" style={{ background: C.creamWarm, color: C.navyMid, borderBottom: `1px solid ${C.border}` }}>
                  Basic AI
                  <div className="font-normal text-xs mt-0.5" style={{ color: C.textMid }}>Free Forever</div>
                </th>
                <th
                  className="px-6 py-4 text-center text-sm font-bold"
                  style={{
                    background: 'rgba(255,107,53,0.06)',
                    color: C.orange,
                    borderBottom: `1px solid rgba(255,107,53,0.2)`,
                    borderLeft: `1.5px solid rgba(255,107,53,0.2)`,
                  }}
                >
                  Smart AI ⭐
                  <div className="font-normal text-xs mt-0.5" style={{ color: C.textMid }}>₹89 / month</div>
                </th>
              </tr>
            </thead>

            <tbody>
              {ROWS.map((row, i) => (
                <tr key={row.feature} style={{ background: i % 2 === 0 ? C.white : C.cream }}>
                  <td className="px-6 py-3.5 text-sm font-medium" style={{ color: C.text, borderBottom: `1px solid ${C.border}` }}>
                    {row.feature}
                  </td>
                  <td className="px-6 py-3.5 text-center" style={{ borderBottom: `1px solid ${C.border}` }}>
                    <Cell value={row.free} />
                  </td>
                  <td
                    className="px-6 py-3.5 text-center"
                    style={{
                      borderBottom: `1px solid rgba(255,107,53,0.1)`,
                      borderLeft: `1.5px solid rgba(255,107,53,0.15)`,
                      background: i % 2 === 0 ? 'rgba(255,107,53,0.025)' : 'rgba(255,107,53,0.04)',
                    }}
                  >
                    <Cell value={row.premium} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer note */}
          <p className="text-center text-sm mt-5" style={{ color: C.textMid }}>
            Smart AI vs other email tools — same results, <strong style={{ color: C.navy }}>fraction of the price</strong>
          </p>
        </motion.div>
      </div>
    </section>
  )
}

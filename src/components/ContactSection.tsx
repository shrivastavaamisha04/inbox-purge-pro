import { useState } from 'react'
import { motion } from 'framer-motion'
import { C, VP, fadeUp } from '../lib/design'
import { SectionHeading, PrimaryButton } from './ui'

export default function ContactSection() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)

    await fetch('https://formspree.io/f/YOUR_ID', {
      method: 'POST',
      body: data,
      headers: { Accept: 'application/json' },
    })

    setSubmitted(true)
  }

  return (
    <section id="contact" className="py-24" style={{ background: C.creamWarm }}>
      <div className="container mx-auto px-6">
        <SectionHeading
          label="📬 Get in Touch"
          title="Have Questions?"
          subtitle="We'd love to hear from you. Fill in the form and we'll get back to you within 24 hours."
        />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={VP}
          className="max-w-xl mx-auto"
        >
          {submitted ? (
            <div
              className="rounded-2xl p-10 text-center"
              style={{ background: C.white, border: `1.5px solid rgba(255,107,53,0.25)`, boxShadow: '0 4px 24px rgba(255,107,53,0.08)' }}
            >
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-xl font-bold mb-2" style={{ color: C.navy }}>Message sent!</h3>
              <p className="text-sm" style={{ color: C.textMid }}>
                Thanks for reaching out. We'll get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl p-8"
              style={{ background: C.white, border: `1px solid ${C.border}`, boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}
            >
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: C.navy }}>
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: C.cream,
                      border: `1px solid ${C.border}`,
                      color: C.text,
                    }}
                    onFocus={(e) => (e.target.style.borderColor = C.orange)}
                    onBlur={(e) => (e.target.style.borderColor = C.border)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: C.navy }}>
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: C.cream,
                      border: `1px solid ${C.border}`,
                      color: C.text,
                    }}
                    onFocus={(e) => (e.target.style.borderColor = C.orange)}
                    onBlur={(e) => (e.target.style.borderColor = C.border)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: C.navy }}>
                    Message
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    placeholder="Tell us what's on your mind..."
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all resize-none"
                    style={{
                      background: C.cream,
                      border: `1px solid ${C.border}`,
                      color: C.text,
                    }}
                    onFocus={(e) => (e.target.style.borderColor = C.orange)}
                    onBlur={(e) => (e.target.style.borderColor = C.border)}
                  />
                </div>

                <PrimaryButton className="w-full">Send Message →</PrimaryButton>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  )
}

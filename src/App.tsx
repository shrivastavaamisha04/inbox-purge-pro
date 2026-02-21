import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { C, ease } from './lib/design'
import { PrimaryButton } from './components/ui'
import AnimatedBackground    from './components/AnimatedBackground'
import LoadingScreen         from './components/LoadingScreen'
import HeroSection           from './components/HeroSection'
import ProblemSection        from './components/ProblemSection'
import HowAIWorksSection     from './components/HowAIWorksSection'
import CustomRulesSection    from './components/CustomRulesSection'
import PersonaSection        from './components/PersonaSection'
import ComparisonSection     from './components/ComparisonSection'
import PricingSection        from './components/PricingSection'
import HowItWorksSection     from './components/HowItWorksSection'
import FAQSection            from './components/FAQSection'
import CTASection            from './components/CTASection'
import SiteFooter            from './components/SiteFooter'

const NAV_LINKS = [
  { label: 'Problem',    href: '#problem'     },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing',    href: '#pricing'     },
  { label: 'FAQ',        href: '#faq'         },
]

// ── Nav ───────────────────────────────────────────────────────────────────────
function SiteNav({ loading }: { loading: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLink = (href: string) => {
    setMenuOpen(false)
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={loading ? { opacity: 0, y: -16 } : { opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease }}
      className="sticky top-0 z-40"
      style={{ background: 'rgba(250,248,245,0.85)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${C.border}` }}
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 font-bold text-xl" style={{ color: C.navy }}>
          <span>📬</span>
          <span>Inbox Purge Pro</span>
        </div>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ label, href }) => (
            <button
              key={href}
              onClick={() => handleLink(href)}
              className="text-sm font-medium transition-opacity hover:opacity-60"
              style={{ color: C.navyMid }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <PrimaryButton className="hidden md:inline-flex px-5 py-2.5 text-base">
            Try Free
          </PrimaryButton>

          {/* Hamburger */}
          <button
            className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg"
            style={{ background: C.creamWarm }}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <motion.span
              animate={menuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              className="block w-5 h-0.5 rounded-full"
              style={{ background: C.navy }}
            />
            <motion.span
              animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
              className="block w-5 h-0.5 rounded-full"
              style={{ background: C.navy }}
            />
            <motion.span
              animate={menuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              className="block w-5 h-0.5 rounded-full"
              style={{ background: C.navy }}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden', borderTop: `1px solid ${C.border}` }}
            className="md:hidden"
          >
            <div className="container mx-auto px-6 py-5 flex flex-col gap-4">
              {NAV_LINKS.map(({ label, href }) => (
                <button
                  key={href}
                  onClick={() => handleLink(href)}
                  className="text-left text-base font-medium py-1"
                  style={{ color: C.navyMid }}
                >
                  {label}
                </button>
              ))}
              <PrimaryButton className="w-full">Try Free – No Card Required</PrimaryButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [loading, setLoading] = useState(true)

  return (
    <>
      <AnimatePresence>
        {loading && <LoadingScreen key="loader" onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      <div style={{ background: C.cream, color: C.text }} className="relative min-h-screen overflow-x-hidden">
        <AnimatedBackground />

        <div className="relative z-10">
          <SiteNav loading={loading} />
          <HeroSection loading={loading} />
          <ProblemSection />
          <HowAIWorksSection />
          <CustomRulesSection />
          <PersonaSection />
          <ComparisonSection />
<HowItWorksSection />
          <PricingSection />
          <FAQSection />
          <CTASection />
<SiteFooter />
        </div>
      </div>
    </>
  )
}

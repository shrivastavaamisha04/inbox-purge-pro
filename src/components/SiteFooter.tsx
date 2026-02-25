import { C } from '../lib/design'

const PRODUCT_LINKS = [
  { label: 'Features',     href: '#how-ai-works', mobileHide: false },
  { label: 'Pricing',      href: '#pricing',      mobileHide: false },
  { label: 'How It Works', href: '#how-it-works', mobileHide: false },
  { label: 'Personas',     href: '#personas',     mobileHide: true  },
]

const COMPANY_LINKS = [
  { label: 'About',   href: '#problem',                         mobileHide: false },
  { label: 'Contact', href: 'mailto:amishashrivastavaa@gmail.com', mobileHide: false },
]

function scrollTo(href: string) {
  if (href.startsWith('mailto:')) {
    window.location.href = href
    return
  }
  document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
}

export default function SiteFooter() {
  return (
    <footer style={{ background: C.navy }}>
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-10 mb-12">

          {/* Brand column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 font-bold text-xl text-white mb-3">
              <span>📬</span>
              <span>Inbox Purge Pro</span>
            </div>
            <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.50)' }}>
              Email management that speaks your language. AI-powered, privacy-first, made in India.
            </p>
            <div className="flex gap-3">
              {['𝕏', 'in'].map((icon) => (
                <a
                  key={icon}
                  href="#"
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-colors hover:bg-white/20"
                  style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Product links */}
          <div>
            <div className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Product
            </div>
            <ul className="space-y-3">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.label} className={link.mobileHide ? 'hidden md:block' : ''}>
                  <button
                    onClick={() => scrollTo(link.href)}
                    className="text-sm transition-colors hover:text-white text-left"
                    style={{ color: 'rgba(255,255,255,0.55)' }}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <div className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Company
            </div>
            <ul className="space-y-3">
              {COMPANY_LINKS.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollTo(link.href)}
                    className="text-sm transition-colors hover:text-white text-left"
                    style={{ color: 'rgba(255,255,255,0.55)' }}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-8 flex flex-col md:flex-row items-center justify-between gap-3 text-sm"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}
        >
          <span>© 2026 Inbox Purge Pro. All rights reserved.</span>
          <span>Built with ❤️ in India</span>
        </div>
      </div>
    </footer>
  )
}

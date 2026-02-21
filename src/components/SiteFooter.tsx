import { C } from '../lib/design'

const LINKS = {
  Product: ['Features', 'Pricing', 'How It Works', 'Personas'],
  Company: ['About', 'Contact'],
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

          {/* Link columns */}
          {Object.entries(LINKS).map(([category, items]) => (
            <div key={category}>
              <div className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {category}
              </div>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm transition-colors hover:text-white"
                      style={{ color: 'rgba(255,255,255,0.55)' }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
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

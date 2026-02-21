// ── Shared design tokens ─────────────────────────────────────────────────────
export const C = {
  orange:      '#FF6B35',
  orangeLight: '#FF8C42',
  orangeDark:  '#E84A1D',
  navy:        '#1A1A2E',
  navyMid:     '#2C3E50',
  text:        '#2D3142',
  textMid:     '#5C5F70',
  cream:       '#FAF8F5',
  creamWarm:   '#F5F1EB',
  white:       '#FFFFFF',
  border:      'rgba(0,0,0,0.06)',
  green:       '#16A34A',
  red:         '#DC2626',
} as const

export const ease = [0.4, 0, 0.2, 1] as const
export const VP   = { once: true, margin: '-70px' } as const

// ── Reusable motion variants ─────────────────────────────────────────────────
export const fadeUp = {
  hidden:  { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.65, ease } },
}
export const fadeUpChild = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.55, ease } },
}
export const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.13 } },
}
export const staggerSlow = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.22 } },
}
export const slideLeft = {
  hidden:  { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0,  transition: { duration: 0.65, ease } },
}
export const slideRight = {
  hidden:  { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0,  transition: { duration: 0.65, ease } },
}
export const scaleIn = {
  hidden:  { opacity: 0, scale: 0.90 },
  visible: { opacity: 1, scale: 1,   transition: { duration: 0.55, ease } },
}

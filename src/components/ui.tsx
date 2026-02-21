import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { C, ease } from '../lib/design'

// ── SectionLabel pill ────────────────────────────────────────────────────────
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
      style={{ background: 'rgba(255,107,53,0.08)', border: `1px solid rgba(255,107,53,0.22)`, color: C.orange }}
    >
      {children}
    </div>
  )
}

// ── SectionHeading ────────────────────────────────────────────────────────────
export function SectionHeading({
  label, title, subtitle, align = 'center',
}: {
  label?: React.ReactNode
  title: React.ReactNode
  subtitle?: string
  align?: 'center' | 'left'
}) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease } } }}
      initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-70px' }}
      className={`mb-14 ${align === 'center' ? 'text-center' : 'text-left'}`}
    >
      {label && <SectionLabel>{label}</SectionLabel>}
      <h2 className="text-4xl md:text-5xl font-bold leading-tight" style={{ color: C.navy }}>{title}</h2>
      {subtitle && (
        <p className={`text-lg mt-4 leading-relaxed ${align === 'center' ? 'max-w-xl mx-auto' : 'max-w-2xl'}`} style={{ color: C.textMid }}>
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}

// ── TiltCard ──────────────────────────────────────────────────────────────────
export function TiltCard({
  children, className = '', style, onClick,
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
}) {
  const [rot, setRot] = useState({ x: 0, y: 0 })
  const ref = useRef<HTMLDivElement>(null)

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    setRot({ x: ((e.clientY - r.top) / r.height - 0.5) * -7, y: ((e.clientX - r.left) / r.width - 0.5) * 7 })
  }

  return (
    <motion.div
      ref={ref} onMouseMove={onMove} onMouseLeave={() => setRot({ x: 0, y: 0 })} onClick={onClick}
      animate={{ rotateX: rot.x, rotateY: rot.y }}
      whileHover={{ y: -5, boxShadow: '0 24px 48px rgba(0,0,0,0.10)', transition: { type: 'spring', stiffness: 280, damping: 26 } }}
      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
      style={{ transformStyle: 'preserve-3d', ...style }}
      className={`rounded-2xl ${className}`}
    >
      {children}
    </motion.div>
  )
}

// ── PrimaryButton ─────────────────────────────────────────────────────────────
export function PrimaryButton({
  children, className = '', onClick,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.04, y: -2, boxShadow: '0 18px 40px rgba(255,107,53,0.38)' }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{ background: `linear-gradient(135deg, ${C.orange}, ${C.orangeLight})`, boxShadow: `0 8px 24px rgba(255,107,53,0.28)` }}
      className={`text-white px-8 py-4 rounded-xl font-semibold text-lg ${className}`}
    >
      {children}
    </motion.button>
  )
}

// ── SecondaryButton ───────────────────────────────────────────────────────────
export function SecondaryButton({
  children, className = '', onClick,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.04, y: -2, boxShadow: `0 12px 28px rgba(255,107,53,0.15)` }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{ borderColor: C.orange, color: C.orange }}
      className={`bg-white border-2 px-8 py-4 rounded-xl font-semibold text-lg ${className}`}
    >
      {children}
    </motion.button>
  )
}

// ── CheckItem ─────────────────────────────────────────────────────────────────
export function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span
        className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
        style={{ background: 'rgba(255,107,53,0.12)', color: C.orange }}
      >
        ✓
      </span>
      <span style={{ color: C.textMid }}>{children}</span>
    </li>
  )
}

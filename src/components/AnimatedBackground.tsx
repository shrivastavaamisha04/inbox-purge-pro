import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface BlobConfig {
  size: number
  color: string
  left: string
  top: string
  yRange: number
  duration: number
  animX: number[]
  animY: number[]
  radii: string[]
}

const BLOBS: BlobConfig[] = [
  {
    size: 900,
    color: 'rgba(255, 107, 53, 0.10)',
    left: '-12%',
    top: '-8%',
    yRange: -140,
    duration: 28,
    animX: [0, 70, -35, 0],
    animY: [0, -55, 35, 0],
    radii: [
      '60% 40% 30% 70% / 60% 30% 70% 40%',
      '40% 60% 70% 30% / 50% 60% 40% 50%',
      '60% 40% 30% 70% / 60% 30% 70% 40%',
    ],
  },
  {
    size: 750,
    color: 'rgba(255, 180, 162, 0.13)',
    left: '58%',
    top: '8%',
    yRange: -90,
    duration: 24,
    animX: [0, -55, 45, 0],
    animY: [0, 65, -30, 0],
    radii: [
      '40% 60% 70% 30% / 40% 50% 60% 50%',
      '70% 30% 40% 60% / 60% 40% 50% 40%',
      '40% 60% 70% 30% / 40% 50% 60% 50%',
    ],
  },
  {
    size: 620,
    color: 'rgba(255, 140, 66, 0.08)',
    left: '28%',
    top: '58%',
    yRange: -60,
    duration: 32,
    animX: [0, 45, -60, 0],
    animY: [0, -45, 55, 0],
    radii: [
      '30% 70% 50% 50% / 30% 30% 70% 70%',
      '70% 30% 50% 50% / 50% 70% 30% 50%',
      '30% 70% 50% 50% / 30% 30% 70% 70%',
    ],
  },
  {
    size: 500,
    color: 'rgba(255, 220, 200, 0.12)',
    left: '72%',
    top: '55%',
    yRange: -50,
    duration: 20,
    animX: [0, -35, 50, 0],
    animY: [0, 40, -50, 0],
    radii: [
      '50% 50% 40% 60% / 50% 40% 60% 50%',
      '40% 60% 50% 50% / 60% 50% 40% 60%',
      '50% 50% 40% 60% / 50% 40% 60% 50%',
    ],
  },
]

export default function AnimatedBackground() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  const { scrollY } = useScroll()

  // Independent parallax depth for each blob
  const y0 = useTransform(scrollY, [0, 3000], [0, BLOBS[0].yRange])
  const y1 = useTransform(scrollY, [0, 3000], [0, BLOBS[1].yRange])
  const y2 = useTransform(scrollY, [0, 3000], [0, BLOBS[2].yRange])
  const y3 = useTransform(scrollY, [0, 3000], [0, BLOBS[3].yRange])
  const parallaxYs = [y0, y1, y2, y3]

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (isMobile) return null

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {BLOBS.map((blob, i) => (
        // Outer: handles parallax scroll
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            left: blob.left,
            top: blob.top,
            y: parallaxYs[i],
          }}
        >
          {/* Inner: handles organic morphing + drift */}
          <motion.div
            style={{
              width: blob.size,
              height: blob.size,
              background: `radial-gradient(circle at 40% 40%, ${blob.color}, transparent 70%)`,
              filter: 'blur(72px)',
            }}
            animate={{
              x: blob.animX,
              y: blob.animY,
              borderRadius: blob.radii,
            }}
            transition={{
              duration: blob.duration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      ))}
    </div>
  )
}

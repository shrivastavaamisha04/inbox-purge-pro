import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface LoadingScreenProps {
  onComplete: () => void
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const duration = 1800
    const start = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      const p = Math.min(Math.round((elapsed / duration) * 100), 100)
      setProgress(p)
      if (p >= 100) {
        clearInterval(interval)
        setTimeout(onComplete, 350)
      }
    }, 16)
    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-purple-950 via-blue-950 to-indigo-950"
      exit={{ opacity: 0, scale: 1.06 }}
      transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="text-center"
      >
        <motion.div
          className="text-6xl mb-6 inline-block"
          animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1 }}
        >
          📬
        </motion.div>

        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
          Inbox Purge Pro
        </h1>
        <p className="text-purple-300 mb-10 text-sm tracking-widest uppercase">
          Preparing your experience
        </p>

        {/* Progress bar */}
        <div className="w-72 h-0.5 bg-white/10 rounded-full overflow-hidden mx-auto">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.08 }}
          />
        </div>
        <p className="text-gray-500 text-xs mt-3 tabular-nums">{progress}%</p>
      </motion.div>
    </motion.div>
  )
}

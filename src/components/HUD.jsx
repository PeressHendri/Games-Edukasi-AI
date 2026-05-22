import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import useGameStore from '../store/gameStore'

// Light theme HUD

export function Timer() {
  const timeLeft = useGameStore(s => s.timeLeft)
  const urgent = timeLeft < 30
  const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  const timerRef = useRef(null)

  useEffect(() => {
    if (urgent) {
      gsap.to(timerRef.current, {
        scale: 1.08, duration: 0.3, yoyo: true, repeat: 1, ease: 'power2.inOut'
      })
    }
  }, [timeLeft, urgent])

  return (
    <div ref={timerRef}
      className="ws-score flex items-center gap-2 px-4 py-2 rounded-full text-lg"
      style={{
        background: urgent ? 'rgba(239,68,68,.08)' : 'rgba(79,70,229,.06)',
        border: `1.5px solid ${urgent ? 'rgba(239,68,68,.3)' : 'rgba(79,70,229,.15)'}`,
        color: urgent ? '#EF4444' : '#4F46E5',
      }}>
      <span>⏱️</span>
      <span>{fmt(timeLeft)}</span>
    </div>
  )
}

export function LivesDisplay() {
  const lives = useGameStore(s => s.lives)
  return (
    <div className="flex gap-1">
      {[0, 1, 2].map(i => (
        <motion.span key={i}
          animate={i >= lives ? { scale: .8, opacity: .3 } : { scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: .5 }}
          className="text-xl">
          {i < lives ? '❤️' : '🤍'}
        </motion.span>
      ))}
    </div>
  )
}

export function ScoreDisplay() {
  const score = useGameStore(s => s.score)
  const scoreRef = useRef(null)

  useEffect(() => {
    gsap.fromTo(scoreRef.current,
      { scale: 1.4, color: '#7C3AED' },
      { scale: 1, color: '#4F46E5', duration: 0.35, ease: 'back.out(2)' }
    )
  }, [score])

  return (
    <div className="ws-score flex items-center gap-2 px-4 py-2 rounded-full text-lg"
      style={{ background: 'rgba(79,70,229,.06)', border: '1.5px solid rgba(79,70,229,.15)', color: '#4F46E5' }}>
      <span>⭐</span>
      <span ref={scoreRef}>{score}</span>
    </div>
  )
}

export function HUD({ gameName }) {
  const hudRef = useRef(null)
  useEffect(() => {
    gsap.fromTo(hudRef.current,
      { y: -70, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out', delay: 0.1 }
    )
  }, [])

  return (
    <div ref={hudRef}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2"
      style={{
        background: 'rgba(255,255,255,.6)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,.8)',
        boxShadow: '0 4px 20px rgba(0,0,0,.08)',
      }}>
      <Timer />

      {/* Center: score + game badge inline */}
      <div className="flex items-center gap-2">
        <ScoreDisplay />
        {gameName && (
          <span className="ws-label inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full"
            style={{ background: 'rgba(99,102,241,.1)', color: '#6366F1', fontSize: '.58rem', border: '1px solid rgba(99,102,241,.2)' }}>
            🧩 {gameName}
          </span>
        )}
      </div>

      <LivesDisplay />
    </div>
  )
}

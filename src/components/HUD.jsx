import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import useGameStore from '../store/gameStore'
import { FikomLogo, InstagramBadge, FIKOM_URL } from './BrandBadge'

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
      className="ws-score flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-base sm:text-lg"
      style={{
        background: urgent ? 'rgba(220,38,38,.12)' : 'rgba(153,0,0,.08)',
        border: `1.5px solid ${urgent ? 'rgba(220,38,38,.45)' : 'rgba(153,0,0,.22)'}`,
        color: urgent ? '#DC2626' : '#990000',
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
          className="text-lg sm:text-xl">
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
      { scale: 1.4, color: '#D97706' },
      { scale: 1, color: '#990000', duration: 0.35, ease: 'back.out(2)' }
    )
  }, [score])

  return (
    <div className="ws-score flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-base sm:text-lg"
      style={{ background: 'rgba(153,0,0,.08)', border: '1.5px solid rgba(153,0,0,.22)', color: '#990000' }}>
      <span>⭐</span>
      <span ref={scoreRef}>{score}</span>
    </div>
  )
}

export function HUD({ gameName, gameIcon = '🎯' }) {
  const hudRef = useRef(null)
  useEffect(() => {
    gsap.fromTo(hudRef.current,
      { y: -70, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out', delay: 0.1 }
    )
  }, [])

  return (
    <div ref={hudRef}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-3 sm:px-5 py-2"
      style={{
        background: 'rgba(255,255,255,.88)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(153,0,0,.18)',
        boxShadow: '0 4px 20px rgba(0,0,0,.12)',
      }}>
      {/* Left: Clickable Brand + Timer */}
      <div className="flex items-center gap-2">
        <motion.a
          href={FIKOM_URL}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-red-200 shadow-sm cursor-pointer hover:border-red-400 transition-colors"
          title="Kunjungi Website Resmi FIKOM UKWMS (https://fikom.ukwms.ac.id/)"
        >
          <FikomLogo size={24} asLink={false} className="rounded-md" />
          <span className="hidden md:inline font-black text-[0.68rem] tracking-wider" style={{ color: '#7F1D1D' }}>
            FIKOM UKWMS
          </span>
        </motion.a>
        <Timer />
      </div>

      {/* Center: score + game badge inline */}
      <div className="flex items-center gap-2">
        <ScoreDisplay />
        {gameName && (
          <span className="ws-label hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(153,0,0,.1)', color: '#990000', fontSize: '.6rem', border: '1px solid rgba(153,0,0,.25)', fontWeight: 800 }}>
            {gameIcon} {gameName}
          </span>
        )}
      </div>

      {/* Right: Instagram + Lives */}
      <div className="flex items-center gap-2">
        <InstagramBadge compact />
        <LivesDisplay />
      </div>
    </div>
  )
}

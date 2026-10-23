import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import confetti from 'canvas-confetti'
import useGameStore, { formatPlayerIdentity } from './store/gameStore'
import { questions } from './games/TrueOrFalse/questions'
import PuzzleDragDrop from './games/PuzzleDragDrop/index'
import ExplanationPage from './games/PuzzleDragDrop/ExplanationPage'
import TrueOrFalse from './games/TrueOrFalse/index'
import Leaderboard from './components/Leaderboard'
import PlayerRecapModal from './components/PlayerRecapModal'
import { FikomBrandLink, InstagramBadge, BrandModalBadge } from './components/BrandBadge'

const shuffle = (a) => {
  const b = [...a]
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[b[i], b[j]] = [b[j], b[i]]
  }
  return b
}
const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

const P = '#990000'
const PL = '#DC2626'

/* ── Landing ── */
function Landing({ onOpenModal }) {
  const {
    setPlayerInfo,
    setScreen,
    initTF,
    resetGame,
    startTimer,
    isOnlineSync,
  } = useGameStore()

  const [rawName, setRawName] = useState('')
  const [kelas, setKelas] = useState('')
  const [school, setSchool] = useState('')
  const [err, setErr] = useState('')

  const containerRef = useRef(null)
  const titleRef = useRef(null)
  const formRef = useRef(null)
  const chipsRef = useRef(null)
  const boardRef = useRef(null)
  const iconsRef = useRef([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      gsap.set(iconsRef.current, { autoAlpha: 0, y: 30, scale: 0.6 })
      gsap.to(iconsRef.current, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        stagger: 0.1,
        delay: 0.1,
        ease: 'back.out(1.7)',
      })

      tl.fromTo(
        titleRef.current,
        { autoAlpha: 0, y: 40, skewY: 2 },
        { autoAlpha: 1, y: 0, skewY: 0, duration: 0.65, ease: 'power4.out' }
      )
      tl.fromTo(formRef.current, { autoAlpha: 0, y: 25 }, { autoAlpha: 1, y: 0, duration: 0.5 }, '-=.25')
      tl.fromTo(chipsRef.current, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.4 }, '-=.2')
      tl.fromTo(
        boardRef.current,
        { autoAlpha: 0, x: 45, scale: 0.95 },
        { autoAlpha: 1, x: 0, scale: 1, duration: 0.65, ease: 'power3.out' },
        '-=.5'
      )

      iconsRef.current.forEach((el, i) => {
        if (!el) return
        gsap.to(el, {
          y: -14,
          rotation: i % 2 === 0 ? 8 : -8,
          duration: 2.8 + i * 0.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.25,
        })
      })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  const start = () => {
    const n = rawName.trim()
    const k = kelas.trim()
    const s = school.trim()

    if (!n || !k || !s) {
      const missing = []
      if (!n) missing.push('Nama')
      if (!k) missing.push('Kelas')
      if (!s) missing.push('Asal Sekolah')
      setErr(`Mohon isi ${missing.join(', ')}!`)
      gsap.fromTo(
        formRef.current,
        { x: -8 },
        { x: 0, duration: 0.4, ease: 'elastic.out(1,.3)' }
      )
      setTimeout(() => setErr(''), 2500)
      return
    }

    const full = formatPlayerIdentity(n, k, s)

    gsap.to(containerRef.current, {
      autoAlpha: 0,
      scale: 0.96,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        resetGame()
        setPlayerInfo({ rawName: n, kelas: k, school: s, fullName: full })
        initTF(shuffle([...questions]))
        setScreen('trueorfalse')
        startTimer()
      },
    })
  }

  // 🎯 (busur panah) tombol rahasia Admin untuk Rekap Excel & Reset Leaderboard
  const floatIcons = [
    { e: '🎙️', top: '14%', left: '1.5%', size: '3.2rem' },
    { e: '🎬', top: '50%', left: '1%', size: '3rem' },
    { e: '🎯', top: '82%', left: '2%', size: '3rem' },
    { e: '🎥', top: '14%', right: '1.5%', size: '3.4rem' },
    { e: '📸', top: '48%', right: '1%', size: '3rem' },
    { e: '⭐', top: '78%', right: '2%', size: '3rem' },
  ]

  const inputStyle = {
    background: 'rgba(255, 255, 255, 0.94)',
    backdropFilter: 'blur(10px)',
    border: `1.5px solid ${err ? '#EF4444' : 'rgba(153, 0, 0, 0.22)'}`,
    color: '#1F2937',
    boxShadow: '0 3px 12px rgba(0, 0, 0, 0.08)',
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-y-auto overflow-x-hidden flex flex-col justify-between items-center"
      style={{
        backgroundImage: 'url(/bg-studio-fikom.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Transparan & ringan agar tulisan FIKOM UKWMS di dinding tengah terlihat tajam */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            'linear-gradient(135deg, rgba(10, 5, 5, 0.28) 0%, rgba(10, 5, 5, 0.15) 50%, rgba(10, 5, 5, 0.3) 100%)',
        }}
      />

      {/* Floating icons — 🎯 busur panah untuk Admin */}
      {floatIcons.map((ic, i) => {
        const isTarget = ic.e === '🎯'
        return (
          <span
            key={i}
            ref={(el) => (iconsRef.current[i] = el)}
            onClick={() => {
              if (isTarget) {
                const pass = window.prompt(
                  'Masukkan password Admin untuk Rekap Data Excel & Reset Leaderboard:'
                )
                if (pass === 'peress2026') {
                  onOpenModal?.('rekap')
                } else if (pass) {
                  alert('Password salah!')
                }
              }
            }}
            className={`fixed select-none ${
              isTarget
                ? 'cursor-pointer pointer-events-auto z-50 hover:scale-110 transition-transform'
                : 'pointer-events-none z-10 hidden sm:inline-block opacity-75'
            }`}
            style={{
              top: ic.top,
              left: ic.left,
              right: ic.right,
              fontSize: ic.size,
              filter: 'drop-shadow(0 8px 18px rgba(0,0,0,.3))',
              lineHeight: 1,
            }}
          >
            {ic.e}
          </span>
        )
      })}

      {/* ══ TOP BRAND NAVBAR (Transparan & Rapi) ══ */}
      <div
        className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-8 py-2.5 flex items-center justify-between gap-2"
        style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.65)',
          boxShadow: '0 2px 14px rgba(0, 0, 0, 0.05)',
        }}
      >
        <FikomBrandLink logoSize={38} />
        <InstagramBadge />
      </div>

      {/* ══ MAIN BODY: Digeser ke Kiri & Kanan (Tengah Luas untuk Logo FIKOM) ══ */}
      <div className="w-full max-w-[1360px] mx-auto flex flex-col lg:flex-row justify-between items-center z-10 px-4 sm:px-8 xl:px-12 pt-20 sm:pt-24 lg:pt-16 pb-6 min-h-[95vh]">
        {/* ══ SISI KIRI: Hero & 3 Form Input (Dikecilkan & Digeser ke Sisi Kiri) ══ */}
        <div className="w-full lg:max-w-[390px] xl:max-w-[420px] flex-shrink-0">
          {/* Title */}
          <div ref={titleRef} style={{ opacity: 0 }} className="mb-3">
            <h1
              className="ws-hero overflow-visible"
              style={{
                fontSize: 'clamp(2rem, 3.8vw, 3.2rem)',
                lineHeight: 1.05,
                paddingTop: '2px',
                paddingBottom: '4px',
              }}
            >
              <span
                style={{
                  display: 'block',
                  color: '#FFFFFF',
                  textShadow: '0 3px 16px rgba(0,0,0,0.7)',
                }}
              >
                Literasi
              </span>
              <span
                style={{
                  display: 'block',
                  color: '#FBBF24',
                  textShadow: '0 4px 20px rgba(153,0,0,0.85)',
                }}
              >
                Digital AI
              </span>
            </h1>
            <div
              style={{
                width: 90,
                height: 3.5,
                borderRadius: 2,
                background: 'linear-gradient(90deg, #DC2626, #FBBF24, transparent)',
                marginTop: 4,
              }}
            />
          </div>

          {/* Taglines */}
          <div
            className="block w-full max-w-[380px] px-3.5 py-2.5 rounded-2xl mb-3.5"
            style={{
              background: 'rgba(255,255,255,.86)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,.9)',
              boxShadow: '0 4px 16px rgba(0,0,0,.1)',
            }}
          >
            <p className="ws-body text-xs sm:text-sm mb-0.5 font-extrabold" style={{ color: '#7F1D1D' }}>
              Seberapa kritis kamu dalam menggunakan AI?
            </p>
            <p className="ws-caption text-[0.7rem] sm:text-xs font-semibold" style={{ color: '#4B5563' }}>
              Taklukkan <span className="font-bold text-red-700">1. True/False</span> &{' '}
              <span className="font-bold text-amber-600">2. Puzzle</span> dalam{' '}
              <span className="font-bold text-green-700 italic">5 menit</span>!
            </p>
          </div>

          {/* 3 Kolom Input Bersih: Nama, Kelas, dan Asal Sekolah */}
          <div ref={formRef} style={{ opacity: 0 }} className="w-full max-w-[380px] mb-3.5">
            <div className="flex flex-col gap-2">
              {/* Field 1: Nama */}
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base">👤</span>
                <input
                  type="text"
                  placeholder="Nama"
                  value={rawName}
                  onChange={(e) => {
                    setRawName(e.target.value)
                    setErr('')
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && start()}
                  maxLength={30}
                  className="w-full py-2.5 pl-11 pr-3 rounded-xl outline-none ws-body font-bold text-xs sm:text-sm transition-all"
                  style={inputStyle}
                />
              </div>

              {/* Field 2: Kelas */}
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base">🏷️</span>
                <input
                  type="text"
                  placeholder="Kelas"
                  value={kelas}
                  onChange={(e) => {
                    setKelas(e.target.value)
                    setErr('')
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && start()}
                  maxLength={20}
                  className="w-full py-2.5 pl-11 pr-3 rounded-xl outline-none ws-body font-bold text-xs sm:text-sm transition-all"
                  style={inputStyle}
                />
              </div>

              {/* Field 3: Asal Sekolah */}
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base">🏫</span>
                <input
                  type="text"
                  placeholder="Asal Sekolah"
                  value={school}
                  onChange={(e) => {
                    setSchool(e.target.value)
                    setErr('')
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && start()}
                  maxLength={50}
                  className="w-full py-2.5 pl-11 pr-3 rounded-xl outline-none ws-body font-bold text-xs sm:text-sm transition-all"
                  style={inputStyle}
                />
              </div>
            </div>

            {err && (
              <p
                className="text-[0.7rem] font-bold mt-1.5 px-2.5 py-1 rounded-lg inline-flex items-center gap-1"
                style={{ background: 'rgba(254,242,242,0.95)', color: '#DC2626', border: '1px solid #FECACA' }}
              >
                <span>⚠️</span> {err}
              </p>
            )}

            {/* CTA */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2, boxShadow: '0 12px 30px rgba(185,28,28,.4)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => start()}
              className="ws-btn mt-3 w-full py-3 rounded-xl text-sm sm:text-base text-white flex items-center justify-between px-5 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #7F1D1D, #B91C1C, #DC2626)',
                boxShadow: '0 8px 24px rgba(153,0,0,.35)',
                border: '1px solid rgba(251,191,36,0.35)',
              }}
            >
              <span
                className="font-bold text-sm sm:text-base text-white"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.25)' }}
              >
                Mulai Tantangan!
              </span>
              <span style={{ fontWeight: 900, color: '#FBBF24', fontSize: '1.15rem' }}>→</span>
            </motion.button>
          </div>

          {/* Info chips */}
          <div
            ref={chipsRef}
            style={{ opacity: 0 }}
            className="flex flex-wrap justify-start gap-1.5 max-w-[380px]"
          >
            {[
              { ic: '⏱️', label: '5 MENIT' },
              { ic: '❤️', label: '3 NYAWA' },
              { ic: '🎯', label: 'TRUE/FALSE' },
              { ic: '🧩', label: 'PUZZLE' },
              { ic: '🏆', label: 'LEADERBOARD' },
            ].map(({ ic, label }) => (
              <div
                key={label}
                className="flex items-center gap-1 px-2 py-1 rounded-lg border"
                style={{
                  background: 'rgba(255,255,255,.82)',
                  backdropFilter: 'blur(6px)',
                  borderColor: 'rgba(255,255,255,0.9)',
                  boxShadow: '0 2px 8px rgba(0,0,0,.06)',
                }}
              >
                <span className="text-xs">{ic}</span>
                <span className="ws-label font-extrabold" style={{ color: '#1F2937', fontSize: '.52rem' }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ══ SISI KANAN: Leaderboard (Dikecilkan, Transparan & Digeser ke Kanan) ══ */}
        <div
          ref={boardRef}
          style={{ opacity: 0 }}
          className="w-full lg:w-[335px] xl:w-[350px] flex-shrink-0 mt-6 lg:mt-0"
        >
          <div
            className="rounded-3xl overflow-hidden relative"
            style={{
              background: 'rgba(17, 24, 39, 0.32)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: '1px solid rgba(255, 255, 255, 0.22)',
              boxShadow: '0 16px 44px rgba(0, 0, 0, 0.25)',
            }}
          >
            {/* Header */}
            <div
              className="px-4 py-3 flex items-center gap-2.5"
              style={{
                borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg,#F59E0B,#FBBF24)',
                  boxShadow: '0 3px 10px rgba(245,158,11,0.3)',
                }}
              >
                🏆
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="ws-title text-sm text-white">Leaderboard</span>
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: isOnlineSync ? '#4ADE80' : '#FBBF24' }}
                    title={
                      isOnlineSync
                        ? 'Tersinkronisasi Online Antar-Device'
                        : 'Penyimpanan Lokal'
                    }
                  />
                </div>
                <div className="ws-caption text-[0.68rem]" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  Skor & Waktu Tercepat
                </div>
              </div>

              <span
                className="ws-label px-2 py-0.5 rounded-full self-center"
                style={{
                  background: 'rgba(255,255,255,0.16)',
                  color: '#FFFFFF',
                  fontSize: '.54rem',
                  border: '1px solid rgba(255,255,255,0.22)',
                }}
              >
                TOP 10
              </span>
            </div>

            <div className="p-2.5 max-h-[48vh] overflow-y-auto">
              <Leaderboard dark />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Recap ── */
function Recap() {
  const { score, lives, timeLeft, playerName, setScreen, saveScore } = useGameStore()
  const recapRef = useRef(null)
  useEffect(() => {
    saveScore()
    gsap.fromTo(
      recapRef.current,
      { autoAlpha: 0, scale: 0.85, y: 40 },
      { autoAlpha: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(1.7)' }
    )
  }, [])

  return (
    <div
      className="fixed inset-0 flex items-center justify-center px-4 overflow-auto py-8"
      style={{
        backgroundImage: 'url(/bg-studio-fikom.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div
        className="absolute inset-0 z-0"
        style={{ background: 'rgba(17, 24, 39, 0.5)', backdropFilter: 'blur(8px)' }}
      />

      <div
        ref={recapRef}
        style={{
          opacity: 0,
          background: 'rgba(255,255,255,.95)',
          backdropFilter: 'blur(16px)',
          border: '2px solid rgba(153,0,0,0.2)',
          boxShadow: '0 24px 64px rgba(0,0,0,.35)',
        }}
        className="w-full max-w-md relative z-10 rounded-3xl p-6"
      >
        <BrandModalBadge />

        <div className="glass-strong rounded-3xl p-6 text-center mb-4">
          <div className="text-5xl mb-2">🎓</div>
          <h2 className="ws-title text-base sm:text-lg mb-1" style={{ color: '#7F1D1D' }}>
            {playerName}
          </h2>
          <div className="ws-score text-6xl leading-none my-3" style={{ color: P }}>
            {score}
          </div>
          <p className="ws-caption text-xs tracking-widest font-bold" style={{ color: '#6B7280' }}>
            TOTAL POIN AKHIR
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            ['⏱️', 'Sisa Waktu', fmt(timeLeft)],
            ['❤️', 'Sisa Nyawa', String(lives)],
            ['⭐', 'Skor Akhir', String(score)],
          ].map(([ic, lb, val], i) => (
            <div key={i} className="glass rounded-2xl p-3 text-center">
              <div className="text-xl mb-1">{ic}</div>
              <div className="ws-caption text-[.62rem] mb-0.5 font-semibold" style={{ color: '#6B7280' }}>
                {lb}
              </div>
              <div className="ws-score text-base" style={{ color: '#7F1D1D' }}>
                {val}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setScreen('leaderboard')}
            className="ws-btn flex-1 py-3.5 rounded-2xl text-sm text-white"
            style={{
              background: `linear-gradient(135deg,${P},${PL})`,
              boxShadow: `0 4px 20px rgba(153,0,0,.35)`,
            }}
          >
            🏆 Leaderboard
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setScreen('landing')}
            className="ws-body flex-1 py-3.5 rounded-2xl text-sm font-bold glass"
            style={{ color: '#990000' }}
          >
            🔄 Main Lagi
          </motion.button>
        </div>
      </div>
    </div>
  )
}

/* ── Game Over ── */
function GameOver() {
  const { score, playerName, gameOverReason, setScreen, saveScore } = useGameStore()
  const cardRef = useRef(null)
  useEffect(() => {
    saveScore()
    gsap.fromTo(
      cardRef.current,
      { autoAlpha: 0, scale: 0.7, rotation: -5 },
      { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(1.7)' }
    )
  }, [])

  return (
    <div
      className="fixed inset-0 flex items-center justify-center px-4"
      style={{
        backgroundImage: 'url(/bg-studio-fikom.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div
        className="absolute inset-0 z-0"
        style={{ background: 'rgba(17, 24, 39, 0.55)', backdropFilter: 'blur(8px)' }}
      />

      <div
        ref={cardRef}
        style={{
          opacity: 0,
          background: 'rgba(255,255,255,.95)',
          backdropFilter: 'blur(16px)',
          border: '2px solid rgba(153,0,0,0.2)',
          boxShadow: '0 24px 64px rgba(0,0,0,.35)',
        }}
        className="relative z-10 rounded-3xl p-7 text-center max-w-sm w-full"
      >
        <BrandModalBadge />

        <motion.div
          animate={{ rotate: [-10, 10, -10], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-6xl mb-3"
        >
          {gameOverReason === 'time' ? '⏰' : '💔'}
        </motion.div>
        <h2 className="font-display text-2xl font-black mb-1" style={{ color: '#7F1D1D' }}>
          {gameOverReason === 'time' ? 'Waktu Habis!' : 'Nyawa Habis!'}
        </h2>
        {playerName && (
          <p className="text-xs font-bold mb-1" style={{ color: '#990000' }}>
            {playerName}
          </p>
        )}
        <p className="text-sm mb-4" style={{ color: '#6B7280' }}>
          {gameOverReason === 'time' ? 'Waktu 5 menit telah habis.' : 'Semua 3 nyawa telah habis!'}
        </p>
        <div className="font-display text-4xl font-black mb-6" style={{ color: P }}>
          {score} <span className="text-base" style={{ color: '#9CA3AF' }}>poin</span>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setScreen('leaderboard')}
            className="flex-1 py-3 rounded-2xl font-display font-black text-sm text-white"
            style={{ background: `linear-gradient(135deg,${P},${PL})` }}
          >
            🏆 Leaderboard
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setScreen('landing')}
            className="flex-1 py-3 rounded-2xl font-bold text-sm glass"
            style={{ color: '#990000' }}
          >
            🔄 Main Lagi
          </motion.button>
        </div>
      </div>
    </div>
  )
}

/* ── Leaderboard Screen ── */
function LeaderboardScreen() {
  const { setScreen, loadLeaderboard } = useGameStore()
  const containerRef = useRef(null)

  useEffect(() => {
    loadLeaderboard()

    const fire = () => {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#990000', '#DC2626', '#F59E0B', '#FBBF24'],
      })
      setTimeout(
        () =>
          confetti({
            particleCount: 70,
            angle: 60,
            spread: 60,
            origin: { x: 0 },
            colors: ['#990000', '#F59E0B'],
          }),
        400
      )
      setTimeout(
        () =>
          confetti({
            particleCount: 70,
            angle: 120,
            spread: 60,
            origin: { x: 1 },
            colors: ['#DC2626', '#FBBF24'],
          }),
        700
      )
    }
    const t = setTimeout(fire, 300)

    gsap.fromTo(
      containerRef.current,
      { autoAlpha: 0, y: 50 },
      { autoAlpha: 1, y: 0, duration: 0.65, ease: 'power3.out', delay: 0.1 }
    )

    return () => clearTimeout(t)
  }, [])

  return (
    <div
      className="fixed inset-0 overflow-auto flex flex-col items-center justify-center px-4 py-10"
      style={{
        backgroundImage: 'url(/bg-studio-fikom.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ background: 'rgba(17, 24, 39, 0.45)', backdropFilter: 'blur(4px)' }}
      />

      <div ref={containerRef} style={{ opacity: 0 }} className="w-full max-w-md relative z-10">
        <div
          className="flex items-center justify-between mb-4 px-3.5 py-2.5 rounded-2xl"
          style={{
            background: 'rgba(255, 255, 255, 0.14)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          }}
        >
          <FikomBrandLink dark logoSize={34} />
          <InstagramBadge dark compact />
        </div>

        <div className="text-center mb-5">
          <motion.div
            animate={{ rotate: [-5, 5, -5], y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-5xl mb-2"
          >
            🏆
          </motion.div>
          <h1
            className="font-display text-3xl font-black"
            style={{ color: '#FFFFFF', textShadow: '0 2px 20px rgba(0,0,0,.6)' }}
          >
            Leaderboard
          </h1>
          <p className="text-sm mt-1 font-medium" style={{ color: 'rgba(255,255,255,.85)' }}>
            Top 10 Pemain • Skor Tertinggi & Waktu Tercepat
          </p>
        </div>

        <div
          className="rounded-3xl p-3.5 mb-4 max-h-[50vh] overflow-y-auto"
          style={{
            background: 'rgba(17, 24, 39, 0.38)',
            border: '1px solid rgba(255, 255, 255, 0.22)',
            backdropFilter: 'blur(14px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.35)',
          }}
        >
          <Leaderboard dark />
        </div>

        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setScreen('landing')}
            className="px-8 py-3 rounded-2xl font-display font-black text-sm"
            style={{
              background: '#FFFFFF',
              color: '#990000',
              boxShadow: '0 6px 24px rgba(0,0,0,.25)',
            }}
          >
            🔄 Main Lagi
          </motion.button>
        </div>
      </div>
    </div>
  )
}

/* ── Router ── */
const SCREENS = {
  landing: Landing,
  trueorfalse: TrueOrFalse,
  puzzle: PuzzleDragDrop,
  explanation: ExplanationPage,
  gameover: GameOver,
  recap: Recap,
  leaderboard: LeaderboardScreen,
}

export default function App() {
  const screen = useGameStore((s) => s.currentScreen)
  const loadLeaderboard = useGameStore((s) => s.loadLeaderboard)
  const [modalState, setModalState] = useState({ open: false, tab: 'rekap' })

  const Screen = SCREENS[screen] || Landing

  useEffect(() => {
    loadLeaderboard()
    const interval = setInterval(() => {
      const current = useGameStore.getState().currentScreen
      if (current === 'landing' || current === 'leaderboard') {
        loadLeaderboard()
      }
    }, 12000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative min-h-screen" style={{ background: '#1A0808' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full h-full"
        >
          <Screen
            onOpenModal={(tab = 'rekap') => setModalState({ open: true, tab })}
          />
        </motion.div>
      </AnimatePresence>

      <PlayerRecapModal
        isOpen={modalState.open}
        initialTab={modalState.tab}
        onClose={() => setModalState((s) => ({ ...s, open: false }))}
      />
    </div>
  )
}

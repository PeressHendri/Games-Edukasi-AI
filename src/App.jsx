import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import confetti from 'canvas-confetti'
import useGameStore from './store/gameStore'
import { CORRECT_ORDER, DECOY_CARDS } from './games/PuzzleDragDrop/data'
import PuzzleDragDrop from './games/PuzzleDragDrop/index'
import ExplanationPage from './games/PuzzleDragDrop/ExplanationPage'
import TrueOrFalse from './games/TrueOrFalse/index'
import Leaderboard from './components/Leaderboard'

const shuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[b[i], b[j]] = [b[j], b[i]]; } return b; }
const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

// ── Palette tokens ─────────────────────────────────────────────────────
const P = '#4F46E5'  // primary indigo
const PL = '#6366F1'  // primary light
const S = '#0891B2'  // secondary teal
const SL = '#06B6D4'  // secondary light

/* ── Landing ── */
function Landing() {
  const { setPlayerName, setScreen, initPuzzle, resetGame, startTimer, leaderboard } = useGameStore()
  const [name, setName] = useState('')
  const [err, setErr] = useState(false)

  const containerRef = useRef(null)
  const badgeRef = useRef(null)
  const titleRef = useRef(null)
  const formRef = useRef(null)
  const chipsRef = useRef(null)
  const boardRef = useRef(null)
  const iconsRef = useRef([])

  const prevNames = [...new Set(leaderboard.map(e => e.name))].slice(0, 5)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      // Floating icons entrance
      gsap.set(iconsRef.current, { autoAlpha: 0, y: 30, scale: .6 })
      gsap.to(iconsRef.current, { autoAlpha: 1, y: 0, scale: 1, duration: .7, stagger: .1, delay: .1, ease: 'back.out(1.7)' })

      tl.fromTo(badgeRef.current, { autoAlpha: 0, y: -16, scale: .85 }, { autoAlpha: 1, y: 0, scale: 1, duration: .45, ease: 'back.out(2)' })
      tl.fromTo(titleRef.current, { autoAlpha: 0, y: 45, skewY: 3 }, { autoAlpha: 1, y: 0, skewY: 0, duration: .7, ease: 'power4.out' }, '-=.2')
      tl.fromTo(formRef.current, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: .5 }, '-=.25')
      tl.fromTo(chipsRef.current, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: .4 }, '-=.2')
      tl.fromTo(boardRef.current, { autoAlpha: 0, x: 55, scale: .94 }, { autoAlpha: 1, x: 0, scale: 1, duration: .7, ease: 'power3.out' }, '-=.6')

      // Floating loop
      iconsRef.current.forEach((el, i) => {
        if (!el) return
        gsap.to(el, { y: -18, rotation: i % 2 === 0 ? 10 : -10, duration: 2.8 + i * .5, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: i * .25 })
      })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  const start = (n) => {
    const finalName = (n || name).trim()
    if (!finalName) {
      setErr(true)
      gsap.fromTo(formRef.current, { x: -10 }, { x: 0, duration: .45, ease: 'elastic.out(1,.3)' })
      setTimeout(() => setErr(false), 700)
      return
    }
    gsap.to(containerRef.current, {
      autoAlpha: 0, scale: .96, duration: .3, ease: 'power2.in',
      onComplete: () => {
        resetGame(); setPlayerName(finalName)
        initPuzzle(shuffle([...CORRECT_ORDER.map(c => ({ ...c, isDecoy: false })), ...DECOY_CARDS]))
        setScreen('puzzle'); startTimer()
      }
    })
  }

  // Floating icons config: [emoji, top%, left%|right%side]
  // Bigger, more scattered icons across the whole screen
  const floatIcons = [
    { e: '🧩', top: '5%', left: '1%', size: '4rem' },  // top-left large
    { e: '💡', top: '48%', left: '0.5%', size: '3.8rem' },  // mid-left
    { e: '🎯', top: '78%', left: '3%', size: '3.2rem' },  // bottom-left
    { e: '🤖', top: '4%', right: '1%', size: '4.5rem' },  // top-right xlarge
    { e: '📚', top: '38%', right: '0.5%', size: '3.5rem' },  // mid-right
    { e: '⭐', top: '74%', right: '2%', size: '3.8rem' },  // bottom-right
    { e: '✨', top: '15%', left: '11%', size: '2.2rem' },  // inner top-left small
    { e: '💫', top: '82%', right: '12%', size: '2.4rem' },  // inner bottom-right small
    { e: '🔍', top: '22%', right: '10%', size: '2.8rem' },  // inner top-right
  ]

  return (
    <div ref={containerRef} className="fixed inset-0 flex items-center justify-center px-8 overflow-auto"
      style={{
        backgroundImage: 'url(/bg-truefalse.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>

      {/* Subtle bg circles */}
      <div className="fixed pointer-events-none" style={{ top: '-10%', left: '-5%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,.09) 0%, transparent 65%)' }} />
      <div className="fixed pointer-events-none" style={{ bottom: '-8%', right: '-5%', width: '450px', height: '450px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,.07) 0%, transparent 65%)' }} />

      {/* Floating icons — bigger & scattered */}
      {floatIcons.map((ic, i) => {
        const isTarget = ic.e === '🎯';
        return (
          <span key={i} ref={el => iconsRef.current[i] = el}
            onClick={async () => {
              if (isTarget) {
                const pass = window.prompt("Masukkan password admin untuk mereset server:");
                if (pass === 'peress2026') {
                  if (window.confirm("YAKIN MENGHAPUS SEMUA SKOR DI SERVER?")) {
                    try {
                      const res = await fetch('/api/leaderboard', {
                        method: 'DELETE',
                        headers: { 'x-admin-secret': 'peress2026' }
                      });
                      if (res.ok) {
                        useGameStore.getState().loadLeaderboard();
                        alert("✅ Berhasil! Semua data telah dihapus dari database.");
                      } else {
                        const err = await res.text();
                        alert("❌ Gagal mereset: " + res.status + " " + err);
                      }
                    } catch (e) {
                      alert("❌ Error Jaringan: " + e.message);
                    }
                  }
                } else if (pass) {
                  alert("Password salah!");
                }
              }
            }}
            className={`fixed select-none ${isTarget ? 'cursor-pointer pointer-events-auto z-50 hover:scale-110 transition-transform' : 'pointer-events-none'}`}
            style={{
              top: ic.top, left: ic.left, right: ic.right,
              fontSize: ic.size,
              filter: 'drop-shadow(0 10px 20px rgba(80,60,200,.2))',
              lineHeight: 1,
            }}>
            {ic.e}
          </span>
        );
      })}

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 w-full max-w-6xl items-center z-10 pt-12 lg:pt-0">

        {/* ══ LEFT ══ */}
        <div className="flex-1 min-w-0 w-full">

          {/* Badge */}
          <div ref={badgeRef}
            className="ws-label inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5"
            style={{ background: 'rgba(255,255,255,.85)', color: '#4F46E5', border: '1px solid rgba(255,255,255,1)', fontSize: '.68rem', boxShadow: '0 4px 12px rgba(0,0,0,.08)', backdropFilter: 'blur(4px)' }}>
            <span style={{ color: '#6366F1' }}>✦</span>
            Edukasi AI Kritis
          </div>

          {/* Title */}
          <div ref={titleRef} style={{ opacity: 0 }} className="mb-4">
            <h1 className="ws-hero overflow-visible"
              style={{ fontSize: 'clamp(3rem,6.5vw,5.8rem)', lineHeight: 1.05, paddingTop: '6px', paddingBottom: '8px' }}>
              <span style={{ display: 'block', color: '#1E1B4B', textShadow: '0 2px 14px rgba(255,255,255,1), 0 0 6px rgba(255,255,255,1)' }}>Literasi</span>
              <span style={{
                display: 'block',
                color: '#FFFFFF',
                WebkitTextStroke: 'clamp(2px, .4vw, 3.5px) #1E1B4B',
                textShadow: '0 8px 24px rgba(0,0,0,0.3)'
              }}>Digital</span>
            </h1>
            <div style={{ width: 100, height: 4, borderRadius: 2, background: 'linear-gradient(90deg,#6366F1,#A5B4FC,transparent)', marginTop: 8, boxShadow: '0 2px 4px rgba(255,255,255,.8)' }} />
          </div>

          {/* Taglines */}
          <div className="inline-block px-4 py-2 rounded-2xl mb-6" style={{ background: 'rgba(255,255,255,.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.8)', boxShadow: '0 4px 16px rgba(0,0,0,.05)' }}>
            <p className="ws-body text-base lg:text-lg mb-1 font-bold" style={{ color: '#111827' }}>
              Seberapa kritis kamu dalam menggunakan AI?
            </p>
            <p className="ws-caption text-xs lg:text-sm font-medium" style={{ color: '#4B5563' }}>
              Uji lewat <span className="font-bold text-indigo-600">2 mini-game</span> seru dalam <span className="font-bold text-green-600 italic">5 menit</span>!
            </p>
          </div>

          {/* Input & Error */}
          <div ref={formRef} style={{ opacity: 0 }} className="relative mb-6 w-full max-w-[440px]">
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl" style={{ filter: 'grayscale(0.5)' }}>👤</span>
              <input
                type="text"
                placeholder="Nama kamu siapa? 😃"
                value={name}
                onChange={e => { setName(e.target.value); setErr(false) }}
                onKeyDown={e => e.key === 'Enter' && start()}
                maxLength={20}
                className="w-full py-4 pl-14 pr-6 rounded-2xl outline-none ws-body font-bold text-base transition-all"
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(12px)',
                  border: `1.5px solid ${err ? '#EF4444' : 'rgba(99,102,241,.25)'}`,
                  color: '#1F2937',
                  boxShadow: name ? '0 0 0 3px rgba(99,102,241,.12)' : '0 2px 12px rgba(99,102,241,.08)',
                }}
              />
            </div>

            {/* Previous names */}
            {prevNames.length > 0 && (
              <div className="mt-3">
                <p className="ws-caption text-[0.65rem] mb-2 font-black px-1.5 py-0.5 rounded-lg inline-block" style={{ color: '#111827', background: 'rgba(255,255,255,.6)', backdropFilter: 'blur(4px)' }}>Pernah main? Pilih nick kamu!</p>
                <div className="flex flex-wrap gap-1.5">
                  {prevNames.map((n, i) => (
                    <motion.button key={i} whileHover={{ scale: 1.07, y: -2 }} whileTap={{ scale: .94 }}
                      onClick={() => start(n)}
                      className="ws-body px-3 py-1 rounded-xl text-[0.7rem] font-bold"
                      style={{ background: '#FFFFFF', color: '#4F46E5', border: '1px solid rgba(99,102,241,.3)', boxShadow: '0 4px 12px rgba(0,0,0,.08)' }}>
                      {n}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <motion.button
              whileHover={{ scale: 1.02, y: -3, boxShadow: '0 20px 48px rgba(34,197,94,.45)' }}
              whileTap={{ scale: .97 }}
              onClick={() => start()}
              className="ws-btn mt-6 w-full py-4 rounded-2xl text-base text-white flex items-center justify-between px-6"
              style={{ background: 'linear-gradient(135deg, #16A34A, #22C55E, #10B981)', boxShadow: '0 10px 32px rgba(34,197,94,.38)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <span className="font-bold text-lg text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>Mulai Tantangan!</span>
              <span style={{ fontWeight: 800, opacity: .9, fontSize: '1.2rem' }}>→</span>
            </motion.button>
          </div>

          {/* Info chips */}
          <div ref={chipsRef} style={{ opacity: 0 }} className="flex flex-wrap justify-center lg:justify-start gap-2 lg:gap-3 mt-6 pb-6 lg:pb-0">
            {[
              { ic: '⏱️', label: '5 MENIT', sub: 'Durasi Singkat' },
              { ic: '❤️', label: '3 NYAWA', sub: 'Hati-hati Nyawa' },
              { ic: '🧩', label: 'PUZZLE', sub: 'Asah Logika' },
              { ic: '🎯', label: 'TRUE/FALSE', sub: 'Uji Ketelitian' },
              { ic: '🏆', label: 'LEADERBOARD', sub: 'Bersaing & Belajar' },
            ].map(({ ic, label, sub }) => (
              <div key={label} className="flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-1.5 rounded-xl border"
                style={{ background: 'rgba(255,255,255,.7)', backdropFilter: 'blur(8px)', borderColor: 'rgba(255,255,255,1)', boxShadow: '0 4px 12px rgba(0,0,0,.04)' }}>
                <span className="text-base lg:text-lg drop-shadow-sm">{ic}</span>
                <div>
                  <div className="ws-label font-bold" style={{ color: '#1F2937', fontSize: '.55rem' }}>{label}</div>
                  <div className="ws-caption font-medium hidden sm:block" style={{ color: '#4B5563', fontSize: '.58rem' }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ RIGHT: Leaderboard ══ */}
        <div ref={boardRef} style={{ opacity: 0, flexShrink: 0 }} className="w-full lg:w-[420px] max-w-full lg:max-w-[420px] pb-12 lg:pb-0">
          <div className="rounded-3xl overflow-hidden relative"
            style={{
              background: 'rgba(17, 24, 39, 0.65)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
            }}>

            {/* Header */}
            <div className="px-5 py-4 flex items-start gap-3"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#F59E0B,#FBBF24)', boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}>🏆</div>
              <div className="flex-1 min-w-0">
                <div className="ws-title text-base" style={{ color: '#FFFFFF' }}>Leaderboard</div>
                <div className="ws-caption text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Top 10 Pemain</div>
              </div>
              <span className="ws-label px-2.5 py-1 rounded-full self-center"
                style={{ background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', fontSize: '.58rem', border: '1px solid rgba(255,255,255,0.2)' }}>TOP 10</span>
            </div>

            <div className="p-3 max-h-[56vh] overflow-y-auto">
              <Leaderboard dark />
            </div>
          </div>
        </div>

      </div>

      {/* Copyright Footer */}
      <div className="w-full text-center opacity-70 hover:opacity-100 transition-opacity mt-8 pb-6 lg:absolute lg:bottom-4 lg:pb-0 z-50">
        <a 
          href="https://peres.portofolio.dev/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="ws-caption text-[0.65rem] lg:text-[0.7rem] font-bold tracking-wide hover:underline cursor-pointer inline-block" 
          style={{ color: '#374151' }}>
          &copy; 2026 Peres Hendri Virgiawan. All rights reserved.
        </a>
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
    gsap.fromTo(recapRef.current,
      { autoAlpha: 0, scale: 0.85, y: 40 },
      { autoAlpha: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(1.7)' }
    )
  }, [])

  return (
    <div className="fixed inset-0 flex items-center justify-center px-4 overflow-auto py-8"
      style={{
        backgroundImage: 'url(/bg-truefalse.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>

      {/* Overlay */}
      <div className="absolute inset-0 z-0" style={{ background: 'rgba(255,255,255,.5)', backdropFilter: 'blur(8px)' }} />

      <div ref={recapRef} style={{ opacity: 0, background: 'rgba(255,255,255,.9)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,1)', boxShadow: '0 20px 60px rgba(0,0,0,.15)' }} className="w-full max-w-md relative z-10 rounded-3xl p-6">

        <div className="glass-strong rounded-3xl p-7 text-center mb-4">
          <div className="text-5xl mb-3">🎓</div>
          <h2 className="ws-title text-xl mb-1" style={{ color: '#1E1B4B' }}>{playerName}</h2>
          <div className="ws-score text-6xl leading-none my-3" style={{ color: P }}>{score}</div>
          <p className="ws-caption text-xs tracking-widest" style={{ color: '#9CA3AF' }}>Total Poin</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          {[['⏱️', 'Sisa Waktu', fmt(timeLeft)], ['❤️', 'Sisa Nyawa', String(lives)], ['⭐', 'Skor Akhir', String(score)]].map(([ic, lb, val], i) => (
            <div key={i} className="glass rounded-2xl p-3 text-center">
              <div className="text-xl mb-1">{ic}</div>
              <div className="ws-caption text-[.62rem] mb-0.5" style={{ color: '#9CA3AF' }}>{lb}</div>
              <div className="ws-score text-base" style={{ color: '#1E1B4B' }}>{val}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: .96 }}
            onClick={() => setScreen('leaderboard')}
            className="ws-btn flex-1 py-3 rounded-2xl text-sm text-white"
            style={{ background: `linear-gradient(135deg,${P},${PL})`, boxShadow: `0 4px 20px rgba(79,70,229,.3)` }}>
            🏆 Leaderboard
          </motion.button>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: .96 }}
            onClick={() => setScreen('landing')}
            className="ws-body flex-1 py-3 rounded-2xl text-sm glass"
            style={{ color: '#6366F1' }}>
            🔄 Main Lagi
          </motion.button>
        </div>
      </div>
    </div>
  )
}

/* ── Game Over ── */
function GameOver() {
  const { score, gameOverReason, setScreen, saveScore } = useGameStore()
  const cardRef = useRef(null)
  useEffect(() => {
    saveScore()
    gsap.fromTo(cardRef.current,
      { autoAlpha: 0, scale: 0.7, rotation: -5 },
      { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(1.7)' }
    )
  }, [])

  return (
    <div className="fixed inset-0 flex items-center justify-center px-4"
      style={{
        backgroundImage: 'url(/bg-truefalse.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>

      {/* Overlay */}
      <div className="absolute inset-0 z-0" style={{ background: 'rgba(255,255,255,.5)', backdropFilter: 'blur(8px)' }} />

      <div ref={cardRef} style={{ opacity: 0, background: 'rgba(255,255,255,.9)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,1)', boxShadow: '0 20px 60px rgba(0,0,0,.15)' }}
        className="relative z-10 rounded-3xl p-8 text-center max-w-sm w-full">
        <motion.div animate={{ rotate: [-10, 10, -10], scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-6xl mb-4">{gameOverReason === 'time' ? '⏰' : '💔'}</motion.div>
        <h2 className="font-display text-2xl font-black mb-2" style={{ color: '#1E1B4B' }}>
          {gameOverReason === 'time' ? 'Waktu Habis!' : 'Nyawa Habis!'}
        </h2>
        <p className="text-sm mb-4" style={{ color: '#6B7280' }}>
          {gameOverReason === 'time' ? 'Waktu 5 menit telah habis.' : 'Semua nyawa telah habis!'}
        </p>
        <div className="font-display text-4xl font-black mb-6" style={{ color: P }}>
          {score} <span className="text-base" style={{ color: '#9CA3AF' }}>poin</span>
        </div>
        <div className="flex gap-3">
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: .96 }}
            onClick={() => setScreen('leaderboard')}
            className="flex-1 py-3 rounded-2xl font-display font-black text-sm text-white"
            style={{ background: `linear-gradient(135deg,${P},${PL})` }}>
            🏆 Leaderboard
          </motion.button>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: .96 }}
            onClick={() => setScreen('landing')}
            className="flex-1 py-3 rounded-2xl font-bold text-sm glass"
            style={{ color: '#6366F1' }}>
            🔄 Main Lagi
          </motion.button>
        </div>
      </div>
    </div>
  )
}

function LeaderboardScreen() {
  const { setScreen, loadLeaderboard } = useGameStore()
  const containerRef = useRef(null)

  useEffect(() => {
    // Load leaderboard from API
    loadLeaderboard()

    const fire = () => {
      confetti({ particleCount: 120, spread: 80, origin: { y: .5 }, colors: ['#A855F7', '#EC4899', '#6366F1', '#F0ABFC'] })
      setTimeout(() => confetti({ particleCount: 70, angle: 60, spread: 60, origin: { x: 0 }, colors: ['#A855F7', '#EC4899'] }), 400)
      setTimeout(() => confetti({ particleCount: 70, angle: 120, spread: 60, origin: { x: 1 }, colors: ['#6366F1', '#F0ABFC'] }), 700)
    }
    const t = setTimeout(fire, 300)

    gsap.fromTo(containerRef.current,
      { autoAlpha: 0, y: 50 },
      { autoAlpha: 1, y: 0, duration: 0.65, ease: 'power3.out', delay: 0.1 }
    )

    return () => clearTimeout(t)
  }, [])

  return (
    <div className="fixed inset-0 overflow-auto flex flex-col items-center justify-center px-4 py-10"
      style={{
        backgroundImage: 'url(/bg-truefalse.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>

      <div ref={containerRef} style={{ opacity: 0 }} className="w-full max-w-lg relative z-10">
        <div className="text-center mb-6">
          <motion.div animate={{ rotate: [-5, 5, -5], y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 2 }}
            className="text-5xl mb-3">🏆</motion.div>
          <h1 className="font-display text-3xl font-black" style={{ color: '#FFFFFF', textShadow: '0 2px 20px rgba(168,85,247,.8)' }}>Leaderboard</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,.7)' }}>Top 10 Pemain Terbaik</p>
        </div>

        <div className="rounded-3xl p-4 mb-4 max-h-[55vh] overflow-y-auto"
          style={{
            background: 'rgba(255,255,255,.08)',
            border: '1px solid rgba(255,255,255,.15)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 40px rgba(168,85,247,.25)',
          }}>
          <Leaderboard dark />
        </div>

        <div className="flex justify-center">
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: .96 }}
            onClick={() => setScreen('landing')}
            className="px-8 py-3 rounded-2xl font-display font-black"
            style={{ background: '#FFFFFF', color: '#7C3AED', boxShadow: '0 6px 24px rgba(255,255,255,.25)' }}>
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
  puzzle: PuzzleDragDrop,
  explanation: ExplanationPage,
  trueorfalse: TrueOrFalse,
  gameover: GameOver,
  recap: Recap,
  leaderboard: LeaderboardScreen,
}

export default function App() {
  const screen = useGameStore(s => s.currentScreen)
  const loadLeaderboard = useGameStore(s => s.loadLeaderboard)
  const Screen = SCREENS[screen] || Landing

  useEffect(() => {
    loadLeaderboard()
  }, [])

  return (
    <div className="relative min-h-screen" style={{ background: '#FFFFFF' }}>
      <AnimatePresence mode="wait">
        <motion.div key={screen}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: .2 }}
          className="w-full h-full">
          <Screen />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

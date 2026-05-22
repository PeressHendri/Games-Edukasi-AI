import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import useGameStore from '../../store/gameStore'
import { HUD } from '../../components/HUD'

function useToast() {
  const [toasts, setToasts] = useState([])
  const add = useCallback((msg) => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2500)
  }, [])
  return { toasts, add }
}

function QuestionCard({ question, onAnswer, disabled }) {
  const [chosen, setChosen] = useState(null)
  const cardRef = useRef(null)

  useEffect(() => {
    gsap.fromTo(cardRef.current,
      { autoAlpha:0, y:30, rotation:-1 },
      { autoAlpha:1, y:0, rotation:0, duration:.5, ease:'back.out(1.4)' }
    )
  }, [question.id])

  const pick = (ans) => {
    if (disabled || chosen !== null) return
    setChosen(ans)
    // GSAP pulse on pick
    gsap.to(cardRef.current, { scale:1.02, duration:.1, yoyo:true, repeat:1 })
    setTimeout(() => onAnswer(ans), 300)
  }

  return (
    <div ref={cardRef} style={{ opacity:0 }} className="w-full max-w-3xl">
      <div className="rounded-3xl p-8 mb-5"
        style={{ background:'#FFFFFF', border:'1.5px solid rgba(79,70,229,.12)', boxShadow:'0 8px 40px rgba(79,70,229,.08)' }}>
        <div className="text-center text-xs font-black uppercase tracking-[3px] mb-5" style={{ color:'#9CA3AF' }}>
          Apakah pernyataan ini benar atau salah?
        </div>
        <p className="font-semibold text-xl leading-relaxed text-center" style={{ color:'#1F2937' }}>
          "{question.text}"
        </p>
      </div>
      <div className="flex gap-4">
        {[
          { label:'✅ BENAR', val:true,  bg:'linear-gradient(135deg,#16A34A,#22C55E)', shadow:'0 4px 20px rgba(22,163,74,.4)',  border:'rgba(22,163,74,.3)',  textC:'#16A34A' },
          { label:'❌ SALAH', val:false, bg:'linear-gradient(135deg,#DC2626,#EF4444)', shadow:'0 4px 20px rgba(220,38,38,.4)', border:'rgba(239,68,68,.3)',  textC:'#EF4444' },
        ].map(btn => (
          <motion.button key={String(btn.val)}
            whileHover={{ scale:1.04, y:-3 }} whileTap={{ scale:.96 }}
            onClick={() => pick(btn.val)} disabled={disabled}
            className="flex-1 py-5 rounded-2xl font-display font-black text-xl border-2 transition-all"
            style={chosen===btn.val
              ? { background:btn.bg, color:'#fff', border:'transparent', boxShadow:btn.shadow, transform:'scale(1.03)' }
              : { background:btn.bg, color:'#fff', border:'transparent', boxShadow:btn.shadow, opacity: chosen !== null ? 0.45 : 1 }}>
            {btn.label}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

export default function TrueOrFalse() {
  const store = useGameStore()
  const { shuffledQuestions, currentQIdx, correctStreak, setScreen, saveScore, stopTimer, setGameOverReason } = store
  const { toasts, add: toast } = useToast()
  const [feedback, setFeedback] = useState(null)
  const [disabled, setDisabled] = useState(false)
  const headerRef = useRef(null), progressRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current,  { autoAlpha:0, y:-20 }, { autoAlpha:1, y:0, duration:.5, ease:'power3.out', delay:.1 })
      gsap.fromTo(progressRef.current, { autoAlpha:0, y:15  }, { autoAlpha:1, y:0, duration:.5, ease:'power3.out', delay:.2 })
    })
    return () => ctx.revert()
  }, [])

  const q = shuffledQuestions[currentQIdx]
  const total = shuffledQuestions.length

  const handleAnswer = (ans) => {
    if (disabled) return
    setDisabled(true)
    const result = store.submitAnswer(ans, q.answer)
    if (result.ok && result.bonus) toast(`🔥 Streak ${store.correctStreak}x! +15 bonus poin!`)
    setFeedback({ ok:result.ok, explanation:q.explanation, newLives:result.newLives })
  }

  const handleNext = () => {
    if (!feedback.ok && feedback.newLives <= 0) {
      saveScore(); stopTimer(); setGameOverReason('lives'); setScreen('gameover'); return
    }
    setFeedback(null); setDisabled(false)
    store.nextQuestion()
  }

  if (!q) return null

  return (
    <div className="fixed inset-0 overflow-auto z-10"
      style={{
        backgroundImage: 'url(/bg-truefalse.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>
      <div className="relative z-10">
      <HUD gameName="GAME 2" />
      <div className="min-h-screen pt-20 pb-10 px-4 flex flex-col items-center justify-center">

        <div ref={headerRef} style={{ opacity:0 }} className="text-center mb-8">
          <h1 className="font-display text-4xl font-black" style={{ color:'#1E1B4B', textShadow:'0 2px 14px rgba(255,255,255,1), 0 0 6px rgba(255,255,255,1)' }}>True or False!</h1>
        </div>

        <div ref={progressRef} style={{ opacity:0 }} className="w-full max-w-3xl mb-6">
          <div className="flex justify-between text-sm mb-2 font-black" style={{ color:'#111827', textShadow:'0 2px 6px rgba(255,255,255,1), 0 0 2px rgba(255,255,255,1)' }}>
            <span>Soal {currentQIdx+1} dari {total}</span>
            <span className={correctStreak >= 2 ? 'font-black' : ''} style={{ color: correctStreak>=2 ? '#D97706' : '#374151' }}>
              {correctStreak > 0 ? `🔥 Streak ${correctStreak}x${correctStreak>=2?' — Satu lagi +15!':''}` : ' '}
            </span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,.25)' }}>
            <motion.div className="h-full rounded-full"
              animate={{ width:`${((currentQIdx+1)/total)*100}%` }}
              transition={{ type:'spring', bounce:.2 }}
              style={{ background:'linear-gradient(90deg,#38BDF8,#6366F1)' }} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {q && !feedback && <QuestionCard key={q.id} question={q} onAnswer={handleAnswer} disabled={disabled} />}
        </AnimatePresence>

        <AnimatePresence>
          {feedback && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="fixed inset-0 z-[200] flex flex-col items-center justify-center px-4 py-4"
              style={{
                backgroundImage: 'url(/bg-truefalse.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}>
              
              {/* Overlay agar modal tetap terbaca jelas */}
              <div className="absolute inset-0 z-0" style={{ background: 'rgba(10,10,20,.6)', backdropFilter: 'blur(8px)' }} />

              <motion.div initial={{ scale:.6, opacity:0 }} animate={{ scale:1, opacity:1 }} transition={{ type:'spring', bounce:.5 }}
                className="relative z-10 w-full max-w-xl rounded-3xl p-9 text-center"
                style={feedback.ok
                  ? { background:'rgba(255,255,255,.9)', backdropFilter:'blur(16px)', border:'2px solid rgba(16,185,129,.5)', boxShadow:'0 20px 60px rgba(16,185,129,.2)' }
                  : { background:'rgba(255,255,255,.9)', backdropFilter:'blur(16px)', border:'2px solid rgba(239,68,68,.5)',  boxShadow:'0 20px 60px rgba(239,68,68,.2)' }}>
                <motion.div animate={{ scale:[1,1.2,1] }} transition={{ repeat:2, duration:.3 }} className="text-6xl mb-4">
                  {feedback.ok ? '🎯' : '💔'}
                </motion.div>
                <h3 className="font-display text-3xl font-black mb-3" style={{ color: feedback.ok ? '#10B981' : '#EF4444' }}>
                  {feedback.ok ? 'Benar!' : 'Salah!'}
                </h3>
                <p className="text-base leading-relaxed mb-7 font-bold" style={{ color:'#1F2937' }}>{feedback.explanation}</p>
                <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:.96 }} onClick={handleNext}
                  className="w-full py-4 rounded-2xl font-display font-black text-white text-lg"
                  style={{ background: feedback.ok ? 'linear-gradient(135deg, #16A34A, #22C55E)' : 'linear-gradient(135deg,#EF4444,#F87171)', boxShadow:'0 6px 24px rgba(0,0,0,.2)' }}>
                  {currentQIdx+1 < total ? 'Lanjut →' : 'Lihat Hasil →'}
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
          <AnimatePresence>
            {toasts.map(t => (
              <motion.div key={t.id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} className="toast">{t.msg}</motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      </div>{/* end relative z-10 */}
    </div>
  )
}

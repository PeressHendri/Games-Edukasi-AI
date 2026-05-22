import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import useGameStore from '../../store/gameStore'
import { STEP_EXPLANATIONS } from './data'
import { questions } from '../TrueOrFalse/questions'

const shuffle = a => { const b=[...a]; for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];} return b; }

const variants = {
  enter:  { opacity:0, y:36, scale:.95 },
  center: { opacity:1, y:0,  scale:1   },
  exit:   { opacity:0, y:-36, scale:.95 },
}

export default function ExplanationPage() {
  const [idx, setIdx] = useState(0)
  const { setScreen, initTF, startTimer } = useGameStore()
  const containerRef = useRef(null)
  const headerRef    = useRef(null)
  const dotsRef      = useRef(null)
  const navRef       = useRef(null)

  const data   = STEP_EXPLANATIONS[idx]
  const isLast = idx === STEP_EXPLANATIONS.length - 1

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults:{ ease:'power3.out' } })
      tl.fromTo(headerRef.current,    { autoAlpha:0, y:-25 }, { autoAlpha:1, y:0, duration:.5 })
      tl.fromTo(dotsRef.current,      { autoAlpha:0, y:10  }, { autoAlpha:1, y:0, duration:.4 }, '-=.2')
      tl.fromTo(containerRef.current, { autoAlpha:0, scale:.9 }, { autoAlpha:1, scale:1, duration:.5, ease:'back.out(1.4)' }, '-=.2')
      tl.fromTo(navRef.current,       { autoAlpha:0, y:20  }, { autoAlpha:1, y:0, duration:.4 }, '-=.2')
    })
    return () => ctx.revert()
  }, [])

  const goNext = () => { if (isLast) launch(); else setIdx(i => i+1) }
  const goPrev = () => { if (idx > 0) setIdx(i => i-1) }
  const launch = () => { initTF(shuffle(questions)); setScreen('trueorfalse'); startTimer() }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center px-4 py-10 overflow-auto" style={{ background:'#FFFFFF' }}>

      <div ref={headerRef} style={{ opacity:0 }} className="text-center mb-5">
        <span className="inline-block px-3 py-1 rounded-full text-[.7rem] font-black uppercase tracking-widest"
          style={{ background:'rgba(8,145,178,.08)', color:'#0891B2', border:'1px solid rgba(8,145,178,.25)' }}>
          💡 Penjelasan Langkah
        </span>
        <p className="text-xs mt-2" style={{ color:'#9CA3AF' }}>Pelajari setiap langkah sebelum lanjut ke Game 2</p>
      </div>

      {/* Progress dots */}
      <div ref={dotsRef} style={{ opacity:0 }} className="flex items-center gap-2 mb-6">
        {STEP_EXPLANATIONS.map((s, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className="rounded-full h-2 transition-all duration-300"
            style={{ width: i===idx ? 28 : 8, background: i===idx ? data.color : i<idx ? data.color+'55' : 'rgba(79,70,229,.12)' }} />
        ))}
      </div>

      {/* Slide */}
      <div ref={containerRef} style={{ opacity:0 }} className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          <motion.div key={idx} variants={variants} initial="enter" animate="center" exit="exit"
            transition={{ type:'spring', stiffness:260, damping:26 }}
            className="w-full rounded-3xl p-8 text-center"
            style={{
              background: '#FFFFFF',
              border: `2px solid ${data.color}30`,
              boxShadow: `0 10px 60px ${data.color}14`,
            }}>

            <p className="text-[.62rem] font-black uppercase tracking-[3px] mb-5" style={{ color:data.color }}>
              Langkah {data.step} dari {STEP_EXPLANATIONS.length}
            </p>

            <motion.div initial={{ scale:0, rotate:-20 }} animate={{ scale:1, rotate:0 }}
              transition={{ type:'spring', stiffness:280, damping:18, delay:.1 }}
              className="text-7xl leading-none mb-5">
              {data.icon}
            </motion.div>

            <motion.h2 initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:.15 }}
              className="font-display text-2xl font-black mb-4" style={{ color:data.color }}>
              {data.title}
            </motion.h2>

            <motion.p initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:.2 }}
              className="text-sm leading-relaxed" style={{ color:'#6B7280' }}>
              {data.text}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nav */}
      <div ref={navRef} style={{ opacity:0 }} className="flex items-center gap-3 mt-7">
        <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:.95 }} onClick={goPrev}
          className="px-6 py-3 rounded-2xl font-bold text-sm"
          style={{ visibility:idx===0?'hidden':'visible', background:'rgba(79,70,229,.06)', border:'1px solid rgba(79,70,229,.15)', color:'#6366F1' }}>
          ← Sebelumnya
        </motion.button>

        <motion.button whileHover={{ scale:1.05, y:-2 }} whileTap={{ scale:.95 }} onClick={goNext}
          className="px-8 py-3 rounded-2xl font-display font-black text-sm text-white shadow-xl"
          style={{ background:`linear-gradient(135deg,${data.color},${data.color}cc)`, boxShadow:`0 6px 28px ${data.color}44` }}>
          {isLast ? '🚀 Mulai Game 2!' : 'Berikutnya →'}
        </motion.button>
      </div>

      {!isLast && (
        <motion.button initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.6 }}
          onClick={launch}
          className="mt-4 text-xs underline underline-offset-2 transition-colors"
          style={{ color:'#D1D5DB' }}
          onMouseEnter={e => e.target.style.color='#9CA3AF'}
          onMouseLeave={e => e.target.style.color='#D1D5DB'}>
          Lewati semua →
        </motion.button>
      )}
    </div>
  )
}

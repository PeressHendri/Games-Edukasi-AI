import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import useGameStore from '../../store/gameStore'
import { CORRECT_ORDER, DECOY_CARDS, STEP_EXPLANATIONS } from './data'
import { questions } from '../TrueOrFalse/questions'
import { HUD } from '../../components/HUD'

const shuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[b[i], b[j]] = [b[j], b[i]]; } return b; }

function useToast() {
  const [toasts, setToasts] = useState([])
  const add = useCallback((msg) => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2500)
  }, [])
  return { toasts, add }
}

/* ── Pool Card — grid-controlled square ── */
function PoolCard({ card, isSelected, isLocked, onSelect, onDragStart, onDragEnd }) {
  const [dragging, setDragging] = useState(false)

  return (
    <motion.div
      draggable={!isLocked}
      onDragStart={e => { if (isLocked) return; setDragging(true); onDragStart?.(e, card, null) }}
      onDragEnd={() => { setDragging(false); onDragEnd?.() }}
      onClick={() => !isLocked && onSelect?.(card)}
      whileHover={isLocked ? {} : { scale:1.03, y:-2 }} whileTap={isLocked ? {} : { scale:.96 }}
      animate={isLocked
        ? { opacity: 0.22, scale: 1 }
        : dragging ? { opacity:.4, scale:.93 } : isSelected ? { scale:1.03, opacity:1 } : { opacity:1, scale:1 }}
      transition={{ type:'spring', stiffness:400, damping:25 }}
      className="relative flex flex-col items-center justify-center gap-2 p-3 rounded-xl cursor-pointer select-none h-full w-full"
      style={{
        background: isLocked ? 'rgba(200,200,200,.2)' : isSelected ? 'rgba(99,102,241,.12)' : '#FFFFFF',
        border: isLocked ? '2px solid rgba(0,0,0,.08)' : `2px solid ${isSelected ? '#6366F1' : 'rgba(99,102,241,.15)'}`,
        boxShadow: isLocked ? 'none' : isSelected
          ? '0 0 0 3px rgba(99,102,241,.2), 0 4px 12px rgba(99,102,241,.15)'
          : '0 1px 6px rgba(99,102,241,.07)',
        filter: isLocked ? 'blur(1.5px) grayscale(0.6)' : 'none',
        pointerEvents: isLocked ? 'none' : 'auto',
        cursor: isLocked ? 'default' : 'pointer',
      }}>
      {isLocked && (
        <span className="absolute inset-0 flex items-center justify-center rounded-xl z-10"
          style={{ background:'rgba(255,255,255,.15)' }}>
          <span style={{ fontSize:'1.2rem' }}>✓</span>
        </span>
      )}
      {!isLocked && isSelected && (
        <span className="absolute top-2 right-2 text-indigo-500" style={{ fontSize:'.7rem' }}>✓</span>
      )}
      <span className="text-2xl leading-none flex-shrink-0">{card.icon}</span>
      <span className="ws-body text-center w-full px-1"
        style={{
          color: isLocked ? '#9CA3AF' : isSelected ? '#4F46E5' : '#374151',
          fontSize: '0.85rem',
          fontWeight: 600,
          lineHeight: 1.3,
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
          wordBreak: 'break-word',
        }}>
        {card.text}
      </span>
    </motion.div>
  )
}

/* ── Slot ── */
function Slot({ idx, card, locked, isOver, selectedCard, selectedFromSlot,
  onDrop, onDragOver, onDragLeave, onDragStart, onDragEnd, onSlotClick, onCardClick }) {
  const [dragging, setDragging] = useState(false)
  const isSelected = !locked && card && selectedFromSlot === idx
  const isTarget = !locked && selectedCard && !isSelected

  return (
    <motion.div
      onDragOver={e => { e.preventDefault(); onDragOver?.() }}
      onDragLeave={onDragLeave}
      onDrop={e => { e.preventDefault(); onDrop(idx) }}
      animate={isOver ? { scale: 1.03 } : { scale: 1 }}
      onClick={() => !card ? onSlotClick?.(idx) : undefined}
      className="relative flex flex-col items-center justify-center gap-2 p-3 rounded-xl h-full w-full"
      style={{
        border: locked ? `2px solid ${card?.color}80`
          : isSelected ? '2px solid #EF4444'
            : isOver ? '2px solid #6366F1'
              : isTarget ? '2px dashed rgba(99,102,241,.5)'
                : '2px dashed rgba(99,102,241,.25)',
        background: locked ? `${card?.color}08`
          : isSelected ? 'rgba(239,68,68,.04)'
            : isOver ? 'rgba(99,102,241,.08)'
              : isTarget ? 'rgba(99,102,241,.04)'
                : 'rgba(255,255,255,.7)',
        cursor: !card && selectedCard ? 'pointer' : 'default',
      }}>

      {/* Slot number badge */}
      <span className="ws-label absolute top-2 left-2.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: locked ? `${card?.color}20` : 'rgba(99,102,241,.12)', color: locked ? card?.color : '#6366F1', fontSize: '.65rem' }}>{idx + 1}</span>

      {card ? (
        <motion.div
          draggable={!locked}
          onDragStart={e => { setDragging(true); onDragStart?.(e, card, idx) }}
          onDragEnd={() => { setDragging(false); onDragEnd?.() }}
          onClick={e => { e.stopPropagation(); onCardClick?.(idx) }}
          animate={dragging ? { opacity: .4 } : { opacity: 1 }}
          className="flex flex-col items-center gap-2 w-full select-none"
          style={{ cursor: locked ? 'default' : 'pointer' }}>
          <span className="text-3xl leading-none flex-shrink-0">{card.icon}</span>
          <span className="ws-body text-center w-full px-1"
            style={{
              color: locked ? card.color : '#374151',
              fontSize: '0.95rem',
              fontWeight: 600,
              lineHeight: 1.3,
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
              wordBreak: 'break-word',
            }}>{card.text}</span>
          {locked && (
            <span className="ws-label" style={{ color: card.color, fontSize: '.55rem' }}>✓ TERKUNCI</span>
          )}
          {isSelected && !locked && (
            <span className="ws-label" style={{ color: '#EF4444', fontSize: '.55rem' }}>KLIK SLOT LAIN</span>
          )}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center gap-1.5 opacity-40">
          <span style={{ color: '#6366F1', fontSize: '1.4rem' }}>+</span>
          <span className="ws-label text-center" style={{ color: '#6366F1', fontSize: '.65rem' }}>
            {selectedCard ? 'TARUH DI SINI' : 'DROP DI SINI'}
          </span>
        </div>
      )}
    </motion.div>
  )
}

/* ── Explanations Modal ── */
function ExplanationsModal({ lockedSteps, onProceed, isTimeout }) {
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    if (isTimeout) return
    if (countdown <= 0) return
    const t = setInterval(() => setCountdown(c => c - 1), 1000)
    return () => clearInterval(t)
  }, [countdown, isTimeout])

  const canProceed = isTimeout || countdown <= 0

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] overflow-y-auto overflow-x-hidden"
      style={{
        backgroundImage: 'url(/bg-truefalse.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>

      {/* Dark overlay for readability */}
      <div className="fixed inset-0 z-0" style={{ background: 'rgba(10,10,20,.72)' }} />

      {/* Content above overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full px-4 py-8">

      {/* Header */}
      <div className="text-center mb-6 flex-shrink-0">
        <div className="text-4xl mb-1">{isTimeout ? '⏰' : '🎉'}</div>
        <h2 className="ws-title text-2xl mb-1" style={{ color: '#FFFFFF' }}>
          {isTimeout ? 'Waktu Habis!' : 'Puzzle Selesai!'}
        </h2>
        <p className="ws-desc text-sm" style={{ color: 'rgba(255,255,255,.8)' }}>
          {isTimeout ? 'Inilah urutan berpikir kritis yang benar:' : 'Urutan kamu 100% benar! Ini penjelasannya:'}
        </p>
      </div>

      {/* Grid, full width */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full flex-1 mb-8 max-w-6xl">
        {STEP_EXPLANATIONS.map((d, i) => {
          const isLocked = lockedSteps.includes(i)
          return (
            <motion.div key={i}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl p-5 flex flex-col"
              style={{
                background: isLocked ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.09)',
                border: `1px solid ${isLocked ? d.color + '90' : 'rgba(255,255,255,.2)'}`,
                borderLeft: `5px solid ${isLocked ? d.color : 'rgba(255,255,255,.3)'}`,
                backdropFilter: 'blur(16px)',
                opacity: isLocked ? 1 : 0.65,
              }}>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-2xl flex-shrink-0">{d.icon}</span>
                <strong className="ws-body text-base flex-1" style={{ color: '#FFFFFF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  {d.step}. {d.title}
                </strong>
                {isLocked && <span className="ws-label flex-shrink-0" style={{ color: d.color, fontSize: '.6rem', fontWeight: 700 }}>✓ BENAR</span>}
              </div>
              <p className="ws-desc leading-relaxed flex-1" style={{ color: 'rgba(255,255,255,.92)', fontSize: '1.05rem', lineHeight: 1.7 }}>{d.text}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Button */}
      <div className="flex-shrink-0">
        <motion.button whileHover={canProceed ? { scale: 1.04, y: -2 } : {}} whileTap={canProceed ? { scale: .96 } : {}}
          onClick={canProceed ? onProceed : undefined}
          className="ws-btn px-12 py-3.5 rounded-2xl text-white text-sm font-bold"
          style={{ 
            background: canProceed ? 'linear-gradient(135deg, #16A34A, #22C55E)' : '#9CA3AF', 
            boxShadow: canProceed ? '0 8px 28px rgba(34,197,94,.45)' : 'none',
            cursor: canProceed ? 'pointer' : 'not-allowed',
            opacity: canProceed ? 1 : 0.8
          }}>
          {isTimeout ? '🔄 Kembali ke Menu' : (canProceed ? 'Lanjut ke Game 2 →' : `Tunggu ${countdown} detik...`)}
        </motion.button>
      </div>

      </div>{/* end z-10 wrapper */}
    </motion.div>
  )
}

/* ── Main ── */
export default function PuzzleDragDrop() {
  const store = useGameStore()
  const { sourceCards, initialCards, slottedCards, lockedMask, setScreen, stopTimer, initTF, startTimer } = store

  const [dragCard, setDragCard] = useState(null)
  const [dragFromSlot, setDragFromSlot] = useState(null)
  const [overSlot, setOverSlot] = useState(null)
  const [selectedPoolCard, setSelectedPoolCard] = useState(null)
  const [selectedSlotIdx, setSelectedSlotIdx] = useState(null)
  const [lockedSteps, setLockedSteps] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [isTimeout, setIsTimeout] = useState(false)

  const { toasts, add: toast } = useToast()
  const headerRef = useRef(null)
  const gridRef = useRef(null)
  const poolRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.fromTo(headerRef.current, { autoAlpha: 0, y: -25 }, { autoAlpha: 1, y: 0, duration: .55, delay: .1 })
      tl.fromTo(gridRef.current, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: .55 }, '-=.2')
      tl.fromTo(poolRef.current, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .5 }, '-=.2')
    })
    return () => ctx.revert()
  }, [])

  const clearSel = () => { setSelectedPoolCard(null); setSelectedSlotIdx(null) }

  const handleDragStart = useCallback((e, card, slotIdx) => {
    clearSel(); setDragCard(card); setDragFromSlot(slotIdx); e.dataTransfer.effectAllowed = 'move'
  }, [])
  const handleDragEnd = useCallback(() => { setDragCard(null); setDragFromSlot(null); setOverSlot(null) }, [])
  const handleDrop = useCallback((idx) => {
    if (lockedMask[idx]) return
    if (dragFromSlot !== null) { if (dragFromSlot === idx) return; store.moveCardBetweenSlots(dragFromSlot, idx) }
    else if (dragCard) store.placeCard(idx, dragCard)
    setDragCard(null); setDragFromSlot(null); setOverSlot(null)
  }, [dragCard, dragFromSlot, lockedMask, store])

  const handlePoolCardSelect = (card) => {
    if (selectedPoolCard?.id === card.id) { clearSel(); return }
    clearSel(); setSelectedPoolCard(card)
  }
  const handleSlotCardClick = (idx) => {
    if (lockedMask[idx]) return
    if (selectedPoolCard) { store.placeCard(idx, selectedPoolCard); clearSel(); return }
    if (selectedSlotIdx === idx) { clearSel(); return }
    if (selectedSlotIdx !== null) { store.moveCardBetweenSlots(selectedSlotIdx, idx); clearSel(); return }
    setSelectedSlotIdx(idx)
  }
  const handleEmptySlotClick = (idx) => {
    if (lockedMask[idx]) return
    if (selectedPoolCard) { store.placeCard(idx, selectedPoolCard); clearSel(); return }
    if (selectedSlotIdx !== null) { store.moveCardBetweenSlots(selectedSlotIdx, idx); clearSel(); return }
  }

  const handleCheck = () => {
    const result = store.checkPuzzle(CORRECT_ORDER, (stepIdx) => {
      setLockedSteps(prev => prev.includes(stepIdx) ? prev : [...prev, stepIdx])
    })
    if (result.error) { toast('⚠️ ' + result.error); return }
    if (result.win) { clearSel(); stopTimer(); setIsTimeout(false); setShowModal(true) }
    else {
      clearSel()
      if (result.wrong > 0) toast(`❌ ${result.wrong} kartu salah! −${result.penalty} detik`)
      if (result.newLocked > 0) toast(`✅ ${result.newLocked} kartu terkunci!`)
    }
  }

  const handleReset = () => {
    clearSel()
    store.initPuzzle(shuffle([...CORRECT_ORDER.map(c => ({ ...c, isDecoy: false })), ...DECOY_CARDS]))
    setLockedSteps([])
  }

  const handleProceed = () => {
    setShowModal(false)
    if (isTimeout) setScreen('landing')
    else { stopTimer(); initTF(shuffle([...questions])); setScreen('trueorfalse'); startTimer() }
  }

  const placedIds = new Set(slottedCards.filter(Boolean).map(c => c.id))
  const lockedCardIds = new Set(
    slottedCards
      .map((c, i) => lockedMask[i] && c ? c.id : null)
      .filter(Boolean)
  )
  const selCard = selectedPoolCard || (selectedSlotIdx !== null ? slottedCards[selectedSlotIdx] : null)
  const hasSelection = selectedPoolCard !== null || selectedSlotIdx !== null

  return (
    <div className="fixed inset-0 overflow-auto z-10"
      style={{
        backgroundImage: 'url(/bg-truefalse.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>
      <HUD gameName="GAME 1" />

      {/* ── Main wrapper: full height below HUD ── */}
      <div className="flex flex-col min-h-screen" style={{ paddingTop: '52px' }}>
        {/* ── Header ── */}
        <div ref={headerRef} style={{ opacity: 0 }} className="text-center pt-3 pb-2 px-4 flex-shrink-0">
          <div className="flex items-center justify-center gap-3 mb-1">
            <span className="text-2xl" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,.15))' }}>🤖</span>
            <span className="text-lg" style={{ color: 'rgba(30,27,75,.4)', fontWeight: 300 }}>+</span>
            <h1 className="flex items-baseline gap-2">
              <span className="ws-title" style={{ fontSize: 'clamp(1.3rem,2.5vw,1.8rem)', color: '#1E1B4B', textShadow:'0 2px 12px rgba(255,255,255,1)' }}>Puzzle</span>
              <span className="ws-hero" style={{
                fontSize: 'clamp(1.3rem,2.5vw,1.8rem)',
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                filter: 'drop-shadow(0 2px 4px rgba(255,255,255,.8))'
              }}>
                Drag and Drop
              </span>
            </h1>
            <span className="text-lg" style={{ color: 'rgba(30,27,75,.4)', fontWeight: 300 }}>+</span>
            <span className="text-2xl" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,.15))' }}>🧩</span>
          </div>
          <p className="ws-desc text-xs font-bold inline-block px-3 py-1 rounded-lg" style={{ color: '#1E1B4B', background:'rgba(255,255,255,.6)', backdropFilter:'blur(4px)' }}>
            <span className="inline lg:hidden">✦ Susun 6 langkah berpikir kritis — klik/drag ke bawah ✦</span>
            <span className="hidden lg:inline">✦ Susun 6 langkah berpikir kritis — drag dari kiri ke kanan ✦</span>
          </p>
        </div>

        {/* ── Left / Right Split ── */}
        <div className="flex flex-col lg:flex-row flex-1 gap-3 lg:gap-4 px-4 pb-4 min-h-0">

          {/* ══ LEFT PANEL — Pool Kartu ══ */}
          <div ref={poolRef} style={{ opacity: 0 }} className="flex flex-col w-full lg:w-1/2 min-h-0">
            {/* Panel label */}
            <div className="flex items-center gap-2 mb-2 flex-shrink-0 bg-white/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/80 shadow-sm">
              <div className="flex-1 h-px" style={{ background: 'rgba(99,102,241,.25)' }} />
              <p className="ws-label flex items-center gap-1" style={{ color: '#1E1B4B', fontSize: '.65rem', fontWeight: 800 }}>
                🃏 KARTU JAWABAN
              </p>
              <div className="flex-1 h-px" style={{ background: 'rgba(99,102,241,.25)' }} />
            </div>

            {/* Cards container */}
            <div className="flex-1 rounded-2xl p-2.5"
              style={{ background: 'rgba(255,255,255,.5)', border: '1px solid rgba(99,102,241,.12)', boxShadow: '0 4px 20px rgba(99,102,241,.07)' }}>
              <div className="grid grid-cols-3 lg:grid-cols-4 grid-rows-4 lg:grid-rows-3 gap-2 h-full min-h-[360px] lg:min-h-0">
                {(initialCards.length > 0 ? initialCards : sourceCards).map(c => (
                  <PoolCard key={c.id} card={c}
                    isSelected={selectedPoolCard?.id === c.id}
                    isLocked={lockedCardIds.has(c.id)}
                    onSelect={handlePoolCardSelect}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  />
                ))}
              </div>
            </div>

            {/* Drag hint arrow */}
            <div className="flex items-center justify-center gap-2 mt-2 flex-shrink-0 bg-white/70 backdrop-blur-sm px-3 py-1 rounded-full border border-white shadow-sm self-center">
              <span className="ws-desc text-xs font-bold" style={{ color: '#1E1B4B' }}>
                <span className="inline lg:hidden">Pilih lalu klik slot di bawah ↓</span>
                <span className="hidden lg:inline">Drag ke kanan →</span>
              </span>
            </div>
          </div>

          {/* ══ RIGHT PANEL — Slots ══ */}
          <div ref={gridRef} style={{ opacity: 0 }} className="flex flex-col w-full lg:w-1/2 min-h-0 mt-4 lg:mt-0">
            {/* Panel label */}
            <div className="flex items-center gap-2 mb-2 flex-shrink-0 bg-white/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/80 shadow-sm">
              <div className="flex-1 h-px" style={{ background: 'rgba(99,102,241,.25)' }} />
              <p className="ws-label flex items-center gap-1" style={{ color: '#1E1B4B', fontSize: '.65rem', fontWeight: 800 }}>
                📋 URUTAN LANGKAH
              </p>
              <div className="flex-1 h-px" style={{ background: 'rgba(99,102,241,.25)' }} />
            </div>

            {/* Slots container */}
            <div className="flex-1 rounded-2xl p-2.5"
              style={{ background: 'rgba(255,255,255,.7)', backdropFilter:'blur(12px)', border: '1px solid rgba(255,255,255,1)', boxShadow: '0 8px 32px rgba(0,0,0,.08)' }}>
              <div className="grid grid-cols-2 lg:grid-cols-3 grid-rows-3 lg:grid-rows-2 gap-2 h-full min-h-[300px] lg:min-h-0">
                {Array(6).fill(null).map((_, i) => (
                  <Slot key={i} idx={i}
                    card={slottedCards[i]} locked={lockedMask[i]} isOver={overSlot === i}
                    selectedCard={selCard} selectedFromSlot={selectedSlotIdx}
                    onDragOver={() => setOverSlot(i)} onDragLeave={() => setOverSlot(null)}
                    onDrop={handleDrop}
                    onDragStart={(e, card, from) => handleDragStart(e, card, from)}
                    onDragEnd={handleDragEnd}
                    onSlotClick={handleEmptySlotClick}
                    onCardClick={() => handleSlotCardClick(i)}
                  />
                ))}
              </div>
            </div>
            {/* Selection hint */}
            <AnimatePresence>
              {hasSelection && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  className="mt-2 px-3 py-1.5 rounded-xl flex items-center justify-between flex-shrink-0"
                  style={{ background: 'rgba(99,102,241,.07)', border: '1px solid rgba(99,102,241,.18)' }}>
                  <span className="ws-desc text-xs" style={{ color: '#4F46E5' }}>
                    {selectedPoolCard
                      ? `🎯 "${selectedPoolCard.text}" — klik slot`
                      : `🔀 Slot ${(selectedSlotIdx ?? 0) + 1} — klik slot lain`}
                  </span>
                  <button onClick={clearSel}
                    className="ws-label ml-2 px-2 py-0.5 rounded-lg"
                    style={{ background: 'rgba(239,68,68,.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,.2)', fontSize: '.55rem' }}>
                    ✕
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-3 flex-shrink-0">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: .97 }} onClick={handleCheck}
                className="ws-btn flex-1 py-4 rounded-xl text-sm text-white flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #16A34A, #22C55E, #10B981)', boxShadow: '0 4px 20px rgba(34,197,94,.35)', border:'1px solid rgba(255,255,255,0.2)', fontSize: '0.95rem' }}>
                <span className="font-bold text-lg text-white" style={{ textShadow:'0 2px 4px rgba(0,0,0,0.2)' }}>Periksa Urutan</span>
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: .97 }} onClick={handleReset}
                className="ws-body px-6 py-4 rounded-xl text-sm flex items-center gap-2"
                style={{ background: '#FFFFFF', border: '1.5px solid rgba(99,102,241,.2)', color: '#6366F1', boxShadow: '0 2px 10px rgba(99,102,241,.1)', fontSize: '0.95rem' }}>
                <span>Reset</span>
              </motion.button>
            </div>
          </div>

        </div>
      </div>

      {/* Toasts */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 20, scale: .9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: .9 }} className="toast">{t.msg}</motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showModal && <ExplanationsModal lockedSteps={lockedSteps} isTimeout={isTimeout} onProceed={handleProceed} />}
      </AnimatePresence>
    </div>
  )
}

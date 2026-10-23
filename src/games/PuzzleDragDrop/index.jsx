import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import useGameStore from '../../store/gameStore'
import { CORRECT_ORDER, STEP_EXPLANATIONS } from './data'
import { HUD } from '../../components/HUD'
import { FikomBrandLink, InstagramBadge } from '../../components/BrandBadge'

function useToast() {
  const [toasts, setToasts] = useState([])
  const add = useCallback((msg) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, msg }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800)
  }, [])
  return { toasts, add }
}

/* ── Pool Card — grid-controlled square ── */
function PoolCard({ card, isSelected, isLocked, isPlaced, isDragging, onSelect, onDragStart, onDragEnd }) {
  const disabled = isLocked || isPlaced

  return (
    <motion.div
      draggable={!disabled}
      onDragStart={(e) => {
        if (disabled) return
        onDragStart?.(e, card, null)
      }}
      onDragEnd={() => {
        onDragEnd?.()
      }}
      onClick={() => !disabled && onSelect?.(card)}
      whileHover={disabled ? {} : { scale: 1.04, y: -2 }}
      whileTap={disabled ? {} : { scale: 0.96 }}
      animate={
        isLocked
          ? { opacity: 0.35, scale: 0.98 }
          : isPlaced
          ? { opacity: 0.45, scale: 0.98 }
          : isDragging
          ? { opacity: 0.4, scale: 0.94 }
          : isSelected
          ? { scale: 1.04, opacity: 1 }
          : { opacity: 1, scale: 1 }
      }
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="relative flex flex-col items-center justify-center gap-1.5 p-2.5 sm:p-3 rounded-xl select-none h-full w-full transition-all"
      style={{
        background: isLocked
          ? 'rgba(22, 163, 74, 0.12)'
          : isPlaced
          ? 'rgba(243, 244, 246, 0.75)'
          : isSelected
          ? 'rgba(254, 242, 242, 0.98)'
          : '#FFFFFF',
        border: isLocked
          ? '2px solid rgba(22, 163, 74, 0.45)'
          : isPlaced
          ? '2px dashed rgba(156, 163, 175, 0.55)'
          : isSelected
          ? '2.5px solid #DC2626'
          : '2px solid rgba(153, 0, 0, 0.18)',
        boxShadow: disabled
          ? 'none'
          : isSelected
          ? '0 0 0 3px rgba(220,38,38,.28), 0 8px 20px rgba(153,0,0,.18)'
          : '0 4px 14px rgba(153,0,0,.08), 0 1px 3px rgba(0,0,0,.06)',
        filter: 'none',
        pointerEvents: disabled ? 'none' : 'auto',
        cursor: disabled ? 'default' : 'pointer',
      }}
    >
      {isLocked && (
        <span
          className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md font-black z-10"
          style={{ background: '#16A34A', color: '#FFFFFF', fontSize: '0.55rem' }}
        >
          🔒 BENAR
        </span>
      )}
      {!isLocked && isPlaced && (
        <span
          className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md font-bold z-10"
          style={{ background: '#6B7280', color: '#FFFFFF', fontSize: '0.55rem' }}
        >
          DI SLOT
        </span>
      )}
      {!disabled && isSelected && (
        <span
          className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md font-black"
          style={{ background: '#DC2626', color: '#FFFFFF', fontSize: '.58rem' }}
        >
          PILIH SLOT →
        </span>
      )}
      <span className="text-2xl leading-none flex-shrink-0">{card.icon}</span>
      <span
        className="ws-body text-center w-full px-1"
        style={{
          color: isLocked ? '#15803D' : isPlaced ? '#6B7280' : isSelected ? '#990000' : '#1F2937',
          fontSize: '0.82rem',
          fontWeight: 700,
          lineHeight: 1.25,
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
          wordBreak: 'break-word',
        }}
      >
        {card.text}
      </span>
    </motion.div>
  )
}

/* ── Slot ── */
function Slot({
  idx,
  card,
  locked,
  isOver,
  selectedCard,
  selectedFromSlot,
  isDragging,
  onDrop,
  onDragOver,
  onDragLeave,
  onDragStart,
  onDragEnd,
  onSlotClick,
  onCardClick,
  onRemoveCard,
}) {
  const isSelected = !locked && card && selectedFromSlot === idx
  const isTarget = !locked && selectedCard && !isSelected

  return (
    <motion.div
      onDragOver={(e) => {
        e.preventDefault()
        if (!locked) onDragOver?.()
      }}
      onDragLeave={onDragLeave}
      onDrop={(e) => {
        e.preventDefault()
        if (!locked) onDrop(idx)
      }}
      animate={isOver && !locked ? { scale: 1.03 } : { scale: 1 }}
      onClick={() => (!card && !locked ? onSlotClick?.(idx) : undefined)}
      className="relative flex flex-col items-center justify-center gap-2 p-3 rounded-xl h-full w-full transition-all"
      style={{
        border: locked
          ? '2.5px solid #16A34A'
          : isSelected
          ? '2px solid #DC2626'
          : isOver
          ? '2px solid #F59E0B'
          : isTarget
          ? '2px dashed #DC2626'
          : '2px dashed rgba(153,0,0,.28)',
        background: locked
          ? 'rgba(220, 252, 231, 0.92)'
          : isSelected
          ? 'rgba(254, 226, 226, 0.9)'
          : isOver
          ? 'rgba(254, 243, 199, 0.9)'
          : isTarget
          ? 'rgba(254, 242, 242, 0.85)'
          : 'rgba(255, 255, 255, 0.88)',
        boxShadow: locked ? '0 4px 16px rgba(22, 163, 74, 0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
        cursor: !card && selectedCard && !locked ? 'pointer' : 'default',
      }}
    >
      {/* Slot number badge */}
      <span
        className="ws-label absolute top-2 left-2.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: locked ? '#16A34A' : 'rgba(153,0,0,.14)',
          color: locked ? '#FFFFFF' : '#990000',
          fontSize: '.68rem',
          fontWeight: 800,
        }}
      >
        {idx + 1}
      </span>

      {/* Remove single card button (only when unlocked & has card) */}
      {card && !locked && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemoveCard?.(idx)
          }}
          title="Kembalikan kartu ini ke daftar kartu"
          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-transform hover:scale-110 z-20 cursor-pointer"
          style={{
            background: 'rgba(220, 38, 38, 0.12)',
            color: '#DC2626',
            border: '1px solid rgba(220, 38, 38, 0.28)',
          }}
        >
          ✕
        </button>
      )}

      {card ? (
        <motion.div
          draggable={!locked}
          onDragStart={(e) => {
            if (locked) return
            onDragStart?.(e, card, idx)
          }}
          onDragEnd={() => {
            onDragEnd?.()
          }}
          onClick={(e) => {
            e.stopPropagation()
            if (!locked) onCardClick?.(idx)
          }}
          animate={isDragging ? { opacity: 0.4 } : { opacity: 1 }}
          className="flex flex-col items-center gap-1.5 w-full select-none pt-2"
          style={{ cursor: locked ? 'default' : 'pointer' }}
        >
          <span className="text-3xl leading-none flex-shrink-0">{card.icon}</span>
          <span
            className="ws-body text-center w-full px-1"
            style={{
              color: locked ? '#14532D' : '#1F2937',
              fontSize: '0.88rem',
              fontWeight: 700,
              lineHeight: 1.25,
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
              wordBreak: 'break-word',
            }}
          >
            {card.text}
          </span>
          {locked && (
            <span
              className="ws-label px-2 py-0.5 rounded-full mt-0.5"
              style={{
                background: '#16A34A',
                color: '#FFFFFF',
                fontSize: '.55rem',
                fontWeight: 800,
              }}
            >
              🔒 BENAR & TERKUNCI
            </span>
          )}
          {isSelected && !locked && (
            <span className="ws-label" style={{ color: '#DC2626', fontSize: '.55rem', fontWeight: 800 }}>
              KLIK SLOT TUJUAN
            </span>
          )}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center gap-1 opacity-65">
          <span style={{ color: '#990000', fontSize: '1.4rem', fontWeight: 700 }}>+</span>
          <span className="ws-label text-center" style={{ color: '#990000', fontSize: '.62rem', fontWeight: 700 }}>
            {selectedCard ? 'TARUH DI SINI' : `LANGKAH ${idx + 1}`}
          </span>
        </div>
      )}
    </motion.div>
  )
}

/* ── Explanations Modal ── */
function ExplanationsModal({ lockedSteps, onProceed, isTimeout }) {
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    if (isTimeout) return
    if (countdown <= 0) return
    const t = setInterval(() => setCountdown((c) => c - 1), 1000)
    return () => clearInterval(t)
  }, [countdown, isTimeout])

  const canProceed = isTimeout || countdown <= 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] overflow-y-auto overflow-x-hidden"
      style={{
        backgroundImage: 'url(/bg-studio-fikom.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="fixed inset-0 z-0" style={{ background: 'rgba(20, 5, 5, 0.82)', backdropFilter: 'blur(6px)' }} />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full px-4 py-8">
        <div
          className="flex items-center justify-between w-full max-w-6xl mb-4 px-4 py-2.5 rounded-2xl flex-shrink-0"
          style={{
            background: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.22)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <FikomBrandLink dark logoSize={34} />
          <InstagramBadge dark compact />
        </div>

        <div className="text-center mb-6 flex-shrink-0">
          <div className="text-4xl mb-1">{isTimeout ? '⏰' : '🎉'}</div>
          <h2 className="ws-title text-2xl sm:text-3xl mb-1" style={{ color: '#FFFFFF' }}>
            {isTimeout ? 'Waktu Habis!' : 'Luar Biasa! Puzzle Selesai!'}
          </h2>
          <p className="ws-desc text-sm" style={{ color: 'rgba(255,255,255,.85)' }}>
            {isTimeout
              ? 'Inilah 6 urutan langkah berpikir kritis yang benar saat menggunakan AI:'
              : 'Urutan berpikir kritis kamu 100% tepat! Berikut rangkuman penjelasannya:'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full flex-1 mb-8 max-w-6xl">
          {STEP_EXPLANATIONS.map((d, i) => {
            const isLocked = lockedSteps.includes(i) || !isTimeout
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl p-5 flex flex-col"
                style={{
                  background: isLocked ? 'rgba(255,255,255,.16)' : 'rgba(255,255,255,.09)',
                  border: `1px solid ${isLocked ? d.color + '90' : 'rgba(255,255,255,.2)'}`,
                  borderLeft: `5px solid ${isLocked ? d.color : 'rgba(255,255,255,.3)'}`,
                  backdropFilter: 'blur(16px)',
                }}
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-2xl flex-shrink-0">{d.icon}</span>
                  <strong
                    className="ws-body text-base flex-1"
                    style={{
                      color: '#FFFFFF',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                    }}
                  >
                    {d.step}. {d.title}
                  </strong>
                  {isLocked && (
                    <span
                      className="ws-label flex-shrink-0 px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(22,163,74,0.3)', color: '#86EFAC', fontSize: '.58rem', fontWeight: 800 }}
                    >
                      ✓ BENAR
                    </span>
                  )}
                </div>
                <p
                  className="ws-desc leading-relaxed flex-1"
                  style={{ color: 'rgba(255,255,255,.92)', fontSize: '0.95rem', lineHeight: 1.65 }}
                >
                  {d.text}
                </p>
              </motion.div>
            )
          })}
        </div>

        <div className="flex-shrink-0">
          <motion.button
            whileHover={canProceed ? { scale: 1.04, y: -2 } : {}}
            whileTap={canProceed ? { scale: 0.96 } : {}}
            onClick={canProceed ? onProceed : undefined}
            className="ws-btn px-10 sm:px-12 py-4 rounded-2xl text-white text-sm sm:text-base font-bold"
            style={{
              background: canProceed
                ? 'linear-gradient(135deg, #990000, #DC2626, #F59E0B)'
                : '#6B7280',
              boxShadow: canProceed ? '0 8px 28px rgba(220,38,38,.45)' : 'none',
              cursor: canProceed ? 'pointer' : 'not-allowed',
              opacity: canProceed ? 1 : 0.8,
            }}
          >
            {isTimeout
              ? '🔄 Kembali ke Menu Utama'
              : canProceed
              ? '🏆 Lihat Hasil & Skor Akhir →'
              : `Tunggu ${countdown} detik...`}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Main Puzzle (Game 2) ── */
export default function PuzzleDragDrop() {
  const store = useGameStore()
  const { sourceCards, initialCards, slottedCards, lockedMask, setScreen, stopTimer } = store

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
      tl.fromTo(headerRef.current, { autoAlpha: 0, y: -25 }, { autoAlpha: 1, y: 0, duration: 0.55, delay: 0.1 })
      tl.fromTo(gridRef.current, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.55 }, '-=.2')
      tl.fromTo(poolRef.current, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.5 }, '-=.2')
    })
    return () => ctx.revert()
  }, [])

  const clearSel = () => {
    setSelectedPoolCard(null)
    setSelectedSlotIdx(null)
  }

  const handleDragStart = useCallback((e, card, slotIdx) => {
    clearSel()
    setDragCard(card)
    setDragFromSlot(slotIdx)
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleDragEnd = useCallback(() => {
    setDragCard(null)
    setDragFromSlot(null)
    setOverSlot(null)
  }, [])

  const handleDrop = useCallback(
    (idx) => {
      if (lockedMask[idx]) return
      if (dragFromSlot !== null) {
        if (dragFromSlot === idx) return
        store.moveCardBetweenSlots(dragFromSlot, idx)
      } else if (dragCard) {
        store.placeCard(idx, dragCard)
      }
      setDragCard(null)
      setDragFromSlot(null)
      setOverSlot(null)
    },
    [dragCard, dragFromSlot, lockedMask, store]
  )

  const handlePoolCardSelect = (card) => {
    if (selectedPoolCard?.id === card.id) {
      clearSel()
      return
    }
    clearSel()
    setSelectedPoolCard(card)
  }

  const handleSlotCardClick = (idx) => {
    if (lockedMask[idx]) return
    if (selectedPoolCard) {
      store.placeCard(idx, selectedPoolCard)
      clearSel()
      return
    }
    if (selectedSlotIdx === idx) {
      clearSel()
      return
    }
    if (selectedSlotIdx !== null) {
      store.moveCardBetweenSlots(selectedSlotIdx, idx)
      clearSel()
      return
    }
    setSelectedSlotIdx(idx)
  }

  const handleEmptySlotClick = (idx) => {
    if (lockedMask[idx]) return
    if (selectedPoolCard) {
      store.placeCard(idx, selectedPoolCard)
      clearSel()
      return
    }
    if (selectedSlotIdx !== null) {
      store.moveCardBetweenSlots(selectedSlotIdx, idx)
      clearSel()
      return
    }
  }

  const handleRemoveCardFromSlot = (idx) => {
    if (lockedMask[idx]) return
    clearSel()
    store.returnCardFromSlot(idx)
  }

  const handleCheck = () => {
    const result = store.checkPuzzle(CORRECT_ORDER, (stepIdx) => {
      setLockedSteps((prev) => (prev.includes(stepIdx) ? prev : [...prev, stepIdx]))
    })
    if (result.error) {
      toast('⚠️ ' + result.error)
      return
    }
    if (result.win) {
      clearSel()
      stopTimer()
      setIsTimeout(false)
      setShowModal(true)
    } else {
      clearSel()
      if (result.newLocked > 0 && result.wrong > 0) {
        toast(`🔒 ${result.newLocked} benar & terkunci! ❌ ${result.wrong} salah (−${result.penalty} dtk)`)
      } else if (result.newLocked > 0) {
        toast(`🔒 Mantap! ${result.newLocked} jawaban benar telah terkunci!`)
      } else if (result.wrong > 0) {
        toast(`❌ ${result.wrong} kartu belum tepat (−${result.penalty} dtk). Jawaban benar tetap terkunci!`)
      }
    }
  }

  const handleReset = () => {
    clearSel()
    const { newlyLocked, clearedCount } = store.resetUnlockedPuzzle(CORRECT_ORDER, (stepIdx) => {
      setLockedSteps((prev) => (prev.includes(stepIdx) ? prev : [...prev, stepIdx]))
    })

    const currentLocks = useGameStore.getState().lockedMask
    if (currentLocks.every((v) => v)) {
      stopTimer()
      setIsTimeout(false)
      setShowModal(true)
      return
    }

    if (newlyLocked > 0 && clearedCount > 0) {
      toast(`🔒 ${newlyLocked} jawaban benar dikunci & ${clearedCount} kartu salah dikembalikan!`)
    } else if (newlyLocked > 0) {
      toast(`🔒 ${newlyLocked} jawaban yang sudah benar dikunci (stay)!`)
    } else if (clearedCount > 0) {
      toast(`🔄 ${clearedCount} kartu yang belum terkunci dikembalikan. Jawaban benar tetap stay!`)
    } else {
      toast('ℹ️ Jawaban yang sudah benar tetap terkunci!')
    }
  }

  const handleProceed = () => {
    setShowModal(false)
    if (isTimeout) setScreen('landing')
    else {
      stopTimer()
      setScreen('recap')
    }
  }

  const placedIds = new Set(slottedCards.filter(Boolean).map((c) => c.id))
  const lockedCardIds = new Set(
    slottedCards.map((c, i) => (lockedMask[i] && c ? c.id : null)).filter(Boolean)
  )
  const lockedCount = lockedMask.filter(Boolean).length
  const selCard = selectedPoolCard || (selectedSlotIdx !== null ? slottedCards[selectedSlotIdx] : null)
  const hasSelection = selectedPoolCard !== null || selectedSlotIdx !== null

  return (
    <div
      className="fixed inset-0 overflow-auto z-10"
      style={{
        backgroundImage: 'url(/bg-studio-fikom.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(26, 5, 5, 0.5) 0%, rgba(42, 8, 8, 0.65) 100%)',
          backdropFilter: 'blur(2px)',
        }}
      />

      <HUD gameName="GAME 2: PUZZLE" gameIcon="🧩" />

      {/* ── Main wrapper: full height below HUD ── */}
      <div className="relative z-10 flex flex-col min-h-screen" style={{ paddingTop: '62px' }}>
        {/* ── Header ── */}
        <div ref={headerRef} style={{ opacity: 0 }} className="text-center pt-2 pb-2 px-4 flex-shrink-0">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span
              className="ws-label px-3 py-0.5 rounded-full"
              style={{
                background: 'rgba(220, 38, 38, 0.9)',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.35)',
                fontSize: '0.62rem',
              }}
            >
              🧩 GAME 2 DARI 2 • ASAH LOGIKA ({lockedCount}/6 TERKUNCI)
            </span>
          </div>
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-1">
            <span className="text-2xl" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,.3))' }}>
              🤖
            </span>
            <h1 className="flex items-baseline gap-2">
              <span
                className="ws-title"
                style={{
                  fontSize: 'clamp(1.25rem,2.4vw,1.75rem)',
                  color: '#FFFFFF',
                  textShadow: '0 2px 12px rgba(0,0,0,.7)',
                }}
              >
                Puzzle
              </span>
              <span
                className="ws-hero"
                style={{
                  fontSize: 'clamp(1.25rem,2.4vw,1.75rem)',
                  color: '#FBBF24',
                  textShadow: '0 2px 12px rgba(0,0,0,.7)',
                }}
              >
                Berpikir Kritis AI
              </span>
            </h1>
            <span className="text-2xl" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,.3))' }}>
              🧩
            </span>
          </div>
          <p
            className="ws-desc text-xs font-bold inline-block px-3.5 py-1 rounded-full"
            style={{
              color: '#FFFFFF',
              background: 'rgba(153, 0, 0, 0.75)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255,255,255,0.25)',
            }}
          >
            ✦ Susun 6 langkah berpikir kritis yang benar — Jawaban yang sudah benar akan otomatis terkunci (stay)! ✦
          </p>
        </div>

        {/* ── Left / Right Split ── */}
        <div className="flex flex-col lg:flex-row flex-1 gap-3 lg:gap-4 px-4 pb-4 min-h-0">
          {/* ══ LEFT PANEL — Pool Kartu ══ */}
          <div ref={poolRef} style={{ opacity: 0 }} className="flex flex-col w-full lg:w-1/2 min-h-0">
            <div
              className="flex items-center gap-2 mb-2 flex-shrink-0 px-3 py-1.5 rounded-xl border shadow-sm"
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(8px)',
                borderColor: 'rgba(153,0,0,0.2)',
              }}
            >
              <div className="flex-1 h-px" style={{ background: 'rgba(153,0,0,.25)' }} />
              <p
                className="ws-label flex items-center gap-1"
                style={{ color: '#7F1D1D', fontSize: '.65rem', fontWeight: 800 }}
              >
                🃏 PILIHAN KARTU (6 BENAR & 6 JEBAKAN)
              </p>
              <div className="flex-1 h-px" style={{ background: 'rgba(153,0,0,.25)' }} />
            </div>

            {/* Cards container */}
            <div
              className="flex-1 rounded-2xl p-2.5"
              style={{
                background: 'rgba(255, 255, 255, 0.72)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.85)',
                boxShadow: '0 8px 28px rgba(0, 0, 0, 0.18)',
              }}
            >
              <div className="grid grid-cols-3 lg:grid-cols-4 grid-rows-4 lg:grid-rows-3 gap-2 h-full min-h-[340px] lg:min-h-0">
                {(initialCards.length > 0 ? initialCards : sourceCards).map((c) => (
                  <PoolCard
                    key={c.id}
                    card={c}
                    isSelected={selectedPoolCard?.id === c.id}
                    isLocked={lockedCardIds.has(c.id)}
                    isPlaced={placedIds.has(c.id) && !lockedCardIds.has(c.id)}
                    isDragging={dragCard?.id === c.id && dragFromSlot === null}
                    onSelect={handlePoolCardSelect}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mt-2 flex-shrink-0 bg-white/85 backdrop-blur-sm px-3.5 py-1 rounded-full border border-red-200 shadow-sm self-center">
              <span className="ws-desc text-xs font-bold" style={{ color: '#7F1D1D' }}>
                <span className="inline lg:hidden">Klik kartu lalu klik nomor slot di bawah ↓</span>
                <span className="hidden lg:inline">Klik atau Drag kartu ke slot urutan di kanan →</span>
              </span>
            </div>
          </div>

          {/* ══ RIGHT PANEL — Slots ══ */}
          <div ref={gridRef} style={{ opacity: 0 }} className="flex flex-col w-full lg:w-1/2 min-h-0 mt-3 lg:mt-0">
            <div
              className="flex items-center gap-2 mb-2 flex-shrink-0 px-3 py-1.5 rounded-xl border shadow-sm"
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(8px)',
                borderColor: 'rgba(153,0,0,0.2)',
              }}
            >
              <div className="flex-1 h-px" style={{ background: 'rgba(153,0,0,.25)' }} />
              <p
                className="ws-label flex items-center gap-1"
                style={{ color: '#7F1D1D', fontSize: '.65rem', fontWeight: 800 }}
              >
                📋 6 URUTAN LANGKAH BERPIKIR KRITIS
              </p>
              <div className="flex-1 h-px" style={{ background: 'rgba(153,0,0,.25)' }} />
            </div>

            {/* Slots container */}
            <div
              className="flex-1 rounded-2xl p-2.5"
              style={{
                background: 'rgba(255, 255, 255, 0.78)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.9)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.18)',
              }}
            >
              <div className="grid grid-cols-2 lg:grid-cols-3 grid-rows-3 lg:grid-rows-2 gap-2.5 h-full min-h-[290px] lg:min-h-0">
                {Array(6)
                  .fill(null)
                  .map((_, i) => (
                    <Slot
                      key={i}
                      idx={i}
                      card={slottedCards[i]}
                      locked={lockedMask[i]}
                      isOver={overSlot === i}
                      selectedCard={selCard}
                      selectedFromSlot={selectedSlotIdx}
                      isDragging={dragFromSlot === i}
                      onDragOver={() => setOverSlot(i)}
                      onDragLeave={() => setOverSlot(null)}
                      onDrop={handleDrop}
                      onDragStart={(e, card, from) => handleDragStart(e, card, from)}
                      onDragEnd={handleDragEnd}
                      onSlotClick={handleEmptySlotClick}
                      onCardClick={() => handleSlotCardClick(i)}
                      onRemoveCard={handleRemoveCardFromSlot}
                    />
                  ))}
              </div>
            </div>

            {/* Selection hint */}
            <AnimatePresence>
              {hasSelection && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mt-2 px-3.5 py-1.5 rounded-xl flex items-center justify-between flex-shrink-0"
                  style={{
                    background: 'rgba(255, 255, 255, 0.92)',
                    border: '1.5px solid #DC2626',
                  }}
                >
                  <span className="ws-desc text-xs font-bold" style={{ color: '#990000' }}>
                    {selectedPoolCard
                      ? `🎯 "${selectedPoolCard.text}" dipilih — klik slot nomor tujuan!`
                      : `🔀 Slot ${(selectedSlotIdx ?? 0) + 1} dipilih — klik slot lain untuk menukar posisi`}
                  </span>
                  <button
                    onClick={clearSel}
                    className="ws-label ml-2 px-2 py-0.5 rounded-lg cursor-pointer"
                    style={{
                      background: 'rgba(220,38,38,.12)',
                      color: '#DC2626',
                      border: '1px solid rgba(220,38,38,.25)',
                      fontSize: '.6rem',
                    }}
                  >
                    Batal ✕
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-3 flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleCheck}
                className="ws-btn flex-1 py-3.5 sm:py-4 rounded-xl text-sm text-white flex items-center justify-center gap-2 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #15803D, #16A34A, #10B981)',
                  boxShadow: '0 6px 22px rgba(22,163,74,.4)',
                  border: '1px solid rgba(255,255,255,0.25)',
                }}
              >
                <span
                  className="font-bold text-base sm:text-lg text-white"
                  style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                >
                  ✓ Periksa & Kunci Jawaban Benar
                </span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleReset}
                title="Hanya mereset kartu yang salah/belum terkunci. Jawaban yang sudah benar tetap terkunci!"
                className="ws-body px-4 sm:px-6 py-3.5 sm:py-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer"
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  border: '1.5px solid rgba(153,0,0,.3)',
                  color: '#990000',
                  boxShadow: '0 4px 12px rgba(0,0,0,.1)',
                }}
              >
                <span>🔄 Reset yang Salah</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Toasts */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              className="toast"
            >
              {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showModal && (
          <ExplanationsModal
            lockedSteps={lockedSteps}
            isTimeout={isTimeout}
            onProceed={handleProceed}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

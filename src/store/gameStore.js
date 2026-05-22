import { create } from 'zustand'

const useGameStore = create((set, get) => ({
  // Core
  playerName: '',
  score: 0,
  lives: 3,
  timeLeft: 300,
  timerRef: null,
  currentScreen: 'landing', // landing | puzzle | trueorfalse | gameover | recap | leaderboard
  scoreSaved: false,

  // Puzzle
  sourceCards: [],
  initialCards: [],   // fixed-position reference — never changes after init
  slottedCards: Array(6).fill(null),
  lockedMask: Array(6).fill(false),
  puzzleStartTime: null,

  // True/False
  shuffledQuestions: [],
  currentQIdx: 0,
  correctStreak: 0,
  answering: false,

  // Game over
  gameOverReason: null,

  // Leaderboard (Online via API)
  leaderboard: [],
  leaderboardLoading: false,

  loadLeaderboard: async () => {
    set({ leaderboardLoading: true })
    try {
      const res = await fetch('/api/leaderboard')
      if (res.ok) {
        const data = await res.json()
        set({ leaderboard: data })
      }
    } catch (err) {
      console.error('Gagal mengambil leaderboard:', err)
    } finally {
      set({ leaderboardLoading: false })
    }
  },

  /* ── Actions ── */
  setScreen: (s) => set({ currentScreen: s }),
  setPlayerName: (n) => set({ playerName: n }),
  setGameOverReason: (r) => set({ gameOverReason: r }),

  addScore: (pts) => set(s => ({ score: Math.max(0, s.score + pts) })),

  startTimer: () => {
    const { timerRef } = get()
    if (timerRef) clearInterval(timerRef)
    const ref = setInterval(() => {
      const { timeLeft, currentScreen } = get()
      const next = Math.max(0, timeLeft - 1)
      set({ timeLeft: next })
      if (next <= 0) {
        clearInterval(ref)
        if (['puzzle', 'trueorfalse'].includes(currentScreen)) {
          set({ currentScreen: 'gameover', gameOverReason: 'time' })
        }
      }
    }, 1000)
    set({ timerRef: ref })
  },

  stopTimer: () => {
    const { timerRef } = get()
    if (timerRef) clearInterval(timerRef)
    set({ timerRef: null })
  },

  resetGame: () => {
    const { stopTimer } = get()
    stopTimer()
    set({
      score: 0, lives: 3, timeLeft: 300, correctStreak: 0,
      slottedCards: Array(6).fill(null),
      lockedMask: Array(6).fill(false),
      currentQIdx: 0, answering: false,
      scoreSaved: false,
      gameOverReason: null,
    })
  },

  // Puzzle
  initPuzzle: (cards) => set({
    sourceCards: cards,
    initialCards: cards,   // snapshot — position never changes
    slottedCards: Array(6).fill(null),
    lockedMask: Array(6).fill(false),
    puzzleStartTime: Date.now(),
  }),

  placeCard: (slotIdx, card) => {
    const { slottedCards, sourceCards, lockedMask } = get()
    if (lockedMask[slotIdx]) return
    const existing = slottedCards[slotIdx]
    const newSlotted = [...slottedCards]
    newSlotted[slotIdx] = card
    let newSource = sourceCards.filter(c => c.id !== card.id)
    if (existing) newSource = [...newSource, existing]
    set({ slottedCards: newSlotted, sourceCards: newSource })
  },

  moveCardBetweenSlots: (fromIdx, toIdx) => {
    const { slottedCards, lockedMask } = get()
    if (lockedMask[fromIdx] || lockedMask[toIdx]) return
    const newSlotted = [...slottedCards]
    const tmp = newSlotted[fromIdx]
    newSlotted[fromIdx] = newSlotted[toIdx]
    newSlotted[toIdx] = tmp
    set({ slottedCards: newSlotted })
  },

  returnCardFromSlot: (idx) => {
    const { slottedCards, sourceCards, lockedMask } = get()
    if (lockedMask[idx] || !slottedCards[idx]) return
    const card = slottedCards[idx]
    const newSlotted = [...slottedCards]
    newSlotted[idx] = null
    set({ slottedCards: newSlotted, sourceCards: [...sourceCards, card] })
  },

  checkPuzzle: (correctOrder, onExplain) => {
    const { slottedCards, lockedMask, timeLeft, addScore, puzzleStartTime } = get()
    const unlockedEmpty = slottedCards.some((c, i) => !lockedMask[i] && c === null)
    if (unlockedEmpty) return { error: 'Isi semua slot yang belum terkunci dulu!' }

    let wrong = 0, newLocked = 0
    const newSlotted = [...slottedCards]
    const newLockMask = [...lockedMask]
    const newSource = []

    for (let i = 0; i < 6; i++) {
      if (lockedMask[i]) continue
      const card = slottedCards[i]
      if (!card) continue
      if (correctOrder[i].id === card.id) {
        newLockMask[i] = true
        newLocked++
        onExplain(i)
      } else {
        newSource.push(card)
        newSlotted[i] = null
        wrong++
      }
    }

    const penalty = wrong * 10
    set({
      slottedCards: newSlotted,
      lockedMask: newLockMask,
      sourceCards: [...get().sourceCards, ...newSource],
      timeLeft: Math.max(0, timeLeft - penalty),
    })

    const allLocked = newLockMask.every(v => v)
    if (allLocked) {
      const elapsed = (Date.now() - puzzleStartTime) / 1000
      let pts = 50
      if (elapsed < 60) pts += 20
      addScore(pts)
      return { win: true, pts, speedBonus: elapsed < 60 }
    }
    return { wrong, newLocked, penalty }
  },

  // True/False
  initTF: (questions) => set({
    shuffledQuestions: questions,
    currentQIdx: 0,
    correctStreak: 0,
    answering: false,
  }),

  submitAnswer: (ans, correctAnswer) => {
    const { score, lives, correctStreak, currentQIdx, shuffledQuestions, addScore } = get()
    const ok = ans === correctAnswer
    let bonus = false
    if (ok) {
      addScore(10)
      const newStreak = correctStreak + 1
      if (newStreak % 3 === 0) { addScore(15); bonus = true }
      set({ correctStreak: newStreak, answering: true })
    } else {
      set({ score: Math.max(0, score - 5), lives: lives - 1, correctStreak: 0, answering: true })
    }
    return { ok, bonus, newLives: ok ? lives : lives - 1 }
  },

  nextQuestion: () => {
    const { currentQIdx, shuffledQuestions } = get()
    const next = currentQIdx + 1
    if (next >= shuffledQuestions.length) {
      get().stopTimer()
      set({ currentScreen: 'recap' })
    } else {
      set({ currentQIdx: next, answering: false })
    }
  },

  // Leaderboard
  saveScore: async () => {
    const { playerName, score, scoreSaved } = get()
    if (scoreSaved) return // prevent duplicate saves per session

    set({ scoreSaved: true })
    const today = new Date().toLocaleDateString('id-ID')

    try {
      await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: playerName, score, date: today })
      })
      // Reload the leaderboard after saving
      get().loadLeaderboard()
    } catch (err) {
      console.error('Gagal menyimpan skor:', err)
    }
  },
}))

export default useGameStore

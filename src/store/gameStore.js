import { create } from 'zustand'
import { CORRECT_ORDER, DECOY_CARDS } from '../games/PuzzleDragDrop/data'

const LOCAL_STORAGE_KEY = 'fikom_ai_game_leaderboard_v2'
const LOCAL_PLAYERS_KEY = 'fikom_ai_game_all_players_v2'
const GSHEET_URL_KEY = 'fikom_ai_game_gsheet_url'

const shuffle = (a) => {
  const b = [...a]
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[b[i], b[j]] = [b[j], b[i]]
  }
  return b
}

const sortPlayers = (list) => {
  if (!Array.isArray(list)) return []
  return [...list].sort((a, b) => {
    if ((b.score ?? 0) !== (a.score ?? 0)) return (b.score ?? 0) - (a.score ?? 0)
    const aTime = a.timeSpent != null ? Number(a.timeSpent) : 300
    const bTime = b.timeSpent != null ? Number(b.timeSpent) : 300
    return aTime - bTime
  })
}

const getLocalPlayers = () => {
  try {
    const raw = localStorage.getItem(LOCAL_PLAYERS_KEY) || localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) return []
    const list = JSON.parse(raw)
    return sortPlayers(list)
  } catch {
    return []
  }
}

const getActiveOnly = (list) => sortPlayers(list.filter((item) => !item.isArchived))

const getNextActiveKloter = (list) => {
  const archivedKloters = list
    .filter((item) => item.isArchived)
    .map((item) => Number(item.kloter) || 1)
  const maxArch = archivedKloters.length > 0 ? Math.max(...archivedKloters) : 0
  return maxArch + 1
}

const saveLocalPlayerRecord = (record) => {
  try {
    let list = getLocalPlayers()
    const activeKloter = getNextActiveKloter(list)
    const safeTime = record.timeSpent != null ? Number(record.timeSpent) : 300
    const cleanName = String(record.name || '').trim()

    // Cari hanya di kloter yang sedang aktif (!isArchived)
    const existingIndex = list.findIndex(
      (item) =>
        !item.isArchived &&
        String(item.name || '').trim().toLowerCase() === cleanName.toLowerCase()
    )

    if (existingIndex >= 0) {
      const prev = list[existingIndex]
      const prevTime = prev.timeSpent != null ? Number(prev.timeSpent) : 300
      const isBetterScore = record.score > prev.score
      const isBetterTime = record.score === prev.score && safeTime < prevTime

      if (isBetterScore || isBetterTime) {
        list[existingIndex] = {
          ...prev,
          ...record,
          name: cleanName,
          timeSpent: safeTime,
          kloter: activeKloter,
          isArchived: 0,
        }
      } else {
        list[existingIndex] = {
          ...prev,
          rawName: record.rawName || prev.rawName || '',
          kelas: record.kelas || prev.kelas || '',
          school: record.school || prev.school || '',
          kloter: activeKloter,
        }
      }
    } else {
      list.push({
        id: Date.now(),
        ...record,
        name: cleanName,
        timeSpent: safeTime,
        kloter: activeKloter,
        isArchived: 0,
      })
    }

    list = sortPlayers(list)
    const activeList = getActiveOnly(list)
    localStorage.setItem(LOCAL_PLAYERS_KEY, JSON.stringify(list))
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(activeList.slice(0, 10)))
    return list
  } catch (e) {
    console.error('Gagal menyimpan ke localStorage:', e)
    return []
  }
}

export const formatPlayerIdentity = (rawName, kelas, school) => {
  const n = String(rawName || '').trim()
  const k = String(kelas || '').trim()
  const s = String(school || '').trim()
  if (n && k && s) return `${n} - ${k} / ${s}`
  if (n && k) return `${n} - ${k}`
  if (n && s) return `${n} / ${s}`
  return n
}

const useGameStore = create((set, get) => ({
  // Core Player Identity (Nama, Kelas, Asal Sekolah)
  playerName: '',
  playerRawName: '',
  playerClass: '',
  playerSchool: '',

  score: 0,
  lives: 3,
  timeLeft: 300,
  timerRef: null,
  currentScreen: 'landing',
  scoreSaved: false,

  // Puzzle (Game 2)
  sourceCards: [],
  initialCards: [],
  slottedCards: Array(6).fill(null),
  lockedMask: Array(6).fill(false),
  puzzleStartTime: null,

  // True/False (Game 1)
  shuffledQuestions: [],
  currentQIdx: 0,
  correctStreak: 0,
  answering: false,

  // Game over
  gameOverReason: null,

  // Leaderboard (Active Kloter Top 10) & allPlayers (All Kloters History)
  leaderboard: getActiveOnly(getLocalPlayers()).slice(0, 10),
  allPlayers: getLocalPlayers(),
  leaderboardLoading: false,
  isOnlineSync: false,
  gsheetUrl:
    (typeof window !== 'undefined' && localStorage.getItem(GSHEET_URL_KEY)) ||
    import.meta.env.VITE_GOOGLE_SHEETS_URL ||
    '',

  setGsheetUrl: (url) => {
    const clean = String(url || '').trim()
    try {
      if (clean) localStorage.setItem(GSHEET_URL_KEY, clean)
      else localStorage.removeItem(GSHEET_URL_KEY)
    } catch {}
    set({ gsheetUrl: clean })
  },

  loadLeaderboard: async () => {
    set({ leaderboardLoading: true })
    const gsheetUrl = get().gsheetUrl

    // 1. Ambil dari Server Database Terpusat (/api/players)
    try {
      const res = await fetch('/api/players?t=' + Date.now(), {
        headers: { Accept: 'application/json' },
      })
      if (res.ok) {
        const contentType = res.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
          const allData = sortPlayers(await res.json())
          const activeTop10 = getActiveOnly(allData).slice(0, 10)
          set({
            allPlayers: allData,
            leaderboard: activeTop10,
            isOnlineSync: true,
            leaderboardLoading: false,
          })
          try {
            localStorage.setItem(LOCAL_PLAYERS_KEY, JSON.stringify(allData))
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(activeTop10))
          } catch {}
          return
        }
      }
    } catch (err) {
      // Lanjut cek Google Sheets atau fallback lokal
    }

    // 2. Jika Google Sheets Apps Script URL diatur
    if (gsheetUrl) {
      try {
        const res = await fetch(
          gsheetUrl + (gsheetUrl.includes('?') ? '&' : '?') + 't=' + Date.now()
        )
        if (res.ok) {
          const rawData = await res.json()
          const list = Array.isArray(rawData) ? rawData : rawData?.data || []
          const sorted = sortPlayers(list)
          const activeTop10 = getActiveOnly(sorted).slice(0, 10)
          set({
            allPlayers: sorted,
            leaderboard: activeTop10,
            isOnlineSync: true,
            leaderboardLoading: false,
          })
          try {
            localStorage.setItem(LOCAL_PLAYERS_KEY, JSON.stringify(sorted))
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(activeTop10))
          } catch {}
          return
        }
      } catch (err) {
        console.warn('Gagal mengambil data dari Google Sheets:', err)
      }
    }

    // 3. Fallback ke penyimpanan lokal
    const localAll = getLocalPlayers()
    set({
      allPlayers: localAll,
      leaderboard: getActiveOnly(localAll).slice(0, 10),
      isOnlineSync: false,
      leaderboardLoading: false,
    })
  },

  /* ── Actions ── */
  setScreen: (s) => set({ currentScreen: s }),

  setPlayerName: (n) => set({ playerName: n }),

  setPlayerInfo: ({ rawName = '', kelas = '', school = '', fullName = '' }) => {
    const formatted = fullName || formatPlayerIdentity(rawName, kelas, school)
    set({
      playerRawName: String(rawName || '').trim(),
      playerClass: String(kelas || '').trim(),
      playerSchool: String(school || '').trim(),
      playerName: formatted,
    })
  },

  setGameOverReason: (r) => set({ gameOverReason: r }),

  addScore: (pts) => set((s) => ({ score: Math.max(0, s.score + pts) })),

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
      score: 0,
      lives: 3,
      timeLeft: 300,
      correctStreak: 0,
      slottedCards: Array(6).fill(null),
      lockedMask: Array(6).fill(false),
      currentQIdx: 0,
      answering: false,
      scoreSaved: false,
      gameOverReason: null,
    })
  },

  // ── Game 2: Puzzle Drag & Drop ──
  initPuzzle: (cards) =>
    set({
      sourceCards: cards,
      initialCards: cards,
      slottedCards: Array(6).fill(null),
      lockedMask: Array(6).fill(false),
      puzzleStartTime: Date.now(),
    }),

  placeCard: (slotIdx, card) => {
    const { slottedCards, sourceCards, lockedMask } = get()
    if (lockedMask[slotIdx]) return

    const lockedSlotWithCard = slottedCards.findIndex((c, i) => lockedMask[i] && c?.id === card.id)
    if (lockedSlotWithCard >= 0) return

    const existing = slottedCards[slotIdx]
    const newSlotted = [...slottedCards]

    for (let i = 0; i < 6; i++) {
      if (i !== slotIdx && !lockedMask[i] && newSlotted[i]?.id === card.id) {
        newSlotted[i] = null
      }
    }

    newSlotted[slotIdx] = card
    let newSource = sourceCards.filter((c) => c.id !== card.id)
    if (existing && existing.id !== card.id) {
      newSource = [...newSource.filter((c) => c.id !== existing.id), existing]
    }
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
    set({
      slottedCards: newSlotted,
      sourceCards: [...sourceCards.filter((c) => c.id !== card.id), card],
    })
  },

  resetUnlockedPuzzle: (correctOrder = CORRECT_ORDER, onExplain) => {
    const { slottedCards, lockedMask, sourceCards } = get()
    const newSlotted = [...slottedCards]
    const newLockMask = [...lockedMask]
    const returnedCards = []
    let newlyLocked = 0

    for (let i = 0; i < 6; i++) {
      if (newLockMask[i]) continue
      const card = newSlotted[i]
      if (!card) continue
      if (correctOrder[i] && correctOrder[i].id === card.id) {
        newLockMask[i] = true
        newlyLocked++
        onExplain?.(i)
      } else {
        returnedCards.push(card)
        newSlotted[i] = null
      }
    }

    const existingIds = new Set(sourceCards.map((c) => c.id))
    const mergedSource = [
      ...sourceCards,
      ...returnedCards.filter((c) => !existingIds.has(c.id)),
    ]

    set({
      slottedCards: newSlotted,
      lockedMask: newLockMask,
      sourceCards: mergedSource,
    })

    return { newlyLocked, clearedCount: returnedCards.length }
  },

  checkPuzzle: (correctOrder, onExplain) => {
    const { slottedCards, lockedMask, timeLeft, addScore, puzzleStartTime, sourceCards } = get()

    const hasAnyUnlockedFilled = slottedCards.some((c, i) => !lockedMask[i] && c !== null)
    if (!hasAnyUnlockedFilled) {
      return { error: 'Pasang kartu ke dalam slot terlebih dahulu!' }
    }

    let wrong = 0
    let newLocked = 0
    let emptyUnlocked = 0
    const newSlotted = [...slottedCards]
    const newLockMask = [...lockedMask]
    const returnedToSource = []

    for (let i = 0; i < 6; i++) {
      if (lockedMask[i]) continue
      const card = slottedCards[i]
      if (!card) {
        emptyUnlocked++
        continue
      }
      if (correctOrder[i].id === card.id) {
        newLockMask[i] = true
        newLocked++
        onExplain?.(i)
      } else {
        returnedToSource.push(card)
        newSlotted[i] = null
        wrong++
      }
    }

    const penalty = wrong * 10
    const existingIds = new Set(sourceCards.map((c) => c.id))
    const updatedSource = [
      ...sourceCards,
      ...returnedToSource.filter((c) => !existingIds.has(c.id)),
    ]

    const nextTimeLeft = Math.max(0, timeLeft - penalty)
    set({
      slottedCards: newSlotted,
      lockedMask: newLockMask,
      sourceCards: updatedSource,
      timeLeft: nextTimeLeft,
    })

    const allLocked = newLockMask.every((v) => v)
    if (allLocked) {
      const elapsed = (Date.now() - (puzzleStartTime || Date.now())) / 1000
      let pts = 50
      if (elapsed < 60) pts += 20
      addScore(pts)
      return { win: true, pts, speedBonus: elapsed < 60 }
    }

    return { wrong, newLocked, penalty, emptyUnlocked }
  },

  // ── Game 1: True/False ──
  initTF: (questions) =>
    set({
      shuffledQuestions: questions,
      currentQIdx: 0,
      correctStreak: 0,
      answering: false,
    }),

  submitAnswer: (ans, correctAnswer) => {
    const { score, lives, correctStreak, addScore } = get()
    const ok = ans === correctAnswer
    let bonus = false
    if (ok) {
      addScore(10)
      const newStreak = correctStreak + 1
      if (newStreak % 3 === 0) {
        addScore(15)
        bonus = true
      }
      set({ correctStreak: newStreak, answering: true })
    } else {
      set({
        score: Math.max(0, score - 5),
        lives: lives - 1,
        correctStreak: 0,
        answering: true,
      })
    }
    return { ok, bonus, newLives: ok ? lives : lives - 1 }
  },

  nextQuestion: () => {
    const { currentQIdx, shuffledQuestions, initPuzzle } = get()
    const next = currentQIdx + 1
    if (next >= shuffledQuestions.length) {
      const cards = shuffle([
        ...CORRECT_ORDER.map((c) => ({ ...c, isDecoy: false })),
        ...DECOY_CARDS,
      ])
      initPuzzle(cards)
      set({ currentScreen: 'puzzle', answering: false })
    } else {
      set({ currentQIdx: next, answering: false })
    }
  },

  // ── Simpan Skor ke Database Terpusat ──
  saveScore: async () => {
    const {
      playerName,
      playerRawName,
      playerClass,
      playerSchool,
      score,
      scoreSaved,
      timeLeft,
      gsheetUrl,
    } = get()
    if (scoreSaved || !playerName || !playerName.trim()) return

    set({ scoreSaved: true })
    const today = new Date().toLocaleDateString('id-ID')
    const timeSpent = Math.max(1, Math.min(300, 300 - timeLeft))

    const payload = {
      name: playerName.trim(),
      rawName: playerRawName || playerName.trim(),
      kelas: playerClass || '-',
      school: playerSchool || '-',
      score,
      timeSpent,
      date: today,
    }

    const updatedLocal = saveLocalPlayerRecord(payload)
    if (updatedLocal.length > 0) {
      set({
        allPlayers: updatedLocal,
        leaderboard: getActiveOnly(updatedLocal).slice(0, 10),
      })
    }

    try {
      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        await get().loadLeaderboard()
      }
    } catch (err) {
      console.warn('Backend server offline, skor disimpan di cache lokal.')
    }

    if (gsheetUrl) {
      try {
        await fetch(gsheetUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } catch (err) {
        console.warn('Gagal mengirim ke Google Sheets:', err)
      }
    }
  },

  // Arsipkan kloter aktif saat ini (saat tombol Reset Leaderboard ditekan)
  archiveLeaderboardLocal: () => {
    try {
      const list = getLocalPlayers()
      const activeKloter = getNextActiveKloter(list)
      const nowStr = new Date().toLocaleString('id-ID')
      const updated = list.map((item) =>
        !item.isArchived
          ? { ...item, isArchived: 1, kloter: activeKloter, archivedAt: nowStr }
          : item
      )
      localStorage.setItem(LOCAL_PLAYERS_KEY, JSON.stringify(updated))
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]))
      set({ allPlayers: updated, leaderboard: [] })
    } catch {}
  },

  clearLeaderboard: () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY)
      localStorage.removeItem(LOCAL_PLAYERS_KEY)
    } catch {}
    set({ leaderboard: [], allPlayers: [] })
  },
}))

export default useGameStore

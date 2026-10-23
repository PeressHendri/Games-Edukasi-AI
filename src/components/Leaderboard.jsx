import { motion } from 'framer-motion'
import useGameStore from '../store/gameStore'

const PODIUM = [
  { medal: '🥇', label: '1st', bg: 'linear-gradient(135deg,#D97706,#F59E0B)', border: '#FBBF24', glow: 'rgba(245,158,11,.4)' },
  { medal: '🥈', label: '2nd', bg: 'linear-gradient(135deg,#6B7280,#9CA3AF)', border: '#D1D5DB', glow: 'rgba(156,163,175,.3)' },
  { medal: '🥉', label: '3rd', bg: 'linear-gradient(135deg,#990000,#DC2626)', border: '#FCA5A5', glow: 'rgba(185,28,28,.35)' },
]

const fmtTime = (s) => {
  if (s == null) return null
  const min = Math.floor(s / 60)
  const sec = String(s % 60).padStart(2, '0')
  return `${min}:${sec}`
}

const parseEntryIdentity = (e) => {
  if (e.rawName && (e.kelas || e.school)) {
    const title = e.kelas && e.kelas !== '-' ? `${e.rawName} - ${e.kelas}` : e.rawName
    const school = e.school && e.school !== '-' ? e.school : ''
    const full = school ? `${title} / ${school}` : title
    return { title, school, full }
  }
  const full = String(e.name || '')
  if (full.includes('/')) {
    const [left, right] = full.split('/').map((s) => s.trim())
    return { title: left || full, school: right || '', full }
  }
  return { title: full, school: '', full }
}

export default function Leaderboard({ className = '', dark = false }) {
  const leaderboard = useGameStore((s) => s.leaderboard)
  const playerName = useGameStore((s) => s.playerName)
  const score = useGameStore((s) => s.score)

  if (leaderboard.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-6 text-center ${className}`}>
        <div className="text-3xl mb-2">🎬</div>
        <p className="ws-body text-xs sm:text-sm font-bold" style={{ color: dark ? 'rgba(255,255,255,.85)' : '#6B7280' }}>
          Belum ada pemain di Leaderboard.
        </p>
        <p className="ws-caption text-[0.7rem] mt-0.5" style={{ color: dark ? 'rgba(255,255,255,.6)' : '#9CA3AF' }}>
          Jadilah juara pertama dari sekolahmu!
        </p>
      </div>
    )
  }

  const top3 = leaderboard.slice(0, 3)
  const rest = leaderboard.slice(3)

  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      {/* ── Podium Top 3 (Compact) ── */}
      {top3.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5 items-end">
          {[1, 0, 2].map((rank) => {
            const e = top3[rank]
            if (!e) return <div key={rank} />
            const isMe = e.name === playerName && (e.score === score || !score)
            const p = PODIUM[rank]
            const isFirst = rank === 0
            const { title, school, full } = parseEntryIdentity(e)
            return (
              <motion.div
                key={`podium-${rank}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: rank * 0.1, type: 'spring', bounce: 0.4 }}
                title={full}
                className="flex flex-col items-center rounded-2xl px-1.5 py-2.5 text-center"
                style={{
                  background: p.bg,
                  boxShadow: `0 4px 16px ${p.glow}`,
                  border: `1.5px solid ${isMe ? '#FFFFFF' : p.border}`,
                  minHeight: isFirst ? '155px' : '135px',
                  justifyContent: 'flex-end',
                }}
              >
                <span style={{ fontSize: isFirst ? '1.8rem' : '1.5rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.35))' }}>
                  {p.medal}
                </span>
                <p
                  className="font-black truncate w-full mt-1 px-0.5"
                  style={{
                    color: '#FFFFFF',
                    fontSize: isFirst ? '0.78rem' : '0.7rem',
                    textShadow: '0 1px 3px rgba(0,0,0,.4)',
                  }}
                >
                  {title}
                </p>
                {school && (
                  <p
                    className="font-bold truncate w-full px-0.5"
                    style={{
                      color: 'rgba(255,255,255,0.92)',
                      fontSize: '0.58rem',
                      textShadow: '0 1px 2px rgba(0,0,0,.3)',
                    }}
                  >
                    {school}
                  </p>
                )}
                {isMe && (
                  <span
                    className="px-1.5 py-0.2 rounded-full font-black mt-0.5"
                    style={{ background: 'rgba(255,255,255,.3)', color: '#FFFFFF', fontSize: '.52rem' }}
                  >
                    KAMU
                  </span>
                )}
                <p
                  className="font-black mt-0.5"
                  style={{
                    color: '#FFFFFF',
                    fontSize: isFirst ? '1.15rem' : '0.98rem',
                    textShadow: '0 1px 3px rgba(0,0,0,.25)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {e.score} <span style={{ fontSize: '.62rem', fontWeight: 700, opacity: 0.9 }}>pts</span>
                </p>
                <div className="flex flex-col items-center mt-0.5" style={{ fontSize: '.55rem' }}>
                  {e.timeSpent != null && (
                    <span
                      className="font-bold px-1.5 py-0.2 rounded-full mb-0.5"
                      style={{ background: 'rgba(0,0,0,.25)', color: '#FFFFFF' }}
                    >
                      ⏱️ {fmtTime(e.timeSpent)}
                    </span>
                  )}
                  <p style={{ color: 'rgba(255,255,255,.8)' }}>{e.date}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* ── Divider ── */}
      {rest.length > 0 && (
        <div className="flex items-center gap-2 px-1">
          <div className="flex-1 h-px" style={{ background: dark ? 'rgba(255,255,255,.2)' : 'rgba(153,0,0,.15)' }} />
          <span className="text-[0.65rem] font-bold" style={{ color: dark ? 'rgba(255,255,255,.65)' : '#9CA3AF' }}>
            PERINGKAT LAINNYA
          </span>
          <div className="flex-1 h-px" style={{ background: dark ? 'rgba(255,255,255,.2)' : 'rgba(153,0,0,.15)' }} />
        </div>
      )}

      {/* ── Rest (#4+) ── */}
      {rest.map((e, i) => {
        const rank = i + 4
        const isMe = e.name === playerName && (e.score === score || !score)
        const { full } = parseEntryIdentity(e)
        return (
          <motion.div
            key={`rest-${i}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (i + 3) * 0.05, type: 'spring', bounce: 0.3 }}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl border"
            style={
              isMe
                ? { background: '#FFFFFF', border: '2px solid #DC2626', boxShadow: '0 3px 12px rgba(220,38,38,.3)' }
                : {
                    background: dark ? 'rgba(255,255,255,.94)' : 'rgba(255,255,255,.85)',
                    border: dark ? '1px solid rgba(255,255,255,.35)' : '1px solid rgba(153,0,0,.1)',
                  }
            }
          >
            {/* Rank */}
            <span
              className="w-6 text-center flex-shrink-0 font-black text-xs"
              style={{ color: '#990000' }}
            >
              #{rank}
            </span>

            {/* Name, Class & School */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-extrabold truncate" style={{ color: '#1F2937' }} title={full}>
                  {full}
                </p>
                {isMe && (
                  <span
                    className="flex-shrink-0 px-1.5 py-0.2 rounded-full text-[0.55rem] font-black"
                    style={{ background: '#DC2626', color: '#FFFFFF' }}
                  >
                    KAMU
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[0.62rem] mt-0.5" style={{ color: '#6B7280' }}>
                {e.timeSpent != null && (
                  <span className="font-bold flex items-center gap-0.5" style={{ color: '#B91C1C' }}>
                    ⏱️ {fmtTime(e.timeSpent)}
                  </span>
                )}
                {e.timeSpent != null && <span>•</span>}
                <span>{e.date}</span>
              </div>
            </div>

            {/* Score */}
            <div className="text-right flex-shrink-0">
              <span
                className="text-base font-black"
                style={{ color: '#990000', letterSpacing: '-0.02em' }}
              >
                {e.score}
              </span>
              <span className="text-[0.65rem] font-bold text-gray-500 ml-0.5">pts</span>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

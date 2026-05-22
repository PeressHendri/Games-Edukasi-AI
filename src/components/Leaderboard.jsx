import { motion } from 'framer-motion'
import useGameStore from '../store/gameStore'

const PODIUM = [
  { medal:'🥇', label:'1st', bg:'linear-gradient(135deg,#F59E0B,#FBBF24)', border:'#F59E0B', glow:'rgba(245,158,11,.5)'  },
  { medal:'🥈', label:'2nd', bg:'linear-gradient(135deg,#9CA3AF,#D1D5DB)', border:'#9CA3AF', glow:'rgba(156,163,175,.4)' },
  { medal:'🥉', label:'3rd', bg:'linear-gradient(135deg,#B45309,#D97706)', border:'#B45309', glow:'rgba(180,83,9,.4)'    },
]

export default function Leaderboard({ className = '', dark = false }) {
  const leaderboard = useGameStore(s => s.leaderboard)
  const playerName  = useGameStore(s => s.playerName)
  const score       = useGameStore(s => s.score)

  const isAdmin = window.location.search.includes('admin=peress')

  const handleReset = async () => {
    if (window.confirm("YAKIN INGIN MENGHAPUS SEMUA DATA LEADERBOARD?")) {
      try {
        const res = await fetch('/api/leaderboard', {
          method: 'DELETE',
          headers: { 'x-admin-secret': 'peress2026' }
        })
        if (res.ok) window.location.reload()
        else alert("Gagal mereset: Password salah!")
      } catch (e) {
        alert("Error: " + e.message)
      }
    }
  }

  if (leaderboard.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-8 text-center ${className}`}>
        <div className="text-4xl mb-3">🚀</div>
        <p className="ws-body text-sm" style={{ color: dark ? 'rgba(255,255,255,.6)' : '#9CA3AF' }}>Belum ada pemain.</p>
        <p className="ws-caption text-xs mt-1" style={{ color: dark ? 'rgba(255,255,255,.4)' : '#D1D5DB' }}>Jadilah yang pertama!</p>
      </div>
    )
  }

  const top3 = leaderboard.slice(0, 3)
  const rest  = leaderboard.slice(3)

  return (
    <div className={`flex flex-col gap-3 ${className}`}>

      {/* ── Podium Top 3 ── */}
      {top3.length > 0 && (
        <div className="grid grid-cols-3 gap-2 items-end">
          {/* #2 — Left */}
          {[1, 0, 2].map((rank) => {
            const e = top3[rank]
            if (!e) return <div key={rank} />
            const isMe = e.name === playerName && e.score === score
            const p = PODIUM[rank]
            const isFirst = rank === 0
            return (
              <motion.div key={`podium-${rank}`}
                initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
                transition={{ delay: rank * 0.1, type:'spring', bounce:.4 }}
                className="flex flex-col items-center rounded-2xl px-3 py-4 text-center"
                style={{
                  background: p.bg,
                  boxShadow: `0 6px 24px ${p.glow}`,
                  border: `2px solid ${isMe ? '#FFFFFF' : p.border}`,
                  minHeight: isFirst ? '180px' : '150px',
                  justifyContent: 'flex-end',
                }}>
                <span style={{ fontSize: isFirst ? '2.4rem' : '2rem', filter:'drop-shadow(0 2px 6px rgba(0,0,0,.4))' }}>
                  {p.medal}
                </span>
                <p className="font-black truncate w-full mt-2"
                  style={{ color:'#FFFFFF', fontSize: isFirst ? '1rem' : '.85rem', textShadow:'0 1px 4px rgba(0,0,0,.4)' }}>
                  {e.name}
                </p>
                {isMe && (
                  <span className="px-1.5 py-0.5 rounded-full text-xs font-black mt-1"
                    style={{ background:'rgba(255,255,255,.3)', color:'#FFFFFF', fontSize:'.6rem' }}>
                    KAMU
                  </span>
                )}
                <p className="font-black mt-1"
                  style={{ color:'#FFFFFF', fontSize: isFirst ? '1.6rem' : '1.3rem', textShadow:'0 1px 4px rgba(0,0,0,.3)', letterSpacing:'-0.02em' }}>
                  {e.score}
                </p>
                <p style={{ color:'rgba(255,255,255,.7)', fontSize:'.65rem' }}>{e.date}</p>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* ── Divider ── */}
      {rest.length > 0 && (
        <div className="flex items-center gap-3 px-1">
          <div className="flex-1 h-px" style={{ background: dark ? 'rgba(255,255,255,.2)' : 'rgba(79,70,229,.12)' }} />
          <span className="text-xs font-bold" style={{ color: dark ? 'rgba(255,255,255,.5)' : '#9CA3AF' }}>LAINNYA</span>
          <div className="flex-1 h-px" style={{ background: dark ? 'rgba(255,255,255,.2)' : 'rgba(79,70,229,.12)' }} />
        </div>
      )}

      {/* ── Rest (#4+) ── */}
      {rest.map((e, i) => {
        const rank = i + 4
        const isMe = e.name === playerName && e.score === score
        return (
          <motion.div key={`rest-${i}`}
            initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
            transition={{ delay: (i + 3) * 0.06, type:'spring', bounce:.3 }}
            className="flex items-center gap-4 px-5 py-3.5 rounded-2xl border"
            style={isMe
              ? { background:'#FFFFFF', border:'2px solid #7C3AED', boxShadow:'0 4px 16px rgba(124,58,237,.4)' }
              : { background: dark ? 'rgba(255,255,255,.92)' : 'rgba(255,255,255,.7)', border: dark ? '1px solid rgba(255,255,255,.4)' : '1px solid rgba(79,70,229,.08)' }
            }>

            {/* Rank */}
            <span className="w-8 text-center flex-shrink-0 font-black text-sm" style={{ color:'#6B7280' }}>
              #{rank}
            </span>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold truncate" style={{ color:'#111827' }}>{e.name}</p>
                {isMe && (
                  <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-black"
                    style={{ background:'#7C3AED', color:'#FFFFFF' }}>
                    KAMU
                  </span>
                )}
              </div>
              <p className="text-xs" style={{ color:'#9CA3AF' }}>{e.date}</p>
            </div>

            {/* Score */}
            <span className="text-lg font-black flex-shrink-0"
              style={{ color: isMe ? '#7C3AED' : '#4338CA', letterSpacing:'-0.02em' }}>
              {e.score}
            </span>
          </motion.div>
        )
      })}

      {/* ── Admin Reset Button ── */}
      {isAdmin && (
        <button onClick={handleReset} 
          className="mt-6 w-full py-3 rounded-xl font-black text-sm uppercase tracking-wider"
          style={{ background: '#DC2626', color: '#FFFFFF', boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4)' }}>
          Hapus Semua Leaderboard (Admin)
        </button>
      )}

    </div>
  )
}

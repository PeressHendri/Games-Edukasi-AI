import { motion } from 'framer-motion'

export const LOGO_SRC = '/Logo%20Fakultas%20Ilmu%20Komunikasi%20UKWMS.png'
export const IG_URL = 'https://www.instagram.com/fikom.ukwms?cplk=aGxtMDF6dXFwNjMx'
export const IG_HANDLE = '@fikom.ukwms'

/**
 * Authentic Instagram Gradient Icon
 */
export function InstagramIcon({ className = 'w-4 h-4' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="igGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f09433" />
          <stop offset="25%" stopColor="#e6683c" />
          <stop offset="50%" stopColor="#dc2743" />
          <stop offset="75%" stopColor="#cc2366" />
          <stop offset="100%" stopColor="#bc1888" />
        </linearGradient>
      </defs>
      <rect
        x="2.5"
        y="2.5"
        width="19"
        height="19"
        rx="5.5"
        stroke="url(#igGradient)"
        strokeWidth="2.2"
      />
      <circle
        cx="12"
        cy="12"
        r="4.2"
        stroke="url(#igGradient)"
        strokeWidth="2.2"
      />
      <circle
        cx="17.2"
        cy="6.8"
        r="1.25"
        fill="url(#igGradient)"
      />
    </svg>
  )
}

/**
 * Clickable Instagram Pill Badge
 */
export function InstagramBadge({ dark = false, compact = false }) {
  return (
    <motion.a
      href={IG_URL}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.05, y: -1 }}
      whileTap={{ scale: 0.95 }}
      className={`inline-flex items-center gap-1.5 rounded-full transition-all duration-200 select-none cursor-pointer ${
        compact ? 'px-2 py-0.5 text-xs' : 'px-3 py-1.5 text-xs sm:text-sm'
      }`}
      style={{
        background: dark
          ? 'rgba(255, 255, 255, 0.12)'
          : 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: dark
          ? '1px solid rgba(255, 255, 255, 0.25)'
          : '1px solid rgba(225, 48, 108, 0.25)',
        boxShadow: dark
          ? '0 2px 10px rgba(0, 0, 0, 0.15)'
          : '0 2px 10px rgba(225, 48, 108, 0.1)',
      }}
      title="Buka Instagram @fikom.ukwms"
    >
      <InstagramIcon className={compact ? 'w-3.5 h-3.5 flex-shrink-0' : 'w-4 h-4 flex-shrink-0'} />
      <span
        className="font-extrabold tracking-tight"
        style={{
          color: dark ? '#FFFFFF' : '#C13584',
        }}
      >
        {IG_HANDLE}
      </span>
    </motion.a>
  )
}

/**
 * Faculty Logo Image with aura effect
 */
export function FikomLogo({ size = 36, dark = false, className = '' }) {
  return (
    <div
      className={`relative flex items-center justify-center rounded-xl overflow-hidden flex-shrink-0 ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: dark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.9)',
        boxShadow: dark ? '0 4px 16px rgba(0,0,0,0.25)' : '0 2px 10px rgba(79, 70, 229, 0.12)',
        padding: `${Math.max(2, Math.round(size * 0.08))}px`,
      }}
    >
      <img
        src={LOGO_SRC}
        alt="Logo Fakultas Ilmu Komunikasi UKWMS"
        className="w-full h-full object-contain filter drop-shadow-sm"
        loading="eager"
      />
    </div>
  )
}

/**
 * Top Branding Header for Screens
 */
export function BrandHeader({ dark = false, className = '', showSubtitle = true }) {
  return (
    <header
      className={`w-full flex items-center justify-between gap-3 px-4 sm:px-6 py-2.5 z-30 transition-all ${className}`}
    >
      {/* Left: Logo & Faculty Name */}
      <div className="flex items-center gap-2.5 min-w-0">
        <FikomLogo size={38} dark={dark} />
        <div className="flex flex-col min-w-0">
          <span
            className="font-black text-xs sm:text-sm tracking-wide uppercase truncate"
            style={{
              color: dark ? '#FFFFFF' : '#1E1B4B',
              textShadow: dark ? '0 2px 8px rgba(0,0,0,0.5)' : 'none',
              letterSpacing: '0.04em',
            }}
          >
            Fakultas Ilmu Komunikasi
          </span>
          {showSubtitle && (
            <span
              className="text-[0.68rem] sm:text-[0.72rem] font-bold truncate"
              style={{
                color: dark ? 'rgba(255, 255, 255, 0.75)' : '#6366F1',
              }}
            >
              Universitas Katolik Widya Mandala Surabaya
            </span>
          )}
        </div>
      </div>

      {/* Right: Instagram Badge */}
      <div className="flex-shrink-0">
        <InstagramBadge dark={dark} />
      </div>
    </header>
  )
}

/**
 * Compact Brand Banner (Great for Modals like Recap / GameOver)
 */
export function BrandModalBadge({ dark = false, className = '' }) {
  return (
    <div
      className={`flex items-center justify-between gap-2.5 px-3 py-2 rounded-2xl mb-4 ${className}`}
      style={{
        background: dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(79, 70, 229, 0.05)',
        border: dark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(79, 70, 229, 0.12)',
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <FikomLogo size={28} dark={dark} />
        <div className="flex flex-col min-w-0 text-left">
          <span
            className="font-black text-[0.68rem] uppercase tracking-wider truncate"
            style={{ color: dark ? '#FFFFFF' : '#1E1B4B' }}
          >
            FIKOM UKWMS
          </span>
          <span
            className="text-[0.6rem] font-medium truncate"
            style={{ color: dark ? 'rgba(255,255,255,0.7)' : '#6B7280' }}
          >
            Literasi Digital AI Game
          </span>
        </div>
      </div>

      <InstagramBadge dark={dark} compact />
    </div>
  )
}

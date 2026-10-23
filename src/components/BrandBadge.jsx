import { motion } from 'framer-motion'

export const LOGO_SRC = '/Logo%20Fakultas%20Ilmu%20Komunikasi%20UKWMS.png'
export const FIKOM_URL = 'https://fikom.ukwms.ac.id/'
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
        compact ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs sm:text-sm'
      }`}
      style={{
        background: dark
          ? 'rgba(255, 255, 255, 0.14)'
          : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: dark
          ? '1px solid rgba(255, 255, 255, 0.28)'
          : '1px solid rgba(185, 28, 28, 0.25)',
        boxShadow: dark
          ? '0 2px 10px rgba(0, 0, 0, 0.2)'
          : '0 2px 10px rgba(153, 0, 0, 0.12)',
      }}
      title="Buka Instagram @fikom.ukwms"
    >
      <InstagramIcon className={compact ? 'w-3.5 h-3.5 flex-shrink-0' : 'w-4 h-4 flex-shrink-0'} />
      <span
        className="font-extrabold tracking-tight"
        style={{
          color: dark ? '#FFFFFF' : '#990000',
        }}
      >
        {IG_HANDLE}
      </span>
    </motion.a>
  )
}

/**
 * Faculty Logo Image with active link to https://fikom.ukwms.ac.id/
 */
export function FikomLogo({ size = 36, dark = false, className = '', asLink = true }) {
  const content = (
    <img
      src={LOGO_SRC}
      alt="Logo Fakultas Ilmu Komunikasi UKWMS"
      className="w-full h-full object-contain filter drop-shadow-sm"
      loading="eager"
    />
  )

  const boxStyle = {
    width: `${size}px`,
    height: `${size}px`,
    background: dark ? 'rgba(255, 255, 255, 0.95)' : '#FFFFFF',
    border: '1px solid rgba(153, 0, 0, 0.2)',
    boxShadow: dark ? '0 4px 16px rgba(0,0,0,0.3)' : '0 2px 10px rgba(153, 0, 0, 0.15)',
    padding: `${Math.max(2, Math.round(size * 0.08))}px`,
  }

  if (!asLink) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl overflow-hidden flex-shrink-0 ${className}`}
        style={boxStyle}
      >
        {content}
      </div>
    )
  }

  return (
    <motion.a
      href={FIKOM_URL}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.07, y: -1 }}
      whileTap={{ scale: 0.94 }}
      title="Kunjungi Website Resmi FIKOM UKWMS (https://fikom.ukwms.ac.id/)"
      className={`relative flex items-center justify-center rounded-xl overflow-hidden flex-shrink-0 cursor-pointer transition-shadow ${className}`}
      style={boxStyle}
    >
      {content}
    </motion.a>
  )
}

/**
 * Clickable FIKOM Brand Link (Logo + Text together linking to https://fikom.ukwms.ac.id/)
 */
export function FikomBrandLink({ dark = false, logoSize = 38, showSubtitle = true, compact = false, className = '' }) {
  return (
    <motion.a
      href={FIKOM_URL}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.97 }}
      title="Kunjungi Website Resmi FIKOM UKWMS (https://fikom.ukwms.ac.id/)"
      className={`inline-flex items-center gap-2.5 min-w-0 cursor-pointer select-none group ${className}`}
    >
      <FikomLogo size={logoSize} dark={dark} asLink={false} className="group-hover:ring-2 group-hover:ring-red-500/50 transition-all" />
      <div className="flex flex-col min-w-0 text-left">
        <span
          className={`font-black tracking-wide uppercase truncate group-hover:underline ${
            compact ? 'text-[0.68rem]' : 'text-xs sm:text-sm'
          }`}
          style={{
            color: dark ? '#FFFFFF' : '#7F1D1D',
            textShadow: dark ? '0 2px 8px rgba(0,0,0,0.5)' : 'none',
            letterSpacing: '0.04em',
          }}
        >
          {compact ? 'FIKOM UKWMS' : 'Fakultas Ilmu Komunikasi'}
        </span>
        {showSubtitle && (
          <span
            className={`${compact ? 'text-[0.6rem]' : 'text-[0.65rem] sm:text-xs'} font-bold truncate`}
            style={{
              color: dark ? '#FCD34D' : '#B91C1C',
            }}
          >
            {compact ? 'fikom.ukwms.ac.id ↗' : 'Universitas Katolik Widya Mandala Surabaya'}
          </span>
        )}
      </div>
    </motion.a>
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
      <FikomBrandLink dark={dark} logoSize={38} showSubtitle={showSubtitle} />
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
        background: dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(153, 0, 0, 0.06)',
        border: dark ? '1px solid rgba(255, 255, 255, 0.18)' : '1px solid rgba(153, 0, 0, 0.16)',
      }}
    >
      <FikomBrandLink dark={dark} logoSize={30} compact />
      <InstagramBadge dark={dark} compact />
    </div>
  )
}

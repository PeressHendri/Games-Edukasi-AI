/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['"Work Sans"', 'ui-sans-serif', 'system-ui'],
        display: ['"Work Sans"', 'sans-serif'],
        body:    ['"Work Sans"', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        bg: {
          DEFAULT: '#1A0505',
          2:       '#2A0808',
          3:       '#3B0A0A',
        },
        primary:   { DEFAULT: '#990000', light: '#DC2626', glow: 'rgba(153,0,0,.35)' },
        secondary: { DEFAULT: '#D97706', light: '#F59E0B', glow: 'rgba(217,119,6,.35)' },
        tertiary:  { DEFAULT: '#7F1D1D', light: '#B91C1C', glow: 'rgba(127,29,29,.35)' },
        neutral:   { DEFAULT: '#6B7280', light: '#9CA3AF' },
      },
      animation: {
        'float':       'float 6s ease-in-out infinite',
        'pulse-slow':  'pulseSlow .6s ease infinite alternate',
        'shake':       'shake .45s ease',
        'pop':         'pop .35s cubic-bezier(.34,1.56,.64,1)',
        'slide-in':    'slideIn .4s ease both',
        'bounce-in':   'bounceIn .5s cubic-bezier(.34,1.56,.64,1)',
      },
      keyframes: {
        float:     { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        pulseSlow: { from: { opacity: '1' }, to: { opacity: '.3' } },
        shake: {
          '0%,100%': { transform: 'translateX(0)' },
          '20%,60%': { transform: 'translateX(-8px)' },
          '40%,80%': { transform: 'translateX(8px)' },
        },
        pop:      { from: { opacity: '0', transform: 'scale(.6)' },              to: { opacity: '1', transform: 'scale(1)' } },
        slideIn:  { from: { opacity: '0', transform: 'translateY(16px)' },       to: { opacity: '1', transform: 'none' } },
        bounceIn: { from: { opacity: '0', transform: 'scale(.5) translateY(30px)' }, to: { opacity: '1', transform: 'none' } },
      },
      backdropBlur: { xs: '4px' },
    },
  },
  plugins: [],
}

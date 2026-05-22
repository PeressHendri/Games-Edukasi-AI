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
          DEFAULT: '#0C0B18',
          2:       '#12112A',
          3:       '#1A1840',
        },
        primary:   { DEFAULT: '#4F46E5', light: '#6366F1', glow: 'rgba(79,70,229,.35)' },
        secondary: { DEFAULT: '#0891B2', light: '#06B6D4', glow: 'rgba(8,145,178,.35)' },
        tertiary:  { DEFAULT: '#A54100', light: '#C2410C', glow: 'rgba(165,65,0,.35)' },
        neutral:   { DEFAULT: '#777681', light: '#A1A1AA' },
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

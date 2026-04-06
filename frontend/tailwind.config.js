/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#FF6E6C',
        'primary-light': '#FFE1D9',
        accent: '#67568C',
        'bg-cream': 'var(--background)',
        'bg-sand': 'var(--background)',
        'dark-bg': '#121216',
        'card-dark': '#1E1E24',
        'text-main': 'var(--foreground)',
        'text-muted': 'var(--muted)',
        'text-subtle': 'var(--subtle)',
        border: 'var(--border)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
      },
      fontFamily: {
        heading: ['"Cormorant Garamond"', 'serif'],
        display: ['"DM Serif Display"', 'serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        hand: ['Caveat', 'cursive'],
      },
      animation: {
        'bounce-in': 'bounceIn 0.6s ease-out both',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'marquee': 'marquee 35s linear infinite',
        'count-up': 'countUp 2s ease-out',
        'aurora': 'aurora 6s ease-in-out infinite',
        'blob': 'blob 8s ease-in-out infinite',
        'fade-up': 'fadeUp 0.7s ease-out both',
        'spin-slow': 'spin 6s linear infinite',
        'aurora': 'aurora 60s linear infinite',
      },
      keyframes: {
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3) rotate(-8deg)' },
          '60%': { opacity: '1', transform: 'scale(1.1) rotate(2deg)' },
          '80%': { transform: 'scale(0.9) rotate(-1deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        aurora: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0,0) scale(1)' },
          '33%': { transform: 'translate(30px,-50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px,20px) scale(0.9)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        aurora: {
          from: { backgroundPosition: '50% 50%, 50% 50%' },
          to: { backgroundPosition: '350% 50%, 350% 50%' },
        },
      },
      boxShadow: {
        'coral': '0 8px 32px rgba(255,110,108,0.25)',
        'coral-lg': '0 16px 48px rgba(255,110,108,0.35)',
        'coral-sm': '0 4px 12px rgba(255,110,108,0.2)',
        'indigo': '0 8px 32px rgba(103,86,140,0.25)',
        'indigo-lg': '0 16px 48px rgba(103,86,140,0.35)',
        'indigo-sm': '0 4px 12px rgba(103,86,140,0.2)',
        'amber': '0 4px 16px rgba(255,184,0,0.3)',
        'mint': '0 4px 16px rgba(0,196,140,0.3)',
        'card': '0 4px 24px rgba(28,16,24,0.08)',
        'glass': '0 8px 32px rgba(28,16,24,0.12)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}

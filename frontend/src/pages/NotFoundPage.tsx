import { Link } from 'react-router-dom'
import AuroraRibbon from '../components/shared/AuroraRibbon'
import Navbar from '../components/shared/Navbar'
import Footer from '../components/shared/Footer'

export default function NotFoundPage() {
  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AuroraRibbon />
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <svg viewBox="0 0 200 200" style={{ width: 160, height: 160, marginBottom: 24 }}>
          <circle cx="100" cy="100" r="90" fill="var(--background)" />
          <circle cx="100" cy="100" r="45" stroke="var(--border)" strokeWidth="4" fill="none" />
          <circle cx="100" cy="100" r="15" fill="#FF6E6C" opacity="0.3" />
          <rect x="60" y="68" width="80" height="64" rx="10" fill="var(--border)" />
          <rect x="85" y="60" width="30" height="12" rx="6" fill="#FFE1D9" />
          <circle cx="100" cy="100" r="18" fill="var(--card)" stroke="#FF6E6C" strokeWidth="3" />
          <circle cx="100" cy="100" r="6" fill="#FF6E6C" />
          <line x1="118" y1="82" x2="136" y2="64" stroke="#67568C" strokeWidth="4" strokeLinecap="round" />
          <circle cx="139" cy="61" r="8" fill="#FFB800" />
          <text x="100" y="175" textAnchor="middle" style={{ fontFamily: 'Caveat', fontSize: 16 }} fill="#A394A8">404</text>
        </svg>

        <h1 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 'clamp(28px,4vw,44px)', color: 'var(--foreground)', maxWidth: 500 }}>
          This page seems to have wandered off.
        </h1>
        <p className="text-base text-text-muted mt-3 max-w-sm">
          Maybe it's at a wedding? 💍 We couldn't find the page you're looking for.
        </p>
        <div className="flex gap-4 mt-8 flex-wrap justify-center">
          <Link
            to="/"
            className="px-8 py-3 rounded-2xl text-sm font-semibold text-white transition-all hover:shadow-coral-lg"
            style={{ background: 'linear-gradient(135deg,#FF6E6C,#67568C)' }}
          >
            Go Home
          </Link>
          <Link
            to="/demo"
            className="px-8 py-3 rounded-2xl text-sm font-semibold transition-all"
            style={{ background: 'var(--card)', color: '#FF6E6C', border: '1px solid var(--border)' }}
          >
            See Demo
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}

import { Link, useNavigate } from 'react-router-dom'
import { Camera, LogOut, Menu, X } from 'lucide-react'
import ThemeSwitch from './ThemeSwitch'
import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'

export default function Navbar() {
  const { token, role, fullName, logout } = useAuthStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/10 w-full" style={{ backdropFilter: 'blur(20px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#FF6E6C,#67568C)' }}>
            <Camera size={18} color="white" />
          </div>
          <span style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 22, fontWeight: 600, color: 'var(--foreground)' }}>
            SnapMoment
          </span>
        </Link>

        {/* Nav links - desktop */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/demo" className="text-sm font-medium text-text-muted hover:text-primary transition-colors">Demo</Link>
          <Link to="/pricing" className="text-sm font-medium text-text-muted hover:text-primary transition-colors">Pricing</Link>
          <Link to="/about" className="text-sm font-medium text-text-muted hover:text-primary transition-colors">About</Link>
          <Link to="/contact" className="text-sm font-medium text-text-muted hover:text-primary transition-colors">Contact</Link>
        </div>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          {token ? (
            <>
              <Link
                to={role === 'admin' ? '/admin' : '/photographer/events'}
                className="text-sm font-medium text-primary hover:text-primary-light transition-colors"
              >
                {fullName || 'Dashboard'}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-text-muted hover:text-red-500 transition-colors"
              >
                <LogOut size={15} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-primary hover:text-primary-light transition-colors px-4 py-2"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="text-sm font-semibold text-white px-5 py-2 rounded-xl transition-all hover:shadow-coral-lg"
                style={{ background: 'linear-gradient(135deg,#FF6E6C,#67568C)' }}
              >
                Get Started
              </Link>
            </>
          )}
          <ThemeSwitch className="hidden md:flex ml-2" />
        </div>

        {/* Mobile menu toggle */}
        <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 backdrop-blur-xl px-4 py-5 flex flex-col gap-4" style={{ background: 'var(--card)' }}>
          <Link to="/demo" className="text-sm font-medium text-foreground py-1" onClick={() => setMenuOpen(false)}>Demo</Link>
          <Link to="/pricing" className="text-sm font-medium text-foreground py-1" onClick={() => setMenuOpen(false)}>Pricing</Link>
          <Link to="/about" className="text-sm font-medium text-foreground py-1" onClick={() => setMenuOpen(false)}>About</Link>
          <Link to="/contact" className="text-sm font-medium text-foreground py-1" onClick={() => setMenuOpen(false)}>Contact</Link>
          <div className="border-t border-border pt-4 flex flex-col gap-3">
          {token ? (
            <>
              <Link to={role === 'admin' ? '/admin' : '/photographer/events'} className="text-sm font-medium text-primary" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false) }} className="text-sm text-red-500 text-left">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-primary" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/signup" className="text-sm font-semibold text-white px-4 py-2.5 rounded-xl text-center" style={{ background: 'linear-gradient(135deg,#FF6E6C,#67568C)' }} onClick={() => setMenuOpen(false)}>Get Started</Link>
            </>
          )}
          </div>
          <div className="border-t border-border pt-3 flex items-center justify-between">
            <span className="text-xs text-muted">Appearance</span>
            <ThemeSwitch />
          </div>
        </div>
      )}
    </nav>
  )
}

import { Link, useNavigate } from 'react-router-dom'
import { Camera, LogOut, Menu, X } from 'lucide-react'
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
    <nav className="glass sticky top-0 z-50 border-b border-slate-100 w-full" style={{ backdropFilter: 'blur(20px)', background: 'rgba(255,255,255,0.85)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-violet-600 to-cyan-600 shadow-md group-hover:scale-110 transition-transform">
            <Camera size={15} color="white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 font-['Outfit']">SnapMoment</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/photographers" className="text-sm font-medium text-slate-600 hover:text-violet-600 transition-colors">Photographers</Link>
          <Link to="/demo" className="text-sm font-medium text-slate-600 hover:text-violet-600 transition-colors">Demo</Link>
          <Link to="/pricing" className="text-sm font-medium text-slate-600 hover:text-violet-600 transition-colors">Pricing</Link>
          <Link to="/about" className="text-sm font-medium text-slate-600 hover:text-violet-600 transition-colors">About</Link>
          <Link to="/contact" className="text-sm font-medium text-slate-600 hover:text-violet-600 transition-colors">Contact</Link>
        </div>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          {token ? (
            <>
              <Link
                to={role === 'admin' ? '/admin' : role === 'client' ? '/client/dashboard' : '/photographer/events'}
                className="text-sm font-black text-primary hover:text-primary-light transition-colors uppercase tracking-widest"
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
              <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-violet-600 transition-colors px-4 py-2">Login</Link>
              <Link to="/signup" className="text-sm font-bold text-white px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:shadow-lg hover:shadow-violet-500/25 hover:scale-105 transition-all">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 backdrop-blur-xl px-4 py-5 flex flex-col gap-4" style={{ background: 'var(--card)' }}>
          <Link to="/photographers" className="text-sm font-medium text-foreground py-1" onClick={() => setMenuOpen(false)}>Photographer</Link>
          <Link to="/demo" className="text-sm font-medium text-foreground py-1" onClick={() => setMenuOpen(false)}>Demo</Link>
          <Link to="/pricing" className="text-sm font-medium text-foreground py-1" onClick={() => setMenuOpen(false)}>Pricing</Link>
          <Link to="/about" className="text-sm font-medium text-foreground py-1" onClick={() => setMenuOpen(false)}>About</Link>
          <Link to="/contact" className="text-sm font-medium text-foreground py-1" onClick={() => setMenuOpen(false)}>Contact</Link>
          <div className="border-t border-border pt-4 flex flex-col gap-3">
          {token ? (
            <>
              <Link to={role === 'admin' ? '/admin' : role === 'client' ? '/client/dashboard' : '/photographer/events'} className="text-sm font-medium text-primary" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false) }} className="text-sm text-red-500 text-left">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-primary" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/signup" className="text-sm font-semibold text-white px-4 py-2.5 rounded-xl text-center" style={{ background: 'var(--primary-gradient)' }} onClick={() => setMenuOpen(false)}>Get Started</Link>
            </>
          )}
          </div>
        </div>
      )}
    </nav>
  )
}

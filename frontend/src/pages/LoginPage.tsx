import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Camera, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../lib/api'
import { useAuthStore } from '../store/authStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Please fill all fields'); return }
    setLoading(true)
    try {
      const res = isAdmin
        ? await authApi.adminLogin(form)
        : await authApi.login(form)
      const { access_token, role, user_id, full_name, onboarding_step, subscription_active } = res.data
      setAuth(access_token, role, user_id, full_name, onboarding_step, subscription_active)
      toast.success(`Welcome back, ${full_name}! 📸`)
      navigate(role === 'admin' ? '/admin' : '/photographer/events')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--background)' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden noise-overlay" style={{ width: '45%', background: 'var(--primary-gradient)' }}>
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/30">
              <Camera size={18} color="white" />
            </div>
            <span style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 22, fontWeight: 600, color: 'white' }}>SnapMoment</span>
          </Link>
        </div>
        <div className="relative z-10">
          <blockquote style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 28, color: 'white', lineHeight: 1.4 }} className="font-light opacity-95">
            "The best camera is the one that recognises your face."
          </blockquote>
          <div className="mt-8 p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">Demo Access</p>
            <p className="text-white font-medium mb-1">Email: admin@snapmoment.app</p>
            <p className="text-white font-medium">Password: Admin@123</p>
          </div>
          <div className="mt-8 text-sm font-medium text-white/50 tracking-wide">— SnapMoment, 2024</div>
        </div>
        {/* Decorative blobs */}
        <div className="absolute w-64 h-64 rounded-full" style={{ background: 'white', opacity: 0.1, filter: 'blur(80px)', bottom: '10%', right: '-10%' }} />
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 34, color: 'var(--foreground)' }}>Welcome back</h1>
            <p className="text-text-muted text-sm mt-1">Sign in to your photographer account</p>
          </div>

          {/* Admin toggle */}
          <div className="flex rounded-xl overflow-hidden border border-border mb-6">
            {['Photographer', 'Admin'].map((label, i) => (
              <button
                key={label}
                className="flex-1 py-2.5 text-sm font-medium transition-all"
                style={(!isAdmin && i === 0) || (isAdmin && i === 1)
                  ? { background: 'var(--primary)', color: 'white' }
                  : { background: 'var(--card)', color: 'var(--muted)' }}
                onClick={() => setIsAdmin(i === 1)}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-main block mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border text-sm outline-none focus:border-primary transition-colors"
                placeholder={isAdmin ? 'admin@snapmoment.app' : 'you@studio.com'}
                style={{ background: 'var(--card)' }}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-text-main block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-border text-sm outline-none focus:border-primary transition-colors pr-12"
                  placeholder="••••••••"
                  style={{ background: 'var(--card)' }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-primary-lg disabled:opacity-60"
              style={{ background: 'var(--primary-gradient)' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-sm text-center text-text-muted mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-medium hover:underline">Create one free</Link>
          </p>

          {isAdmin && (
            <div className="mt-4 p-3 rounded-xl text-xs text-center" style={{ background: 'var(--background)', color: 'var(--muted)' }}>
              Default admin: admin@snapmoment.app / Admin@123
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

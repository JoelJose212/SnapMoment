import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Camera, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../lib/api'
import { useAuthStore } from '../store/authStore'

export default function SignupPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', studio_name: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.full_name || !form.email || !form.password) { toast.error('Please fill all required fields'); return }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const res = await authApi.signup(form)
      const { access_token, role, user_id, full_name, onboarding_step, subscription_active } = res.data
      setAuth(access_token, role, user_id, full_name, onboarding_step, subscription_active)
      toast.success(`Welcome to SnapMoment, ${full_name}! 📸`)
      navigate('/photographer/events')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--background)' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden noise-overlay" style={{ width: '45%', background: 'linear-gradient(135deg,#FF6E6C,#67568C)' }}>
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#67568C,#FF6E6C)' }}>
              <Camera size={18} color="white" />
            </div>
            <span style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 22, fontWeight: 600, color: 'white' }}>SnapMoment</span>
          </Link>
        </div>
        <div className="relative z-10">
          <blockquote style={{ fontFamily: '"Cormorant Garamond"', fontSize: 36, color: 'white', lineHeight: 1.2 }}>
            "Every photo finds<br/>its way home."
          </blockquote>
          <div className="mt-5 text-sm leading-relaxed max-w-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Join 200+ photographers delivering memories instantly with AI-powered face recognition.
          </div>
          <div className="mt-10 p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <div className="text-xs font-bold text-white mb-2 uppercase tracking-wide">Photographer Perks</div>
            <ul className="text-sm space-y-2" style={{ color: 'rgba(255,255,255,0.85)' }}>
              <li>✓ Instant delivery under 30s</li>
              <li>✓ Watermarked proofs (Fresher tier)</li>
              <li>✓ Unlimited guests support</li>
            </ul>
          </div>
        </div>
        {/* Decorative blobs */}
        <div className="absolute w-64 h-64 rounded-full" style={{ background: '#FFE1D9', opacity: 0.15, filter: 'blur(80px)', bottom: '10%', right: '-10%' }} />
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 style={{ fontFamily: '"Cormorant Garamond"', fontSize: 40, color: 'var(--foreground)', fontWeight: 600 }}>Create your account</h1>
            <p className="text-text-muted text-sm mt-1">Start your journey today. No credit card needed.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Full Name *', key: 'full_name', type: 'text', placeholder: 'Rohan Mehta' },
              { label: 'Email *', key: 'email', type: 'email', placeholder: 'rohan@studio.com' },
              { label: 'Phone', key: 'phone', type: 'tel', placeholder: '+91 98765 43210' },
              { label: 'Studio Name', key: 'studio_name', type: 'text', placeholder: 'Rohan Mehta Studios' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="text-sm font-medium text-text-main block mb-1.5">{label}</label>
                <input
                  type={type}
                  value={(form as any)[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-border text-sm outline-none focus:border-primary transition-colors"
                  placeholder={placeholder}
                  style={{ background: 'var(--card)' }}
                />
              </div>
            ))}

            <div>
              <label className="text-sm font-medium text-text-main block mb-1.5">Password *</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-border text-sm outline-none focus:border-primary transition-colors pr-12"
                  placeholder="Min. 6 characters"
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
               className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-coral-lg disabled:opacity-60 mt-2"
               style={{ background: 'linear-gradient(135deg,#FF6E6C,#67568C)' }}
             >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-sm text-center text-text-muted mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

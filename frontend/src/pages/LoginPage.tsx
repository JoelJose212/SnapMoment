import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Eye, EyeOff, Mail, Lock, ShieldCheck, Sparkles, ArrowRight, User, Settings } from 'lucide-react'
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
    <div className="min-h-screen flex selection:bg-primary/20" style={{ background: 'var(--background)' }}>
      {/* Left panel - Immersive & Realistic */}
      <div className="hidden lg:flex flex-col justify-between p-16 relative overflow-hidden" style={{ width: '45%' }}>
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=1200" 
            className="w-full h-full object-cover scale-105"
            alt="Photography"
          />
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-accent/20" />
        </div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/20 group-hover:bg-primary/20 transition-all">
              <Camera size={22} className="text-white" />
            </div>
            <span className="text-2xl font-black text-white tracking-tighter uppercase italic">SnapMoment</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest mb-8 backdrop-blur-md">
              <Sparkles size={12} className="text-primary" />
              <span>Elite Event Intelligence</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tighter mb-10 uppercase italic">
              Scale your <br />
              <span className="gradient-text">Magic.</span>
            </h2>
            
            <div className="bg-white/5 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-3xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30">
                  <ShieldCheck size={24} />
                </div>
                <div>
                   <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Demo Quick Pass</p>
                   <p className="text-lg font-black text-white italic">Administrator Mode</p>
                </div>
              </div>
              <div className="space-y-3">
                 <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-xs text-white/50 font-bold uppercase tracking-widest">User</span>
                    <span className="text-sm text-white font-black">admin@snapmoment.app</span>
                 </div>
                 <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-xs text-white/50 font-bold uppercase tracking-widest">Key</span>
                    <span className="text-sm text-white font-black">Admin@123</span>
                 </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 text-[10px] font-black text-white/30 uppercase tracking-[0.5em]">
          Powered by ArcFace Intelligence — 2024
        </div>
      </div>

      {/* Right panel - Refined Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 lg:px-20 py-20 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-12">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic mb-2">Welcome back.</h1>
              <p className="text-slate-500 font-medium text-lg">Sign in to your professional workspace.</p>
            </motion.div>
          </div>

          {/* Role Toggle - Sleek Pill Switch */}
          <div className="p-1.5 bg-slate-50 rounded-[1.5rem] flex items-center mb-10 border border-slate-100 relative">
            <motion.div 
              layout
              className="absolute h-[calc(100%-12px)] w-[calc(50%-6px)] bg-primary rounded-2xl shadow-lg shadow-primary/20 z-0"
              animate={{ x: isAdmin ? '100%' : '0%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <button 
              onClick={() => setIsAdmin(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl relative z-10 text-sm font-black transition-colors ${!isAdmin ? 'text-white' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <User size={18} /> Photographer
            </button>
            <button 
              onClick={() => setIsAdmin(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl relative z-10 text-sm font-black transition-colors ${isAdmin ? 'text-white' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Settings size={18} /> Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-14 pr-6 py-5 rounded-3xl bg-slate-50 border border-slate-100 outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all font-medium text-slate-900"
                  placeholder={isAdmin ? 'admin@snapmoment.app' : 'you@studio.com'}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Secret Key</label>
                <button type="button" className="text-xs font-black text-primary uppercase tracking-widest hover:underline">Forgot?</button>
              </div>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-14 pr-14 py-5 rounded-3xl bg-slate-50 border border-slate-100 outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all font-medium text-slate-900"
                  placeholder="••••••••"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPw(!showPw)} 
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600"
                >
                  {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-6 rounded-[2rem] bg-primary text-white font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-3xl shadow-primary/30 flex items-center justify-center gap-3 group relative overflow-hidden disabled:opacity-70 disabled:scale-100"
            >
              <span className="relative z-10">{loading ? 'Verifying...' : 'Sign In Now'}</span>
              <ArrowRight size={22} className="relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-100">
            <p className="text-slate-500 font-medium text-center">
              New to SnapMoment?{' '}
              <Link to="/signup" className="text-primary font-black uppercase tracking-widest text-sm hover:underline ml-1">Create Account</Link>
            </p>
          </div>

          <div className="mt-12 flex items-center justify-center gap-2 text-slate-300">
            <ShieldCheck size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">AES-256 Encrypted Session</span>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Eye, EyeOff, Mail, Lock, ShieldCheck, Sparkles, ArrowRight, User, Settings, Briefcase } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../lib/api'
import { useAuthStore } from '../store/authStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userRole, setUserRole] = useState<'photographer' | 'admin' | 'client'>('photographer')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Please fill all fields'); return }
    setLoading(true)
    try {
      const res = userRole === 'admin'
        ? await authApi.adminLogin(form)
        : await authApi.login(form)
      const { access_token, role, user_id, full_name, email, onboarding_step, subscription_active } = res.data
      setAuth(access_token, role, user_id, full_name, email, onboarding_step, subscription_active)
      toast.success(`Welcome back, ${full_name}! 📸`)
      
      if (role === 'admin') navigate('/admin')
      else if (role === 'client') navigate('/client/dashboard')
      else navigate('/photographer/events')
      
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Login failed'
      toast.error(`Login Error: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex selection:bg-primary/20 bg-[#FBFBFF]">
      {/* Left panel - Immersive Art Panel */}
      <div className="hidden lg:flex flex-col justify-between p-16 relative overflow-hidden" style={{ width: '42%' }}>
        {/* Background Image with sophisticated overlays */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/login_background_photography_1777452944998.png" 
            className="w-full h-full object-cover scale-105"
            alt="Photography"
          />
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950/90" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/50 via-transparent to-transparent" />
        </div>

        {/* Brand */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-[1.25rem] flex items-center justify-center glass border border-white/20 group-hover:bg-primary/20 transition-all duration-500 shadow-2xl">
              <Camera size={24} className="text-white" />
            </div>
            <span className="text-3xl font-black text-white tracking-tighter uppercase italic drop-shadow-xl">SnapMoment</span>
          </Link>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-lg mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 border border-white/20 text-white text-[11px] font-black uppercase tracking-[0.2em] mb-10 backdrop-blur-md">
              <Sparkles size={14} className="text-primary" />
              <span>Elite Marketplace Portal</span>
            </div>
            <h2 className="text-6xl md:text-8xl font-black text-white leading-none tracking-tighter mb-12 uppercase italic">
              Legacy <br />
              <span className="gradient-text">Redefined.</span>
            </h2>
            
            <div className="glass p-10 rounded-[3.5rem] border border-white/10 shadow-3xl relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-5 mb-8 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/40 animate-pulse">
                  <ShieldCheck size={28} />
                </div>
                <div>
                   <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em]">Quick Access Mode</p>
                   <p className="text-xl font-black text-white italic">Administrator Credentials</p>
                </div>
              </div>
              <div className="space-y-4 relative z-10">
                 <div className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <span className="text-[10px] text-white/50 font-black uppercase tracking-widest">Master User</span>
                    <span className="text-sm text-white font-black">admin@snapmoment.app</span>
                 </div>
                 <div className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <span className="text-[10px] text-white/50 font-black uppercase tracking-widest">Secure Key</span>
                    <span className="text-sm text-white font-black">Admin@123</span>
                 </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 flex items-center gap-6">
           <div className="h-px w-20 bg-white/20" />
           <div className="text-[11px] font-black text-white/30 uppercase tracking-[0.6em]">
             ArcFace Intelligence Layer — 2024
           </div>
        </div>
      </div>

      {/* Right panel - Refined Form Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 lg:px-24 py-20 bg-[#FBFBFF] relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 blur-[120px] rounded-full -translate-x-1/3 translate-y-1/3" />

        <div className="w-full max-w-md relative z-10">
          <div className="mb-16 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-5xl md:text-6xl font-black text-slate-950 tracking-tighter uppercase italic mb-4 leading-tight">
                Welcome <br className="lg:hidden" /> <span className="text-primary">Back.</span>
              </h1>
              <p className="text-slate-500 font-bold text-lg">Enter your credentials to access your {userRole} suite.</p>
            </motion.div>
          </div>

          {/* Role Switcher - Premium Interaction */}
          <div className="p-1.5 bg-slate-100/80 rounded-[2.25rem] flex items-center mb-12 border border-slate-200 relative shadow-inner">
            <button 
              type="button"
              onClick={() => setUserRole('photographer')}
              className={`flex-1 flex flex-col items-center py-5 rounded-2xl relative z-10 transition-all duration-500`}
            >
              {userRole === 'photographer' && (
                <motion.div 
                  layoutId="roleHighlight"
                  className="absolute inset-0 aurora-bg rounded-[1.75rem] shadow-xl shadow-primary/25 z-[-1]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <User size={18} className={userRole === 'photographer' ? 'text-white' : 'text-slate-500'} />
              <span className={`text-[10px] font-black uppercase tracking-widest mt-1.5 ${userRole === 'photographer' ? 'text-white' : 'text-slate-500'}`}>Photographer</span>
            </button>
            <button 
              type="button"
              onClick={() => setUserRole('client')}
              className={`flex-1 flex flex-col items-center py-5 rounded-2xl relative z-10 transition-all duration-500`}
            >
              {userRole === 'client' && (
                <motion.div 
                  layoutId="roleHighlight"
                  className="absolute inset-0 aurora-bg rounded-[1.75rem] shadow-xl shadow-primary/25 z-[-1]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Briefcase size={18} className={userRole === 'client' ? 'text-white' : 'text-slate-500'} />
              <span className={`text-[10px] font-black uppercase tracking-widest mt-1.5 ${userRole === 'client' ? 'text-white' : 'text-slate-500'}`}>Client</span>
            </button>
            <button 
              type="button"
              onClick={() => setUserRole('admin')}
              className={`flex-1 flex flex-col items-center py-5 rounded-2xl relative z-10 transition-all duration-500`}
            >
              {userRole === 'admin' && (
                <motion.div 
                  layoutId="roleHighlight"
                  className="absolute inset-0 aurora-bg rounded-[1.75rem] shadow-xl shadow-primary/25 z-[-1]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Settings size={18} className={userRole === 'admin' ? 'text-white' : 'text-slate-500'} />
              <span className={`text-[10px] font-black uppercase tracking-widest mt-1.5 ${userRole === 'admin' ? 'text-white' : 'text-slate-500'}`}>Admin</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Work Identity</label>
              </div>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors duration-300">
                  <Mail size={22} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-16 pr-8 py-6 rounded-[2.5rem] bg-white border border-slate-200 outline-none focus:border-primary focus:ring-[6px] focus:ring-primary/5 transition-all duration-300 font-bold text-slate-900 placeholder:text-slate-300 shadow-sm"
                  placeholder={userRole === 'admin' ? 'admin@snapmoment.app' : 'identity@studio.com'}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Vault Key</label>
                <button type="button" className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:opacity-70 transition-opacity">Reset Key?</button>
              </div>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors duration-300">
                  <Lock size={22} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-16 pr-16 py-6 rounded-[2.5rem] bg-white border border-slate-200 outline-none focus:border-primary focus:ring-[6px] focus:ring-primary/5 transition-all duration-300 font-bold text-slate-900 placeholder:text-slate-300 shadow-sm"
                  placeholder="••••••••••••"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPw(!showPw)} 
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                >
                  {showPw ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-7 rounded-[3rem] aurora-bg text-white font-black text-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_50px_rgba(20,184,166,0.3)] flex items-center justify-center gap-4 group relative overflow-hidden disabled:opacity-70 disabled:scale-100 mt-12"
            >
              <span className="relative z-10">{loading ? 'Authenticating...' : 'Enter Workspace'}</span>
              <ArrowRight size={26} className="relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </button>
          </form>

          <div className="mt-16 pt-10 border-t border-slate-100 text-center">
            <p className="text-slate-400 font-bold">
              New to the platform?{' '}
              <Link to="/signup" className="text-primary font-black uppercase tracking-[0.1em] text-sm hover:underline ml-2">Join Today</Link>
            </p>
          </div>

          <div className="mt-12 flex items-center justify-center gap-3 text-slate-200">
            <ShieldCheck size={18} />
            <span className="text-[9px] font-black uppercase tracking-[0.4em]">Military Grade Session Security</span>
          </div>
        </div>
      </div>
    </div>
  )
}

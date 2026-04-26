import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { 
  Camera, CalendarDays, BarChart2, User, LogOut, 
  ArrowRight, AlertTriangle, Zap, ShieldCheck, 
  Sparkles, Bell, Settings, Globe, Users
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'

const NAV = [
  { to: '/photographer/events', icon: CalendarDays, label: 'My Events' },
  { to: '/photographer/engagement', icon: Users, label: 'Engagement' },
  { to: '/photographer/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/photographer/profile', icon: User, label: 'Profile' },
]

const INTEL_NAV = [
  { to: '/photographer/delivery', icon: Globe, label: 'Global Delivery' },
  { to: '/photographer/notifications', icon: Bell, label: 'Notifications' },
]

export default function PhotographerLayout() {
  const { fullName, logout, subscriptionActive } = useAuthStore()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen relative overflow-hidden bg-slate-50 selection:bg-primary/20">
      {/* Immersive Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/10 blur-[150px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[35%] h-[35%] bg-accent/10 blur-[150px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 noise-overlay opacity-[0.03]" />
      </div>

      {/* --- Sidebar: High-End Acrylic --- */}
      <aside className="w-80 flex-shrink-0 flex flex-col p-8 z-20 pointer-events-auto">
        <div className="bg-white/70 backdrop-blur-3xl h-full rounded-[3rem] flex flex-col overflow-hidden border border-white/40 shadow-2xl shadow-slate-200/50">
          
          {/* Brand Header */}
          <div className="p-10 pb-8 border-b border-slate-100">
            <Link to="/" className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-900 shadow-xl shadow-slate-900/20 group-hover:scale-105 transition-transform">
                <Camera size={24} className="text-white" />
              </div>
              <div>
                <span className="text-2xl font-black block leading-none tracking-tighter italic uppercase text-slate-900">SnapMoment</span>
                <div className="flex items-center gap-1.5 mt-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Studio Elite</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation Hub */}
          <nav className="flex-1 p-6 py-10 space-y-3">
            <div className="px-4 mb-6 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Workspace</div>
            {NAV.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `group relative flex items-center gap-4 px-6 py-5 rounded-[1.75rem] text-sm font-black transition-all duration-500 ${
                    isActive 
                      ? 'text-white' 
                      : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          layoutId="nav-active"
                          className="absolute inset-0 rounded-[1.75rem] bg-slate-900 shadow-xl shadow-slate-900/20"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                        />
                      )}
                    </AnimatePresence>
                    
                    <Icon size={20} className={`relative z-10 transition-transform duration-500 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-primary'}`} />
                    <span className="relative z-10 tracking-tight">{label}</span>
                    
                    {!isActive && (
                      <ArrowRight size={14} className="ml-auto opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                    )}
                  </>
                )}
              </NavLink>
            ))}

            <div className="pt-10 px-4 mb-6 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Intelligence</div>
            {INTEL_NAV.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `group relative flex items-center gap-4 px-6 py-5 rounded-[1.75rem] text-sm font-black transition-all duration-500 ${
                    isActive 
                      ? 'text-white' 
                      : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          layoutId="nav-active"
                          className="absolute inset-0 rounded-[1.75rem] bg-slate-900 shadow-xl shadow-slate-900/20"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                        />
                      )}
                    </AnimatePresence>
                    
                    <Icon size={20} className={`relative z-10 transition-transform duration-500 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-primary'}`} />
                    <span className="relative z-10 tracking-tight">{label}</span>
                    
                    {!isActive && (
                      <ArrowRight size={14} className="ml-auto opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Creative Partner Card */}
          <div className="p-8 bg-slate-50 border-t border-slate-100">
            <div className="flex items-center gap-4 mb-8 px-2">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-lg p-0.5 relative group">
                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${fullName}`} alt="Avatar" className="w-full h-full object-cover rounded-2xl group-hover:scale-110 transition-transform" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-white rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Creative Partner</div>
                <div className="text-base font-black text-slate-900 truncate tracking-tight">{fullName}</div>
              </div>
            </div>
            
            <button
              onClick={() => { logout(); navigate('/') }}
              className="flex items-center justify-center gap-3 w-full py-5 rounded-2xl bg-white border border-slate-200 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all shadow-sm active:scale-95 group"
            >
              <LogOut size={16} className="group-hover:rotate-12 transition-transform" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* --- Main Workspace --- */}
      <main className="flex-1 p-8 pl-0 flex flex-col relative z-10 pointer-events-auto">
        {/* Banner: Suspension */}
        {!subscriptionActive && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-8 rounded-[2.5rem] p-6 bg-slate-900 text-white shadow-2xl flex items-center justify-between px-10 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-primary/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-1000" />
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center text-primary shadow-inner">
                <ShieldCheck size={28} />
              </div>
              <div>
                <div className="text-lg font-black italic uppercase tracking-tighter">Workspace Suspended</div>
                <p className="text-sm text-white/60 font-medium tracking-tight">Your elite access has expired. Reactivate to restore your studio galleries.</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/onboarding')}
              className="px-10 py-4 rounded-2xl bg-white text-slate-900 text-xs font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl relative z-10"
            >
              Restore Access
            </button>
          </motion.div>
        )}

        {/* Content Vessel */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

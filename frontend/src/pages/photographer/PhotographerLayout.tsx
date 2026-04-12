import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Camera, CalendarDays, BarChart2, User, LogOut, ArrowRight, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'

const NAV = [
  { to: '/photographer/events', icon: CalendarDays, label: 'My Events' },
  { to: '/photographer/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/photographer/profile', icon: User, label: 'Profile' },
]

export default function PhotographerLayout() {
  const { fullName, logout, subscriptionActive } = useAuthStore()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen relative overflow-hidden" style={{ background: 'var(--background)' }}>
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full opacity-20 blur-[120px]" style={{ background: '#FF6E6C' }} />
      <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[30%] rounded-full opacity-10 blur-[100px]" style={{ background: '#67568C' }} />

      {/* Sidebar */}
      <aside className="w-72 flex-shrink-0 flex flex-col p-6 z-10">
        <div className="glass h-full rounded-[2.5rem] flex flex-col overflow-hidden border border-white/20 shadow-2xl">
          {/* Logo Section */}
          <div className="p-8 pb-10 border-b border-black/5 dark:border-white/5">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center aurora-bg shadow-lg">
                <Camera size={20} color="white" />
              </div>
              <div>
                <span className="text-xl font-bold block leading-none" style={{ fontFamily: '"Plus Jakarta Sans"', color: 'var(--foreground)' }}>SnapMoment</span>
                <span className="text-[10px] uppercase tracking-widest font-bold opacity-40 mt-1 block">Studio Pro</span>
              </div>
            </motion.div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 py-8 space-y-2">
            {NAV.map(({ to, icon: Icon, label }, idx) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `group relative flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                    isActive 
                      ? 'text-white shadow-lg' 
                      : 'text-subtle hover:text-foreground hover:bg-white/40 dark:hover:bg-white/5'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          layoutId="nav-active"
                          className="absolute inset-0 rounded-2xl aurora-bg"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </AnimatePresence>
                    
                    <Icon size={18} className={`relative z-10 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white' : 'text-subtle group-hover:text-primary'}`} />
                    <span className="relative z-10">{label}</span>
                    
                    {!isActive && (
                      <ArrowRight size={14} className="ml-auto opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User Profile Area */}
          <div className="p-6 bg-white/30 dark:bg-black/20 backdrop-blur-md rounded-t-[2rem]">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-10 h-10 rounded-full border-2 border-primary/20 p-0.5 overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${fullName}`} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-tighter opacity-40">Creative Partner</div>
                <div className="text-sm font-bold truncate text-foreground">{fullName}</div>
              </div>
            </div>
            
            <button
              onClick={() => { logout(); navigate('/') }}
              className="flex items-center justify-center gap-2 text-xs font-bold text-white aurora-bg w-full py-3.5 rounded-xl hover:shadow-coral shadow-md transition-all active:scale-[0.98]"
            >
              <LogOut size={14} />
              End Session
            </button>
          </div>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 p-6 pl-0 overflow-auto">
        {!subscriptionActive && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mb-6 rounded-[2rem] p-4 flex items-center justify-between text-white shadow-xl px-8"
            style={{ background: 'linear-gradient(135deg, #FF6E6C, #67568C)' }}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
              <div>
                <div className="font-bold text-sm">Account Suspended</div>
                <p className="text-[11px] opacity-80 font-medium">Your subscription has expired. Please reactivate your account to access your events and photos.</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/onboarding')}
              className="px-6 py-2 rounded-xl bg-white text-[#FF6E6C] text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform"
            >
              Reactivate Now
            </button>
          </motion.div>
        )}
        <div className="h-full glass-card rounded-[2.5rem] overflow-hidden p-8 border-white/20">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

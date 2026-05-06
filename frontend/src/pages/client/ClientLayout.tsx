import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { 
  Camera, Calendar, MapPin, ChevronRight, 
  Plus, Clock, ShieldCheck, Star, LogOut,
  LayoutGrid, Sparkles, MessageSquare, Heart
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'

import NotificationCenter from '../../components/shared/NotificationCenter'

const NAV = [
  { to: '/client/dashboard', icon: LayoutGrid, label: 'My Story Hub' },
  { to: '/client/discover', icon: Camera, label: 'Discover Talent' },
  { to: '/client/messages', icon: MessageSquare, label: 'Conversations' },
  { to: '/client/favorites', icon: Heart, label: 'Shortlisted' },
]

export default function ClientLayout() {
  const { fullName, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="flex min-h-screen bg-[#FDFCFB] selection:bg-primary/20">
      {/* --- Elegant Sidebar --- */}
      <aside className="w-80 h-screen sticky top-0 flex flex-col p-6 z-40">
        <div className="bg-[#1A1A1A] h-full rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 blur-[50px] -translate-y-1/2 translate-x-1/2" />
          
          <div className="p-10 pb-12 relative z-10 border-b border-white/5">
             <Link to="/" className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white text-slate-900 shadow-xl">
                  <Camera size={24} />
                </div>
                <div>
                   <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">SNAPMOMENT</h2>
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mt-2">Client Portal</p>
                </div>
             </Link>
          </div>

          <nav className="flex-1 px-4 py-8 space-y-2 relative z-10">
             {NAV.map(({ to, icon: Icon, label }) => (
               <NavLink
                 key={to} to={to}
                 className={({ isActive }) =>
                   `group relative flex items-center gap-4 px-6 py-5 rounded-2xl text-sm font-black transition-all duration-500 ${
                     isActive ? 'text-white' : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                   }`
                 }
               >
                 {({ isActive }) => (
                   <>
                     {isActive && (
                        <motion.div
                          layoutId="client-nav-pill"
                          className="absolute inset-0 rounded-2xl bg-primary shadow-lg shadow-primary/20 z-0"
                        />
                     )}
                     <Icon size={20} className={`relative z-10 ${isActive ? 'text-white' : 'text-white/20 group-hover:text-white/40'}`} />
                     <span className="relative z-10">{label}</span>
                   </>
                 )}
               </NavLink>
             ))}
          </nav>

          <div className="p-8 relative z-10">
             <div className="bg-white/5 rounded-3xl p-5 border border-white/5 group relative overflow-hidden">
                <Link to="/client/profile" className="flex items-center gap-4 mb-6 hover:opacity-80 transition-opacity">
                   <div className="w-12 h-12 rounded-2xl bg-white/10 p-0.5 border border-white/10">
                      <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${fullName}`} className="w-full h-full object-cover rounded-2xl" alt="Me" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Welcome,</p>
                      <p className="text-sm font-black text-white truncate group-hover:text-primary transition-colors">{fullName}</p>
                   </div>
                </Link>
                <button 
                  onClick={() => { logout(); navigate('/') }}
                  className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white font-black text-[10px] uppercase tracking-[0.3em] transition-all border border-white/5"
                >
                   SIGNOUT HUB
                </button>
             </div>
          </div>
        </div>
      </aside>

      {/* --- Main Vessel --- */}
      <main className="flex-1 flex flex-col p-6 pl-0">
         <header className="h-24 px-10 flex items-center justify-between bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 mb-6 border border-slate-100">
            <div className="flex items-center gap-2">
               <Sparkles className="text-primary" size={20} />
               <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Personalized Story Experience</span>
            </div>

            <div className="flex items-center gap-4">
               <NotificationCenter />
               <Link 
                 to="/client/events/new"
                 className="px-8 py-3.5 rounded-2xl aurora-bg text-white font-black text-sm flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-105 transition-all active:scale-95"
               >
                  <Plus size={18} /> New Event
               </Link>
            </div>
         </header>

         {/* Content Area */}
         <div className="flex-1 overflow-hidden relative">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full overflow-y-auto custom-scrollbar pr-2"
            >
               <Outlet />
            </motion.div>
         </div>
      </main>
    </div>
  )
}

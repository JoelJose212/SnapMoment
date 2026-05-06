import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { 
  Camera, LayoutDashboard, Users, CalendarDays, 
  BarChart2, Settings, LogOut, MessageSquare, 
  Receipt, ShieldCheck, Search, Bell, Command,
  Cpu
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { motion, AnimatePresence } from 'framer-motion'

const NAV = [
  { to: '/admin', icon: LayoutDashboard, label: 'Control Center', end: true },
  { to: '/admin/photographers', icon: Users, label: 'Pro Ecosystem' },
  { to: '/admin/events', icon: CalendarDays, label: 'Live Events' },
  { to: '/admin/messages', icon: MessageSquare, label: 'Intel Feed' },
  { to: '/admin/invoices', icon: Receipt, label: 'Finances' },
  { to: '/admin/analytics', icon: BarChart2, label: 'System Stats' },
  { to: '/admin/settings', icon: Settings, label: 'Base Config' },
]

export default function AdminLayout() {
  const { logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="flex min-h-screen bg-[#F0F2F5] selection:bg-primary/20">
      {/* --- Admin Command Sidebar --- */}
      <aside className="w-80 h-screen sticky top-0 flex flex-col p-6 z-50">
        <div className="bg-[#0F172A] h-full rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl shadow-slate-900/40 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          
          {/* Logo Section */}
          <div className="p-10 pb-12 relative z-10 border-b border-white/5">
             <Link to="/" className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-primary shadow-lg shadow-primary/30 group-hover:rotate-12 transition-transform">
                  <Cpu size={24} className="text-white" />
                </div>
                <div>
                   <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">SNAPMOMENT</h2>
                   <div className="flex items-center gap-2 mt-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40">Admin OS v2.0</span>
                   </div>
                </div>
             </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar relative z-10">
             {NAV.map(({ to, icon: Icon, label, end }) => (
               <NavLink
                 key={to} to={to} end={end}
                 className={({ isActive }) =>
                   `group relative flex items-center gap-4 px-6 py-5 rounded-2xl text-sm font-black transition-all duration-500 ${
                     isActive ? 'text-white' : 'text-white/30 hover:text-white/60 hover:bg-white/5'
                   }`
                 }
               >
                 {({ isActive }) => (
                   <>
                     {isActive && (
                        <motion.div
                          layoutId="admin-nav-glow"
                          className="absolute inset-0 rounded-2xl bg-white/10 border-l-4 border-primary z-0"
                        />
                     )}
                     <Icon size={18} className={`relative z-10 ${isActive ? 'text-primary' : 'text-white/20 group-hover:text-white/40'}`} />
                     <span className="relative z-10">{label}</span>
                   </>
                 )}
               </NavLink>
             ))}
          </nav>

          {/* Profile Card */}
          <div className="p-6 relative z-10">
             <div className="bg-white/5 rounded-3xl p-5 border border-white/5">
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-primary border border-white/10">
                      <ShieldCheck size={24} />
                   </div>
                   <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/30">System Administrator</p>
                      <p className="text-sm font-black text-white truncate">Admin Terminal</p>
                   </div>
                </div>
                <button 
                  onClick={() => { logout(); navigate('/') }}
                  className="w-full py-4 rounded-xl bg-white/5 hover:bg-red-500 text-white/40 hover:text-white font-black text-[10px] uppercase tracking-[0.3em] transition-all border border-white/5"
                >
                   SIGNOUT_FORCE()
                </button>
             </div>
          </div>
        </div>
      </aside>

      {/* --- Main Viewport --- */}
      <main className="flex-1 flex flex-col p-6 pl-0 relative z-10">
         {/* Glass Command Bar */}
         <header className="h-24 px-10 flex items-center justify-between bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 mb-6">
            <div className="flex items-center gap-8 flex-1">
               <div className="relative group max-w-md w-full">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                     <Search size={18} />
                  </div>
                  <input 
                    type="text" placeholder="Scan system data, logs, or users..."
                    className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:bg-white focus:border-primary/30 transition-all font-bold text-sm"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-100 rounded-lg shadow-sm">
                     <Command size={12} className="text-slate-400" />
                     <span className="text-[10px] font-black text-slate-400">J</span>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-6">
               <div className="flex items-center gap-3 pr-6 border-r border-slate-100">
                  <button className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 transition-all relative group">
                     <Bell size={20} />
                     <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 border-2 border-white rounded-full group-hover:scale-150 transition-transform" />
                  </button>
               </div>
               
               <div className="flex items-center gap-4">
                  <div className="text-right">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Health</p>
                     <div className="flex items-center justify-end gap-1.5 mt-1">
                        <span className="text-sm font-black text-emerald-600">Stable</span>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                     </div>
                  </div>
               </div>
            </div>
         </header>

         {/* Content Area */}
         <div className="flex-1 overflow-hidden relative">
            <AnimatePresence mode="wait">
               <motion.div
                 key={location.pathname}
                 initial={{ opacity: 0, scale: 0.98 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 1.02 }}
                 transition={{ duration: 0.3, ease: "easeOut" }}
                 className="h-full overflow-y-auto custom-scrollbar pr-2"
               >
                  <Outlet />
               </motion.div>
            </AnimatePresence>
         </div>
      </main>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { 
  Camera, CalendarDays, BarChart2, User, LogOut, 
  ArrowRight, ShieldCheck, Sparkles, Bell, 
  Settings, Globe, Users, Search, Command, IndianRupee,
  MessageSquare, X, Check, ImageIcon, Server
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { notificationApi } from '../../lib/api'
import toast from 'react-hot-toast'

const NAV = [
  { to: '/photographer/events', icon: CalendarDays, label: 'Studio Events' },
  { to: '/photographer/bookings', icon: Bell, label: 'Booking Orders' },
  { to: '/photographer/chat', icon: MessageSquare, label: 'Client Messages' },
  { to: '/photographer/engagement', icon: Users, label: 'Guest Intel' },
  { to: '/photographer/analytics', icon: BarChart2, label: 'Performance' },
  { to: '/photographer/pricing-manager', icon: IndianRupee, label: 'Pricing & Services' },
]

const SYSTEM_NAV = [
  { to: '/photographer/profile', icon: Settings, label: 'Studio Config' },
  { to: '/photographer/delivery', icon: Globe, label: 'Global Hub' },
]

export default function PhotographerLayout() {
  const { fullName, logout, subscriptionActive } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = async () => {
    try {
      const res = await notificationApi.get()
      setNotifications(res.data)
      setUnreadCount(res.data.filter((n: any) => !n.is_read).length)
    } catch (err) {
      console.error('Failed to fetch notifications')
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 10000) // Poll every 10s
    return () => clearInterval(interval)
  }, [])

  const markRead = async (id: string) => {
    try {
      await notificationApi.markRead(id, true)
      fetchNotifications()
    } catch (err) {
      toast.error('Failed to mark as read')
    }
  }

  const markAllRead = async () => {
    try {
      await notificationApi.readAll()
      fetchNotifications()
    } catch (err) {
      toast.error('Failed to mark all as read')
    }
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] selection:bg-[#D4AF37]/20 font-sans">
      {/* Decorative Background Aurora */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#D4AF37]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#FF9933]/5 blur-[120px] rounded-full" />
      </div>

      {/* --- Sidebar: Ultra-Modern Floating Navigation --- */}
      <aside className="w-80 h-screen sticky top-0 flex flex-col p-6 z-50">
        <div className="bg-[#111827] h-full rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl shadow-slate-900/40 relative">
          {/* Top Logo Section */}
          <div className="p-10 pb-12 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 blur-[40px] -translate-y-1/2 translate-x-1/2" />
             <Link to="/" className="flex items-center gap-4 group relative z-10">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/10 group-hover:bg-[#D4AF37]/20 transition-all duration-500">
                  <Camera size={24} className="text-white" />
                </div>
                <div>
                   <h2 className="text-xl font-black text-white tracking-tight uppercase leading-none">SnapMoment</h2>
                   <div className="flex items-center gap-2 mt-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FF9933] animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Studio Swagat</span>
                   </div>
                </div>
             </Link>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
             <div className="px-6 mb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Creative Suite</span>
             </div>
             {NAV.map(({ to, icon: Icon, label }) => (
               <NavLink
                 key={to} to={to}
                 className={({ isActive }) =>
                   `group relative flex items-center gap-4 px-6 py-5 rounded-2xl text-sm font-black transition-all duration-500 ${
                     isActive ? 'text-white' : 'text-white/40 hover:text-white hover:bg-white/5'
                   }`
                 }
               >
                 {({ isActive }) => (
                   <>
                     {isActive && (
                        <motion.div
                          layoutId="nav-glow"
                          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#D4AF37]/20 to-transparent border-l-4 border-[#D4AF37] z-0"
                        />
                     )}
                     <Icon size={20} className={`relative z-10 ${isActive ? 'text-[#D4AF37]' : 'text-white/20 group-hover:text-white/60'}`} />
                     <span className="relative z-10">{label}</span>
                     {isActive && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-lg shadow-[#D4AF37]/50 relative z-10" />}
                   </>
                 )}
               </NavLink>
             ))}

             <div className="pt-10 px-6 mb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">System</span>
             </div>
             {SYSTEM_NAV.map(({ to, icon: Icon, label }) => (
               <NavLink
                 key={to} to={to}
                 className={({ isActive }) =>
                   `group relative flex items-center gap-4 px-6 py-5 rounded-2xl text-sm font-black transition-all duration-500 ${
                     isActive ? 'text-white' : 'text-white/40 hover:text-white hover:bg-white/5'
                   }`
                 }
               >
                 {({ isActive }) => (
                   <>
                     {isActive && (
                        <motion.div
                          layoutId="nav-glow"
                          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#D4AF37]/20 to-transparent border-l-4 border-[#D4AF37] z-0"
                        />
                     )}
                     <Icon size={20} className={`relative z-10 ${isActive ? 'text-[#D4AF37]' : 'text-white/20 group-hover:text-white/60'}`} />
                     <span className="relative z-10">{label}</span>
                     {isActive && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-lg shadow-[#D4AF37]/50 relative z-10" />}
                   </>
                 )}
               </NavLink>
             ))}
          </nav>

          {/* User Profile Card */}
          <div className="p-6">
             <div className="bg-white/5 rounded-3xl p-5 border border-white/5">
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/20 p-0.5 relative">
                      <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${fullName}`} className="w-full h-full object-cover rounded-2xl" alt="Me" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-[#111827] rounded-full" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40 truncate">Studio Head</p>
                      <p className="text-sm font-black text-white truncate">{fullName}</p>
                   </div>
                </div>
                <button 
                  onClick={() => { logout(); navigate('/') }}
                  className="w-full py-3.5 rounded-xl bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-400 font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 border border-white/5 hover:border-red-500/20"
                >
                   <LogOut size={14} /> Log Out System
                </button>
             </div>
          </div>
        </div>
      </aside>

      {/* --- Main Vessel --- */}
      <main className="flex-1 flex flex-col p-6 pl-0 relative z-10">
         {/* Top Glass Header */}
         <header className="h-24 px-10 flex items-center justify-between glass-card border-none mb-6 rounded-[2.5rem] shadow-2xl shadow-slate-200/50">
            <div className="flex items-center gap-8 flex-1">
               <div className="relative group max-w-md w-full">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#D4AF37] transition-colors">
                     <Search size={18} />
                  </div>
                  <input 
                    type="text" placeholder="Search events, guests, or photos..."
                    className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:bg-white focus:border-[#D4AF37]/30 transition-all font-bold text-sm"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-100 rounded-lg shadow-sm">
                     <Command size={12} className="text-slate-400" />
                     <span className="text-[10px] font-black text-slate-400">K</span>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-6">
               <div className="flex items-center gap-3 pr-6 border-r border-slate-100 relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all relative ${
                      showNotifications ? 'bg-[#D4AF37] text-white' : 'bg-slate-50 text-slate-400 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5'
                    }`}
                  >
                     <Bell size={20} />
                     {unreadCount > 0 && (
                        <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse" />
                     )}
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setShowNotifications(false)} 
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute top-full right-0 mt-4 w-[400px] bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100 z-50 overflow-hidden"
                        >
                          <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <div>
                              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Notifications</h3>
                              <p className="text-[10px] text-slate-400 font-bold mt-0.5">{unreadCount} Unread Alerts</p>
                            </div>
                            <button 
                              onClick={markAllRead}
                              className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest hover:underline"
                            >
                              Mark all as read
                            </button>
                          </div>

                          <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                              <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                  <Bell size={24} className="text-slate-200" />
                                </div>
                                <p className="text-xs font-bold text-slate-400">All caught up!</p>
                              </div>
                            ) : (
                              <div className="divide-y divide-slate-50">
                                {notifications.map((notif) => (
                                  <div 
                                    key={notif.id}
                                    className={`p-6 hover:bg-slate-50/50 transition-colors group relative ${!notif.is_read ? 'bg-[#D4AF37]/5' : ''}`}
                                  >
                                    <div className="flex gap-4">
                                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                        notif.type === 'message' ? 'bg-blue-50 text-blue-500' : 
                                        notif.type === 'booking' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'
                                      }`}>
                                        {notif.type === 'message' ? <MessageSquare size={18} /> : <Check size={18} />}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                          <h4 className="text-xs font-black text-slate-900 truncate pr-4">{notif.title}</h4>
                                          <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap">
                                            {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                          </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-3">{notif.content}</p>
                                        
                                        <div className="flex items-center gap-4">
                                          {notif.link && (
                                            <Link 
                                              to={notif.link}
                                              onClick={() => {
                                                markRead(notif.id)
                                                setShowNotifications(false)
                                              }}
                                              className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest flex items-center gap-1.5 hover:gap-2 transition-all"
                                            >
                                              View Details <ArrowRight size={12} />
                                            </Link>
                                          )}
                                          {!notif.is_read && (
                                            <button 
                                              onClick={() => markRead(notif.id)}
                                              className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600"
                                            >
                                              Dismiss
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <Link 
                            to="/photographer/notifications"
                            onClick={() => setShowNotifications(false)}
                            className="block p-5 text-center bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-[#D4AF37] transition-colors border-t border-slate-100"
                          >
                            View All Activity
                          </Link>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
               </div>
               
               <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Workspace Status</p>
                     <div className="flex items-center justify-end gap-1.5 mt-1">
                        <span className="text-sm font-black text-slate-900">{subscriptionActive ? 'Active Elite' : 'Suspended'}</span>
                        <div className={`w-2 h-2 rounded-full ${subscriptionActive ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
                     </div>
                  </div>
               </div>
            </div>
         </header>

         {/* Content Area with Page Transitions */}
         <div className="flex-1 overflow-hidden relative">
            <AnimatePresence mode="wait">
               <motion.div
                 key={location.pathname}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 transition={{ duration: 0.35, ease: "easeOut" }}
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

import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Camera, LayoutDashboard, Users, CalendarDays, BarChart2, Settings, LogOut, MessageSquare, Receipt, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { motion } from 'framer-motion'

const NAV = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/photographers', icon: Users, label: 'Photographers' },
  { to: '/admin/events', icon: CalendarDays, label: 'Events' },
  { to: '/admin/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/admin/invoices', icon: Receipt, label: 'Invoices' },
  { to: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
]

export default function AdminLayout() {
  const { logout, user } = useAuthStore()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen bg-[#FDFDFF]">
      {/* Sidebar */}
      <aside className="w-72 flex-shrink-0 flex flex-col relative z-20 border-r border-slate-100 bg-white/80 backdrop-blur-xl">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20" style={{ background: 'var(--primary-gradient)' }}>
              <Camera size={20} className="text-white" />
            </div>
            <div>
              <span className="block text-xl font-bold tracking-tight text-slate-900 leading-none">SnapMoment</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-teal-600">Admin Core</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5">
          <div className="px-4 mb-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Main Console</span>
          </div>
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `group flex items-center gap-3.5 px-5 py-3 rounded-2xl text-[13px] font-semibold transition-all duration-300 relative overflow-hidden ${
                  isActive 
                    ? 'text-white shadow-xl shadow-teal-500/20' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
              style={({ isActive }) => isActive ? { background: 'var(--primary-gradient)' } : {}}
            >
              <Icon size={18} className="relative z-10" />
              <span className="relative z-10">{label}</span>
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="p-6 mt-auto">
          <div className="bg-slate-50/80 rounded-3xl p-4 border border-slate-100 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700">
                <ShieldCheck size={18} />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-900 truncate">System Admin</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email || 'admin@snapmoment.app'}</p>
              </div>
            </div>
            <button 
              onClick={() => { logout(); navigate('/') }} 
              className="flex items-center justify-center gap-2 text-[11px] font-bold text-slate-500 hover:text-red-500 hover:bg-red-50 w-full py-2.5 rounded-xl transition-all border border-transparent hover:border-red-100"
            >
              <LogOut size={14} /> SIGNOUT SYSTEM
            </button>
          </div>
          <p className="text-[10px] text-center text-slate-400 font-medium tracking-wide">Elite Intelligence v2.4.0</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        {/* Top Header Background Decor */}
        <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-b from-slate-50 to-transparent pointer-events-none" />
        
        <div className="relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

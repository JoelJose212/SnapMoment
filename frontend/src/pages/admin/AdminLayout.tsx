import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Camera, LayoutDashboard, Users, CalendarDays, BarChart2, Settings, LogOut, MessageSquare, Receipt } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

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
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 flex-shrink-0 flex flex-col" style={{ background: 'var(--foreground)', minHeight: '100vh' }}>
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#FF6E6C,#67568C)' }}>
              <Camera size={18} color="white" />
            </div>
            <span style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 20, fontWeight: 600, color: 'white' }}>Admin</span>
          </div>
          <div className="mt-3 text-xs text-text-subtle">SnapMoment Control Panel</div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-[#FF6E6C] text-white shadow-coral-sm' : 'text-text-subtle hover:text-white hover:bg-white/5'}`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4">
          <button onClick={() => { logout(); navigate('/') }} className="flex items-center gap-2 text-sm text-text-subtle hover:text-white px-4 py-2.5 w-full rounded-xl hover:bg-white/5">
            <LogOut size={16} />Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto" style={{ background: 'var(--background)' }}>
        <Outlet />
      </main>
    </div>
  )
}

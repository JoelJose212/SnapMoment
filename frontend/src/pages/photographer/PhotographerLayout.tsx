import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Camera, CalendarDays, QrCode, BarChart2, User, LogOut } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const NAV = [
  { to: '/photographer/events', icon: CalendarDays, label: 'My Events' },
  { to: '/photographer/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/photographer/profile', icon: User, label: 'Profile' },
]

export default function PhotographerLayout() {
  const { fullName, logout } = useAuthStore()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col" style={{ background: 'var(--foreground)', minHeight: '100vh' }}>
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#FF6E6C,#67568C)' }}>
              <Camera size={18} color="white" />
            </div>
            <span style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 20, fontWeight: 600, color: 'white' }}>SnapMoment</span>
          </div>
          <div className="mt-4">
            <div className="text-xs text-text-subtle">Signed in as</div>
            <div className="text-sm font-medium text-white mt-0.5">{fullName}</div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
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
          <button
            onClick={() => { logout(); navigate('/') }}
            className="flex items-center gap-2 text-sm text-text-subtle hover:text-white transition-colors px-4 py-2.5 w-full rounded-xl hover:bg-white/5"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

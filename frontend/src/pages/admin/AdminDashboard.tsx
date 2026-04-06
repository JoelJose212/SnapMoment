import { useQuery } from '@tanstack/react-query'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { adminApi } from '../../lib/api'
import { Users, Camera, CalendarDays, BarChart2 } from 'lucide-react'

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.stats().then((r) => r.data),
  })

  const CARDS = [
    { label: 'Total Photographers', value: stats?.total_photographers || 0, icon: Users, color: '#67568C' },
    { label: 'Active Events', value: stats?.active_events || 0, icon: CalendarDays, color: '#FFB800' },
    { label: 'Total Photos', value: stats?.total_photos || 0, icon: Camera, color: '#FF6E6C' },
    { label: 'Matches Today', value: '—', icon: BarChart2, color: '#00C48C' },
  ]

  return (
    <div className="p-8">
      <h1 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 32, color: 'var(--foreground)', marginBottom: 24 }}>Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {CARDS.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-3xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${color}20` }}>
              <Icon size={20} color={color} />
            </div>
            {isLoading ? (
              <div className="skeleton rounded-lg" style={{ height: 40, width: 80 }} />
            ) : (
              <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 40, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
            )}
            <div className="text-xs text-text-muted mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-3xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)', marginBottom: 24 }}>
        <h3 className="font-semibold text-text-main mb-5">Photo Uploads (30 days)</h3>
        {stats?.photos_per_day?.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats.photos_per_day}>
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#FF6E6C" strokeWidth={2} dot={false} name="Photos" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-56 flex items-center justify-center text-sm text-text-muted">No data yet — run the seed script!</div>
        )}
      </div>

      {/* Top photographers */}
      {stats?.top_photographers?.length > 0 && (
        <div className="rounded-3xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <h3 className="font-semibold text-text-main mb-4">Top Photographers</h3>
          <div className="space-y-3">
            {stats.top_photographers.map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: '#67568C' }}>{i + 1}</div>
                  <span className="text-sm font-medium text-text-main">{p.name}</span>
                </div>
                <span className="text-sm text-text-muted">{p.photo_count} photos</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { adminApi } from '../../lib/api'

const COLORS = ['#FF6E6C', '#67568C', '#FFB800', '#00C48C', '#FF4B4B', '#FFE1D9']

export default function AdminAnalytics() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.stats().then((r) => r.data),
  })

  const typeData = Object.entries(stats?.event_type_distribution || {}).map(([name, value]) => ({ name, value }))

  return (
    <div className="p-8">
      <h1 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 32, color: 'var(--foreground)', marginBottom: 24 }}>Platform Analytics</h1>
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="rounded-3xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <h3 className="font-semibold text-text-main mb-5">Photos Uploaded (30 days)</h3>
          {isLoading ? <div className="skeleton rounded-xl" style={{ height: 220 }} /> :
            stats?.photos_per_day?.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.photos_per_day}>
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#FF6E6C" radius={[4,4,0,0]} name="Photos" />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="h-48 flex items-center justify-center text-sm text-text-muted">No data yet</div>}
        </div>
        <div className="rounded-3xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <h3 className="font-semibold text-text-main mb-5">Event Type Distribution</h3>
          {isLoading ? <div className="skeleton rounded-xl" style={{ height: 220 }} /> :
            typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={typeData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="h-48 flex items-center justify-center text-sm text-text-muted">No events yet</div>}
        </div>
      </div>

      {/* Top photographers table */}
      {stats?.top_photographers?.length > 0 && (
        <div className="rounded-3xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <h3 className="font-semibold text-text-main mb-4">Top Photographers by Photo Count</h3>
          <div className="space-y-3">
            {stats.top_photographers.map((p: any, i: number) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: '#67568C' }}>{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-main truncate">{p.name}</div>
                  <div className="w-full h-1.5 rounded-full mt-1 overflow-hidden" style={{ background: 'var(--border)' }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, (p.photo_count / (stats.total_photos || 1)) * 100)}%`, background: 'linear-gradient(135deg,#FF6E6C,#67568C)' }} />
                  </div>
                </div>
                <div className="text-sm font-semibold text-text-muted shrink-0">{p.photo_count}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

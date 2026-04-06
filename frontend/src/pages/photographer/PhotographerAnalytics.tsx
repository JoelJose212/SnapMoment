import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { analyticsApi } from '../../lib/api'

const COLORS = ['#FF6E6C', '#67568C', '#FFB800', '#00C48C', '#FF4B4B', '#FFE1D9']

export default function PhotographerAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['photographer-analytics'],
    queryFn: () => analyticsApi.photographer().then((r) => r.data),
  })

  if (isLoading) return <div className="p-8"><div className="skeleton rounded-3xl" style={{ height: 300 }} /></div>

  const typeData = Object.entries(data?.type_distribution || {}).map(([name, value]) => ({ name, value }))

  return (
    <div className="p-8">
      <h1 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 32, color: 'var(--foreground)', marginBottom: 24 }}>Analytics</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {[
          { label: 'Total Events', value: data?.total_events || 0 },
          { label: 'Total Photos', value: data?.total_photos || 0 },
          { label: 'Total Guests', value: data?.total_guests || 0 },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-3xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 44, fontWeight: 700, color: '#FF6E6C', lineHeight: 1 }}>{value}</div>
            <div className="text-sm text-text-muted mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-3xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <h3 className="font-semibold text-text-main mb-5">Photos Uploaded (30 days)</h3>
          {data?.events_per_month?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.events_per_month}>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#FF6E6C" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-48 flex items-center justify-center text-sm text-text-muted">No data yet</div>}
        </div>
        <div className="rounded-3xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <h3 className="font-semibold text-text-main mb-5">Event Types</h3>
          {typeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={typeData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name }) => name}>
                  {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="h-48 flex items-center justify-center text-sm text-text-muted">No events yet</div>}
        </div>
      </div>
    </div>
  )
}

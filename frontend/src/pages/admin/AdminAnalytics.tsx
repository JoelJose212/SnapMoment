import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, CartesianGrid } from 'recharts'
import { adminApi } from '../../lib/api'
import { BarChart2, PieChart as PieIcon, TrendingUp, Users } from 'lucide-react'
import { motion } from 'framer-motion'

const COLORS = ['#14B8A6', '#A78BFA', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6']

export default function AdminAnalytics() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.stats().then((r) => r.data),
  })

  const typeData = Object.entries(stats?.event_type_distribution || {}).map(([name, value]) => ({ name, value }))

  return (
    <div className="p-10 max-w-[1600px] mx-auto">
      <header className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <BarChart2 size={14} className="text-teal-600" />
          <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Global Telemetry</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Platform Analytics</h1>
        <p className="text-slate-500 mt-1 font-medium">Deep insights into network growth and event distribution.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Bar Chart Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Ingestion Volume</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Photos Uploaded (30D)</p>
            </div>
            <TrendingUp size={20} className="text-teal-500" />
          </div>

          {isLoading ? <div className="skeleton rounded-3xl h-[280px]" /> :
            stats?.photos_per_day?.length > 0 ? (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.photos_per_day} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} 
                    />
                    <Tooltip 
                      cursor={{ fill: '#F8FAFC' }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="count" fill="#14B8A6" radius={[6,6,0,0]} name="Photos" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[280px] flex items-center justify-center bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-widest">
                Waiting for data stream...
              </div>
            )}
        </motion.div>

        {/* Pie Chart Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Market Segments</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Event Type Distribution</p>
            </div>
            <PieIcon size={20} className="text-indigo-500" />
          </div>

          {isLoading ? <div className="skeleton rounded-3xl h-[280px]" /> :
            typeData.length > 0 ? (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={typeData} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={60}
                      outerRadius={100} 
                      paddingAngle={5}
                      dataKey="value" 
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', fontWeight: 'bold' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[280px] flex items-center justify-center bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-widest">
                No events mapped yet
              </div>
            )}
        </motion.div>
      </div>

      {/* Leaderboard Progress Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
            <Users size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Top Performance Nodes</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Leading Photographers by Index Count</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          {stats?.top_photographers?.length > 0 ? (
            stats.top_photographers.map((p: any, i: number) => (
              <div key={i} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-slate-300">0{i + 1}</span>
                    <span className="text-sm font-bold text-slate-800">{p.name}</span>
                  </div>
                  <span className="text-xs font-black text-teal-600 tracking-tighter">{p.photo_count.toLocaleString()}</span>
                </div>
                <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (p.photo_count / (stats.total_photos || 1)) * 100)}%` }}
                    transition={{ duration: 1.5, delay: 0.5 + i * 0.1, ease: "circOut" }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-teal-500 to-indigo-500 rounded-full"
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 py-10 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
              Waiting for network activity data...
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

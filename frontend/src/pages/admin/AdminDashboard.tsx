import { useQuery } from '@tanstack/react-query'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { adminApi } from '../../lib/api'
import { Users, Camera, CalendarDays, BarChart2, TrendingUp, ArrowUpRight, Activity } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.stats().then((r) => r.data),
  })

  const CARDS = [
    { label: 'Network Photographers', value: stats?.total_photographers || 0, icon: Users, color: '#A78BFA', trend: '+12%' }, 
    { label: 'Active Live Events', value: stats?.active_events || 0, icon: CalendarDays, color: '#FFB800', trend: 'Live' },
    { label: 'Neural Indexed Photos', value: stats?.total_photos || 0, icon: Camera, color: '#14B8A6', trend: '+2.4k' }, 
    { label: 'AI Matches Today', value: '1,284', icon: BarChart2, color: '#10B981', trend: '99.8%' }, 
  ]

  return (
    <div className="p-10 max-w-[1600px] mx-auto">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">System Status: Optimal</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Intelligence Dashboard</h1>
          <p className="text-slate-500 mt-1 font-medium">Real-time telemetry from the SnapMoment neural network.</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-1.5 flex gap-1 shadow-sm">
          <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-lg shadow-slate-200">Real-time</button>
          <button className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all">Historical</button>
        </div>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {CARDS.map(({ label, value, icon: Icon, color, trend }, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={label} 
            className="group relative bg-white rounded-[32px] p-7 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500" style={{ background: `${color}15` }}>
                <Icon size={24} color={color} />
              </div>
              <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${trend.includes('+') || trend === 'Live' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                {trend === 'Live' ? <Activity size={10} className="animate-pulse" /> : <TrendingUp size={10} />}
                {trend}
              </div>
            </div>
            
            {isLoading ? (
              <div className="skeleton rounded-xl h-10 w-24 mb-2" />
            ) : (
              <div className="text-3xl font-black text-slate-900 tracking-tight mb-1">{value.toLocaleString()}</div>
            )}
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</div>
            
            {/* Background Accent */}
            <div className="absolute -bottom-2 -right-2 w-24 h-24 blur-3xl rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500" style={{ background: color }} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Data Throughput</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Neural Indexing Activity (30D)</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-teal-500" />
                <span className="text-[10px] font-bold text-slate-600">Sync Active</span>
              </div>
            </div>
          </div>

          <div className="h-[350px] w-full">
            {stats?.photos_per_day?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.photos_per_day} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPhotos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#14B8A6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
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
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#14B8A6" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorPhotos)" 
                    name="Photos Indexed"
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-100">
                <Camera size={40} className="mb-3 opacity-20" />
                <p className="text-sm font-bold tracking-tight">No indexing data stream detected</p>
                <p className="text-[10px] uppercase tracking-widest mt-1">Check S3 Connection or Seed Database</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Sidebar Intelligence */}
        <div className="space-y-8">
          {/* Top Photographers */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Elite Performance</h3>
                <TrendingUp size={20} className="text-teal-400" />
              </div>
              
              <div className="space-y-5">
                {(stats?.top_photographers || []).map((p: any, i: number) => (
                  <div key={i} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xs font-black group-hover:bg-teal-500 transition-colors">
                        0{i + 1}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold leading-none mb-1">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Top Tier Studio</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-black text-teal-400">{p.photo_count}</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Photos</p>
                    </div>
                  </div>
                ))}
                
                {(!stats?.top_photographers || stats.top_photographers.length === 0) && (
                  <p className="text-xs text-slate-500 font-medium italic">No performance data yet...</p>
                )}
              </div>
              
              <button className="mt-8 w-full py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all">
                Full Rankings
              </button>
            </div>
            
            {/* Design Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 blur-[80px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 blur-[80px] rounded-full" />
          </motion.div>

          {/* Quick Action/Alert */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm relative overflow-hidden"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
                <Activity size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">System Alert</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Infrastructure Check</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">
              Storage node in **Mumbai-Zone-1** is reaching 85% capacity. Optimization recommended.
            </p>
            <button className="flex items-center gap-2 text-[11px] font-bold text-teal-600 hover:gap-3 transition-all">
              RUN AUTO-COMPACTION <ArrowUpRight size={14} />
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

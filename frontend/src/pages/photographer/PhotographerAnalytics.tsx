import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Users, Image as ImageIcon, Sparkles } from 'lucide-react'
import { analyticsApi } from '../../lib/api'

const COLORS = ['#FF6B6B', '#67568C', '#FFD93D', '#4D96FF', '#FF8E53', '#6BCB77']

export default function PhotographerAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['photographer-analytics'],
    queryFn: () => analyticsApi.photographer().then((r) => r.data),
  })

  if (isLoading) return <div className="space-y-8"><div className="skeleton rounded-[2.5rem]" style={{ height: 400 }} /></div>

  const typeData = Object.entries(data?.type_distribution || {}).map(([name, value]) => ({ name, value }))

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="space-y-10">
      <header className="px-2">
        <motion.div 
          initial={{ opacity: 0, x: -10 }} 
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 mb-2 text-primary font-bold text-xs uppercase tracking-[0.2em]"
        >
          <TrendingUp size={14} /> Insights Explorer
        </motion.div>
        <h1 className="text-5xl font-extrabold tracking-tight text-foreground" style={{ fontFamily: '"Plus Jakarta Sans"' }}>Analytics</h1>
        <p className="text-muted font-medium mt-2">Visualizing your creative impact</p>
      </header>

      {/* Hero Stats */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-3 gap-6"
      >
        {[
          { label: 'Studio Events', value: data?.total_events || 0, icon: BarChart3, color: '#FF6E6C' },
          { label: 'Frames Captured', value: data?.total_photos || 0, icon: ImageIcon, color: '#67568C' },
          { label: 'Unique Guests', value: data?.total_guests || 0, icon: Users, color: '#FFB800' },
        ].map(({ label, value, icon: Icon, color }) => (
          <motion.div 
            key={label} 
            variants={item}
            whileHover={{ y: -5 }}
            className="group relative overflow-hidden rounded-[2.5rem] p-8 glass-card border-white/30"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-[0.03] group-hover:opacity-[0.08] transition-opacity" style={{ background: color }} />
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-white/40 dark:bg-black/20 border border-white/40 shadow-sm">
                <Icon size={20} style={{ color }} />
              </div>
              <Sparkles size={16} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-5xl font-black tracking-tighter text-foreground mb-1">
              {value.toLocaleString()}
            </div>
            <div className="text-[10px] uppercase font-black tracking-widest text-muted">{label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Detailed Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-[2.5rem] p-8 border-white/30"
        >
          <div className="flex items-center justify-between mb-8 px-2">
            <h3 className="text-xl font-bold text-foreground">Content Velocity</h3>
            <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">30 Day Stream</span>
          </div>
          
          <div className="h-[280px]">
            {data?.events_per_month?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.events_per_month}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF6B6B" />
                      <stop offset="100%" stopColor="#67568C" />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: 'var(--subtle)', fontWeight: 600 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: 'var(--subtle)', fontWeight: 600 }} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                    cursor={{ fill: 'rgba(255,107,107,0.05)' }}
                  />
                  <Bar dataKey="count" fill="url(#barGradient)" radius={[8, 8, 8, 8]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-subtle italic">
                <ImageIcon size={48} className="opacity-10 mb-2" />
                <span className="text-sm">Velocity data pending...</span>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-[2.5rem] p-8 border-white/30"
        >
          <div className="flex items-center justify-between mb-8 px-2">
            <h3 className="text-xl font-bold text-foreground">Guest Engagement Funnel</h3>
            <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">Interactions</span>
          </div>
          
          <div className="h-[280px]">
            {data?.engagement?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.engagement} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="type" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: 'var(--foreground)', fontWeight: 800 }} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={32}>
                    {data.engagement.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-subtle italic">
                <BarChart3 size={48} className="opacity-10 mb-2" />
                <span className="text-sm">Engagement pending guest activity...</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

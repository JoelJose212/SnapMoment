import { motion } from 'framer-motion'
import { Globe, Zap, ShieldCheck, Activity, MapPin, Search } from 'lucide-react'

const LOCATIONS = [
  { city: 'Mumbai', status: 'Optimal', latency: '12ms' },
  { city: 'New York', status: 'Online', latency: '42ms' },
  { city: 'London', status: 'Online', latency: '35ms' },
  { city: 'Dubai', status: 'Optimal', latency: '18ms' },
  { city: 'Singapore', status: 'Online', latency: '28ms' },
]

export default function GlobalDelivery() {
  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-end justify-between gap-8 px-2">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 mb-4 text-primary font-black text-[10px] uppercase tracking-[0.3em]"
          >
            <Globe size={16} /> Global Edge Intelligence
          </motion.div>
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
            Digital <span className="text-slate-400">Delivery.</span>
          </h1>
          <p className="text-slate-500 font-medium mt-4 text-lg">Your studio content is currently mirrored across 12 global edge nodes.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
           <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <ShieldCheck size={24} />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Status</p>
              <p className="text-lg font-black text-slate-900 italic">Fully Operational</p>
           </div>
        </div>
      </div>

      {/* Latency Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white rounded-[3.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
            <div className="flex items-center justify-between mb-10">
               <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Active Nodes</h3>
               <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest">
                  <Activity size={14} className="animate-pulse" /> Live Telemetry
               </div>
            </div>

            {/* Mock Map / Visualization Area */}
            <div className="h-80 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center justify-center relative group overflow-hidden">
                <Globe size={160} className="text-slate-100 group-hover:scale-110 transition-transform duration-1000 group-hover:rotate-12" />
                
                {/* Floating Node Points */}
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-20 left-1/3 w-3 h-3 bg-primary rounded-full shadow-[0_0_20px_var(--primary)]" />
                <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }} className="absolute bottom-24 right-1/4 w-3 h-3 bg-accent rounded-full shadow-[0_0_20px_var(--accent)]" />
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 5, repeat: Infinity }} className="absolute top-1/2 left-1/4 w-2 h-2 bg-primary rounded-full shadow-[0_0_15px_var(--primary)]" />
                
                <div className="absolute inset-0 bg-gradient-to-tr from-white via-transparent to-transparent opacity-60" />
                
                <div className="absolute bottom-8 left-8 p-6 bg-white/80 backdrop-blur-xl rounded-3xl border border-white shadow-2xl">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white">
                         <Zap size={20} />
                      </div>
                      <div>
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Avg Latency</p>
                         <p className="text-xl font-black text-slate-900 tracking-tighter italic">24ms</p>
                      </div>
                   </div>
                </div>
            </div>
         </div>

         <div className="space-y-6">
            {LOCATIONS.map((loc, i) => (
              <motion.div 
                key={loc.city}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/30 flex items-center justify-between group hover:border-primary/20 transition-all cursor-pointer hover:bg-slate-50"
              >
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                      <MapPin size={20} />
                   </div>
                   <div>
                      <h4 className="font-black text-slate-900 italic uppercase tracking-tighter">{loc.city}</h4>
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{loc.status}</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-xs font-black text-slate-300 uppercase tracking-widest mb-0.5">Response</p>
                   <p className="text-lg font-black text-slate-900 tracking-tighter">{loc.latency}</p>
                </div>
              </motion.div>
            ))}
         </div>
      </div>

      {/* Data Security Banner */}
      <div className="p-10 bg-slate-900 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
         <div className="absolute inset-0 bg-primary/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-1000" />
         <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 rounded-[2rem] bg-white/10 backdrop-blur-xl flex items-center justify-center text-primary shadow-inner">
               <ShieldCheck size={32} />
            </div>
            <div>
               <h3 className="text-2xl font-black italic uppercase tracking-tighter">Encrypted Global Pipeline</h3>
               <p className="text-white/50 font-medium tracking-tight">Your data is sharded and encrypted with AES-256 before being replicated across nodes.</p>
            </div>
         </div>
         <button className="px-10 py-5 rounded-2xl bg-white text-slate-900 text-xs font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl relative z-10">
            Security Audit
         </button>
      </div>
    </div>
  )
}

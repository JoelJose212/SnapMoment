import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, MessageSquare, Smartphone, Zap, 
  Settings, Check, Send, AlertCircle, Sparkles,
  Users, Eye, History
} from 'lucide-react'

const RECENT_ALERTS = [
  { guest: 'Rohan Mehta', event: 'Sunset Wedding', time: '2m ago', type: 'SMS', status: 'Delivered' },
  { guest: 'Sarah Khan', event: 'Corporate Gala', time: '12m ago', type: 'WhatsApp', status: 'Opened' },
  { guest: 'Ananya Rao', event: 'Sunset Wedding', time: '45m ago', type: 'Email', status: 'Delivered' },
  { guest: 'David Miller', event: 'Birthday Bash', time: '1h ago', type: 'SMS', status: 'Failed' },
]

export default function NotificationCenter() {
  const [automationActive, setAutomationActive] = useState(true)

  return (
    <div className="space-y-12 pb-20">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row items-end justify-between gap-8 px-2">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 mb-4 text-primary font-black text-[10px] uppercase tracking-[0.3em]"
          >
            <Bell size={16} /> Guest Outreach Intelligence
          </motion.div>
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
            Notification <span className="text-slate-400">Hub.</span>
          </h1>
          <p className="text-slate-500 font-medium mt-4 text-lg">Managing automated alerts for your 2 active galleries.</p>
        </div>
        
        <div className="flex items-center gap-6 bg-white p-4 pr-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 group">
           <button 
             onClick={() => setAutomationActive(!automationActive)}
             className={`w-20 h-10 rounded-full p-1 transition-all duration-500 relative ${automationActive ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-slate-100'}`}
           >
             <motion.div 
               layout
               className="w-8 h-8 bg-white rounded-full shadow-sm"
               animate={{ x: automationActive ? 40 : 0 }}
             />
           </button>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Automation Status</p>
              <p className="text-lg font-black text-slate-900 italic">{automationActive ? 'Active' : 'Paused'}</p>
           </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
         {/* Template Editor */}
         <div className="lg:col-span-2 bg-white rounded-[4rem] p-12 border border-slate-100 shadow-xl shadow-slate-200/40">
            <div className="flex items-center justify-between mb-10">
               <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Outreach Template</h3>
               <div className="flex items-center gap-3">
                  <button className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all"><Smartphone size={18} /></button>
                  <button className="p-3 rounded-2xl bg-slate-900 text-white shadow-lg"><MessageSquare size={18} /></button>
               </div>
            </div>

            <div className="space-y-8">
               <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100 relative group">
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/30 rotate-12 group-hover:rotate-0 transition-transform">
                     <Sparkles size={20} />
                  </div>
                  <p className="text-xs font-black text-slate-300 uppercase tracking-widest mb-4">Magic Message SMS</p>
                  <p className="text-2xl font-bold text-slate-800 leading-relaxed tracking-tight italic">
                     "Hey <span className="text-primary italic">{"{guest_name}"}</span>, our AI just found <span className="text-primary italic">{"{photo_count}"}</span> new photos of you from <span className="text-primary italic">{"{event_name}"}</span>! Relive your moments here: <span className="text-accent underline">{"{gallery_link}"}</span>"
                  </p>
               </div>

               <div className="flex items-center gap-4">
                  <button className="flex-1 py-5 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all">Save Template</button>
                  <button className="px-8 py-5 rounded-2xl bg-slate-50 text-slate-400 text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-100 transition-all">Test SMS</button>
               </div>
            </div>
         </div>

         {/* Stats / Mini Feed */}
         <div className="space-y-8">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/30">
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                     <Users size={28} />
                  </div>
                  <div>
                     <p className="text-3xl font-black text-slate-900 italic tracking-tighter">98.2%</p>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivery Success</p>
                  </div>
               </div>
               <div className="space-y-4">
                  <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                     <motion.div initial={{ width: 0 }} animate={{ width: '98%' }} transition={{ duration: 1.5 }} className="h-full bg-primary" />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">Industry Leading Reliability</p>
               </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
               <div className="relative z-10 flex items-center justify-between">
                  <h4 className="text-white font-black italic uppercase tracking-tighter">Live Alert Feed</h4>
                  <History size={18} className="text-white/20" />
               </div>
               <div className="mt-8 space-y-6 relative z-10">
                  {RECENT_ALERTS.map((alert, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
                       <div>
                          <p className="text-white font-black text-sm tracking-tight italic">{alert.guest}</p>
                          <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">{alert.time} · {alert.type}</p>
                       </div>
                       <div className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${alert.status === 'Opened' ? 'bg-emerald-500 text-white' : alert.status === 'Failed' ? 'bg-red-500 text-white' : 'bg-white/10 text-white/60'}`}>
                          {alert.status}
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}

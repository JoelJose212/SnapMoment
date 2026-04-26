import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, ShieldCheck, Mail, Phone, Camera, 
  Sparkles, Globe, Zap, HardDrive, 
  Cpu, Award, ExternalLink, Settings,
  CheckCircle2
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

export default function PhotographerProfile() {
  const { fullName, email } = useAuthStore()
  const [form, setForm] = useState({ 
    full_name: fullName || '', 
    studio_name: (fullName ? fullName.split(' ')[0] : 'Creative') + ' Studio Pro', 
    phone: '+91 98765 43210',
    website: `snapmoment.app/p/${fullName?.toLowerCase().replace(' ', '-') || 'creative'}`
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Studio configuration synchronized! 🚀')
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row items-end justify-between gap-8 px-2">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 mb-4 text-primary font-black text-[10px] uppercase tracking-[0.3em]"
          >
            <Settings size={16} /> Identity & Studio Config
          </motion.div>
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
            Digital <span className="text-slate-400">Persona.</span>
          </h1>
          <p className="text-slate-500 font-medium mt-4 text-lg">Managing your professional elite status across the network.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
           <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
           </div>
           <p className="text-sm font-black text-slate-900 italic uppercase">Studio Live</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Dynamic Profile Hub */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-[3.5rem] p-12 flex flex-col items-center text-center relative overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/40">
            <div className="absolute top-0 left-0 w-full h-40 bg-slate-900 overflow-hidden">
               <img src="https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover opacity-40 grayscale" alt="Cover" />
            </div>
            
            <div className="relative mt-12 mb-8">
              <div className="w-36 h-36 rounded-[2.5rem] border-8 border-white shadow-3xl p-1 bg-white relative group overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${fullName}`} alt="Avatar" className="w-full h-full object-cover rounded-[2.2rem] group-hover:scale-110 transition-transform" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white border-4 border-white shadow-xl">
                <ShieldCheck size={24} />
              </div>
            </div>

            <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">{fullName}</h3>
            <div className="flex items-center gap-2 mt-2 px-4 py-1 rounded-full bg-slate-50 border border-slate-100">
               <Award size={14} className="text-primary" />
               <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Elite Partner</span>
            </div>
            
            <div className="w-full mt-10 space-y-3">
              <div className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-primary/20 transition-all">
                <Mail size={18} className="text-slate-300 group-hover:text-primary" />
                <span className="text-sm font-black text-slate-900 truncate tracking-tight">{email}</span>
              </div>
              <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-primary/20 transition-all">
                <div className="flex items-center gap-4">
                   <Globe size={18} className="text-slate-300 group-hover:text-primary" />
                   <span className="text-sm font-black text-slate-900 truncate tracking-tight uppercase italic">Public Portfolio</span>
                </div>
                <ExternalLink size={14} className="text-slate-300" />
              </div>
            </div>
          </div>

          {/* Real-time Telemetry */}
          <div className="bg-slate-900 rounded-[3rem] p-10 text-white space-y-8 shadow-3xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 text-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Cpu size={120} />
             </div>
             <div className="relative z-10">
                <h4 className="text-xs font-black text-white/40 uppercase tracking-[0.3em] mb-6">Studio Telemetry</h4>
                <div className="space-y-6">
                   <div className="space-y-3">
                      <div className="flex items-center justify-between px-1 text-[10px] font-black uppercase tracking-widest">
                         <span className="flex items-center gap-2"><HardDrive size={12} className="text-primary" /> Cloud Storage</span>
                         <span className="text-white/60">84% FULL</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                         <motion.div initial={{ width: 0 }} animate={{ width: '84%' }} transition={{ duration: 1.5 }} className="h-full bg-primary" />
                      </div>
                   </div>
                   <div className="space-y-3">
                      <div className="flex items-center justify-between px-1 text-[10px] font-black uppercase tracking-widest">
                         <span className="flex items-center gap-2"><Zap size={12} className="text-accent" /> AI Engine Load</span>
                         <span className="text-white/60">OPTIMAL</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                         <motion.div initial={{ width: 0 }} animate={{ width: '32%' }} transition={{ duration: 1.5 }} className="h-full bg-accent" />
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Studio Configuration Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[4rem] p-12 border border-slate-100 shadow-xl shadow-slate-200/40">
            <div className="flex items-center justify-between mb-12">
               <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Studio Command</h3>
                  <p className="text-sm text-slate-400 font-medium">Configure your professional identity across the network.</p>
               </div>
               <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-200">
                  <Settings size={28} />
               </div>
            </div>

            <form onSubmit={handleSave} className="space-y-10">
              <div className="grid md:grid-cols-2 gap-10">
                {[
                  { label: 'Pro Identity', key: 'full_name', placeholder: 'Rohan Mehta', icon: User },
                  { label: 'Studio Name', key: 'studio_name', placeholder: 'Elite Pixels Studio', icon: Camera },
                  { label: 'Direct Line', key: 'phone', placeholder: '+91 98765 43210', icon: Phone },
                  { label: 'Public Slug', key: 'website', placeholder: 'snapmoment.app/p/rohan', icon: Globe },
                ].map(({ label, key, placeholder, icon: Icon }) => (
                  <div key={key} className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
                    <div className="relative group">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">
                        <Icon size={20} />
                      </div>
                      <input
                        value={(form as any)[key]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        className="w-full pl-16 pr-6 py-5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-bold outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                        placeholder={placeholder}
                      />
                      {key === 'website' && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">
                           <CheckCircle2 size={18} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-8 flex items-center justify-between border-t border-slate-50">
                 <div className="flex items-center gap-4 text-slate-400">
                    <Zap size={18} className="text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Real-time Sync Enabled</span>
                 </div>
                 <button 
                   type="submit" 
                   className="px-12 py-6 rounded-[2.5rem] bg-slate-900 text-white text-sm font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                 >
                   Push Configuration <Sparkles size={18} />
                 </button>
              </div>
            </form>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
             {[
               { label: 'Total Events', val: '24', icon: Camera },
               { label: 'Photos', val: '12.4k', icon: Zap },
               { label: 'Guests', val: '2.5k', icon: User },
               { label: 'Rating', val: '4.9', icon: Award },
             ].map((stat, i) => (
               <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/30 flex flex-col items-center text-center">
                  <stat.icon size={20} className="text-primary mb-3" />
                  <p className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">{stat.val}</p>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  )
}

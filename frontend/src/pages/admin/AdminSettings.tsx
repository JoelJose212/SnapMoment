import { 
  Settings2, Shield, Zap, Globe, Mail, 
  Cpu, HardDrive, Lock, Save, Sparkles,
  RefreshCw, Sliders, Layout, Bell
} from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

export default function AdminSettings() {
  const handleSave = () => {
    const t = toast.loading('Syncing Core Config...')
    setTimeout(() => {
      toast.success('System Synchronization Success', { id: t })
    }, 1200)
  }

  return (
    <div className="p-10 max-w-[1200px] mx-auto min-h-screen">
      <header className="mb-12">
        <div className="flex items-center gap-2 mb-2">
            <Settings2 size={14} className="text-slate-600" />
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Global Configuration Hub</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">System Matrix</h1>
        <p className="text-slate-500 mt-1 font-medium">Fine-tune the platform's neural parameters and resource allocation logic.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
            {/* Core Identity Section */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm"
            >
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Globe size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">Core Identity</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Broadcast Branding & Delivery</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Platform Callsign</label>
                        <input defaultValue="SnapMoment" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 transition-all" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Support Relay</label>
                        <input defaultValue="support@snapmoment.app" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 transition-all" />
                    </div>
                </div>
            </motion.section>

            {/* Neural Resource Limits */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm"
            >
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Cpu size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">Resource Allocation</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ecosystem Throughput Caps</p>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Fresher Archive Limit</label>
                            <div className="relative">
                                <input defaultValue="200" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500/20 transition-all pr-20" />
                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">Frames</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Pro Archive Limit</label>
                            <div className="relative">
                                <input defaultValue="2000" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500/20 transition-all pr-20" />
                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">Frames</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Studio Storage Quota</label>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full w-3/4 bg-amber-400 rounded-full" />
                        </div>
                        <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
                            <span>Dynamic Scaling Enabled</span>
                            <span className="text-amber-600">75% Global Load</span>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Security Protocols */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm"
            >
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Lock size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">Security Protocols</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Authentication & Access Gates</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">OTP Signal TTL</label>
                        <div className="relative">
                            <input defaultValue="300" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 transition-all pr-24" />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">Seconds</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Session Cipher Strength</label>
                        <select className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 appearance-none">
                            <option>AES-256-GCM (Recommended)</option>
                            <option>AES-128-CBC</option>
                            <option>ChaCha20-Poly1305</option>
                        </select>
                    </div>
                </div>
            </motion.section>
        </div>

        <div className="space-y-8">
            <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 text-white/5 opacity-20 group-hover:opacity-40 transition-opacity">
                    <Sparkles size={120} />
                </div>
                <h4 className="text-xs font-black text-white/40 uppercase tracking-[0.3em] mb-10">Command Terminal</h4>
                <div className="space-y-6">
                    <button 
                      onClick={handleSave}
                      className="w-full py-6 rounded-[2rem] bg-indigo-500 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        <Save size={18} /> SYNC CONFIGURATION
                    </button>
                    <button className="w-full py-6 rounded-[2rem] bg-white/10 text-white/60 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white/20 transition-all flex items-center justify-center gap-3">
                        <RefreshCw size={18} /> REBOOT AI NODES
                    </button>
                </div>
                <div className="mt-12 pt-10 border-t border-white/10 space-y-4">
                    <div className="flex items-center gap-3 text-white/40">
                        <Sliders size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Advanced CLI Access</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/40">
                        <Layout size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Layout Engine: v4.2</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/40">
                        <Bell size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Broadcast Alerts: ACTIVE</span>
                    </div>
                </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <Shield size={20} className="text-slate-400" />
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">System Health</h4>
                </div>
                <div className="space-y-6">
                    {[
                        { label: 'API Gateway', status: 'Optimal', color: 'text-emerald-500' },
                        { label: 'Face Engines', status: 'Peak Load', color: 'text-amber-500' },
                        { label: 'S3 Storage', status: 'Stable', color: 'text-emerald-500' },
                        { label: 'DB Clusters', status: 'Syncing', color: 'text-indigo-500' },
                    ].map((s, i) => (
                        <div key={i} className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-900 uppercase italic">{s.label}</span>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${s.color}`}>{s.status}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}

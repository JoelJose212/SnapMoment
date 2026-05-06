import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  User, ShieldCheck, Mail, Phone, Camera, 
  Sparkles, Globe, Zap, HardDrive, 
  Cpu, Award, ExternalLink, Settings,
  CheckCircle2, Plus, FileText, Trash2, IndianRupee,
  File as FileIcon, Image as ImageIcon, Upload, MapPin, ChevronDown
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import { photographerApi, bookingsApi, analyticsApi } from '../../lib/api'

export default function PhotographerProfile() {
  const { fullName, email, token } = useAuthStore()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({ 
    business_name: '', 
    bio: '',
    phone: '',
    website: '',
    starting_price: 0,
    state: ''
  })
  const [states, setStates] = useState<string[]>([])
  const [stats, setStats] = useState({
    events: 0,
    photos: 0,
    guests: 0,
    rating: 0
  })

  useEffect(() => {
    fetchProfile()
    fetchStates()
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await analyticsApi.photographer()
      setStats(prev => ({
        ...prev,
        events: res.data.total_events,
        photos: res.data.total_photos,
        guests: res.data.total_guests
      }))
    } catch (err) {
      console.error('Failed to fetch stats')
    }
  }

  const fetchStates = async () => {
    try {
      const res = await bookingsApi.states()
      setStates(res.data)
    } catch (err) {
      console.error('Failed to fetch states')
    }
  }

  const fetchProfile = async () => {
    try {
      const res = await photographerApi.getProfile()
      setProfile(res.data)
      setForm({
        business_name: res.data.business_name || '',
        bio: res.data.bio || '',
        phone: res.data.phone || '',
        website: res.data.website || '',
        starting_price: res.data.starting_price || 0,
        state: res.data.service_states?.[0] || ''
      })
      setStats(prev => ({ ...prev, rating: res.data.rating || 5.0 }))
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Failed to load profile'
      toast.error(`Error: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        ...form,
        service_states: form.state ? [form.state] : []
      }
      delete (payload as any).state
      
      await photographerApi.updateProfile(payload)
      toast.success('Profile updated successfully! 🚀')
      fetchProfile()
    } catch (err) {
      toast.error('Update failed')
    }
  }

  const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    setUploading(true)
    try {
      const res = await photographerApi.uploadPortfolio(formData)
      toast.success('Portfolio updated! ✨')
      setProfile((prev: any) => ({ ...prev, portfolio_urls: res.data.portfolio_urls }))
    } catch (err: any) {
      console.error('Upload Error:', err)
      const msg = err.response?.data?.detail || err.message || 'Upload failed'
      toast.error(`Error: ${msg}`)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDeletePortfolio = async (url: string) => {
    try {
      const res = await photographerApi.deletePortfolio(url)
      toast.success('Item removed')
      setProfile((prev: any) => ({ ...prev, portfolio_urls: res.data.portfolio_urls }))
    } catch (err) {
      toast.error('Delete failed')
    }
  }

  if (loading) return <div className="p-20 text-center font-black uppercase tracking-[0.4em] animate-pulse text-[#D4AF37]">Authenticating Studio...</div>

  return (
    <div className="space-y-12 pb-20">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row items-end justify-between gap-8 px-2">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 mb-4 text-[#D4AF37] font-black text-[10px] uppercase tracking-[0.4em]"
          >
            <Settings size={16} /> Premium Studio Config
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
            Studio <span className="font-['Playfair_Display'] italic font-normal text-[#FF9933]">Persona</span>
          </h1>
          <p className="text-slate-500 font-medium mt-3 text-base">Nurturing your professional identity with authentic elegance.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/20">
           <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
           </div>
           <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Studio Swagat Live</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Dynamic Profile Hub */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-10 flex flex-col items-center text-center relative overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/20">
            <div className="absolute top-0 left-0 w-full h-32 bg-[#111827] overflow-hidden">
               <img src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover opacity-30 grayscale" alt="Cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-[#111827] to-transparent" />
            </div>
            
            <div className="relative mt-8 mb-6">
              <div className="w-32 h-32 rounded-[2rem] border-4 border-white shadow-2xl p-1 bg-white relative group overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${fullName}`} alt="Avatar" className="w-full h-full object-cover rounded-[1.8rem] group-hover:scale-110 transition-transform" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-xl bg-[#D4AF37] flex items-center justify-center text-white border-4 border-white shadow-xl">
                <ShieldCheck size={20} />
              </div>
            </div>

            <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight uppercase">{fullName}</h3>
            <div className="flex items-center gap-2 mt-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20">
               <Award size={12} className="text-[#D4AF37]" />
               <span className="text-[9px] text-[#D4AF37] font-black uppercase tracking-widest">Premium Partner</span>
            </div>
            
            <div className="w-full mt-10 space-y-3">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-50 group hover:border-[#D4AF37]/20 transition-all">
                <Mail size={16} className="text-slate-300 group-hover:text-[#D4AF37]" />
                <span className="text-xs font-black text-slate-900 truncate tracking-tight">{email}</span>
              </div>

              <div className="flex items-center justify-between px-2 pt-4">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Studio Showcase</h4>
                 <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white transition-all flex items-center justify-center"
                 >
                   {uploading ? <div className="w-3 h-3 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" /> : <Plus size={14} />}
                 </button>
                 <input type="file" ref={fileInputRef} onChange={handlePortfolioUpload} className="hidden" accept=".jpg,.jpeg,.png,.pdf" />
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {profile?.portfolio_urls?.map((url: string, idx: number) => {
                  const isPdf = url.toLowerCase().endsWith('.pdf');
                  return (
                    <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-50 group hover:border-[#D4AF37]/20 transition-all">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {isPdf ? <FileText size={16} className="text-[#FF9933]" /> : <ImageIcon size={16} className="text-[#D4AF37]" />}
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-slate-900 truncate hover:text-[#D4AF37] transition-colors uppercase tracking-widest">
                          {isPdf ? `Portfolio_${idx+1}` : `Shot_${idx+1}`}
                        </a>
                      </div>
                      <button onClick={() => handleDeletePortfolio(url)} className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                         <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Real-time Telemetry */}
          <div className="bg-[#111827] rounded-[2.5rem] p-8 text-white space-y-6 shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 text-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Cpu size={100} />
             </div>
             <div className="relative z-10">
                <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-6">Studio Telemetry</h4>
                <div className="space-y-5">
                   <div className="space-y-2">
                      <div className="flex items-center justify-between px-1 text-[9px] font-black uppercase tracking-widest">
                         <span className="flex items-center gap-2"><HardDrive size={12} className="text-[#D4AF37]" /> Cloud Vault</span>
                         <span className="text-white/40">84% FULL</span>
                      </div>
                      <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                         <motion.div initial={{ width: 0 }} animate={{ width: '84%' }} transition={{ duration: 1.5 }} className="h-full bg-[#D4AF37]" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <div className="flex items-center justify-between px-1 text-[9px] font-black uppercase tracking-widest">
                         <span className="flex items-center gap-2"><Zap size={12} className="text-[#FF9933]" /> Studio AI Load</span>
                         <span className="text-white/40">OPTIMAL</span>
                      </div>
                      <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                         <motion.div initial={{ width: 0 }} animate={{ width: '32%' }} transition={{ duration: 1.5 }} className="h-full bg-[#FF9933]" />
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Studio Configuration Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/20">
            <div className="flex items-center justify-between mb-10">
               <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Studio Command</h3>
                  <p className="text-xs text-slate-400 font-medium">Refining your professional essence across the network.</p>
               </div>
               <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-200">
                  <Settings size={24} />
               </div>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                {[
                  { label: 'Studio Identity', key: 'business_name', placeholder: 'Authentic Frames Studio', icon: Camera },
                  { label: 'Direct Swagat Line', key: 'phone', placeholder: '+91 98765 43210', icon: Phone },
                  { label: 'Base Investment (₹)', key: 'starting_price', placeholder: '25000', icon: IndianRupee },
                  { label: 'Artist Slug', key: 'website', placeholder: 'snapmoment.app/p/artist', icon: Globe },
                ].map(({ label, key, placeholder, icon: Icon }) => (
                  <div key={key} className="space-y-2.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
                    <div className="relative group">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#D4AF37] transition-colors">
                        <Icon size={18} />
                      </div>
                      <input
                        id={key}
                        name={key}
                        type={key === 'starting_price' ? 'number' : 'text'}
                        value={(form as any)[key]}
                        onChange={(e) => setForm({ ...form, [key]: key === 'starting_price' ? parseInt(e.target.value) : e.target.value })}
                        className="w-full pl-14 pr-6 py-4 rounded-xl bg-slate-50 border border-slate-50 text-slate-900 font-bold outline-none focus:border-[#D4AF37]/30 focus:bg-white transition-all shadow-sm text-sm"
                        placeholder={placeholder}
                      />
                    </div>
                  </div>
                ))}
                
                {/* State Selection */}
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Karmabhoomi (Service State)</label>
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#D4AF37] transition-colors">
                      <MapPin size={18} />
                    </div>
                    <select
                      id="state"
                      name="state"
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      className="w-full pl-14 pr-6 py-4 rounded-xl bg-slate-50 border border-slate-50 text-slate-900 font-bold outline-none focus:border-[#D4AF37]/30 focus:bg-white transition-all shadow-sm appearance-none text-sm"
                    >
                      <option value="">Select State</option>
                      {states.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio / Comment Line */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Studio Bio / Artisanal Mission</label>
                <div className="relative group">
                  <div className="absolute left-6 top-6 text-slate-300 group-focus-within:text-[#D4AF37] transition-colors">
                    <FileText size={18} />
                  </div>
                  <textarea
                    id="bio"
                    name="bio"
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    className="w-full pl-14 pr-6 py-5 rounded-2xl bg-slate-50 border border-slate-50 text-slate-900 font-bold outline-none focus:border-[#D4AF37]/30 focus:bg-white transition-all shadow-sm min-h-[120px] text-sm"
                    placeholder="Crafting cinematic moments with soul..."
                  />
                </div>
              </div>

              <div className="pt-8 flex items-center justify-between border-t border-slate-50">
                 <div className="flex items-center gap-3 text-slate-400">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                       <Zap size={14} className="text-emerald-500" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Real-time Studio Sync</span>
                 </div>
                 <button 
                   type="submit" 
                   className="px-10 py-5 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:bg-[#FF9933] transition-all flex items-center gap-2 border-b-4 border-slate-950 active:border-b-0 active:translate-y-1"
                 >
                   Push Studio Update <Sparkles size={16} />
                 </button>
              </div>
            </form>
          </div>

          {/* Quick Stats Grid - Enhanced High-Fidelity Design */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
             {[
               { label: 'STUDIO EVENTS', val: stats.events.toString(), icon: Camera, color: 'text-[#D4AF37]', bg: 'bg-[#D4AF37]/10' },
               { label: 'FRAMES NURTURED', val: stats.photos >= 1000 ? (stats.photos / 1000).toFixed(1) + 'K' : stats.photos.toString(), icon: Zap, color: 'text-[#FF9933]', bg: 'bg-[#FF9933]/10' },
               { label: 'GUEST SMILES', val: stats.guests >= 1000 ? (stats.guests / 1000).toFixed(1) + 'K' : stats.guests.toString(), icon: User, color: 'text-[#D4AF37]', bg: 'bg-[#D4AF37]/10' },
               { label: 'STUDIO RATING', val: stats.rating.toFixed(1), icon: Award, color: 'text-[#FF9933]', bg: 'bg-[#FF9933]/10' },
             ].map((stat, i) => (
               <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/20 flex flex-col items-center text-center group hover:scale-[1.02] transition-all">
                  <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color} mb-5 group-hover:rotate-12 transition-transform`}>
                     <stat.icon size={20} />
                  </div>
                  <p className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">{stat.val}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3">{stat.label}</p>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  )
}

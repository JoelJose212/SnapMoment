import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, ShieldCheck, Mail, Phone, Camera, Sparkles } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

export default function PhotographerProfile() {
  const { fullName, email } = useAuthStore()
  const [form, setForm] = useState({ 
    full_name: fullName || '', 
    studio_name: 'Studio ' + (fullName ? fullName.split(' ')[0] : 'Creative'), 
    phone: '+91 98765 43210' 
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Profile synced with secure cloud! ✨')
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      <header className="px-2">
        <div className="flex items-center gap-2 mb-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
          <User size={14} /> Identity Management
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight text-foreground" style={{ fontFamily: '"Plus Jakarta Sans"' }}>Profile</h1>
        <p className="text-muted font-medium mt-2">Manage your professional creative persona</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="glass-card rounded-[3rem] p-10 flex flex-col items-center text-center relative overflow-hidden border-white/30">
            <div className="absolute top-0 left-0 w-full h-32 aurora-bg opacity-20" />
            
            <div className="relative mt-8 mb-6">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-2xl p-1 bg-white">
                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${fullName}`} alt="Avatar" className="w-full h-full object-cover rounded-full" />
              </div>
              <div className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white border-4 border-white shadow-lg">
                <ShieldCheck size={20} />
              </div>
            </div>

            <h3 className="text-2xl font-black text-foreground">{fullName}</h3>
            <p className="text-sm text-primary font-bold tracking-widest uppercase mt-1">Lead Photographer</p>
            
            <hr className="w-full border-border my-8" />
            
            <div className="w-full space-y-4">
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/40 dark:bg-black/20 border border-white/20">
                <Mail size={16} className="text-primary" />
                <span className="text-xs font-bold text-foreground truncate">{email || 'admin@snapmoment.app'}</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/40 dark:bg-black/20 border border-white/20">
                <Phone size={16} className="text-primary" />
                <span className="text-xs font-bold text-foreground">+91 98765 00000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <div className="glass-card rounded-[3rem] p-10 border-white/30">
            <div className="flex items-center gap-2 mb-8 px-2">
              <Sparkles size={18} className="text-primary" />
              <h3 className="text-xl font-bold text-foreground leading-none">Studio Configuration</h3>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                {[
                  { label: 'Creative Name', key: 'full_name', placeholder: 'Rohan Mehta', icon: User },
                  { label: 'Studio Identity', key: 'studio_name', placeholder: 'Rohan Mehta Studios', icon: Camera },
                  { label: 'Mobile Contact', key: 'phone', placeholder: '+91 98765 43210', icon: Phone },
                ].map(({ label, key, placeholder, icon: Icon }) => (
                  <div key={key}>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted block mb-3 px-1">{label}</label>
                    <div className="relative group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors">
                        <Icon size={18} />
                      </div>
                      <input
                        value={(form as any)[key]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        className="w-full pl-14 pr-6 py-4 rounded-[1.25rem] bg-white/50 dark:bg-black/20 border border-border text-foreground font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                        placeholder={placeholder}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-border">
                <button 
                  type="submit" 
                  className="px-10 py-4 rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] text-white shadow-xl transition-all aurora-bg active:scale-95 flex items-center gap-3"
                >
                  Synchronize Status <Sparkles size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, ShieldCheck, Activity } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../lib/api'

export default function VIPLandingPage() {
  const { vipToken } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    handleVIPAuth()
  }, [vipToken])

  const handleVIPAuth = async () => {
    try {
      const res = await api.get(`/api/guest/vip/${vipToken}`)
      const { access_token, event_id } = res.data
      
      // Store VIP token in localStorage (correct keys for interceptors)
      localStorage.setItem('snapmoment_guest_token', access_token)
      localStorage.setItem('snapmoment_active_event_id', event_id)
      localStorage.setItem('snapmoment_role', 'guest_vip')
      
      toast.success('Master Access Granted! ✨', {
        icon: '👑',
        duration: 4000
      })
      
      // Redirect directly to the gallery
      setTimeout(() => {
        navigate('/gallery')
      }, 1500)
    } catch (err: any) {
      console.error('VIP Auth Error:', err)
      const message = err.response?.data?.detail || 'This VIP link has expired or is invalid.'
      toast.error(message)
      setTimeout(() => {
        navigate('/')
      }, 4000)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 overflow-hidden relative">
      {/* Immersive Background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full glass rounded-[3rem] p-12 text-center border-white/10 relative z-10 shadow-3xl"
      >
        <div className="w-24 h-24 rounded-[2rem] bg-amber-500/20 flex items-center justify-center text-amber-500 mx-auto mb-10 shadow-2xl shadow-amber-500/20">
           <ShieldCheck size={48} />
        </div>
        
        <div className="space-y-4 mb-12">
           <div className="flex items-center justify-center gap-2 text-amber-500 font-black text-[10px] uppercase tracking-[0.4em]">
              <Sparkles size={16} /> Exclusive Access
           </div>
           <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
              Master <span className="text-slate-400">Gallery.</span>
           </h1>
           <p className="text-slate-400 font-medium text-lg leading-relaxed">
              Authenticating your VIP session... You're about to see the entire event story.
           </p>
        </div>

        <div className="flex flex-col items-center gap-4">
           <Activity size={32} className="text-primary animate-spin" />
           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Bypassing Face Recognition...</p>
        </div>
      </motion.div>
    </div>
  )
}

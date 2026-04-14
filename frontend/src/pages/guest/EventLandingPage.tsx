import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, MapPin, Calendar, Sparkles, ArrowRight, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { eventsApi, guestApiEndpoints } from '../../lib/api'

export default function EventLandingPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [phone, setPhone] = useState('')
  const [fullName, setFullName] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    eventsApi.getPublic(token!).then((res) => {
      setEvent(res.data)
    }).catch(() => {
      toast.error('Event not found')
    }).finally(() => setLoading(false))
  }, [token])

  const handleSendOtp = async () => {
    if (!fullName.trim()) { toast.error('Please enter your full name'); return }
    if (!/^\d{10}$/.test(phone)) { toast.error('Please enter a valid 10-digit phone number'); return }
    setSending(true)
    try {
      await guestApiEndpoints.sendOtp({ phone_number: phone, event_id: event.id })
      toast.success('Secure Code Transmitted! ✨')
      navigate(`/event/${token}/otp`, { state: { phone, fullName, eventId: event.id } })
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Transmission failed')
    } finally {
      setSending(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center aurora-bg">
      <div className="flex flex-col items-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-12 h-12 rounded-full border-4 border-white border-t-transparent"
        />
        <p className="mt-4 text-white font-black tracking-widest text-xs uppercase animate-pulse">Initializing Studio...</p>
      </div>
    </div>
  )

  if (!event) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-12 glass rounded-[3rem] border-white/20 shadow-2xl">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Zap size={32} className="text-red-500" />
        </div>
        <h2 className="text-3xl font-black text-foreground">Discovery Failed</h2>
        <p className="text-muted mt-2 max-w-xs mx-auto">The event link is either expired or restricted by the studio.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-4 py-12 overflow-hidden bg-background">
      {/* Background Aurora */}
      <div className="fixed inset-0 aurora-bg opacity-30 blur-[100px] -z-10 scale-150 rotate-12" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Event Banner */}
        <div className="relative mb-6 group">
          <div className="absolute inset-0 aurora-bg blur-2xl opacity-10 group-hover:opacity-30 transition-opacity" />
          {event.cover_photo_url ? (
            <motion.img 
              whileHover={{ scale: 1.02 }}
              src={event.cover_photo_url} 
              alt={event.name} 
              className="w-full h-56 object-cover rounded-[2.5rem] relative z-10 photo-print shadow-2xl border-white/40" 
            />
          ) : event.studio_logo_url ? (
            <div className="w-full h-56 rounded-[2.5rem] flex items-center justify-center glass border-white/40 shadow-2xl relative z-10 overflow-hidden bg-white/5">
              <motion.img 
                whileHover={{ scale: 1.05 }}
                src={event.studio_logo_url} 
                alt={event.studio_name || 'Studio Logo'} 
                className="max-w-[80%] max-h-[70%] object-contain drop-shadow-2xl" 
              />
            </div>
          ) : (
            <div className="w-full h-56 rounded-[2.5rem] flex items-center justify-center glass border-white/40 shadow-2xl relative z-10">
              <div className="flex flex-col items-center text-primary/40">
                <Camera size={48} />
                <span className="text-[10px] font-black uppercase tracking-widest mt-4">Studio Live Stream</span>
              </div>
            </div>
          )}
        </div>

        {/* Content Card */}
        <div className="glass shadow-[0_32px_128px_-12px_rgba(0,0,0,0.4)] rounded-[3rem] p-10 border-white/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 aurora-bg shadow-[0_2px_10px_rgba(255,110,108,0.3)]" />
          
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <span className="text-[10px] font-black px-4 py-1.5 rounded-full capitalize bg-primary/10 text-primary tracking-widest border border-primary/20 mb-4 inline-block">
              {event.type}
            </span>
            <h1 className="text-4xl font-black text-foreground leading-tight tracking-tighter" style={{ fontFamily: '"Plus Jakarta Sans"' }}>
              {event.name}
            </h1>
            <div className="flex flex-col gap-2 mt-4">
              {event.location && (
                <div className="flex items-center gap-2 text-xs font-bold text-muted">
                  <MapPin size={14} className="text-primary" /> {event.location}
                </div>
              )}
              {event.event_date && (
                <div className="flex items-center gap-2 text-xs font-bold text-muted">
                  <Calendar size={14} className="text-primary" /> {new Date(event.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              )}
            </div>
          </motion.div>

          {event.photographer_note && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white/40 dark:bg-black/20 p-5 rounded-[1.5rem] mb-8 border border-white/20 flex gap-3"
            >
              <Sparkles size={18} className="text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-text-main italic leading-relaxed">
                "{event.photographer_note}"
              </p>
            </motion.div>
          )}

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted block mb-2 px-1">Your Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-border text-foreground font-bold text-lg outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted/30"
                placeholder="e.g. John Doe"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted block mb-2 px-1">Studio Access Code (Mobile)</label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full px-6 py-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-border text-foreground font-black text-xl tracking-[0.2em] outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted/30 placeholder:tracking-normal"
                  placeholder="10 digit number"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1 opacity-20">
                  <div className="w-1 h-1 rounded-full bg-foreground" />
                  <div className="w-1 h-1 rounded-full bg-foreground" />
                  <div className="w-1 h-1 rounded-full bg-foreground" />
                </div>
              </div>
            </div>

            <button
              onClick={handleSendOtp}
              disabled={sending}
              className="w-full py-5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] text-white shadow-xl transition-all aurora-bg hover:shadow-coral active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Transmitting...
                </>
              ) : (
                <>
                  Find My Magic <ArrowRight size={16} />
                </>
              )}
            </button>

            <div className="flex items-center gap-2 justify-center py-2">
              <Zap size={10} className="text-primary fill-primary" />
              <p className="text-[9px] font-bold text-muted uppercase tracking-widest text-center opacity-60">
                Secure OTP verification required for AI match
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Footer Branding */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-12 flex items-center gap-2 opacity-30 grayscale"
      >
        <Camera size={14} />
        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Powered by SnapMoment PRO</span>
      </motion.div>
    </div>
  )
}

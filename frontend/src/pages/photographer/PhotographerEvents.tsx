import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, QrCode, Upload, Trash2, Calendar, Image, Users, X, MapPin, Sparkles, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { eventsApi, api } from '../../lib/api'

import { useAuthStore } from '../../store/authStore'

const EVENT_TYPES = ['wedding', 'birthday', 'college', 'corporate', 'anniversary', 'other']

export default function PhotographerEvents() {
  const qc = useQueryClient()
  const { subscriptionActive } = useAuthStore()
  const [showModal, setShowModal] = useState(false)
  const [showCollabModal, setShowCollabModal] = useState<any>(null)
  const [collabEmail, setCollabEmail] = useState('')
  const [form, setForm] = useState({ name: '', type: 'wedding', event_date: '', location: '', description: '' })

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['photographer-events'],
    queryFn: () => eventsApi.list().then((r) => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => eventsApi.create(data),
    onSuccess: (res) => {
      qc.setQueryData(['photographer-events'], (old: any[]) => [res.data, ...(old || [])])
      toast.success('Event created! 🎉')
      setShowModal(false)
      setForm({ name: '', type: 'wedding', event_date: '', location: '', description: '' })
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Failed to create event'),
  })

  const inviteMutation = useMutation({
    mutationFn: (data: any) => api.post('/api/collaborations/invite', data),
    onSuccess: () => {
      toast.success('Team invite sent! 🚀')
      setShowCollabModal(null)
      setCollabEmail('')
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Failed to send invite'),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: any) => eventsApi.update(id, { is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['photographer-events'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => eventsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['photographer-events'] })
      toast.success('Event deleted')
    },
  })

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
      {/* Header */}
      <div className="flex items-end justify-between px-2">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 mb-2 text-primary font-bold text-xs uppercase tracking-[0.2em]"
          >
            <Sparkles size={14} /> Workflow Hub
          </motion.div>
          <h1 className="text-5xl font-extrabold tracking-tight text-foreground" style={{ fontFamily: '"Plus Jakarta Sans"' }}>My Events</h1>
          <p className="text-muted font-medium mt-2">{events.length} dynamic galleries active</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={!subscriptionActive}
          onClick={() => setShowModal(true)}
          className={`flex items-center gap-2 px-8 py-4 rounded-[1.5rem] text-sm font-bold text-white shadow-xl transition-all aurora-bg ${!subscriptionActive ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Plus size={18} /> New Studio Event
        </motion.button>
      </div>

      {/* Collaboration Invite Modal */}
      <AnimatePresence>
        {showCollabModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="w-full max-w-md rounded-[3rem] p-10 glass shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 aurora-bg" />
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-foreground">Invite Second Shooter</h2>
                  <p className="text-xs text-muted">Grant access to {showCollabModal.name}</p>
                </div>
                <button onClick={() => setShowCollabModal(null)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <X size={16} className="text-foreground" />
                </button>
              </div>

              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted block mb-2 px-1">Collaborator Email</label>
                    <input 
                      type="email"
                      value={collabEmail} 
                      onChange={(e) => setCollabEmail(e.target.value)} 
                      className="w-full px-6 py-4 rounded-[1.25rem] bg-white/50 dark:bg-black/20 border border-border text-foreground font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" 
                      placeholder="e.g. associate@studio.com" 
                    />
                 </div>
                 <button 
                   onClick={() => inviteMutation.mutate({ event_id: showCollabModal.id, email: collabEmail })}
                   disabled={inviteMutation.isPending}
                   className="w-full py-4 rounded-[1.25rem] text-xs font-black uppercase tracking-widest text-white shadow-xl transition-all aurora-bg active:scale-95 disabled:opacity-50"
                 >
                   {inviteMutation.isPending ? 'Inviting...' : 'Send Secure Invite'}
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Events grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton rounded-[2.5rem]" style={{ height: 280 }} />)}
        </div>
      ) : events.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="text-center py-24 bg-white/5 rounded-[3rem] border-2 border-dashed border-border flex flex-col items-center"
        >
          <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-6">
             {subscriptionActive ? <Calendar size={32} className="text-subtle" /> : <X size={32} className="text-primary" />}
          </div>
          <h3 className="text-2xl font-bold text-foreground">
             {subscriptionActive ? 'Awaiting Your First Story' : 'Events Hidden'}
          </h3>
          <p className="text-muted mt-2 max-w-xs mx-auto text-sm leading-relaxed">
             {subscriptionActive 
               ? 'Your creative portfolio starts here. Create an event to begin capturing moments.'
               : 'Your data is securely preserved but hidden until your subscription is reactivated.'
             }
          </p>
          {subscriptionActive ? (
            <button onClick={() => setShowModal(true)} className="mt-8 px-8 py-3.5 rounded-2xl text-sm font-bold text-white transition-all shadow-lg aurora-bg">
              Initialize Event
            </button>
          ) : (
            <Link to="/onboarding" className="mt-8 px-8 py-3.5 rounded-2xl text-sm font-bold text-white transition-all shadow-lg aurora-bg block">
              Reactivate Account
            </Link>
          )}
        </motion.div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {events.map((event: any) => (
            <motion.div 
              key={event.id} 
              variants={item}
              whileHover={{ y: -8 }}
              className="group glass-card rounded-[2.5rem] overflow-hidden flex flex-col h-full transition-all border-white/30"
            >
              <div className="p-8 flex-1">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex flex-col gap-3">
                    <span className="self-start text-[10px] font-black px-4 py-1.5 rounded-full capitalize bg-primary/10 text-primary tracking-widest border border-primary/20">
                      {event.type}
                    </span>
                    <h3 className="text-2xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{event.name}</h3>
                    {event.location && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                        <MapPin size={12} className="text-primary" />
                        {event.location}
                      </div>
                    )}
                  </div>
                  
                  <motion.button 
                    whileTap={{ scale: 0.8 }}
                    onClick={() => toggleMutation.mutate({ id: event.id, is_active: !event.is_active })}
                    className={`w-14 h-8 rounded-full p-1 transition-colors duration-500 relative ${event.is_active ? 'bg-primary' : 'bg-subtle/20'}`}
                  >
                    <motion.div 
                      layout
                      className="w-6 h-6 bg-white rounded-full shadow-md shadow-black/10"
                      animate={{ x: event.is_active ? 24 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </motion.button>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-auto">
                  <div className="bg-white/40 dark:bg-black/20 p-4 rounded-2xl border border-white/20">
                    <div className="text-[10px] uppercase font-black opacity-40 mb-1">Frames</div>
                    <div className="flex items-center gap-2 font-bold text-lg">
                      <Image size={16} className="text-primary" /> {event.photo_count}
                    </div>
                  </div>
                  <div className="bg-white/40 dark:bg-black/20 p-4 rounded-2xl border border-white/20">
                    <div className="text-[10px] uppercase font-black opacity-40 mb-1">Guests</div>
                    <div className="flex items-center gap-2 font-bold text-lg">
                      <Users size={16} className="text-primary" /> {event.guest_count}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white/40 dark:bg-black/20 border-t border-white/20 flex gap-2">
                <Link to={`/photographer/events/${event.id}/upload`} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold text-white aurora-bg shadow-sm transition-all hover:shadow-coral active:scale-95">
                  <Upload size={14} /> Upload
                </Link>
                <button 
                  onClick={() => setShowCollabModal(event)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold bg-white dark:bg-black/40 text-foreground border border-white/40 shadow-sm transition-all hover:bg-white/60 active:scale-95"
                >
                  <Users size={14} className="text-primary" /> Invite
                </button>
                <Link to={`/photographer/events/${event.id}/qr`} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-black/40 text-foreground border border-white/40 shadow-sm transition-all hover:bg-white/60 active:scale-95">
                  <QrCode size={16} className="text-primary" />
                </Link>
                <button 
                  onClick={() => { if (confirm('Irreversible Action: Delete this event and all associated frames?')) deleteMutation.mutate(event.id) }} 
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-90 border border-red-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create Event Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="w-full max-w-xl rounded-[3rem] p-10 glass shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 aurora-bg" />
              
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black text-foreground" style={{ fontFamily: '"Plus Jakarta Sans"' }}>Initialize Event</h2>
                  <p className="text-sm text-muted">Set the stage for your new gallery</p>
                </div>
                <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <X size={20} className="text-foreground" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form) }} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted block mb-2 px-1">Gallery Title</label>
                    <input 
                      value={form.name} 
                      onChange={(e) => setForm({ ...form, name: e.target.value })} 
                      className="w-full px-6 py-4 rounded-[1.25rem] bg-white/50 dark:bg-black/20 border border-border text-foreground font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" 
                      placeholder="e.g. Grand Horizon Gala 2024" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted block mb-2 px-1">Concept Type</label>
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-6 py-4 rounded-[1.25rem] bg-white/50 dark:bg-black/20 border border-border text-foreground font-bold outline-none focus:border-primary capitalize">
                      {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted block mb-2 px-1">Timeline</label>
                    <input type="datetime-local" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} className="w-full px-6 py-4 rounded-[1.25rem] bg-white/50 dark:bg-black/20 border border-border text-foreground font-bold outline-none focus:border-primary" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted block mb-2 px-1">Venue Destination</label>
                    <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full px-6 py-4 rounded-[1.25rem] bg-white/50 dark:bg-black/20 border border-border text-foreground font-bold outline-none focus:border-primary" placeholder="Mumbai International Convention Centre" />
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={createMutation.isPending} 
                    className="w-full py-5 rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] text-white shadow-xl transition-all aurora-bg active:scale-95 disabled:opacity-50"
                  >
                    {createMutation.isPending ? 'Provisioning...' : 'Create Studio Experience'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

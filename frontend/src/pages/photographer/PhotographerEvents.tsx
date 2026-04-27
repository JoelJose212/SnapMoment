import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Plus, QrCode, Upload, Trash2, Calendar, Image as ImageIcon, 
  Users, X, MapPin, Sparkles, ChevronRight, Activity, 
  MoreHorizontal, Share2, Eye, LayoutGrid, Clock, Server
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { eventsApi, api } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'

const EVENT_TYPES = ['wedding', 'birthday', 'college', 'corporate', 'anniversary', 'other']

const TYPE_IMAGES: Record<string, string> = {
  wedding: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
  corporate: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800',
  birthday: 'https://images.unsplash.com/photo-1530103043960-ef38714abb15?auto=format&fit=crop&q=80&w=800',
  college: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=800',
  anniversary: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800',
  other: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800'
}

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
            <Sparkles size={16} /> Digital Workflow Hub
          </motion.div>
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
            Your <span className="text-slate-400">Galleries.</span>
          </h1>
          <p className="text-slate-500 font-medium mt-4 text-lg">Managing {events.length} high-fidelity studio experiences.</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={!subscriptionActive}
          onClick={() => setShowModal(true)}
          className={`flex items-center gap-3 px-10 py-6 rounded-[2.5rem] text-sm font-black text-white shadow-2xl transition-all bg-slate-900 hover:shadow-slate-900/40 ${!subscriptionActive ? 'opacity-50 cursor-not-allowed' : ''} uppercase tracking-widest`}
        >
          <Plus size={22} /> New Studio Event
        </motion.button>
      </div>

      {/* Collaboration Invite Modal */}
      <AnimatePresence>
        {showCollabModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="w-full max-w-md rounded-[3rem] p-12 bg-white shadow-3xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Team Invite</h2>
                  <p className="text-sm text-slate-400 font-medium">Add a second shooter to {showCollabModal.name}</p>
                </div>
                <button onClick={() => setShowCollabModal(null)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <div className="space-y-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Associate Email</label>
                    <input 
                      type="email"
                      value={collabEmail} 
                      onChange={(e) => setCollabEmail(e.target.value)} 
                      className="w-full px-8 py-5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all" 
                      placeholder="associate@studio.com" 
                    />
                 </div>
                 <button 
                   onClick={() => inviteMutation.mutate({ event_id: showCollabModal.id, email: collabEmail })}
                   disabled={inviteMutation.isPending}
                   className="w-full py-6 rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-white shadow-xl transition-all bg-slate-900 hover:scale-105 disabled:opacity-50"
                 >
                   {inviteMutation.isPending ? 'Authenticating...' : 'Send Studio Invite'}
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid Area */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[1, 2, 3].map((i) => <div key={i} className="h-80 rounded-[3rem] bg-slate-100 animate-pulse" />)}
        </div>
      ) : events.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-32 bg-white rounded-[4rem] border-2 border-dashed border-slate-100 flex flex-col items-center shadow-sm"
        >
          <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 flex items-center justify-center mb-8 shadow-inner">
             <LayoutGrid size={40} className="text-slate-200" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">The Studio is Idle.</h3>
          <p className="text-slate-400 mt-4 max-w-sm mx-auto font-medium leading-relaxed">
             No active galleries found. Initialize your first event to begin the intelligence pipeline.
          </p>
          <button onClick={() => setShowModal(true)} className="mt-10 px-12 py-5 rounded-[2rem] text-sm font-black text-white transition-all bg-slate-900 hover:scale-105 shadow-xl">
            Start New Event
          </button>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-10">
          {events.map((event: any, idx: number) => (
            <motion.div 
              key={event.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-white rounded-[3.5rem] overflow-hidden flex flex-col h-full transition-all border border-slate-100 hover:border-primary/20 hover:shadow-2xl shadow-slate-200/50"
            >
              {/* Card Media Header */}
              <div className="relative h-48 overflow-hidden">
                 <img 
                   src={TYPE_IMAGES[event.type] || TYPE_IMAGES.other} 
                   className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 grayscale-[0.5] group-hover:grayscale-0"
                   alt={event.name}
                 />
                 <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/10 transition-colors" />
                 
                 {/* Live Badge */}
                 {event.is_active && (
                   <div className="absolute top-6 left-6 px-4 py-1.5 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg animate-float">
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      Live Feed
                   </div>
                 )}

                 {/* Switch */}
                 <div className="absolute top-6 right-6">
                    <button 
                      onClick={() => toggleMutation.mutate({ id: event.id, is_active: !event.is_active })}
                      className={`w-12 h-7 rounded-full p-1 transition-all duration-500 relative ${event.is_active ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-white/20 backdrop-blur-md'}`}
                    >
                      <motion.div 
                        layout
                        className="w-5 h-5 bg-white rounded-full shadow-sm"
                        animate={{ x: event.is_active ? 20 : 0 }}
                      />
                    </button>
                 </div>

                 {/* Title Overlay */}
                 <div className="absolute bottom-6 left-6 right-6">
                    <span className="inline-block px-3 py-1 rounded-lg bg-white/20 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-widest mb-2">
                       {event.type}
                    </span>
                    <h3 className="text-2xl font-black text-white leading-none tracking-tighter uppercase italic truncate drop-shadow-md">
                       {event.name}
                    </h3>
                 </div>
              </div>

              {/* Card Body */}
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-4 text-slate-400 mb-8 font-bold">
                   {event.location && (
                     <div className="flex items-center gap-1.5 text-[11px] truncate uppercase tracking-widest">
                       <MapPin size={14} className="text-primary" /> {event.location}
                     </div>
                   )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 group-hover:bg-primary/5 transition-colors">
                    <div className="text-[9px] uppercase font-black text-slate-400 tracking-widest mb-1">Frames</div>
                    <div className="flex items-center gap-2 font-black text-2xl italic tracking-tighter text-slate-900">
                      <ImageIcon size={20} className="text-primary" /> {event.photo_count}
                    </div>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 group-hover:bg-primary/5 transition-colors">
                    <div className="text-[9px] uppercase font-black text-slate-400 tracking-widest mb-1">Guests</div>
                    <div className="flex items-center gap-2 font-black text-2xl italic tracking-tighter text-slate-900">
                      <Users size={20} className="text-primary" /> {event.guest_count}
                    </div>
                  </div>
                </div>

                {/* Unified Action Bar */}
                <div className="mt-auto flex items-center gap-2 pt-6 border-t border-slate-50">
                   <Link 
                     to={`/photographer/events/${event.id}/upload`} 
                     className="flex-[2] py-4 rounded-2xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-lg hover:shadow-slate-900/20 active:scale-95"
                   >
                     <Upload size={16} /> Upload
                   </Link>
                   <Link 
                     to={`/photographer/events/${event.id}/qr`} 
                     className="flex-1 py-4 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center gap-2 hover:bg-slate-100 hover:text-slate-900 transition-all border border-slate-100"
                   >
                     <QrCode size={18} />
                   </Link>
                   <Link 
                     to={`/photographer/events/${event.id}/ftp`} 
                     className="flex-1 py-4 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center gap-2 hover:bg-slate-100 hover:text-slate-900 transition-all border border-slate-100"
                   >
                     <Server size={18} />
                   </Link>
                   <button 
                     onClick={() => setShowCollabModal(event)}
                     className="flex-1 py-4 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center gap-2 hover:bg-slate-100 hover:text-slate-900 transition-all border border-slate-100"
                   >
                     <Users size={18} />
                   </button>
                   <button 
                     onClick={() => { if (confirm('Irreversible: Delete entire studio experience?')) deleteMutation.mutate(event.id) }} 
                     className="w-14 py-4 rounded-2xl bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-red-100"
                   >
                     <Trash2 size={16} />
                   </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal - Refined */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="w-full max-w-2xl rounded-[4rem] p-16 bg-white shadow-3xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Initialize Event</h2>
                  <p className="text-base text-slate-400 font-medium">Configure your studio gallery intelligence.</p>
                </div>
                <button onClick={() => setShowModal(false)} className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form) }} className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Gallery Title</label>
                    <input 
                      value={form.name} 
                      onChange={(e) => setForm({ ...form, name: e.target.value })} 
                      className="w-full px-8 py-5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all" 
                      placeholder="e.g. Grand Horizon Gala 2024" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Concept Type</label>
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-8 py-5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-bold outline-none focus:border-primary capitalize">
                      {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Timeline</label>
                    <div className="relative">
                       <Clock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                       <input type="datetime-local" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} className="w-full pl-14 pr-8 py-5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-bold outline-none focus:border-primary" />
                    </div>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Venue Destination</label>
                    <div className="relative">
                       <MapPin size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                       <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full pl-14 pr-8 py-5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-bold outline-none focus:border-primary" placeholder="Mumbai International Convention Centre" />
                    </div>
                  </div>
                </div>

                <div className="pt-8">
                  <button 
                    type="submit" 
                    disabled={createMutation.isPending} 
                    className="w-full py-6 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] text-white shadow-2xl transition-all bg-slate-900 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                  >
                    {createMutation.isPending ? 'Provisioning...' : 'Provision Studio Experience'}
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

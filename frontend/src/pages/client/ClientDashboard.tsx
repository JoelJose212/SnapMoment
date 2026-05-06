import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Camera, ChevronRight, Plus, Clock, ShieldCheck, Star, Sparkles, Heart, MessageSquare } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { bookingsApi, chatApi, shortlistApi } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import { toast } from 'react-hot-toast'

export default function ClientDashboard() {
  const navigate = useNavigate()
  const { fullName } = useAuthStore()
  const { data: events, isLoading } = useQuery({
    queryKey: ['client-events'],
    queryFn: async () => {
      const res = await bookingsApi.myEvents()
      return res.data
    }
  })

  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await chatApi.getConversations()
      return res.data
    }
  })

  const { data: favorites } = useQuery({
    queryKey: ['shortlist'],
    queryFn: async () => {
      const res = await shortlistApi.get()
      return res.data
    }
  })

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Header Greeting */}
      <section className="mb-16">
         <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-5xl md:text-7xl font-black text-slate-900 leading-[0.85] tracking-tighter uppercase italic">
               Welcome back, <br /> <span className="gradient-text">{fullName?.split(' ')[0] || 'Henry'}.</span>
            </h2>
            <p className="text-slate-500 font-bold text-lg mt-4 max-w-xl">
               Manage your professional bookings and relive your most precious moments from the command center.
            </p>
         </motion.div>
      </section>

      {/* Stats Cluster */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
         {[
            { label: 'Active Pipeline', value: events?.length || 0, icon: Sparkles, color: 'text-primary', bg: 'bg-primary/5' },
            { label: 'Saved Artists', value: favorites?.length || 0, icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
            { label: 'Conversations', value: conversations?.length || 0, icon: MessageSquare, color: 'text-accent', bg: 'bg-accent/5' }
         ].map((stat, i) => (
            <motion.div 
              key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group"
            >
               <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700`} />
               <stat.icon className={`${stat.color} mb-8`} size={40} />
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{stat.label}</p>
               <h3 className="text-5xl font-black text-slate-900 mt-2 tracking-tighter">{stat.value}</h3>
            </motion.div>
         ))}
      </div>

      {/* Event Pipeline */}
      <section>
         <div className="flex items-center justify-between mb-12 px-2">
            <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Your Active Pipeline</h3>
            <Link to="/photographers" className="text-xs font-black uppercase tracking-widest text-primary hover:underline">Browse Talent Hub</Link>
         </div>

         {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               {[1,2].map(i => <div key={i} className="h-72 bg-slate-100 animate-pulse rounded-[3rem]" />)}
            </div>
         ) : events?.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {events.map((event: any, i: number) => {
                   const mainBooking = event.sub_events?.[0]
                   const artistName = mainBooking?.photographer_name || 'Selecting Artist...'
                   const bookingStatus = mainBooking?.status || 'pending'

                   return (
                     <motion.div 
                       key={event.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                       className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 group hover:shadow-2xl hover:-translate-y-1 transition-all relative overflow-hidden"
                     >
                        <div className="flex items-start justify-between mb-10">
                           <div className="h-16 w-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                              <Calendar size={28} />
                           </div>
                           <div className="flex flex-col items-end gap-2">
                             <span className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm ${
                               bookingStatus === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                               bookingStatus === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                               'bg-slate-50 text-slate-400 border-slate-100'
                             }`}>
                                {bookingStatus}
                             </span>
                           </div>
                        </div>
                        
                        <div onClick={() => navigate(`/client/events/${event.id}`)} className="cursor-pointer">
                          <h4 className="text-3xl font-black text-slate-950 mb-3 tracking-tighter">{event.event_title}</h4>
                          <div className="flex flex-wrap items-center gap-6 text-slate-400 text-sm font-bold mb-8">
                             <span className="flex items-center gap-2"><MapPin size={16} /> {event.district}, {event.state}</span>
                             <span className="flex items-center gap-2 text-primary italic font-black">@{artistName}</span>
                          </div>

                          {/* Mini Timeline */}
                          <div className="flex items-center gap-2 mb-10">
                             {[
                               { label: 'Sent', done: true },
                               { label: 'Review', done: bookingStatus !== 'pending' },
                               { label: 'Locked', done: bookingStatus === 'confirmed' }
                             ].map((step, idx) => (
                               <React.Fragment key={idx}>
                                 <div className="flex flex-col items-center gap-2">
                                   <div className={`h-2 w-2 rounded-full ${step.done ? 'bg-primary' : 'bg-slate-100'}`} />
                                   <span className={`text-[8px] font-black uppercase tracking-widest ${step.done ? 'text-slate-900' : 'text-slate-300'}`}>{step.label}</span>
                                 </div>
                                 {idx < 2 && <div className={`flex-1 h-[2px] mb-4 ${step.done ? 'bg-primary' : 'bg-slate-100'}`} />}
                               </React.Fragment>
                             ))}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-slate-50">
                           <button 
                             onClick={(e) => {
                               e.stopPropagation()
                               navigate(`/client/events/${event.id}`)
                             }}
                             className="flex-1 px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-95 transition-all"
                           >
                              Manage Hub
                           </button>
                           <button 
                             onClick={(e) => {
                               e.stopPropagation()
                               if (mainBooking?.photographer?.user_id) {
                                 navigate(`/client/messages?id=${mainBooking.photographer.user_id}`)
                               } else {
                                 toast.error('Artist communication bridge not yet established.')
                               }
                             }}
                             className="flex-1 px-8 py-4 bg-white border border-slate-100 text-slate-900 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                           >
                              <MessageSquare size={14} className="text-primary" /> Contact Artist
                           </button>
                        </div>

                        {bookingStatus === 'confirmed' && (
                           <button 
                             onClick={(e) => {
                               e.stopPropagation()
                               toast.success('Establishing Priority Signal with Support...')
                             }}
                             className="mt-6 w-full py-4 bg-amber-50/50 text-amber-600 rounded-[1.5rem] text-[9px] font-black uppercase tracking-[0.2em] hover:bg-amber-100 transition-all border border-amber-100/50"
                           >
                              Raise Disagreement
                           </button>
                        )}
                     </motion.div>
                   )
                })}
            </div>
         ) : (
            <div className="text-center py-32 bg-white rounded-[4rem] border-2 border-dashed border-slate-200 shadow-inner">
               <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 mx-auto mb-8 shadow-sm">
                  <Calendar size={40} />
               </div>
               <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter uppercase italic">No Events Found</h3>
               <p className="text-slate-500 font-bold mb-12 max-w-sm mx-auto">Your pipeline is empty. Start planning your masterpiece today with our elite photographers.</p>
               <Link 
                 to="/client/events/new"
                 className="px-10 py-5 rounded-[2rem] aurora-bg text-white font-black hover:scale-105 transition-all shadow-xl shadow-primary/30 inline-flex items-center gap-3"
               >
                  <Plus size={22} /> Initialize New Event
               </Link>
            </div>
         )}
      </section>
    </div>
  )
}

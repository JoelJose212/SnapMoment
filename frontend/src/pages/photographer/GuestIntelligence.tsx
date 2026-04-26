import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, Heart, Download, Search, 
  TrendingUp, Star, Filter, ArrowUpRight, 
  Calendar, Phone, ExternalLink, Image as ImageIcon,
  Activity
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { format } from 'date-fns'

export default function GuestIntelligence() {
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch Real Guests
  const { data: guests = [], isLoading: loadingGuests } = useQuery({
    queryKey: ['engagement-guests'],
    queryFn: async () => {
      const res = await api.get('/api/analytics/engagement/guests')
      return res.data
    }
  })

  // Fetch Top Photos
  const { data: topPhotos = [], isLoading: loadingPhotos } = useQuery({
    queryKey: ['engagement-top-photos'],
    queryFn: async () => {
      const res = await api.get('/api/analytics/engagement/top-photos')
      return res.data
    }
  })

  const filteredGuests = guests.filter((g: any) => 
    g.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    g.phone?.includes(searchTerm)
  )

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-end justify-between gap-8 px-2">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 mb-4 text-primary font-black text-[10px] uppercase tracking-[0.3em]"
          >
            <TrendingUp size={16} /> Guest Engagement Hub
          </motion.div>
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
            Gallery <span className="text-slate-400">Insights.</span>
          </h1>
          <p className="text-slate-500 font-medium mt-4 text-lg">Tracking interaction patterns for {guests.length} verified guests.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50">
           <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              <input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Guest Database..." 
                className="pl-12 pr-6 py-4 rounded-xl bg-slate-50 border-none text-sm font-bold outline-none w-64"
              />
           </div>
           <button className="p-4 rounded-xl bg-slate-900 text-white shadow-lg hover:scale-105 transition-all">
              <Filter size={18} />
           </button>
        </div>
      </div>

      {/* Top Performing Content */}
      <div className="bg-slate-900 rounded-[4rem] p-12 shadow-3xl relative overflow-hidden group">
         <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-1000" />
         
         <div className="flex items-center justify-between mb-12 relative z-10">
            <div>
               <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">Viral Content</h3>
               <p className="text-white/40 text-sm font-bold uppercase tracking-widest mt-1">Most Loved Moments</p>
            </div>
            <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest">
               <Star size={14} fill="currentColor" /> Premium Analytics
            </div>
         </div>

         {loadingPhotos ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4 text-white/20">
               <Activity size={40} className="animate-spin" />
               <p className="text-xs font-black uppercase tracking-widest">Analyzing engagement pulses...</p>
            </div>
         ) : topPhotos.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4 text-white/10 border-2 border-dashed border-white/5 rounded-3xl">
               <ImageIcon size={40} />
               <p className="text-xs font-black uppercase tracking-widest">No viral content detected yet</p>
            </div>
         ) : (
            <div className="grid md:grid-cols-3 gap-8 relative z-10">
               {topPhotos.slice(0, 3).map((photo: any, i: number) => (
                 <motion.div 
                   key={photo.id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: i * 0.1 }}
                   className="relative group/card"
                 >
                    <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-white/10 relative shadow-2xl">
                       <img src={photo.url} className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700" alt="Top" />
                       <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
                       
                       <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className="flex flex-col items-center">
                                <Heart size={18} className="text-primary mb-1" fill="currentColor" />
                                <span className="text-xs font-black text-white">{photo.likes || 0}</span>
                             </div>
                             <div className="flex flex-col items-center ml-2">
                                <Download size={18} className="text-accent mb-1" />
                                <span className="text-xs font-black text-white">{photo.downloads || 0}</span>
                             </div>
                          </div>
                          <a 
                            href={photo.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary transition-colors"
                          >
                             <ExternalLink size={16} />
                          </a>
                       </div>
                    </div>
                 </motion.div>
               ))}
            </div>
         )}
      </div>

      {/* Guest Directory */}
      <div className="bg-white rounded-[3.5rem] p-12 border border-slate-100 shadow-xl shadow-slate-200/40">
         <div className="flex items-center justify-between mb-12 px-2">
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Guest Interaction Log</h3>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
               <Users size={14} /> Total {guests.length} Records
            </div>
         </div>

         {loadingGuests ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-200">
               <Activity size={40} className="animate-spin" />
               <p className="text-xs font-black uppercase tracking-widest text-slate-400">Syncing Guest Intelligence...</p>
            </div>
         ) : (
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="border-b border-slate-50 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                        <th className="pb-6 pl-4">Guest Identity</th>
                        <th className="pb-6">Contact Key</th>
                        <th className="pb-6">Gallery Origin</th>
                        <th className="pb-6">Last Pulse</th>
                        <th className="pb-6 pr-4 text-right">Interactions</th>
                     </tr>
                  </thead>
                  <tbody>
                     {filteredGuests.map((guest: any, i: number) => (
                       <motion.tr 
                         key={guest.phone + i}
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         transition={{ delay: i * 0.05 }}
                         className="group hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                       >
                          <td className="py-6 pl-4">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/20 group-hover:text-primary transition-all font-black italic">
                                   {guest.name?.charAt(0) || '?'}
                                </div>
                                <span className="font-black text-slate-900 italic uppercase tracking-tighter">{guest.name || 'Anonymous Guest'}</span>
                             </div>
                          </td>
                          <td className="py-6">
                             <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                                <Phone size={14} className="text-slate-300" /> {guest.phone}
                             </div>
                          </td>
                          <td className="py-6">
                             <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                                <ImageIcon size={14} className="text-primary" /> {guest.event}
                             </div>
                          </td>
                          <td className="py-6">
                             <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                                <Calendar size={14} className="text-slate-300" /> {guest.accessed ? format(new Date(guest.accessed), 'MMM dd, HH:mm') : 'N/A'}
                             </div>
                          </td>
                          <td className="py-6 pr-4 text-right">
                             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 text-slate-900 font-black text-xs group-hover:bg-primary group-hover:text-white transition-all">
                                {guest.interactions || 0} <ArrowUpRight size={14} />
                             </div>
                          </td>
                       </motion.tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}
      </div>
    </div>
  )
}

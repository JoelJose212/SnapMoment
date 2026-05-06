import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { bookingsApi } from '../../lib/api'
import { 
  CalendarDays, MapPin, Clock, CheckCircle2, XCircle, 
  Info, Filter, ExternalLink, IndianRupee, MessageSquare,
  User, Mail, Phone, Map, X, Briefcase
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function PhotographerBookings() {
  const queryClient = useQueryClient()
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['photographerBookings'],
    queryFn: async () => {
      const res = await bookingsApi.getPhotographerBookings()
      return res.data
    }
  })

  const respondMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string, action: 'accept' | 'reject' }) => {
      return bookingsApi.respondToBooking(id, action)
    },
    onSuccess: (_, variables) => {
      toast.success(`Booking ${variables.action}ed successfully!`)
      queryClient.invalidateQueries({ queryKey: ['photographerBookings'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to respond to booking')
    }
  })

  // Fetch client details when a client is selected
  const { data: selectedClient, isLoading: isLoadingClient } = useQuery({
    queryKey: ['clientDetails', selectedClientId],
    queryFn: async () => {
      if (!selectedClientId) return null
      const res = await bookingsApi.getClientDetails(selectedClientId)
      return res.data
    },
    enabled: !!selectedClientId
  })

  if (isLoading) return (
    <div className="p-10 flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Scanning Incoming Orders...</p>
    </div>
  )

  const pendingBookings = bookings?.filter((b: any) => b.status === 'pending') || []
  const activeBookings = bookings?.filter((b: any) => b.status === 'confirmed') || []
  const disputedBookings = bookings?.filter((b: any) => b.status === 'disputed') || []
  const otherBookings = bookings?.filter((b: any) => 
    !['pending', 'confirmed', 'disputed'].includes(b.status)
  ) || []

  return (
    <div className="p-10 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter mb-2">Booking Orders</h1>
          <p className="text-slate-500 font-medium">Manage your event inquiries and confirm your schedule.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-primary/10 rounded-xl border border-primary/20">
             <span className="text-[10px] font-black text-primary uppercase tracking-widest">New Requests: {pendingBookings.length}</span>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        {/* Pending Section */}
        {pendingBookings.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
               <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
               <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">Awaiting Response</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {pendingBookings.map((booking: any) => (
                <motion.div 
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl hover:shadow-primary/5 transition-all duration-500"
                >
                  <div className="p-8 flex flex-col lg:flex-row gap-8 lg:items-center">
                    {/* Event Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">Pending Review</span>
                        <span className="text-xs text-slate-400 font-bold tracking-tight">Received {format(new Date(booking.created_at), 'MMM d, h:mm a')}</span>
                      </div>
                      
                      <h3 className="text-2xl font-black text-slate-900 mb-2 italic uppercase tracking-tighter">{booking.sub_event_name}</h3>
                      
                      <div className="flex flex-wrap gap-6 mt-4">
                        <div className="flex items-center gap-2 text-slate-500">
                          <CalendarDays size={18} className="text-primary" />
                          <span className="text-sm font-bold">{format(new Date(booking.event_date), 'EEEE, MMMM do, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <Clock size={18} className="text-primary" />
                          <span className="text-sm font-bold">{booking.start_time.substring(0, 5)} onwards</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <IndianRupee size={18} className="text-emerald-500" />
                          <span className="text-sm font-black text-slate-900 italic">₹{booking.agreed_price?.toLocaleString() || '0'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 lg:pl-8 lg:border-l border-slate-100">
                      <button 
                        onClick={() => respondMutation.mutate({ id: booking.id, action: 'reject' })}
                        className="flex-1 lg:flex-none px-8 py-4 rounded-2xl bg-slate-50 text-slate-400 font-black text-sm uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all border border-transparent hover:border-red-100"
                      >
                        Decline
                      </button>
                      <button 
                        onClick={() => respondMutation.mutate({ id: booking.id, action: 'accept' })}
                        className="flex-1 lg:flex-none px-10 py-4 rounded-2xl bg-slate-900 text-white font-black text-sm uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-slate-200"
                      >
                        Accept Event
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Disputed Section */}
        {disputedBookings.length > 0 && (
          <section className="bg-amber-50/50 p-8 rounded-[3rem] border border-amber-100">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
               <h2 className="text-sm font-black uppercase tracking-[0.3em] text-red-500">Action Required: Disputed Bookings</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {disputedBookings.map((booking: any) => (
                <motion.div 
                  key={booking.id}
                  className="bg-white rounded-[2rem] border border-red-100 shadow-sm overflow-hidden"
                >
                  <div className="p-8 flex flex-col lg:flex-row gap-8 lg:items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100">Dispute Raised</span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 mb-2 italic uppercase tracking-tighter">{booking.sub_event_name}</h3>
                      <p className="text-xs text-slate-500 font-medium max-w-md">The client has raised a disagreement regarding this booking. Please contact the client or support to resolve the issue.</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                       <Link 
                         to={`/photographer/chat?id=${booking.client_user_id || ''}`}
                         className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                       >
                         <MessageSquare size={14} /> Open Concierge Chat
                       </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Confirmed Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
             <div className="w-2 h-2 rounded-full bg-emerald-500" />
             <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">Upcoming Schedule</h2>
          </div>

          {activeBookings.length === 0 ? (
            <div className="py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center px-6">
               <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center shadow-sm mb-4">
                  <CalendarDays className="text-slate-200" size={32} />
               </div>
               <p className="text-slate-400 font-bold italic">No confirmed bookings yet.</p>
               <p className="text-slate-300 text-xs mt-1">Pending requests will appear here once accepted.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
               {activeBookings.map((booking: any) => (
                 <motion.div 
                   key={booking.id}
                   className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group"
                 >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl -translate-y-1/2 translate-x-1/2" />
                    
                    <div className="flex justify-between items-start mb-6">
                       <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">Confirmed</div>
                       <button className="text-slate-300 hover:text-primary transition-colors">
                          <ExternalLink size={18} />
                       </button>
                    </div>

                    <h4 className="text-xl font-black text-slate-900 mb-4 italic uppercase tracking-tighter">{booking.sub_event_name}</h4>
                    
                    <div className="space-y-4">
                       <div className="flex items-center gap-3 text-slate-500">
                          <CalendarDays size={16} />
                          <span className="text-xs font-bold">{format(new Date(booking.event_date), 'MMM d, yyyy')}</span>
                       </div>
                       <div className="flex items-center gap-3 text-slate-500">
                          <IndianRupee size={16} />
                          <span className="text-xs font-black text-slate-900 italic">₹{booking.agreed_price?.toLocaleString() || '0'}</span>
                       </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                       <button 
                         onClick={() => {
                           if (confirm('Are you sure you want to cancel this professional commitment? This action is irreversible.')) {
                             respondMutation.mutate({ id: booking.id, action: 'reject' })
                           }
                         }}
                         className="text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-red-500 transition-colors"
                       >
                         Cancel Commitment
                       </button>
                       <button 
                         onClick={() => setSelectedClientId(booking.client_id)}
                         className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                       >
                         View Client
                       </button>
                    </div>
                 </motion.div>
               ))}
            </div>
          )}
        </section>

        {/* History Section */}
        {otherBookings.length > 0 && (
          <section className="opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Past & Other</h2>
            <div className="space-y-4">
              {otherBookings.map((booking: any) => (
                <div key={booking.id} className="p-6 bg-white rounded-3xl border border-slate-100 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                         {booking.status === 'rejected' ? <XCircle size={20} /> : <CheckCircle2 size={20} />}
                      </div>
                      <div>
                         <h5 className="font-black italic uppercase text-sm">{booking.sub_event_name}</h5>
                         <p className="text-[10px] font-bold text-slate-400">{format(new Date(booking.event_date), 'MMM d, yyyy')}</p>
                      </div>
                   </div>
                   <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                     booking.status === 'rejected' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                   }`}>
                     {booking.status}
                   </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Client Details Modal */}
      <AnimatePresence>
        {selectedClientId && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedClientId(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[500px] bg-white rounded-[3rem] z-[110] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <User size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Client Profile</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Identity Verified</p>
                  </div>
                </div>
                <button onClick={() => setSelectedClientId(null)} className="w-10 h-10 rounded-full hover:bg-white flex items-center justify-center text-slate-400 transition-all">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-8">
                {isLoadingClient ? (
                  <div className="py-12 flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin mb-3" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fetching Client Data...</p>
                  </div>
                ) : selectedClient ? (
                  <>
                    {/* Header Info */}
                    <div className="flex items-center gap-6">
                       <div className="w-20 h-20 rounded-3xl bg-slate-100 overflow-hidden border-2 border-white shadow-sm">
                          {selectedClient.profile_photo_url ? (
                            <img src={selectedClient.profile_photo_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-200">
                               <User size={32} />
                            </div>
                          )}
                       </div>
                       <div>
                          <h3 className="text-2xl font-black text-slate-900 italic tracking-tight">{selectedClient.full_name}</h3>
                          <p className="text-sm font-bold text-slate-400">{selectedClient.email}</p>
                       </div>
                    </div>

                    {/* Contact Grid */}
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="flex items-center gap-2 text-primary mb-1">
                             <Phone size={14} />
                             <span className="text-[9px] font-black uppercase tracking-widest">Direct Line</span>
                          </div>
                          <p className="font-bold text-slate-900">{selectedClient.phone || 'Not Provided'}</p>
                       </div>
                       <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="flex items-center gap-2 text-primary mb-1">
                             <Map size={14} />
                             <span className="text-[9px] font-black uppercase tracking-widest">Location</span>
                          </div>
                          <p className="font-bold text-slate-900 truncate">{selectedClient.city}, {selectedClient.state}</p>
                       </div>
                    </div>

                    {/* Meta Info */}
                    <div className="space-y-4 pt-4 border-t border-slate-50">
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Since</span>
                          <span className="text-xs font-bold text-slate-900">{format(new Date(selectedClient.created_at), 'MMMM yyyy')}</span>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Interest</span>
                          <span className="text-xs font-bold text-slate-900 capitalize">{selectedClient.referral_source || 'Direct Search'}</span>
                       </div>
                    </div>

                    <div className="pt-4">
                       <Link 
                         to={`/photographer/chat?id=${selectedClient.user_id}`}
                         onClick={() => setSelectedClientId(null)}
                         className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-primary transition-all shadow-xl shadow-slate-200"
                       >
                         <MessageSquare size={18} /> Initiate Concierge Chat
                       </Link>
                    </div>
                  </>
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-slate-400 font-bold">Failed to load client details.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Star, MapPin, ShieldCheck, 
  CalendarDays, IndianRupee, MessageSquare, 
  ChevronRight, Share2, Heart, Camera, X, CheckCircle2,
  Sparkles, AlertCircle, ArrowUpRight, UserPlus, LogIn,
  User, Mail, Phone, Globe
} from 'lucide-react'
import { bookingsApi, chatApi, shortlistApi } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

export default function PhotographerProfilePublic() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { role, token } = useAuthStore()
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showNoEventModal, setShowNoEventModal] = useState(false)
  const [showChatModal, setShowChatModal] = useState(false)
  const [selectedSpec, setSelectedSpec] = useState<any>(null)
  const [bookingDate, setBookingDate] = useState('')

  const isLoggedIn = !!token
  const isClient = role === 'client'

  const { data: photographer, isLoading } = useQuery({
    queryKey: ['photographer', id],
    queryFn: async () => {
      const res = await bookingsApi.getPhotographer(id!)
      return res.data
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, 
    gcTime: 10 * 60 * 1000, 
  })

  const { data: clientEvents } = useQuery({
    queryKey: ['clientEvents'],
    queryFn: async () => {
      const res = await bookingsApi.myEvents()
      return res.data
    },
    enabled: isLoggedIn && isClient,
    retry: false
  })

  const { data: favorites } = useQuery({
    queryKey: ['shortlist'],
    queryFn: async () => {
      const res = await shortlistApi.get()
      return res.data
    },
    enabled: isLoggedIn && isClient
  })

  const isShortlisted = favorites?.some((f: any) => f.photographer_id === id)
  const queryClient = useQueryClient()

  const toggleShortlist = useMutation({
    mutationFn: async () => {
      if (!id) return
      if (isShortlisted) {
        return shortlistApi.remove(id)
      } else {
        return shortlistApi.add(id)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shortlist'] })
      toast.success(isShortlisted ? 'Removed from shortlist' : 'Added to shortlist', {
        icon: isShortlisted ? '🗑️' : '❤️'
      })
    },
    onError: () => {
      toast.error('Please login to shortlist artists')
    }
  })

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">Retrieving Portfolio...</p>
      </div>
    </div>
  )

  if (!photographer) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 text-center">
      <div>
        <h2 className="text-3xl font-black mb-4 uppercase italic text-white">Photographer Not Found</h2>
        <Link to="/photographers" className="text-primary font-bold hover:underline">Back to Search</Link>
      </div>
    </div>
  )

  const handleBookingSubmit = async () => {
    if (!selectedSpec || !bookingDate) {
      toast.error('Please select a service and date')
      return
    }

    if (!isLoggedIn || !isClient || !clientEvents || clientEvents.length === 0) {
      setShowNoEventModal(true)
      return
    }

    try {
      const targetEvent = clientEvents[0] 
      await bookingsApi.book(targetEvent.id, {
        sub_event_name: selectedSpec.sub_category,
        event_date: bookingDate,
        start_time: "10:00:00", 
        photographer_id: id,
        specialization_id: selectedSpec.id,
        package_id: null
      })
      
      toast.success(`Booking request sent for ${selectedSpec.sub_category}!`, {
        duration: 5000,
        icon: '🚀'
      })
      setShowBookingModal(false)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to send booking request')
    }
  }

  const minPrice = photographer.starting_price > 0 
    ? photographer.starting_price 
    : (photographer.specializations?.length 
        ? Math.min(...photographer.specializations.map((s: any) => s.base_price))
        : 25000)

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-primary selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link to={isClient ? "/client/discover" : "/photographers"} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">
            <ArrowLeft size={18} /> Back to Search
          </Link>
          <div className="flex items-center gap-4">
             <button 
               onClick={() => {
                 navigator.clipboard.writeText(window.location.href)
                 toast.success('Profile link copied! 🔗')
               }}
               className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-all border border-slate-100 text-slate-400"
             >
                <Share2 size={18} />
             </button>
              <button 
                onClick={() => toggleShortlist.mutate()}
                className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all border ${
                  isShortlisted 
                    ? 'bg-rose-50 border-rose-100 text-rose-500 shadow-sm' 
                    : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'
                }`}
              >
                <Heart size={18} className={isShortlisted ? 'fill-rose-500' : ''} />
              </button>
          </div>
        </div>
      </nav>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBookingModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[3rem] overflow-hidden shadow-2xl"
            >
              <div className="p-10 text-slate-900">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter">Reserve Your Date</h2>
                  <button onClick={() => setShowBookingModal(false)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-8">
                  {/* Service Selection */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Select Specialized Service</label>
                    <div className="grid grid-cols-1 gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                      {photographer.specializations?.map((spec: any) => (
                        <button 
                          key={spec.id}
                          onClick={() => setSelectedSpec(spec)}
                          className={`w-full p-5 rounded-2xl border text-left transition-all ${
                            selectedSpec?.id === spec.id 
                            ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                            : 'border-slate-100 hover:border-slate-200 bg-white'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-[10px] font-bold text-primary uppercase mb-1">{spec.category}</p>
                              <h4 className="font-black italic">{spec.sub_category}</h4>
                            </div>
                            <div className="font-black italic text-primary">₹{spec.base_price?.toLocaleString() || '0'}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Event Date</label>
                    <div className="relative">
                      <CalendarDays className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input 
                        type="date" 
                        value={bookingDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full pl-14 pr-5 py-5 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary outline-none font-bold text-slate-900" 
                      />
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-bold text-slate-500">Base Service Fee</span>
                      <span className="font-black">₹{selectedSpec?.base_price?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                      <span className="text-lg font-black italic">Total Estimate</span>
                      <span className="text-2xl font-black text-primary italic">₹{selectedSpec?.base_price?.toLocaleString() || '0'}</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleBookingSubmit}
                    disabled={!selectedSpec || !bookingDate}
                    className="w-full py-6 rounded-2xl aurora-bg text-white font-black text-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:hover:scale-100"
                  >
                    Confirm Booking Request
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Action Required Modal (No Event / No Auth) */}
      <AnimatePresence>
        {showNoEventModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNoEventModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-lg bg-white rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/20"
            >
              <div className="p-12 text-center">
                <div className="w-24 h-24 rounded-[2.5rem] bg-primary/10 flex items-center justify-center text-primary mx-auto mb-10 relative">
                   <div className="absolute inset-0 rounded-[2.5rem] bg-primary/20 animate-ping opacity-20" />
                   {isLoggedIn ? <Sparkles size={40} /> : <UserPlus size={40} />}
                </div>

                <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-6">
                  {isLoggedIn ? "Start Your" : "Join the"}<br/>
                  <span className="text-primary">{isLoggedIn ? "Event Journey." : "Elite Circle."}</span>
                </h2>

                <p className="text-slate-500 font-medium text-lg leading-relaxed mb-12">
                  {isLoggedIn 
                    ? "To book a master photographer, you first need an active event in your schedule. Let's create one now." 
                    : "Experience the pinnacle of event photography. Login or create an account to reserve your studio today."}
                </p>

                <div className="space-y-4">
                  {isLoggedIn && isClient ? (
                    <button 
                      onClick={() => navigate('/client/events/new')}
                      className="w-full py-6 rounded-3xl aurora-bg text-white font-black text-lg shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      Create My First Event <ArrowUpRight size={20} />
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <button 
                        onClick={() => navigate('/signup')}
                        className="w-full py-6 rounded-3xl aurora-bg text-white font-black text-lg shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
                      >
                        Create My First Event <ArrowUpRight size={20} />
                      </button>
                      <button 
                        onClick={() => navigate('/login')}
                        className="w-full py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-primary transition-all"
                      >
                        Already have an account? Login
                      </button>
                    </div>
                  )}

                  <button 
                    onClick={() => setShowNoEventModal(false)}
                    className="w-full py-5 rounded-2xl bg-white border border-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-slate-50 transition-all"
                  >
                    I'll do it later
                  </button>
                </div>
              </div>

              {/* Decorative Glow */}
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-primary/10 blur-[80px] rounded-full" />
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-accent/10 blur-[80px] rounded-full" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <section className="relative pt-32 pb-20 overflow-hidden">
         <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row gap-16">
               {/* Left: Photos & Bio */}
                <div className="flex-1">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-[650px] rounded-[3.5rem] overflow-hidden mb-12 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] relative border border-slate-100 group"
                  >
                    {photographer.portfolio_urls && photographer.portfolio_urls.length > 0 ? (
                      <img 
                        src={photographer.portfolio_urls[0]} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                        alt={photographer.business_name}
                      />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-slate-50" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-slate-300">
                           <Camera size={48} />
                           <p className="font-black uppercase tracking-widest text-xs">Portfolio is currently empty</p>
                        </div>
                      </>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-60" />
                  </motion.div>

                  <div className="max-w-3xl">
                    <h2 className="text-5xl font-black mb-8 uppercase italic tracking-tighter text-slate-900 leading-none">About the <br/><span className="text-primary">Creative Studio.</span></h2>
                    <p className="text-xl text-slate-500 leading-relaxed mb-12 font-medium">
                      {photographer.bio || "This photographer profile is currently being finalized. Soon you will see their full portfolio, equipment list, and detailed reviews here."}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-24">
                       {photographer.portfolio_urls?.slice(1, 4).map((url: string, i: number) => (
                          <motion.div 
                            key={i} 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="aspect-[4/3] rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:border-primary/50 transition-colors"
                          >
                             <img src={url} className="w-full h-full object-cover" alt="Portfolio" />
                          </motion.div>
                       ))}
                    </div>

                    {/* Services & Pricing Section */}
                    <div className="mb-20">
                      <div className="flex items-center gap-4 mb-10">
                        <div className="h-px flex-1 bg-slate-100" />
                        <h2 className="text-sm font-black uppercase tracking-[0.4em] text-slate-300">Services & Pricing</h2>
                        <div className="h-px flex-1 bg-slate-100" />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {photographer.specializations && photographer.specializations.length > 0 ? (
                          photographer.specializations.map((spec: any) => (
                            <div key={spec.id} className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-primary/20 transition-all group">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">{spec.category}</p>
                                  <h4 className="text-xl font-black text-slate-900 mb-2 italic tracking-tight">{spec.sub_category}</h4>
                                  {spec.description && <p className="text-xs text-slate-400 font-bold leading-relaxed">{spec.description}</p>}
                                </div>
                                <div className="text-right">
                                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Starting At</p>
                                  <div className="flex items-center gap-1 text-slate-900 font-black italic">
                                    <IndianRupee size={14} className="text-primary" />
                                    <span className="text-2xl tracking-tighter">{spec.base_price?.toLocaleString() || '0'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                            <p className="text-slate-400 font-bold italic">No specific service pricing listed yet.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
               </div>

               {/* Right: Booking Sidebar */}
               <aside className="lg:w-[450px] shrink-0 h-fit sticky top-32">
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-10 rounded-[3rem] relative overflow-hidden bg-white border border-slate-100 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)]"
                  >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 blur-[50px] -translate-y-1/2 translate-x-1/2" />
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-5 mb-10">
                         <div className="h-20 w-20 rounded-[1.8rem] bg-primary/5 flex items-center justify-center text-primary font-black text-2xl border border-primary/10 uppercase italic">
                            {photographer.business_name?.substring(0, 2) || 'PS'}
                         </div>
                         <div>
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">{photographer.business_name}</h3>
                            <div className="flex items-center gap-3 mt-2">
                                <div className="flex items-center gap-1">
                                   <Star size={14} className="fill-amber-400 text-amber-400" />
                                   <span className="font-black text-sm text-slate-900">{photographer.rating?.toFixed(1) || '5.0'}</span>
                                </div>
                                <span className="w-1 h-1 rounded-full bg-slate-200" />
                                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{photographer.total_bookings || 0} Events</span>
                             </div>
                          </div>
                      </div>

                      {/* Studio Details & Contact */}
                      <div className="space-y-6 mb-10">
                         <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
                            <div className="flex items-center gap-4 mb-4">
                               <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary">
                                  <User size={18} />
                               </div>
                               <div>
                                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Studio Head</p>
                                  <p className="font-black text-slate-900">{photographer.user?.full_name || 'N/A'}</p>
                               </div>
                            </div>
                            
                            <div className="space-y-4 pt-4 border-t border-slate-200/50">
                               <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400">
                                     <Mail size={18} />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Direct Email</p>
                                     <p className="font-black text-slate-900 truncate text-sm">{photographer.user?.email || 'N/A'}</p>
                                  </div>
                               </div>
                               
                               <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400">
                                     <Phone size={18} />
                                  </div>
                                  <div>
                                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Direct Line</p>
                                     <p className="font-black text-slate-900 text-sm">{photographer.phone || 'N/A'}</p>
                                  </div>
                               </div>

                               {photographer.website && (
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400">
                                       <Globe size={18} />
                                    </div>
                                    <div>
                                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Studio Website</p>
                                       <a href={photographer.website.startsWith('http') ? photographer.website : `https://${photographer.website}`} target="_blank" rel="noopener noreferrer" className="font-black text-primary text-sm hover:underline">
                                          {photographer.website}
                                       </a>
                                    </div>
                                 </div>
                               )}
                            </div>
                         </div>

                         <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:bg-white hover:border-primary/20 transition-all">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Service Area</span>
                            <span className="font-black flex items-center gap-2 italic text-sm text-slate-900"><MapPin size={16} className="text-primary" /> {photographer.service_states?.[0] || 'Across India'}</span>
                         </div>
                         <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:bg-white hover:border-primary/20 transition-all">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Base Rate</span>
                            <span className="text-2xl font-black text-primary italic tracking-tighter">₹{minPrice?.toLocaleString() || '0'}</span>
                         </div>
                      </div>

                      <button 
                        onClick={() => setShowBookingModal(true)}
                        className="w-full py-6 rounded-2xl aurora-bg text-white font-black text-xl shadow-xl shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all mb-4"
                      >
                        Proceed to Booking
                      </button>
                      
                      <button 
                        onClick={() => setShowChatModal(true)}
                        className="w-full py-5 rounded-2xl bg-white border border-slate-100 font-black flex items-center justify-center gap-3 hover:bg-slate-50 transition-all text-slate-500 text-sm uppercase tracking-widest"
                      >
                        <MessageSquare size={18} className="text-primary" /> Chat with Studio
                      </button>

                      <p className="text-center text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 mt-10">
                        Secure instant booking via SnapMoment
                      </p>
                    </div>
                  </motion.div>
               </aside>
            </div>
         </div>
       </section>

       {/* Chat Modal Overlay */}
       <AnimatePresence>
         {showChatModal && (
           <ChatOverlay 
             photographer={photographer} 
             onClose={() => setShowChatModal(false)} 
           />
         )}
       </AnimatePresence>
    </div>
  )
}

function ChatOverlay({ photographer, onClose }: any) {
  const { token, userId, role } = useAuthStore()
  const [message, setMessage] = useState('')
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const isLoggedIn = !!token
  const isClient = role === 'client'

  const fetchHistory = async () => {
    if (!isLoggedIn || !photographer.user_id) return
    try {
      const res = await chatApi.getHistory(photographer.user_id)
      setHistory(res.data)
    } catch (err) {
      console.error('Failed to fetch chat history')
    }
  }

  useEffect(() => {
    fetchHistory()
    const interval = setInterval(fetchHistory, 5000)
    return () => clearInterval(interval)
  }, [photographer.user_id])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [history])

  const handleSend = async () => {
    if (!message.trim() || !isLoggedIn) return
    setIsLoading(true)
    try {
      await chatApi.sendMessage({
        receiver_id: photographer.user_id,
        content: message
      })
      setMessage('')
      fetchHistory()
    } catch (err) {
      toast.error('Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center sm:justify-end sm:p-12">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
      />
      <motion.div 
        initial={{ opacity: 0, y: 100, x: 0 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="relative w-full sm:w-[450px] h-[600px] bg-white sm:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Chat Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black italic">
              {photographer.business_name?.substring(0, 2)}
            </div>
            <div>
              <h3 className="font-black italic text-slate-900 tracking-tighter uppercase">{photographer.business_name}</h3>
              <p className="text-[10px] font-bold text-emerald-500 uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active Now
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/30" ref={scrollRef}>
          {!isLoggedIn ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
               <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                  <LogIn size={32} />
               </div>
               <h4 className="font-black uppercase italic tracking-tighter text-slate-900 mb-2 text-xl">Exclusive Conversation</h4>
               <p className="text-sm text-slate-400 font-medium mb-6">Please login or signup first... then only you can have a private chat with this master studio.</p>
               <div className="flex flex-col gap-3 w-full">
                  <Link to="/login" className="px-8 py-3 rounded-xl aurora-bg text-white font-black text-xs uppercase tracking-widest shadow-lg text-center">Login to Chat</Link>
                  <Link to="/signup" className="px-8 py-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all text-center">Create Account</Link>
               </div>
            </div>
          ) : history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-300">
               <MessageSquare size={48} strokeWidth={1} className="mb-4" />
               <p className="font-black uppercase tracking-[0.2em] text-[10px]">Start the conversation...</p>
            </div>
          ) : (
            history.map((msg, i) => {
              const isMe = msg.sender_id === userId
              return (
                <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-[1.5rem] shadow-sm font-medium text-sm ${
                    isMe 
                      ? 'bg-primary text-white rounded-tr-none' 
                      : 'bg-white text-slate-900 border border-slate-100 rounded-tl-none'
                  }`}>
                    {msg.content}
                    <div className={`text-[8px] mt-1 font-bold uppercase opacity-60 ${isMe ? 'text-right' : 'text-left'}`}>
                       {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Chat Input */}
        {isLoggedIn && (
          <div className="p-6 border-t border-slate-100 bg-white">
            <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-2 pl-5 border border-slate-100 focus-within:border-primary/30 transition-all">
              <input 
                type="text" 
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 bg-transparent border-none outline-none font-bold text-slate-900 placeholder:text-slate-300"
              />
              <button 
                onClick={handleSend}
                disabled={!message.trim() || isLoading}
                className="w-12 h-12 rounded-xl aurora-bg text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                <ArrowUpRight size={24} />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

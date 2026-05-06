import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Check, ChevronRight, ChevronLeft, Calendar, 
  MapPin, Sparkles, Camera, Users, Clock, 
  Info, Map, Target, Zap, Star
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { bookingsApi, clientApi } from '../../lib/api'
import { toast } from 'react-hot-toast'

const STEPS = [
  { id: 'category', title: 'Occasion', icon: Sparkles },
  { id: 'details', title: 'Details', icon: Info },
  { id: 'location', title: 'Venue', icon: MapPin },
  { id: 'artist', title: 'Artist', icon: Camera },
  { id: 'summary', title: 'Initialize', icon: Zap }
]

const CATEGORIES = [
  { id: 'wedding', title: 'Wedding', desc: 'Haldi, Shadi, Reception & more', icon: Users, color: 'from-pink-500 to-rose-500' },
  { id: 'birthday', title: 'Birthday', desc: 'Celebrations & memories', icon: Sparkles, color: 'from-amber-400 to-orange-500' },
  { id: 'corporate', title: 'Corporate', desc: 'Events, Seminars & Branding', icon: Camera, color: 'from-blue-500 to-cyan-500' },
  { id: 'portrait', title: 'Portrait', desc: 'Personal or Couple shoots', icon: Target, color: 'from-emerald-500 to-teal-600' }
]

const FALLBACK_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana", 
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", 
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", 
  "Uttar Pradesh", "Uttarakhand", "West Bengal"
]

const WEDDING_SUB_EVENTS = [
  "Haldi", "Mehandi", "Sangeet", "Barat", "Shadi", "Reception", "Vidaai", "Ring Ceremony"
]

export default function EventCreationWizard() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    event_category: 'wedding',
    event_title: '',
    state: '',
    district: '',
    venue_name: '',
    venue_address: '',
    total_budget: 50000,
    sub_events: [] as string[],
    photographer_id: '',
    event_date: '',
    start_time: '10:00:00',
    agreed_to_terms: false
  })

  const [states, setStates] = useState<string[]>(FALLBACK_STATES)
  const [districts, setDistricts] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [availablePhotographers, setAvailablePhotographers] = useState<any[]>([])

  useEffect(() => {
    clientApi.getProfile()
      .then(res => {
        if (res.data) {
          setFormData(prev => ({
            ...prev,
            state: res.data.state || prev.state,
            district: res.data.district || prev.district
          }))
        }
      })
      .catch(err => console.log("Profile not pre-populated", err))
  }, [])

  useEffect(() => {
    bookingsApi.states()
      .then(res => {
        if (res.data && res.data.length > 0) setStates(res.data)
      })
      .catch(err => {
        console.error("Using fallback states due to API error:", err)
      })
  }, [])

  useEffect(() => {
    if (formData.state) {
      bookingsApi.districts(formData.state)
        .then(res => setDistricts(res.data))
        .catch(err => console.error("Failed to load districts:", err))
    }
  }, [formData.state])

  // Fetch photographers when on the artist selection step
  useEffect(() => {
    if (currentStep === 3) {
      setIsLoading(true)
      // The user wants to see artists from their state
      bookingsApi.searchPhotographers({ 
        state: formData.state, 
        // district: formData.district, // Broadening to state level as requested
        event_category: formData.event_category 
      })
        .then(res => setAvailablePhotographers(res.data))
        .catch(err => console.error("Failed to load artists:", err))
        .finally(() => setIsLoading(false))
    }
  }, [currentStep, formData.state, formData.district, formData.event_category])

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    if (!formData.event_title) {
      toast.error('Please provide a title for your event.')
      setCurrentStep(1) // Go to Details step
      return
    }
    if (!formData.state || !formData.district) {
      toast.error('Please specify the event location.')
      setCurrentStep(2) // Go to Venue step
      return
    }
    if (!formData.photographer_id) {
      toast.error('Please select an artist for your event.')
      setCurrentStep(3) // Go to Artist step
      return
    }
    if (!formData.event_date) {
      toast.error('Please select a date for your event.')
      setCurrentStep(3) // Go to Artist step
      return
    }
    if (!formData.agreed_to_terms) {
      toast.error('Please agree to the Elite Service Agreement.')
      return
    }
    
    setIsLoading(true)
    try {
      const payload = {
        ...formData,
        photographer_id: formData.photographer_id,
        event_date: formData.event_date,
        start_time: formData.start_time,
        agreed_to_terms: formData.agreed_to_terms
      }
      await bookingsApi.createEvent(payload)
      toast.success('Elite Hub Initialized Successfully!')
      navigate('/client/dashboard')
    } catch (err: any) {
      console.error("Initialization Sync Error:", err)
      const errorData = err.response?.data
      let errorMessage = 'Initialization failed. Ensure all fields are valid.'
      
      if (errorData) {
        if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail
        } else if (Array.isArray(errorData.detail)) {
          // Handle FastAPI validation error list
          const firstError = errorData.detail[0]
          errorMessage = `${firstError.loc.join('.')}: ${firstError.msg}`
        } else if (errorData.message) {
          errorMessage = errorData.message
        }
      } else if (err.message) {
        errorMessage = err.message
      }
      
      toast.error(errorMessage, { duration: 5000 })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] selection:bg-primary/20 flex flex-col font-sans">
      {/* Immersive Header */}
      <nav className="h-24 glass sticky top-0 z-50 flex items-center justify-between px-12 border-b border-slate-100">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
               <Camera size={20} />
            </div>
            <h1 className="text-2xl font-black italic tracking-tighter uppercase text-slate-900">SnapMoment <span className="text-primary">Planner</span></h1>
         </div>
         <button onClick={() => navigate(-1)} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Exit Wizard</button>
      </nav>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-16 flex flex-col items-center">
        {/* Elite Step Progress */}
        <div className="flex items-center justify-center gap-4 md:gap-12 mb-20 w-full">
          {STEPS.map((step, i) => (
            <div key={step.id} className="flex items-center gap-4 group">
               <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 ${
                 i <= currentStep 
                   ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200' 
                   : 'bg-white border-slate-100 text-slate-300'
               }`}>
                  <step.icon size={24} />
               </div>
               <div className="hidden lg:block">
                  <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${i <= currentStep ? 'text-slate-900' : 'text-slate-300'}`}>{step.title}</p>
               </div>
               {i < STEPS.length - 1 && <div className={`hidden md:block w-12 h-0.5 rounded-full ${i < currentStep ? 'bg-slate-900' : 'bg-slate-100'}`} />}
            </div>
          ))}
        </div>

        {/* Wizard Vessel */}
        <div className="w-full relative min-h-[600px]">
           <AnimatePresence mode="wait">
              {currentStep === 0 && (
                <motion.div
                  key="cat" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  className="space-y-12"
                >
                  <div className="text-center max-w-2xl mx-auto">
                     <h2 className="text-6xl font-black text-slate-950 tracking-tighter uppercase italic mb-6">Choose Your <br /> <span className="text-primary">Masterpiece.</span></h2>
                     <p className="text-slate-500 font-medium text-lg italic">Select the nature of your event to unlock specialized photography clusters.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {CATEGORIES.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => { setFormData({...formData, event_category: cat.id}); handleNext(); }}
                          className={`group p-10 rounded-[3rem] border-2 text-left transition-all duration-500 relative overflow-hidden ${
                            formData.event_category === cat.id 
                              ? 'border-slate-900 bg-white shadow-2xl shadow-slate-200' 
                              : 'border-slate-100 bg-white hover:border-slate-200'
                          }`}
                        >
                           <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity`} />
                           <div className={`h-16 w-16 rounded-3xl flex items-center justify-center mb-8 shadow-inner transition-transform group-hover:scale-110 ${
                             formData.event_category === cat.id ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400'
                           }`}>
                              <cat.icon size={32} />
                           </div>
                           <h3 className="text-3xl font-black text-slate-950 mb-3 tracking-tighter">{cat.title}</h3>
                           <p className="text-slate-500 font-bold text-sm tracking-tight">{cat.desc}</p>
                        </button>
                     ))}
                  </div>
                </motion.div>
              )}

              {currentStep === 1 && (
                <motion.div
                  key="details" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  className="space-y-12"
                >
                  <div className="text-center">
                     <h2 className="text-6xl font-black text-slate-950 tracking-tighter uppercase italic mb-6">Define The <span className="text-primary">Legacy.</span></h2>
                     <p className="text-slate-500 font-medium text-lg italic">Give your story a title and select the chapters (sub-events).</p>
                  </div>
                  <div className="bg-white p-12 md:p-16 rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/50 space-y-12">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 block ml-2">Story Title</label>
                        <input 
                          type="text" placeholder="e.g. The Eternal Union: Rohan & Simran"
                          className="w-full bg-slate-50 border-2 border-slate-50 p-8 rounded-3xl text-2xl font-black text-slate-900 focus:bg-white focus:border-primary/20 transition-all outline-none tracking-tight"
                          value={formData.event_title}
                          onChange={e => setFormData({...formData, event_title: e.target.value})}
                        />
                     </div>
                     {formData.event_category === 'wedding' && (
                        <div className="space-y-6">
                           <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 block ml-2">Event Chapters (Multi-select)</label>
                           <div className="flex flex-wrap gap-4">
                              {WEDDING_SUB_EVENTS.map(sub => (
                                 <button
                                   key={sub}
                                   onClick={() => {
                                     const newSubs = formData.sub_events.includes(sub) 
                                       ? formData.sub_events.filter(s => s !== sub)
                                       : [...formData.sub_events, sub]
                                     setFormData({...formData, sub_events: newSubs})
                                   }}
                                   className={`px-8 py-4 rounded-2xl font-black text-sm tracking-tight transition-all duration-300 border-2 ${
                                     formData.sub_events.includes(sub) 
                                       ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
                                       : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                                   }`}
                                 >
                                    {sub}
                                 </button>
                              ))}
                           </div>
                        </div>
                     )}
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="location" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  className="space-y-12"
                >
                  <div className="text-center">
                     <h2 className="text-6xl font-black text-slate-950 tracking-tighter uppercase italic mb-6">Venue <span className="text-primary">Intelligence.</span></h2>
                     <p className="text-slate-500 font-medium text-lg italic">We match you with photographers verified for your specific region.</p>
                  </div>
                  <div className="bg-white p-12 md:p-16 rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/50 grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 block ml-2">State</label>
                        <div className="relative group">
                          <Map className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
                          <select 
                            className="w-full bg-slate-50 border-2 border-slate-50 pl-16 pr-8 py-6 rounded-3xl font-black text-slate-900 focus:bg-white focus:border-primary/20 transition-all outline-none appearance-none cursor-pointer"
                            value={formData.state}
                            onChange={e => setFormData({...formData, state: e.target.value, district: ''})}
                          >
                             <option value="" className="text-slate-900">Select State</option>
                             {states.map(s => <option key={s} value={s} className="text-slate-900 font-bold">{s}</option>)}
                          </select>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 block ml-2">District</label>
                        <div className="relative group">
                          <Target className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
                          <select 
                            className="w-full bg-slate-50 border-2 border-slate-50 pl-16 pr-8 py-6 rounded-3xl font-black text-slate-900 focus:bg-white focus:border-primary/20 transition-all outline-none appearance-none cursor-pointer"
                            value={formData.district}
                            onChange={e => setFormData({...formData, district: e.target.value})}
                            disabled={!formData.state}
                          >
                             <option value="" className="text-slate-900">Select District</option>
                             {districts.map(d => <option key={d} value={d} className="text-slate-900 font-bold">{d}</option>)}
                          </select>
                        </div>
                     </div>
                     <div className="md:col-span-2 space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 block ml-2">Venue Description & Address</label>
                        <textarea 
                          placeholder="e.g. Taj Mahal Palace, Apollo Bandar, Mumbai..."
                          className="w-full bg-slate-50 border-2 border-slate-50 p-8 rounded-[2.5rem] font-bold text-slate-900 h-40 focus:bg-white focus:border-primary/20 transition-all outline-none tracking-tight"
                          value={formData.venue_address}
                          onChange={e => setFormData({...formData, venue_address: e.target.value})}
                        />
                     </div>
                  </div>
                </motion.div>
              )}
              {currentStep === 3 && (
                <motion.div
                  key="artist" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  className="space-y-12"
                >
                  <div className="text-center">
                     <h2 className="text-6xl font-black text-slate-950 tracking-tighter uppercase italic mb-6">Select Your <span className="text-primary">Visionary.</span></h2>
                     <p className="text-slate-500 font-medium text-lg italic">Choose the artist who will immortalize your story.</p>
                  </div>

                  <div className="bg-white p-12 md:p-16 rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/50 space-y-10">
                    {/* Date Selection */}
                    <div className="space-y-4 pb-10 border-b border-slate-100">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 block ml-2">Event Date</label>
                      <div className="relative group max-w-sm">
                        <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
                        <input 
                          type="date"
                          className="w-full bg-slate-50 border-2 border-slate-50 pl-16 pr-8 py-6 rounded-3xl font-black text-slate-900 focus:bg-white focus:border-primary/20 transition-all outline-none"
                          value={formData.event_date}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={e => setFormData({...formData, event_date: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* Artist Grid */}
                    <div className="space-y-6">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 block ml-2">Available Artists in {formData.state || 'this region'}</label>
                      
                      {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-50 rounded-[2.5rem] animate-pulse" />)}
                        </div>
                      ) : availablePhotographers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                          {availablePhotographers.map(artist => (
                            <button
                              key={artist.id}
                              onClick={() => setFormData({...formData, photographer_id: artist.id})}
                              className={`p-6 rounded-[2.5rem] border-2 transition-all text-left group relative overflow-hidden ${
                                formData.photographer_id === artist.id 
                                  ? 'bg-slate-900 border-slate-900 shadow-xl' 
                                  : 'bg-white border-slate-100 hover:border-slate-200'
                              }`}
                            >
                              <div className="flex items-center gap-4 mb-4">
                                <div className="h-14 w-14 rounded-2xl bg-slate-900 overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
                                  {artist.profile_photo_url ? (
                                    <img src={artist.profile_photo_url} className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-white font-black italic text-xl uppercase">{artist.business_name.charAt(0)}</span>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <h4 className={`font-black uppercase italic tracking-tight truncate ${formData.photographer_id === artist.id ? 'text-white' : 'text-slate-900'}`}>{artist.business_name}</h4>
                                  <div className="flex items-center gap-1 text-primary">
                                    <Star size={10} className="fill-primary" />
                                    <span className="text-[10px] font-black tracking-widest">{artist.rating?.toFixed(1) || '5.0'}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100/10">
                                <div className="flex flex-col">
                                  <span className={`text-[8px] font-black uppercase tracking-widest ${formData.photographer_id === artist.id ? 'text-slate-500' : 'text-slate-400'}`}>Starting At</span>
                                  <span className={`font-black italic ${formData.photographer_id === artist.id ? 'text-white' : 'text-slate-900'}`}>₹{artist.starting_price?.toLocaleString('en-IN') || '25,000'}</span>
                                </div>
                                {formData.photographer_id === artist.id && <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white"><Check size={16} /></div>}
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-12 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                          <Camera className="mx-auto text-slate-300 mb-4" size={48} />
                          <p className="text-slate-500 font-bold italic">No artists found matching your criteria in this region.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div
                  key="summary" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  className="space-y-12"
                >
                  <div className="text-center">
                     <h2 className="text-6xl font-black text-slate-950 tracking-tighter uppercase italic mb-6">Final <span className="text-primary">Review.</span></h2>
                     <p className="text-slate-500 font-medium text-lg italic">Verify your event intelligence before initializing the pipeline.</p>
                  </div>
                  <div className="bg-white p-12 md:p-16 rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/50 space-y-8">
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="space-y-2">
                           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Category</p>
                           <p className="text-xl font-bold text-slate-900 capitalize">{formData.event_category}</p>
                        </div>
                        <div className="space-y-2">
                           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Location</p>
                           <p className="text-xl font-bold text-slate-900">{formData.district}, {formData.state}</p>
                        </div>
                        <div className="space-y-2">
                           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Date</p>
                           <p className="text-xl font-bold text-slate-900">{formData.event_date || 'Not Set'}</p>
                        </div>
                        <div className="space-y-2">
                           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Artist</p>
                           <p className="text-xl font-bold text-primary italic font-black">
                             {availablePhotographers.find(a => a.id === formData.photographer_id)?.business_name || 'Selected Artist'}
                           </p>
                        </div>
                     </div>
                     <div className="space-y-2 pt-6 border-t border-slate-100">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Story Title</p>
                        <p className="text-3xl font-black text-slate-900 tracking-tight">{formData.event_title || 'Untitled Event'}</p>
                     </div>
                     {formData.sub_events.length > 0 && (
                        <div className="space-y-4 pt-6 border-t border-slate-100">
                           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Chapters</p>
                           <div className="flex flex-wrap gap-2">
                              {formData.sub_events.map(sub => (
                                 <span key={sub} className="px-4 py-2 rounded-xl bg-slate-50 text-slate-600 font-bold text-sm">{sub}</span>
                              ))}
                           </div>
                        </div>
                     )}
                     <div className="space-y-2 pt-6 border-t border-slate-100 pb-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Venue</p>
                        <p className="text-lg font-bold text-slate-600">{formData.venue_address || 'No specific venue description provided.'}</p>
                     </div>

                     {/* T&C Section */}
                     <div className="pt-10 border-t border-slate-100">
                        <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 mb-8 max-h-40 overflow-y-auto custom-scrollbar text-xs text-slate-500 font-medium leading-relaxed">
                          <h5 className="font-black uppercase text-slate-900 mb-4 tracking-widest">Elite Service Agreement</h5>
                          <p className="mb-4">1. Commitment: By initializing this pipeline, you formally request the services of the selected artist for the specified date and region.</p>
                          <p className="mb-4">2. Exclusivity: Upon confirmation by the photographer, the booking is secured. Cancellations by the client are strictly prohibited under Elite Tier policy; however, you may "Raise a Disagreement" for mediation.</p>
                          <p className="mb-4">3. Professional Rights: The photographer retains the full professional right to decline or cancel an event based on technical, safety, or scheduling constraints.</p>
                          <p>4. Payment: Booking confirmation may be subject to a 20% commitment fee as per the artist's specific package terms.</p>
                        </div>

                        <label className="flex items-center gap-4 cursor-pointer group px-4">
                          <div className="relative">
                            <input 
                              type="checkbox" 
                              className="peer hidden" 
                              checked={formData.agreed_to_terms}
                              onChange={e => setFormData({...formData, agreed_to_terms: e.target.checked})}
                            />
                            <div className="w-8 h-8 rounded-xl border-2 border-slate-200 peer-checked:bg-slate-900 peer-checked:border-slate-900 transition-all flex items-center justify-center text-white">
                              <Check size={16} className={`transition-transform duration-300 ${formData.agreed_to_terms ? 'scale-100' : 'scale-0'}`} />
                            </div>
                          </div>
                          <span className="text-sm font-black text-slate-600 uppercase tracking-tight group-hover:text-slate-900 transition-colors italic">I accept the Elite Service Agreement & Terms of Use</span>
                        </label>
                     </div>
                  </div>
                </motion.div>
              )}
           </AnimatePresence>

           {/* Precision Controls */}
           <div className="flex items-center justify-between mt-20 px-4">
              <button 
                onClick={handleBack} disabled={currentStep === 0}
                className="px-12 py-6 rounded-3xl bg-white border-2 border-slate-100 text-slate-400 font-black text-xs uppercase tracking-widest flex items-center gap-4 hover:bg-slate-50 hover:text-slate-900 transition-all disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft size={20} /> Previous Phase
              </button>
              
              <div className="flex items-center gap-6">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest hidden md:block">Phase {currentStep + 1} of {STEPS.length}</span>
                {currentStep < STEPS.length - 1 ? (
                   <button 
                    onClick={handleNext}
                    disabled={
                      (currentStep === 1 && !formData.event_title) ||
                      (currentStep === 2 && !formData.district) ||
                      (currentStep === 3 && (!formData.photographer_id || !formData.event_date))
                    }
                    className="px-16 py-6 rounded-3xl bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] flex items-center gap-4 shadow-2xl shadow-slate-200/50 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                   >
                    Synchronize <ChevronRight size={20} />
                   </button>
                ) : (
                   <button 
                    onClick={handleSubmit} disabled={isLoading || !formData.agreed_to_terms}
                    className="px-16 py-6 rounded-3xl aurora-bg text-white font-black text-xs uppercase tracking-[0.2em] flex items-center gap-4 shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                   >
                    {isLoading ? 'Processing...' : 'Initialize Event Pipeline'} <Sparkles size={20} />
                   </button>
                )}
              </div>
           </div>
        </div>
      </main>

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
         <div className="absolute top-[10%] left-[-5%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
         <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-accent/5 blur-[120px] rounded-full" />
      </div>
    </div>
  )
}

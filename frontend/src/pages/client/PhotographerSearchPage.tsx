import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { Search, MapPin, Calendar, IndianRupee, Filter, Star, ShieldCheck, ArrowRight, X, ChevronDown, Sparkles, Camera, Briefcase, Award, Users, Compass, Gem } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { bookingsApi } from '../../lib/api'

// Shared Components
import AuroraRibbon from '../../components/shared/AuroraRibbon'
import Navbar from '../../components/shared/Navbar'
import Footer from '../../components/shared/Footer'
import SplashTag from '../../components/shared/SplashTag'
import WaveDivider from '../../components/shared/WaveDivider'

interface Photographer {
  id: string
  business_name: string
  bio: string
  profile_photo_url: string
  portfolio_urls: string[]
  service_states: string[]
  service_districts: string[]
  rating: number
  total_bookings: number
  status: string
  starting_price: number
}

function CustomDropdown({ label, icon, value, options, onChange, placeholder, isFirst, className }: any) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const displayValue = typeof options[0] === 'object' 
    ? options.find((o: any) => o.value === value)?.label || placeholder
    : value || placeholder

  return (
    <div className={`relative group/field ${className}`} ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-4 px-6 py-4 border-b lg:border-b-0 lg:border-r border-slate-50 w-full hover:bg-slate-50/50 transition-colors text-left ${isFirst ? 'rounded-l-[3.5rem]' : ''}`}
      >
        <div className="h-10 w-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-500 group-hover/field:scale-110 transition-transform duration-500">
          {icon}
        </div>
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-[7px] font-black uppercase tracking-[0.2em] text-violet-500 mb-0.5">{label}</p>
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 text-sm truncate block">
              {displayValue}
            </span>
            <ChevronDown size={12} className={`text-slate-300 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`absolute bottom-full mb-3 w-full lg:w-auto min-w-[280px] bg-white rounded-[2rem] shadow-[0_-30px_80px_-20px_rgba(0,0,0,0.15)] border border-slate-100 z-[100] overflow-hidden p-3 ${isFirst ? 'left-0' : 'left-1/2 -translate-x-1/2'}`}
          >
            <div className="max-h-72 overflow-y-auto custom-scrollbar space-y-1 pr-2">
              {options.map((opt: any, idx: number) => {
                const optVal = typeof opt === 'object' ? opt.value : opt
                const optLabel = typeof opt === 'object' ? opt.label : opt
                const isActive = optVal === value || (optVal === '' && !value) || (optLabel === 'Across India' && !value)

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      onChange(optVal)
                      setIsOpen(false)
                    }}
                    className={`w-full text-left px-5 py-3.5 rounded-xl font-bold transition-all flex items-center justify-between group/item ${
                      isActive 
                        ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-lg shadow-violet-200' 
                        : 'hover:bg-violet-50 text-slate-600 hover:text-violet-600'
                    }`}
                  >
                    <span className="text-base tracking-tight">{optLabel}</span>
                    {isActive && <Sparkles size={12} className="animate-pulse" />}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function PhotographerSearchPage() {
  const [filters, setFilters] = useState({
    state: '',
    district: '',
    event_category: 'wedding',
    date: '',
    min_price: 0,
    max_price: 1500000,
    sort: 'rating'
  })
  
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  
  const { data: states = [] } = useQuery({
    queryKey: ['locations', 'states'],
    queryFn: async () => {
      const res = await bookingsApi.states()
      return res.data as string[]
    },
    staleTime: 1000 * 60 * 60,
  })

  const { data: districts = [] } = useQuery({
    queryKey: ['locations', 'districts', filters.state],
    queryFn: async () => {
      const res = await bookingsApi.districts(filters.state)
      return res.data as string[]
    },
    enabled: !!filters.state,
    staleTime: 1000 * 60 * 60,
  })

  const [debouncedFilters, setDebouncedFilters] = useState(filters)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters)
    }, 500)
    return () => clearTimeout(timer)
  }, [filters.min_price, filters.max_price, filters.state, filters.district, filters.event_category, filters.date, filters.sort])

  const { data: photographers, isLoading } = useQuery({
    queryKey: ['photographers', debouncedFilters],
    queryFn: async () => {
      const params: any = {}
      if (debouncedFilters.state) params.state = debouncedFilters.state
      if (debouncedFilters.district) params.district = debouncedFilters.district
      if (debouncedFilters.event_category) params.event_category = debouncedFilters.event_category
      if (debouncedFilters.date) params.date_val = debouncedFilters.date
      params.min_price = debouncedFilters.min_price
      params.max_price = debouncedFilters.max_price
      params.sort = debouncedFilters.sort
      
      const res = await bookingsApi.searchPhotographers(params)
      return res.data as Photographer[]
    },
    staleTime: 1000 * 60 * 2,
  })

  const { scrollY } = useScroll()
  const blob1Y = useTransform(scrollY, [0, 800], [0, -80])
  const blob2Y = useTransform(scrollY, [0, 800], [0, -50])

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden selection:bg-violet-100">
      <AuroraRibbon />
      <Navbar />

      {/* Hero */}
      <header className="relative pt-36 pb-20 overflow-hidden">
        {/* Animated blobs */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <motion.div style={{ y: blob1Y }} className="absolute -top-32 right-[-10%] w-[600px] h-[600px] bg-violet-100 rounded-full blur-[120px] opacity-60" />
          <motion.div style={{ y: blob2Y }} className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-cyan-100 rounded-full blur-[100px] opacity-50" />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-amber-100 rounded-full blur-[100px] opacity-20"
          />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 80, x: `${15 + Math.random() * 70}%` }}
              animate={{ opacity: [0, 0.5, 0], y: -150 }}
              transition={{ duration: 5 + Math.random() * 4, repeat: Infinity, delay: i * 1.2, ease: 'easeOut' }}
              className="absolute w-1.5 h-1.5 rounded-full bg-violet-300"
            />
          ))}
        </div>
        
        <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-violet-50 border border-violet-200 mb-6">
              <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
              <span className="text-xs font-semibold text-violet-700 tracking-wide uppercase">Curated Studio Network</span>
              <SplashTag text="ELITE" color="purple" rotation={-3} fontSize={10} />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-[1.05]">
              <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>Discover Your</motion.span><br />
              <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="gradient-text">Perfect Photographer.</motion.span>
            </h1>
            
            <p className="text-slate-500 text-lg md:text-xl max-w-xl mx-auto mb-14 leading-relaxed">
              Hand-picked visual storytellers for your most <br className="hidden md:block"/> cherished celebrations across India.
            </p>

            {/* Artisanal Search Console */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.7 }}
              className="p-1.5 bg-white rounded-[3.5rem] shadow-[0_30px_80px_-20px_rgba(109,40,217,0.12)] border border-slate-100 flex flex-col lg:flex-row items-center gap-0.5 max-w-5xl mx-auto relative group/search">
              <div className="absolute inset-0 bg-white rounded-[3.5rem] -z-10 group-hover/search:scale-[1.005] transition-transform duration-700" />
              
              <CustomDropdown 
                label="Region"
                icon={<MapPin size={18} />}
                value={filters.state}
                options={['Across India', ...states]}
                onChange={(val: string) => setFilters({...filters, state: val === 'Across India' ? '' : val, district: ''})}
                placeholder="Across India"
                isFirst
                className="flex-1"
              />

              <div className="flex-[0.8] flex items-center gap-4 px-6 py-4 border-b lg:border-b-0 lg:border-r border-slate-50 w-full group/field hover:bg-slate-50/50 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-500 group-hover/field:scale-110 transition-transform duration-500">
                  <Calendar size={18} />
                </div>
                <div className="text-left flex-1">
                  <p className="text-[7px] font-black uppercase tracking-[0.2em] text-violet-500 mb-0.5">Event Date</p>
                  <input 
                    id="search_date"
                    name="search_date"
                    type="date" 
                    className="bg-transparent border-none outline-none w-full font-bold text-slate-800 text-sm p-0 cursor-pointer"
                    value={filters.date}
                    onChange={(e) => setFilters({...filters, date: e.target.value})}
                  />
                </div>
              </div>

              <CustomDropdown 
                label="Atmosphere"
                icon={<Compass size={18} />}
                value={filters.event_category}
                options={[
                  { value: 'wedding', label: 'Royal Weddings' },
                  { value: 'birthday', label: 'Grand Birthday' },
                  { value: 'corporate', label: 'Elite Summit' },
                  { value: 'portrait', label: 'Artisan Studio' }
                ]}
                onChange={(val: string) => setFilters({...filters, event_category: val})}
                placeholder="Select Mood"
                className="flex-1"
              />

              <div className="flex-1 flex items-center gap-4 px-6 py-4 w-full group/field hover:bg-slate-50/50 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-500 group-hover/field:scale-110 transition-transform duration-500">
                  <IndianRupee size={18} />
                </div>
                <div className="text-left flex-1">
                  <p className="text-[7px] font-black uppercase tracking-[0.2em] text-violet-500 mb-0.5">Budget</p>
                  <select 
                    id="max_price"
                    name="max_price"
                    className="bg-transparent border-none outline-none w-full font-bold text-slate-800 text-sm p-0 cursor-pointer appearance-none"
                    value={filters.max_price}
                    onChange={(e) => setFilters({...filters, max_price: parseInt(e.target.value)})}
                  >
                    <option value="50000">₹50k</option>
                    <option value="100000">₹1L</option>
                    <option value="200000">₹2L</option>
                    <option value="500000">₹5L</option>
                    <option value="1000000">₹10L</option>
                    <option value="1500000">₹15L</option>
                    <option value="10000000">Exclusive</option>
                  </select>
                </div>
              </div>

              <div className="p-1.5 lg:w-fit w-full">
                <button 
                  onClick={() => setIsFilterOpen(true)}
                  className="w-full px-8 py-4 rounded-[2.5rem] bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-violet-200 active:scale-95 transition-all group/btn whitespace-nowrap"
                >
                  Search <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>
        <WaveDivider fill="#FDFBF9" fromColor="transparent" />
      </header>

      {/* Discovery Hub */}
      <main className="max-w-[1400px] mx-auto px-6 pb-40">
        <div className="flex flex-col xl:flex-row gap-12">
          
          {/* Artisanal Sidebar: Curator's Palette */}
          <aside className="hidden xl:block w-80 sticky top-32 h-fit">
            <div className="p-8 rounded-[3rem] bg-white border border-slate-50 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.03)]">
              <h3 className="text-xl font-black mb-10 flex items-center gap-3 text-slate-800 tracking-tight">
                <Filter size={20} className="text-violet-500" /> Filters
              </h3>

              <div className="space-y-10">
                {districts.length > 0 && (
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 block mb-5">Select District</label>
                    <select 
                      id="district_filter"
                      name="district_filter"
                      className="w-full bg-slate-50/50 border border-slate-100 p-4 rounded-2xl font-bold text-slate-800 text-sm outline-none focus:border-violet-400 transition-all"
                      value={filters.district}
                      onChange={e => setFilters({...filters, district: e.target.value})}
                    >
                      <option value="">All Regions</option>
                      {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-end mb-5">
                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 block">Budget Range</label>
                    <span className="text-sm font-bold text-violet-600">₹{filters.max_price.toLocaleString('en-IN')}</span>
                  </div>
                  <input 
                    id="max_price_range"
                    name="max_price_range"
                    type="range" min="10000" max="1500000" step="10000"
                    value={filters.max_price}
                    onChange={e => setFilters({...filters, max_price: parseInt(e.target.value)})}
                    className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                  <div className="flex justify-between mt-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>Base</span>
                    <span>Luxury</span>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 block mb-5">Sort By</label>
                  <div className="space-y-2">
                    {[
                      { id: 'rating', label: 'Top Rated Vanguards', icon: Star },
                      { id: 'price_low', label: 'Artisan Classics', icon: IndianRupee },
                      { id: 'price_high', label: 'Royal Selection', icon: Award }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setFilters({...filters, sort: opt.id})}
                        className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold text-xs transition-all border ${
                          filters.sort === opt.id 
                          ? 'bg-violet-50 border-violet-300 text-violet-600' 
                          : 'bg-transparent border-slate-100 text-slate-500 hover:border-violet-200'
                        }`}
                      >
                        <opt.icon size={14} />
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Visionary Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-12 px-2">
              <div className="space-y-0.5">
                <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                  {isLoading ? 'Searching...' : `${photographers?.length || 0} Photographers Found`}
                  {!isLoading && photographers && photographers.length > 0 && <SplashTag text="LIVE" color="emerald" rotation={2} fontSize={9} />}
                </h2>
                <p className="text-slate-400 text-xs font-semibold">Curated results based on your filters</p>
              </div>
              
              <div className="hidden md:flex items-center gap-2 p-1.5 bg-white rounded-xl border border-slate-50 shadow-sm">
                <button className="p-2.5 rounded-lg bg-slate-900 text-white shadow-lg"><Briefcase size={16} /></button>
                <button className="p-2.5 rounded-lg text-slate-300 hover:text-slate-900 transition-colors"><ChevronDown size={16} /></button>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-[480px] bg-white rounded-[3rem] border border-slate-50 overflow-hidden animate-pulse">
                    <div className="h-3/5 bg-slate-50" />
                    <div className="p-8 space-y-3">
                      <div className="h-6 bg-slate-50 w-2/3 rounded-full" />
                      <div className="h-3 bg-slate-50 w-full rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <AnimatePresence mode="popLayout">
                  {photographers?.map((p, i) => (
                    <PhotographerCard key={p.id} photographer={p} i={i} />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {!isLoading && photographers?.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-24 text-center"
              >
                <div className="bg-white p-16 rounded-[3.5rem] border border-slate-50 shadow-2xl shadow-slate-100/50 inline-block max-w-lg">
                  <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-200 mx-auto mb-8">
                    <Camera size={40} />
                  </div>
                  <h3 className="text-2xl font-black mb-4 tracking-tight">No Results Found</h3>
                  <p className="text-slate-400 font-medium text-base leading-relaxed mb-10">No photographers match your current filters. Try widening your search or exploring another region.</p>
                  <button 
                    onClick={() => setFilters({state: '', district: '', event_category: 'wedding', date: '', min_price: 0, max_price: 200000, sort: 'rating'})}
                    className="px-10 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold uppercase text-xs tracking-widest shadow-lg shadow-violet-200 hover:scale-[1.03] active:scale-95 transition-all"
                  >
                    Reset Filters
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

const PhotographerCard = React.forwardRef(({ photographer, i }: { photographer: Photographer, i: number }, ref: React.Ref<HTMLDivElement>) => {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.08, duration: 0.5 }}
      layout
    >
      <Link to={`/photographers/${photographer.id}`} className="block group">
        <div className="bg-white rounded-[2.5rem] overflow-hidden transition-all duration-500 border border-slate-100 group-hover:shadow-[0_30px_60px_-15px_rgba(109,40,217,0.12)] group-hover:-translate-y-1 relative h-full flex flex-col">
          
          {/* Card Header: Artistic Frame */}
          <div className="relative aspect-[16/10] overflow-hidden bg-slate-50">
            {photographer.portfolio_urls && photographer.portfolio_urls.length > 0 ? (
              <img 
                src={photographer.portfolio_urls[0]} 
                alt={photographer.business_name} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200">
                <Camera size={48} />
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-40" />
            
            {/* Achievement Badges */}
            <div className="absolute top-6 left-6 flex flex-col gap-2">
              <span className="px-4 py-2 rounded-xl bg-white/90 backdrop-blur-xl text-slate-700 text-[8px] font-bold uppercase tracking-widest flex items-center gap-2 border border-white/50 shadow-sm">
                <ShieldCheck size={12} className="text-violet-500" /> Verified
              </span>
              {photographer.rating >= 4.8 && (
                <span className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 backdrop-blur-md text-white text-[8px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg">
                  <Star size={12} className="fill-white" /> Top Rated
                </span>
              )}
              {photographer.total_bookings >= 10 && (
                <SplashTag text="🔥 HOT" color="amber" rotation={3} fontSize={9} />
              )}
            </div>

            {/* In-Frame Price Tag */}
            <div className="absolute bottom-6 right-6">
              <div className="px-5 py-3 rounded-2xl bg-white/90 backdrop-blur-xl shadow-lg flex flex-col items-end border border-white/50">
                <span className="text-[7px] font-bold text-violet-500 uppercase tracking-widest mb-0.5">Starting at</span>
                <div className="flex items-center gap-0.5 text-slate-800 font-bold">
                  <IndianRupee size={12} className="text-violet-500" />
                    <span className="text-xl tracking-tighter">
                      {photographer.starting_price > 0 
                        ? photographer.starting_price.toLocaleString('en-IN') 
                        : '25,000'}
                    </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card Content: Refined Context */}
          <div className="p-8 flex-1 flex flex-col">
            <div className="flex items-start justify-between mb-5">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-800 tracking-tight group-hover:text-violet-600 transition-colors">{photographer.business_name}</h3>
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin size={12} className="text-violet-400" />
                  <span className="text-[9px] font-bold uppercase tracking-widest opacity-70">
                    {photographer.service_states?.[0] || 'India'} 
                    {photographer.service_districts?.[0] ? ` • ${photographer.service_districts[0]}` : ''}
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-violet-50 flex flex-col items-center justify-center border border-violet-100">
                 <span className="text-base font-black text-slate-800 leading-none">{photographer.rating?.toFixed(1) || '5.0'}</span>
                 <Star size={8} className="fill-violet-500 text-violet-500" />
              </div>
            </div>

            <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-8 font-medium opacity-80">
              {photographer.bio || "Crafting cinematically rich visual stories that preserve the authentic essence of your grandest celebrations."}
            </p>
            
            <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
               <div className="flex -space-x-2.5">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-9 h-9 rounded-full border-2 border-white bg-slate-50 flex items-center justify-center text-slate-300">
                      <Users size={12} />
                    </div>
                  ))}
                  <div className="w-9 h-9 rounded-full border-2 border-white bg-slate-900 flex items-center justify-center text-[9px] text-white font-black">
                    +{photographer.total_bookings || 0}
                  </div>
               </div>
               
               <div className="flex items-center gap-2 text-violet-600 font-bold uppercase text-[10px] tracking-widest group-hover:translate-x-1 transition-transform">
                  View Profile <ArrowRight size={14} />
               </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
})

PhotographerCard.displayName = 'PhotographerCard'

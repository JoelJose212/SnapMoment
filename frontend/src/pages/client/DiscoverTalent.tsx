import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, MapPin, Star, IndianRupee, 
  ArrowRight, Sparkles, Camera, 
  Filter, ChevronRight, Award,
  ShieldCheck, Heart
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingsApi, shortlistApi } from '../../lib/api'
import SplashTag from '../../components/shared/SplashTag'
import toast from 'react-hot-toast'

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
  starting_price: number
  specialization?: string
}

export default function DiscoverTalent() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const categories = ['All', 'Wedding', 'Portrait', 'Event', 'Fashion', 'Corporate']

  const { data: photographers, isLoading } = useQuery({
    queryKey: ['discover-photographers'],
    queryFn: async () => {
      const params = { limit: 12, sort: 'rating' }
      const res = await bookingsApi.searchPhotographers(params)
      return res.data as Photographer[]
    }
  })

  const { data: favorites } = useQuery({
    queryKey: ['shortlist'],
    queryFn: async () => {
      const res = await shortlistApi.get()
      return res.data
    }
  })

  const filteredPhotographers = photographers?.filter(p => {
    const matchesSearch = p.business_name.toLowerCase().includes(search.toLowerCase()) || 
                         p.service_states.some(s => s.toLowerCase().includes(search.toLowerCase()))
    const matchesCategory = selectedCategory === 'All' || 
                           (p.specialization && p.specialization.includes(selectedCategory))
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-[#FBFBFF] pb-20">
      {/* Immersive Header */}
      <section className="relative pt-12 pb-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/4" />
        
        <div className="relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <SplashTag text="Elite Marketplace" color="teal" />
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[0.85] tracking-tighter uppercase italic mt-6">
              Discover <br />
              <span className="gradient-text">Pure Talent.</span>
            </h1>
            <p className="text-xl text-slate-500 font-bold mt-8 max-w-xl leading-relaxed">
              Handpicked visual storytellers. Verified excellence. <br />
              Your masterpiece begins with the right lens.
            </p>
          </motion.div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col lg:flex-row gap-6 items-center mb-16">
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-6 flex items-center text-slate-400 group-focus-within:text-primary transition-colors">
                <Search size={22} />
              </div>
              <input 
                type="text"
                placeholder="Search by name, state, or style..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-16 pr-8 py-6 rounded-[2rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/30 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-bold text-lg"
              />
            </div>
            
            <div className="flex items-center gap-3 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-8 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all ${
                    selectedCategory === cat 
                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-300' 
                    : 'bg-white text-slate-400 hover:text-primary border border-slate-100 shadow-sm'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Results Grid */}
      <section className="relative z-10">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white rounded-[3.5rem] h-[500px] animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : filteredPhotographers && filteredPhotographers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <AnimatePresence mode="popLayout">
              {filteredPhotographers.map((p, i) => (
                <PhotographerDiscoveryCard 
                  key={p.id} 
                  photographer={p} 
                  index={i} 
                  isShortlisted={favorites?.some((f: any) => f.photographer_id === p.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-40">
             <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-slate-200 mx-auto mb-8 shadow-xl">
                <Camera size={48} />
             </div>
             <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter uppercase italic">No Artists Found</h3>
             <p className="text-slate-500 font-bold max-w-sm mx-auto">Try adjusting your search or category to find your perfect match.</p>
          </div>
        )}
      </section>
    </div>
  )
}

function PhotographerDiscoveryCard({ photographer, index, isShortlisted }: { photographer: Photographer, index: number, isShortlisted: boolean }) {
  const queryClient = useQueryClient()

  const toggleShortlist = useMutation({
    mutationFn: async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (isShortlisted) {
        return shortlistApi.remove(photographer.id)
      } else {
        return shortlistApi.add(photographer.id)
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      layout
      className="group"
    >
      <Link to={`/photographers/${photographer.id}`} className="block">
        <div className="bg-white rounded-[4rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/20 group-hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.12)] transition-all duration-700 relative h-full flex flex-col">
          
          {/* Portfolio Preview */}
          <div className="h-[320px] relative overflow-hidden bg-slate-100">
            {photographer.portfolio_urls && photographer.portfolio_urls.length > 0 ? (
              <img 
                src={photographer.portfolio_urls[0]} 
                alt={photographer.business_name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-200">
                <Camera size={64} />
              </div>
            )}
            
            {/* Overlay Badges */}
            <div className="absolute top-8 left-8 flex flex-col gap-2">
              <div className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={12} className="text-primary" /> Verified
              </div>
              {photographer.rating >= 4.8 && (
                <div className="px-4 py-2 rounded-xl bg-amber-400 text-slate-900 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Award size={12} /> Elite
                </div>
              )}
            </div>

            {/* Heart Button */}
            <div className="absolute top-8 right-8">
               <button 
                 onClick={(e) => toggleShortlist.mutate(e)}
                 className={`w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-md border transition-all ${
                   isShortlisted 
                   ? 'bg-rose-500/80 border-rose-400 text-white shadow-xl shadow-rose-500/20' 
                   : 'bg-white/20 border-white/30 text-white hover:bg-white/40'
                 }`}
               >
                  <Heart size={20} className={isShortlisted ? 'fill-white' : ''} />
               </button>
            </div>

            {/* Price Floating Badge */}
            <div className="absolute bottom-8 right-8">
               <div className="bg-white px-6 py-4 rounded-[1.5rem] shadow-2xl flex flex-col items-end">
                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Starts at</span>
                  <div className="flex items-center gap-1 text-slate-900 font-black italic">
                    <IndianRupee size={16} className="text-primary" />
                    <span className="text-2xl tracking-tighter">
                      {(photographer.starting_price || 25000).toLocaleString('en-IN')}
                    </span>
                  </div>
               </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-10 flex flex-col flex-1">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-3xl font-black text-slate-950 uppercase italic tracking-tighter group-hover:text-primary transition-colors leading-none">
                  {photographer.business_name}
                </h3>
                <div className="flex items-center gap-2 text-slate-400 mt-3 font-bold text-xs">
                  <MapPin size={14} className="text-primary" />
                  <span className="uppercase tracking-widest">
                    {photographer.service_districts?.[0] || 'Bhilai'}, {photographer.service_states?.[0] || 'Chhattisgarh'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                <span className="text-sm font-black italic">{photographer.rating?.toFixed(1) || '5.0'}</span>
              </div>
            </div>

            <p className="text-slate-500 font-medium text-base leading-relaxed line-clamp-2 mb-10 italic">
              "{photographer.bio || "Crafting timeless visual stories with a focus on cinematic lighting and emotional authenticity."}"
            </p>

            <div className="mt-auto pt-8 border-t border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                  <Sparkles size={18} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {photographer.total_bookings || 0}+ Masterpieces
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-primary font-black uppercase text-[11px] tracking-widest italic group-hover:translate-x-3 transition-transform">
                View Portfolio <ChevronRight size={18} />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

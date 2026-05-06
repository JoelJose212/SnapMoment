import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, Camera, MapPin, Star, 
  IndianRupee, MessageSquare, Trash2, 
  ChevronRight, Sparkles, AlertCircle
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { shortlistApi } from '../../lib/api'
import toast from 'react-hot-toast'
import SplashTag from '../../components/shared/SplashTag'

interface Favorite {
  id: string
  photographer_id: string
  photographer: {
    id: string
    business_name: string
    bio: string
    profile_photo_url: string
    portfolio_urls: string[]
    rating: number
    starting_price: number
    service_states: string[]
    service_districts: string[]
  }
}

export default function Favorites() {
  const queryClient = useQueryClient()

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['shortlist'],
    queryFn: async () => {
      const res = await shortlistApi.get()
      return res.data as Favorite[]
    }
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) => shortlistApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shortlist'] })
      toast.success('Removed from shortlist', { icon: '🗑️' })
    }
  })

  return (
    <div className="min-h-screen bg-[#FBFBFF] pb-20">
      {/* Header */}
      <section className="relative pt-12 pb-16 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <SplashTag text="Your Collection" color="purple" />
          <h1 className="text-6xl md:text-7xl font-black text-slate-900 leading-[0.85] tracking-tighter uppercase italic mt-6">
            Shortlisted <br />
            <span className="gradient-text">Master Artists.</span>
          </h1>
          <p className="text-xl text-slate-500 font-bold mt-8 max-w-xl leading-relaxed">
            Your personal gallery of handpicked visual storytellers. <br />
            Ready to capture your next chapter.
          </p>
        </motion.div>
      </section>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3].map(i => (
            <div key={i} className="h-[500px] rounded-[3.5rem] bg-white animate-pulse border border-slate-100" />
          ))}
        </div>
      ) : favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {favorites.map((fav, i) => (
              <FavoriteCard 
                key={fav.id} 
                favorite={fav} 
                index={i} 
                onRemove={() => removeMutation.mutate(fav.photographer_id)}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-32 bg-white rounded-[4rem] border border-dashed border-slate-200">
           <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 mx-auto mb-8">
              <Heart size={48} strokeWidth={1} />
           </div>
           <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter mb-4">Your shortlist is empty</h3>
           <p className="text-slate-500 font-bold max-w-sm mx-auto mb-10">Start discovering India's most talented photographers to build your collection.</p>
           <Link to="/client/discover" className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-slate-200">
              Explore Talent <ChevronRight size={18} />
           </Link>
        </div>
      )}
    </div>
  )
}

function FavoriteCard({ favorite, index, onRemove }: { favorite: Favorite, index: number, onRemove: () => void }) {
  const p = favorite.photographer
  
  if (!p) return null

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
      className="group bg-white rounded-[3.5rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-slate-300/30 transition-all duration-500 flex flex-col h-full"
    >
      <div className="relative h-64 overflow-hidden bg-slate-100">
        <img 
          src={p.portfolio_urls?.[0] || 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop&q=60'} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          alt={p.business_name}
        />
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
           <div className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
              <Star size={12} className="fill-amber-400 text-amber-400 border-none" /> {p.rating?.toFixed(1) || '5.0'}
           </div>
           <button 
             onClick={onRemove}
             className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-red-500 hover:border-red-500 transition-all"
           >
              <Trash2 size={18} />
           </button>
        </div>
      </div>

      <div className="p-8 flex-1 flex flex-col">
        <div className="mb-6">
           <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter group-hover:text-primary transition-colors">{p.business_name}</h3>
           <div className="flex items-center gap-2 text-slate-400 mt-2 font-bold text-[10px] uppercase tracking-widest">
              <MapPin size={12} className="text-primary" /> {p.service_districts?.[0] || 'Bhilai'}, {p.service_states?.[0] || 'CG'}
           </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-8">
           <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Starts at</span>
           <div className="flex items-center gap-1 text-slate-900 font-black italic">
              <IndianRupee size={12} className="text-primary" />
              <span className="text-lg tracking-tighter">{p.starting_price?.toLocaleString() || '25,000'}</span>
           </div>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-3">
           <Link 
             to={`/photographers/${p.id}`}
             className="py-4 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest text-center hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
           >
              Profile
           </Link>
           <Link 
             to={`/client/messages?id=${p.id}`}
             className="py-4 rounded-xl bg-white border border-slate-100 text-slate-900 text-[10px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
           >
              <MessageSquare size={14} className="text-primary" /> Chat
           </Link>
        </div>
      </div>
    </motion.div>
  )
}

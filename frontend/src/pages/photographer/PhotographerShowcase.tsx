import { motion } from 'framer-motion'
import { useParams, Link } from 'react-router-dom'
import { 
  Camera, MapPin, Award, ArrowRight, 
  Instagram, Twitter, Globe, Zap, 
  CheckCircle2, Star, Image as ImageIcon, 
  Users, MessageSquare
} from 'lucide-react'

// Mock Data for the Showcase
const PHOTOGRAPHER_DATA: any = {
  'rohan-mehta': {
    name: 'Rohan Mehta',
    studio: 'Elite Pixels Studio',
    bio: 'Award-winning storyteller specializing in high-fashion weddings and cinematic event coverage across India. Bringing artificial intelligence to the art of memory.',
    location: 'Mumbai, MH',
    events: [
      { id: 1, name: 'The Grand Royal Wedding', type: 'Wedding', photos: 842, date: 'Live Now', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800' },
      { id: 2, name: 'Corporate Horizon Gala', type: 'Corporate', photos: 320, date: '2 days ago', image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800' },
    ],
    stats: { delivered: '42k+', events: '120+', rating: '4.9/5' }
  }
}

export default function PhotographerShowcase() {
  const { slug } = useParams()
  const data = PHOTOGRAPHER_DATA[slug || 'rohan-mehta'] || PHOTOGRAPHER_DATA['rohan-mehta']

  return (
    <div className="min-h-screen bg-white">
      {/* Immersive Hero Section */}
      <div className="h-[60vh] relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0">
           <img 
             src="https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&q=80&w=1600" 
             className="w-full h-full object-cover grayscale-[0.3]"
             alt="Studio"
           />
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" />
           <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/40 to-white" />
        </div>

        <div className="relative z-10 text-center px-6">
           <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="w-32 h-32 md:w-40 md:h-40 rounded-[3rem] border-8 border-white/20 backdrop-blur-xl shadow-3xl mx-auto mb-8 p-1 overflow-hidden"
           >
              <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${data.name}`} className="w-full h-full object-cover bg-white rounded-[2.5rem]" alt="Profile" />
           </motion.div>
           
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
           >
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                <CheckCircle2 size={14} className="text-primary" /> Verified Elite Studio
             </div>
             <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase italic leading-none drop-shadow-2xl">
                {data.studio.split(' ')[0]} <span className="text-primary italic">{data.studio.split(' ').slice(1).join(' ')}</span>
             </h1>
             <p className="text-white/60 font-medium text-lg mt-6 max-w-xl mx-auto tracking-tight">{data.bio}</p>
           </motion.div>
        </div>
      </div>

      {/* Live Workspace & Stats */}
      <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-20 pb-32">
         {/* Stats Bar */}
         <div className="grid grid-cols-3 gap-6 mb-20">
            {[
              { label: 'Photos Delivered', val: data.stats.delivered, icon: Zap },
              { label: 'Captures', val: data.stats.events, icon: Camera },
              { label: 'Studio Rating', val: data.stats.rating, icon: Star },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col items-center text-center group hover:scale-105 transition-all">
                 <stat.icon size={24} className="text-primary mb-4" />
                 <p className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">{stat.val}</p>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
              </div>
            ))}
         </div>

         {/* Active Galleries */}
         <div className="space-y-12">
            <div className="flex items-end justify-between px-2">
               <div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Active <span className="text-slate-400">Experience.</span></h2>
                  <p className="text-slate-500 font-medium mt-2">Currently broadcasting live from {data.location}.</p>
               </div>
               <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Live Now
               </div>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
               {data.events.map((event: any, i: number) => (
                 <motion.div 
                   key={event.id}
                   initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   className="group relative h-[500px] rounded-[4rem] overflow-hidden shadow-3xl cursor-pointer"
                 >
                    <img src={event.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={event.name} />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
                    
                    <div className="absolute top-8 left-8 flex gap-2">
                       <span className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest">
                          {event.type}
                       </span>
                       <span className="px-4 py-2 rounded-2xl bg-primary/20 backdrop-blur-md border border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest">
                          {event.date}
                       </span>
                    </div>

                    <div className="absolute bottom-10 left-10 right-10 flex items-end justify-between">
                       <div>
                          <h3 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-tight mb-4">
                             {event.name}
                          </h3>
                          <div className="flex items-center gap-6">
                             <div className="flex items-center gap-2 text-white/60 text-[10px] font-black uppercase tracking-widest">
                                <ImageIcon size={14} /> {event.photos} Frames
                             </div>
                             <div className="flex items-center gap-2 text-white/60 text-[10px] font-black uppercase tracking-widest">
                                <MapPin size={14} /> {data.location}
                             </div>
                          </div>
                       </div>
                       <div className="w-16 h-16 rounded-[2rem] bg-white text-slate-900 flex items-center justify-center shadow-2xl group-hover:bg-primary group-hover:text-white transition-all group-hover:scale-110 group-hover:rotate-12">
                          <ArrowRight size={24} />
                       </div>
                    </div>
                 </motion.div>
               ))}
            </div>
         </div>

         {/* Dynamic Contact / Booking */}
         <div className="mt-32 p-16 rounded-[4rem] bg-slate-50 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 translate-x-full group-hover:translate-x-0 transition-transform duration-1000" />
            <div className="relative z-10 max-w-xl">
               <div className="flex items-center gap-3 mb-6 text-primary font-black text-[10px] uppercase tracking-widest">
                  <MessageSquare size={20} /> Studio Direct
               </div>
               <h3 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-6">
                  Ready to <span className="text-slate-400">Scale</span> your vision?
               </h3>
               <p className="text-slate-500 font-medium text-lg leading-relaxed">Book {data.name} for your next premium event. Experience the future of instant memory delivery.</p>
            </div>
            <div className="relative z-10 flex flex-col items-center gap-6">
               <button className="px-12 py-6 rounded-[2.5rem] bg-slate-900 text-white text-sm font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all">
                  Book Studio Session
               </button>
               <div className="flex items-center gap-6 text-slate-300">
                  <Instagram className="hover:text-primary transition-colors cursor-pointer" size={20} />
                  <Twitter className="hover:text-primary transition-colors cursor-pointer" size={20} />
                  <Globe className="hover:text-primary transition-colors cursor-pointer" size={20} />
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}

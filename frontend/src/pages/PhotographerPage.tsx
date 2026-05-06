import React from 'react'
import { motion } from 'framer-motion'
import { Camera, Sparkles, User, Search, MapPin, Star } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function PhotographerPage() {
  return (
    <div className="min-h-screen bg-[#FBFBFF] selection:bg-primary/20">
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-6 backdrop-blur-xl border-b border-slate-200/50 bg-white/70">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg group-hover:bg-primary transition-all duration-500">
              <Camera size={20} className="text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase italic text-slate-900">SnapMoment</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-10">
            <Link to="/photographers" className="text-xs font-black uppercase tracking-widest text-slate-900 border-b-2 border-primary pb-1">Photographers</Link>
            <Link to="/demo" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">Demo</Link>
            <Link to="/pricing" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">Pricing</Link>
          </div>

          <div className="flex items-center gap-4">
             <Link to="/login" className="px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">Login</Link>
             <Link to="/signup" className="px-8 py-3 rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all">Join Elite</Link>
          </div>
        </div>
      </nav>

      {/* Main Hero Section */}
      <main className="pt-40 pb-20 px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-6">
              <Sparkles size={14} /> Discover World-Class Talent
            </div>
            <h1 className="text-7xl font-black text-slate-950 uppercase italic tracking-tighter leading-tight mb-8">
              Explore Our <br /> <span className="gradient-text">Master Storytellers.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-slate-500 font-medium">
              Browse through a curated ecosystem of photographers across India, specializing in everything from weddings to high-fashion.
            </p>
          </motion.div>

          {/* Placeholder for content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="group relative rounded-[2.5rem] bg-white border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-700">
                <div className="aspect-[4/5] bg-slate-100 overflow-hidden">
                   <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 animate-pulse" />
                </div>
                <div className="p-10">
                   <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-black text-slate-950 uppercase italic">Elite Artist {i}</h3>
                      <div className="flex items-center gap-1 text-primary">
                         <Star size={16} fill="currentColor" />
                         <span className="font-bold">4.9</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-4 text-slate-400 mb-8">
                      <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest">
                         <MapPin size={14} /> Mumbai
                      </div>
                      <div className="h-1 w-1 rounded-full bg-slate-300" />
                      <div className="text-[10px] font-black uppercase tracking-widest">Wedding • Editorial</div>
                   </div>
                   <button className="w-full py-4 rounded-2xl border border-slate-200 text-slate-950 font-black text-[10px] uppercase tracking-widest group-hover:bg-slate-950 group-hover:text-white transition-all duration-500">
                      View Portfolio
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-8 text-center">
           <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">© 2024 SnapMoment Ecosystem — All Rights Reserved</p>
        </div>
      </footer>
    </div>
  )
}

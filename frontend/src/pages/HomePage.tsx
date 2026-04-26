import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import {
  Camera, Zap, Shield, Users, ChevronDown,
  Star, Check, QrCode, Smartphone, Image as ImageIcon,
  Sparkles, ArrowRight, Heart, Award, Clock,
  Layout, ShieldCheck, Search, Download, Share2,
  Bell, Filter, MousePointer2, ZapIcon, Target,
  Rocket, Globe, Box, Layers
} from 'lucide-react'

// Shared Components
import AuroraRibbon from '../components/shared/AuroraRibbon'
import Navbar from '../components/shared/Navbar'
import Footer from '../components/shared/Footer'
import SplashTag from '../components/shared/SplashTag'
import WaveDivider from '../components/shared/WaveDivider'

// --- Realistic & Emotive Components ---

function useCountUp(target: number, duration = 2000, trigger: boolean = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!trigger) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [trigger, target, duration])
  return count
}

function StatCounter({ value, suffix, label, icon: Icon }: { value: number; suffix: string; label: string; icon: any }) {
  const ref = useRef<HTMLDivElement>(null)
  const [triggered, setTriggered] = useState(false)
  const count = useCountUp(value, 2200, triggered)
  
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setTriggered(true)
    }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} className="group relative overflow-hidden bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-10 rounded-[3rem] transition-all hover:bg-white/[0.06] hover:border-primary/30 flex flex-col items-center text-center">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/20 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-primary mb-6 shadow-inner group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500">
        <Icon size={32} />
      </div>

      <div className="relative z-10">
        <div className="text-4xl md:text-5xl lg:text-6xl font-black gradient-text mb-4 tracking-tighter italic whitespace-nowrap">
          {count.toLocaleString()}{suffix}
        </div>
        <div className="text-[10px] md:text-[12px] font-black tracking-[0.3em] uppercase text-white/40 leading-none">{label}</div>
      </div>
    </div>
  )
}

const RealisticPhone = ({ children }: { children: React.ReactNode }) => {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const mouseXSpring = useSpring(x)
  const mouseYSpring = useSpring(y)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0) }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="relative mx-auto w-[320px] md:w-[380px] h-[650px] md:h-[780px] group cursor-pointer perspective-1000"
    >
      {/* 3D Floating Notifications - Slimmer & More Native */}
      <motion.div 
        style={{ translateZ: 120 }}
        className="absolute -right-12 top-24 z-50 bg-white/90 backdrop-blur-xl p-5 rounded-2xl shadow-2xl border border-white/40 w-44"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">
             <Check size={12} strokeWidth={4} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">System</span>
        </div>
        <div className="text-[11px] font-bold text-slate-900 leading-tight">Matched 12 photos with <span className="text-primary italic">Arjun</span></div>
      </motion.div>

      <motion.div 
        style={{ translateZ: 180 }}
        className="absolute -left-12 bottom-48 z-50 bg-white/90 backdrop-blur-xl p-5 rounded-2xl shadow-2xl border border-white/40 w-40"
      >
        <div className="flex items-center gap-2 mb-1">
           <Zap size={14} className="text-primary" fill="currentColor" />
           <span className="text-[9px] font-black text-primary uppercase tracking-widest">Processing</span>
        </div>
        <div className="text-2xl font-black italic text-slate-900 tracking-tighter">0.8s</div>
        <div className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Global Latency</div>
      </motion.div>

      {/* Hardware Frame - Slimmer Bezel */}
      <div 
        style={{ transform: "translateZ(50px)", transformStyle: "preserve-3d" }}
        className="absolute inset-0 bg-slate-900 rounded-[3.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)] border-[6px] border-slate-800 p-2.5 ring-1 ring-slate-700/50"
      >
        {/* Hardware Detail - Buttons */}
        <div className="absolute top-24 -left-1.5 w-1 h-8 bg-slate-800 rounded-l-md" />
        <div className="absolute top-36 -left-1.5 w-1 h-16 bg-slate-800 rounded-l-md" />
        <div className="absolute top-32 -right-1.5 w-1 h-20 bg-slate-800 rounded-r-md" />
        
        <div className="relative h-full w-full bg-white rounded-[2.8rem] overflow-hidden flex flex-col shadow-inner">
          {/* Status Bar - Native Look */}
          <div className="absolute top-0 inset-x-0 h-11 flex items-center justify-between px-8 z-50">
             <div className="text-[10px] font-black text-slate-900">9:41</div>
             <div className="w-24 h-6 bg-slate-900 rounded-full flex items-center justify-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                <div className="w-6 h-1.5 rounded-full bg-slate-800" />
             </div>
             <div className="flex items-center gap-1">
                <div className="w-3 h-2 border border-slate-900 rounded-[2px] relative">
                   <div className="absolute inset-px bg-slate-900 rounded-[1px] w-3/4" />
                </div>
             </div>
          </div>
          
          {/* Glass Reflection Layer */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-transparent pointer-events-none z-40 opacity-40 group-hover:translate-x-10 transition-transform duration-1000" />
          
          {children}
        </div>
      </div>
    </motion.div>
  )
}

const FloatingItem = ({ children, className, delay = 0, yRange = 20 }: { children: React.ReactNode; className?: string; delay?: number; yRange?: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ 
      opacity: 1, 
      scale: 1,
      y: [0, -yRange, 0],
    }}
    transition={{
      opacity: { duration: 0.8, delay },
      y: { duration: 4 + Math.random() * 2, repeat: Infinity, ease: "easeInOut", delay }
    }}
    className={className}
  >
    {children}
  </motion.div>
)

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9])

  return (
    <div className="min-h-screen selection:bg-primary/40 selection:text-white" style={{ background: 'var(--background)' }}>
      <AuroraRibbon />
      <Navbar />

      {/* --- HERO SECTION: ULTRA VIBRANT --- */}
      <header className="relative min-h-screen flex items-center justify-center pt-24 overflow-hidden">
        {/* Immersive Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center scale-105 opacity-10 blur-xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background to-background" />
          
          {/* Pulsing Orbs */}
          <div className="absolute top-[20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[180px] rounded-full animate-pulse-slow" />
          <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-accent/20 blur-[180px] rounded-full animate-pulse-slow" style={{ animationDelay: '3s' }} />
          
          {/* Animated Noise Overlay */}
          <div className="absolute inset-0 noise-overlay opacity-[0.15] pointer-events-none" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <motion.div 
              style={{ opacity: heroOpacity, scale: heroScale }}
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="hero-badge mb-8 border-primary/30 bg-primary/10 text-primary shadow-lg shadow-primary/20 backdrop-blur-xl group cursor-pointer">
                <Sparkles size={14} className="animate-spin-slow" />
                <span className="font-black uppercase tracking-[0.2em] text-[10px]">The Future of Photography Delivery</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
              
              <h1 className="text-7xl md:text-[10rem] font-black leading-[0.8] tracking-tighter mb-10 uppercase italic">
                Moments <br />
                <span className="gradient-text drop-shadow-[0_20px_50px_rgba(20,184,166,0.4)] block mt-2">Relived.</span>
              </h1>
              
              <p className="text-2xl md:text-3xl text-text-muted leading-tight max-w-xl mb-12 font-medium tracking-tight">
                No more <span className="text-foreground italic">"Can you send the link?"</span> <br />
                Our AI delivers personalized guest galleries in <span className="text-primary font-black underline decoration-primary/30 underline-offset-8 italic">real-time.</span>
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Link 
                  to="/signup" 
                  className="w-full sm:w-auto px-16 py-8 rounded-[2.5rem] bg-primary text-white font-black text-2xl hover:scale-105 hover:shadow-primary/40 active:scale-95 transition-all shadow-3xl shadow-primary/20 flex items-center justify-center gap-3 group relative overflow-hidden"
                >
                  <span className="relative z-10">Start Your Event</span>
                  <ArrowRight size={26} className="group-hover:translate-x-1 transition-transform relative z-10" />
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </Link>
                <Link 
                  to="/demo" 
                  className="w-full sm:w-auto px-16 py-8 rounded-[2.5rem] bg-white/5 border-2 border-white/10 backdrop-blur-md text-foreground font-black text-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  Watch Demo <MousePointer2 size={24} />
                </Link>
              </div>

              {/* Dynamic Stats Row */}
              <div className="mt-20 flex items-center gap-12">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} className="w-14 h-14 rounded-full border-4 border-background ring-2 ring-primary/20 shadow-xl" alt="" />
                  ))}
                  <div className="w-14 h-14 rounded-full bg-slate-900 border-4 border-background flex items-center justify-center text-white text-xs font-black">+2k</div>
                </div>
                <div className="h-10 w-[1px] bg-white/10" />
                <div>
                   <div className="text-xl font-black tracking-tight italic">Trusted by Elites.</div>
                   <div className="flex items-center gap-4 mt-2 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-pointer">
                      <span className="text-[10px] font-black tracking-widest uppercase">NIKON</span>
                      <span className="text-[10px] font-black tracking-widest uppercase">VOGUE</span>
                      <span className="text-[10px] font-black tracking-widest uppercase">SONY</span>
                   </div>
                </div>
              </div>
            </motion.div>

            {/* Right Side: The Ultra-Realistic Phone */}
            <div className="relative pt-12">
              <RealisticPhone>
                <div className="h-full flex flex-col bg-slate-50">
                   {/* Mobile App Interface */}
                   <div className="p-8 pb-4">
                      <div className="flex items-center justify-between mb-8">
                         <div className="text-2xl font-black tracking-tighter italic text-slate-900">SnapMoment</div>
                         <div className="relative">
                            <Bell size={24} className="text-slate-400" />
                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white" />
                         </div>
                      </div>
                      
                      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8">
                         <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Scanning Live</div>
                         <div className="text-xl font-black text-slate-900 tracking-tight">Found Your Photos</div>
                         <div className="mt-4 flex gap-2">
                            <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                               <motion.div animate={{ x: ["-100%", "100%"] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="w-1/2 h-full bg-primary" />
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="flex-1 overflow-y-auto px-8 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                         {[
                           'https://images.unsplash.com/photo-1519741497674-611481863552',
                           'https://images.unsplash.com/photo-1511795409834-ef04bbd61622',
                           'https://images.unsplash.com/photo-1520854221256-17451cc331bf',
                           'https://images.unsplash.com/photo-1519167758481-83f550bb49b3'
                         ].map((url, i) => (
                           <div key={i} className="group relative rounded-2xl overflow-hidden shadow-md aspect-square border-2 border-white hover:scale-105 transition-transform duration-500">
                              <img src={`${url}?auto=format&fit=crop&q=80&w=300`} className="w-full h-full object-cover" alt="" />
                              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="p-8 pt-4">
                      <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white">
                         <div className="flex items-center justify-between mb-4">
                            <div>
                               <div className="text-3xl font-black italic tracking-tighter">12 Photos</div>
                               <div className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em]">Direct Match</div>
                            </div>
                            <button className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30">
                               <Download size={20} />
                            </button>
                         </div>
                         <button className="w-full py-4 rounded-2xl bg-white text-slate-900 font-black text-sm uppercase tracking-widest hover:scale-105 transition-all">
                            Relive The Gallery
                         </button>
                      </div>
                   </div>
                </div>
              </RealisticPhone>

              {/* Realistic Floating Items */}
              <FloatingItem className="absolute -top-10 right-0 z-40" delay={0.5}>
                 <div className="w-20 h-20 rounded-[2rem] bg-white shadow-2xl flex items-center justify-center border border-slate-100">
                    <Camera size={32} className="text-primary" />
                 </div>
              </FloatingItem>

              <FloatingItem className="absolute bottom-20 -left-10 z-40" delay={1.2} yRange={30}>
                 <div className="w-16 h-16 rounded-2xl bg-slate-900 shadow-2xl flex items-center justify-center">
                    <QrCode size={24} className="text-white" />
                 </div>
              </FloatingItem>

              {/* Glowing Background Blur */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/10 blur-[150px] -z-10 rounded-full" />
            </div>
          </div>
        </div>
      </header>

      {/* --- STATS SECTION: VIBRANT DARK --- */}
      <section className="py-40 bg-foreground relative overflow-hidden">
        <div className="absolute inset-0 noise-overlay opacity-20" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            <StatCounter value={250} suffix="+" label="Elite Studios" icon={Award} />
            <StatCounter value={750000} suffix="+" label="Photos Delivered" icon={ImageIcon} />
            <StatCounter value={1200} suffix="+" label="Premium Events" icon={Sparkles} />
            <StatCounter value={99.9} suffix="%" label="AI Reliability" icon={Shield} />
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS: THE PIPELINE --- */}
      <section className="py-40 px-6 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-end justify-between gap-12 mb-32">
             <div className="max-w-2xl">
                <div className="hero-badge mb-6 border-slate-200 bg-slate-50 text-slate-500 uppercase font-black text-[10px] tracking-[0.2em]">The Workflow</div>
                <h2 className="text-6xl md:text-8xl font-black tracking-tighter italic uppercase leading-none">The Future <br /> <span className="gradient-text">Unfolds.</span></h2>
             </div>
             <p className="text-xl text-text-muted max-w-sm font-medium leading-relaxed italic">"We've eliminated the friction between capture and consumption."</p>
          </div>

          <div className="grid md:grid-cols-3 gap-16 relative">
            <div className="hidden md:block absolute top-[140px] left-[15%] right-[15%] h-[2px] bg-slate-100" />
            
            {[
              { icon: Camera, title: 'Upload', desc: 'Photos stream directly from camera to cloud in real-time.', color: 'primary' },
              { icon: QrCode, title: 'Identify', desc: 'AI analyzes guest selfies and indexes thousands of faces.', color: 'emerald' },
              { icon: Smartphone, title: 'Deliver', desc: 'Galleries are pushed to guest phones in under 1 second.', color: 'accent' },
            ].map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="relative group text-center"
              >
                <div className={`w-32 h-32 rounded-[3.5rem] bg-slate-50 flex items-center justify-center mx-auto mb-10 group-hover:bg-${item.color} group-hover:text-white transition-all duration-700 shadow-xl group-hover:shadow-${item.color}/30 group-hover:-translate-y-3`}>
                  <item.icon size={48} className="group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-3xl font-black mb-4 tracking-tighter uppercase italic">{item.title}</h3>
                <p className="text-text-muted font-medium leading-relaxed px-6">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FEATURE SHOWCASE: INTELLIGENCE GRID --- */}
      <section className="py-40 bg-slate-50 relative noise-overlay">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-32">
             <h2 className="text-6xl md:text-9xl font-black mb-8 tracking-tighter italic uppercase leading-[0.8]">Intelligent <br /><span className="text-primary">Ecosystem.</span></h2>
             <p className="text-2xl text-text-muted font-medium max-w-2xl mx-auto italic">Engineered for high-pressure environments where speed is the only metric that matters.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
               { icon: Target, title: 'Precision Match', desc: 'Works with glasses, masks, and low-light scenarios.', size: 'lg' },
               { icon: ShieldCheck, title: 'Enterprise Privacy', desc: 'Selfie data is processed in-memory and never stored.', size: 'sm' },
               { icon: ZapIcon, title: 'Cloud-Edge Sync', desc: 'Hybrid processing for ultra-low latency worldwide.', size: 'sm' },
               { icon: Globe, title: 'Global Delivery', desc: 'CDNs in 150+ locations for instant photo retrieval.', size: 'lg' },
               { icon: Layers, title: 'Smart Branding', desc: 'Auto-applied watermarks that adapt to photo lighting.', size: 'sm' },
               { icon: Box, title: 'Bulk Archive', desc: 'One-click full event downloads for photographers.', size: 'lg' },
               { icon: Users, title: 'Guest CRM', desc: 'Understand your audience engagement like never before.', size: 'sm' },
               { icon: Heart, title: 'Guest Delight', desc: 'The "Wow" factor that makes your studio unforgettable.', size: 'lg' },
            ].map((f, i) => (
              <div key={i} className={`p-10 rounded-[3rem] bg-white border border-slate-100 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all group ${f.size === 'lg' ? 'lg:col-span-1 lg:row-span-1' : ''}`}>
                 <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-800 flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-all">
                    <f.icon size={28} />
                 </div>
                 <h3 className="text-xl font-black mb-4 tracking-tight uppercase italic">{f.title}</h3>
                 <p className="text-sm text-text-muted font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS & TRUST --- */}
      <section className="py-40 bg-white overflow-hidden relative">
         <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-slate-50 to-transparent -z-10" />
         <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-6xl md:text-9xl font-black mb-24 tracking-tighter italic uppercase leading-[0.8]">The Voice <br />of <span className="text-primary">Excellence.</span></h2>
            
            <div className="grid md:grid-cols-3 gap-10 text-left">
               {[
                  { name: 'Arjun Mehra', role: 'Wedding Director', text: "We delivered 4,000 photos to 500 guests in under 2 minutes. The feedback was absolute shock and delight.", img: 'https://i.pravatar.cc/100?img=11' },
                  { name: 'Sarah Khan', role: 'Event Manager', text: "Manual sharing is dead. SnapMoment is the only tool that has actually made my life easier during busy seasons.", img: 'https://i.pravatar.cc/100?img=32' },
                  { name: 'David Wilson', role: 'Production Lead', text: "The face recognition accuracy even at night events is incredible. A game changer for massive festivals.", img: 'https://i.pravatar.cc/100?img=15' },
               ].map((t, i) => (
                  <div key={i} className="p-10 rounded-[4rem] bg-slate-50 border border-slate-100 shadow-xl group hover:bg-slate-900 hover:text-white transition-all duration-700">
                     <div className="flex gap-1 mb-8 text-primary">
                        {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="currentColor" />)}
                     </div>
                     <p className="text-xl font-medium leading-relaxed italic mb-10 italic">"{t.text}"</p>
                     <div className="flex items-center gap-4">
                        <img src={t.img} className="w-14 h-14 rounded-full border-2 border-primary" alt="" />
                        <div>
                           <div className="font-black text-sm uppercase">{t.name}</div>
                           <div className="text-[10px] font-black text-primary uppercase tracking-widest">{t.role}</div>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* --- FINAL ACTION --- */}
      <section className="py-40 px-6">
        <div className="max-w-7xl mx-auto rounded-[6rem] bg-slate-900 p-20 md:p-40 text-center text-white relative overflow-hidden shadow-4xl group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-purple-600 opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
          <div className="absolute top-0 left-0 w-full h-full noise-overlay opacity-30" />
          
          <div className="relative z-10">
            <h2 className="text-7xl md:text-[11rem] font-black mb-12 tracking-tighter italic uppercase leading-[0.8]">Own the <br /><span className="text-primary">Moment.</span></h2>
            <p className="text-2xl md:text-4xl text-white/60 mb-20 max-w-4xl mx-auto font-medium leading-relaxed">Join the world's most elite photography studios and automate your delivery today.</p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-10">
              <Link to="/signup" className="w-full sm:w-auto px-20 py-8 rounded-[3.5rem] bg-white text-slate-900 font-black text-3xl hover:scale-110 hover:shadow-white/20 transition-all active:scale-95">
                Get Started Now
              </Link>
              <Link to="/contact" className="w-full sm:w-auto px-20 py-8 rounded-[3.5rem] bg-white/5 border-2 border-white/10 text-white font-black text-3xl hover:bg-white/10 transition-all backdrop-blur-md active:scale-95">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

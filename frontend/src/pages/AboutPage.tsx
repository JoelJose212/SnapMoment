import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { 
  Camera, Heart, Zap, ShieldCheck, 
  Target, Sparkles, Award, Users, 
  ArrowRight, Quote, Feather, Map
} from 'lucide-react'
import AuroraRibbon from '../components/shared/AuroraRibbon'
import Navbar from '../components/shared/Navbar'
import Footer from '../components/shared/Footer'
import SplashTag from '../components/shared/SplashTag'
import WaveDivider from '../components/shared/WaveDivider'

const TEAM = [
  { name: 'Joel Jose Varghese', role: 'Chief Technology Officer', img: '/team/joel.jpg' },
  { name: 'Nandini Sinha', role: 'Chief Product Officer', img: '/team/nandini.jpg' },
  { name: 'Manish Kumar Kaushik', role: 'Chief Executive Officer', img: '/team/Manish.jpg' },
  { name: 'Meera Kapoor', role: 'Chief Marketing Officer', img: '/team/meera.jpg' },
  { name: 'Aarav Malhotra', role: 'Cloud Architect', img: '/team/aarav.jpg' },
  { name: 'Meenakshi', role: 'UX/UI Designer', img: '/team/meenakshi.jpg' },
  { name: 'Reita', role: 'AI/ML Engineer', img: '/team/reita.jpg' },
]

const TIMELINE = [
  { year: '2023', label: 'Founded in Bhilai', desc: 'Started with a simple idea: guests deserve better photo delivery.' },
  { year: '2023 Q3', label: 'First AI Integration', desc: 'Achieved elite-grade matching accuracy with deep learning.' },
  { year: '2024 Q1', label: '100 Studio Partners', desc: 'Reached 100 active photographers across 12 cities.' },
  { year: '2024 Q4', label: 'Real-Time Delivery', desc: 'Introduced instant photo delivery with QR-based entry.' },
  { year: '2025 Q3', label: '1 Lakh+ Moments', desc: 'Surpassed 100,000+ successful photo deliveries.' },
  { year: '2026 Q4', label: 'Global Expansion', desc: 'Expanding beyond India to international photography studios.' },
]

export default function AboutPage() {
  const { scrollY } = useScroll()
  const blob1Y = useTransform(scrollY, [0, 1200], [0, -100])
  const blob2Y = useTransform(scrollY, [0, 1200], [0, -60])

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden selection:bg-violet-100">
      <AuroraRibbon />
      <Navbar />

      {/* Hero */}
      <header className="relative pt-36 pb-20 overflow-hidden text-center">
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <motion.div style={{ y: blob1Y }} className="absolute -top-32 right-[-10%] w-[500px] h-[500px] bg-violet-100 blur-[120px] rounded-full opacity-60" />
          <motion.div style={{ y: blob2Y }} className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-cyan-100 blur-[100px] rounded-full opacity-50" />
          <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-amber-100 blur-[100px] rounded-full" />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 60, x: `${15 + Math.random() * 70}%` }}
              animate={{ opacity: [0, 0.5, 0], y: -120 }}
              transition={{ duration: 5 + Math.random() * 3, repeat: Infinity, delay: i * 1.2, ease: 'easeOut' }}
              className="absolute w-1.5 h-1.5 rounded-full bg-violet-300" />
          ))}
        </div>

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16,1,0.3,1] }}>
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-violet-50 border border-violet-200 mb-6">
              <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
              <span className="text-xs font-semibold text-violet-700 tracking-wide uppercase">Our Story</span>
              <SplashTag text="EST. 2023" color="purple" rotation={-3} fontSize={9} />
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-[1.05]">
              <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>Building for the</motion.span><br />
              <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="gradient-text">moments that matter.</motion.span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 max-w-xl mx-auto leading-relaxed">
              SnapMoment was born from a simple question: why do event memories take weeks to arrive?
            </p>
          </motion.div>
        </div>
      </header>

      <WaveDivider fill="#F8FAFC" fromColor="#FFFFFF" />

      {/* Origin Story */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
              className="relative">
              {/* Pulsing glow */}
              <motion.div animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.95, 1.02, 0.95] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -inset-6 bg-violet-100 blur-[40px] rounded-3xl pointer-events-none" />
              <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-100 rotate-1 hover:rotate-0 transition-transform duration-700">
                <img src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800" alt="Event" className="w-full h-[480px] object-cover" />
              </div>
              {/* Floating stat card */}
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-8 -right-4 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 hidden lg:block">
                <div className="text-3xl font-black gradient-text mb-0.5 tracking-tight">200+</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Studio Partners</div>
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
              className="space-y-8">
              <div className="inline-flex items-center gap-2 text-violet-500 font-semibold text-xs uppercase tracking-widest">
                <Feather size={14} /> Our Beginning
                <SplashTag text="TRUE STORY" color="amber" rotation={3} fontSize={8} />
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">How it all started...</h2>
              <div className="space-y-5 text-base text-slate-500 leading-relaxed">
                <p>We were at a friend's wedding in 2023. The photographer captured thousands of precious memories. But sharing meant a Google Drive link — 3,000 photos for 400 guests. Chaos.</p>
                <p>Our co-founders, <span className="text-slate-900 font-bold">Joel and Nandini</span>, spent the evening manually forwarding photos to relatives. "There has to be a better way," they said. Six months later, <span className="gradient-text font-black">SnapMoment</span> was born.</p>
                <p>Today, SnapMoment powers studios across India, delivering memories at weddings, festivals, and celebrations — instantly.</p>
              </div>
              <div className="flex items-center gap-5 pt-6 border-t border-slate-200">
                <div className="flex -space-x-2.5">
                  {[1, 2, 3, 4].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/80?img=${i+10}`} className="w-9 h-9 rounded-full border-2 border-white shadow-sm object-cover" alt="" />
                  ))}
                </div>
                <div className="text-xs text-slate-400 font-semibold">Trusted by <span className="text-slate-700 font-bold">250+</span> studios</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <WaveDivider fill="#FFFFFF" fromColor="#F8FAFC" />

      {/* Values */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 border border-violet-200 mb-4">
              <span className="text-xs font-semibold text-violet-700 tracking-wide uppercase">Our Values</span>
              <SplashTag text="CORE" color="purple" rotation={-2} fontSize={8} />
            </div>
            <h2 className="text-4xl md:text-[3.5rem] font-black text-slate-900 mb-4 tracking-tight">
              What we <span className="gradient-text">believe in</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-7">
            {[
              { icon: ShieldCheck, title: 'Privacy First', desc: 'Guest selfies are processed and purged immediately. We never store biometric data beyond the matching moment.', color: 'from-violet-500 to-violet-700' },
              { icon: Heart, title: 'Human Centric', desc: 'AI is our tool, not our product. Every feature is designed around the human experience of sharing joy.', color: 'from-rose-500 to-pink-600' },
              { icon: Zap, title: 'Zero Friction', desc: "No apps. No passwords. Scan, verify, smile — that's the entirety of the guest journey.", color: 'from-cyan-500 to-cyan-700' },
            ].map((v, i) => {
              const Icon = v.icon
              return (
                <motion.div key={v.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.12 }}
                  className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-violet-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-400">
                  <motion.div whileHover={{ rotate: 10, scale: 1.1 }} transition={{ type: 'spring' }}
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${v.color} flex items-center justify-center mb-6 shadow-lg`}>
                    <Icon size={24} className="text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{v.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{v.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 px-6 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 mb-4">
              <span className="text-xs font-semibold text-cyan-700 tracking-wide uppercase">Timeline</span>
            </div>
            <h2 className="text-4xl md:text-[3.5rem] font-black text-slate-900 mb-4 tracking-tight">
              Our <span className="gradient-text">Journey</span>{' '}
              <SplashTag text="EST. 2023" color="amber" rotation={-2} fontSize={10} />
            </h2>
          </motion.div>
          
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-violet-200 via-cyan-200 to-violet-200 -translate-x-1/2" />
            
            <div className="space-y-16">
              {TIMELINE.map((item, i) => (
                <motion.div key={item.year} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className={`relative flex flex-col md:flex-row items-start md:items-center gap-8 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                  {/* Dot */}
                  <motion.div whileInView={{ scale: [0, 1.3, 1] }} viewport={{ once: true }} transition={{ delay: i * 0.08 + 0.2 }}
                    className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 border-4 border-white shadow-lg -translate-x-1/2 z-10" />
                  <div className={`flex-1 md:w-1/2 pl-12 md:pl-0 ${i % 2 === 0 ? 'md:text-right md:pr-12' : 'md:pl-12'}`}>
                    <div className="text-xs font-bold text-violet-500 uppercase tracking-widest mb-2">{item.year}</div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{item.label}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="flex-1 md:w-1/2 hidden md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-violet-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 mb-4">
              <Users size={13} className="text-violet-400" />
              <span className="text-xs font-semibold text-white/70 tracking-wide uppercase">The Team</span>
              <SplashTag text="WE'RE HIRING" color="emerald" rotation={3} fontSize={8} />
            </div>
            <h2 className="text-4xl md:text-[3.5rem] font-black text-white mb-4 tracking-tight">
              Meet the <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">builders</span>
            </h2>
          </motion.div>

          <div className="flex gap-6 animate-marquee hover:[animation-play-state:paused] py-6">
            {[...TEAM, ...TEAM].map((member, idx) => (
              <div key={idx} className="w-64 shrink-0 group">
                <div className="relative h-[360px] rounded-3xl overflow-hidden shadow-xl border border-white/5 bg-slate-800">
                  <img src={member.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105 opacity-50 group-hover:opacity-100" alt={member.name} />
                  <div className="absolute bottom-0 inset-x-0 p-7 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent">
                    <h3 className="text-lg font-bold mb-0.5 tracking-tight">{member.name}</h3>
                    <p className="text-violet-400 font-semibold text-[10px] uppercase tracking-widest">{member.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Quote */}
      <section className="py-24 px-6 bg-white">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center">
          <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: 'spring' }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 text-white mb-10 shadow-lg shadow-violet-200">
            <Quote size={22} />
          </motion.div>
          <blockquote className="text-2xl md:text-4xl font-black tracking-tight text-slate-800 leading-tight mb-12">
            "We didn't just build an AI platform. We built a{' '}
            <span className="gradient-text">bridge for memories</span>.
            Technology should feel like magic, and that's exactly what SnapMoment brings to every event."
          </blockquote>
          <div className="flex flex-col items-center">
            <img src="/team/joel.jpg" className="w-16 h-16 rounded-full border-3 border-white shadow-xl mb-4 object-cover hover:scale-110 transition-transform duration-300" alt="Joel" />
            <p className="font-bold text-lg text-slate-900">Joel Jose Varghese</p>
            <p className="text-xs font-semibold text-violet-500 uppercase tracking-widest mt-1">CTO & Founder</p>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative rounded-[2.5rem] overflow-hidden text-center p-14 md:p-20 bg-gradient-to-br from-violet-600 via-violet-700 to-cyan-600 shadow-2xl shadow-violet-300">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.15),transparent_60%)]" />
            <motion.div animate={{ x: ['-150%', '250%'] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 3 }}
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none skew-x-[-20deg]" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6">
                <Sparkles size={13} className="text-white/80" />
                <span className="text-xs font-semibold text-white/80 tracking-widest uppercase">Join Our Mission</span>
                <SplashTag text="LET'S GO" color="emerald" rotation={-4} fontSize={9} />
              </div>
              <h2 className="text-4xl md:text-[3.5rem] font-black text-white mb-5 leading-tight tracking-tight">
                Be part of the <br className="hidden md:block" /> future of events.
              </h2>
              <p className="text-white/70 text-lg max-w-lg mx-auto mb-10 leading-relaxed">
                Join 250+ studios already transforming how they deliver memories.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/signup" className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl bg-white text-violet-700 font-bold text-base hover:bg-violet-50 hover:scale-[1.03] active:scale-95 transition-all shadow-lg">
                  Get Started Free <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/contact" className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-4 rounded-2xl bg-white/10 border border-white/25 text-white font-semibold text-base hover:bg-white/20 active:scale-95 transition-all">
                  Join the Team
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

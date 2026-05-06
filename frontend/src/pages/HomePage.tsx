import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import {
  Camera, Star, Check, QrCode, Sparkles,
  ArrowRight, Heart, Award, ShieldCheck,
  Download, Bell, ZapIcon, Target,
  Globe, Box, Palette, Users,
  Image as ImageIcon, Zap, Compass, Feather
} from 'lucide-react'
import AuroraRibbon from '../components/shared/AuroraRibbon'
import Navbar from '../components/shared/Navbar'
import Footer from '../components/shared/Footer'
import SplashTag from '../components/shared/SplashTag'
import WaveDivider from '../components/shared/WaveDivider'

/* ── animated counter ── */
function useCountUp(target: number, dur = 1800, go = false) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!go) return
    let s = 0; const step = target / (dur / 16)
    const t = setInterval(() => { s += step; if (s >= target) { setV(target); clearInterval(t) } else setV(Math.floor(s)) }, 16)
    return () => clearInterval(t)
  }, [go, target, dur])
  return v
}

function StatCard({ value, suffix, label, icon: Icon, color }: any) {
  const ref = useRef<HTMLDivElement>(null)
  const [go, setGo] = useState(false)
  const count = useCountUp(value, 1800, go)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setGo(true) }, { threshold: 0.4 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      className="group p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-400 text-center">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 mx-auto shadow-lg ${color}`}>
        <Icon size={22} />
      </div>
      <div className="text-4xl font-black text-slate-900 tracking-tight mb-1">{count.toLocaleString()}{suffix}</div>
      <div className="text-sm font-semibold text-slate-400 uppercase tracking-widest">{label}</div>
    </motion.div>
  )
}

const features = [
  { icon: Target,     title: 'Face Match AI',    desc: 'Identifies guests instantly across thousands of photos.' },
  { icon: ZapIcon,    title: 'Real-Time',         desc: 'Photos reach every guest within seconds of capture.' },
  { icon: ShieldCheck,title: 'Privacy First',     desc: 'Biometric data is purged right after matching.' },
  { icon: Globe,      title: 'Global CDN',        desc: 'Edge nodes ensure instant access from anywhere.' },
  { icon: Palette,    title: 'Custom Branding',   desc: 'Watermarks & galleries reflecting your studio DNA.' },
  { icon: Box,        title: 'Bulk Export',       desc: 'ZIP archives delivered post-event in minutes.' },
  { icon: Users,      title: 'Analytics',         desc: 'Deep engagement data to grow your business.' },
  { icon: Heart,      title: 'Wow Factor',        desc: 'An experience guests remember and talk about.' },
]

const steps = [
  { icon: Camera,  n: '01', title: 'Capture',  desc: 'Shoot as normal — photos stream to the cloud instantly.' },
  { icon: Compass, n: '02', title: 'Identify', desc: 'AI matches every face across all event photos in milliseconds.' },
  { icon: Feather, n: '03', title: 'Deliver',  desc: 'Guests receive a personal gallery link on their phone instantly.' },
]

const testimonials = [
  { name: 'Sam Matthew',  role: 'Wedding Director', q: 'We delivered 4,000 photos to 500 guests in under 2 minutes. The feedback was absolute shock and delight.', img: 'https://images.pexels.com/photos/3930942/pexels-photo-3930942.jpeg?w=100' },
  { name: 'Sarah Bob',    role: 'Event Manager',    q: 'Manual sharing is dead. SnapMoment is the only tool that has genuinely made my life easier during peak season.', img: 'https://i.pravatar.cc/100?img=32' },
  { name: 'David Wilson', role: 'Production Lead',  q: 'Face recognition accuracy at night events is incredible. An absolute game-changer for large-scale festivals.', img: 'https://images.pexels.com/photos/29133444/pexels-photo-29133444.jpeg?w=100' },
]

/* ── floating sparkle particles ── */
const Particle = ({ delay }: { delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 100, x: `${Math.random() * 80 + 10}%` }}
    animate={{ opacity: [0, 0.6, 0], y: -200 }}
    transition={{ duration: 6 + Math.random() * 4, repeat: Infinity, delay, ease: 'easeOut' }}
    className="absolute w-1.5 h-1.5 rounded-full bg-violet-300 pointer-events-none"
  />
)

export default function HomePage() {
  const { scrollYProgress } = useScroll()
  const heroY       = useTransform(scrollYProgress, [0, 0.3], [0, -50])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0])

  /* mouse-following glow */
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const orbX = useSpring(mouseX, { stiffness: 30, damping: 20 })
  const orbY = useSpring(mouseY, { stiffness: 30, damping: 20 })
  const handleMouse = (e: React.MouseEvent) => { mouseX.set(e.clientX); mouseY.set(e.clientY) }

  /* parallax blobs */
  const { scrollY } = useScroll()
  const blob1Y = useTransform(scrollY, [0, 1500], [0, -120])
  const blob2Y = useTransform(scrollY, [0, 1500], [0, -80])

  return (
    <div onMouseMove={handleMouse} className="min-h-screen bg-white text-slate-900 overflow-x-hidden selection:bg-violet-100">

      {/* ── MOUSE FOLLOWING GLOW ── */}
      <motion.div
        style={{ x: orbX, y: orbY, translateX: '-50%', translateY: '-50%' }}
        className="fixed top-0 left-0 w-[500px] h-[500px] bg-violet-200/30 blur-[140px] rounded-full pointer-events-none z-0"
      />

      {/* ── TOP RIBBON ── */}
      <AuroraRibbon />
      <Navbar />

      {/* ── HERO ── */}
      <header className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-8">
        {/* Animated parallax blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div style={{ y: blob1Y }} className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-violet-100 rounded-full blur-[120px] opacity-60" />
          <motion.div style={{ y: blob2Y }} className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-cyan-100 rounded-full blur-[100px] opacity-50" />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/3 left-1/2 w-[300px] h-[300px] bg-amber-100 rounded-full blur-[100px] opacity-30"
          />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 10 }).map((_, i) => <Particle key={i} delay={i * 0.8} />)}
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-16 xl:gap-24 items-center">

            {/* Left */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16,1,0.3,1] }}>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 border border-violet-200 mb-6">
                <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                <span className="text-xs font-semibold text-violet-700 tracking-wide uppercase">AI-Powered Photo Delivery</span>
                <SplashTag text="NEW" color="purple" rotation={-2} fontSize={9} />
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black leading-[1.05] tracking-tight mb-6 text-slate-900">
                <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}>Every Memory.</motion.span>{' '}
                <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.6 }} className="gradient-text">Delivered</motion.span>{' '}
                <br className="hidden md:block" />
                <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65, duration: 0.6 }} className="relative inline-block">
                  Instantly.
                  <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1.2, duration: 0.8, ease: 'circOut' }}
                    className="absolute -bottom-1.5 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full origin-left" />
                </motion.span>
              </h1>

              <p className="text-xl text-slate-500 leading-relaxed max-w-lg mb-10">
                SnapMoment uses facial recognition to send every guest their{' '}
                <span className="text-slate-800 font-semibold">personalized photo gallery</span>{' '}
                — no sharing, no searching, just pure magic.
              </p>

              <div className="flex flex-wrap gap-4 mb-12">
                <Link to="/signup" className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold text-sm shadow-lg shadow-violet-200 hover:shadow-xl hover:shadow-violet-300 hover:scale-[1.03] active:scale-95 transition-all duration-300">
                  Start Free Trial <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/demo" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-semibold text-sm hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50 active:scale-95 transition-all duration-300">
                  <Sparkles size={15} className="text-violet-500" /> Watch Demo
                </Link>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-5">
                <div className="flex -space-x-2.5">
                  {[31,32,33,34].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/80?img=${i}`} className="w-9 h-9 rounded-full border-2 border-white shadow-sm object-cover" alt="" />
                  ))}
                </div>
                <div>
                  <div className="flex gap-0.5 mb-0.5">{[1,2,3,4,5].map(s => <Star key={s} size={11} className="text-amber-400 fill-amber-400" />)}</div>
                  <div className="text-xs text-slate-400">Loved by <span className="text-slate-700 font-semibold">5,000+</span> studios worldwide</div>
                </div>
              </div>
            </motion.div>

            {/* Right — phone */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.15, ease: [0.16,1,0.3,1] }}
              className="relative flex justify-center items-center py-8">

              {/* Floating card: match */}
              <motion.div animate={{ y: [0,-10,0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -left-4 top-16 z-30 bg-white border border-slate-100 shadow-xl p-4 rounded-2xl w-52">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow">
                    <Check size={12} strokeWidth={3} className="text-white" />
                  </div>
                  <span className="text-xs font-bold text-slate-600">Match Found!</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">24 photos synced for <span className="text-violet-600 font-semibold">Wedding Reception</span></p>
              </motion.div>

              {/* Floating card: speed */}
              <motion.div animate={{ y: [0,10,0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -right-4 bottom-24 z-30 bg-slate-900 border border-slate-800 shadow-xl p-4 rounded-2xl w-40 text-white">
                <div className="flex items-center gap-1.5 mb-1">
                  <Zap size={12} className="text-amber-400 fill-amber-400" />
                  <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest">AI Speed</span>
                </div>
                <div className="text-2xl font-black tracking-tight">0.2s</div>
                <div className="text-[9px] text-white/40 uppercase tracking-widest mt-0.5">Per identification</div>
              </motion.div>

              {/* Pulsing glow ring behind phone */}
              <motion.div
                animate={{ opacity: [0.4, 0.7, 0.4], scale: [0.95, 1.05, 0.95] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute w-[280px] h-[550px] rounded-[3.5rem] bg-gradient-to-br from-violet-200 to-cyan-200 blur-xl pointer-events-none"
              />

              {/* Phone frame */}
              <div className="relative w-[248px] h-[520px] bg-slate-50 rounded-[3rem] border-4 border-slate-200 shadow-[0_30px_80px_-10px_rgba(109,40,217,0.18),0_0_0_1px_rgba(0,0,0,0.04)] overflow-hidden">
                {/* Notch */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-5 bg-slate-900 rounded-full z-20" />
                <div className="h-full flex flex-col pt-10 pb-3 px-3">
                  {/* Header */}
                  <div className="flex items-center justify-between px-2 mb-4">
                    <span className="text-sm font-black text-slate-900">SnapMoment</span>
                    <div className="relative">
                      <Bell size={15} className="text-slate-400" />
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-violet-500 rounded-full" />
                    </div>
                  </div>
                  {/* Processing */}
                  <div className="mx-1 bg-white border border-slate-100 rounded-2xl p-3 mb-3 shadow-sm">
                    <div className="text-[9px] text-violet-600 font-bold uppercase tracking-widest mb-1">AI Processing</div>
                    <div className="text-sm font-bold text-slate-900 mb-2">Syncing memories...</div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div animate={{ x:['-100%','100%'] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-1/2 h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full" />
                    </div>
                  </div>
                  {/* Photo grid */}
                  <div className="flex-1 grid grid-cols-2 gap-1.5 px-1 overflow-hidden">
                    {[
                      'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=200&fit=crop',
                      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=200&fit=crop',
                      'https://images.unsplash.com/photo-1519741497674-611481863552?w=200&fit=crop',
                      'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=200&fit=crop',
                    ].map((url, i) => (
                      <div key={i} className="rounded-xl overflow-hidden aspect-square shadow-sm">
                        <img src={url} className="w-full h-full object-cover" alt="" />
                      </div>
                    ))}
                  </div>
                  {/* CTA */}
                  <div className="mx-1 mt-3 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-600 flex items-center justify-center gap-2 shadow-lg">
                    <Download size={13} className="text-white" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">Open My Gallery</span>
                  </div>
                </div>
              </div>

              {/* Corner icons */}
              <motion.div animate={{ y:[0,-14,0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -right-2 z-40">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-lg border border-slate-100 flex items-center justify-center">
                  <Camera size={24} className="text-violet-600" />
                </div>
              </motion.div>
              <motion.div animate={{ y:[0,14,0] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
                className="absolute -bottom-2 -left-4 z-40">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 shadow-lg border border-slate-800 flex items-center justify-center">
                  <QrCode size={22} className="text-cyan-400" />
                </div>
              </motion.div>
            </motion.div>

          </div>
        </motion.div>
      </header>

      {/* Wave into stats */}
      <WaveDivider fill="#F8FAFC" fromColor="#FFFFFF" />

      {/* ── STATS ── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard value={250}    suffix="+"  label="Studio Partners"   icon={Award}      color="bg-gradient-to-br from-violet-500 to-violet-700" />
            <StatCard value={750000} suffix="+"  label="Photos Delivered"  icon={ImageIcon}  color="bg-gradient-to-br from-cyan-500 to-cyan-700" />
            <StatCard value={1200}   suffix="+"  label="Events Powered"    icon={Sparkles}   color="bg-gradient-to-br from-amber-500 to-orange-500" />
            <StatCard value={99}     suffix="%"  label="Accuracy Rate"     icon={ShieldCheck} color="bg-gradient-to-br from-emerald-500 to-emerald-700" />
          </div>
        </div>
      </section>

      <WaveDivider fill="#FFFFFF" fromColor="#F8FAFC" />

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 mb-4">
              <span className="text-xs font-semibold text-cyan-700 tracking-widest uppercase">How It Works</span>
            </div>
            <h2 className="text-4xl md:text-[3.5rem] font-black text-slate-900 mb-4">Three steps to <span className="gradient-text">pure magic</span></h2>
            <p className="text-slate-400 text-lg max-w-lg mx-auto">From shutter click to guest gallery in seconds — no app downloads required.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-7 relative">
            {/* connector */}
            <div className="hidden md:block absolute top-12 left-[22%] right-[22%] h-px bg-gradient-to-r from-violet-200 via-cyan-200 to-violet-200" />
            {steps.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.15 }}
                className="group relative p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-violet-200 hover:bg-violet-50/30 hover:-translate-y-1 transition-all duration-400 text-center">
                <div className="text-8xl font-black text-slate-100 leading-none absolute top-3 right-5 select-none group-hover:text-violet-100 transition-colors">{s.n}</div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white mx-auto mb-5 shadow-lg shadow-violet-200 group-hover:scale-110 transition-transform duration-300">
                  <s.icon size={24} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">{s.title}</h3>
                <p className="text-base text-slate-500 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 border border-violet-200 mb-4">
              <span className="text-xs font-semibold text-violet-700 tracking-widest uppercase">Platform</span>
            </div>
            <h2 className="text-4xl md:text-[3.5rem] font-black text-slate-900 mb-4">
              Everything you need.{' '}
              <span className="gradient-text">Nothing you don't.</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.07 }}
                className="group p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-violet-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-100 to-cyan-100 flex items-center justify-center mb-4 group-hover:from-violet-500 group-hover:to-cyan-500 transition-all duration-400">
                  <f.icon size={20} className="text-violet-600 group-hover:text-white transition-colors duration-400" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1.5">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-[3.5rem] font-black text-slate-900 mb-3">
              Loved by <span className="gradient-text">creators worldwide</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-sm mx-auto">Real studios. Real results. Real impact.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.15 }}
                className="group p-7 rounded-3xl bg-slate-50 border border-slate-100 hover:border-violet-200 hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-400">
                <div className="flex gap-1 mb-5">{[1,2,3,4,5].map(s => <Star key={s} size={13} className="text-amber-400 fill-amber-400" />)}</div>
                <p className="text-base text-slate-600 leading-relaxed italic mb-6">"{t.q}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.img} className="w-11 h-11 rounded-full object-cover border-2 border-white shadow" alt={t.name} />
                  <div>
                    <div className="text-sm font-bold text-slate-900">{t.name}</div>
                    <div className="text-[10px] font-semibold text-violet-600 uppercase tracking-widest">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative rounded-[2.5rem] overflow-hidden text-center p-14 md:p-20 bg-gradient-to-br from-violet-600 via-violet-700 to-cyan-600 shadow-2xl shadow-violet-300">
            {/* shimmer */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.15),transparent_60%)]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-white/20" />
            {/* Animated shine sweep */}
            <motion.div
              animate={{ x: ['-150%', '250%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 3 }}
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none skew-x-[-20deg]"
            />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6">
                <Sparkles size={13} className="text-white/80" />
                <span className="text-xs font-semibold text-white/80 tracking-widest uppercase">Ready to Launch?</span>
              </div>
              <h2 className="text-4xl md:text-[3.5rem] font-black text-white mb-5 leading-tight">
                Transform how you deliver <br className="hidden md:block" /> your moments.
              </h2>
              <p className="text-white/70 text-lg max-w-lg mx-auto mb-10 leading-relaxed">
                Join 250+ photography studios already using SnapMoment to delight their guests. Setup takes under 5 minutes.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/signup" className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl bg-white text-violet-700 font-bold text-base hover:bg-violet-50 hover:scale-[1.03] active:scale-95 transition-all duration-300 shadow-lg">
                  Get Started Free <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/contact" className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-4 rounded-2xl bg-white/10 border border-white/25 text-white font-semibold text-base hover:bg-white/20 active:scale-95 transition-all duration-300">
                  Talk to Sales
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

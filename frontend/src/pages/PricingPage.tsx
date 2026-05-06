import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useScroll } from 'framer-motion'
import { 
  Check, ChevronDown, CheckCircle2, XCircle, 
  Sparkles, Zap, Shield, Crown, Globe,
  ArrowRight, Heart, Award, Star, 
  HelpCircle, CreditCard,
  Target, Rocket, TrendingUp, Camera, Clock, Calendar,
  Layers, ShieldCheck, Image as ImageIcon, Gem, Compass
} from 'lucide-react'
import Navbar from '../components/shared/Navbar'
import Footer from '../components/shared/Footer'
import SplashTag from '../components/shared/SplashTag'
import AuroraRibbon from '../components/shared/AuroraRibbon'
import WaveDivider from '../components/shared/WaveDivider'

const FAQ = [
  { q: 'Can I upgrade or downgrade my plan at any time?', a: 'Yes, you can upgrade, downgrade, or cancel your subscription at any time from your dashboard settings. Changes are immediate and prorated.' },
  { q: 'Is there a limit on how long photos are hosted?', a: 'Artisan and Visionary accounts keep photos hosted for 30 days after an event. Royal Studio accounts enjoy permanent priority hosting.' },
  { q: 'What happens if I go over my photo limit?', a: 'If you need to upload an extra batch for a massive event, you can buy a one-time "Event Boost" for ₹500 without needing to upgrade your monthly tier.' },
  { q: 'Do guests need to pay to download photos?', a: 'No! Guests never pay anything to access or download their matched photos. Your service remains premium and free for them.' },
  { q: 'Can I use my own logo on the photos?', a: 'Yes, Visionary and Royal plans allow you to upload your own branding, which our AI automatically applies as a watermark to every guest photo.' },
]

function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const mouseXSpring = useSpring(x)
  const mouseYSpring = useSpring(y)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["4deg", "-4deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-4deg", "4deg"])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    x.set(e.clientX / rect.width - 0.5)
    y.set(e.clientY / rect.height - 0.5)
  }

  return (
    <motion.div onMouseMove={handleMouseMove} onMouseLeave={() => { x.set(0); y.set(0) }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className={className}>
      <div style={{ transform: "translateZ(20px)", transformStyle: "preserve-3d" }}>{children}</div>
    </motion.div>
  )
}

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [isYearly, setIsYearly] = useState(false)

  const { scrollY } = useScroll()
  const blob1Y = useTransform(scrollY, [0, 1000], [0, -80])
  const blob2Y = useTransform(scrollY, [0, 1000], [0, -50])

  const DISCOUNT_FACTOR = 0.75

  const plans = [
    { 
      name: 'Starter', monthlyPrice: 0, icon: Compass,
      desc: 'Perfect for trying SnapMoment on small events.',
      features: ['5 events / month', '200 photos / event', 'AI Face Matching', 'Standard Watermark', 'Guest QR Flow'],
      cta: 'Start for Free', accent: 'from-slate-600 to-slate-800',
    },
    { 
      name: 'Pro', monthlyPrice: 1499, icon: Crown, popular: true,
      desc: 'For busy photographers doing weekly events.',
      features: ['50 events / month', '4,000 photos / event', 'Custom Branding', 'Gallery Analytics', 'Bulk Download (ZIP)', 'Priority Support'],
      cta: 'Go Pro', accent: 'from-violet-600 to-cyan-600',
    },
    { 
      name: 'Enterprise', monthlyPrice: 4999, icon: Globe,
      desc: 'Unlimited power for large production houses.',
      features: ['Unlimited events', 'Unlimited photos', 'White-label Experience', 'API Access', 'Custom Domain', 'Dedicated Manager'],
      cta: 'Contact Sales', accent: 'from-slate-800 to-slate-950',
    },
  ]

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden selection:bg-violet-100">
      <AuroraRibbon />
      <Navbar />

      {/* Hero */}
      <header className="relative pt-36 pb-12 overflow-hidden text-center">
        {/* Animated blobs */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <motion.div style={{ y: blob1Y }} className="absolute -top-32 -left-20 w-[500px] h-[500px] bg-violet-100 blur-[120px] rounded-full opacity-60" />
          <motion.div style={{ y: blob2Y }} className="absolute -bottom-32 -right-20 w-[500px] h-[500px] bg-cyan-100 blur-[100px] rounded-full opacity-50" />
          <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.35, 0.2] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
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

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16,1,0.3,1] }}>
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-violet-50 border border-violet-200 mb-6">
              <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
              <span className="text-xs font-semibold text-violet-700 tracking-wide uppercase">Simple Pricing</span>
              <SplashTag text="NO HIDDEN FEES" color="purple" rotation={-3} fontSize={9} />
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-[1.05]">
              <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>Plans that</motion.span><br />
              <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="gradient-text">grow with you.</motion.span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 max-w-xl mx-auto leading-relaxed mb-12">
              Start free, upgrade when ready. No contracts, cancel anytime.
            </p>

            {/* Toggle */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="flex flex-col items-center gap-5 mb-20">
              <div className="relative p-1.5 bg-slate-50 rounded-full border border-slate-100 flex items-center">
                <motion.div className="absolute inset-y-1.5 rounded-full bg-gradient-to-r from-violet-600 to-cyan-600 z-0"
                  initial={false}
                  animate={{ left: isYearly ? 'calc(50% + 4px)' : '6px', right: isYearly ? '6px' : 'calc(50% + 4px)' }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                <button onClick={() => setIsYearly(false)}
                  className={`relative z-10 px-8 py-3 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${!isYearly ? 'text-white' : 'text-slate-400'}`}>
                  <Clock size={14} /> Monthly
                </button>
                <button onClick={() => setIsYearly(true)}
                  className={`relative z-10 px-8 py-3 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${isYearly ? 'text-white' : 'text-slate-400'}`}>
                  <Calendar size={14} /> Yearly
                  {isYearly && <span className="absolute -top-1 -right-1 flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" /></span>}
                </button>
              </div>

              <AnimatePresence>
                {isYearly && (
                  <motion.div initial={{ y: 5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 5, opacity: 0 }}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full">
                    <span className="text-xs font-bold text-emerald-600">🎉 Save 25% with annual billing</span>
                    <SplashTag text="BEST VALUE" color="emerald" rotation={2} fontSize={8} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
      </header>

      {/* Pricing Cards */}
      <section className="pb-28 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {plans.map((plan, i) => {
              const Icon = plan.icon
              return (
                <TiltCard key={plan.name} className="relative group">
                  <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.12, duration: 0.6 }}
                    className={`p-10 rounded-[2.5rem] bg-white border relative flex flex-col h-full transition-all duration-500 ${
                      plan.popular
                        ? 'border-violet-200 ring-4 ring-violet-100 scale-[1.03] shadow-[0_30px_80px_-15px_rgba(109,40,217,0.15)]'
                        : 'border-slate-100 shadow-sm hover:border-violet-200 hover:shadow-lg'
                    }`}>

                    {plan.popular && (
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-violet-200 z-20 whitespace-nowrap flex items-center gap-2">
                        <Sparkles size={10} /> Most Popular
                        <SplashTag text="🔥" color="amber" rotation={8} fontSize={10} />
                      </div>
                    )}
                    
                    <div className="mb-8 text-center">
                      <motion.div whileHover={{ rotate: 15, scale: 1.1 }} transition={{ type: 'spring' }}
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.accent} flex items-center justify-center mb-6 mx-auto shadow-lg`}>
                        <Icon size={26} className="text-white" />
                      </motion.div>
                      <h3 className="text-2xl font-black mb-1 tracking-tight text-slate-900">{plan.name}</h3>
                      <p className="text-slate-400 text-sm mb-6">{plan.desc}</p>
                      
                      <div className="flex items-baseline justify-center gap-1.5">
                        <AnimatePresence mode="wait">
                          <motion.span key={isYearly ? 'y' : 'm'} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                            className="text-5xl font-black tracking-tighter text-slate-900">
                            ₹{isYearly ? Math.round(plan.monthlyPrice * 12 * DISCOUNT_FACTOR).toLocaleString('en-IN') : plan.monthlyPrice.toLocaleString('en-IN')}
                          </motion.span>
                        </AnimatePresence>
                        <div className="flex flex-col text-left">
                          <span className="text-slate-400 font-semibold text-xs">{isYearly ? '/year' : (plan.name === 'Starter' ? '/event' : '/month')}</span>
                          {isYearly && plan.monthlyPrice > 0 && <span className="text-emerald-500 font-bold text-[10px]">Save 25%</span>}
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-slate-100 w-full mb-8" />

                    <ul className="space-y-4 mb-10 flex-1">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-center gap-3 text-sm text-slate-600">
                          <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 ${plan.popular ? 'bg-violet-100 text-violet-600' : 'bg-slate-50 text-slate-400'}`}>
                            <Check size={12} strokeWidth={3} />
                          </div>
                          {f}
                        </li>
                      ))}
                    </ul>

                    <Link to="/signup"
                      className={`w-full py-4 rounded-2xl font-bold text-sm transition-all duration-300 text-center flex items-center justify-center gap-2 ${
                        plan.popular
                          ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-lg shadow-violet-200 hover:scale-[1.02] active:scale-95'
                          : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95'
                      }`}>
                      {plan.cta} <ArrowRight size={14} />
                    </Link>
                  </motion.div>
                </TiltCard>
              )
            })}
          </div>
        </div>
      </section>

      <WaveDivider fill="#F8FAFC" fromColor="#FFFFFF" />

      {/* Comparison Table */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 border border-violet-200 mb-4">
              <Layers size={13} className="text-violet-500" />
              <span className="text-xs font-semibold text-violet-700 tracking-wide uppercase">Compare Plans</span>
              <SplashTag text="DETAILED" color="teal" rotation={-2} fontSize={8} />
            </div>
            <h2 className="text-4xl md:text-[3.5rem] font-black text-slate-900 mb-4 tracking-tight">
              Full <span className="gradient-text">Feature Comparison</span>
            </h2>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="py-8 px-8 text-slate-800 font-black text-lg tracking-tight">Feature</th>
                    <th className="py-8 px-6 text-slate-400 font-bold text-center text-xs uppercase tracking-widest">Starter</th>
                    <th className="py-8 px-6 text-violet-600 font-bold text-center text-xs uppercase tracking-widest bg-violet-50/50">Pro</th>
                    <th className="py-8 px-6 text-slate-800 font-bold text-center text-xs uppercase tracking-widest">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    ['Monthly Events', '5', '50', 'Unlimited', Zap],
                    ['Photos / Event', '200', '4,000', 'Unlimited', ImageIcon],
                    ['AI Face Recognition', true, true, true, Sparkles],
                    ['Guest QR Flow', true, true, true, ShieldCheck],
                    ['Custom Branding', 'Basic', 'Full', 'Whitelabel', Layers],
                    ['Bulk ZIP Export', false, true, true, Clock],
                    ['Dedicated Manager', false, false, true, Rocket],
                  ].map((row, i) => {
                    const RowIcon = row[4] as any
                    return (
                      <motion.tr key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                        className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                        <td className="py-5 px-8 font-semibold text-slate-700 flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300">
                            <RowIcon size={14} />
                          </div>
                          {row[0] as string}
                        </td>
                        {(row.slice(1, 4) as (string | boolean)[]).map((val, j) => (
                          <td key={j} className={`py-5 px-6 text-center font-bold ${j === 1 ? 'bg-violet-50/30' : ''}`}>
                            {typeof val === 'boolean' ? (
                              val ? <CheckCircle2 size={18} className="mx-auto text-emerald-500" /> : <XCircle className="mx-auto text-slate-200" size={18} />
                            ) : (
                              <span className={`text-sm ${j === 1 ? 'text-violet-600' : 'text-slate-600'}`}>{val as string}</span>
                            )}
                          </td>
                        ))}
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      <WaveDivider fill="#FFFFFF" fromColor="#F8FAFC" />

      {/* FAQ */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 mb-4">
              <HelpCircle size={13} className="text-cyan-600" />
              <span className="text-xs font-semibold text-cyan-700 tracking-wide uppercase">FAQ</span>
              <SplashTag text="ANSWERS" color="teal" rotation={3} fontSize={8} />
            </div>
            <h2 className="text-4xl md:text-[3.5rem] font-black text-slate-900 mb-4 tracking-tight">
              Got <span className="gradient-text">Questions?</span>
            </h2>
            <p className="text-slate-400 text-lg">We've got answers. If not, reach out anytime.</p>
          </motion.div>
          
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-2xl border transition-all duration-300 ${openFaq === i ? 'border-violet-200 bg-violet-50/30 shadow-md' : 'border-slate-100 bg-white hover:border-violet-100'}`}>
                <button className="w-full py-5 px-6 text-left flex items-center justify-between" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className={`font-bold text-base tracking-tight transition-colors ${openFaq === i ? 'text-violet-700' : 'text-slate-800'}`}>{item.q}</span>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 shrink-0 ml-4 ${openFaq === i ? 'bg-violet-600 text-white rotate-180' : 'bg-slate-50 text-slate-300'}`}>
                    <ChevronDown size={16} />
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="px-6 pb-5 text-slate-500 text-sm leading-relaxed">{item.a}</motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
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
                <Rocket size={13} className="text-white/80" />
                <span className="text-xs font-semibold text-white/80 tracking-widest uppercase">Ready to Launch?</span>
                <SplashTag text="GO!" color="emerald" rotation={-5} fontSize={10} />
              </div>
              <h2 className="text-4xl md:text-[3.5rem] font-black text-white mb-5 leading-tight tracking-tight">
                Transform your <br className="hidden md:block" /> studio today.
              </h2>
              <p className="text-white/70 text-lg max-w-lg mx-auto mb-10 leading-relaxed">
                Join 250+ studios already using SnapMoment. Setup takes under 5 minutes.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/signup" className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl bg-white text-violet-700 font-bold text-base hover:bg-violet-50 hover:scale-[1.03] active:scale-95 transition-all shadow-lg">
                  Get Started Free <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/demo" className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-4 rounded-2xl bg-white/10 border border-white/25 text-white font-semibold text-base hover:bg-white/20 active:scale-95 transition-all">
                  Watch Demo
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

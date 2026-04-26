import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { 
  Check, ChevronDown, CheckCircle2, XCircle, 
  Sparkles, Zap, Shield, Crown, Globe,
  ArrowRight, Heart, Award, Star, 
  HelpCircle, CreditCard,
  Target, Rocket, TrendingUp, Camera, Clock,
  Layers, ShieldCheck, Image as ImageIcon
} from 'lucide-react'
import Navbar from '../components/shared/Navbar'
import Footer from '../components/shared/Footer'
import SplashTag from '../components/shared/SplashTag'
import AuroraRibbon from '../components/shared/AuroraRibbon'
import WaveDivider from '../components/shared/WaveDivider'

const FAQ = [
  { q: 'Can I upgrade or downgrade my plan at any time?', a: 'Yes, you can upgrade, downgrade, or cancel your subscription at any time from your dashboard settings. Changes are immediate and prorated.' },
  { q: 'Is there a limit on how long photos are hosted?', a: 'Fresher and Pro accounts keep photos hosted for 30 days after an event. Studio accounts enjoy permanent priority hosting.' },
  { q: 'What happens if I go over my photo limit?', a: 'If you need to upload an extra batch for a massive event, you can buy a one-time "Event Boost" for ₹500 without needing to upgrade your monthly tier.' },
  { q: 'Do guests need to pay to download photos?', a: 'No! Guests never pay anything to access or download their matched photos. Your service remains premium and free for them.' },
  { q: 'Can I use my own logo on the photos?', a: 'Yes, Pro and Studio plans allow you to upload your own branding, which our AI automatically applies as a watermark to every guest photo.'},
]

// 3D Tilt Component
function TiltCard({ children, className, isPopular = false }: { children: React.ReactNode; className?: string; isPopular?: boolean }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x)
  const mouseYSpring = useSpring(y)

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={className}
    >
      <div style={{ transform: "translateZ(50px)", transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </motion.div>
  )
}

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [isYearly, setIsYearly] = useState(false)

  const plans = [
    { 
      name: 'Fresher', 
      monthlyPrice: 50,
      yearlyPrice: 40,
      period: isYearly ? '/mo (billed yearly)' : '/event',
      icon: Zap,
      desc: 'Perfect for small events and weddings.',
      features: ['5 events / month', '200 photos / event', 'Instant AI Matching', 'Standard Watermark', 'Guest QR Flow'],
      cta: 'Start for Free',
      accent: 'emerald',
      floatingIcon: <Sparkles className="text-emerald-500/20 absolute -top-4 -right-4 w-12 h-12" />
    },
    { 
      name: 'Pro', 
      monthlyPrice: 1499,
      yearlyPrice: 1199,
      period: '/month',
      icon: Crown,
      desc: 'For busy photographers doing weekly events.',
      features: ['50 events / month', '4,000 photos / event', 'Custom Branding', 'Gallery Analytics', 'Bulk Download (ZIP)', 'Priority Support'],
      cta: 'Go Professional',
      popular: true,
      accent: 'primary',
      floatingIcon: <Target className="text-primary/20 absolute -top-4 -right-4 w-12 h-12" />
    },
    { 
      name: 'Studio', 
      monthlyPrice: 4999,
      yearlyPrice: 3999,
      period: '/month',
      icon: Globe,
      desc: 'The ultimate power for large production houses.',
      features: ['Unlimited events', 'Unlimited photos', 'White-label Experience', 'API Access', 'Custom Domain', 'Dedicated Manager'],
      cta: 'Scale Your Studio',
      accent: 'purple',
      floatingIcon: <Rocket className="text-purple-500/20 absolute -top-4 -right-4 w-12 h-12" />
    },
  ]

  return (
    <div className="min-h-screen selection:bg-primary/30" style={{ background: 'var(--background)' }}>
      <AuroraRibbon />
      <Navbar />

      {/* Hero Section */}
      <header className="relative pt-32 pb-12 overflow-hidden text-center">
        {/* Animated Background Decor */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full animate-pulse" />
          <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full animate-ping" />
          <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-accent rounded-full animate-ping" style={{ animationDelay: '1s' }} />
          <div className="absolute inset-0 noise-overlay opacity-20" />
        </div>

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="hero-badge mb-8 mx-auto border-primary/20 bg-primary/5 backdrop-blur-md">
              <Sparkles size={14} className="text-primary" />
              <span className="text-primary font-black">Investment for Professionals</span>
            </div>
            <h1 className="text-6xl md:text-[9rem] font-black mb-8 tracking-tighter italic leading-[0.85] uppercase">
              Predictable <br />
              <span className="gradient-text">Growth.</span>
            </h1>
            <p className="text-xl md:text-2xl text-text-muted max-w-2xl mx-auto leading-relaxed mb-16 font-medium">
              Join 200+ elite studios using SnapMoment to automate their delivery. Choose the plan that matches your ambition.
            </p>

            {/* Premium Billing Toggle */}
            <div className="flex items-center justify-center gap-6 mb-20">
              <span className={`text-lg font-black transition-all ${!isYearly ? 'text-foreground scale-110' : 'text-text-muted opacity-50'}`}>Monthly</span>
              <button 
                onClick={() => setIsYearly(!isYearly)}
                className="group w-24 h-12 rounded-full bg-slate-100 p-1.5 relative transition-all shadow-inner hover:bg-slate-200"
              >
                <motion.div 
                  layout
                  className="w-9 h-9 rounded-full bg-white shadow-xl flex items-center justify-center text-primary"
                  animate={{ x: isYearly ? 48 : 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Zap size={16} fill="currentColor" />
                </motion.div>
              </button>
              <div className="flex flex-col items-start">
                <span className={`text-lg font-black transition-all ${isYearly ? 'text-foreground scale-110' : 'text-text-muted opacity-50'}`}>Yearly</span>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none mt-1">Save 20% + Bonus Cloud</span>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Pricing Cards Grid */}
      <section className="pb-40 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-10">
            {plans.map((plan, i) => {
              const Icon = plan.icon
              return (
                <TiltCard key={plan.name} isPopular={plan.popular} className="relative group">
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15, duration: 0.6 }}
                    className={`p-10 md:p-14 rounded-[4rem] glass-card card-shine relative flex flex-col h-full transition-all duration-700 !overflow-visible ${
                      plan.popular ? 'pricing-popular ring-[12px] ring-primary/5 scale-105 z-10 shadow-3xl' : 'hover:border-primary/40 border-slate-200'
                    }`}
                  >
                    {plan.floatingIcon}
                    
                    {plan.popular && (
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-10 py-3 rounded-full bg-primary text-white text-[12px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary/50 z-20 whitespace-nowrap">
                        Most Popular Choice
                      </div>
                    )}
                    
                    <div className="mb-12 text-center">
                      <div className={`w-24 h-24 rounded-[2.5rem] bg-white shadow-2xl flex items-center justify-center mb-10 mx-auto transition-transform group-hover:rotate-12 duration-500`}>
                        <Icon size={44} className={`text-${plan.accent}-500`} />
                      </div>
                      <h3 className="text-4xl font-black mb-3 tracking-tighter uppercase italic">{plan.name}</h3>
                      <p className="text-text-subtle text-sm font-bold mb-8 max-w-[200px] leading-relaxed mx-auto">{plan.desc}</p>
                      
                      <div className="flex items-baseline gap-2">
                        <span className="text-7xl font-black tracking-tighter">
                          ₹{isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-text-subtle font-black text-[10px] uppercase tracking-widest">{plan.period}</span>
                          <span className="text-emerald-500 font-black text-[8px] uppercase tracking-widest">Inclusive Tax</span>
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent w-full mb-12" />

                    <ul className="space-y-6 mb-16 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-5 text-[15px] text-text-muted font-bold group/item">
                          <div className={`w-8 h-8 rounded-xl bg-${plan.accent}-500/10 text-${plan.accent}-600 flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform`}>
                            <CheckCircle2 size={18} strokeWidth={3} />
                          </div>
                          {f}
                        </li>
                      ))}
                    </ul>

                    <Link
                      to="/signup"
                      className={`w-full py-7 rounded-[2.5rem] font-black text-xl transition-all text-center shadow-2xl overflow-hidden relative group/btn ${
                        plan.popular ? 'bg-primary text-white shadow-primary/40' : 'bg-slate-900 text-white hover:bg-black'
                      }`}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {plan.cta} <ArrowRight size={20} />
                      </span>
                      <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                    </Link>
                  </motion.div>
                </TiltCard>
              )
            })}
          </div>
        </div>
      </section>

      {/* Trust & Social Proof Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--border) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-md text-center md:text-left">
              <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter">Loved by Professionals.</h2>
              <p className="text-text-muted font-bold">"SnapMoment has completely transformed our wedding workflow. Instant delivery is now our unique selling point."</p>
              <div className="flex items-center gap-3 mt-6 justify-center md:justify-start">
                <img src="https://i.pravatar.cc/100?u=joel" className="w-12 h-12 rounded-full border-2 border-primary" alt="" />
                <div>
                  <div className="font-black text-sm uppercase">Arjun Mehta</div>
                  <div className="text-[10px] font-bold text-primary uppercase tracking-widest">Director, Elite Studios</div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-1000">
               {[Award, Heart, Star, Camera].map((Icon, i) => (
                 <div key={i} className="flex flex-col items-center gap-2 group cursor-pointer">
                    <Icon size={48} className="group-hover:text-primary transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Partner {i + 1}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Feature Comparison */}
      <section className="py-40 px-6 bg-slate-50 relative noise-overlay">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-32">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="hero-badge mb-6 mx-auto">Detailed Specs</motion.div>
            <h2 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter italic uppercase leading-none">The Full <br /><span className="gradient-text">Comparison.</span></h2>
            <p className="text-xl text-text-muted max-w-xl mx-auto font-medium">Every tool you need to scale your photography studio to new heights.</p>
          </div>
          
          <div className="overflow-hidden rounded-[4rem] border border-slate-200 bg-white shadow-3xl group">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="py-12 px-12 text-foreground font-black text-3xl tracking-tighter">Feature Stack</th>
                    <th className="py-12 px-12 text-text-muted font-black text-center uppercase tracking-[0.2em] text-[10px]">Fresher</th>
                    <th className="py-12 px-12 text-primary font-black text-center bg-primary/5 uppercase tracking-[0.2em] text-[10px] relative">
                      Pro
                      <div className="absolute top-0 inset-x-0 h-1 bg-primary" />
                    </th>
                    <th className="py-12 px-12 text-foreground font-black text-center uppercase tracking-[0.2em] text-[10px]">Studio</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    ['Monthly Events', '5', '50', 'Unlimited', Zap],
                    ['Photos / Event', '200', '4,000', 'Unlimited', ImageIcon],
                    ['AI Facial Recognition', true, true, true, Sparkles],
                    ['Guest OTP Flow', true, true, true, ShieldCheck],
                    ['Branding Control', 'Standard', 'Custom Logo', 'Whitelabel', Layers],
                    ['Bulk Photo ZIP', false, true, true, Clock],
                    ['Live Analytics', false, true, true, TrendingUp],
                    ['Custom Domain', false, false, true, Globe],
                    ['API & Webhooks', false, false, true, Rocket],
                    ['SLA Priority', '99.0%', '99.9%', '99.99%', Shield],
                  ].map((row, i) => {
                    const RowIcon = row[4] as any
                    return (
                      <tr key={i} className="group/row border-b border-slate-100 last:border-0 hover:bg-primary/[0.02] transition-colors">
                        <td className="py-10 px-12 font-black text-foreground text-xl tracking-tight flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/row:bg-primary/10 group-hover/row:text-primary transition-colors">
                            <RowIcon size={20} />
                          </div>
                          {row[0] as string}
                        </td>
                        {(row.slice(1, 4) as (string | boolean)[]).map((val, j) => (
                          <td key={j} className={`py-10 px-12 text-center text-text-muted font-bold ${j === 1 ? 'bg-primary/[0.03]' : ''}`}>
                            {typeof val === 'boolean' ? (
                              val ? (
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto shadow-sm group-hover/row:scale-110 transition-transform">
                                  <CheckCircle2 size={24} strokeWidth={3} />
                                </div>
                              ) : (
                                <XCircle className="mx-auto text-slate-200" size={28} />
                              )
                            ) : (
                              <span className={`text-xl ${j === 1 ? 'font-black text-primary' : 'font-bold text-slate-700'}`}>{val as string}</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Ultra-Premium Wave transition */}
      <WaveDivider fill="var(--foreground)" fromColor="var(--card)" flip />

      {/* Advanced FAQ Section */}
      <section className="py-40 px-6 bg-foreground text-white relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 blur-[200px] rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/5 blur-[150px] rounded-full translate-y-1/3 -translate-x-1/4" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-32">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="hero-badge mb-8 mx-auto border-white/10 text-white/60">Knowledge Base</motion.div>
            <h2 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter italic uppercase">Common <br /><span className="text-primary">Inquiries.</span></h2>
            <p className="text-xl text-white/40 max-w-xl mx-auto">Everything you need to know about the future of photo delivery.</p>
          </div>
          
          <div className="space-y-8">
            {FAQ.map((item, i) => (
              <div key={i} className={`faq-item group transition-all duration-700 ${openFaq === i ? 'open border-primary shadow-2xl shadow-primary/20' : 'bg-white/[0.03] border-white/5 hover:border-white/20'}`}>
                <button
                  className="w-full p-12 text-left flex items-center justify-between group"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-black text-2xl md:text-3xl tracking-tighter pr-12 group-hover:text-primary transition-colors">{item.q}</span>
                  <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center transition-all duration-700 ${openFaq === i ? 'bg-primary text-white rotate-180 shadow-2xl shadow-primary/50' : 'bg-white/5 text-white/30 group-hover:bg-white/10 group-hover:text-white'}`}>
                    <ChevronDown size={28} />
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-12 pb-12 text-white/50 leading-relaxed text-2xl font-medium"
                    >
                      <div className="h-px bg-white/10 w-full mb-8" />
                      {item.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Ultra-CTA */}
      <section className="py-40 px-6 relative">
        <div className="max-w-7xl mx-auto rounded-[5rem] bg-slate-900 p-16 md:p-40 text-center text-white relative overflow-hidden shadow-4xl group">
          {/* Animated Gradient Border */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-purple-600 opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
          <div className="absolute top-0 left-0 w-full h-full noise-overlay opacity-30" />
          
          <div className="relative z-10">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-white text-sm font-black uppercase tracking-[0.3em] mb-12"
            >
              <Rocket size={18} className="text-primary animate-bounce" />
              <span>Ready for Takeoff?</span>
            </motion.div>
            
            <h2 className="text-6xl md:text-[10rem] font-black mb-12 tracking-tighter italic leading-[0.8] uppercase">
              Transform <br />
              <span className="text-primary">Forever.</span>
            </h2>
            
            <p className="text-2xl md:text-3xl text-white/60 mb-20 max-w-3xl mx-auto font-medium leading-relaxed">
              Join the league of elite photographers who have stopped delivering links and started delivering <span className="text-white italic">moments.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-10">
              <Link to="/signup" className="w-full sm:w-auto px-20 py-8 rounded-[3rem] bg-white text-slate-900 font-black text-3xl hover:scale-110 transition-all shadow-white/20 active:scale-95">
                Get Started
              </Link>
              <Link to="/demo" className="w-full sm:w-auto px-20 py-8 rounded-[3rem] bg-white/5 border-2 border-white/10 text-white font-black text-3xl hover:bg-white/10 transition-all backdrop-blur-md active:scale-95">
                Live Demo
              </Link>
            </div>
            
            <div className="mt-24 grid grid-cols-2 md:grid-cols-3 gap-12 text-white/30 text-xs font-black uppercase tracking-[0.4em]">
              <div className="flex flex-col items-center gap-3"><Shield size={24} /> Verified SSL</div>
              <div className="flex flex-col items-center gap-3"><CreditCard size={24} /> No CC Needed</div>
              <div className="flex flex-col items-center gap-3 md:col-span-1 col-span-2"><Rocket size={24} /> Global Delivery</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

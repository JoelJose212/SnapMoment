import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Check, ChevronDown, CheckCircle2, XCircle, 
  Sparkles, Zap, Shield, Crown, Globe,
  ArrowRight, Heart, Award, Star, 
  HelpCircle, CreditCard,
  Target, Rocket, TrendingUp, Camera, Clock
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
      color: 'emerald'
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
      color: 'primary'
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
      color: 'purple'
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
          <div className="absolute top-[10%] left-[-5%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute inset-0 noise-overlay opacity-20" />
        </div>

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="hero-badge mb-8 mx-auto">
              <Sparkles size={14} />
              <span>Investment in your Success</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-bold mb-8 tracking-tighter italic">
              Scale without <br />
              <span className="gradient-text">the friction.</span>
            </h1>
            <p className="text-xl text-text-muted max-w-2xl mx-auto leading-relaxed mb-12">
              Transparent pricing designed to fit any business stage. Switch plans as you grow, with no hidden commitments.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-16">
              <span className={`text-sm font-bold ${!isYearly ? 'text-foreground' : 'text-text-muted'}`}>Monthly</span>
              <button 
                onClick={() => setIsYearly(!isYearly)}
                className="w-16 h-8 rounded-full bg-slate-200 p-1 relative transition-colors"
                style={{ background: isYearly ? 'var(--primary)' : undefined }}
              >
                <motion.div 
                  layout
                  className="w-6 h-6 rounded-full bg-white shadow-sm"
                  animate={{ x: isYearly ? 32 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
              <span className={`text-sm font-bold ${isYearly ? 'text-foreground' : 'text-text-muted'}`}>
                Yearly <span className="ml-1 text-emerald-500 font-black">SAVE 20%</span>
              </span>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Pricing Cards */}
      <section className="pb-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {plans.map((plan, i) => {
              const Icon = plan.icon
              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className={`p-10 rounded-[3.5rem] glass-card card-shine relative flex flex-col transition-all duration-500 ${
                    plan.popular ? 'pricing-popular ring-8 ring-primary/5 scale-105 z-10' : 'hover:border-primary/40'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-8 py-2 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-primary animate-bounce-slow">
                      Most Loved Choice
                    </div>
                  )}
                  
                  <div className="mb-10">
                    <div className={`w-16 h-16 rounded-3xl bg-primary/5 text-primary flex items-center justify-center mb-8 mx-auto lg:mx-0 group-hover:rotate-12 transition-transform`}>
                      <Icon size={32} />
                    </div>
                  <h3 className="text-3xl font-black mb-2 tracking-tight uppercase">{plan.name}</h3>
                  <p className="text-text-subtle text-sm font-medium mb-6">{plan.desc}</p>
                  
                  <div className="flex items-baseline gap-1">
                    <span className="text-6xl font-black tracking-tighter">
                      ₹{isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-text-subtle font-black text-xs uppercase tracking-widest">{plan.period}</span>
                  </div>
                </div>

                <div className="h-px bg-slate-100 w-full mb-10" />

                <ul className="space-y-5 mb-12 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-4 text-sm text-text-muted font-bold">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                        <Check size={14} strokeWidth={4} />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/signup"
                  className={`w-full py-6 rounded-[2rem] font-black text-lg transition-all text-center shadow-lg hover:scale-105 active:scale-95 ${
                    plan.popular ? 'bg-primary text-white shadow-primary/40' : 'bg-slate-900 text-white hover:bg-black'
                  }`}
                >
                  {plan.cta}
                </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-20 border-y border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-text-subtle mb-10">Trusted by modern photography studios</p>
          <div className="flex flex-wrap justify-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
             <div className="flex items-center gap-2 font-black text-2xl"><Award size={32} /> STUDIO-X</div>
             <div className="flex items-center gap-2 font-black text-2xl"><Heart size={32} /> WED-MEMORIES</div>
             <div className="flex items-center gap-2 font-black text-2xl"><Star size={32} /> ELITE-EVENTS</div>
             <div className="flex items-center gap-2 font-black text-2xl"><Camera size={32} /> PIXEL-PERFECT</div>
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-32 px-6 bg-slate-50 relative noise-overlay">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter italic">The Deep Dive.</h2>
            <p className="text-xl text-text-muted max-w-xl mx-auto">Compare every technical detail to find your perfect fit.</p>
          </div>
          
          <div className="overflow-hidden rounded-[3rem] border border-slate-200 bg-white shadow-3xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="py-10 px-10 text-foreground font-black text-2xl tracking-tighter">Feature Comparison</th>
                    <th className="py-10 px-10 text-text-muted font-black text-center uppercase tracking-widest text-xs">Fresher</th>
                    <th className="py-10 px-10 text-primary font-black text-center bg-primary/5 uppercase tracking-widest text-xs">Pro</th>
                    <th className="py-10 px-10 text-foreground font-black text-center uppercase tracking-widest text-xs">Studio</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    ['Events per Month', '5', '50', 'Unlimited'],
                    ['Photos per Event', '200', '4,000', 'Unlimited'],
                    ['AI Facial Recognition', true, true, true],
                    ['Guest OTP Verification', true, true, true],
                    ['Watermark Branding', 'Standard', 'Custom', 'Whitelabel'],
                    ['Bulk Download (ZIP)', false, true, true],
                    ['Analytics Dashboard', false, true, true],
                    ['Custom Domain Support', false, false, true],
                    ['API & Webhooks', false, false, true],
                    ['SLA Guarantee', '99.0%', '99.9%', '99.99%'],
                  ].map((row, i) => (
                    <tr key={i} className="group border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="py-8 px-10 font-black text-foreground text-lg tracking-tight">{row[0]}</td>
                      {row.slice(1).map((val, j) => (
                        <td key={j} className={`py-8 px-10 text-center text-text-muted font-bold ${j === 1 ? 'bg-primary/5' : ''}`}>
                          {typeof val === 'boolean' ? (
                            val ? (
                              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                                <CheckCircle2 size={20} strokeWidth={3} />
                              </div>
                            ) : (
                              <XCircle className="mx-auto text-slate-200" size={24} />
                            )
                          ) : (
                            <span className={`text-lg ${j === 1 ? 'font-black text-primary' : ''}`}>{val}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Wave divider to dark section */}
      <WaveDivider fill="var(--foreground)" fromColor="var(--card)" flip />

      {/* FAQ Section */}
      <section className="py-32 px-6 bg-foreground text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-7xl font-black mb-8 tracking-tighter">Common Inquiries.</h2>
            <p className="text-xl text-white/50">Everything you need to know about our plans and features.</p>
          </div>
          
          <div className="space-y-6">
            {FAQ.map((item, i) => (
              <div key={i} className={`faq-item group transition-all duration-500 ${openFaq === i ? 'open border-primary bg-white/5' : 'bg-white/5 border-white/5 hover:border-white/20'}`}>
                <button
                  className="w-full p-10 text-left flex items-center justify-between group"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-black text-xl md:text-2xl tracking-tight pr-8">{item.q}</span>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${openFaq === i ? 'bg-primary text-white rotate-180 shadow-primary' : 'bg-white/5 text-white/50 group-hover:bg-white/10'}`}>
                    <ChevronDown size={24} />
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-10 pb-10 text-white/60 leading-relaxed text-xl font-medium"
                    >
                      {item.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto rounded-[4rem] bg-slate-900 p-12 md:p-32 text-center text-white relative overflow-hidden shadow-3xl">
          <div className="absolute inset-0 bg-primary-gradient opacity-30" />
          <div className="absolute top-0 left-0 w-full h-full noise-overlay opacity-20" />
          
          <div className="relative z-10">
            <div className="hero-badge mb-8 mx-auto border-white/20 text-white">
              <Zap size={14} />
              <span>Instant Activation</span>
            </div>
            <h2 className="text-5xl md:text-8xl font-black mb-10 tracking-tighter italic">Stop waiting. <br />Start matching.</h2>
            <p className="text-xl md:text-2xl text-white/70 mb-16 max-w-2xl mx-auto font-medium">Join over 200+ elite photographers who have revolutionized their guest experience.</p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <Link to="/signup" className="w-full sm:w-auto px-16 py-7 rounded-[2rem] bg-white text-slate-900 font-black text-2xl hover:scale-105 transition-all shadow-white/10">
                Get Started Now
              </Link>
              <Link to="/demo" className="w-full sm:w-auto px-16 py-7 rounded-[2rem] bg-white/10 border border-white/20 text-white font-black text-2xl hover:bg-white/20 transition-all backdrop-blur-sm">
                Try Live Demo
              </Link>
            </div>
            
            <div className="mt-16 flex items-center justify-center gap-8 text-white/40 text-sm font-black uppercase tracking-widest">
              <span className="flex items-center gap-2"><Shield size={16} /> Secure Payment</span>
              <span className="flex items-center gap-2"><CreditCard size={16} /> No CC Required</span>
              <span className="flex items-center gap-2"><Rocket size={16} /> Instant Setup</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

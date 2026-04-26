import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  Camera, Zap, Shield, Users, ChevronDown,
  Star, Check, QrCode, Smartphone, Image as ImageIcon,
  Sparkles, ArrowRight, Heart, Award, Clock
} from 'lucide-react'

// Shared Components
import AuroraRibbon from '../components/shared/AuroraRibbon'
import Navbar from '../components/shared/Navbar'
import Footer from '../components/shared/Footer'
import SplashTag from '../components/shared/SplashTag'
import WaveDivider from '../components/shared/WaveDivider'

// --- Utility Hooks & Components ---

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
    <div ref={ref} className="stat-card group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon size={48} />
      </div>
      <div className="text-5xl font-bold gradient-text mb-2">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm font-semibold tracking-wider uppercase text-text-muted">{label}</div>
    </div>
  )
}

// --- Data ---

const FEATURES = [
  { 
    icon: Zap, 
    title: 'Instant AI Delivery', 
    desc: 'Photos reach guests in under 30 seconds through our high-speed AI matching engine.', 
    color: 'var(--primary)',
    wide: true 
  },
  { 
    icon: Shield, 
    title: '99.8% Accuracy', 
    desc: 'Powered by industry-leading ArcFace models for flawless face recognition.',
    color: 'var(--accent)'
  },
  { 
    icon: QrCode, 
    title: 'Seamless QR Entry', 
    desc: 'No apps. No friction. Just scan, verify, and relive the moment.',
    color: 'var(--primary)'
  },
  { 
    icon: Users, 
    title: 'Massive Scalability', 
    desc: 'From intimate weddings to festivals with 10,000+ guests.',
    color: 'var(--accent)'
  },
  { 
    icon: ImageIcon, 
    title: 'Smart Watermarking', 
    desc: 'Protect your work with custom branded watermarks automatically applied.',
    color: 'var(--primary)'
  },
  { 
    icon: Heart, 
    title: 'Privacy Guaranteed', 
    desc: 'Selfies are processed in-memory and never stored. Privacy is our DNA.',
    color: 'var(--accent)'
  },
]

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'Wedding Photographer', text: "My clients are absolutely blown away. They get their photos before they even leave the venue!", image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150' },
  { name: 'Rohan Mehta', role: 'Event Photographer', text: "The AI accuracy is stunning. In 8 months I've had zero mismatches reported by guests.", image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150' },
  { name: 'Kavya Reddy', role: 'Portrait Photographer', text: "Switched from manual sharing drives. SnapMoment saves me 4 hours per event.", image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150' },
  { name: 'Amit Verma', role: 'Wedding Photographer', text: "This platform has completely changed my workflow. Guests love the instant access.", image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150' },
];

const FAQ = [
  { q: 'Does it work without an app download?', a: 'Yes! Guests only need to scan a QR code and open it in any browser. No app required.' },
  { q: 'How accurate is the face recognition?', a: 'We use the latest AI models with 99.8% accuracy. It even works with glasses and varying light conditions.' },
  { q: 'What happens to selfie data after matching?', a: 'Selfies are processed in real-time to generate face embeddings and are immediately deleted. We never store raw selfies.' },
  { q: 'Can I use my own branding?', a: 'Absolutely. Pro and Studio plans allow custom watermarks and branded gallery experiences.' },
]

// --- Components ---

const FloatingElement = ({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ 
      opacity: 1, 
      y: [0, -15, 0],
    }}
    transition={{
      opacity: { duration: 0.8, delay },
      y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay }
    }}
    className={className}
  >
    {children}
  </motion.div>
)

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: typeof TESTIMONIALS;
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{ translateY: "-50%" }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {[...new Array(2)].map((_, index) => (
          <React.Fragment key={index}>
            {props.testimonials.map(({ text, image, name, role }, i) => (
              <div key={i} className="testimonial-card shadow-sm hover:shadow-xl transition-all">
                <div className="flex gap-1 mb-4 text-amber-400">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <p className="text-sm italic leading-relaxed text-text-muted mb-6">"{text}"</p>
                <div className="flex items-center gap-3">
                  <img src={image} alt={name} className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/20" />
                  <div>
                    <div className="font-bold text-sm text-foreground">{name}</div>
                    <div className="text-xs text-text-subtle">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
};

// --- Main Page Component ---

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const { scrollYProgress } = useScroll()
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -50])

  return (
    <div className="min-h-screen selection:bg-primary/30">
      <AuroraRibbon />
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden min-h-screen flex items-center justify-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[10%] left-[-5%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full noise-overlay opacity-30" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              style={{ y: heroY }}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-8">
                <Sparkles size={14} />
                <span>Next-Gen Event Photography</span>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-bold text-foreground leading-[0.9] tracking-tight mb-8">
                Memories <br />
                <span className="gradient-text">Instantized.</span>
              </h1>
              
              <p className="text-xl text-text-muted leading-relaxed max-w-lg mb-10">
                The world's fastest AI photo delivery platform. No shared folders, no manual tagging. 
                Just scan, smile, and receive your photos in seconds.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link 
                  to="/signup" 
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-primary text-white font-bold text-lg hover:scale-105 transition-all shadow-primary hover:shadow-primary-lg flex items-center justify-center gap-2"
                >
                  Start For Free <ArrowRight size={20} />
                </Link>
                <Link 
                  to="/demo" 
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white border border-border text-foreground font-bold text-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  Watch Demo
                </Link>
              </div>

              <div className="mt-12 flex items-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all">
                <div className="text-xs font-bold uppercase tracking-widest text-text-subtle">Trusted by</div>
                <div className="flex items-center gap-4 font-display text-xl text-foreground">
                  <span>Vogue</span>
                  <div className="w-1 h-1 rounded-full bg-border" />
                  <span>Nikon</span>
                  <div className="w-1 h-1 rounded-full bg-border" />
                  <span>Sony</span>
                </div>
              </div>
            </motion.div>

            {/* Visual Column */}
            <div className="relative">
              <div className="relative z-10 animate-float">
                <div className="relative w-[300px] md:w-[380px] h-[600px] md:h-[760px] mx-auto rounded-[3rem] p-4 bg-gray-900 shadow-2xl ring-4 ring-gray-800 border-8 border-gray-950 overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-8 flex items-center justify-center">
                    <div className="w-16 h-4 bg-black rounded-b-2xl" />
                  </div>
                  
                  {/* Phone Screen Mockup */}
                  <div className="h-full w-full bg-white rounded-[2rem] overflow-hidden p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                      <div className="font-bold text-lg">SnapMoment</div>
                      <Users size={20} className="text-primary" />
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div className="h-48 rounded-2xl bg-gray-100 overflow-hidden relative group">
                        <img src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover" alt="" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Check className="text-white" size={48} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="h-24 rounded-xl bg-gray-50 overflow-hidden">
                            <img src={`https://picsum.photos/seed/${i+10}/200`} className="w-full h-full object-cover opacity-80" alt="" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-8">
                      <div className="text-center mb-4">
                        <div className="text-xs text-text-subtle font-bold uppercase mb-1">Found Your Photos</div>
                        <div className="text-2xl font-bold text-primary">12 New Matches!</div>
                      </div>
                      <button className="w-full py-4 rounded-xl bg-primary text-white font-bold shadow-sm">
                        Download Collection
                      </button>
                    </div>
                  </div>
                </div>

                {/* Floating Tags */}
                <FloatingElement className="absolute -top-10 -right-10 hidden md:block" delay={0.5}>
                  <div className="glass-card px-6 py-4 rounded-2xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                      <Zap size={20} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-text-subtle uppercase">Delivery Time</div>
                      <div className="text-lg font-bold">18 Seconds</div>
                    </div>
                  </div>
                </FloatingElement>

                <FloatingElement className="absolute bottom-20 -left-20 hidden md:block" delay={1}>
                  <div className="glass-card px-6 py-4 rounded-2xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white">
                      <Shield size={20} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-text-subtle uppercase">Matching</div>
                      <div className="text-lg font-bold">99.8% Precise</div>
                    </div>
                  </div>
                </FloatingElement>
              </div>
            </div>
          </div>
        </div>
      </section>

      <WaveDivider fill="var(--background)" fromColor="var(--foreground)" />

      {/* How It Works */}
      <section className="py-32 px-6 bg-white relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">How the Magic Happens</h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">We've eliminated the friction from event photo sharing. Three steps, zero effort.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-[45px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10" />
            
            {[
              { 
                step: '01', 
                icon: Camera, 
                title: 'Capture & Upload', 
                desc: 'Photographer uploads photos in real-time. Our AI instantly indexes every face in the background.' 
              },
              { 
                step: '02', 
                icon: QrCode, 
                title: 'Scan & Selfie', 
                desc: 'Guests scan the event QR code and take a quick selfie. No login or app download required.' 
              },
              { 
                step: '03', 
                icon: Smartphone, 
                title: 'Instant Gallery', 
                desc: 'AI matches the selfie with event photos and delivers a personalized gallery instantly.' 
              },
            ].map((item, idx) => {
              const Icon = item.icon
              return (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2 }}
                  className="relative text-center group"
                >
                  <div className="w-24 h-24 rounded-3xl bg-primary/5 flex items-center justify-center mx-auto mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-500 rotate-3 group-hover:rotate-0">
                    <Icon size={40} className="transition-transform group-hover:scale-110" />
                  </div>
                  <div className="text-primary font-bold text-sm uppercase tracking-widest mb-2">Step {item.step}</div>
                  <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                  <p className="text-text-muted leading-relaxed">{item.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6 bg-slate-50 relative noise-overlay">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Designed for Professionals.</h2>
              <p className="text-xl text-text-muted mb-8">Powerful features that give you back hours of your time and wow your clients.</p>
              <div className="space-y-4">
                {['Unlimited Cloud Storage', 'Branded Guest Experience', 'Real-time Analytics'].map(t => (
                  <div key={t} className="flex items-center gap-3 text-foreground font-bold">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
                      <Check size={14} />
                    </div>
                    {t}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
              {FEATURES.map((f, i) => {
                const Icon = f.icon
                return (
                  <div key={i} className={`feature-card card-shine p-8 bg-white rounded-3xl ${f.wide ? 'md:col-span-2' : ''}`}>
                    <div className="w-12 h-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center mb-6">
                      <Icon size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                    <p className="text-text-muted text-sm leading-relaxed">{f.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-32 px-6 bg-foreground text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 blur-[100px]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCounter value={200} suffix="+" label="Elite Photographers" icon={Award} />
            <StatCounter value={500000} suffix="+" label="Photos Delivered" icon={ImageIcon} />
            <StatCounter value={1500} suffix="+" label="Events Empowered" icon={Sparkles} />
            <StatCounter value={99.8} suffix="%" label="AI Precision" icon={Shield} />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Loved by the Best.</h2>
            <p className="text-xl text-text-muted">Thousands of memories delivered across the globe.</p>
          </div>
          
          <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)] max-h-[600px] overflow-hidden">
            <TestimonialsColumn testimonials={TESTIMONIALS} duration={25} />
            <TestimonialsColumn testimonials={TESTIMONIALS} className="hidden md:block" duration={35} />
            <TestimonialsColumn testimonials={TESTIMONIALS} className="hidden lg:block" duration={30} />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-32 px-6 bg-slate-50 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h2>
            <p className="text-xl text-text-muted">No hidden fees. Scale as you grow.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Fresher', price: '₹50', features: ['5 events / month', '200 photos / event', 'Instant AI Matching', 'Standard Support'] },
              { name: 'Pro', price: '₹1,499', features: ['50 events / month', '2,000 photos / event', 'Custom Watermarking', 'Priority Support', 'Gallery Analytics'], popular: true },
              { name: 'Studio', price: '₹4,999', features: ['Unlimited events', 'Unlimited photos', 'Whitelabel Gallery', 'API Access', 'Account Manager'] },
            ].map((plan, i) => (
              <div 
                key={i} 
                className={`p-8 rounded-[2.5rem] bg-white border border-border relative flex flex-col transition-all ${plan.popular ? 'pricing-popular ring-4 ring-primary/20 scale-105 z-10' : 'hover:border-primary/30'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-white text-xs font-bold uppercase">
                    Most Popular
                  </div>
                )}
                <div className="mb-8">
                  <div className="text-sm font-bold text-primary uppercase tracking-widest mb-2">{plan.name}</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-text-muted">/event</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm text-text-muted">
                      <Check size={16} className="text-primary" /> {f}
                    </li>
                  ))}
                </ul>
                <Link 
                  to="/signup" 
                  className={`w-full py-4 rounded-2xl font-bold transition-all text-center ${plan.popular ? 'bg-primary text-white shadow-primary' : 'bg-slate-100 text-foreground hover:bg-slate-200'}`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked</h2>
          </div>
          <div className="space-y-4">
            {FAQ.map((item, i) => (
              <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
                <button 
                  className="w-full p-6 text-left flex items-center justify-between"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-bold text-lg">{item.q}</span>
                  <ChevronDown className={`transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-text-muted leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto rounded-[3rem] bg-primary p-12 md:p-24 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-primary-gradient opacity-50" />
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 blur-3xl rounded-full" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-accent/20 blur-3xl rounded-full" />
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-7xl font-bold mb-8">Ready to delight your guests?</h2>
            <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-2xl mx-auto">Join 200+ elite photographers who are revolutionizing event delivery with SnapMoment.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/signup" className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white text-primary font-bold text-xl hover:scale-105 transition-all shadow-xl">
                Get Started Now
              </Link>
              <Link to="/contact" className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white/10 border border-white/20 text-white font-bold text-xl hover:bg-white/20 transition-all">
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

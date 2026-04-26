import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Camera, Heart, Zap, ShieldCheck, 
  Target, Sparkles, Award, Users, 
  ArrowRight, Quote
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
  { year: '2023 Q3', label: 'First ArcFace Integration', desc: 'Achieved 99.2% matching accuracy with deep learning.' },
  { year: '2024 Q1', label: '100 Photographers', desc: 'Reached 100 active photographers across 12 cities.' },
  { year: '2024 Q4', label: 'Real-Time Delivery Launch', desc: 'Introduced instant photo delivery with QR-based access.' },
  { year: '2025 Q3', label: '1 Lakh+ Deliveries', desc: 'Surpassed 100,000+ successful photo deliveries.' },
  { year: '2026 Q4', label: 'Global Expansion', desc: 'Expanding beyond India to international photography studios.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen selection:bg-primary/30" style={{ background: 'var(--background)' }}>
      <AuroraRibbon />
      <Navbar />

      {/* Hero Section */}
      <header className="relative pt-32 pb-24 overflow-hidden text-center">
        {/* Animated Background Decor */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[10%] left-[-5%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
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
              <span>Our Vision & Story</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">
              Building for the moments <br />
              <span className="gradient-text">that matter most.</span>
            </h1>
            <p className="text-xl text-text-muted max-w-2xl mx-auto leading-relaxed">
              SnapMoment was born from a simple frustration: why do event photos take days to arrive, buried in a shared drive with hundreds of strangers?
            </p>
          </motion.div>
        </div>
      </header>

      {/* Story Section */}
      <section className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full opacity-50" />
              <div className="relative rounded-[3rem] overflow-hidden shadow-2xl photo-print rotate-2">
                <img src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800" alt="Event" className="w-full h-[500px] object-cover" />
              </div>
              <div className="absolute -bottom-8 -right-8 glass-card p-8 rounded-3xl animate-float hidden lg:block">
                <div className="text-4xl font-bold text-primary mb-1">200+</div>
                <div className="text-sm font-bold text-text-subtle uppercase tracking-widest">Active Photographers</div>
              </div>
            </div>

            <div className="space-y-8">
              <h2 className="text-4xl font-bold tracking-tight">Our Journey...</h2>
              <div className="space-y-6 text-lg text-text-muted leading-relaxed">
                <p>We were at a friend's wedding in 2023. The photographer did a wonderful job capturing thousands of precious memories. But when it came time to share them, she sent a Google Drive link — 3,000 photos for 400 guests. Chaos.</p>
                <p>Our co-founders, <span className="text-foreground font-bold italic">Joel and Nandini</span>, spent the evening manually forwarding photos to relatives. "There has to be a better way," they said. Six months later, <span className="text-primary font-bold">SnapMoment</span> was born.</p>
                <p>Today, SnapMoment powers photographers across India and has delivered memories at weddings, corporate functions, and massive festivals instantly.</p>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/100?u=${i+10}`} className="w-12 h-12 rounded-full border-4 border-white shadow-sm" />
                  ))}
                  <div className="w-12 h-12 rounded-full bg-slate-100 border-4 border-white flex items-center justify-center text-xs font-bold text-text-subtle">+200</div>
                </div>
                <div className="text-sm font-bold text-text-muted">Trusted by elite studios</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-32 px-6 bg-slate-50 relative noise-overlay">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 italic">The SnapMoment Way</h2>
            <p className="text-xl text-text-muted">Three core pillars that define our product and our mission.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: ShieldCheck, 
                title: 'Privacy First', 
                desc: 'Guest selfies are processed and deleted immediately. We never store raw facial data beyond the matching moment.',
                color: 'emerald'
              },
              { 
                icon: Heart, 
                title: 'Human Centric', 
                desc: 'AI is our tool, not our product. Every feature is designed around the human experience of sharing memories.',
                color: 'rose'
              },
              { 
                icon: Zap, 
                title: 'Zero Friction', 
                desc: "No app downloads. No account creation for guests. Scan, verify, smile — that's it.",
                color: 'amber'
              },
            ].map((v, i) => {
              const Icon = v.icon
              return (
                <motion.div 
                  key={v.title} 
                  className="glass-card p-10 rounded-[2.5rem] feature-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-${v.color}-500/10 text-${v.color}-600 flex items-center justify-center mb-8`}>
                    <Icon size={28} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 tracking-tight">{v.title}</h3>
                  <p className="text-text-muted leading-relaxed font-medium">{v.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-32 px-6 relative bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-20 text-center">
            Our Journey <SplashTag text="Est. 2023" color="amber" rotation={-2} className="ml-3" />
          </h2>
          
          <div className="relative">
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-[2px] bg-slate-100 -translate-x-1/2" />
            
            <div className="space-y-16">
              {TIMELINE.map((item, i) => (
                <motion.div 
                  key={item.year} 
                  initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className={`relative flex flex-col md:flex-row items-center gap-8 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                >
                  <div className="absolute left-0 md:left-1/2 w-4 h-4 rounded-full bg-primary border-4 border-white shadow-sm -translate-x-1/2 z-10" />
                  <div className="flex-1 md:w-1/2 text-center md:text-left">
                    <div className="text-xs font-bold text-primary uppercase tracking-widest mb-2">{item.year}</div>
                    <h3 className="text-2xl font-bold mb-3">{item.label}</h3>
                    <p className="text-text-muted leading-relaxed font-medium">{item.desc}</p>
                  </div>
                  <div className="flex-1 md:w-1/2 hidden md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-32 bg-foreground text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-primary/5 blur-[120px]" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-7xl font-bold mb-6 tracking-tighter">The Minds Behind <br /><span className="gradient-text">SnapMoment.</span></h2>
            <p className="text-xl text-white/60">A global team of engineers, designers, and visionaries.</p>
          </div>

          <div className="flex gap-8 animate-marquee hover:[animation-play-state:paused] py-10">
            {[...TEAM, ...TEAM].map((member, idx) => (
              <div key={idx} className="w-80 shrink-0 group">
                <div className="relative h-[450px] rounded-[3rem] overflow-hidden shadow-2xl border border-white/10">
                  <img src={member.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" alt={member.name} />
                  <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end">
                    <h3 className="text-2xl font-bold mb-1">{member.name}</h3>
                    <p className="text-primary font-bold uppercase tracking-widest text-xs">{member.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founding Quote */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-10">
            <Quote size={32} />
          </div>
          <blockquote className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.1] mb-12 italic">
            "We didn't just build an AI platform. We built a bridge for memories. Technology should feel like magic, and that's exactly what SnapMoment does every single event."
          </blockquote>
          <div className="flex flex-col items-center">
            <img src="/team/joel.jpg" className="w-20 h-20 rounded-full border-4 border-slate-50 shadow-xl mb-4 object-cover" alt="Joel Jose Varghese" />
            <p className="font-bold text-xl text-foreground">Joel Jose Varghese</p>
            <p className="text-text-subtle font-bold uppercase tracking-widest text-xs">CTO & Founder · SnapMoment</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="pb-32 px-6">
        <div className="max-w-6xl mx-auto rounded-[3rem] bg-primary p-12 md:p-24 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-primary-gradient opacity-50" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-7xl font-bold mb-8">Ready to join our story?</h2>
            <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-2xl mx-auto">Be part of the next generation of event photography.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/signup" className="w-full sm:w-auto px-12 py-5 rounded-2xl bg-white text-primary font-bold text-xl hover:scale-105 transition-all shadow-2xl">
                Start For Free
              </Link>
              <Link to="/contact" className="w-full sm:w-auto px-12 py-5 rounded-2xl bg-white/10 border border-white/20 text-white font-bold text-xl hover:bg-white/20 transition-all backdrop-blur-sm">
                Join the Team
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

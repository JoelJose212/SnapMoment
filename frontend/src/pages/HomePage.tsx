import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Camera, Zap, Shield, Users, ChevronDown,
  Star, Check, QrCode, Smartphone, Image as ImageIcon
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

function StatCounter({ value, suffix, label, color }: { value: number; suffix: string; label: string; color?: string }) {
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
    <div ref={ref} className="text-center">
      <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 56, fontWeight: 700, color: color || '#FF6E6C', lineHeight: 1 }}>
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm mt-2 font-medium text-text-muted">{label}</div>
    </div>
  )
}

// --- Data ---

const FEATURES = [
  { icon: Zap, title: 'Instant Delivery', desc: 'Photos reach guests in under 30 seconds of AI matching.', wide: true },
  { icon: Shield, title: '99.8% Accurate', desc: 'ArcFace deep learning model trained on millions of faces.' },
  { icon: QrCode, title: 'QR Entry', desc: 'No app needed. Scan, verify, smile and receive.' },
  { icon: Users, title: 'Any Crowd Size', desc: '1 to 1000+ guests — scales seamlessly.' },
  { icon: Camera, title: 'Watermarked Proofs', desc: 'Fresher tier adds your branded watermark automatically.' },
  { icon: Shield, title: 'Privacy First', desc: 'Selfies deleted after matching. Guests see only their photos.' },
]

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'Wedding Photographer', text: "My clients are absolutely blown away. They get their photos before they even leave the venue!", image: '/test/Priya.jpeg' },
  { name: 'Rohan Mehta', role: 'Event Photographer', text: "The AI accuracy is stunning. In 8 months I've had zero mismatches reported by guests.", image: '/test/Rohan.jpeg' },
  { name: 'Kavya Reddy', role: 'Portrait Photographer', text: "Switched from manual sharing drives. SnapMoment saves me 4 hours per event.", image: '/test/Kavya.jpeg' },
  { name: 'Amit Verma', role: 'Wedding Photographer', text: "This platform has completely changed my workflow. Guests love the instant access.", image: '/test/Amit.jpeg' },
  { name: 'Neha Kapoor', role: 'Freelance Photographer', text: "I was skeptical at first, but the face recognition works flawlessly. It feels like magic!", image: '/test/Neha.jpeg' },
  { name: 'Arjun Nair', role: 'Corporate Event Pro', text: "Managing thousands of photos used to be stressful. Now everything is automated.", image: '/test/Arjun.jpeg' },
  { name: 'Sneha Iyer', role: 'Lifestyle Photographer', text: "The selfie feature is a game-changer for guest interaction! Highly recommend.", image: '/test/Sneha.jpeg' },
  { name: 'Rahul Singh', role: 'Wedding Photographer', text: "Earlier, delivery used to take days. Now guests receive their photos instantly.", image: '/test/Rahul.jpeg' },
  { name: 'Pooja Desai', role: 'Event Photographer', text: "The automation is a blessing. I can now focus more on creativity instead of admin.", image: '/test/Pooja.jpeg' },
  { name: 'Vikram Patil', role: 'Wedding Specialist', text: "SnapMoment has added a premium feel to my service. Clients love the tech!", image: '/test/Vikram.jpeg' },
  { name: 'Ananya Gupta', role: 'Lifestyle Photographer', text: "The selfie-based photo access is genius. Guests find their pictures within seconds.", image: '/test/Ananya.jpeg' },
  { name: 'Karan Malhotra', role: 'Corporate Photographer', text: "Handling large corporate events has never been this smooth. Fast and zero confusion.", image: '/test/Karan.jpeg' }
];

const FAQ = [
  { q: 'Does it work without an app download?', a: 'Yes! Guests only need to scan a QR code and open it in any browser. No app required.' },
  { q: 'How accurate is the face recognition?', a: 'We use DeepFace ArcFace model with 99.8% accuracy. Guests can also report incorrect matches.' },
  {q: 'What if a face is not detected correctly?', a: 'Guests can retry with a better selfie or report mismatches, and our system will improve accuracy over time.'},
  { q: 'What happens to selfie data after matching?', a: 'Selfies are processed in real time and deleted immediately after embedding extraction. We never store raw selfie images.' },
  { q: 'How many photos can I upload per event?', a: 'Fresher plan supports up to 200 photos. Pro supports 2000 and Studio is unlimited.' },
  {q: 'How long does it take for guests to receive their photos?', a: 'Photos are delivered instantly after a successful face match. In most cases, guests receive their photos within seconds.'},
  {q: 'Is internet required for this to work?', a: 'Yes, an internet connection is required for uploading photos and matching faces in real time.'},
  {q: 'Can guests download their photos?', a: 'Yes! Guests can view, download, and share their photos directly from their browser.'},
  
]

// --- Testimonial Scrolling Component ---

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
              <div
                className="p-8 rounded-3xl border shadow-lg shadow-primary/5 max-w-xs w-full"
                key={i}
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="#F59E0B" color="#F59E0B" />)}
                </div>
                <div className="text-sm leading-relaxed text-text-muted mb-6">"{text}"</div>
                <div className="flex items-center gap-3">
                  <img
                    src={image}
                    alt={name}
                    className="h-10 w-10 rounded-full object-cover border border-border"
                  />
                  <div className="flex flex-col">
                    <div className="font-semibold text-sm tracking-tight" style={{ color: 'var(--foreground)' }}>{name}</div>
                    <div className="text-xs opacity-60 tracking-tight">{role}</div>
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

  // Splitting testimonials for the 3-column effect
  const col1 = TESTIMONIALS.slice(0, 4);
  const col2 = TESTIMONIALS.slice(4, 8);
  const col3 = TESTIMONIALS.slice(8, 12);

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <AuroraRibbon />
      <Navbar />

      {/* Hero Section */}
      <section
        className="relative flex flex-col items-center justify-center overflow-hidden min-h-[90vh] w-full noise-overlay"
        style={{ background: 'var(--background)' }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute w-72 h-72 rounded-full opacity-20" style={{ background: '#FF6E6C', filter: 'blur(80px)', top: '10%', left: '5%', animation: 'blob 8s ease-in-out infinite' }} />
          <div className="absolute w-96 h-96 rounded-full opacity-15" style={{ background: '#67568C', filter: 'blur(100px)', top: '40%', right: '10%', animation: 'blob 10s ease-in-out infinite 2s' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-0 relative z-10">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="text-left">
              <div className="mb-6 flex items-center justify-start gap-3">
                <SplashTag text="✦ No app needed" color="amber" rotation={-4} fontSize={18} />
              </div>
              <h1 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 'clamp(34px, 6vw, 72px)', fontWeight: 600, color: 'var(--foreground)', lineHeight: 1.1 }}>
                Your memories,<br />
                delivered in a{' '}
                <span style={{ position: 'relative', display: 'inline-block' }}>
                  heartbeat
                  <svg viewBox="0 0 200 20" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', bottom: -6, left: 0, width: '100%', height: 18, fill: 'none' }}>
                    <path d="M5,15 Q50,0 100,12 Q150,22 195,8" stroke="#FFB800" strokeWidth="3" strokeLinecap="round" fill="none" />
                  </svg>
                </span>
              </h1>
              <p className="text-base mt-7 leading-relaxed max-w-md" style={{ color: '#A394A8', fontFamily: '"Plus Jakarta Sans"' }}>
                Photographers upload, guests scan & selfie — AI delivers{' '}
                <span style={{ fontFamily: 'Caveat', fontSize: 22, color: '#F59E0B', verticalAlign: 'baseline' }}>instantly</span>.
                No more shared drives. No more "where's my photo?"
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap justify-start gap-3 mt-8">
                <Link to="/signup" className="text-center px-8 py-3.5 rounded-2xl font-semibold text-white transition-all hover:shadow-coral-lg hover:scale-105" style={{ background: 'linear-gradient(135deg,#FF6E6C,#67568C)', fontSize: 15 }}>
                  Start Fresher <SplashTag text="Start now" color="coral" rotation={3} className="ml-2" />
                </Link>
                <Link to="/demo" className="text-center px-8 py-3.5 rounded-2xl font-semibold transition-all hover:bg-white/15" style={{ background: 'linear-gradient(135deg,#FF6E6C,#67568C)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', fontSize: 15 }}>
                  See Demo →
                </Link>
              </div>

              {/* Privacy Trust Badge */}
              <div className="mt-8 flex items-center justify-start gap-2 text-xs font-medium opacity-70 w-full" style={{ color: 'var(--foreground)' }}>
                <Shield size={14} className="text-emerald-500" />
                <span>Privacy First: Selfies are deleted automatically after matching.</span>
              </div>
            </div>

            {/* Phone Mockup */}
            <div className="relative flex justify-center mt-8 md:mt-0">
              <div className="relative" style={{ perspective: '1000px' }}>
                <div className="relative rounded-[36px] overflow-hidden" style={{ width: 'min(260px, 80vw)', height: 'min(520px, 65vw)', minHeight: 380, background: '#241630', border: '8px solid rgba(255,255,255,0.08)', boxShadow: '0 40px 80px rgba(91,33,182,0.4)' }}>
                  <div className="absolute inset-0 p-5 flex flex-col gap-3">
                    <div className="text-center mt-4">
                      <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-3" style={{ background: 'linear-gradient(135deg,#FF6E6C,#67568C)' }}>
                        <Camera size={28} color="white" />
                      </div>
                      <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 18, color: 'white', fontWeight: 600 }}>Your Gallery</div>
                      <div style={{ fontSize: 10, color: '#9B9BA6', marginTop: 2 }}>12 photos found · 99.8% match</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {['/home-gallery-1.jpg', '/home-gallery-2.jpg', '/home-gallery-3.jpg', '/home-gallery-4.jpg', '/home-gallery-5.jpg', '/home-gallery-6.jpg'].map((src, idx) => (
                        <div key={idx} className="rounded-xl overflow-hidden photo-print" style={{ height: 70 }}>
                          <img src={src} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 rounded-xl py-2.5 text-center text-xs font-semibold text-white" style={{ background: 'linear-gradient(135deg,#FF6E6C,#67568C)' }}>
                      Download All Photos
                    </div>
                  </div>
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 rounded-full bg-black" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <WaveDivider fill="var(--background)" fromColor="var(--foreground)" />

      {/* How It Works */}
      <section className="py-24 px-6" style={{ background: 'var(--background)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 'clamp(28px,4vw,44px)', color: 'var(--foreground)' }}>How SnapMoment Works</h2>
            <p className="text-text-muted mt-3 text-base max-w-md mx-auto">Three simple steps. Zero friction. Pure magic.</p>
          </div>
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="hidden md:block absolute top-16 left-[16.7%] right-[16.7%] h-px border-t-2 border-dashed border-border z-0" />
            {[
              { step: 1, icon: Camera, title: 'Photographer Uploads', desc: 'Upload event photos in real time. AI indexes every face.' },
              { step: 2, icon: QrCode, title: 'Guests Scan QR', desc: 'Each guest scans the event QR code and verifies via phone OTP.' },
              { step: 3, icon: Smile, title: 'Take a Selfie', desc: 'AI matches and delivers only their photos instantly.' },
            ].map(({ step, icon: Icon, title, desc }: any) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: step * 0.15, duration: 0.6 }}
                viewport={{ once: true }}
                className="relative z-10 rounded-3xl p-8 text-center"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'linear-gradient(135deg,var(--background),#FFE1D9)' }}>
                  <Icon size={24} color="#FF6E6C" />
                </div>
                <h3 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 20, color: 'var(--foreground)' }}>{title}</h3>
                <p className="text-sm text-text-muted mt-2 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 relative noise-overlay" style={{ background: 'var(--background)' }}>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 'clamp(28px,4vw,44px)', color: 'var(--foreground)' }}>
              Everything you need. <br />Nothing you don't.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                className={`group relative overflow-hidden rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2 ${
                  f.wide ? 'md:col-span-2' : ''
                } ${f.title === 'Privacy First' ? 'md:col-start-2' : ''}`}
                style={{
                  background: 'var(--card)',
                  border: '2px solid rgba(25, 196, 19, 0.13)',
                  boxShadow: '0 0 20px rgba(25, 196, 19, 0.13)'
                }}
              >
                {f.title === 'Privacy First' && (
                  <div className="absolute top-4 right-4">
                    <SplashTag text="Privacy Verified ✓" color="amber" rotation={3} />
                  </div>
                )}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'rgba(0, 196, 140, 0.1)', border: '1px solid rgba(0, 196, 140, 0.2)' }}>
                  <f.icon size={26} color="#00C48C" />
                </div>
                <h3 className="font-bold text-xl mb-3" style={{ color: 'var(--foreground)' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed text-text-muted">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-6" style={{ background: 'var(--background)' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatCounter value={200} suffix="+" label="Photographers" color="#00C48C" />
          <StatCounter value={50000} suffix="+" label="Photos Delivered" color="#00C48C" />
          <StatCounter value={1200} suffix="+" label="Events Hosted" color="#00C48C" />
          <StatCounter value={99} suffix="%" label="AI Accuracy" color="#00C48C" />
        </div>
      </section>

      {/* NEW Testimonials Section */}
      <section className="py-24 px-6 overflow-hidden" style={{ background: 'var(--background)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 'clamp(28px,4vw,44px)', color: 'var(--foreground)' }}>
              Trusted by Pros. <SplashTag text="Real users ✦✦✦" color="coral" rotation={-2} fontSize={18} />
            </h2>
          </div>

          <div
            className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] max-h-[660px] overflow-hidden"
          >
            <TestimonialsColumn testimonials={col1} duration={20} />
            <TestimonialsColumn testimonials={col2} className="hidden md:block" duration={25} />
            <TestimonialsColumn testimonials={col3} className="hidden lg:block" duration={22} />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-6" style={{ background: 'var(--background)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 'clamp(28px,4vw,44px)', color: 'var(--foreground)' }}>Simple, Honest Pricing</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Fresher', price: '₹499', features: ['5 events/month', '200 photos/event', 'QR + OTP flow', 'Branded watermark'], cta: 'Fresher', color: '#000000ff', highlighted: true },
              { name: 'Pro', price: '₹1,499', period: '/mo', features: ['50 events/month', '2,000 photos/event', 'Custom watermark', 'Analytics dashboard'], cta: 'Go Pro', color: '#000000ff', highlighted: true, tag: 'Most loved ♥♥♥', fontSize: 18 },
              { name: 'Studio', price: '₹4,999', period: '/mo', features: ['Unlimited events', 'Unlimited photos', 'White-label QR', 'API access'], cta: 'Go Studio', color: '#000000ff', highlighted: true },
            ].map((plan) => (
              <div
                key={plan.name}
                className="rounded-3xl p-8 relative flex flex-col"
                style={{
                  background: plan.highlighted ? 'linear-gradient(135deg,#FF6E6C,#67568C)' : 'var(--card)',
                  border: plan.highlighted ? 'none' : '1px solid var(--border)',
                  transform: plan.highlighted ? 'scale(1.05)' : 'none',
                  zIndex: plan.highlighted ? 10 : 1
                }}
              >
                {plan.tag && <div className="absolute top-5 right-5"><SplashTag text={plan.tag} color="amber" rotation={3} /></div>}
                <div className="mb-8">
                  <div className="text-sm font-semibold mb-2" style={{ color: plan.highlighted ? 'rgba(255, 252, 252, 0.91)' : 'var(--muted)' }}>{plan.name}</div>
                  <div className="text-5xl font-bold" style={{ color: plan.highlighted ? 'white' : 'var(--foreground)' }}>
                    {plan.price}<span className="text-lg font-normal">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-4 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm" style={{ color: plan.highlighted ? 'rgba(255, 255, 255, 0.9)' : 'var(--muted)' }}>
                      <Check size={16} className={plan.highlighted ? 'text-amber-400' : 'text-primary'} /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/signup" className={`mt-10 block text-center py-4 rounded-2xl font-bold transition-all ${plan.highlighted ? 'bg-white text-primary hover:bg-gray-100' : 'bg-primary text-white hover:brightness-110'}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 relative noise-overlay" style={{ background: 'var(--foreground)' }}>
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 'clamp(28px,4vw,44px)', color: 'var(--background)' }}>Frequently Asked</h2>
          </div>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div key={i} className="rounded-2xl overflow-hidden" style={{ background: '#241630', border: '1px solid rgba(255,255,255,0.06)' }}>
                <button className="w-full flex items-center justify-between p-6 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="font-medium text-white text-sm">{item.q}</span>
                  <ChevronDown size={18} color="#A394A8" style={{ transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
                </button>
                {openFaq === i && <div className="px-6 pb-6 text-sm leading-relaxed text-text-muted">{item.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 text-center" style={{ background: 'linear-gradient(135deg,#FF6E6C,#67568C)' }}>
        <h2 className="text-4xl md:text-5xl font-bold text-white">Ready to transform your events?</h2>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
          <Link to="/signup" className="px-10 py-4 rounded-2xl font-bold bg-white text-primary hover:scale-105 transition-transform">Start Fresher Today</Link>
          <Link to="/demo" className="px-10 py-4 rounded-2xl font-bold border border-white/30 text-white hover:bg-white/10 transition-all">Watch Demo</Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}

// Helper Icon
function Smile({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  )
}

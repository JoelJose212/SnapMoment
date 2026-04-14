import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Camera } from 'lucide-react'
import AuroraRibbon from '../components/shared/AuroraRibbon'
import Navbar from '../components/shared/Navbar'
import Footer from '../components/shared/Footer'
import SplashTag from '../components/shared/SplashTag'

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
  { year: '2023 Q3', label: 'First ArcFace Integration', desc: 'Integrated DeepFace ArcFace model, achieving 99.2% matching accuracy.' },
  { year: '2024 Q1', label: '100 Photographers', desc: 'Reached 100 active photographers across 12 cities.' },
  { year: '2024 Q3', label: '200+ & Growing', desc: 'Now serving over 200 photographers with 50,000+ photo deliveries.' },
  { year: '2024 Q4', label: 'Real-Time Delivery Launch', desc: 'Introduced instant photo delivery with QR-based access for guests.' },
  { year: '2025 Q1', label: 'AI Accuracy Boost', desc: 'Enhanced face recognition pipeline, achieving up to 99.8% accuracy.' },
  { year: '2025 Q2', label: 'Pan-India Expansion', desc: 'Expanded to 30+ cities with a rapidly growing photographer network.' },
  { year: '2025 Q3', label: '1 Lakh+ Deliveries', desc: 'Surpassed 100,000+ successful photo deliveries across events.' },
  { year: '2025 Q4', label: 'Studio Plan Launch', desc: 'Launched Studio plan with unlimited uploads and permanent hosting.' },
  { year: '2026 Q1', label: 'Smart Dashboard', desc: 'Introduced advanced analytics and event tracking for photographers.' },
  { year: '2026 Q2', label: 'Multi-Photographer Support', desc: 'Enabled seamless collaboration for multiple photographers per event.' },
  { year: '2026 Q3', label: 'Guest Experience Upgrade', desc: 'Improved selfie capture with real-time face alignment guidance.' },
  { year: '2026 Q4', label: 'Global Expansion Begins', desc: 'Started onboarding international users and expanding globally.' },
];


export default function AboutPage() {
  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh' }}>
      <AuroraRibbon />
      <Navbar />

      {/* Hero */}
      <header
        className="relative flex flex-col items-center justify-center overflow-hidden py-24 px-6 text-center w-full"
        style={{ background: 'var(--background)' }}
      >
        <h1 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 'clamp(36px,5vw,60px)', fontWeight: 600, color: 'var(--foreground)' }}>
          Building for the moments<br />that matter most
        </h1>
        <p className="text-base mt-5 max-w-md mx-auto leading-relaxed" style={{ color: 'var(--muted)', fontSize: 'clamp(18px,2vw,22px)' }}>
          SnapMoment was born from a simple frustration: why do event photos take days to arrive, buried in a shared drive with hundreds of strangers?
        </p>
      </header>

      {/* Story */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 40, color: 'var(--foreground)', marginBottom: 16 }}>Our Story...</h2>
          <div className="space-y-4 text-base leading-relaxed text-muted" style={{ fontSize: 'clamp(16px,2vw,20px)' }}>
            <p>We were at a friend's wedding in 2023. The photographer did a wonderful job capturing thousands of precious memories. But when it came time to share them, she sent a Google Drive link — 3,000 photos for 400 guests. Chaos.</p>
            <p>Our co-founders,<b>Joel and Nandini</b>, spent the evening manually forwarding photos to relatives. "There has to be a better way," they said. Six months later, SnapMoment was born.</p>
            <p>Today, SnapMoment powers over 200 photographers and has delivered memories to guests at weddings, college events, corporate functions, and birthday parties across India.</p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6" style={{ background: 'var(--background)' }}>
        <div className="max-w-5xl mx-auto">
          <h2 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 36, color: 'var(--foreground)', textAlign: 'center', marginBottom: 48 }}>Our Values</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Privacy First', desc: 'Guest selfies are processed and deleted immediately. We never store raw facial data beyond the matching moment.' },
              { title: 'Human at the Core', desc: 'AI is our tool, not our product. Every feature is designed around the human experience of sharing memories.' },
              { title: 'Zero Friction', desc: "No app downloads. No account creation for guests. Scan, verify, smile — that's it." },
            ].map((v, i) => (
              <motion.div 
                key={v.title} 
                className="rounded-3xl p-7 transition-colors duration-300" 
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                whileHover={{ y: -8, boxShadow: '0 12px 40px rgba(255, 110, 108, 0.15)', borderColor: 'rgba(255,110,108,0.5)' }}
              >
                <h3 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 22, color: 'var(--foreground)', marginBottom: 8 }}>{v.title}</h3>
                <p className="text-sm leading-relaxed text-muted">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 36, color: 'var(--foreground)', marginBottom: 40 }}>
            Our Journey <SplashTag text="Est. 2023" color="amber" rotation={-2} className="ml-3" />
          </h2>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px" style={{ background: 'var(--border)' }} />
            <div className="space-y-8">
              {TIMELINE.map((item) => (
                <div key={item.year} className="flex gap-6 pl-16 relative">
                  <div className="absolute left-4 top-1 w-4 h-4 rounded-full border-2 border-primary" style={{ background: 'var(--card)' }} />
                  <div>
                    <div className="text-xs font-semibold text-primary mb-1">{item.year}</div>
                    <div className="font-semibold text-foreground">{item.label}</div>
                    <div className="text-sm text-muted mt-1">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Marquee Section */}
      <section className="relative w-full overflow-hidden py-24" style={{ background: 'var(--background)' }}>
        {/* Decorative background SVG */}
        <div className="absolute right-0 bottom-0 text-[var(--border)]" style={{ opacity: 0.6 }}>
          <svg fill="none" height="154" viewBox="0 0 460 154" width="460" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M-87.463 458.432C-102.118 348.092 -77.3418 238.841 -15.0744 188.274C57.4129 129.408 180.708 150.071 351.748 341.128C278.246 -374.233 633.954 380.602 548.123 42.7707"
              stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="40"
            />
          </svg>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mx-auto mb-16 flex max-w-5xl flex-col items-center px-6 text-center">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl shadow-coral" style={{ background: 'linear-gradient(135deg,#FF6E6C,#67568C)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.051 12.616a1 1 0 0 1 1.909.024l.737 1.452a1 1 0 0 0 .737.535l1.634.256a1 1 0 0 1 .588 1.806l-1.172 1.168a1 1 0 0 0-.282.866l.259 1.613a1 1 0 0 1-1.541 1.134l-1.465-.75a1 1 0 0 0-.912 0l-1.465.75a1 1 0 0 1-1.539-1.133l.258-1.613a1 1 0 0 0-.282-.866l-1.156-1.153a1 1 0 0 1 .572-1.822l1.633-.256a1 1 0 0 0 .737-.535z"/><path d="M8 15H7a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/></svg>
            </div>

            <h2 className="relative mb-4 font-semibold text-foreground" style={{ fontFamily: '"Cormorant Garamond"', fontSize: 'clamp(36px,5vw,56px)', lineHeight: 1.1 }}>
              Meet the SnapMoment Team
              <svg className="absolute -top-4 -right-12 -z-10 w-28 text-[var(--border)]" fill="currentColor" height="86" viewBox="0 0 108 86" width="108" xmlns="http://www.w3.org/2000/svg">
                <path d="M38.8484 16.236L15 43.5793L78.2688 15L18.1218 71L93 34.1172L70.2047 65.2739" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="28" />
              </svg>
            </h2>
            <p className="max-w-2xl text-muted mt-2 text-lg">
              The creative minds and technical leaders empowering photographers with seamless memory sharing.
            </p>
          </div>

          <div className="relative w-full overflow-hidden">
            {/* Edge fade gradients */}
            <div className="pointer-events-none absolute top-0 left-0 z-10 w-32 h-full" style={{ background: 'linear-gradient(to right, var(--background), transparent)' }} />
            <div className="pointer-events-none absolute top-0 right-0 z-10 w-32 h-full" style={{ background: 'linear-gradient(to left, var(--background), transparent)' }} />

            <div className="flex w-max animate-marquee hover:[animation-play-state:paused] py-4">
              {/* Duplicate array for seamless infinite marquee loop */}
              {[...TEAM, ...TEAM].map((member, idx) => (
                <div className="group flex w-72 shrink-0 flex-col mx-4" key={idx}>
                  <div className="relative h-96 w-full overflow-hidden rounded-3xl" style={{ border: '1px solid var(--border)' }}>
                    <img alt={member.name} className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105" src={member.img} />
                    <div className="absolute bottom-4 left-4 right-4 rounded-2xl p-4 text-center glass transition-all duration-300 group-hover:-translate-y-2 group-hover:bg-white/95">
                      <h3 className="font-bold text-foreground text-lg" style={{ fontFamily: '"Plus Jakarta Sans"' }}>
                        {member.name}
                      </h3>
                      <p className="text-[#FF6E6C] font-medium text-sm mt-1">
                        {member.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-24 max-w-3xl px-6 text-center">
            <p className="mb-10 font-medium text-xl text-foreground leading-relaxed" style={{ fontFamily: '"Cormorant Garamond"', fontSize: '28px' }}>
              "The synergy within the SnapMoment founding team is remarkable. We saw a problem in the industry, and we built a solution that works natively, beautifully, and instantly."
            </p>
            <div className="flex flex-col items-center gap-3">
              <div className="relative h-16 w-16 overflow-hidden rounded-full photo-print" style={{ borderWidth: '3px' }}>
                <img alt="Joel Jose Varghese" className="h-full w-full object-cover" src="/team/joel.jpg" />
              </div>
              <div className="text-center">
                <p className="font-bold text-foreground">Joel Jose Varghese</p>
                <p className="text-muted text-sm mt-0.5">CTO · SnapMoment</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, ChevronDown, CheckCircle2, XCircle } from 'lucide-react'
import Navbar from '../components/shared/Navbar'
import Footer from '../components/shared/Footer'
import SplashTag from '../components/shared/SplashTag'
import AuroraRibbon from '../components/shared/AuroraRibbon'
import WaveDivider from '../components/shared/WaveDivider'

const FAQ = [
  { q: 'Can I upgrade or downgrade my plan at any time?', a: 'Yes, you can upgrade, downgrade, or cancel your subscription at any time from your dashboard settings. Prorated refunds are standard.' },
  { q: 'Is there a limit on how long photos are hosted?', a: 'Fresher and Pro accounts keep photos hosted for 30 days after an event. Studio accounts have unlimited permanent hosting.' },
  { q: 'What happens if I go over my photo limit?', a: 'If you need to upload an extra batch for a massive event, you can buy a one-time "Event Boost" for ₹500 without needing to upgrade to a higher monthly tier.' },
  { q: 'Do guests need to pay to download photos?', a: 'No! Guests never pay anything to access or download their matched photos.' },
  {q: 'Can I share photos directly on social media?',a: 'Yes! Guests can instantly share their photos on platforms like Instagram and WhatsApp directly from the gallery.'},
  {q: 'Is there a backup of uploaded photos?',a: 'Yes, all uploaded photos are securely backed up to prevent any data loss during the event.'},
  
]

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <AuroraRibbon />
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <header
          className="relative flex flex-col items-center justify-center overflow-hidden pt-24 pb-16 px-4 md:px-6 text-center w-full"
          style={{ background: 'var(--background)' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <div className="mb-6 flex justify-center">
              <SplashTag text="✦ Simple & Transparent" color="coral" rotation={-4} fontSize={18} />
            </div>
            <h1 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1.1 }}>
              Scale your photography business without limits.
            </h1>
            <p className="mt-6 text-lg max-w-xl mx-auto leading-relaxed" style={{ color: 'var(--muted)' }}>
              Start with Fresher, upgrade when you need to handle massive crowds. No hidden fees, ever.
            </p>
          </motion.div>
        </header>

        {/* Pricing Cards */}
        <section className="pb-24 px-6 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: 'Fresher', price: '₹499', delay: 0, features: ['5 events/month', '200 photos/event', 'QR + OTP flow', 'Branded watermark', 'Email support'], cta: 'Fresher', highlighted: false, tag: null },
                { name: 'Pro', price: '₹1,499', period: '/mo', delay: 0.1, features: ['50 events/month', '4,000 photos/event', 'Custom watermark', 'Bulk download (ZIP)', 'Priority support', 'Analytics dashboard'], cta: 'Go Pro', highlighted: true, tag: 'Most loved ♥♥♥' },
                { name: 'Studio', price: '₹4,999', period: '/mo', delay: 0.2, features: ['Unlimited events', 'Unlimited photos', 'White-label QR', 'API access', 'Dedicated support', 'Custom domain'], cta: 'Go Studio', highlighted: false, tag: null },
              ].map((plan) => (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: plan.delay, duration: 0.5 }}
                  key={plan.name}
                  className="rounded-3xl p-8 relative overflow-hidden flex flex-col"
                  style={{
                    background: plan.highlighted ? 'linear-gradient(135deg,#FF6E6C,#67568C)' : 'var(--card)',
                    boxShadow: plan.highlighted ? '0 16px 48px rgba(255,110,108,0.35)' : '0 4px 24px rgba(28,16,24,0.08)',
                    border: plan.highlighted ? 'none' : '1px solid var(--border)',
                    transform: plan.highlighted ? 'scale(1.04)' : 'none',
                    zIndex: plan.highlighted ? 10 : 1
                  }}
                >
                  {plan.tag && (
                    <div className="absolute top-5 right-5">
                      <SplashTag text={plan.tag} color="amber" rotation={3} />
                    </div>
                  )}
                  <div className="mb-6">
                    <div className="text-sm font-semibold mb-3" style={{ color: plan.highlighted ? 'rgba(255,255,255,0.7)' : 'var(--muted)' }}>{plan.name}</div>
                    <div style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 48, fontWeight: 700, color: plan.highlighted ? 'var(--card)' : 'var(--foreground)', lineHeight: 1 }}>
                      {plan.price}<span style={{ fontSize: 16, fontWeight: 400 }}>{plan.period}</span>
                    </div>
                  </div>
                  <ul className="space-y-3 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm font-medium" style={{ color: plan.highlighted ? 'rgba(255,255,255,0.9)' : '#4B5563' }}>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: plan.highlighted ? 'rgba(255,255,255,0.2)' : '#FFE1D9' }}>
                          <Check size={12} color={plan.highlighted ? 'var(--card)' : '#FF6E6C'} strokeWidth={3} />
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/signup"
                    className="mt-8 block text-center py-3.5 rounded-2xl text-sm font-bold transition-all hover:scale-105"
                    style={{
                      background: plan.highlighted ? 'var(--card)' : 'linear-gradient(135deg,#FF6E6C,#67568C)',
                      color: plan.highlighted ? '#FF6E6C' : 'var(--card)',
                      boxShadow: plan.highlighted ? '0 4px 14px rgba(0,0,0,0.1)' : '0 4px 14px rgba(255,110,108,0.3)'
                    }}
                  >
                    {plan.cta}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Comparison */}
        <section className="py-24 px-6 relative" style={{ background: 'var(--card)' }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 'clamp(28px,4vw,36px)', color: 'var(--foreground)', fontWeight: 700 }}>Compare Plans in Detail</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="py-4 px-6 border-b-2 border-[var(--border)] text-[var(--foreground)] font-bold text-lg w-1/4">Features</th>
                    <th className="py-4 px-6 border-b-2 border-[var(--border)] text-[var(--muted)] font-semibold text-center w-1/4">Fresher</th>
                    <th className="py-4 px-6 border-b-2 border-[var(--border)] text-[#FF6E6C] font-bold text-center w-1/4">Pro</th>
                    <th className="py-4 px-6 border-b-2 border-[var(--border)] text-[var(--foreground)] font-bold text-center w-1/4">Studio</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    ['Events per Month', '5', '50', 'Unlimited'],
                    ['Photos per Event', '200', '2,000', 'Unlimited'],
                    ['AI Facial Recognition', true, true, true],
                    ['Guest OTP Verification', true, true, true],
                    ['Watermark Type', 'SnapMoment Banner', 'Your Custom Logo', 'Your Custom Logo'],
                    ['Bulk Download (ZIP)', false, true, true],
                    ['Analytics Dashboard', false, true, true],
                    ['Custom Domain / CNAME', false, false, true],
                    ['API Access', false, false, true],
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-[var(--background)] transition-colors border-b border-[var(--border)]">
                      <td className="py-4 px-6 font-medium text-[#4B5563]">{row[0]}</td>
                      {row.slice(1).map((val, j) => (
                        <td key={j} className="py-4 px-6 text-center text-[#4B5563]">
                          {typeof val === 'boolean' ? (
                            val ? <CheckCircle2 className="mx-auto" size={20} color="#FF6E6C" /> : <XCircle className="mx-auto" size={20} color="#D1D5DB" />
                          ) : (
                            <span className={j === 1 ? 'font-semibold text-[#FF6E6C]' : ''}>{val}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Wave divider to dark section */}
        <WaveDivider fill="var(--foreground)" fromColor="var(--card)" flip />

        {/* FAQ */}
        <section className="py-24 px-6 relative noise-overlay" style={{ background: 'var(--foreground)' }}>
          <div className="max-w-3xl mx-auto relative z-10">
            <div className="text-center mb-12">
              <h2 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 'clamp(28px,4vw,44px)', color: 'var(--background)', fontWeight: 700 }}>Questions? We have answers.</h2>
            </div>
            <div className="space-y-3">
              {FAQ.map((item, i) => (
                <div key={i} className="rounded-2xl overflow-hidden" style={{ background: '#241630', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <button
                    className="w-full flex items-center justify-between p-6 text-left"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="font-medium text-white text-sm pr-4">{item.q}</span>
                    <ChevronDown size={18} color="#A394A8" style={{ transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s', flexShrink: 0 }} />
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-6 text-sm leading-relaxed" style={{ color: '#9B9BA6' }}>
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-20 px-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#FF6E6C,#67568C)' }}>
          <div className="max-w-3xl mx-auto text-center relative z-10">
             <h2 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 'clamp(28px,4vw,44px)', fontWeight: 700, color: 'white' }}>
              Stop manual sharing. Start matching.
            </h2>
            <p className="mt-4 text-white/90 text-lg">Join SnapMoment today. Upgrade anytime.</p>
            <div className="flex justify-center mt-8">
              <Link to="/signup" className="px-10 py-4 rounded-2xl font-bold text-[#FF6E6C] bg-white hover:scale-105 transition-all shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
                ✦ Create Account ✦
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

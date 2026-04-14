import { useState } from 'react'
import { MapPin, Mail, Phone, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import AuroraRibbon from '../components/shared/AuroraRibbon'
import Navbar from '../components/shared/Navbar'
import Footer from '../components/shared/Footer'
import { contactApi } from '../lib/api'

const FAQ = [
  { q: 'How long does it take to set up an event?', a: 'Less than 5 minutes. Create event, get QR code, share with guests.' },
  { q: 'Can photographers customize the watermark?', a: 'Yes! Pro and Studio plans support custom logo watermarks on all event photos.' },
  { q: 'Is there a mobile app for photographers?', a: 'Currently it\'s a web app, fully mobile-responsive. A dedicated app is on our 2025 roadmap.' },
  { q: 'What file formats are supported for upload?', a: 'JPG, PNG, HEIC, WEBP — all common camera formats. Max 20MB per photo.' },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) { toast.error('Fill all required fields'); return }
    setLoading(true)
    try {
      await contactApi.submit(form)
      setSuccess(true)
      toast.success('Message sent! We\'ll reply within 24 hours 📸')
    } catch {
      toast.error('Failed to send. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      className="relative flex flex-col items-center justify-center overflow-hidden min-h-screen w-full"
      style={{ background: 'var(--background)' }}
    >
      <AuroraRibbon />
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-20">
        <div className="text-center mb-14">
          <h1 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 'clamp(28px,4vw,48px)', color: 'var(--foreground)' }}>Get in Touch</h1>
          <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>We respond within 24 hours on business days.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Form */}
          <div>
            {success ? (
              <div className="rounded-3xl p-10 text-center" style={{ background: 'linear-gradient(135deg,#FF6E6C,#67568C)' }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <Mail size={28} color="white" />
                </div>
                <h3 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 26, color: 'var(--foreground)' }}>Message Sent!</h3>
                <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.75)' }}>Thank you, {form.name}! We'll get back to you at {form.email} within 24 hours.</p>
                <button onClick={() => { setSuccess(false); setForm({ name: '', email: '', subject: '', message: '' }) }} className="mt-6 text-sm font-medium text-white/70 hover:text-white">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="rounded-3xl p-8 space-y-4" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(28,16,24,0.06)' }}>
                {[
                  { label: 'Your Name *', key: 'name', type: 'text', placeholder: 'Priya Sharma' },
                  { label: 'Email *', key: 'email', type: 'email', placeholder: 'priya@studio.com' },
                  { label: 'Subject', key: 'subject', type: 'text', placeholder: 'Question about Pro plan' },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key}>
                    <label className="text-sm font-medium text-text-main block mb-1.5">{label}</label>
                    <input type={type} value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-border text-sm outline-none focus:border-primary transition-colors" placeholder={placeholder} style={{ background: 'var(--background)' }} />
                  </div>
                ))}
                <div>
                  <label className="text-sm font-medium text-text-main block mb-1.5">Message *</label>
                  <textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border text-sm outline-none focus:border-primary transition-colors resize-none" placeholder="Tell us how we can help..." style={{ background: 'var(--background)' }} />
                </div>
                <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-coral-lg disabled:opacity-60" style={{ background: 'linear-gradient(135deg,#FF6E6C,#67568C)' }}>
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          {/* Right: Info + FAQ + Map */}
          <div className="space-y-6">
            <div className="rounded-3xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 22, color: 'var(--foreground)', marginBottom: 16 }}>Contact Info</h3>
              <div className="space-y-3">
                {[
                  { icon: MapPin, text: 'Office No. -05, 5th Floor, Surya TI Mall, Bhilai, Chhattisgarh, 490020' },
                  { icon: Mail, text: 'support@snapmoment.app' },
                  { icon: Phone, text: '+91 98765 43210' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-start gap-3 text-sm text-text-muted">
                    <Icon size={16} color="#FF6E6C" className="mt-0.5 shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div className="rounded-3xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 22, color: 'var(--foreground)', marginBottom: 16 }}>Quick FAQ</h3>
              <div className="space-y-2">
                {FAQ.map((item, i) => (
                  <div key={i} className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                    <button className="w-full flex items-center justify-between p-4 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                      <span className="text-sm font-medium text-text-main pr-4">{item.q}</span>
                      <ChevronDown size={16} color="#A394A8" style={{ transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s', flexShrink: 0 }} />
                    </button>
                    {openFaq === i && <div className="px-4 pb-4 text-sm text-text-muted">{item.a}</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="rounded-3xl overflow-hidden" style={{ height: 200 }}>
              <iframe
                title="SnapMoment Office"
                src="https://maps.google.com/maps?q=Office+No.+-05,+5th+Floor,+Surya+TI+Mall,+Bhilai,+Chhattisgarh,+490020&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%" height="200" style={{ border: 0 }} loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MapPin, Mail, Phone, ChevronDown, 
  Send, MessageSquare, Clock,
  Instagram, Twitter, Linkedin, Globe,
  ArrowRight, CheckCircle, ShieldCheck,
  Headphones, Users, Calendar
} from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/shared/Navbar'
import Footer from '../components/shared/Footer'
import WaveDivider from '../components/shared/WaveDivider'
import { contactApi } from '../lib/api'

const FAQ = [
  { q: 'How fast can I start using SnapMoment?', a: 'Setup takes less than 5 minutes. Once you create an account, you can generate your first event QR code and start matching instantly.' },
  { q: 'Can I trial the Pro features for free?', a: 'Yes! We offer a 14-day free trial on our Pro plan. No credit card is required to start testing custom watermarks and analytics.' },
  { q: 'Is my guest data secure?', a: 'Absolutely. We are GDPR compliant. Guest selfies are used for one-time matching and are automatically purged from our cache every 24 hours.' },
  { q: 'Do you offer on-site support for large events?', a: 'For Enterprise/Studio clients, we offer remote priority support and can coordinate on-site assistance for major festivals in select cities.' },
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
      toast.success('Message received. We\'ll be in touch soon.')
    } catch {
      toast.error('Unable to send message. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-primary/20 text-slate-900">
      <Navbar />

      {/* Hero Header - Grounded & Professional */}
      <section className="pt-32 pb-20 bg-white border-b border-slate-100 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="max-w-3xl">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs mb-6"
              >
                <div className="w-8 h-[2px] bg-primary" />
                Direct Support
              </motion.div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-slate-900">
                We're here to help <br />
                <span className="text-slate-400">your studio scale.</span>
              </h1>
              <p className="text-xl text-slate-500 leading-relaxed max-w-xl font-medium">
                Whether you're a wedding photographer or a festival organizer, our team provides technical and sales support tailored to your specific needs.
              </p>
            </div>

            {/* New Realistic Graphic Column */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-8 border-slate-50 photo-print -rotate-2">
                <img 
                  src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=800" 
                  alt="Photography Professional" 
                  className="w-full h-[450px] object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-slate-900 text-white p-8 rounded-3xl shadow-3xl animate-float">
                <div className="text-4xl font-bold mb-1">200+</div>
                <div className="text-xs font-bold text-white/40 uppercase tracking-widest">Active Studios <br />Worldwide</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-16">
            
            {/* Left Column: Form Section */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
                <h2 className="text-2xl font-bold mb-2">Send us a message</h2>
                <p className="text-slate-500 mb-10 font-medium">Expect a detailed response within 12-24 hours.</p>

                {success ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-emerald-50 rounded-2xl p-10 text-center border border-emerald-100"
                  >
                    <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <CheckCircle size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-emerald-900 mb-2">Inquiry Received</h3>
                    <p className="text-emerald-700/80 mb-8 font-medium">Thank you, {form.name.split(' ')[0]}. Our team has been notified and will reach out shortly.</p>
                    <button 
                      onClick={() => { setSuccess(false); setForm({ name: '', email: '', subject: '', message: '' }) }}
                      className="text-emerald-700 font-bold hover:underline"
                    >
                      Send another inquiry
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Full Name</label>
                        <input 
                          type="text" 
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all font-medium"
                          placeholder="e.g. John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Email Address</label>
                        <input 
                          type="email" 
                          required
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all font-medium"
                          placeholder="e.g. johndoe@mail.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Inquiry Subject</label>
                      <select 
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all font-medium appearance-none"
                      >
                        <option value="">Select an option</option>
                        <option value="Sales">Sales & Pricing</option>
                        <option value="Technical">Technical Support</option>
                        <option value="Partnership">Partnership Opportunities</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Your Message</label>
                      <textarea 
                        rows={6}
                        required
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all font-medium resize-none"
                        placeholder="Please describe how we can assist you..."
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full py-5 rounded-xl bg-slate-900 text-white font-bold text-lg hover:bg-black active:scale-[0.98] transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : (
                        <>
                          Send Message <Send size={18} />
                        </>
                      )}
                    </button>
                    
                    <div className="flex items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      <span className="flex items-center gap-2"><ShieldCheck size={14} /> Data encrypted</span>
                      <span className="flex items-center gap-2"><Clock size={14} /> Global support</span>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Right Column: Contact Details & Office */}
            <div className="lg:col-span-5 space-y-12">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-8">Contact Channels</h3>
                <div className="space-y-8">
                  {[
                    { icon: Mail, label: 'Email', val: 'support@snapmoment.app', sub: 'Best for technical queries' },
                    { icon: Phone, label: 'Phone', val: '+91 98765 43210', sub: 'Available 10 AM - 6 PM IST' },
                    { icon: MapPin, label: 'Headquarters', val: 'Bhilai, Chhattisgarh, India', sub: 'Office 05, Surya TI Mall' },
                  ].map((info, i) => (
                    <div key={i} className="flex gap-5 group">
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:border-primary/30 transition-colors shrink-0">
                        <info.icon size={20} />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{info.label}</div>
                        <div className="text-lg font-bold text-slate-900 mb-1">{info.val}</div>
                        <div className="text-sm text-slate-500 font-medium">{info.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Company Stats / Badges */}
              <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                <div className="relative z-10 space-y-6">
                  <h4 className="text-lg font-bold">Studio Support Stats</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                      <div className="text-2xl font-bold text-primary">12h</div>
                      <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Avg. Response</div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                      <div className="text-2xl font-bold text-primary">99%</div>
                      <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Satisfaction</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Presence */}
              <div className="pt-4">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Social Connect</div>
                <div className="flex gap-3">
                  {[Instagram, Twitter, Linkedin, Globe].map((Icon, i) => (
                    <button key={i} className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all shadow-sm">
                      <Icon size={20} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section - Integrated & Refined */}
      <section className="py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 tracking-tight">Visit our Headquarters</h2>
              <p className="text-lg text-slate-500 font-medium mb-10">
                Our core engineering and support teams operate out of Bhilai. We're always open for a coffee and a chat about the future of photography.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-slate-700 font-bold">
                  <Calendar size={20} className="text-primary" />
                  <span>Mon - Fri, 09:00 - 18:00</span>
                </div>
                <div className="flex items-center gap-4 text-slate-700 font-bold">
                  <Users size={20} className="text-primary" />
                  <span>Available for Studio Demos</span>
                </div>
              </div>
            </div>
            <div className="h-[450px] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 relative group">
              <iframe
                title="SnapMoment Office"
                src="https://maps.google.com/maps?q=Office+No.+-05,+5th+Floor,+Surya+TI+Mall,+Bhilai,+Chhattisgarh,+490020&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%" height="100%" style={{ border: 0 }} loading="lazy"
              />
              <div className="absolute top-4 left-4">
                <div className="bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   Open Now
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & FAQ Section */}
      <section className="py-32 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
             <Headphones size={48} className="text-primary/20 mx-auto mb-6" />
             <h2 className="text-4xl font-bold tracking-tight mb-4">Frequently Asked</h2>
             <p className="text-slate-500 font-medium">Quick answers to common support and sales inquiries.</p>
          </div>
          
          <div className="space-y-4">
            {FAQ.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:border-slate-300 transition-colors">
                <button
                  className="w-full p-8 text-left flex items-center justify-between"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-bold text-lg text-slate-900">{item.q}</span>
                  <ChevronDown className={`text-slate-400 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-8 pb-8 text-slate-600 leading-relaxed font-medium"
                    >
                      <div className="h-px bg-slate-100 w-full mb-6" />
                      {item.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { 
  MapPin, Mail, Phone, ChevronDown, 
  Send, MessageSquare, Clock,
  Instagram, Twitter, Linkedin, Globe,
  ArrowRight, CheckCircle, ShieldCheck,
  Headphones, Users, Calendar, Sparkles, Coffee, HelpCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import AuroraRibbon from '../components/shared/AuroraRibbon'
import Navbar from '../components/shared/Navbar'
import Footer from '../components/shared/Footer'
import SplashTag from '../components/shared/SplashTag'
import WaveDivider from '../components/shared/WaveDivider'
import { contactApi } from '../lib/api'

const FAQ = [
  { q: 'How fast can I start using SnapMoment?', a: 'Setup takes less than 5 minutes. Once you create an account, you can generate your first event QR code and start matching instantly.' },
  { q: 'Can I trial the Pro features for free?', a: 'Yes! We offer a 14-day free trial on our Pro plan. No credit card required to start testing custom watermarks and analytics.' },
  { q: 'Is my guest data secure?', a: 'Absolutely. We are GDPR compliant. Guest selfies are used for one-time matching and are automatically purged immediately after the session.' },
  { q: 'Do you offer on-site support for large events?', a: 'For Enterprise clients, we offer remote priority support and can coordinate on-site assistance for major events in select cities.' },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const { scrollY } = useScroll()
  const blob1Y = useTransform(scrollY, [0, 1000], [0, -80])
  const blob2Y = useTransform(scrollY, [0, 1000], [0, -50])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) { toast.error('Please fill all required fields'); return }
    setLoading(true)
    try {
      await contactApi.submit(form)
      setSuccess(true)
      toast.success('Message sent! We\'ll be in touch soon.')
    } catch {
      toast.error('Unable to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100 transition-all font-semibold text-slate-800 text-sm placeholder:text-slate-300"

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden selection:bg-violet-100">
      <AuroraRibbon />
      <Navbar />

      {/* Hero */}
      <section className="pt-36 pb-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <motion.div style={{ y: blob1Y }} className="absolute -top-32 right-[-10%] w-[500px] h-[500px] bg-violet-100 blur-[120px] rounded-full opacity-60" />
          <motion.div style={{ y: blob2Y }} className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-cyan-100 blur-[100px] rounded-full opacity-50" />
          <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 right-1/4 w-[300px] h-[300px] bg-amber-100 blur-[100px] rounded-full" />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 50, x: `${15 + Math.random() * 70}%` }}
              animate={{ opacity: [0, 0.4, 0], y: -100 }}
              transition={{ duration: 5 + Math.random() * 3, repeat: Infinity, delay: i * 1.3, ease: 'easeOut' }}
              className="absolute w-1.5 h-1.5 rounded-full bg-violet-300" />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16,1,0.3,1] }}
              className="max-w-xl">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-violet-50 border border-violet-200 mb-6">
                <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                <span className="text-xs font-semibold text-violet-700 tracking-wide uppercase">Get in Touch</span>
                <SplashTag text="WE'RE HERE" color="purple" rotation={-3} fontSize={9} />
              </div>
              <h1 className="text-5xl md:text-[3.5rem] font-black tracking-tight mb-6 text-slate-900 leading-[1.05]">
                <motion.span initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>We'd love to</motion.span><br />
                <motion.span initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="gradient-text">hear from you.</motion.span>
              </h1>
              <p className="text-lg text-slate-500 leading-relaxed">
                Whether you're a wedding photographer or a festival organizer, our team provides support tailored to your needs.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95, x: 30 }} animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }} className="relative hidden lg:block">
              <motion.div animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.95, 1.02, 0.95] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -inset-6 bg-violet-100 blur-[40px] rounded-3xl pointer-events-none" />
              <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-100 -rotate-2 hover:rotate-0 transition-transform duration-700">
                <img src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=800" alt="Photography" className="w-full h-[450px] object-cover" />
              </div>
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-8 -left-4 bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
                <div className="text-3xl font-black gradient-text mb-0.5 tracking-tight">250+</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Studios</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <WaveDivider fill="#F8FAFC" fromColor="#FFFFFF" />

      {/* Contact Form + Info */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-14">
            
            {/* Form */}
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-10 md:p-12 shadow-lg border border-slate-100 relative overflow-hidden">
                {/* Shine sweep */}
                <motion.div animate={{ x: ['-200%', '300%'] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', repeatDelay: 5 }}
                  className="absolute inset-y-0 w-1/4 bg-gradient-to-r from-transparent via-violet-50/30 to-transparent pointer-events-none skew-x-[-15deg] z-0" />
                
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 text-violet-500 font-semibold text-xs uppercase tracking-widest mb-3">
                    <MessageSquare size={14} /> Send a Message
                    <SplashTag text="QUICK" color="teal" rotation={3} fontSize={8} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Start a Conversation</h2>
                  <p className="text-slate-400 text-sm mb-10">We typically respond within 12–24 hours.</p>

                  {success ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      className="bg-emerald-50 rounded-2xl p-10 text-center border border-emerald-200">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
                        className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200">
                        <CheckCircle size={28} />
                      </motion.div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                      <p className="text-slate-500 text-sm mb-8">Thanks, {form.name.split(' ')[0]}. We'll get back to you soon.</p>
                      <button onClick={() => { setSuccess(false); setForm({ name: '', email: '', subject: '', message: '' }) }}
                        className="text-violet-600 font-semibold text-sm hover:gap-3 transition-all flex items-center gap-2 mx-auto">
                        Send Another <ArrowRight size={14} />
                      </button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Full Name *</label>
                          <input id="name" name="name" type="text" required value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className={inputClass} placeholder="John Doe" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email *</label>
                          <input id="email" name="email" type="email" required value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className={inputClass} placeholder="john@email.com" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Subject</label>
                        <select id="subject" name="subject" value={form.subject}
                          onChange={(e) => setForm({ ...form, subject: e.target.value })}
                          className={inputClass + ' appearance-none cursor-pointer'}>
                          <option value="">Select a topic</option>
                          <option value="Sales">Sales & Pricing</option>
                          <option value="Technical">Technical Support</option>
                          <option value="Partnership">Partnership</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Message *</label>
                        <textarea id="message" name="message" rows={5} required value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          className={inputClass + ' resize-none'} placeholder="How can we help?" />
                      </div>

                      <button type="submit" disabled={loading}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold text-sm hover:shadow-xl hover:shadow-violet-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                        {loading ? 'Sending...' : <><Send size={15} /> Send Message</>}
                      </button>
                      
                      <div className="flex items-center justify-center gap-6 text-[10px] font-semibold text-slate-400">
                        <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-emerald-500" /> Encrypted</span>
                        <span className="flex items-center gap-1.5"><Globe size={13} className="text-violet-400" /> Global Support</span>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Right Column */}
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
              className="lg:col-span-5 space-y-10">
              
              {/* Contact Info */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-7">Contact Information</h3>
                <div className="space-y-6">
                  {[
                    { icon: Mail, label: 'Email', val: 'support@snapmoment.app', sub: 'Technical & Sales' },
                    { icon: Phone, label: 'Phone', val: '+91 98765 43210', sub: '10 AM – 6 PM IST' },
                    { icon: MapPin, label: 'Office', val: 'Surya TI Mall, Bhilai', sub: 'Chhattisgarh, India' },
                  ].map((info, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-4 group">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-300 group-hover:text-violet-500 group-hover:border-violet-200 group-hover:shadow-lg transition-all shrink-0">
                        <info.icon size={18} />
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{info.label}</div>
                        <div className="text-lg font-bold text-slate-800 tracking-tight">{info.val}</div>
                        <div className="text-xs text-slate-400">{info.sub}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Stats Card */}
              <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="bg-gradient-to-br from-violet-600 via-violet-700 to-cyan-600 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1),transparent_60%)]" />
                <motion.div animate={{ x: ['-200%', '300%'] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 4 }}
                  className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none skew-x-[-15deg]" />
                <div className="relative z-10 space-y-5">
                  <div className="inline-flex items-center gap-2 text-white/80 font-semibold text-xs uppercase tracking-widest">
                    <Sparkles size={13} /> Support Stats
                    <SplashTag text="FAST" color="emerald" rotation={-3} fontSize={8} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-sm border border-white/10">
                      <div className="text-3xl font-black text-white mb-0.5 tracking-tight">12h</div>
                      <div className="text-[9px] font-semibold text-white/50 uppercase tracking-widest">Avg. Response</div>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-sm border border-white/10">
                      <div className="text-3xl font-black text-white mb-0.5 tracking-tight">99%</div>
                      <div className="text-[9px] font-semibold text-white/50 uppercase tracking-widest">Satisfaction</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Social */}
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Follow Us</div>
                <div className="flex gap-3">
                  {[Instagram, Twitter, Linkedin, Globe].map((Icon, i) => (
                    <motion.button key={i} whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}
                      className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 hover:text-violet-500 hover:border-violet-200 hover:shadow-lg transition-all shadow-sm">
                      <Icon size={18} />
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <WaveDivider fill="#FFFFFF" fromColor="#F8FAFC" />

      {/* Map Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="space-y-8">
              <div className="inline-flex items-center gap-2 text-violet-500 font-semibold text-xs uppercase tracking-widest">
                <Coffee size={14} /> Visit Us
                <SplashTag text="OPEN" color="emerald" rotation={2} fontSize={8} />
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Visit our <span className="gradient-text">headquarters.</span>
              </h2>
              <p className="text-base text-slate-500 leading-relaxed">
                Our core engineering and support teams operate from Bhilai. We're always open for a coffee and a conversation about the future of photography.
              </p>
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-4 text-sm text-slate-600 font-semibold">
                  <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center text-violet-500">
                    <Calendar size={16} />
                  </div>
                  Mon – Fri, 11:00 AM – 7:00 PM IST
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600 font-semibold">
                  <div className="w-9 h-9 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600">
                    <Users size={16} />
                  </div>
                  Walk-in demos available
                </div>
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="h-[450px] rounded-3xl overflow-hidden shadow-xl border border-slate-100 relative group">
              <iframe title="SnapMoment Office"
                src="https://maps.google.com/maps?q=Surya+Treasure+Island+Mall,+Bhilai+Junwani+Rd,+near+Apollo+Hospital,+Smriti+Nagar,+Surya+Vihar,+Chhattisgarh+490020&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%" height="100%" style={{ border: 0, filter: 'brightness(1.05)' }} loading="lazy" />
              
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative">
                  <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }} transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 bg-violet-500 rounded-full -m-6" />
                  <div className="bg-white p-3.5 rounded-2xl shadow-xl relative z-10">
                    <MapPin size={26} className="text-violet-600" />
                  </div>
                </div>
              </div>

              <div className="absolute top-5 left-5">
                <div className="bg-slate-900 text-white px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-lg flex items-center gap-2 border border-white/10">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Studio Open
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <WaveDivider fill="#F8FAFC" fromColor="#FFFFFF" />

      {/* FAQ */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 mb-4">
              <HelpCircle size={13} className="text-cyan-600" />
              <span className="text-xs font-semibold text-cyan-700 tracking-wide uppercase">FAQ</span>
              <SplashTag text="QUICK ANSWERS" color="teal" rotation={3} fontSize={8} />
            </div>
            <h2 className="text-4xl md:text-[3.5rem] font-black text-slate-900 mb-4 tracking-tight">
              Common <span className="gradient-text">Questions</span>
            </h2>
          </motion.div>
          
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-2xl border transition-all duration-300 ${openFaq === i ? 'border-violet-200 bg-violet-50/30 shadow-md' : 'border-slate-200 bg-white hover:border-violet-100'}`}>
                <button className="w-full py-5 px-6 text-left flex items-center justify-between"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}>
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

      <Footer />
    </div>
  )
}

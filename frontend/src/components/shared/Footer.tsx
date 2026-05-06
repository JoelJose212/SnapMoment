import { 
  Camera, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Youtube, 
  Mail, 
  Heart, 
  MapPin, 
  Phone, 
  ArrowUpRight, 
  Sparkles 
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'

export default function Footer() {
  const location = useLocation()
  const currentYear = new Date().getFullYear()
  const { token, role } = useAuthStore()
  const isLoggedIn = !!token

  const isActive = (path: string) => location.pathname === path

  return (
    <footer className="relative bg-slate-950 pt-24 pb-12 overflow-hidden border-t border-slate-900">
      {/* Atmospheric Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 blur-[120px] rounded-full opacity-50" />
        <div className="absolute top-1/2 -right-48 w-[500px] h-[500px] bg-accent/5 blur-[150px] rounded-full opacity-30" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Upper Footer: CTA & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 pb-24 border-b border-white/5">
          <div className="lg:col-span-7">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight uppercase mb-8">
                Ready to capture <br />
                <span className="text-teal-500">the eternal?</span>
              </h2>
              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/signup" 
                  className="px-8 py-4 rounded-xl bg-teal-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-teal-500 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-teal-500/20"
                >
                  Join Elite Circle <ArrowUpRight size={16} />
                </Link>
                <Link 
                  to="/photographers" 
                  className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Find an Artist
                </Link>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-5">
             <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4">Insider Access</p>
                <h4 className="text-xl font-black text-white italic tracking-tight mb-6">Join 10,000+ creators for visual storytelling trends.</h4>
                <div className="flex gap-2">
                  <input 
                    type="email" 
                    placeholder="your@email.com" 
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm font-medium text-white outline-none focus:border-primary transition-all"
                  />
                  <button className="h-14 w-14 rounded-xl aurora-bg flex items-center justify-center text-white shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                    <Sparkles size={20} />
                  </button>
                </div>
             </div>
          </div>
        </div>

        {/* Middle Footer: Links & Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 py-24">
          {/* Brand Info */}
          <div className="lg:col-span-4">
            <Link to="/" className="flex items-center gap-3 mb-8 group">
              <div className="w-12 h-12 rounded-2xl aurora-bg flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                <Camera size={24} className="text-white" />
              </div>
              <span className="text-2xl font-black text-white tracking-tighter uppercase italic">SnapMoment</span>
            </Link>
            <p className="text-slate-400 font-medium leading-relaxed mb-10 max-w-sm">
              The world's most sophisticated AI engine for private event memory sharing. Delivering cinematic experiences instantly to every guest.
            </p>
            <div className="flex gap-3">
              {[Instagram, Twitter, Linkedin, Youtube].map((Icon, i) => (
                <motion.a 
                  key={i} 
                  href="#" 
                  whileHover={{ y: -5, scale: 1.1 }}
                  className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-primary/30 transition-all backdrop-blur-md"
                >
                  <Icon size={20} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Nav Links */}
          <div className="lg:col-span-2">
            <h5 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-8 italic">Experience</h5>
            <ul className="space-y-4">
              {[
                { label: 'Master Artists', href: '/photographers' },
                { label: 'Demo', href: '/demo' },
                { label: 'Pricing', href: '/pricing' },
                { label: 'About', href: '/about' },
                { label: 'Contact', href: '/contact' }
              ].map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href} 
                    className={`${isActive(link.href) ? 'text-primary' : 'text-slate-400'} hover:text-primary font-bold text-sm transition-colors flex items-center gap-2 group`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive(link.href) ? 'bg-primary' : 'bg-slate-800'} group-hover:bg-primary transition-colors`} />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h5 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-8 italic">Studio</h5>
            <ul className="space-y-4">
              {!isLoggedIn ? (
                <>
                  <li><Link to="/signup" className="text-slate-400 hover:text-primary font-bold text-sm transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-primary transition-colors" />Become Partner</Link></li>
                  <li><Link to="/login" className="text-slate-400 hover:text-primary font-bold text-sm transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-primary transition-colors" />Creator Login</Link></li>
                </>
              ) : role === 'photographer' ? (
                <>
                  <li><Link to="/photographer/dashboard" className="text-slate-400 hover:text-primary font-bold text-sm transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-primary transition-colors" />My Dashboard</Link></li>
                  <li><Link to="/photographer/profile" className="text-slate-400 hover:text-primary font-bold text-sm transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-primary transition-colors" />Edit Profile</Link></li>
                </>
              ) : (
                <>
                  <li><Link to="/client/dashboard" className="text-slate-400 hover:text-primary font-bold text-sm transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-primary transition-colors" />Client Portal</Link></li>
                  <li><Link to="/photographers" className="text-slate-400 hover:text-primary font-bold text-sm transition-colors flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-primary transition-colors" />Browse Artists</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-4">
            <h5 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-8 italic">Headquarters</h5>
            <div className="space-y-6">
               <div className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/10 transition-colors">
                    <MapPin size={18} />
                  </div>
                  <p className="text-slate-400 font-bold text-sm leading-relaxed">
                    Office 05, Surya TI Mall, <br />
                    Bhilai, Chhattisgarh, India....
                  </p>
               </div>
               <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/10 transition-colors">
                    <Phone size={18} />
                  </div>
                  <p className="text-slate-400 font-bold text-sm">+91 98765 43210</p>
               </div>
               <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/10 transition-colors">
                    <Mail size={18} />
                  </div>
                  <p className="text-slate-400 font-bold text-sm">concierge@snapmoment.app</p>
               </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer: Legal & Copyright */}
        <div className="pt-12 flex flex-col md:flex-row items-center justify-between gap-8 border-t border-white/5">
          <div className="flex items-center gap-6">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              © {currentYear} SnapMoment Masterpiece.
            </p>
            <div className="flex gap-6">
              <Link to="#" className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Privacy</Link>
              <Link to="#" className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Terms</Link>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Architected with</span>
            <Heart size={12} className="text-primary fill-primary animate-pulse" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">in India</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

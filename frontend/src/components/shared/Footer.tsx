import { Link } from 'react-router-dom'
import { Camera, Heart, Instagram, Twitter, Linkedin } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{ background: 'var(--foreground)', color: '#A394A8' }} className="w-full pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10 border-b border-white/10">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#FF6E6C,#67568C)' }}>
              <Camera size={18} color="white" />
            </div>
              <span style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 22, fontWeight: 600, color: 'white' }}>SnapMoment</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'var(--muted)' }}>
              AI-driven event photo sharing. Your guests get only their photos — privately, instantly, magically.
            </p>
            <div className="flex gap-3 mt-5">
              {[Instagram, Twitter, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10" style={{ background: 'rgba(255,255,255,0.06)', color: '#A394A8' }}>
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold mb-4" style={{ color: 'white', fontFamily: '"Plus Jakarta Sans"' }}>Product</h4>
            <ul className="space-y-2.5 text-sm">
              {[['Features', '/#features'], ['Pricing', '/pricing'], ['Demo', '/demo'], ['About', '/about']].map(([label, href]) => (
                <li key={label}><Link to={href} className="hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold mb-4" style={{ color: 'white', fontFamily: '"Plus Jakarta Sans"' }}>Company</h4>
            <ul className="space-y-2.5 text-sm">
              {[['Contact', '/contact'], ['Login', '/login'], ['Sign Up', '/signup']].map(([label, href]) => (
                <li key={label}><Link to={href} className="hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs" style={{ color: 'var(--muted)' }}>© 2024 SnapMoment. All rights reserved.</p>
          <p className="text-xs flex items-center gap-1" style={{ color: 'var(--muted)' }}>
            Made with <Heart size={11} fill="#FF6E6C" color="#FF6E6C" /> in India
          </p>
        </div>
      </div>
    </footer>
  )
}

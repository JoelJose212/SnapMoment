import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Camera, Eye, EyeOff, User, Briefcase, Mail, Lock, 
  Phone, Sparkles, ArrowRight, ShieldCheck, MapPin, 
  ChevronLeft, ChevronRight, Calendar, UserCheck, 
  Target, Zap, CheckCircle2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi, bookingsApi } from '../lib/api'
import { useAuthStore } from '../store/authStore'

const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say']
const REFERRAL_SOURCES = ['Instagram', 'Facebook', 'Friend/Family', 'Google Search', 'Other']

const FALLBACK_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana", 
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", 
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", 
  "Uttar Pradesh", "Uttarakhand", "West Bengal"
]

const STEPS = [
  { id: 'identity', title: 'Identity', icon: User },
  { id: 'location', title: 'Location', icon: MapPin },
  { id: 'profile', title: 'Profile', icon: UserCheck },
  { id: 'success', title: 'Done', icon: CheckCircle2 }
]

export default function SignupPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [role, setRole] = useState<'photographer' | 'client'>('photographer')
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  
  const [form, setForm] = useState({ 
    full_name: '', email: '', phone: '', password: '', 
    confirm_password: '', studio_name: '',
    state: '', district: '', city: '', pincode: '',
    dob: '', gender: '', referral_source: ''
  })

  const [states, setStates] = useState<string[]>(FALLBACK_STATES)
  const [districts, setDistricts] = useState<string[]>([])

  useEffect(() => {
    bookingsApi.states()
      .then(res => {
        if (res.data && res.data.length > 0) setStates(res.data)
      })
      .catch(() => console.log("Using fallback states"))
  }, [])

  useEffect(() => {
    if (form.state) {
      bookingsApi.districts(form.state).then(res => {
        if (res.data) setDistricts(res.data)
      }).catch(() => {})
    } else {
      setDistricts([])
    }
  }, [form.state])

  const handleNext = () => {
    if (currentStep === 0) {
      if (!form.full_name || !form.email || !form.password) {
        toast.error('Please fill all identity fields')
        return
      }
      if (form.password !== form.confirm_password) {
        toast.error('Passwords do not match')
        return
      }
    }
    setCurrentStep(prev => prev + 1)
  }

  const handleBack = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Sanitize form data: convert empty strings to null for optional backend fields
      const sanitizedData = { ...form }
      Object.keys(sanitizedData).forEach(key => {
        if (sanitizedData[key as keyof typeof form] === '') {
          (sanitizedData as any)[key] = null
        }
      })

      const res = role === 'client' 
        ? await authApi.clientSignup(sanitizedData)
        : await authApi.signup(sanitizedData)
      
      const { access_token, role: userRole, user_id, full_name, email, onboarding_step, subscription_active } = res.data
      setAuth(access_token, userRole, user_id, full_name, email, onboarding_step, subscription_active)
      
      toast.success(`Account Created Successfully! ✅`)
      setCurrentStep(3) 
      
      setTimeout(() => {
        navigate(userRole === 'client' ? '/client/dashboard' : '/photographer/events')
      }, 2500)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex selection:bg-primary/20 bg-white">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex flex-col justify-between p-16 relative overflow-hidden bg-slate-900" style={{ width: '40%' }}>
         <div className="absolute inset-0 opacity-40">
            <img src="/signup_background_photography_1777452989343.png" className="w-full h-full object-cover" alt="Bkg" />
         </div>
         <div className="relative z-10">
            <Link to="/" className="flex items-center gap-3">
               <Camera className="text-primary" size={32} />
               <span className="text-2xl font-black text-white italic tracking-tighter uppercase">SnapMoment</span>
            </Link>
         </div>
         <div className="relative z-10">
            <h2 className="text-5xl font-black text-white uppercase italic leading-tight mb-6">Start Your <br /> <span className="text-primary">Legacy.</span></h2>
            <p className="text-white/60 font-medium">Join the next generation of AI-powered photography delivery.</p>
         </div>
         <div className="relative z-10 text-[10px] text-white/30 font-bold uppercase tracking-[0.4em]">Engineered for Excellence — 2024</div>
      </div>

      {/* Right panel - Form Wizard */}
      <div className="flex-1 flex flex-col bg-[#FDFCFB]">
         <div className="max-w-xl mx-auto w-full px-8 py-20 flex-1 flex flex-col">
            {/* Steps Progress */}
            {currentStep < 3 && (
               <div className="flex items-center gap-6 mb-16">
                  {STEPS.slice(0, 3).map((step, i) => (
                     <div key={step.id} className="flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                           i <= currentStep ? 'bg-slate-900 text-white shadow-xl scale-110' : 'bg-slate-100 text-slate-300'
                        }`}>
                           <step.icon size={20} />
                        </div>
                        {i < 2 && <div className={`w-10 h-1 rounded-full ${i < currentStep ? 'bg-slate-900' : 'bg-slate-100'}`} />}
                     </div>
                  ))}
               </div>
            )}

            <div className="flex-1">
               {currentStep === 0 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <h3 className="text-3xl font-black text-slate-900 uppercase italic">Your <span className="text-primary">Identity.</span></h3>
                     
                     <div className="p-1 bg-slate-100 rounded-2xl flex items-center mb-8 max-w-[280px]">
                        <button onClick={() => setRole('photographer')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${role === 'photographer' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>Photographer</button>
                        <button onClick={() => setRole('client')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${role === 'client' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>Client</button>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Full Name</label>
                           <input id="full_name" name="full_name" type="text" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 font-bold text-slate-900 outline-none focus:border-primary transition-all shadow-sm" placeholder="Arjun Singh" />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Secure Email</label>
                           <input id="email" name="email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 font-bold text-slate-900 outline-none focus:border-primary transition-all shadow-sm" placeholder="arjun@studio.com" />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Phone</label>
                           <input id="phone" name="phone" type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 font-bold text-slate-900 outline-none focus:border-primary transition-all shadow-sm" placeholder="+91 98765 43210" />
                        </div>
                        {role === 'photographer' && (
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Studio</label>
                              <input id="studio_name" name="studio_name" type="text" value={form.studio_name} onChange={e => setForm({...form, studio_name: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 font-bold text-slate-900 outline-none focus:border-primary transition-all shadow-sm" placeholder="Studio Name" />
                           </div>
                        )}
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Password</label>
                           <input id="password" name="password" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 font-bold text-slate-900 outline-none focus:border-primary transition-all shadow-sm" placeholder="••••••••" />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Confirm</label>
                           <input id="confirm_password" name="confirm_password" type="password" value={form.confirm_password} onChange={e => setForm({...form, confirm_password: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 font-bold text-slate-900 outline-none focus:border-primary transition-all shadow-sm" placeholder="••••••••" />
                        </div>
                     </div>
                  </div>
               )}

               {currentStep === 1 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                     <h3 className="text-3xl font-black text-slate-900 uppercase italic">Global <span className="text-primary">Reach.</span></h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">State</label>
                           <select id="state" name="state" value={form.state} onChange={e => setForm({...form, state: e.target.value, district: ''})} className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 font-bold text-slate-900 outline-none focus:border-primary transition-all shadow-sm">
                              <option value="">Select State</option>
                              {states.map(s => <option key={s} value={s}>{s}</option>)}
                           </select>
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">District</label>
                           <select id="district" name="district" value={form.district} onChange={e => setForm({...form, district: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 font-bold text-slate-900 outline-none focus:border-primary transition-all shadow-sm" disabled={!form.state}>
                              <option value="">Select District</option>
                              {districts.map(d => <option key={d} value={d}>{d}</option>)}
                           </select>
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">City / Town</label>
                           <input id="city" name="city" type="text" value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 font-bold text-slate-900 outline-none focus:border-primary transition-all shadow-sm" placeholder="City" />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Pincode</label>
                           <input id="pincode" name="pincode" type="text" value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 font-bold text-slate-900 outline-none focus:border-primary transition-all shadow-sm" placeholder="Pincode" />
                        </div>
                     </div>
                  </div>
               )}

               {currentStep === 2 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                     <h3 className="text-3xl font-black text-slate-900 uppercase italic">Profile <span className="text-primary">Sync.</span></h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Date of Birth</label>
                           <input id="dob" name="dob" type="date" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 font-bold text-slate-900 outline-none shadow-sm" />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Gender</label>
                           <select id="gender" name="gender" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 font-bold text-slate-900 outline-none shadow-sm">
                              <option value="">Select Gender</option>
                              {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                           </select>
                        </div>
                        <div className="md:col-span-2 space-y-4">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">How did you hear about us?</label>
                           <div className="flex flex-wrap gap-2">
                              {REFERRAL_SOURCES.map(s => (
                                 <button key={s} type="button" onClick={() => setForm({...form, referral_source: s})} className={`px-5 py-2 rounded-xl font-bold text-xs transition-all ${form.referral_source === s ? 'bg-slate-900 text-white' : 'bg-white border border-slate-100 text-slate-400'}`}>
                                    {s}
                                 </button>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {currentStep === 3 && (
                  <div className="flex flex-col items-center justify-center text-center py-20 space-y-6">
                     <div className="h-20 w-20 rounded-3xl bg-slate-900 text-white flex items-center justify-center shadow-2xl animate-bounce">
                        <CheckCircle2 size={40} />
                     </div>
                     <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Account <span className="text-primary">Active.</span></h2>
                     <p className="text-slate-500 font-bold">Redirecting to your dashboard...</p>
                  </div>
               )}
            </div>

            {currentStep < 3 && (
               <div className="mt-12 pt-10 border-t border-slate-100 flex items-center justify-between">
                  <button onClick={handleBack} disabled={currentStep === 0} className="px-8 py-4 rounded-xl text-slate-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:text-slate-900 transition-all disabled:opacity-0">
                     <ChevronLeft size={16} /> Previous
                  </button>
                  {currentStep < 2 ? (
                     <button onClick={handleNext} className="px-10 py-4 rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl hover:scale-105 transition-all">
                        Next Phase <ChevronRight size={16} />
                     </button>
                  ) : (
                     <button onClick={handleSubmit} disabled={loading} className="px-12 py-4 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl hover:scale-105 transition-all disabled:opacity-70">
                        {loading ? 'Authenticating...' : 'Join Elite Circle'} <Zap size={16} />
                     </button>
                  )}
               </div>
            )}
         </div>
      </div>
    </div>
  )
}

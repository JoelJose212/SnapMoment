import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { 
  Camera, CheckCircle, Shield, CreditCard, ChevronRight, 
  Crown, Globe, Compass, Star, Award, ShieldCheck, 
  Zap, Clock, Calendar, Lock, Heart, CheckCircle2, ArrowRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import { onboardingApi } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import AuroraRibbon from '../../components/shared/AuroraRibbon'
import SplashTag from '../../components/shared/SplashTag'

function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const mouseXSpring = useSpring(x)
  const mouseYSpring = useSpring(y)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["4deg", "-4deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-4deg", "4deg"])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    x.set(e.clientX / rect.width - 0.5)
    y.set(e.clientY / rect.height - 0.5)
  }

  return (
    <motion.div onMouseMove={handleMouseMove} onMouseLeave={() => { x.set(0); y.set(0) }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className={className}>
      <div style={{ transform: "translateZ(20px)", transformStyle: "preserve-3d" }}>{children}</div>
    </motion.div>
  )
}

export default function OnboardingWizard() {
  const navigate = useNavigate()
  const { onboardingStep, setAuth, token, role, userId, fullName, email, subscriptionActive } = useAuthStore()
  
  const [loading, setLoading] = useState(false)
  const [logoLoading, setLogoLoading] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [step, setStep] = useState(Math.max(2, onboardingStep))
  
  const [studioForm, setStudioForm] = useState({
    founded_year: '2024',
    team_size: 'Just Me',
    primary_gear: '',
    portfolio_url: '',
    services: 'Weddings, Portraits',
    experience_level: 'Hobbyist',
  })
  
  const [plan, setPlan] = useState('pro')
  const [isYearly, setIsYearly] = useState(false)
  const [agreed, setAgreed] = useState(false)
  
  useEffect(() => {
    if (onboardingStep >= 6) {
      navigate('/photographer/events')
    }
  }, [onboardingStep, navigate])

  const updateAuthStep = (newStep: number) => {
    setAuth(token!, role!, userId!, fullName!, email!, newStep, subscriptionActive)
    setStep(newStep)
  }

  const handleStep2 = async () => {
    setLoading(true)
    try {
      const payload = { ...studioForm, services: studioForm.services.split(',').map(s => s.trim()) }
      const res = await onboardingApi.step2(payload)
      updateAuthStep(res.data.onboarding_step)
    } catch (err) {
      toast.error('Failed to save studio details')
    } finally {
      setLoading(false)
    }
  }

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => setLogoPreview(reader.result as string)
    reader.readAsDataURL(file)

    setLogoLoading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await onboardingApi.uploadLogo(formData)
      setLogoPreview(res.data.logo_url)
      toast.success('Studio logo optimized! ✨')
    } catch (err) {
      toast.error('Logo upload failed')
    } finally {
      setLogoLoading(false)
    }
  }

  const handleStep3 = async () => {
    setLoading(true)
    try {
      const res = await onboardingApi.step3({ 
        plan,
        billing_cycle: isYearly ? 'yearly' : 'monthly'
      })
      updateAuthStep(res.data.onboarding_step)
    } catch (err) {
      toast.error('Failed to save plan')
    } finally {
      setLoading(false)
    }
  }

  const handleStep4 = async () => {
    if (!agreed) {
      toast.error('You must agree to the Terms')
      return
    }
    setLoading(true)
    try {
      const res = await onboardingApi.step4()
      updateAuthStep(res.data.onboarding_step)
    } catch (err) {
      toast.error('Failed to accept agreement')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const orderRes = await onboardingApi.createOrder()
      if (orderRes.data.url) {
        window.location.href = orderRes.data.url
      } else {
        toast.error('Payment gateway unavailable')
      }
    } catch (err) {
      toast.error('Could not initiate checkout')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get('session_id')
    const mockSuccess = params.get('mock_success')

    if (sessionId || mockSuccess) {
      const verifyPayment = async () => {
        setLoading(true)
        try {
          const verifyRes = await onboardingApi.verifyPayment({ 
            session_id: sessionId,
            mock_success: mockSuccess === 'true'
          })
          updateAuthStep(verifyRes.data.onboarding_step)
          toast.success("Payment successful! Welcome to the Pro family.")
          navigate('/photographer/events')
        } catch (e) {
          toast.error("Payment verification failed. Contact support.")
        } finally {
          setLoading(false)
        }
      }
      verifyPayment()
    }
  }, [])

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 selection:bg-violet-100">
      <AuroraRibbon />
      
      {/* Background Blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div animate={{ x: [0, 50, 0], y: [0, 30, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-violet-200/40 blur-[100px] rounded-full" />
        <motion.div animate={{ x: [0, -40, 0], y: [0, 50, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-cyan-200/30 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-violet-200">
              <Camera size={20} className="text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 font-jakarta">SnapMoment</span>
          </div>
          
          <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-2 rounded-2xl border border-white/50 shadow-sm">
            {[2, 3, 4, 5].map((s) => (
              <div key={s} className="relative">
                <div className={`h-1.5 rounded-full transition-all duration-700 ${s <= step ? 'w-10 bg-violet-600' : 'w-10 bg-slate-200'}`} />
                {s === step && (
                  <motion.div layoutId="active-step-glow" className="absolute -inset-1 bg-violet-400/20 blur-md rounded-full" />
                )}
              </div>
            ))}
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center py-8">
          <AnimatePresence mode="wait">
            {/* STEP 2: STUDIO SETUP */}
            {step === 2 && (
              <motion.div key="step2" initial="hidden" animate="visible" exit="exit" variants={variants} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} 
                className="w-full max-w-2xl bg-white/70 backdrop-blur-2xl p-8 md:p-12 rounded-[2.5rem] border border-white shadow-2xl shadow-slate-200/50">
                <div className="text-center mb-10">
                  <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight font-jakarta">Your Creative Space</h1>
                  <p className="text-slate-500 font-medium">Let's build your professional identity on SnapMoment.</p>
                </div>
                
                <div className="grid md:grid-cols-12 gap-10">
                  {/* Left: Logo Upload */}
                  <div className="md:col-span-4 flex flex-col items-center">
                    <div className="relative group">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        className={`w-36 h-36 rounded-3xl border-2 border-dashed transition-all duration-300 flex items-center justify-center overflow-hidden bg-slate-50 ${logoLoading ? 'border-violet-300' : 'border-slate-200 group-hover:border-violet-400 group-hover:bg-violet-50'}`}>
                        {logoPreview ? (
                          <img src={logoPreview} alt="Studio Logo" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center text-slate-400 gap-2">
                            <Camera size={32} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Logo</span>
                          </div>
                        )}
                        
                        {logoLoading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                            <div className="w-8 h-8 border-3 border-violet-600 border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-violet-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-xs font-bold text-violet-700">Change</span>
                        </div>
                      </motion.div>
                      <input type="file" accept="image/*" onChange={handleLogoChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                    <div className="mt-4 px-3 py-1 bg-violet-100 rounded-full">
                      <span className="text-[10px] font-bold text-violet-700 uppercase tracking-wider">Studio Branding</span>
                    </div>
                  </div>

                  {/* Right: Form */}
                  <div className="md:col-span-8 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Founded</label>
                        <input type="number" value={studioForm.founded_year} onChange={e => setStudioForm({...studioForm, founded_year: e.target.value})} 
                          className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:border-violet-400 transition-all font-medium" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Team Size</label>
                        <select value={studioForm.team_size} onChange={e => setStudioForm({...studioForm, team_size: e.target.value})} 
                          className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:border-violet-400 transition-all font-medium appearance-none">
                          <option>Just Me</option>
                          <option>2-5 members</option>
                          <option>5+ members</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Specializations</label>
                      <input type="text" value={studioForm.services} onChange={e => setStudioForm({...studioForm, services: e.target.value})} 
                        placeholder="Weddings, Corporate, etc."
                        className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:border-violet-400 transition-all font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Primary Gear</label>
                      <input type="text" value={studioForm.primary_gear} onChange={e => setStudioForm({...studioForm, primary_gear: e.target.value})} 
                        placeholder="e.g. Sony A7IV, Canon R5"
                        className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:border-violet-400 transition-all font-medium" />
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex gap-4">
                  <button disabled={loading} onClick={handleStep2} 
                    className="flex-1 py-4.5 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold flex justify-center items-center gap-2 hover:shadow-xl hover:shadow-violet-200 transition-all group active:scale-[0.98]">
                    {loading ? 'Saving Studio...' : 'Continue to Plans'} <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: PLAN SELECTION */}
            {step === 3 && (
              <motion.div key="step3" initial="hidden" animate="visible" exit="exit" variants={variants} transition={{ duration: 0.5 }} 
                className="w-full max-w-5xl">
                <div className="text-center mb-12">
                  <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight font-jakarta">Choose Your Power</h1>
                  <p className="text-slate-500 text-lg font-medium">Select the plan that fits your studio's scale.</p>
                  
                  {/* Billing Toggle */}
                  <div className="mt-8 inline-flex items-center p-1 bg-white/50 backdrop-blur-md rounded-full border border-white shadow-inner">
                    <button onClick={() => setIsYearly(false)} 
                      className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all ${!isYearly ? 'bg-white shadow-md text-violet-600' : 'text-slate-400 hover:text-slate-600'}`}>
                      Monthly
                    </button>
                    <button onClick={() => setIsYearly(true)} 
                      className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${isYearly ? 'bg-white shadow-md text-violet-600' : 'text-slate-400 hover:text-slate-600'}`}>
                      Yearly <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[10px] text-emerald-600 font-black">Save 25%</span>
                    </button>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    { id: 'starter', name: 'Starter', price: 0, icon: Compass, color: 'slate', perks: ['5 events / mo', '200 photos / event', 'AI Face Matching', 'Standard Watermark'] },
                    { id: 'pro', name: 'Pro', price: 1499, icon: Crown, color: 'violet', popular: true, perks: ['50 events / mo', '4,000 photos / event', 'Custom Branding', 'Bulk ZIP Export', 'Priority AI Queue'] },
                    { id: 'enterprise', name: 'Enterprise', price: 4999, icon: Globe, color: 'slate-900', perks: ['Unlimited events', 'Unlimited photos', 'White-label Experience', 'API Access', 'Dedicated Manager'] }
                  ].map(p => (
                    <TiltCard key={p.id} className="h-full">
                      <div onClick={() => setPlan(p.id)} 
                        className={`h-full relative p-8 rounded-[2rem] cursor-pointer transition-all border-2 flex flex-col ${plan === p.id ? 'border-violet-600 bg-white shadow-2xl shadow-violet-100' : 'border-white bg-white/60 hover:bg-white/80 hover:border-violet-200 shadow-xl'}`}>
                        
                        {p.popular && (
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                            <SplashTag text="MOST POPULAR" color="purple" rotation={0} fontSize={8} />
                          </div>
                        )}
                        
                        <div className={`w-12 h-12 rounded-2xl mb-6 flex items-center justify-center ${p.id === 'pro' ? 'bg-violet-600 text-white shadow-lg shadow-violet-200' : 'bg-slate-100 text-slate-600'}`}>
                          <p.icon size={24} />
                        </div>
                        
                        <h3 className="text-2xl font-black text-slate-900 mb-2 font-jakarta">{p.name}</h3>
                        <div className="flex items-baseline gap-1 mb-8">
                          <span className="text-3xl font-black text-slate-900">
                            ₹{isYearly && p.id !== 'starter' ? Math.round(p.price * 12 * 0.75).toLocaleString('en-IN') : p.price.toLocaleString('en-IN')}
                          </span>
                          <span className="text-slate-400 font-bold text-sm">{isYearly ? '/yr' : '/mo'}</span>
                        </div>
                        
                        <ul className="space-y-4 mb-8 flex-1">
                          {p.perks.map((perk, i) => (
                            <li key={i} className="flex gap-3 items-center text-sm font-semibold text-slate-600">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${p.id === 'pro' ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 text-slate-400'}`}>
                                <CheckCircle2 size={12} />
                              </div>
                              {perk}
                            </li>
                          ))}
                        </ul>
                        
                        <div className={`w-full py-4 rounded-2xl text-center font-bold transition-all ${plan === p.id ? 'bg-violet-600 text-white shadow-lg shadow-violet-200' : 'bg-slate-50 text-slate-900 border border-slate-200'}`}>
                          {plan === p.id ? 'Plan Selected' : 'Choose Plan'}
                        </div>
                      </div>
                    </TiltCard>
                  ))}
                </div>
                
                <div className="mt-12 flex justify-center">
                  <button disabled={loading} onClick={handleStep3} 
                    className="px-12 py-5 rounded-[2rem] bg-slate-900 text-white font-black flex items-center gap-3 hover:shadow-2xl hover:bg-black transition-all active:scale-[0.98]">
                    {loading ? 'Confirming...' : 'Select Plan & Continue'} <ChevronRight size={20} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: TERMS */}
            {step === 4 && (
              <motion.div key="step4" initial="hidden" animate="visible" exit="exit" variants={variants} transition={{ duration: 0.5 }} 
                className="w-full max-w-xl bg-white/70 backdrop-blur-2xl p-10 md:p-14 rounded-[2.5rem] border border-white shadow-2xl">
                <div className="text-center mb-10">
                  <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck size={32} />
                  </div>
                  <h1 className="text-3xl font-black text-slate-900 mb-2 font-jakarta">The Agreement</h1>
                  <p className="text-slate-500 font-medium">Review our simple terms for a safe platform.</p>
                </div>
                
                <div className="p-6 rounded-3xl h-64 overflow-y-auto mb-8 bg-slate-50/50 border border-slate-100 custom-scrollbar">
                  <div className="space-y-6 text-slate-600 font-medium text-sm leading-relaxed">
                    <section>
                      <h4 className="text-slate-900 font-bold mb-2 flex items-center gap-2 font-jakarta"><Lock size={14} className="text-violet-500" /> 1. Acceptable Use</h4>
                      <p>You agree not to upload illicit, copyrighted, or sensitive material without proper consent from the subjects.</p>
                    </section>
                    <section>
                      <h4 className="text-slate-900 font-bold mb-2 flex items-center gap-2 font-jakarta"><Heart size={14} className="text-pink-500" /> 2. Guest Consent</h4>
                      <p>You are responsible for ensuring guests are aware that their photos will be indexed via AI for matching purposes.</p>
                    </section>
                    <section>
                      <h4 className="text-slate-900 font-bold mb-2 flex items-center gap-2 font-jakarta"><Clock size={14} className="text-cyan-500" /> 3. Data Retention</h4>
                      <p>Starter accounts have photos purged after 30 days. Pro and Enterprise accounts enjoy extended 1-year archival.</p>
                    </section>
                    <section>
                      <h4 className="text-slate-900 font-bold mb-2 flex items-center gap-2 font-jakarta"><CreditCard size={14} className="text-emerald-500" /> 4. Subscription</h4>
                      <p>Subscriptions auto-renew. You can cancel anytime from your settings to prevent future billing.</p>
                    </section>
                  </div>
                </div>

                <label className="flex items-start gap-4 cursor-pointer mb-10 group">
                  <div className={`mt-1 w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${agreed ? 'bg-violet-600 border-violet-600 text-white' : 'border-slate-300 group-hover:border-violet-400'}`}>
                    <CheckCircle size={14} className={agreed ? 'opacity-100' : 'opacity-0'} />
                  </div>
                  <input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)} className="hidden" />
                  <span className="text-sm font-semibold text-slate-600 select-none">
                    I confirm that I have read and agree to the <span className="text-violet-600 hover:underline">Terms of Service</span> and <span className="text-violet-600 hover:underline">Privacy Policy</span>.
                  </span>
                </label>

                <button disabled={loading || !agreed} onClick={handleStep4} 
                  className={`w-full py-5 rounded-[2rem] font-black flex justify-center items-center gap-3 transition-all ${agreed ? 'bg-violet-600 text-white shadow-xl shadow-violet-200 active:scale-[0.98]' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                  {loading ? 'Processing...' : 'Accept & Proceed'} <ChevronRight size={20} />
                </button>
              </motion.div>
            )}

            {/* STEP 5: CHECKOUT */}
            {step === 5 && (
              <motion.div key="step5" initial="hidden" animate="visible" exit="exit" variants={variants} transition={{ duration: 0.5 }} 
                className="w-full max-w-lg bg-white/70 backdrop-blur-2xl p-10 md:p-14 rounded-[2.5rem] border border-white shadow-2xl text-center">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: "spring" }}
                  className="w-24 h-24 mx-auto rounded-[2rem] bg-gradient-to-tr from-violet-600 to-cyan-600 flex items-center justify-center mb-8 shadow-2xl shadow-violet-200">
                  <Rocket size={40} className="text-white" />
                </motion.div>
                
                <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight font-jakarta">Ready for takeoff</h1>
                <p className="text-slate-500 font-medium mb-10">Connect your studio to the world's fastest AI delivery system.</p>
                
                <div className="p-8 rounded-[2rem] mb-10 bg-slate-50 border border-slate-100 text-left">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Selected Workspace</span>
                    <span className="px-3 py-1 bg-violet-100 text-[10px] font-black text-violet-700 rounded-full uppercase tracking-wider">{plan}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <h4 className="text-xl font-black text-slate-900 font-jakarta">SnapMoment {plan.charAt(0).toUpperCase() + plan.slice(1)}</h4>
                      <p className="text-sm font-semibold text-slate-500">{isYearly ? 'Annual' : 'Monthly'} Subscription</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black text-slate-900">
                        ₹{plan === 'starter' ? '0' : isYearly ? (plan === 'pro' ? '13,491' : '44,991') : (plan === 'pro' ? '1,499' : '4,999')}
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">Inc. all taxes</p>
                    </div>
                  </div>
                </div>

                <button disabled={loading} onClick={plan === 'starter' ? () => updateAuthStep(6) : handleCheckout} 
                  className="w-full py-5 rounded-[2rem] bg-slate-900 text-white font-black flex justify-center items-center gap-3 shadow-2xl hover:bg-black transition-all active:scale-[0.98]">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      {plan === 'starter' ? 'Activate Free Workspace' : 'Proceed to Stripe Checkout'}
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
                
                <div className="mt-6 flex justify-center items-center gap-6 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                  <div className="flex items-center gap-1.5"><ShieldCheck size={14} /> Secure Payment</div>
                  <div className="flex items-center gap-1.5"><Zap size={14} /> Instant Access</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        
        {/* Footer info */}
        <footer className="mt-12 text-center text-slate-400 font-semibold text-xs tracking-tight py-4">
          <p>© 2026 SnapMoment AI. Powering premium event experiences globally.</p>
        </footer>
      </div>
    </div>
  )
}

function Rocket(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rocket"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4.5c1.62-1.63 5-2.5 5-2.5"/><path d="M12 15v5s3.03-.55 4.5-2c1.63-1.62 2.5-5 2.5-5"/></svg>
  )
}

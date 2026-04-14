import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, CheckCircle, Shield, CreditCard, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { onboardingApi } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'

export default function OnboardingWizard() {
  const navigate = useNavigate()
  const { onboardingStep, setAuth, token, role, userId, fullName, subscriptionActive } = useAuthStore()
  
  // Local state for forms
  const [loading, setLoading] = useState(false)
  const [logoLoading, setLogoLoading] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [step, setStep] = useState(Math.max(2, onboardingStep)) // Step 1 is signup
  
  // Step 2 Form
  const [studioForm, setStudioForm] = useState({
    founded_year: '2024',
    team_size: 'Just Me',
    primary_gear: '',
    portfolio_url: '',
    services: 'Weddings, Portraits',
  })
  
  // Step 3 Form
  const [plan, setPlan] = useState('pro')
  
  // Step 4 Form
  const [agreed, setAgreed] = useState(false)
  
  useEffect(() => {
    if (onboardingStep >= 6) {
      navigate('/photographer/events')
    }
  }, [onboardingStep, navigate])

  const updateAuthStep = (newStep: number) => {
    setAuth(token!, role!, userId!, fullName!, newStep, subscriptionActive)
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

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => setLogoPreview(reader.result as string)
    reader.readAsDataURL(file)

    // Upload
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
      const res = await onboardingApi.step3({ plan })
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

  // STRIPE INTEGRATION
  const handleCheckout = async () => {
    setLoading(true)
    try {
      const orderRes = await onboardingApi.createOrder()
      
      // If mock environment, handle mock success redirect
      if (orderRes.data.url && orderRes.data.url.includes('mock_success=true')) {
        window.location.href = orderRes.data.url
        return
      }

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

  // Handle Stripe Success Callback
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
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  }

  return (
    <div className="min-h-screen border-t-4" style={{ background: 'var(--background)', borderTopColor: '#FF6E6C' }}>
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#FF6E6C,#67568C)' }}>
              <Camera size={16} color="white" />
            </div>
            <span style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 20, fontWeight: 600, color: 'var(--foreground)' }}>SnapMoment</span>
          </div>
          <div className="flex gap-2">
            {[2, 3, 4, 5].map((s) => (
              <div key={s} className={`h-2 rounded-full transition-all duration-500`} style={{ width: 40, background: s <= step ? '#FF6E6C' : 'var(--border)' }} />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 2: STUDIO SETUP */}
          {step === 2 && (
            <motion.div key="step2" initial="hidden" animate="visible" exit="exit" variants={variants} transition={{ duration: 0.3 }} className="max-w-lg mx-auto">
              <h1 className="text-3xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Tell us about your studio</h1>
              <p className="text-text-muted mb-8">This helps us customize your gallery experience.</p>
              
              {/* Logo Upload Section */}
              <div className="mb-10 flex flex-col items-center">
                <div className="relative group cursor-pointer">
                  <div className={`w-32 h-32 rounded-full border-2 border-dashed border-border overflow-hidden flex items-center justify-center transition-all ${logoLoading ? 'opacity-50' : 'group-hover:border-primary group-hover:shadow-lg'}`} style={{ background: 'var(--card)' }}>
                    {logoPreview ? (
                      <img src={logoPreview} alt="Studio Logo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center text-text-subtle gap-1">
                        <Camera size={24} />
                        <span className="text-[10px] uppercase font-black tracking-widest">Logo</span>
                      </div>
                    )}
                    
                    {logoLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-xs font-black uppercase text-white tracking-widest">Update</span>
                    </div>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleLogoChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {logoPreview && !logoLoading && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg border-4 border-background">
                      <CheckCircle size={14} />
                    </div>
                  )}
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted mt-4">Official Studio Branding</p>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-text-main block mb-1.5">Founded Year</label>
                    <input type="number" value={studioForm.founded_year} onChange={e => setStudioForm({...studioForm, founded_year: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-border outline-none focus:border-primary" style={{ background: 'var(--card)' }} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-main block mb-1.5">Team Size</label>
                    <select value={studioForm.team_size} onChange={e => setStudioForm({...studioForm, team_size: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-border outline-none focus:border-primary" style={{ background: 'var(--card)' }}>
                      <option>Just Me</option>
                      <option>2-5 members</option>
                      <option>5+ members</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-main block mb-1.5">Services (comma separated)</label>
                  <input type="text" value={studioForm.services} onChange={e => setStudioForm({...studioForm, services: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-border outline-none focus:border-primary" style={{ background: 'var(--card)' }} />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-main block mb-1.5">Primary Gear (e.g. Sony A7IV)</label>
                  <input type="text" value={studioForm.primary_gear} onChange={e => setStudioForm({...studioForm, primary_gear: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-border outline-none focus:border-primary" style={{ background: 'var(--card)' }} />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-main block mb-1.5">Portfolio URL</label>
                  <input type="url" placeholder="https://" value={studioForm.portfolio_url} onChange={e => setStudioForm({...studioForm, portfolio_url: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-border outline-none focus:border-primary" style={{ background: 'var(--card)' }} />
                </div>
              </div>
              <button disabled={loading} onClick={handleStep2} className="mt-8 w-full py-4 rounded-xl text-white font-semibold flex justify-center items-center gap-2 hover:opacity-90" style={{ background: '#FF6E6C' }}>
                 {loading ? 'Saving...' : 'Continue'} <ChevronRight size={18} />
              </button>
            </motion.div>
          )}

          {/* STEP 3: PLAN */}
          {step === 3 && (
            <motion.div key="step3" initial="hidden" animate="visible" exit="exit" variants={variants} transition={{ duration: 0.3 }} className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Choose your power</h1>
              <p className="text-text-muted mb-10">Select the plan that scales with your events.</p>
              
              <div className="grid md:grid-cols-3 gap-6 text-left">
                {[
                  { id: 'fresher', name: 'Fresher', price: '₹499', perks: ['5 events total', '200 photos/event', 'Dynamic QR + OTP', 'Studio Branding'] },
                  { id: 'pro', name: 'Pro', price: '₹1,499', perks: ['50 events total', '2000 photos/event', 'No Watermark', 'Fast AI'] },
                  { id: 'studio', name: 'Studio', price: '₹4,999', perks: ['Unlimited photos', 'Custom branding', 'Priority AI'] }
                ].map(p => (
                  <div key={p.id} onClick={() => setPlan(p.id)} className={`relative p-6 rounded-2xl cursor-pointer transition-all border-2 ${plan === p.id ? 'border-[#FF6E6C] shadow-coral-sm' : 'border-border hover:border-text-muted'}`} style={{ background: 'var(--card)' }}>
                    {plan === p.id && <div className="absolute top-4 right-4 text-[#FF6E6C]"><CheckCircle size={20} /></div>}
                    <h3 className="font-semibold text-lg" style={{ color: 'var(--foreground)' }}>{p.name}</h3>
                    <div className="text-2xl font-bold mt-2 mb-4" style={{ color: 'var(--foreground)' }}>{p.price}<span className="text-sm font-normal text-text-muted">/mo</span></div>
                    <ul className="space-y-3 text-sm text-text-muted">
                      {p.perks.map((perk, i) => <li key={i} className="flex gap-2 items-center"><Shield size={14} className="text-primary" /> {perk}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
              <button disabled={loading} onClick={handleStep3} className="mt-10 max-w-sm w-full py-4 rounded-xl text-white font-semibold flex mx-auto justify-center items-center gap-2 hover:opacity-90" style={{ background: '#FF6E6C' }}>
                 {loading ? 'Processing...' : 'Select Plan & Continue'} <ChevronRight size={18} />
              </button>
            </motion.div>
          )}

          {/* STEP 4: TERMS */}
          {step === 4 && (
            <motion.div key="step4" initial="hidden" animate="visible" exit="exit" variants={variants} transition={{ duration: 0.3 }} className="max-w-lg mx-auto">
              <h1 className="text-3xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>The Agreement</h1>
              <p className="text-text-muted mb-8">Please review the rules of the platform.</p>
              
              <div className="p-6 rounded-2xl h-64 overflow-y-auto mb-6 text-sm text-text-muted space-y-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <p><strong>1. Acceptable Use</strong><br/>You agree not to upload illicit, copyrighted, or sensitive material without consent.</p>
                <p><strong>2. Face Recognition Consent</strong><br/>You must collect prior consent from guests before capturing and indexing their biometric facial geometry.</p>
                <p><strong>3. Data Retention</strong><br/>Fresher accounts have files automatically purged after 30 days. Pro/Studio retains them for 1 year.</p>
                <p><strong>4. Payments</strong><br/>Subscriptions auto-renew until cancelled. No partial refunds are permitted.</p>
              </div>

              <label className="flex items-center gap-3 cursor-pointer mb-8">
                <input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)} className="w-5 h-5 rounded border-border" />
                <span className="text-sm" style={{ color: 'var(--foreground)' }}>I agree to the Terms of Service and Privacy Policy</span>
              </label>

              <button disabled={loading} onClick={handleStep4} className="w-full py-4 rounded-xl text-white font-semibold flex justify-center items-center gap-2 hover:opacity-90" style={{ background: '#FF6E6C', opacity: agreed ? 1 : 0.5 }}>
                 {loading ? 'Accepting...' : 'I Agree'} <ChevronRight size={18} />
              </button>
            </motion.div>
          )}

          {/* STEP 5: CHECKOUT */}
          {step === 5 && (
            <motion.div key="step5" initial="hidden" animate="visible" exit="exit" variants={variants} transition={{ duration: 0.3 }} className="max-w-md mx-auto text-center">
              <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6" style={{ background: 'var(--card)', border: '2px solid var(--border)' }}>
                <CreditCard size={32} color="#FF6E6C" />
              </div>
              <h1 className="text-3xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Ready for take-off</h1>
              <p className="text-text-muted mb-8">Complete a secure payment via Stripe to activate your {plan.toUpperCase()} workspace.</p>
              
               <div className="p-6 rounded-2xl mb-8 flex justify-between items-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <span className="font-medium" style={{ color: 'var(--foreground)' }}>{plan.toUpperCase()} Plan</span>
                  <span className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>₹{plan === 'fresher' ? '499' : plan === 'pro' ? '1,499' : '4,999'}</span>
               </div>
 
              <button disabled={loading} onClick={handleCheckout} className="w-full py-4 rounded-xl text-white font-semibold flex justify-center items-center gap-2 hover:shadow-coral-lg" style={{ background: 'linear-gradient(135deg,#FF6E6C,#67568C)' }}>
                 {loading ? 'Connecting to Gateway...' : 'Pay with Stripe'} <ChevronRight size={18} />
              </button>
              <div className="mt-4 text-xs text-text-subtle flex justify-center items-center gap-1">
                 <Shield size={12} /> Secure encrypted checkout
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

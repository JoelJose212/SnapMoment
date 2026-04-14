import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, ArrowLeft, RotateCcw, Zap, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { guestApiEndpoints } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'

export default function OTPPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { setGuestAuth } = useAuthStore()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [verifying, setVerifying] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [resending, setResending] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const phone = location.state?.phone
  const fullName = location.state?.fullName
  const eventId = location.state?.eventId

  useEffect(() => {
    if (!phone || !eventId) { navigate(`/event/${token}`) }
  }, [phone, eventId, navigate, token])

  useEffect(() => {
    const t = setInterval(() => setCountdown((c) => c > 0 ? c - 1 : 0), 1000)
    return () => clearInterval(t)
  }, [])

  const handleChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1)
    const newOtp = [...otp]
    newOtp[i] = digit
    setOtp(newOtp)
    if (digit && i < 5) inputRefs.current[i + 1]?.focus()
    if (newOtp.every((d) => d !== '')) handleVerify(newOtp.join(''))
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      inputRefs.current[i - 1]?.focus()
    }
  }

  const handleVerify = async (code?: string) => {
    const otpCode = code || otp.join('')
    if (otpCode.length !== 6) { toast.error('Enter all 6 digits'); return }
    setVerifying(true)
    try {
      const res = await guestApiEndpoints.verifyOtp({ phone_number: phone, full_name: fullName, event_id: eventId, otp: otpCode })
      const { access_token, event_id } = res.data
      setGuestAuth(access_token, event_id)
      toast.success('Identity Verified! 🔒')
      navigate(`/event/${token}/selfie`)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Invalid verification code')
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setVerifying(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      await guestApiEndpoints.sendOtp({ phone_number: phone, event_id: eventId })
      toast.success('New Code Transmitted')
      setCountdown(60)
      setOtp(['', '', '', '', '', ''])
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to resend')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-4 py-12 overflow-hidden bg-background">
      {/* Background Aurora */}
      <div className="fixed inset-0 aurora-bg opacity-20 blur-[120px] -z-10 scale-150 -rotate-12" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted mb-6 hover:text-primary transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Entry
        </button>

        <div className="glass shadow-[0_32px_128px_-12px_rgba(0,0,0,0.4)] rounded-[3rem] p-10 border-white/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 aurora-bg" />
          
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 border border-primary/20">
              <ShieldCheck size={32} className="text-primary" />
            </div>
            <h1 className="text-3xl font-black text-foreground" style={{ fontFamily: '"Plus Jakarta Sans"' }}>Verify Identity</h1>
            <p className="text-xs text-muted mt-3 font-medium">
              A 6-digit studio access code was sent to <br />
              <span className="text-foreground font-black tracking-tight">{phone}</span>
            </p>
          </div>

          <div className="flex gap-2.5 justify-center mb-10">
            {otp.map((digit, i) => (
              <motion.input
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                ref={(el) => { inputRefs.current[i] = el }}
                className={`w-12 h-16 text-center text-2xl font-black rounded-2xl bg-white/50 dark:bg-black/20 border-2 transition-all outline-none shadow-sm ${
                   digit ? 'border-primary text-primary shadow-primary/10' : 'border-slate-200 dark:border-white/10 text-foreground focus:border-primary/50 focus:shadow-md'
                }`}
                value={digit}
                maxLength={1}
                inputMode="numeric"
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
              />
            ))}
          </div>

          <button
            onClick={() => handleVerify()}
            disabled={verifying || otp.some((d) => !d)}
            className="w-full py-5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] text-white shadow-xl transition-all aurora-bg hover:shadow-coral active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {verifying ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Validating...
              </>
            ) : (
              <>
                Unlock Gallery <Sparkles size={16} />
              </>
            )}
          </button>

          <div className="text-center mt-8">
            <AnimatePresence mode="wait">
              {countdown > 0 ? (
                <motion.p 
                  key="countdown"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] font-black text-muted uppercase tracking-widest"
                >
                  Resend available in <span className="text-primary">{countdown}s</span>
                </motion.p>
              ) : (
                <motion.button
                  key="resend"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleResend}
                  disabled={resending}
                  className="flex items-center gap-2 mx-auto text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:scale-105 transition-transform"
                >
                  <RotateCcw size={12} /> {resending ? 'Transmitting...' : 'Request New Code'}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-10 flex items-center gap-2 justify-center opacity-30">
          <Zap size={10} className="text-foreground fill-foreground" />
          <p className="text-[9px] font-bold text-muted uppercase tracking-widest">
            End-to-end Encrypted Studio Access
          </p>
        </div>
      </motion.div>
    </div>
  )
}

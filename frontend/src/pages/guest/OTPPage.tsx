import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
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
  const eventId = location.state?.eventId

  useEffect(() => {
    if (!phone || !eventId) { navigate(`/event/${token}`) }
  }, [])

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
      const res = await guestApiEndpoints.verifyOtp({ phone_number: phone, event_id: eventId, otp: otpCode })
      const { access_token, event_id } = res.data
      setGuestAuth(access_token, event_id)
      toast.success('Phone verified! 🎉')
      navigate(`/event/${token}/selfie`)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Invalid OTP')
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
      toast.success('OTP resent!')
      setCountdown(60)
      setOtp(['', '', '', '', '', ''])
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to resend')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: 'linear-gradient(135deg,#1A1A24,#1E1E24)' }}>
      <div className="w-full max-w-sm">
        <div className="rounded-3xl p-8" style={{ background: 'var(--card)', boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }}>
          <div className="text-center mb-7">
            <h1 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 26, color: 'var(--foreground)' }}>Enter OTP</h1>
            <p className="text-sm text-text-muted mt-2">
              Sent to <span className="font-semibold text-text-main">{phone}</span>
            </p>
          </div>

          <div className="flex gap-2.5 justify-center mb-6">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el }}
                className={`otp-input ${digit ? 'filled' : ''}`}
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
            className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 hover:shadow-coral-lg"
            style={{ background: 'linear-gradient(135deg,#FF6E6C,#67568C)' }}
          >
            {verifying ? 'Verifying...' : 'Verify OTP'}
          </button>

          <div className="text-center mt-5">
            {countdown > 0 ? (
              <p className="text-xs text-text-subtle">Resend in <span className="font-semibold text-[#FF6E6C]">{countdown}s</span></p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-xs font-medium text-[#FF6E6C] hover:underline"
              >
                {resending ? 'Resending...' : 'Resend OTP'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

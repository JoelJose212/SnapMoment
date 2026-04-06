import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Camera, MapPin, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { eventsApi } from '../../lib/api'

export default function EventLandingPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [phone, setPhone] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    eventsApi.getPublic(token!).then((res) => {
      setEvent(res.data)
    }).catch(() => {
      toast.error('Event not found')
    }).finally(() => setLoading(false))
  }, [token])

  const handleSendOtp = async () => {
    if (!/^\d{10}$/.test(phone)) { toast.error('Please enter a valid 10-digit phone number'); return }
    setSending(true)
    try {
      const { guestApiEndpoints } = await import('../../lib/api')
      await guestApiEndpoints.sendOtp({ phone_number: phone, event_id: event.id })
      toast.success('OTP sent!')
      navigate(`/event/${token}/otp`, { state: { phone, eventId: event.id } })
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to send OTP')
    } finally {
      setSending(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
      <div className="w-8 h-8 border-2 border-[#FF6E6C] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!event) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
      <div className="text-center">
        <h2 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 28, color: 'var(--foreground)' }}>Event not found</h2>
        <p className="text-text-muted text-sm mt-2">This event may have expired or the QR code is invalid.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: 'linear-gradient(135deg,#1A1A24,#1E1E24)' }}>
      <div className="w-full max-w-sm">
        {/* Cover photo */}
        {event.cover_photo_url ? (
          <img src={event.cover_photo_url} alt={event.name} className="w-full h-48 object-cover rounded-3xl mb-6 photo-print" />
        ) : (
          <div className="w-full h-48 rounded-3xl mb-6 flex items-center justify-center" style={{ background: '#241630', border: '4px solid white' }}>
            <Camera size={40} color="#FF6E6C" />
          </div>
        )}

        <div className="rounded-3xl p-7" style={{ background: 'var(--card)', boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }}>
          <div className="mb-2">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full capitalize" style={{ background: 'var(--background)', color: '#FF6E6C' }}>{event.type}</span>
          </div>
          <h1 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 24, color: 'var(--foreground)', marginTop: 8 }}>{event.name}</h1>
          <div className="flex flex-col gap-1.5 mt-3 mb-5">
            {event.location && (
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <MapPin size={12} /> {event.location}
              </div>
            )}
            {event.event_date && (
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <Calendar size={12} /> {new Date(event.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            )}
          </div>

          {event.photographer_note && (
            <p className="text-xs italic text-text-subtle mb-5 border-l-2 pl-3" style={{ borderColor: '#FF6E6C' }}>
              {event.photographer_note}
            </p>
          )}

          <div>
            <label className="text-sm font-medium text-text-main block mb-1.5">Your Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className="w-full px-4 py-3 rounded-xl border border-border text-sm outline-none focus:border-primary transition-colors"
              placeholder="10-digit mobile number"
              style={{ background: 'var(--background)', fontFamily: '"JetBrains Mono"', letterSpacing: '0.05em' }}
            />
          </div>

          <button
            onClick={handleSendOtp}
            disabled={sending}
            className="w-full mt-4 py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-coral-lg disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#FF6E6C,#67568C)' }}
          >
            {sending ? 'Sending OTP...' : 'Get My Photos →'}
          </button>

          <p className="text-xs text-center text-text-subtle mt-4">
            You'll receive a 6-digit OTP to verify your number
          </p>
        </div>
      </div>
    </div>
  )
}

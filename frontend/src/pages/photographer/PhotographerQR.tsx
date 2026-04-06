import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { QRCodeSVG } from 'qrcode.react'
import { Copy, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { eventsApi } from '../../lib/api'

export default function PhotographerQR() {
  const { id: eventId } = useParams()
  const { data: event } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventsApi.get(eventId!).then((r) => r.data),
  })

  const eventUrl = event ? `${window.location.origin}/event/${event.qr_token}` : ''

  const copyLink = () => {
    navigator.clipboard.writeText(eventUrl)
    toast.success('Link copied to clipboard!')
  }

  const downloadQR = () => {
    const svg = document.getElementById('event-qr-svg')
    if (!svg) return
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 400
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    const svgData = new XMLSerializer().serializeToString(svg)
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
    img.onload = () => {
      ctx.fillStyle = 'var(--card)'
      ctx.fillRect(0, 0, 400, 400)
      ctx.drawImage(img, 30, 30, 340, 340)
      const link = document.createElement('a')
      link.download = `${event?.name || 'event'}-qr.png`
      link.href = canvas.toDataURL()
      link.click()
      toast.success('QR Code downloaded!')
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 32, color: 'var(--foreground)', marginBottom: 8 }}>QR Code</h1>
      <p className="text-sm text-text-muted mb-8">{event?.name}</p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* QR display card */}
        <div className="rounded-3xl p-8 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          {event && (
            <QRCodeSVG
              id="event-qr-svg"
              value={eventUrl}
              size={200}
              fgColor="#67568C"
              bgColor="var(--card)"
            />
          )}
          <p className="mt-4 text-xl" style={{ fontFamily: 'Caveat', color: 'var(--foreground)' }}>Scan to get your photos</p>
          <div className="flex gap-2 mt-4">
            <button onClick={copyLink} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-coral-50" style={{ background: 'var(--background)', color: '#FF6E6C' }}>
              <Copy size={14} />Copy Link
            </button>
            <button onClick={downloadQR} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-coral" style={{ background: 'linear-gradient(135deg,#FF6E6C,#67568C)' }}>
              <Download size={14} />Download PNG
            </button>
          </div>
        </div>

        {/* Print card preview */}
        <div className="rounded-3xl overflow-hidden shadow-coral-lg" style={{ background: 'var(--background)', border: '4px solid white' }}>
          <div className="p-6 text-center">
            <div className="text-xs font-semibold tracking-widest text-text-subtle mb-4 uppercase">Event Access</div>
            {event && (
              <QRCodeSVG value={eventUrl} size={140} fgColor="#67568C" bgColor="var(--background)" />
            )}
            <p className="mt-3 text-2xl" style={{ fontFamily: 'Caveat', color: '#FF6E6C' }}>Scan to get your photos</p>
            <p className="text-xs text-text-muted mt-2">{event?.name}</p>
            <div className="mt-4 text-xs" style={{ fontFamily: '"JetBrains Mono"', color: '#A394A8', wordBreak: 'break-all' }}>
              {eventUrl}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl p-4" style={{ background: 'var(--background)', border: '1px dashed var(--border)' }}>
        <p className="text-xs text-text-muted">
          <strong>Tip:</strong> Print 4–6 copies and place them at different spots during the event. Guests just scan with their phone camera — no app needed!
        </p>
      </div>
    </div>
  )
}

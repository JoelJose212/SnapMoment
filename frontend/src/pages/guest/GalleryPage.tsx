import { useEffect, useState, useRef } from 'react'
import { Download, Flag, Heart, Share2, Camera } from 'lucide-react'
import toast from 'react-hot-toast'
import { guestApiEndpoints } from '../../lib/api'
import SplashTag from '../../components/shared/SplashTag'

export default function GalleryPage() {
  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hearts, setHearts] = useState<Set<string>>(new Set())
  const confettiRef = useRef(false)

  useEffect(() => {
    guestApiEndpoints.gallery().then((res) => {
      setPhotos(res.data)
      if (!confettiRef.current && res.data.length > 0) {
        confettiRef.current = true
        import('canvas-confetti').then((m) => {
          m.default({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#FF6E6C', '#67568C', '#FFE1D9'] })
        })
      }
    }).catch(() => {
      toast.error('Could not load your gallery')
    }).finally(() => setLoading(false))
  }, [])

  const downloadPhoto = async (url: string, photoId: string) => {
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const { saveAs } = await import('file-saver')
      saveAs(blob, `snapmoment-${photoId}.jpg`)
      toast.success('Photo downloaded! 📸')
    } catch {
      toast.error('Download failed')
    }
  }

  const downloadAll = async () => {
    if (photos.length === 0) return
    try {
      const JSZip = (await import('jszip')).default
      const { saveAs } = await import('file-saver')
      const zip = new JSZip()
      toast.success('Preparing your photos...')
      await Promise.all(photos.map(async (p, i) => {
        const res = await fetch(p.photo_url)
        const blob = await res.blob()
        zip.file(`photo-${i + 1}.jpg`, blob)
      }))
      const content = await zip.generateAsync({ type: 'blob' })
      saveAs(content, 'my-snapmoment-photos.zip')
      toast.success('All photos downloaded!')
    } catch {
      toast.error('Download failed')
    }
  }

  const handleShare = async (url: string) => {
    if (navigator.share) {
      await navigator.share({ title: 'My photo from SnapMoment', url })
    } else {
      navigator.clipboard.writeText(url)
      toast.success('Link copied!')
    }
  }

  const handleReport = async (photoId: string) => {
    try {
      await guestApiEndpoints.report(photoId)
      toast.success('Reported. Thank you!')
    } catch {
      toast.error('Could not report')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-12" style={{ background: 'var(--background)' }}>
        <div className="max-w-sm mx-auto">
          <div className="text-center mb-8">
            <div className="w-8 h-8 border-2 border-[#FF6E6C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-text-muted">Loading your photos...</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton rounded-2xl" style={{ height: 140 }} />)}
          </div>
        </div>
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--background)' }}>
        <div className="text-center max-w-xs">
          <svg viewBox="0 0 120 120" className="mx-auto mb-5" style={{ width: 100, height: 100 }}>
            <circle cx="60" cy="60" r="56" fill="var(--background)" />
            <circle cx="60" cy="60" r="28" fill="none" stroke="var(--border)" strokeWidth="3" />
            <path d="M48 60h24M60 48v24" stroke="#FF6E6C" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
          </svg>
          <h2 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 24, color: 'var(--foreground)' }}>No photos found yet</h2>
          <p className="text-sm text-text-muted mt-2">The photographer may still be processing the photos. Check back soon!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-10" style={{ background: 'var(--background)' }}>
      <div className="max-w-sm mx-auto">
        <div className="text-center mb-6">
          <h1 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 26, color: 'var(--foreground)' }}>Your Photos</h1>
          <p className="text-sm text-text-muted mt-1">
            {photos.length} photo{photos.length !== 1 ? 's' : ''} found just for you!
            <SplashTag text="Just for you ✦" color="amber" rotation={2} className="ml-2" />
          </p>
          <button
            onClick={downloadAll}
            className="mt-4 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-coral"
            style={{ background: 'linear-gradient(135deg,#FF6E6C,#67568C)' }}
          >
            <Download size={14} className="inline mr-1.5" />
            Download All ({photos.length})
          </button>
        </div>

        {/* Masonry grid */}
        <div className="space-y-4">
          {photos.map((photo, i) => (
            <div
              key={photo.match_id}
              className="rounded-3xl overflow-hidden photo-print"
              style={{ transform: `rotate(${i % 2 === 0 ? -1.5 : 1.5}deg)`, boxShadow: '0 4px 20px rgba(28,16,24,0.12)' }}
            >
              <img
                src={photo.photo_url || photo.thumbnail_url}
                alt={`Photo ${i + 1}`}
                className="w-full object-cover"
                style={{ maxHeight: 280 }}
                loading="lazy"
              />
              <div className="p-3 bg-white">
                {/* Confidence badge */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white" style={{ background: photo.confidence_score >= 90 ? '#00C48C' : photo.confidence_score >= 75 ? '#FFB800' : '#FF4B4B' }}>
                    {photo.confidence_score?.toFixed(1)}% match
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => downloadPhoto(photo.photo_url, photo.photo_id)} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold text-white transition-all shadow-coral-sm" style={{ background: '#FF6E6C' }}>
                    <Download size={12} />Download
                  </button>
                  <button onClick={() => setHearts((h) => { const n = new Set(h); n.has(photo.match_id) ? n.delete(photo.match_id) : n.add(photo.match_id); return n })} className="w-9 h-9 flex items-center justify-center rounded-xl transition-all" style={{ background: 'var(--background)' }}>
                    <Heart size={14} fill={hearts.has(photo.match_id) ? '#FF4B4B' : 'none'} color={hearts.has(photo.match_id) ? '#FF4B4B' : 'var(--muted)'} />
                  </button>
                  <button onClick={() => handleShare(photo.photo_url)} className="w-9 h-9 flex items-center justify-center rounded-xl" style={{ background: 'var(--background)' }}>
                    <Share2 size={14} color="#67568C" />
                  </button>
                  <button onClick={() => handleReport(photo.photo_id)} className="w-9 h-9 flex items-center justify-center rounded-xl" style={{ background: 'var(--background)' }}>
                    <Flag size={14} color="#FFB800" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

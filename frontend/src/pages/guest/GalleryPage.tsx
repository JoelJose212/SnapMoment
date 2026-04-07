import { useEffect, useState, useRef } from 'react'
import { Download, Flag, Heart, Share2, Camera, Sparkles, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { guestApiEndpoints } from '../../lib/api'
import SplashTag from '../../components/shared/SplashTag'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'

export default function GalleryPage() {
  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hearts, setHearts] = useState<Set<string>>(new Set())
  const [downloadingAll, setDownloadingAll] = useState(false)
  const confettiRef = useRef(false)

  useEffect(() => {
    guestApiEndpoints.gallery().then((res) => {
      setPhotos(res.data)
      if (!confettiRef.current && res.data.length > 0) {
        confettiRef.current = true
        import('canvas-confetti').then((m) => {
          m.default({ 
            particleCount: 150, 
            spread: 80, 
            origin: { y: 0.6 }, 
            colors: ['#FF6E6C', '#67568C', '#FFE1D9', '#FFB800'],
            ticks: 200
          })
        })
      }
    }).catch(() => {
      toast.error('Could not load your gallery')
    }).finally(() => setLoading(false))
  }, [])

  const downloadPhoto = async (url: string, photoId: string) => {
    const toastId = toast.loading('Starting download...')
    try {
      const response = await fetch(url, { mode: 'cors' })
      if (!response.ok) throw new Error('Network response was not ok')
      const blob = await response.blob()
      saveAs(blob, `snapmoment-photo-${photoId.slice(0, 8)}.jpg`)
      toast.success('Photo downloaded! 📸', { id: toastId })
    } catch (err) {
      console.error('Download error:', err)
      // Fallback: Open in new tab if blob fetch fails
      window.open(url, '_blank')
      toast.success('Opening in new tab...', { id: toastId })
    }
  }

  const downloadAll = async () => {
    if (photos.length === 0 || downloadingAll) return
    setDownloadingAll(true)
    const toastId = toast.loading('Packing your memories into a ZIP...')
    
    try {
      const zip = new JSZip()
      const folder = zip.folder("my-snapmoment-photos")
      
      await Promise.all(photos.map(async (p, i) => {
        try {
          const res = await fetch(p.photo_url, { mode: 'cors' })
          const blob = await res.blob()
          folder?.file(`snapmoment-${i + 1}.jpg`, blob)
        } catch (e) {
          console.warn(`Failed to add photo ${i} to zip`, e)
        }
      }))
      
      const content = await zip.generateAsync({ type: 'blob' })
      saveAs(content, 'my-snapmoment-photos.zip')
      toast.success('All photos downloaded! ✨', { id: toastId })
    } catch (err) {
      toast.error('Could not create ZIP. Try individual downloads.', { id: toastId })
    } finally {
      setDownloadingAll(false)
    }
  }

  const handleShare = async (url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My photo from SnapMoment', url })
      } catch (err) {
        // user cancelled or failed
      }
    } else {
      navigator.clipboard.writeText(url)
      toast.success('Link copied!')
    }
  }

  const handleReport = async (photoId: string) => {
    if (!confirm('Are you sure you want to report this photo?')) return
    try {
      await guestApiEndpoints.report(photoId)
      toast.success('Reported. We will review it shortly.')
      setPhotos(prev => prev.filter(p => p.photo_id !== photoId))
    } catch {
      toast.error('Could not report')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] px-6 py-20 flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-[#FF6E6C] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-medium animate-pulse">Scanning the event for you...</p>
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm"
        >
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Camera size={40} className="text-gray-300" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'var(--font-jakarta)' }}>No photos yet</h2>
          <p className="text-gray-500">The AI is still scanning or the photographer is processing. Hang tight!</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] px-6 py-12 md:py-20">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 md:mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-coral/10 text-coral px-4 py-1.5 rounded-full text-sm font-bold mb-6"
          >
            <Sparkles size={16} />
            Found Your Moments
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-4 tracking-tight" style={{ fontFamily: 'var(--font-jakarta)' }}>
            Captured for You
          </h1>
          
          <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto mb-8">
            We've found <span className="text-coral font-bold">{photos.length}</span> special photos where you made an appearance.
          </p>

          <button
            onClick={downloadAll}
            disabled={downloadingAll}
            className="relative group bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-coral via-[#67568C] to-coral opacity-0 group-hover:opacity-20 transition-opacity" />
            <Download size={20} className={`inline mr-2 ${downloadingAll ? 'animate-bounce' : ''}`} />
            {downloadingAll ? 'Creating ZIP...' : `Download All (${photos.length})`}
          </button>
        </header>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          <AnimatePresence>
            {photos.map((photo, i) => (
              <motion.div
                key={photo.match_id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.1)] transition-all duration-500 border border-gray-100"
              >
                {/* Photo Header/Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-white/50">
                    <div className={`w-2 h-2 rounded-full ${photo.confidence_score >= 90 ? 'bg-green-500' : 'bg-amber-500'}`} />
                    <span className="text-[10px] font-bold text-gray-800 uppercase tracking-wider">
                      {photo.confidence_score?.toFixed(0)}% Match
                    </span>
                  </div>
                </div>

                {/* Image Container */}
                <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
                  <img
                    src={photo.photo_url || photo.thumbnail_url}
                    alt={`Moment ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                    <button 
                      onClick={() => downloadPhoto(photo.photo_url, photo.photo_id)}
                      className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-900 transform translate-y-10 group-hover:translate-y-0 transition-transform duration-300 hover:bg-coral hover:text-white"
                    >
                      <Download size={20} />
                    </button>
                    <button 
                      onClick={() => handleShare(photo.photo_url)}
                      className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-900 transform translate-y-10 group-hover:translate-y-0 transition-transform duration-300 delay-75 hover:bg-coral hover:text-white"
                    >
                      <Share2 size={20} />
                    </button>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-5 flex items-center justify-between bg-white border-t border-gray-50">
                  <div className="flex gap-1">
                    <button 
                      onClick={() => setHearts((h) => { const n = new Set(h); n.has(photo.match_id) ? n.delete(photo.match_id) : n.add(photo.match_id); return n })}
                      className="p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <Heart 
                        size={18} 
                        className={`transition-colors ${hearts.has(photo.match_id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                      />
                    </button>
                    <button 
                      onClick={() => handleReport(photo.photo_id)}
                      className="p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <Flag size={18} className="text-gray-300 hover:text-amber-500 transition-colors" />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => downloadPhoto(photo.photo_url, photo.photo_id)}
                    className="flex items-center gap-2 text-coral font-bold text-sm hover:underline"
                  >
                    Get Photo <Download size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <footer className="mt-20 py-10 border-t border-gray-100 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 SnapMoment AI. All rights reserved. Built with ❤️ for your memories.
          </p>
        </footer>
      </div>
    </div>
  )
}

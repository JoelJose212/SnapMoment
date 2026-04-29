import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Download, Share2, Zap, Heart, Info, ChevronRight, 
  Sparkles, Camera, ShieldAlert, X, ChevronLeft 
} from 'lucide-react'
import confetti from 'canvas-confetti'
import toast from 'react-hot-toast'
import { guestApiEndpoints, guestApi, api } from '../../lib/api'
import { useNavigate, useParams } from 'react-router-dom'

export default function GalleryPage() {
  const navigate = useNavigate()
  const { token } = useParams<{ token: string }>()
  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hearts, setHearts] = useState<Set<string>>(new Set())
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null)
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void } | null>(null)
  const confettiRef = useRef(false)

  useEffect(() => {
    fetchGallery()
  }, [])

  const fetchGallery = async () => {
    try {
      const res = await guestApiEndpoints.gallery()
      setPhotos(res.data)
      if (res.data.length > 0 && !confettiRef.current) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#14B8A6', '#A78BFA', '#10B981', '#3B82F6']
        })
        confettiRef.current = true
      }
    } catch (err: any) {
      toast.error('Failed to load your moments')
    } finally {
      setLoading(false)
    }
  }

  const downloadPhoto = async (photoId: string, format: string = 'original', showToast: boolean = true) => {
    const toastId = showToast ? toast.loading(`Preparing your High-Res moment...`) : undefined
    try {
      const response = await guestApi.get(`/api/guest/gallery/${photoId}/download`, {
        params: { format },
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `SnapMoment_${photoId}.jpg`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      
      if (showToast) toast.success('Downloaded with Studio Mark! 📸', { id: toastId })
      logInteraction(photoId, 'DOWNLOAD')
    } catch (err) {
      if (showToast) toast.error('Download failed.', { id: toastId })
      throw err
    }
  }

  const handleNativeBulkDownload = () => {
    if (photos.length === 0) return
    setConfirmModal({
      isOpen: true,
      title: 'Save Directly to Phone',
      message: `Save ${photos.length} photos to your camera roll? (Your browser may ask you to 'Allow multiple downloads')`,
      onConfirm: async () => {
        setConfirmModal(null)
        const toastId = toast.loading('Saving photos directly to device...')
        try {
          for (const photo of photos) {
            await downloadPhoto(photo.photo_id, 'original', false)
            await new Promise(resolve => setTimeout(resolve, 500)) // delay to avoid browser block
          }
          toast.success('All photos saved to device!', { id: toastId })
        } catch (err) {
          toast.error('Some downloads failed. Please try again or use ZIP.', { id: toastId })
        }
      }
    })
  }

  const handleShare = async (url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out my photo from SnapMoment!',
          url: url
        })
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
    }
  }

  const handleReport = async (photoId: string) => {
    try {
      await guestApiEndpoints.report(photoId)
      setPhotos(prev => prev.filter(p => p.photo_id !== photoId))
      setSelectedPhotoIndex(null)
      toast.success('Photo reported and hidden')
    } catch (err) {
      toast.error('Failed to report')
    }
  }

  const requestReport = (photoId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hide Photo',
      message: 'Remove this photo from your personal gallery?',
      onConfirm: () => {
        setConfirmModal(null)
        handleReport(photoId)
      }
    })
  }

  const requestCameraAccess = () => {
    if (!token) return
    setConfirmModal({
      isOpen: true,
      title: 'Scan New Face?',
      message: 'Do you want to leave this gallery and take a new selfie to find different photos?',
      onConfirm: () => {
        setConfirmModal(null)
        navigate(`/event/${token}/selfie`)
      }
    })
  }

  const handleDownloadAll = async () => {
    if (photos.length === 0) return
    const toastId = toast.loading('Preparing your memories...')
    try {
      const response = await guestApiEndpoints.downloadAll()
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `SnapMoment_Gallery.zip`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      toast.success('Gallery downloaded as ZIP! 📦', { id: toastId })
    } catch (err) {
      toast.error('Bulk download failed.', { id: toastId })
    }
  }

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (selectedPhotoIndex === null) return
    const newIndex = direction === 'next' 
      ? (selectedPhotoIndex + 1) % photos.length
      : (selectedPhotoIndex - 1 + photos.length) % photos.length
    setSelectedPhotoIndex(newIndex)
  }

  const logInteraction = async (photoId: string, action: string) => {
    try {
      const eventId = photos[0]?.event_id || photos.find(p => p.photo_id === photoId)?.event_id
      if (eventId) {
        await api.post('/api/analytics/log', null, {
          params: { event_id: eventId, action_type: action, photo_id: photoId }
        })
      }
    } catch (err) {}
  }

  const verifiedPhotos = photos.filter(p => !p.is_suggested)
  const suggestedPhotos = photos.filter(p => p.is_suggested)

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted font-bold animate-pulse uppercase tracking-widest text-xs">Curating your memories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-6 py-12 md:py-24 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-20">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-primary/15 border border-primary/20">
                <Sparkles className="text-primary" size={20} />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">
                {localStorage.getItem('snapmoment_role') === 'guest_vip' ? 'Master Gallery Access' : 'Your Private Gallery'}
              </span>
            </div>
            
            {token && (
              <button
                onClick={requestCameraAccess}
                className="flex items-center gap-3 px-6 py-3 rounded-[1.25rem] bg-white/5 border border-white/10 text-sm font-black uppercase tracking-widest text-foreground hover:bg-white/10 hover:border-white/20 shadow-xl shadow-black/10 active:scale-95 transition-all"
              >
                <Camera size={18} className="text-primary" /> Open Camera
              </button>
            )}
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter text-foreground mb-6"
            style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
          >
            Captured Moments.
          </motion.h1>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-muted text-xl max-w-2xl font-medium leading-relaxed">
                We've found {photos.length} frames where you shine. Download them in high-res with studio branding.
              </motion.p>
              
              <div className="flex flex-col gap-3 w-full md:w-auto">
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
                  onClick={handleDownloadAll}
                  className="flex items-center gap-3 px-10 py-5 rounded-[2rem] text-sm font-black uppercase tracking-widest text-white aurora-bg shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all w-full md:w-auto justify-center"
                >
                  <Download size={20} className="animate-bounce" /> Download All as ZIP
                </motion.button>
                
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
                  onClick={handleNativeBulkDownload}
                  className="flex items-center gap-3 px-6 py-4 rounded-[2rem] text-xs font-black uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20 active:scale-95 transition-all w-full md:w-auto justify-center"
                >
                  <Download size={16} /> Save Directly To Phone (No ZIP)
                </motion.button>
              </div>
            </div>
        </header>

        {/* Verified Matches */}
        <section className="mb-32">
          <div className="flex items-center justify-between mb-12 px-2">
            <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
              {localStorage.getItem('snapmoment_role') === 'guest_vip' ? 'Full Event Story' : 'Perfect Matches'} <ChevronRight className="text-primary" />
            </h2>
            <div className="flex items-center gap-2 text-xs font-bold text-muted bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <Camera size={14} className="text-primary" /> {verifiedPhotos.length} High Confidence
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {photos.map((photo, i) => (
              !photo.is_suggested && (
                <PhotoCard 
                  key={photo.photo_id} 
                  photo={photo} 
                  i={i} 
                  onClick={() => setSelectedPhotoIndex(i)}
                  downloadPhoto={downloadPhoto} 
                  handleShare={handleShare} 
                  handleReport={requestReport}
                  logInteraction={logInteraction}
                />
              )
            ))}
          </div>
        </section>


      </div>

      {/* Mobile Floating Download Button */}
      {photos.length > 0 && (
        <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center px-6 md:hidden pointer-events-none">
          <button
            onClick={handleDownloadAll}
            className="pointer-events-auto flex items-center gap-3 px-8 py-4 rounded-full text-sm font-black uppercase tracking-widest text-white aurora-bg shadow-2xl shadow-primary/30 w-full max-w-xs justify-center active:scale-95 transition-all"
          >
            <Download size={20} className="animate-bounce" /> Download All
          </button>
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPhotoIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-10"
          >
            <button 
              onClick={() => setSelectedPhotoIndex(null)}
              className="absolute top-6 right-6 z-[110] p-4 text-white hover:bg-white/10 rounded-full transition-all"
            >
              <X size={32} />
            </button>

            <button 
              onClick={() => navigateLightbox('prev')}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-4 text-white hover:bg-white/10 rounded-full transition-all md:flex hidden"
            >
              <ChevronLeft size={48} />
            </button>

            <button 
              onClick={() => navigateLightbox('next')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-4 text-white hover:bg-white/10 rounded-full transition-all md:flex hidden"
            >
              <ChevronRight size={48} />
            </button>

            <div className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center gap-8">
              <motion.div
                key={photos[selectedPhotoIndex].photo_id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative max-h-[80vh] w-full flex justify-center"
              >
                <img 
                  src={photos[selectedPhotoIndex].photo_url} 
                  alt="" 
                  className="max-w-full max-h-[80vh] object-contain rounded-3xl shadow-2xl border border-white/10"
                />
                
                {/* Confidence Badge inside Lightbox */}
                <div className="absolute top-6 left-6 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest backdrop-blur-xl border bg-black/40 text-white border-white/20">
                  {photos[selectedPhotoIndex].is_suggested ? '⭐ Similar Match' : '✅ Perfect Match'}
                </div>
              </motion.div>

              <div className="flex items-center gap-4 w-full max-w-md">
                <button 
                  onClick={() => downloadPhoto(photos[selectedPhotoIndex].photo_id, 'original')}
                  className="flex-1 aurora-bg text-white h-16 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl"
                >
                  <Download size={20} /> Download High-Res
                </button>
                <button 
                  onClick={() => handleShare(photos[selectedPhotoIndex].photo_url)}
                  className="h-16 w-16 bg-white/10 hover:bg-white text-white hover:text-black rounded-2xl flex items-center justify-center transition-all backdrop-blur-md"
                >
                  <Share2 size={24} />
                </button>
                <button 
                  onClick={() => requestReport(photos[selectedPhotoIndex].photo_id)}
                  className="h-16 w-16 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl flex items-center justify-center transition-all"
                >
                  <ShieldAlert size={24} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Confirm Modal */}
      <AnimatePresence>
        {confirmModal && confirmModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-background border border-white/10 p-8 rounded-[2.5rem] max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 blur-[50px] -translate-y-1/2 translate-x-1/2" />
              
              <h3 className="text-3xl font-black text-foreground mb-4 relative z-10">{confirmModal.title}</h3>
              <p className="text-muted text-lg mb-8 relative z-10 font-medium">{confirmModal.message}</p>
              
              <div className="flex gap-4 relative z-10">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="flex-1 py-4 rounded-2xl font-bold bg-white/5 hover:bg-white/10 text-foreground transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  className="flex-1 py-4 rounded-2xl font-black aurora-bg text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function PhotoCard({ photo, i, onClick, downloadPhoto, handleShare, handleReport, logInteraction, isSuggested = false }: any) {
  const [heart, setHeart] = useState(false)
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: i * 0.08 }}
      className={`group relative glass rounded-[2.8rem] overflow-hidden shadow-2xl border-white/30 hover:shadow-primary/10 transition-all duration-500 ${isSuggested ? 'grayscale-[0.5] hover:grayscale-0' : ''}`}
    >
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-xl border ${isSuggested ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' : 'bg-primary/20 text-primary border-primary/30'}`}>
          {isSuggested ? 'Suggested' : 'Verified'}
        </div>
      </div>

      <div 
        className="relative aspect-[4/5] overflow-hidden bg-white/10 cursor-zoom-in"
        onClick={onClick}
      >
        <img
          src={photo.photo_url}
          alt=""
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          loading="lazy"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

        <div className="absolute inset-x-0 bottom-0 p-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
          <div className="flex flex-col gap-3">
             <div className="w-full bg-white text-foreground p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center">
                Click to Expand View
             </div>
          </div>
        </div>
      </div>

      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <button 
             onClick={() => {
               setHeart(!heart)
               if (!heart) logInteraction(photo.photo_id, 'LIKE')
             }}
             className={`p-3 rounded-xl transition-all ${heart ? 'bg-primary/20 text-primary' : 'bg-white/5 text-muted hover:bg-white/10'}`}
           >
             <Heart size={18} fill={heart ? "currentColor" : "none"} />
           </button>
           <button 
             onClick={() => downloadPhoto(photo.photo_id, 'original')}
             className="p-3 rounded-xl bg-white/5 text-muted hover:bg-primary/20 hover:text-primary transition-all"
             title="Download High-Res"
           >
             <Download size={18} />
           </button>
        </div>
        <button 
          onClick={() => handleReport(photo.photo_id)}
          className="px-4 py-2 rounded-xl text-[10px] font-bold text-muted hover:bg-red-500/10 hover:text-red-500 transition-all flex items-center gap-2"
        >
          <ShieldAlert size={14} /> Report
        </button>
      </div>
    </motion.div>
  )
}

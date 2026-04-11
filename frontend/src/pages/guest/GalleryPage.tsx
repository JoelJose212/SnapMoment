import { useEffect, useState, useRef } from 'react'
import { Download, Flag, Heart, Share2, Camera, Sparkles, Check, Zap, ArrowDownCircle, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { guestApiEndpoints } from '../../lib/api'
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
      toast.error('Identity access revoked or network error')
    }).finally(() => setLoading(false))
  }, [])

  const verifiedPhotos = photos.filter(p => !p.is_suggested)
  const suggestedPhotos = photos.filter(p => p.is_suggested)

  const downloadPhoto = async (url: string, photoId: string) => {
    const toastId = toast.loading('Extracting frame...')
    try {
      const response = await fetch(url, { mode: 'cors' })
      if (!response.ok) throw new Error('Ingestion error')
      const blob = await response.blob()
      saveAs(blob, `snapmoment-moment-${photoId.slice(0, 8)}.jpg`)
      toast.success('Moment Extracted! 📸', { id: toastId })
    } catch (err) {
      window.open(url, '_blank')
      toast.success('Redirecting to direct link...', { id: toastId })
    }
  }

  const downloadAll = async () => {
    if (photos.length === 0 || downloadingAll) return
    setDownloadingAll(true)
    const toastId = toast.loading('Bundling full moment stream...')
    
    try {
      const zip = new JSZip()
      const folder = zip.folder("my-snapmoment-collection")
      
      await Promise.all(photos.map(async (p, i) => {
        try {
          const res = await fetch(p.photo_url, { mode: 'cors' })
          const blob = await res.blob()
          folder?.file(`${p.is_suggested ? 'suggested' : 'verified'}-moment-${i + 1}.jpg`, blob)
        } catch (e) {
          console.warn(`Failed to package fragment ${i}`, e)
        }
      }))
      
      const content = await zip.generateAsync({ type: 'blob' })
      saveAs(content, 'my-snapmoment-collection.zip')
      toast.success('Full Collection Synced! ✨', { id: toastId })
    } catch (err) {
      toast.error('Sync failed. Try individual extraction.', { id: toastId })
    } finally {
      setDownloadingAll(false)
    }
  }

  const handleShare = async (url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My SnapMoment!',
          text: 'Check out this moment from the event!',
          url: url,
        })
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err)
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(url)
        toast.success('Link copied to clipboard! 📋')
      } catch (err) {
        toast.error('Failed to copy link.')
      }
    }
  }

  const handleReport = async (photoId: string) => {
    const toastId = toast.loading('Filing report...')
    try {
      await guestApiEndpoints.report(photoId)
      toast.success('Moment reported for review. Thank you.', { id: toastId })
    } catch (err) {
      toast.error('Failed to file report. Please try again.', { id: toastId })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background px-6 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="fixed inset-0 aurora-bg opacity-10 blur-[100px] -z-10" />
        <motion.div 
           animate={{ rotate: 360 }}
           transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
           className="w-16 h-16 rounded-3xl border-4 border-primary border-t-transparent shadow-xl mb-6"
        />
        <p className="text-muted font-black tracking-[0.3em] uppercase text-[10px] animate-pulse">Running Biometric Scan Across Event...</p>
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm glass rounded-[3rem] p-12 border-white/20"
        >
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/20">
            <Camera size={40} className="text-primary" />
          </div>
          <h2 className="text-3xl font-black text-foreground">Awaiting Your Debut</h2>
          <p className="text-muted mt-4 font-medium leading-relaxed">Our AI hasn't found your matches yet. Ensure the studio is still active or check back soon.</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-6 py-12 md:py-24 relative overflow-hidden">
      <div className="fixed inset-0 aurora-bg opacity-20 blur-[120px] -z-10 scale-125" />
      
      <div className="max-w-7xl mx-auto">
        <header className="mb-16 md:mb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-primary/20"
          >
            <Sparkles size={14} /> Multi-Tier Engine Active
          </motion.div>
          
          <h1 className="text-5xl md:text-8xl font-black text-foreground mb-6 tracking-tighter" style={{ fontFamily: '"Plus Jakarta Sans"' }}>
            AI <span className="text-primary">Gallery</span>
          </h1>
          
          <p className="text-muted text-lg md:text-2xl font-medium max-w-2xl mx-auto mb-12 leading-tight">
            Identified <span className="text-foreground font-black underline decoration-primary decoration-4 underline-offset-4">{verifiedPhotos.length}</span> Verified and <span className="text-amber-500 font-black">{suggestedPhotos.length}</span> Suggested moments.
          </p>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={downloadAll}
            disabled={downloadingAll}
            className="relative group bg-foreground text-white px-12 py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] transition-all shadow-2xl disabled:opacity-50"
          >
            <div className="absolute inset-0 aurora-bg opacity-0 group-hover:opacity-20 transition-opacity" />
            <ArrowDownCircle size={20} className={`inline mr-3 ${downloadingAll ? 'animate-bounce' : ''}`} />
            {downloadingAll ? 'Packaging ZIP...' : `Export Fully Loaded Stream`}
          </motion.button>
        </header>

        {/* ── Verified Moments Section ─────────────────────────────────── */}
        {verifiedPhotos.length > 0 && (
          <section className="mb-24">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-px flex-1 bg-white/20" />
              <h2 className="text-xs font-black uppercase tracking-[0.5em] text-emerald-500 flex items-center gap-2">
                <Check size={16} /> Verified Moments
              </h2>
              <div className="h-px flex-1 bg-white/20" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
              {verifiedPhotos.map((photo, i) => (
                <PhotoCard key={photo.match_id} photo={photo} i={i} downloadPhoto={downloadPhoto} handleShare={handleShare} handleReport={handleReport} />
              ))}
            </div>
          </section>
        )}

        {/* ── Suggested Moments Section ───────────────────────────────── */}
        {suggestedPhotos.length > 0 && (
          <section>
            <div className="flex flex-col items-center mb-10 text-center">
              <div className="flex items-center gap-4 w-full mb-4">
                <div className="h-px flex-1 bg-white/10" />
                <h2 className="text-xs font-black uppercase tracking-[0.5em] text-amber-500/60 flex items-center gap-2">
                  <Info size={16} /> Suggested Moments
                </h2>
                <div className="h-px flex-1 bg-white/10" />
              </div>
              <p className="text-[10px] text-muted max-w-md font-bold uppercase tracking-widest leading-relaxed">
                Found in lower lighting or distant backgrounds. AI suggests these may be you.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 opacity-70 hover:opacity-100 transition-opacity duration-500">
              {suggestedPhotos.map((photo, i) => (
                <PhotoCard key={photo.match_id} photo={photo} i={i} downloadPhoto={downloadPhoto} handleShare={handleShare} handleReport={handleReport} isSuggested />
              ))}
            </div>
          </section>
        )}

        <footer className="mt-32 py-12 border-t border-white/10 text-center">
          <div className="flex items-center justify-center gap-2 mb-4 opacity-30 grayscale">
             <Camera size={14} />
             <span className="text-[10px] font-black uppercase tracking-[0.3em]">Neural Gallery by SnapMoment</span>
          </div>
          <p className="text-[9px] text-muted font-bold uppercase tracking-[0.5em]">
            Precision Matching • Secure Cloud • Studio Quality
          </p>
        </footer>
      </div>
    </div>
  )
}

function PhotoCard({ photo, i, downloadPhoto, handleShare, handleReport, isSuggested = false }: any) {
  const [heart, setHeart] = useState(false)
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: i * 0.08 }}
      className={`group relative glass rounded-[2.8rem] overflow-hidden shadow-2xl border-white/30 hover:shadow-primary/10 transition-all duration-500 ${isSuggested ? 'grayscale-[0.5] hover:grayscale-0' : ''}`}
    >
      <div className="absolute top-5 left-5 z-20">
        <div className={`glass-card bg-white/70 dark:bg-black/70 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-xl border border-white/40`}>
          <Zap size={14} className={isSuggested ? 'text-amber-500 fill-amber-500' : 'text-emerald-500 fill-emerald-500'} />
          <span className="text-[10px] font-black text-foreground uppercase tracking-widest leading-none">
            {photo.confidence_score?.toFixed(0)}% {isSuggested ? 'Match' : 'Precise'}
          </span>
        </div>
      </div>

      <div className="relative aspect-[4/5] overflow-hidden bg-white/10">
        <img
          src={photo.photo_url || photo.thumbnail_url}
          alt=""
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          loading="lazy"
        />
        
        <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
          <div className="flex gap-3">
            <button 
              onClick={() => downloadPhoto(photo.photo_url, photo.photo_id)}
              className="flex-1 bg-white hover:bg-primary hover:text-white text-foreground p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              <Download size={16} /> Get High-Res
            </button>
            <button 
              onClick={() => handleShare(photo.photo_url)}
              className="w-14 h-14 bg-white/20 hover:bg-white text-white hover:text-foreground rounded-2xl flex items-center justify-center transition-all backdrop-blur-md"
            >
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 flex items-center justify-between">
        <div className="flex gap-2">
          <button 
            onClick={() => setHeart(!heart)}
            className={`p-3 rounded-2xl glass transition-all ${heart ? 'aurora-bg text-white' : 'hover:bg-primary/10 text-muted'}`}
          >
            <Heart size={18} className={heart ? 'fill-white' : ''} />
          </button>
          <button 
            onClick={() => handleReport(photo.photo_id)}
            className="p-3 rounded-2xl glass hover:bg-red-500/10 transition-all text-muted/40 hover:text-red-500"
          >
            <Flag size={18} />
          </button>
        </div>
        
        <div className="flex items-center gap-2 pr-2 text-muted/30">
          <Info size={12} />
          <span className="text-[8px] font-black uppercase tracking-tighter">AI ID: {photo.photo_id.slice(0, 6)}</span>
        </div>
      </div>
    </motion.div>
  )
}

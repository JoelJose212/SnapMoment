import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Share2, Zap, Heart, Info, ChevronRight, Sparkles, Camera, ShieldAlert } from 'lucide-react'
import confetti from 'canvas-confetti'
import toast from 'react-hot-toast'
import { guestApiEndpoints, guestApi, api } from '../../lib/api'

export default function GalleryPage() {
  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hearts, setHearts] = useState<Set<string>>(new Set())
  const [selectedSocialPhoto, setSelectedSocialPhoto] = useState<any>(null)
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
          colors: ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF']
        })
        confettiRef.current = true
      }
    } catch (err: any) {
      toast.error('Failed to load your moments')
    } finally {
      setLoading(false)
    }
  }

  const downloadPhoto = async (photoId: string, format: string = 'original') => {
    const toastId = toast.loading(`Preparing your ${format === 'original' ? 'High-Res' : format} moment...`)
    try {
      const response = await guestApi.get(`/api/guest/gallery/${photoId}/download`, {
        params: { format },
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `SnapMoment_${photoId}_${format}.jpg`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      
      toast.success('Downloaded with Studio Mark! 📸', { id: toastId })
    } catch (err) {
      toast.error('Download failed. Try again.', { id: toastId })
    }
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
      toast.success('Photo reported and hidden')
    } catch (err) {
      toast.error('Failed to report')
    }
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
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-coral/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

      {/* Social Access Kit Modal */}
      <AnimatePresence>
        {selectedSocialPhoto && (
          <SocialKitModal 
            photo={selectedSocialPhoto} 
            onClose={() => setSelectedSocialPhoto(null)} 
            downloadPhoto={downloadPhoto}
            handleShare={handleShare}
          />
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-20">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="p-3 rounded-2xl bg-primary/15 border border-primary/20">
              <Sparkles className="text-primary" size={20} />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Your Private Gallery</span>
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
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted text-xl max-w-2xl font-medium leading-relaxed"
          >
            We've found {photos.length} frames where you shine. Download them in high-res with studio branding.
          </motion.p>
        </header>

        {/* Verified Matches */}
        <section className="mb-32">
          <div className="flex items-center justify-between mb-12 px-2">
            <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
              Perfect Matches <ChevronRight className="text-primary" />
            </h2>
            <div className="flex items-center gap-2 text-xs font-bold text-muted bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <Camera size={14} className="text-primary" /> {verifiedPhotos.length} High Confidence
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {verifiedPhotos.map((photo, i) => (
              <PhotoCard 
                key={photo.match_id} 
                photo={photo} 
                i={i} 
                downloadPhoto={downloadPhoto} 
                handleShare={handleShare} 
                handleReport={handleReport}
                onSocialKit={() => setSelectedSocialPhoto(photo)}
              />
            ))}
          </div>
        </section>

        {/* Suggested Section */}
        {suggestedPhotos.length > 0 && (
          <section className="pb-24">
            <div className="bg-white/5 border border-white/10 rounded-[4rem] p-12 md:p-20 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-20"><Info size={120} /></div>
               <div className="relative z-10">
                 <h2 className="text-4xl font-black text-foreground mb-6">Similar Frames</h2>
                 <p className="text-muted text-lg mb-12 max-w-xl">These matched with lower confidence, but we think they might be you!</p>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                   {suggestedPhotos.map((photo, i) => (
                     <PhotoCard 
                       key={photo.match_id} 
                       photo={photo} 
                       i={i} 
                       downloadPhoto={downloadPhoto} 
                       handleShare={handleShare} 
                       handleReport={handleReport}
                       isSuggested={true}
                       onSocialKit={() => setSelectedSocialPhoto(photo)}
                     />
                   ))}
                 </div>
               </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function SocialKitModal({ photo, onClose, downloadPhoto, handleShare }: any) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
    >
      <div 
        className="absolute inset-0 bg-background/90 backdrop-blur-2xl"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative bg-card border border-white/10 rounded-[3rem] p-8 md:p-12 max-w-4xl w-full shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 aurora-bg" />
        
        <header className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-black text-foreground flex items-center gap-3">
              <Zap className="text-primary fill-primary" /> Social Access Kit
            </h2>
            <p className="text-muted mt-2 font-medium">AI-optimized crops for your favorite platforms</p>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-full glass hover:bg-white/10 flex items-center justify-center transition-all"
          >
            <div className="text-2xl">×</div>
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Post - Square */}
          <div className="space-y-4">
            <div className="aspect-square rounded-3xl overflow-hidden bg-white/5 border border-white/10">
              <img 
                src={photo.crop_1x1_url || photo.photo_url} 
                alt="Square Crop" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-black uppercase tracking-widest opacity-60">1:1 Square (Post)</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => downloadPhoto(photo.photo_id, '1x1')}
                  className="p-3 rounded-2xl glass hover:bg-primary/20 text-primary transition-all"
                >
                  <Download size={18} />
                </button>
                <button 
                  onClick={() => handleShare(photo.crop_1x1_url || photo.photo_url)}
                  className="p-3 rounded-2xl glass hover:bg-white/10 text-foreground transition-all"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Story - 9:16 */}
          <div className="space-y-4">
            <div className="aspect-[9/16] rounded-3xl overflow-hidden bg-white/5 border border-white/10 max-h-[400px]">
              <img 
                src={photo.crop_9x16_url || photo.photo_url} 
                alt="Story Crop" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-black uppercase tracking-widest opacity-60">9:16 Story (Vertical)</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => downloadPhoto(photo.photo_id, '9:16')}
                  className="p-3 rounded-2xl glass hover:bg-primary/20 text-primary transition-all"
                >
                  <Download size={18} />
                </button>
                <button 
                  onClick={() => handleShare(photo.crop_9x16_url || photo.photo_url)}
                  className="p-3 rounded-2xl glass hover:bg-white/10 text-foreground transition-all"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function PhotoCard({ photo, i, downloadPhoto, handleShare, handleReport, isSuggested = false, onSocialKit }: any) {
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

      <div className="relative aspect-[4/5] overflow-hidden bg-white/10">
        <img
          src={photo.photo_url}
          alt=""
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          loading="lazy"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

        <div className="absolute inset-x-0 bottom-0 p-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <button 
                onClick={() => downloadPhoto(photo.photo_id, 'original')}
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
            
            <button 
              onClick={onSocialKit}
              className="w-full bg-primary hover:bg-primary-dark text-white p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20"
            >
              <Zap size={16} className="fill-white" /> Access Social Kit
            </button>
          </div>
        </div>
      </div>

      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <button 
             onClick={() => setHeart(!heart)}
             className={`p-3 rounded-xl transition-all ${heart ? 'bg-coral/20 text-coral' : 'bg-white/5 text-muted hover:bg-white/10'}`}
           >
             <Heart size={18} fill={heart ? "currentColor" : "none"} />
           </button>
        </div>
        <button 
          onClick={() => { if(confirm('Report this incorrect match?')) handleReport(photo.photo_id) }}
          className="px-4 py-2 rounded-xl text-[10px] font-bold text-muted hover:bg-red-500/10 hover:text-red-500 transition-all flex items-center gap-2"
        >
          <ShieldAlert size={14} /> Report
        </button>
      </div>
    </motion.div>
  )
}

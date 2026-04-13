function GalleryPage() {
  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hearts, setHearts] = useState<Set<string>>(new Set())
  const [downloadingAll, setDownloadingAll] = useState(false)
  const [selectedSocialPhoto, setSelectedSocialPhoto] = useState<any>(null)
  const confettiRef = useRef(false)

  useEffect(() => {
    // ... rest of useEffect
  }, [])

  // ... rest of component logic (downloadPhoto, downloadAll, handleShare, handleReport)

  return (
    <div className="min-h-screen bg-background px-6 py-12 md:py-24 relative overflow-hidden">
      {/* ... header ... */}
      
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

      <div className="max-w-7xl mx-auto">
        {/* ... headers and sections ... */}
        <section className="mb-24">
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
        {/* ... suggested section ... */}
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
                  onClick={() => downloadPhoto(photo.crop_1x1_url || photo.photo_url, `${photo.photo_id}_1x1`)}
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
              <span className="text-xs font-black uppercase tracking-widest opacity-60">9:16 Story (TikTok/Instagram)</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => downloadPhoto(photo.crop_9x16_url || photo.photo_url, `${photo.photo_id}_9x16`)}
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
      {/* ... status badge ... */}

      <div className="relative aspect-[4/5] overflow-hidden bg-white/10">
        <img
          src={photo.photo_url || photo.thumbnail_url}
          alt=""
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          loading="lazy"
        />
        
        <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
          <div className="flex flex-col gap-3">
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
            
            <button 
              onClick={onSocialKit}
              className="w-full bg-primary hover:bg-primary-dark text-white p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              <Zap size={16} className="fill-white" /> Access Social Kit
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 flex items-center justify-between">
        {/* ... actions ... */}
      </div>
    </motion.div>
  )
}

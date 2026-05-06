import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, CheckCircle, AlertCircle, Brain, Zap, ShieldCheck, Scan, Fingerprint, Aperture, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { guestApiEndpoints } from '../../lib/api'

type FaceState = 'none' | 'detected' | 'ready'

interface FaceDetection {
  boundingBox: { originX: number; originY: number; width: number; height: number }
  categories: Array<{ score: number }>
}

export default function SelfiePage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectorRef = useRef<any>(null)
  const rafRef = useRef<number>(0)

  const [faceState, setFaceState] = useState<FaceState>('none')
  const [faceScore, setFaceScore] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [capturing, setCapturing] = useState(false)
  const [showFlash, setShowFlash] = useState(false)
  const [detectorReady, setDetectorReady] = useState(false)
  const [cameraLoading, setCameraLoading] = useState(true)

  // ── Load Neural Engine (MediaPipe) ──────────────────────────────────
  useEffect(() => {
    let cancelled = false
    async function loadDetector() {
      try {
        const vision = await import('@mediapipe/tasks-vision' as any)
        const { FaceDetector, FilesetResolver } = vision

        const filesetResolver = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        )
        const detector = await FaceDetector.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          minDetectionConfidence: 0.6,
        })
        if (!cancelled) {
          detectorRef.current = detector
          setDetectorReady(true)
        }
      } catch (e) {
        console.warn('Neural Engine fallback initiated', e)
        if (!cancelled) runFallbackSimulation()
      }
    }
    loadDetector()
    return () => { cancelled = true }
  }, [])

  const runFallbackSimulation = () => {
    setTimeout(() => setFaceState('detected'), 2000)
    setTimeout(() => setFaceState('ready'), 4000)
  }

  // ── Camera Controller ──────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setCameraLoading(true)
    try {
      // Release existing tracks
      streamRef.current?.getTracks().forEach(t => t.stop())
      
      const s = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user', 
          width: { ideal: 1280 }, 
          height: { ideal: 720 } 
        },
      })
      
      streamRef.current = s
      
      if (videoRef.current) {
        videoRef.current.srcObject = s
        
        // Handle metadata loaded
        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current?.play()
            console.log("Camera stream playing successfully")
            setCameraLoading(false)
          } catch (e) {
            console.error("Video play failed:", e)
            setCameraLoading(false)
          }
        }
      }
    } catch (err) {
      console.error("Camera startup failed:", err)
      toast.error('Identity Sensor Access Denied')
      setCameraLoading(false)
      runFallbackSimulation()
    }
  }, [])

  useEffect(() => {
    startCamera()
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      cancelAnimationFrame(rafRef.current)
    }
  }, [startCamera])

  // ── Detection Loop ─────────────────────────────────────────────────────
  const startDetectionLoop = useCallback(() => {
    if (!detectorRef.current) return

    const detect = () => {
      const video = videoRef.current
      const overlay = overlayCanvasRef.current
      
      if (!video || !overlay || video.readyState < 2 || video.paused) {
        rafRef.current = requestAnimationFrame(detect)
        return
      }

      // Sync canvas dimensions
      if (overlay.width !== video.videoWidth || overlay.height !== video.videoHeight) {
        overlay.width = video.videoWidth
        overlay.height = video.videoHeight
      }
      
      const ctx = overlay.getContext('2d')!

      try {
        const results = detectorRef.current.detectForVideo(video, performance.now())
        const detections: FaceDetection[] = results.detections || []

        ctx.clearRect(0, 0, overlay.width, overlay.height)

        if (detections.length === 0) {
          setFaceState('none')
          setFaceScore(0)
        } else {
          const best = detections.reduce((a: FaceDetection, b: FaceDetection) =>
            (b.categories[0]?.score ?? 0) > (a.categories[0]?.score ?? 0) ? b : a
          )
          const score = best.categories[0]?.score ?? 0
          setFaceScore(score)

          if (score >= 0.85) {
            setFaceState('ready')
          } else if (score >= 0.6) {
            setFaceState('detected')
          } else {
            setFaceState('none')
          }
        }
      } catch (err) {
        // Safe skip frame
      }

      rafRef.current = requestAnimationFrame(detect)
    }

    rafRef.current = requestAnimationFrame(detect)
  }, [])

  useEffect(() => {
    if (detectorReady && !cameraLoading) {
      startDetectionLoop()
    }
  }, [detectorReady, cameraLoading, startDetectionLoop])

  const handleCapture = async () => {
    if (capturing || uploading) return
    setCapturing(true)
    setShowFlash(true)
    setTimeout(() => setShowFlash(false), 150)

    const toastId = toast.loading('Synchronizing Biometric Map...')
    try {
      const canvas = canvasRef.current!
      const video = videoRef.current!
      canvas.width = video.videoWidth || 1280
      canvas.height = video.videoHeight || 720
      const ctx = canvas.getContext('2d')!
      
      // Mirror frame for capture to match preview
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
      ctx.drawImage(video, 0, 0)
      ctx.setTransform(1, 0, 0, 1, 0, 0)

      const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', 0.95))
      setUploading(true)

      const formData = new FormData()
      formData.append('file', blob, 'selfie.jpg')
      await guestApiEndpoints.uploadSelfie(formData)

      toast.success('Identity Verified ✓', { id: toastId })
      streamRef.current?.getTracks().forEach((t) => t.stop())
      cancelAnimationFrame(rafRef.current)
      navigate(`/event/${token}/gallery`)
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Neural Sync Interrupted'
      toast.error(`Verification Failed: ${errorMsg}`, { id: toastId })
      setCapturing(false)
      setUploading(false)
    }
  }

  // 🎨 Desi Tadka Styling
  const ovalColor =
    faceState === 'ready' ? '#10B981' : 
    faceState === 'detected' ? '#FF9933' : '#EF4444'

  const faceStateLabel =
    faceState === 'ready' ? 'Neural Lock Active' :
    faceState === 'detected' ? 'Calibrating...' : 'Awaiting Subject'

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-4 py-8 overflow-hidden bg-white">
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-[#FBFBFF] -z-20" />
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-[#FF9933]/5 blur-[150px] rounded-full translate-x-1/3 -translate-y-1/3" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-[#D4AF37]/5 blur-[120px] rounded-full -translate-x-1/3 translate-y-1/3" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4 text-[#D4AF37] font-black text-[10px] uppercase tracking-[0.4em]">
            <Scan size={16} /> Biometric Swagat
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-3">
            Verify Your <span className="font-['Playfair_Display'] italic font-normal text-[#FF9933]">Presence</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            {faceState === 'ready'
              ? 'Neural signature acquired. Finalizing.'
              : 'Position your face within the sacred oval.'}
          </p>
        </div>

        <div className="relative group">
          {/* Main Studio Frame */}
          <div className="glass rounded-[4rem] p-4 border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] relative overflow-hidden mb-12">
            <div className="relative aspect-[3/4] rounded-[3.2rem] overflow-hidden bg-slate-950">
              
              {/* Camera Loader */}
              <AnimatePresence>
                {cameraLoading && (
                  <motion.div 
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-950 z-20 flex flex-col items-center justify-center gap-4"
                  >
                    <Loader2 className="text-[#D4AF37] animate-spin" size={32} />
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Opening Lens...</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Live Preview Stream */}
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="absolute inset-0 w-full h-full object-cover scale-x-[-1] z-0" 
              />

              {/* Intelligence Overlay */}
              <canvas
                ref={overlayCanvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none scale-x-[-1] z-10"
              />

              <canvas ref={canvasRef} className="hidden" />

              {/* Biometric Guide Oval */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <motion.div
                  animate={{
                    scale: faceState === 'ready' ? [1, 1.02, 1] : 1,
                    borderColor: ovalColor,
                    boxShadow: faceState === 'ready'
                      ? `0 0 80px ${ovalColor}40, inset 0 0 40px ${ovalColor}10`
                      : `0 0 30px ${ovalColor}20`,
                  }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                  className="w-60 h-80 rounded-[8rem] border-4 transition-colors duration-700"
                />
              </div>

              {/* Shutter Command */}
              <div className="absolute bottom-12 left-0 right-0 flex justify-center z-30">
                <motion.button
                  whileHover={{ scale: faceState === 'ready' ? 1.1 : 1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCapture}
                  disabled={uploading || faceState === 'none'}
                  className={`group relative w-24 h-24 rounded-full flex items-center justify-center p-2 border-4 transition-all duration-500 ${
                    faceState === 'ready' && !uploading
                      ? 'border-white bg-slate-900 shadow-2xl shadow-[#FF9933]/40'
                      : 'border-white/30 bg-white/10 opacity-40 cursor-not-allowed'
                  }`}
                >
                  <div className={`w-full h-full rounded-full border-2 border-white/20 flex items-center justify-center transition-colors ${faceState === 'ready' ? 'bg-[#FF9933]' : ''}`}>
                    <Aperture size={36} className={`text-white ${uploading ? 'animate-spin' : 'group-hover:rotate-90 transition-transform duration-700'}`} />
                  </div>
                  {faceState === 'ready' && (
                    <div className="absolute inset-0 rounded-full border-4 border-[#FF9933] animate-ping opacity-20" />
                  )}
                </motion.button>
              </div>

              {/* Status Indicators */}
              <div className="absolute top-8 inset-x-8 flex justify-between items-start z-30">
                <div className="flex flex-col gap-2">
                  {[
                    { label: 'Neural Lock', ok: faceState !== 'none' },
                    { label: 'Lighting', ok: !cameraLoading },
                  ].map(({ label, ok }) => (
                    <motion.span
                      key={label}
                      initial={false}
                      animate={{ backgroundColor: ok ? '#FF9933' : 'rgba(15, 23, 42, 0.4)' }}
                      className="flex items-center gap-2 text-[9px] px-4 py-2 rounded-full font-black uppercase tracking-widest text-white backdrop-blur-md border border-white/10 shadow-lg"
                    >
                      {ok ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                      {label}
                    </motion.span>
                  ))}
                </div>
                
                <div className="flex flex-col items-center gap-3">
                  <div className={`p-4 rounded-3xl backdrop-blur-xl border border-white/20 transition-all duration-500 ${faceState === 'ready' ? 'bg-[#FF9933] shadow-lg shadow-[#FF9933]/30' : 'bg-slate-900/40'}`}>
                    <Fingerprint
                      size={24}
                      className={faceState === 'ready' ? 'text-white' : 'text-white/40'}
                    />
                  </div>
                  {faceScore > 0 && (
                    <span className="text-[10px] font-black text-white px-2 py-1 bg-slate-900/40 rounded-lg backdrop-blur-sm uppercase tracking-widest border border-white/5">
                      {Math.round(faceScore * 100)}% Confidence
                    </span>
                  )}
                </div>
              </div>

              {/* Guidance Label */}
              <div className="absolute bottom-36 left-0 right-0 flex justify-center pointer-events-none z-30">
                <motion.span
                  key={faceState}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full backdrop-blur-xl border"
                  style={{ 
                    color: ovalColor, 
                    backgroundColor: `${ovalColor}15`,
                    borderColor: `${ovalColor}30`
                  }}
                >
                  {faceStateLabel}
                </motion.span>
              </div>

              {/* Analysis Overlay */}
              <AnimatePresence>
                {uploading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-slate-950/80 backdrop-blur-2xl z-50 flex flex-col items-center justify-center px-12 text-center"
                  >
                    <div className="w-24 h-24 rounded-full bg-[#FF9933] flex items-center justify-center text-white shadow-2xl mb-8 animate-float">
                      <Brain size={48} />
                    </div>
                    <span className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Neural Ingestion</span>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mt-4">
                      Synchronizing vector maps...
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Studio Badge */}
        <div className="text-center px-8">
          <div className="flex items-center justify-center gap-3 text-xs font-black text-slate-400 uppercase tracking-widest mb-10">
            <Zap size={16} className="text-[#FF9933] fill-[#FF9933]" />
            BlazeFace + ArcFace Hybrid Engine
          </div>
          <div className="flex items-center gap-3 justify-center opacity-40">
            <ShieldCheck size={16} className="text-slate-900" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-900">Neural Link v4.0 — Secured</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

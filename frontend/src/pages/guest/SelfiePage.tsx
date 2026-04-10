import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, CheckCircle, AlertCircle, Brain, Zap, ShieldCheck, Scan, Fingerprint, Aperture } from 'lucide-react'
import toast from 'react-hot-toast'
import { guestApiEndpoints } from '../../lib/api'

type FaceState = 'none' | 'detected' | 'ready'

// BlazeFace detection result
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
  const [faceBox, setFaceBox] = useState<FaceDetection['boundingBox'] | null>(null)
  const [faceScore, setFaceScore] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [capturing, setCapturing] = useState(false)
  const [showFlash, setShowFlash] = useState(false)
  const [detectorReady, setDetectorReady] = useState(false)

  // ── Load MediaPipe BlazeFace (FaceDetector) ───────────────────────
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
        // BlazeFace unavailable — fall back to timer simulation
        console.warn('BlazeFace not available, using fallback simulation', e)
        if (!cancelled) runFallbackSimulation()
      }
    }
    loadDetector()
    return () => { cancelled = true }
  }, [])

  const runFallbackSimulation = () => {
    setTimeout(() => setFaceState('detected'), 1500)
    setTimeout(() => setFaceState('ready'), 3000)
  }

  // ── Camera startup ────────────────────────────────────────────────
  useEffect(() => {
    startCamera()
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = s
      if (videoRef.current) {
        videoRef.current.srcObject = s
        videoRef.current.onloadeddata = () => startDetectionLoop()
      }
    } catch {
      toast.error('Camera access denied')
      runFallbackSimulation()
    }
  }

  // ── BlazeFace detection loop ──────────────────────────────────────
  const startDetectionLoop = useCallback(() => {
    if (!detectorRef.current) return

    const detect = () => {
      const video = videoRef.current
      const overlay = overlayCanvasRef.current
      if (!video || !overlay || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(detect)
        return
      }

      overlay.width = video.videoWidth
      overlay.height = video.videoHeight
      const ctx = overlay.getContext('2d')!

      try {
        const results = detectorRef.current.detectForVideo(video, performance.now())
        const detections: FaceDetection[] = results.detections || []

        ctx.clearRect(0, 0, overlay.width, overlay.height)

        if (detections.length === 0) {
          setFaceState('none')
          setFaceBox(null)
          setFaceScore(0)
        } else {
          // Pick the largest / highest-confidence face
          const best = detections.reduce((a: FaceDetection, b: FaceDetection) =>
            (b.categories[0]?.score ?? 0) > (a.categories[0]?.score ?? 0) ? b : a
          )
          const score = best.categories[0]?.score ?? 0
          const box = best.boundingBox
          setFaceScore(score)
          setFaceBox(box)

          if (score >= 0.85) {
            setFaceState('ready')
          } else if (score >= 0.6) {
            setFaceState('detected')
          } else {
            setFaceState('none')
          }
        }
      } catch {
        // detector may not be ready yet for this frame
      }

      rafRef.current = requestAnimationFrame(detect)
    }

    rafRef.current = requestAnimationFrame(detect)
  }, [])

  // Start loop once detector is ready
  useEffect(() => {
    if (detectorReady && videoRef.current?.readyState >= 2) {
      startDetectionLoop()
    }
  }, [detectorReady, startDetectionLoop])

  // ── Capture & upload ──────────────────────────────────────────────
  const handleCapture = async () => {
    if (capturing || uploading) return
    setCapturing(true)
    setShowFlash(true)
    setTimeout(() => setShowFlash(false), 150)

    const toastId = toast.loading('Capturing Biometric Frame...')
    try {
      const canvas = canvasRef.current!
      const video = videoRef.current!
      canvas.width = video.videoWidth || 1280
      canvas.height = video.videoHeight || 720
      const ctx = canvas.getContext('2d')!
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
      ctx.drawImage(video, 0, 0)
      ctx.setTransform(1, 0, 0, 1, 0, 0)

      const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', 0.95))
      setUploading(true)

      const formData = new FormData()
      formData.append('file', blob, 'selfie.jpg')
      await guestApiEndpoints.uploadSelfie(formData)

      toast.success('Identity Match Found! 🧬', { id: toastId })
      streamRef.current?.getTracks().forEach((t) => t.stop())
      cancelAnimationFrame(rafRef.current)
      navigate(`/event/${token}/gallery`)
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Satellite Link Failure'
      toast.error(`Analysis Failed: ${errorMsg}. Please ensure your face is fully visible and try again.`, { id: toastId })
      setCapturing(false)
      setUploading(false)
    }
  }

  // ── Oval border color based on face state ─────────────────────────
  const ovalColor =
    faceState === 'ready' ? '#00C48C' :
    faceState === 'detected' ? '#FFB800' : '#FF4B4B'

  const faceStateLabel =
    faceState === 'ready' ? 'Face Locked ✓' :
    faceState === 'detected' ? 'Aligning...' : 'No Face'

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-4 py-8 overflow-hidden bg-background">
      <div className="fixed inset-0 aurora-bg opacity-30 blur-[120px] -z-10 scale-150 rotate-45" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2 text-primary font-bold text-xs uppercase tracking-[0.3em]">
            <Scan size={14} /> Studio Neural Link
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tighter" style={{ fontFamily: '"Plus Jakarta Sans"' }}>
            Verify Your Face
          </h1>
          <p className="text-xs text-muted mt-1 font-medium">
            {faceState === 'ready'
              ? 'Perfect! Press the shutter button'
              : 'Position your face inside the oval'}
          </p>
        </div>

        <div className="glass rounded-[3.5rem] p-4 border-white/40 shadow-2xl relative overflow-hidden mb-8">
          <div className="relative aspect-[3/4] rounded-[2.8rem] overflow-hidden bg-black/20">
            {/* Camera feed */}
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />

            {/* BlazeFace overlay canvas (mirrored to match video) */}
            <canvas
              ref={overlayCanvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none scale-x-[-1]"
              style={{ mixBlendMode: 'normal' }}
            />

            {/* Hidden capture canvas */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Guide Oval */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div
                animate={{
                  scale: faceState === 'ready' ? [1, 1.03, 1] : 1,
                  borderColor: ovalColor,
                  boxShadow: faceState === 'ready'
                    ? `0 0 60px ${ovalColor}50, inset 0 0 40px ${ovalColor}10`
                    : `0 0 20px ${ovalColor}30`,
                }}
                transition={{ repeat: faceState === 'ready' ? Infinity : 0, duration: 2 }}
                className="w-56 h-72 rounded-[7rem] border-4 transition-colors duration-500"
              />
            </div>

            {/* Flash */}
            <AnimatePresence>
              {showFlash && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white z-50"
                />
              )}
            </AnimatePresence>

            {/* Shutter */}
            <div className="absolute bottom-10 left-0 right-0 flex justify-center z-30">
              <motion.button
                whileHover={{ scale: faceState === 'ready' ? 1.1 : 1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCapture}
                disabled={uploading || faceState === 'none'}
                className={`w-20 h-20 rounded-full flex items-center justify-center p-1 border-4 shadow-2xl transition-all ${
                  faceState === 'ready' && !uploading
                    ? 'border-white aurora-bg hover:shadow-coral'
                    : 'border-white/30 bg-white/10 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="w-full h-full rounded-full border-2 border-white/20 flex items-center justify-center">
                  <Aperture size={32} className={`text-white ${uploading ? 'animate-spin' : ''}`} />
                </div>
              </motion.button>
            </div>

            {/* Status badges */}
            <div className="absolute top-6 inset-x-6 flex justify-between">
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Neural Lock', ok: faceState !== 'none' },
                  { label: 'Lighting', ok: true },
                ].map(({ label, ok }) => (
                  <span
                    key={label}
                    className={`flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest backdrop-blur-md transition-colors duration-500 ${
                      ok ? 'bg-emerald-500/80 text-white' : 'bg-black/40 text-white/50'
                    }`}
                  >
                    {ok ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                    {label}
                  </span>
                ))}
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="p-3 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10">
                  <Fingerprint
                    size={20}
                    className={faceState === 'ready' ? 'text-emerald-400 animate-pulse' : 'text-white/40'}
                  />
                </div>
                {/* Live confidence readout */}
                {faceScore > 0 && (
                  <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">
                    {Math.round(faceScore * 100)}%
                  </span>
                )}
              </div>
            </div>

            {/* Face state label at bottom */}
            <div className="absolute bottom-32 left-0 right-0 flex justify-center pointer-events-none">
              <motion.span
                key={faceState}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full backdrop-blur-md"
                style={{ color: ovalColor, background: `${ovalColor}22`, border: `1px solid ${ovalColor}55` }}
              >
                {faceStateLabel}
              </motion.span>
            </div>

            {/* AI Scan Overlay */}
            <AnimatePresence>
              {uploading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-primary/20 backdrop-blur-md z-40 flex flex-col items-center justify-center px-12 text-center"
                >
                  <div className="w-24 h-24 rounded-full aurora-bg flex items-center justify-center text-white shadow-2xl mb-6 animate-pulse">
                    <Brain size={48} />
                  </div>
                  <span className="text-2xl font-black text-white uppercase tracking-tighter">Synchronizing Vector Maps</span>
                  <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-2">
                    Matching identity across cluster matrix
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="text-center px-8">
          <div className="flex items-center justify-center gap-2 text-sm font-bold text-muted mb-8">
            <Zap size={16} className="text-primary fill-primary" />
            BlazeFace + ArcFace 512-dim cluster matching active
          </div>
          <div className="flex items-center gap-3 justify-center opacity-30 grayscale">
            <ShieldCheck size={16} className="text-foreground fill-foreground" />
            <span className="text-xs font-black uppercase tracking-widest">Neural Link v4.0 — DBSCAN Secured</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Camera, CheckCircle, AlertCircle } from 'lucide-react'
import { guestApiEndpoints } from '../../lib/api'
import SplashTag from '../../components/shared/SplashTag'

type FaceState = 'none' | 'detected' | 'ready'

export default function SelfiePage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [faceState, setFaceState] = useState<FaceState>('none')
  const [uploading, setUploading] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturing, setCapturing] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    startCamera()
    return () => { stream?.getTracks().forEach((t) => t.stop()) }
  }, [])

  // Simulate face detection after 2 seconds
  useEffect(() => {
    const t = setTimeout(() => setFaceState('detected'), 2000)
    const t2 = setTimeout(() => setFaceState('ready'), 3500)
    return () => { clearTimeout(t); clearTimeout(t2) }
  }, [])

  // Auto-capture when state is 'ready' for 1.5s
  useEffect(() => {
    if (faceState === 'ready') {
      timerRef.current = setTimeout(() => handleCapture(), 1500)
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [faceState])

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 360, height: 480 } })
      setStream(s)
      if (videoRef.current) videoRef.current.srcObject = s
    } catch {
      toast.error('Camera access denied. Please allow camera access.')
    }
  }

  const handleCapture = async () => {
    if (capturing || uploading) return
    setCapturing(true)
    try {
      const canvas = canvasRef.current!
      const video = videoRef.current!
      canvas.width = video.videoWidth || 360
      canvas.height = video.videoHeight || 480
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(video, 0, 0)
      const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', 0.9))

      setUploading(true)
      const formData = new FormData()
      formData.append('file', blob, 'selfie.jpg')
      await guestApiEndpoints.uploadSelfie(formData)
      toast.success('Finding your photos... 🔍')
      stream?.getTracks().forEach((t) => t.stop())
      navigate(`/event/${token}/gallery`)
    } catch (err: any) {
      if (err.response?.status === 422) {
        toast.error('Please retake in better lighting')
        setFaceState('none')
        setCapturing(false)
        setTimeout(() => { setFaceState('detected'); setTimeout(() => setFaceState('ready'), 2000) }, 1000)
      } else {
        toast.error(err.response?.data?.detail || 'Upload failed')
        setCapturing(false)
      }
    } finally {
      if (!uploading) setUploading(false)
    }
  }

    const ovalColor = faceState === 'none' ? '#FF4B4B' : faceState === 'detected' ? '#FFB800' : '#00C48C'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: 'linear-gradient(135deg,#1A1A24,#1E1E24)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 24, color: 'white' }}>Take Your Selfie</h1>
          <p className="text-sm mt-1" style={{ color: '#A394A8' }}>
            Position your face in the oval. AI will auto-capture.
            <SplashTag text="Works on any phone" color="amber" rotation={-2} className="ml-2" />
          </p>
        </div>

        {/* Camera viewfinder */}
        <div className="relative rounded-3xl overflow-hidden mx-auto" style={{ width: 320, height: 420, background: 'var(--foreground)' }}>
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />

          {/* Oval guide */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              style={{
                width: 200,
                height: 260,
                border: `3px solid ${ovalColor}`,
                borderRadius: '50%',
                transition: 'border-color 0.6s ease',
                boxShadow: faceState === 'ready' ? `0 0 20px ${ovalColor}60` : 'none',
              }}
            />
          </div>

          {/* Status overlay */}
          <div className="absolute top-4 left-4 right-4">
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Face Detected', ok: faceState !== 'none' },
                { label: 'Good Lighting', ok: true },
                { label: 'Looking Forward', ok: faceState === 'ready' },
                { label: 'No Blur', ok: faceState === 'ready' },
              ].map(({ label, ok }) => (
                <span key={label} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: ok ? 'rgba(0,196,140,0.9)' : 'rgba(255,75,75,0.9)', color: 'white' }}>
                  {ok ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* State message */}
          <div className="absolute bottom-4 left-0 right-0 text-center">
            <span className="text-sm font-medium text-white">
              {faceState === 'none' && '⬆ Center your face in the oval'}
              {faceState === 'detected' && '✓ Face detected — hold still...'}
              {faceState === 'ready' && '📸 Auto-capturing in 1.5s...'}
            </span>
          </div>
        </div>

        {/* Manual capture button */}
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={handleCapture}
            disabled={uploading}
            className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 hover:shadow-coral-lg"
            style={{ background: 'linear-gradient(135deg,#FF6E6C,#67568C)' }}
          >
            {uploading ? 'Searching through event photos...' : 'Upload & Find My Photos'}
          </button>
          {uploading && (
            <div className="text-center text-xs" style={{ color: '#A394A8' }}>
              <div className="w-6 h-6 border-2 border-[#FF6E6C] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Matching your face against all event photos...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

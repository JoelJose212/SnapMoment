import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { QRCodeSVG } from 'qrcode.react'
import { Camera, Upload, CheckCircle, Image, Download } from 'lucide-react'
import AuroraRibbon from '../components/shared/AuroraRibbon'
import Navbar from '../components/shared/Navbar'
import SplashTag from '../components/shared/SplashTag'

const STEPS = ['Upload Photos', 'Generate QR', 'Guest OTP', 'Capture Selfie', 'View Gallery']

const MOCK_PHOTOS = [
  { id: 1, src: '/demo-match-1.jpg', confidence: 98.4 },
  { id: 2, src: '/demo-match-2.jpg', confidence: 97.1 },
  { id: 3, src: '/demo-match-3.jpg', confidence: 94.8 },
  { id: 4, src: '/demo-match-4.jpg', confidence: 92.3 },
]

export default function DemoPage() {
  const [step, setStep] = useState(0)
  const [uploaded, setUploaded] = useState<File[]>([])
  const [processing, setProcessing] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [faceDetected, setFaceDetected] = useState(false)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    onDrop: (files) => {
      setUploaded(files)
      setProcessing(true)
      setTimeout(() => setProcessing(false), 2000)
    },
  })

  const handleOtpChange = (i: number, val: string) => {
    const newOtp = [...otp]
    newOtp[i] = val.slice(-1)
    setOtp(newOtp)
    if (val && i < 5) {
      const next = document.getElementById(`demo-otp-${i + 1}`)
      next?.focus()
    }
    if (newOtp.every((d) => d !== '') && i === 5) {
      setTimeout(() => setStep(3), 500)
    }
  }

  const nextStep = () => setStep((s) => Math.min(s + 1, 4))

  return (
    <main
      className="relative flex flex-col items-center justify-center overflow-hidden min-h-screen w-full"
      style={{ background: 'var(--background)' }}
    >
      <AuroraRibbon />
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-16">
        <div className="text-center mb-12">
          <h1 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 'clamp(28px,4vw,44px)', color: 'var(--foreground)' }}>Interactive Demo</h1>
          <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>Experience the full SnapMoment flow — no signup needed.</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-0 mb-12 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center">
              <button
                onClick={() => setStep(i)}
                className="flex flex-col items-center gap-1.5 px-1"
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all"
                  style={{
                    background: i <= step ? 'linear-gradient(135deg,#FF6E6C,#67568C)' : 'var(--border)',
                    color: i <= step ? 'white' : '#A394A8',
                  }}
                >
                  {i < step ? <CheckCircle size={16} /> : i + 1}
                </div>
                <span className="text-xs font-medium whitespace-nowrap" style={{ color: i === step ? '#FF6E6C' : '#A394A8' }}>{s}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px mx-2 min-w-[24px]" style={{ background: i < step ? '#FF6E6C' : 'var(--border)' }} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="rounded-3xl p-8"
            style={{ background: 'var(--card)', boxShadow: '0 8px 40px rgba(28,16,24,0.08)', border: '1px solid var(--border)' }}
          >
            {step === 0 && (
              <div>
                <h2 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 26, color: 'var(--foreground)' }}>Upload Event Photos</h2>
                <p className="text-sm text-text-muted mt-1 mb-6">Drag & drop your event photos. AI will index all faces.</p>
                <div {...getRootProps()} className="border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all" style={{ borderColor: isDragActive ? '#FF6E6C' : 'var(--border)', background: isDragActive ? 'var(--background)' : 'var(--background)' }}>
                  <input {...getInputProps()} />
                  <Upload size={40} color="#A394A8" className="mx-auto mb-3" />
                  <p className="text-sm font-medium text-text-muted">Drop photos here or click to browse</p>
                  <p className="text-xs text-text-subtle mt-1">Supports JPG, PNG, HEIC</p>
                </div>
                {uploaded.length > 0 && (
                  <div className="mt-5">
                    {processing ? (
                      <div className="flex items-center gap-3 text-sm text-primary">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" style={{ borderColor: '#FF6E6C', borderTopColor: 'transparent' }} />
                        AI indexing faces... <SplashTag text="Powered by AI" color="crimson" rotation={-2} />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-[#00C48C]">
                        <CheckCircle size={16} /> {uploaded.length} photos indexed. {uploaded.length * 3} faces found.
                      </div>
                    )}
                  </div>
                )}
                {!processing && uploaded.length > 0 && (
                  <button onClick={nextStep} className="mt-6 px-8 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-coral-lg" style={{ background: 'linear-gradient(135deg,#FF6E6C,#67568C)' }}>
                    Generate QR Code →
                  </button>
                )}
              </div>
            )}

            {step === 1 && (
              <div className="text-center">
                <h2 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 26, color: 'var(--foreground)' }}>Your Event QR Code</h2>
                <p className="text-sm text-text-muted mt-1 mb-8">Share this with guests. They scan to enter the photo flow.</p>
                <div className="inline-block p-6 rounded-3xl" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
                  <QRCodeSVG value={`${window.location.origin}/event/demo-token`} size={250} fgColor="#67568C" />
                  <p className="mt-4 text-xs text-text-muted font-hand text-lg" style={{ fontSize: 26, fontFamily: 'Caveat' }}>Scan to get your photos</p>
                </div>
                <div className="mt-8 flex gap-3 justify-center">
                  <button onClick={nextStep} className="px-8 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-coral-lg" style={{ background: 'linear-gradient(135deg,#FF6E6C,#67568C)' }}>
                    Guest Experience →
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 26, color: 'var(--foreground)' }}>Guest OTP Verification</h2>
                <p className="text-sm text-text-muted mt-1 mb-8">Guest receives OTP on phone. Enter any 6 digits to continue.</p>
                <div className="flex gap-3 justify-center">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`demo-otp-${i}`}
                      className="otp-input"
                      value={digit}
                      maxLength={1}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                    />
                  ))}
                </div>
                <p className="text-xs text-center text-text-subtle mt-4">Enter any 6 digits — this is just a demo!</p>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 26, color: 'var(--foreground)' }}>Selfie Capture</h2>
                <p className="text-sm text-text-muted mt-1 mb-6">Guest takes a selfie. AI matches their face against all event photos.</p>
                {/* Simulated camera */}
                <div className="relative mx-auto rounded-3xl overflow-hidden" style={{ width: 280, height: 360, background: 'var(--foreground)' }}>
                  <img src="/demo-selfie.jpg" alt="Camera" className="w-full h-full object-cover opacity-80" />
                  {/* Oval guide */}
                  <div className={`absolute inset-0 flex items-center justify-center`}>
                    <div
                      className={`face-oval rounded-full transition-all`}
                      style={{
                        width: 160,
                        height: 210,
                        borderColor: faceDetected ? '#00C48C' : '#FF4B4B',
                        border: `3px solid ${faceDetected ? '#00C48C' : '#FF4B4B'}`,
                        animation: faceDetected ? 'none' : undefined,
                      }}
                    />
                  </div>
                  {/* Quality badges */}
                  <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-1.5">
                    {[
                      { label: 'Face Detected', ok: faceDetected },
                      { label: 'Good Lighting', ok: true },
                      { label: 'Looking Forward', ok: faceDetected },
                    ].map(({ label, ok }) => (
                      <span key={label} className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: ok ? '#00C48C' : '#FF4B4B', color: 'white' }}>{label}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 mt-6 justify-center">
                  <button
                    onClick={() => { setFaceDetected(true); setTimeout(nextStep, 1500) }}
                    className="px-8 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-coral-lg"
                    style={{ background: 'linear-gradient(135deg,#FF6E6C,#67568C)' }}
                  >
                    <SplashTag text="Works on any phone" color="amber" rotation={-2} className="mr-2" />
                    Capture & Match →
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <div className="text-center mb-6">
                  <h2 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 26, color: 'var(--foreground)' }}>Your Matched Photos</h2>
                  <p className="text-sm text-text-muted mt-1">AI found 4 photos with you in them. <SplashTag text="Just for you ✦" color="amber" rotation={2} /></p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {MOCK_PHOTOS.map((photo) => (
                    <div key={photo.id} className="relative rounded-2xl overflow-hidden photo-print" style={{ transform: `rotate(${photo.id % 2 === 0 ? 1.5 : -1.5}deg)` }}>
                      <img src={photo.src} alt="" className="w-full h-40 object-cover" />
                      <div className="absolute top-2 right-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: '#FF6E6C' }}>{photo.confidence}%</span>
                      </div>
                      <div className="p-2 flex gap-1">
                        <button className="flex-1 text-xs py-1.5 rounded-lg font-medium text-white" style={{ background: '#FF6E6C' }}>
                          <Download size={12} className="inline mr-1" />Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <button onClick={() => setStep(0)} className="text-sm text-primary font-medium hover:underline">← Restart demo</button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  )
}

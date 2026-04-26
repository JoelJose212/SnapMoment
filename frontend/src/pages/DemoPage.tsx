import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { QRCodeSVG } from 'qrcode.react'
import { 
  Camera, Upload, CheckCircle, Image as ImageIcon, 
  Download, Sparkles, QrCode, Smartphone, ArrowRight,
  ShieldCheck, Zap, RefreshCw, SmartphoneIcon, Clock
} from 'lucide-react'
import AuroraRibbon from '../components/shared/AuroraRibbon'
import Navbar from '../components/shared/Navbar'
import SplashTag from '../components/shared/SplashTag'
import WaveDivider from '../components/shared/WaveDivider'

const STEPS = [
  { id: 'upload', label: 'Upload', icon: Upload },
  { id: 'qr', label: 'Generate', icon: QrCode },
  { id: 'otp', label: 'Verify', icon: SmartphoneIcon },
  { id: 'selfie', label: 'Match', icon: Camera },
  { id: 'gallery', label: 'Gallery', icon: ImageIcon },
]

const MOCK_PHOTOS = [
  { id: 1, src: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=400', confidence: 99.4 },
  { id: 2, src: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=400', confidence: 98.1 },
  { id: 3, src: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=400', confidence: 97.8 },
  { id: 4, src: 'https://images.unsplash.com/photo-1514525253361-b83f8a9e27ce?auto=format&fit=crop&q=80&w=400', confidence: 95.3 },
]

export default function DemoPage() {
  const [step, setStep] = useState(0)
  const [uploaded, setUploaded] = useState<File[]>([])
  const [processing, setProcessing] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [scanning, setScanning] = useState(false)
  const [faceMatched, setFaceMatched] = useState(false)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    onDrop: (files) => {
      setUploaded(files)
      setProcessing(true)
      setTimeout(() => {
        setProcessing(false)
        setStep(1)
      }, 2500)
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
      setTimeout(() => setStep(3), 800)
    }
  }

  const nextStep = () => setStep((s) => Math.min(s + 1, STEPS.length - 1))

  const startScanning = () => {
    setScanning(true)
    setTimeout(() => {
      setScanning(false)
      setFaceMatched(true)
      setTimeout(() => setStep(4), 1000)
    }, 3000)
  }

  return (
    <main className="min-h-screen relative selection:bg-primary/30" style={{ background: 'var(--background)' }}>
      <AuroraRibbon />
      <Navbar />

      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[15%] left-[5%] w-[30%] h-[30%] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[15%] right-[5%] w-[30%] h-[30%] bg-accent/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 noise-overlay opacity-20" />
      </div>

      <div className="max-w-4xl mx-auto px-6 py-24 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="hero-badge mb-6 mx-auto"
          >
            <Sparkles size={14} />
            <span>Interactive Experience</span>
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
            See the <span className="gradient-text">Magic</span> in Action
          </h1>
          <p className="text-lg text-text-muted max-w-xl mx-auto">
            Experience the full end-to-end flow of SnapMoment. From the photographer's upload to the guest's instant gallery.
          </p>
        </div>

        {/* Stepper HUD */}
        <div className="grid grid-cols-5 gap-2 mb-12 relative">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            const active = i === step
            const completed = i < step
            return (
              <div key={s.id} className="relative">
                <button
                  onClick={() => setStep(i)} // Allow free navigation in demo
                  className={`w-full group flex flex-col items-center gap-3 transition-all cursor-pointer`}
                >
                  <div 
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                      active ? 'bg-primary text-white scale-110 shadow-primary rotate-0' : 
                      completed ? 'bg-emerald-500 text-white shadow-emerald rotate-0' : 
                      'bg-white border border-border text-text-muted rotate-3 group-hover:rotate-0'
                    }`}
                  >
                    {completed ? <CheckCircle size={24} /> : <Icon size={24} />}
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-widest ${active ? 'text-primary' : 'text-text-muted'}`}>
                    {s.label}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`absolute top-7 left-1/2 w-full h-[2px] -z-10 ${completed ? 'bg-emerald-500' : 'bg-border opacity-30'}`} />
                )}
              </div>
            )
          })}
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="glass-card card-shine p-12 md:p-16 rounded-[3rem] relative overflow-hidden"
          >
            {/* Step 0: Upload */}
            {step === 0 && (
              <div className="text-center">
                <div className="max-w-md mx-auto">
                  <h2 className="text-3xl font-bold mb-4">Photographer Experience</h2>
                  <p className="text-text-muted mb-10">Imagine you just finished a shoot. Drag and drop your "event photos" here to let the AI do its work.</p>
                  
                  <div 
                    {...getRootProps()} 
                    className={`group border-2 border-dashed rounded-[2.5rem] p-16 transition-all duration-500 cursor-pointer ${
                      isDragActive ? 'border-primary bg-primary/5 scale-102' : 'border-border bg-slate-50/50 hover:border-primary/50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div className="w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <Upload size={32} className="text-primary" />
                    </div>
                    <p className="font-bold text-lg mb-2">Drop photos here</p>
                    <p className="text-sm text-text-subtle">or click to browse from your device</p>
                  </div>

                  {!processing ? (
                    <button 
                      onClick={nextStep}
                      className="mt-10 flex items-center gap-2 mx-auto text-primary font-bold hover:gap-3 transition-all"
                    >
                      Skip to QR Generation <ArrowRight size={20} />
                    </button>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-8 flex flex-col items-center"
                    >
                      <div className="w-64 h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                        <motion.div 
                          initial={{ x: "-100%" }}
                          animate={{ x: "0%" }}
                          transition={{ duration: 2.5, ease: "easeInOut" }}
                          className="w-full h-full bg-primary-gradient"
                        />
                      </div>
                      <div className="flex items-center gap-2 text-sm font-bold text-primary animate-pulse">
                        <Zap size={16} />
                        AI Indexing Faces...
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {/* Step 1: QR Generate */}
            {step === 1 && (
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 text-center md:text-left">
                  <div className="hero-badge mb-6">
                    <QrCode size={14} />
                    <span>Instant Entry</span>
                  </div>
                  <h2 className="text-3xl font-bold mb-4">Share with Guests</h2>
                  <p className="text-text-muted mb-8 text-lg">Every event gets a unique QR code. Guests just scan to find themselves. No apps, no passwords.</p>
                  
                  <div className="space-y-4">
                    {[
                      { icon: ShieldCheck, text: "Privacy-First Matching" },
                      { icon: Clock, text: "Sub-30s Delivery" },
                      { icon: Smartphone, text: "Browser-Based Experience" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 font-bold">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                          <item.icon size={20} />
                        </div>
                        {item.text}
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={nextStep}
                    className="mt-12 px-10 py-5 rounded-2xl bg-primary text-white font-bold text-xl shadow-primary hover:shadow-primary-lg hover:scale-105 transition-all flex items-center gap-3 mx-auto md:mx-0"
                  >
                    Enter as Guest <ArrowRight size={24} />
                  </button>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative bg-white p-10 rounded-[3rem] shadow-2xl border border-border rotate-2 group-hover:rotate-0 transition-transform duration-500">
                    <QRCodeSVG value="https://snapmoment.ai/demo" size={240} />
                    <div className="mt-8 text-center">
                      <p className="font-hand text-3xl text-primary leading-none">Scan Me!</p>
                      <p className="text-[10px] text-text-subtle font-bold uppercase tracking-widest mt-2">Demo Event ID: SNAP-882</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: OTP Verify */}
            {step === 2 && (
              <div className="text-center max-w-lg mx-auto">
                <div className="w-20 h-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-8">
                  <SmartphoneIcon size={40} />
                </div>
                <h2 className="text-3xl font-bold mb-4">Guest Verification</h2>
                <p className="text-text-muted mb-12">We use OTP to ensure guests only see their own photos. Enter any 6 digits to simulate a verification.</p>
                
                <div className="flex gap-4 justify-center">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`demo-otp-${i}`}
                      className="otp-input w-12 h-16 md:w-16 md:h-20 text-2xl"
                      value={digit}
                      maxLength={1}
                      autoFocus={i === 0}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                    />
                  ))}
                </div>
                
                <div className="mt-12 flex items-center justify-center gap-2 text-sm text-text-subtle">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  Verified Secured Connection
                </div>
              </div>
            )}

            {/* Step 3: Selfie Match */}
            {step === 3 && (
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">The Magic Moment</h2>
                <p className="text-text-muted mb-12">Now, the guest takes a selfie. Our AI will compare it against the event photos instantly.</p>
                
                <div className="relative mx-auto w-72 h-96 rounded-[3rem] overflow-hidden border-8 border-gray-900 shadow-2xl bg-black group">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400" alt="Camera" className="w-full h-full object-cover opacity-80" />
                  
                  {/* Face HUD */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`relative w-48 h-64 border-2 rounded-full transition-all duration-700 ${faceMatched ? 'border-emerald-500 scale-105' : 'border-primary/50'}`}>
                      {!faceMatched && (
                        <motion.div 
                          animate={{ top: ["0%", "100%", "0%"] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="absolute left-0 right-0 h-[2px] bg-primary shadow-[0_0_15px_rgba(20,184,166,0.8)] z-10"
                        />
                      )}
                      <div className="absolute -inset-4 border-2 border-primary/10 rounded-full animate-spin-slow" />
                    </div>
                  </div>

                  {scanning && (
                    <div className="absolute inset-0 bg-primary/20 flex flex-col items-center justify-center backdrop-blur-sm">
                      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4" />
                      <div className="text-white font-bold tracking-widest uppercase text-xs">Matching Faces...</div>
                    </div>
                  )}

                  {faceMatched && (
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute inset-0 bg-emerald-500/80 flex flex-col items-center justify-center backdrop-blur-sm"
                    >
                      <CheckCircle size={80} className="text-white mb-4" />
                      <div className="text-white font-bold text-2xl">Match Found!</div>
                    </motion.div>
                  )}
                </div>

                {!scanning && !faceMatched && (
                  <button 
                    onClick={startScanning}
                    className="mt-12 px-10 py-5 rounded-2xl bg-primary text-white font-bold text-xl shadow-primary hover:shadow-primary-lg hover:scale-105 transition-all flex items-center gap-3 mx-auto"
                  >
                    Take Demo Selfie <Camera size={24} />
                  </button>
                )}
              </div>
            )}

            {/* Step 4: Gallery */}
            {step === 4 && (
              <div>
                <div className="text-center mb-12">
                  <div className="hero-badge mb-4 mx-auto">
                    <ImageIcon size={14} />
                    <span>Your Personal Gallery</span>
                  </div>
                  <h2 className="text-4xl font-bold mb-2">Success!</h2>
                  <p className="text-text-muted">AI matched 4 photos for you. They are ready to download.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {MOCK_PHOTOS.map((photo, i) => (
                    <motion.div 
                      key={photo.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="relative rounded-3xl overflow-hidden group shadow-lg"
                      style={{ transform: `rotate(${i % 2 === 0 ? 2 : -2}deg)` }}
                    >
                      <img src={photo.src} alt="" className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-primary px-2 py-1 rounded-full">
                            {photo.confidence}% Match
                          </span>
                          <button className="w-8 h-8 rounded-full bg-white text-primary flex items-center justify-center hover:scale-110 transition-transform">
                            <Download size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-20 text-center border-t border-border pt-12">
                  <h3 className="text-2xl font-bold mb-6">Impressed with the experience?</h3>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button onClick={() => setStep(0)} className="flex items-center gap-2 text-text-muted font-bold hover:text-primary transition-colors">
                      <RefreshCw size={20} /> Restart Demo
                    </button>
                    <div className="w-px h-6 bg-border hidden sm:block" />
                    <button className="px-8 py-4 rounded-2xl bg-primary text-white font-bold hover:shadow-primary-lg hover:scale-105 transition-all">
                      Register as Photographer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <WaveDivider fill="var(--background)" fromColor="var(--foreground)" />
      
      <div className="py-20 text-center text-text-subtle text-sm">
        SnapMoment Demo Experience · Version 2.0 · Powered by Advanced AI
      </div>
    </main>
  )
}

import { useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { QRCodeSVG } from 'qrcode.react'
import { Link } from 'react-router-dom'
import { 
  Camera, Upload, CheckCircle, Image as ImageIcon, 
  Download, Sparkles, QrCode, Smartphone, ArrowRight,
  ShieldCheck, Zap, RefreshCw, SmartphoneIcon, Clock, Brain, Scan, Fingerprint
} from 'lucide-react'
import AuroraRibbon from '../components/shared/AuroraRibbon'
import Navbar from '../components/shared/Navbar'
import Footer from '../components/shared/Footer'
import SplashTag from '../components/shared/SplashTag'
import WaveDivider from '../components/shared/WaveDivider'

const STEPS = [
  { id: 'upload', label: 'Upload', icon: Upload },
  { id: 'qr', label: 'QR Code', icon: QrCode },
  { id: 'otp', label: 'Verify', icon: SmartphoneIcon },
  { id: 'selfie', label: 'Face Match', icon: Camera },
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

  const { scrollY } = useScroll()
  const blob1Y = useTransform(scrollY, [0, 800], [0, -60])
  const blob2Y = useTransform(scrollY, [0, 800], [0, -40])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    onDrop: (files) => {
      setUploaded(files)
      setProcessing(true)
      setTimeout(() => { setProcessing(false); setStep(1) }, 2500)
    },
  })

  const handleOtpChange = (i: number, val: string) => {
    const newOtp = [...otp]
    newOtp[i] = val.slice(-1)
    setOtp(newOtp)
    if (val && i < 5) document.getElementById(`demo-otp-${i + 1}`)?.focus()
    if (newOtp.every(d => d !== '') && i === 5) setTimeout(() => setStep(3), 800)
  }

  const nextStep = () => setStep(s => Math.min(s + 1, STEPS.length - 1))

  const startScanning = () => {
    setScanning(true)
    setTimeout(() => {
      setScanning(false)
      setFaceMatched(true)
      setTimeout(() => setStep(4), 1000)
    }, 3000)
  }

  return (
    <main className="min-h-screen relative bg-white text-slate-900 overflow-x-hidden selection:bg-violet-100">
      <AuroraRibbon />
      <Navbar />

      {/* Animated background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div style={{ y: blob1Y }} className="absolute top-[5%] right-[5%] w-[500px] h-[500px] bg-violet-100 blur-[120px] rounded-full opacity-50" />
        <motion.div style={{ y: blob2Y }} className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] bg-cyan-100 blur-[100px] rounded-full opacity-40" />
        {/* Floating particles */}
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 60, x: `${15 + Math.random() * 70}%` }}
            animate={{ opacity: [0, 0.4, 0], y: -120 }}
            transition={{ duration: 5 + Math.random() * 3, repeat: Infinity, delay: i * 1.5, ease: 'easeOut' }}
            className="absolute w-1.5 h-1.5 rounded-full bg-violet-300"
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-6 py-28 relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16,1,0.3,1] }} className="text-center mb-16">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-violet-50 border border-violet-200 mb-6">
            <Sparkles size={14} className="text-violet-500" />
            <span className="text-xs font-semibold text-violet-700 tracking-wide uppercase">Interactive Demo</span>
            <SplashTag text="TRY IT" color="purple" rotation={-3} fontSize={10} />
          </div>
          <h1 className="text-4xl md:text-[3.5rem] font-black text-slate-900 mb-5 tracking-tight leading-tight">
            See the <span className="gradient-text">Magic</span> in Action
          </h1>
          <p className="text-lg text-slate-500 max-w-lg mx-auto leading-relaxed">
            Walk through the complete SnapMoment experience — from photo upload to personalized gallery delivery.
          </p>
        </motion.div>

        {/* Stepper */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="flex justify-between items-center gap-4 mb-16 relative px-4">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            const active = i === step
            const completed = i < step
            return (
              <div key={s.id} className="relative flex-1">
                <button onClick={() => setStep(i)} className="w-full group flex flex-col items-center gap-3 transition-all">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                    active ? 'bg-gradient-to-br from-violet-600 to-cyan-600 text-white shadow-lg shadow-violet-200 scale-110' :
                    completed ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' :
                    'bg-slate-50 border border-slate-100 text-slate-300 hover:border-violet-200'
                  }`}>
                    {completed ? <CheckCircle size={20} /> : <Icon size={20} />}
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${active ? 'text-violet-600' : 'text-slate-300'}`}>
                    {s.label}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`absolute top-6 left-1/2 w-full h-px -z-10 ${completed ? 'bg-emerald-400' : 'bg-slate-100'}`} />
                )}
              </div>
            )
          })}
        </motion.div>

        {/* Interactive Console */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="bg-white p-10 md:p-14 rounded-[3rem] shadow-[0_30px_80px_-20px_rgba(109,40,217,0.1)] border border-slate-100 relative overflow-hidden"
          >
            {/* Animated shine sweep on card */}
            <motion.div animate={{ x: ['-200%', '300%'] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 4 }}
              className="absolute inset-y-0 w-1/4 bg-gradient-to-r from-transparent via-violet-50/40 to-transparent pointer-events-none skew-x-[-15deg] z-0" />
            {/* Step 0: Upload */}
            {step === 0 && (
              <div className="text-center max-w-md mx-auto relative z-10">
                <div className="inline-flex items-center gap-2 text-violet-500 font-semibold text-xs uppercase tracking-widest mb-4">
                  <Upload size={14} /> Photo Upload
                  <SplashTag text="STEP 1" color="purple" rotation={-3} fontSize={9} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Upload Event Photos</h2>
                <p className="text-slate-400 text-sm mb-10 leading-relaxed">Drag your photos here to start the AI-powered face recognition demo.</p>
                
                <motion.div animate={{ boxShadow: ['0 0 0 0 rgba(139,92,246,0)', '0 0 40px 8px rgba(139,92,246,0.08)', '0 0 0 0 rgba(139,92,246,0)'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                <div 
                  {...getRootProps()} 
                  className={`group border-2 border-dashed rounded-3xl p-12 transition-all duration-500 cursor-pointer ${
                    isDragActive ? 'border-violet-400 bg-violet-50' : 'border-slate-100 bg-slate-50/50 hover:border-violet-200'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-lg flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300 border border-slate-100">
                    <Upload size={22} className="text-violet-500" />
                  </div>
                  <p className="font-bold text-slate-700 text-sm mb-1">Drop photos here</p>
                  <p className="text-xs text-slate-400">or click to browse</p>
                </div>
                </motion.div>

                {!processing ? (
                  <button onClick={nextStep} className="mt-10 flex items-center gap-2 mx-auto text-violet-500 font-semibold text-sm hover:gap-3 transition-all">
                    Skip to next step <ArrowRight size={16} />
                  </button>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-10 flex flex-col items-center">
                    <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                      <motion.div initial={{ x: "-100%" }} animate={{ x: "0%" }} transition={{ duration: 2.5, ease: "easeInOut" }}
                        className="w-full h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full" />
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-violet-500 animate-pulse">
                      <Brain size={14} /> Processing with AI...
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Step 1: QR Code */}
            {step === 1 && (
              <div className="flex flex-col md:flex-row items-center gap-14">
                <div className="flex-1 text-center md:text-left relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 border border-violet-200 text-xs font-semibold text-violet-700 mb-5">
                    <QrCode size={12} /> QR Code Generated
                    <SplashTag text="STEP 2" color="teal" rotation={2} fontSize={9} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Share with Guests</h2>
                  <p className="text-slate-400 text-sm mb-8 leading-relaxed">Guests scan this QR code at the event. No app download needed — it works in any browser.</p>
                  
                  <div className="space-y-3">
                    {[
                      { icon: ShieldCheck, text: "End-to-end encrypted" },
                      { icon: Clock, text: "Instant access" },
                      { icon: Smartphone, text: "Works on any device" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                        <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-500 flex items-center justify-center">
                          <item.icon size={15} />
                        </div>
                        {item.text}
                      </div>
                    ))}
                  </div>

                  <button onClick={nextStep}
                    className="mt-10 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold text-sm shadow-lg shadow-violet-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 mx-auto md:mx-0">
                    Continue <ArrowRight size={16} />
                  </button>
                </div>

                <motion.div animate={{ rotate: [2, 0, 2] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="relative group">
                  <div className="absolute -inset-8 bg-violet-100 blur-[50px] rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-700" />
                  <div className="relative bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                    <QRCodeSVG value="https://snapmoment.ai/demo" size={180} />
                    <div className="mt-5 text-center">
                      <p className="text-lg font-black gradient-text">Scan Me!</p>
                      <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest mt-1">Event: SM-882-DEMO</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <div className="text-center max-w-lg mx-auto relative z-10">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                <div className="w-14 h-14 rounded-2xl bg-violet-50 text-violet-500 flex items-center justify-center mx-auto mb-6">
                  <Fingerprint size={28} />
                </div>
                </motion.div>
                <div className="inline-flex items-center gap-2 mb-3">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Guest Verification</h2>
                  <SplashTag text="STEP 3" color="amber" rotation={3} fontSize={9} />
                </div>
                <p className="text-slate-400 text-sm mb-10 leading-relaxed">Secure your entry with a one-time password. Enter any 6 digits to continue the demo.</p>
                
                <div className="flex gap-3 justify-center">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`demo-otp-${i}`}
                      className="w-12 h-16 rounded-2xl bg-slate-50 border border-slate-100 text-center text-xl font-black text-slate-800 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                      value={digit}
                      maxLength={1}
                      autoFocus={i === 0}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                    />
                  ))}
                </div>
                
                <div className="mt-10 flex items-center justify-center gap-2 text-xs font-semibold text-emerald-500">
                  <ShieldCheck size={15} /> Verified & Secured
                </div>
              </div>
            )}

            {/* Step 3: Face Scan */}
            {step === 3 && (
              <div className="text-center relative z-10">
                <div className="inline-flex items-center gap-2 mb-3">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">AI Face Recognition</h2>
                  <SplashTag text="STEP 4" color="purple" rotation={-2} fontSize={9} />
                </div>
                <p className="text-slate-400 text-sm mb-10 leading-relaxed">Our AI maps your face to find your photos across all event images.</p>
                
                <div className="relative mx-auto w-56 h-72 rounded-[2.5rem] overflow-hidden border-[10px] border-slate-900 shadow-2xl bg-slate-950 group">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400" alt="" className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700" />
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`relative w-36 h-48 border-2 rounded-[5rem] transition-all duration-700 ${faceMatched ? 'border-emerald-400 scale-105' : 'border-violet-400/40'}`}>
                      {!faceMatched && (
                        <motion.div animate={{ top: ["0%", "100%", "0%"] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute left-0 right-0 h-[2px] bg-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.8)] z-10" />
                      )}
                    </div>
                  </div>

                  {scanning && (
                    <div className="absolute inset-0 bg-violet-900/30 flex flex-col items-center justify-center backdrop-blur-sm">
                      <div className="w-8 h-8 border-3 border-violet-400 border-t-transparent rounded-full animate-spin mb-3" />
                      <div className="text-white text-[9px] font-bold uppercase tracking-widest">Scanning...</div>
                    </div>
                  )}

                  {faceMatched && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-emerald-500/90 flex flex-col items-center justify-center backdrop-blur-sm">
                      <CheckCircle size={48} className="text-white mb-3" />
                      <div className="text-white font-black text-lg tracking-tight">Match Found!</div>
                    </motion.div>
                  )}
                </div>

                {!scanning && !faceMatched && (
                  <button onClick={startScanning}
                    className="mt-10 px-8 py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 mx-auto">
                    Start Face Scan <Scan size={16} />
                  </button>
                )}
              </div>
            )}

            {/* Step 4: Gallery */}
            {step === 4 && (
              <div>
                <div className="text-center mb-12">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 mb-4">
                    <ImageIcon size={12} /> Gallery Ready
                    <SplashTag text="✨ WOW" color="emerald" rotation={3} fontSize={9} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Your Personal Gallery</h2>
                  <p className="text-slate-400 text-sm">AI found 4 photos of you — delivered in under 2 seconds.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {MOCK_PHOTOS.map((photo, i) => (
                    <motion.div key={photo.id} initial={{ opacity: 0, y: 15, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: i * 0.12, duration: 0.5 }}
                      className="relative rounded-2xl overflow-hidden group shadow-md border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                      <img src={photo.src} alt="" className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-bold text-white uppercase tracking-widest bg-violet-600 px-2 py-1 rounded-full">
                            {photo.confidence}%
                          </span>
                          <button className="w-7 h-7 rounded-full bg-white text-slate-900 flex items-center justify-center hover:scale-110 transition-transform shadow">
                            <Download size={12} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-14 text-center border-t border-slate-100 pt-10">
                  <h3 className="text-xl font-black text-slate-900 mb-6 tracking-tight">Ready to try it for real?</h3>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button onClick={() => { setStep(0); setFaceMatched(false); setScanning(false); setOtp(['','','','','','']); setUploaded([]) }}
                      className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-violet-600 transition-colors">
                      <RefreshCw size={15} /> Restart Demo
                    </button>
                    <div className="w-px h-5 bg-slate-200 hidden sm:block" />
                    <Link to="/signup" className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold text-sm shadow-lg shadow-violet-200 hover:scale-[1.03] active:scale-95 transition-all">
                      Get Started Free
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <Footer />
    </main>
  )
}

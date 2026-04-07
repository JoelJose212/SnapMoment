import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { QRCodeSVG } from 'qrcode.react'
import { Copy, Download, Printer, Share2, Sparkles, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { eventsApi } from '../../lib/api'

export default function PhotographerQR() {
  const { id: eventId } = useParams()
  const { data: event } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventsApi.get(eventId!).then((r) => r.data),
  })

  const eventUrl = event ? `${window.location.origin}/event/${event.qr_token}` : ''

  const copyLink = () => {
    navigator.clipboard.writeText(eventUrl)
    toast.success('Link copied to clipboard!')
  }

  const printSign = () => {
    window.print()
  }

  const downloadQR = () => {
    const svg = document.getElementById('event-qr-svg')
    if (!svg) return
    const canvas = document.createElement('canvas')
    canvas.width = 1000
    canvas.height = 1000
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    const svgData = new XMLSerializer().serializeToString(svg)
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
    img.onload = () => {
      // Create a nice background for the downloaded PNG
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, 1000, 1000)
      
      // Draw a subtle border
      ctx.strokeStyle = '#F4F4F6'
      ctx.lineWidth = 40
      ctx.strokeRect(20, 20, 960, 960)

      // Draw QR centered
      ctx.drawImage(img, 150, 150, 700, 700)
      
      // Add text
      ctx.fillStyle = '#FF6E6C'
      ctx.font = 'bold 48px "Plus Jakarta Sans"'
      ctx.textAlign = 'center'
      ctx.fillText('SCAN TO GET YOUR PHOTOS', 500, 900)
      
      ctx.fillStyle = '#6B6B78'
      ctx.font = '24px "Plus Jakarta Sans"'
      ctx.fillText(event?.name || 'SnapMoment Event', 500, 940)

      const link = document.createElement('a')
      link.download = `${event?.name || 'event'}-professional-qr.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      toast.success('High-res QR Code prepared!')
    }
  }

  return (
    <div className="min-h-screen bg-transparent">
      {/* Main UI - Hidden during print */}
      <div className="no-print p-4 md:p-8 lg:p-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div>
              <div className="flex items-center gap-2 text-primary text-sm font-bold uppercase tracking-widest mb-2">
                <Sparkles size={16} />
                Event Access Kit
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
                Guest Entry <span className="text-primary">&</span> Live Gallery
              </h1>
              <p className="mt-4 text-muted max-w-xl text-lg">
                Your guests don't need an app. They just scan, smile, and find their magic moments.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => window.open(eventUrl, '_blank')}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-card border border-border text-foreground hover:bg-background transition-all font-bold"
              >
                <ExternalLink size={18} /> Preview Live
              </button>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-12 items-start">
            {/* Left: Controls */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-5 space-y-6"
            >
              <div className="glass rounded-[32px] p-8 border border-white/20 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <Share2 size={120} className="rotate-12" />
                </div>
                
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">1</span>
                  Digital Distribution
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-background/50 border border-border">
                    <label className="text-xs font-bold text-subtle uppercase tracking-wider mb-2 block">Gallery URL</label>
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-primary truncate flex-1 font-mono">{eventUrl}</code>
                      <button onClick={copyLink} className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors">
                        <Copy size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={downloadQR}
                      className="flex items-center justify-center gap-2 bg-foreground text-white p-4 rounded-2xl font-bold hover:bg-foreground/90 transition-all hover:scale-[1.02]"
                    >
                      <Download size={18} /> High-Res PNG
                    </button>
                    <button 
                      onClick={copyLink}
                      className="flex items-center justify-center gap-2 bg-primary text-white p-4 rounded-2xl font-bold hover:shadow-primary/30 transition-all hover:scale-[1.02] shadow-lg shadow-primary/20"
                    >
                      <Share2 size={18} /> Share Link
                    </button>
                  </div>
                </div>
              </div>

              <div className="glass rounded-[32px] p-8 border border-white/20 shadow-xl">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">2</span>
                  Physical Presentation
                </h3>
                
                <p className="text-muted text-sm mb-6 leading-relaxed">
                  The key to a successful guest gallery is visibility. Print high-quality QR signs and place them at the entrance, bar, and guest tables.
                </p>

                <button 
                  onClick={printSign}
                  className="w-full flex items-center justify-center gap-3 border-2 border-primary text-primary p-4 rounded-2xl font-bold hover:bg-primary/5 transition-all group"
                >
                  <Printer size={20} className="group-hover:rotate-12 transition-transform" /> 
                  Print Professional Sign
                </button>
              </div>
            </motion.div>

            {/* Right: Mockup */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-7 flex justify-center py-12 lg:py-0"
            >
              <div className="relative group">
                {/* Decorative floating elements */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-3xl animate-pulse" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/20 blur-3xl animate-pulse" />
                
                {/* 3D Acrylic Stand Mockup */}
                <div className="acrylic-box bg-white p-2 rounded-[24px] shadow-2xl relative">
                  <div className="bg-[#FAF9F7] rounded-[20px] p-12 text-center w-[380px] border border-gray-100">
                    <div className="text-[10px] font-black tracking-[0.3em] text-gray-400 uppercase mb-8">
                      Exclusive Event Access
                    </div>
                    
                    <div className="relative inline-block p-4 bg-white rounded-3xl shadow-sm border border-gray-50 mb-8">
                      {event && (
                        <QRCodeSVG
                          id="event-qr-svg"
                          value={eventUrl}
                          size={220}
                          fgColor="#1A1A24"
                          bgColor="#FFFFFF"
                          level="H"
                          includeMargin={false}
                        />
                      )}
                      
                      {/* Logo Mark in center of QR */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center border border-gray-50">
                          <img src="/logo-icon.png" className="w-8 h-8 opacity-20" alt="" />
                        </div>
                      </div>
                    </div>

                    <h4 className="text-3xl font-bold italic mb-4" style={{ fontFamily: 'Caveat', color: '#FF6E6C' }}>
                      Scan to see your photos!
                    </h4>
                    
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent w-full my-6" />
                    
                    <div className="space-y-1">
                      <p className="text-lg font-black text-gray-800 uppercase tracking-tight">{event?.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">
                        Powered by SnapMoment AI
                      </p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 shadow-lg text-[10px] font-bold text-muted whitespace-nowrap">
                  ✨ Interactive Acrylic Stand Preview
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Print-Only Template (Hidden except during printing) */}
      <div className="print-only print-center">
        <div className="w-[8.5in] h-[11in] flex flex-col items-center justify-center text-center p-20 bg-white">
          <div className="mb-12">
            <h2 className="text-6xl font-black mb-4 tracking-tighter text-black">SnapMoment</h2>
            <div className="h-2 w-32 bg-[#FF6E6C] mx-auto rounded-full" />
          </div>

          <div className="mb-16 border-[12px] border-black p-12 rounded-[60px]">
            {event && (
              <QRCodeSVG value={eventUrl} size={500} fgColor="#000" bgColor="#FFF" level="H" />
            )}
          </div>

          <p className="text-[80px] leading-tight font-bold italic mb-8 text-black" style={{ fontFamily: 'Caveat' }}>
            Scan to get your photos!
          </p>

          <div className="mt-12 space-y-4">
            <p className="text-4xl font-black uppercase tracking-widest text-black">{event?.name}</p>
            <p className="text-xl text-gray-500 font-bold uppercase tracking-[0.5em]">Live AI Face Matching</p>
          </div>

          <div className="mt-auto pt-20 flex items-center gap-6 opacity-40">
            <div className="h-px bg-gray-400 flex-1" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-black">Printed via snapmoment.ai</span>
            <div className="h-px bg-gray-400 flex-1" />
          </div>
        </div>
      </div>
    </div>
  )
}

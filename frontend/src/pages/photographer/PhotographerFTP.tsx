import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Server, Shield, RefreshCw, Copy, Check, ChevronLeft, 
  Settings, Wifi, Terminal, Camera, Cpu, Globe, Info, 
  ExternalLink, Zap, Lock, Eye, EyeOff
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { eventsApi } from '../../lib/api'
import { QRCodeSVG } from 'qrcode.react'

export default function PhotographerFTP() {
  const { id: eventId } = useParams()
  const qc = useQueryClient()
  const [showPassword, setShowPassword] = useState(false)
  
  const { data: event, isLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventsApi.get(eventId!).then((r) => r.data),
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => eventsApi.update(eventId!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['event', eventId] })
      toast.success('FTP Gateway settings updated!')
    },
    onError: () => toast.error('Failed to update gateway')
  })

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied!`)
  }

  if (isLoading) return <div className="p-20 text-center animate-pulse text-slate-400 font-bold uppercase tracking-widest">Initialising Secure Gateway...</div>

  // Mock public IP for the gateway
  const ftpHost = window.location.hostname === 'localhost' ? '127.0.0.1' : window.location.hostname
  const ftpPort = '2121'

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <Link to="/photographer/events" className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-bold text-sm uppercase tracking-widest">
           <ChevronLeft size={18} /> Back to My Events
        </Link>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Gateway Online
           </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        {/* Left: Configuration */}
        <div className="lg:col-span-7 space-y-8">
           <div>
              <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-4">
                <Globe size={16} /> Neural Ingestion Hub
              </div>
              <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                FTP <span className="text-slate-400">Gateway.</span>
              </h1>
              <p className="text-slate-500 font-medium mt-4 text-lg">Direct camera-to-cloud sync for professional hardware.</p>
           </div>

           {/* Credentials Card */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
             className="bg-white rounded-[3.5rem] p-12 border border-slate-100 shadow-2xl relative overflow-hidden"
           >
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <Server size={120} className="-rotate-12" />
              </div>

              <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Connection Access</h3>
                <button 
                  onClick={() => updateMutation.mutate({ ftp_enabled: !event.ftp_enabled })}
                  className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${event.ftp_enabled ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-100 text-slate-400'}`}
                >
                  {event.ftp_enabled ? 'Gateway Active' : 'Enable Gateway'}
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <CredentialItem label="Host (Server Address)" value={ftpHost} onCopy={() => copyToClipboard(ftpHost, 'Host')} />
                  <CredentialItem label="Port" value={ftpPort} onCopy={() => copyToClipboard(ftpPort, 'Port')} />
                </div>
                <CredentialItem label="Username" value={event.qr_token} onCopy={() => copyToClipboard(event.qr_token, 'Username')} />
                <div className="relative group">
                  <CredentialItem 
                    label="Password" 
                    value={event.ftp_password || '••••••••'} 
                    isPassword 
                    showPassword={showPassword}
                    onCopy={() => copyToClipboard(event.ftp_password, 'Password')} 
                  />
                  <button 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-14 top-[48px] p-2 text-slate-400 hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="mt-10 p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm shrink-0">
                  <Shield size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs text-slate-600 font-bold leading-relaxed">
                    This gateway uses per-event isolated credentials. Only photos uploaded to this endpoint will be ingested into <span className="text-slate-900">{event.name}</span>.
                  </p>
                </div>
              </div>
           </motion.div>

           {/* Security Settings */}
           <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl shadow-slate-900/20">
                <h4 className="text-lg font-black uppercase italic mb-4">Neural Buffer</h4>
                <p className="text-xs text-slate-400 font-medium mb-8 leading-relaxed">Automatically hold RAW files in temporary buffer until JPEG counterparts arrive for speed optimization.</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Enabled</span>
                  <div className="w-12 h-6 rounded-full bg-primary/20 p-1 flex justify-end">
                    <div className="w-4 h-4 bg-primary rounded-full" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl">
                <h4 className="text-lg font-black uppercase italic mb-4 text-slate-900">Auto-Purge</h4>
                <p className="text-xs text-slate-400 font-medium mb-8 leading-relaxed">Delete successful uploads from the gateway buffer after 24 hours to ensure high privacy levels.</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Active</span>
                  <div className="w-12 h-6 rounded-full bg-slate-100 p-1 flex justify-end">
                    <div className="w-4 h-4 bg-slate-300 rounded-full" />
                  </div>
                </div>
              </div>
           </div>
        </div>

        {/* Right: Camera Setup Guide */}
        <div className="lg:col-span-5 space-y-8">
           <div className="bg-white rounded-[4rem] p-12 border border-slate-100 shadow-2xl">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-12 h-12 rounded-[1.25rem] bg-primary/10 text-primary flex items-center justify-center">
                   <Camera size={24} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Hardware Setup</h3>
              </div>

              <div className="space-y-10">
                <SetupStep number="1" title="Network Connection" text="Connect your camera to a stable Wi-Fi hotspot or wired LAN connection." icon={<Wifi size={18} />} />
                <SetupStep number="2" title="FTP Server Settings" text="Enter the IP Address, Port, and Login credentials shown on the left into your camera's FTP menu." icon={<Terminal size={18} />} />
                <SetupStep number="3" title="Auto-Transfer" text="Enable 'Auto-Transfer on Record' in your camera settings for real-time ingestion." icon={<Zap size={18} />} />
              </div>

              <div className="mt-12 pt-10 border-t border-slate-50">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Device-Specific Guides</p>
                <div className="grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-slate-50 text-slate-900 text-xs font-bold hover:bg-slate-100 transition-all border border-slate-100">
                    Sony Alpha Series <ExternalLink size={14} />
                  </button>
                  <button className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-slate-50 text-slate-900 text-xs font-bold hover:bg-slate-100 transition-all border border-slate-100">
                    Canon EOS R <ExternalLink size={14} />
                  </button>
                  <button className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-slate-50 text-slate-900 text-xs font-bold hover:bg-slate-100 transition-all border border-slate-100">
                    Nikon Z Series <ExternalLink size={14} />
                  </button>
                  <button className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-slate-50 text-slate-900 text-xs font-bold hover:bg-slate-100 transition-all border border-slate-100">
                    Mobile FTP Apps <ExternalLink size={14} />
                  </button>
                </div>
              </div>
           </div>

           <div className="rounded-[3rem] p-10 bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-3 mb-4">
                <Cpu size={20} className="text-primary" />
                <h4 className="text-base font-black uppercase italic text-slate-900">Neural Sync Status</h4>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">The gateway is actively monitoring for incoming professional frames. AI indexing will start automatically upon file receipt.</p>
              <div className="flex items-center gap-2 text-primary">
                 <RefreshCw size={14} className="animate-spin-slow" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em]">Idle - Waiting for Stream</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

function CredentialItem({ label, value, isPassword, showPassword, onCopy }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
      <div className="group relative">
        <div className="w-full px-8 py-5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-bold font-mono text-sm overflow-hidden truncate">
          {isPassword && !showPassword ? '••••••••••••' : value}
        </div>
        <button 
          onClick={onCopy}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white shadow-sm border border-slate-100 text-slate-400 hover:text-primary transition-all opacity-0 group-hover:opacity-100"
        >
          <Copy size={16} />
        </button>
      </div>
    </div>
  )
}

function SetupStep({ number, title, text, icon }: any) {
  return (
    <div className="flex gap-6">
      <div className="shrink-0 w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-black uppercase italic text-slate-900 mb-1">{title}</h4>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">{text}</p>
      </div>
    </div>
  )
}

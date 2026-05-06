import { useState, useCallback, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Trash2, Brain, CheckCircle, Image, X, Sparkles, CloudUpload, Zap, FolderSync, Play, Pause, QrCode } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import toast from 'react-hot-toast'
import { photosApi } from '../../lib/api'

const SUPPORTED_EXTS = ['.jpeg', '.jpg', '.jpe', '.raw', '.cr3', '.webp', '.avif']

export default function PhotographerUpload() {
  const { id: eventId } = useParams()
  const qc = useQueryClient()
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [processing, setProcessing] = useState(false)
  const [processStatus, setProcessStatus] = useState<any>(null)

  // Tethering State
  const [isTethering, setIsTethering] = useState(false)
  const [tetherFolder, setTetherFolder] = useState<FileSystemDirectoryHandle | null>(null)
  const [syncingFiles, setSyncingFiles] = useState<{ [key: string]: 'pending' | 'success' | 'error' }>({})
  const seenFilesRef = useRef<Set<string>>(new Set())

  const { data: photos = [] } = useQuery({
    queryKey: ['event-photos', eventId],
    queryFn: () => photosApi.list(eventId!).then((r) => r.data),
  })

  // Sync loop for Tethering
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null
    
    const syncFolder = async () => {
      if (!tetherFolder || !isTethering) return

      try {
        const newFiles: File[] = []
        // Iterate through directory entries
        for await (const entry of (tetherFolder as any).values()) {
          if (entry.kind === 'file') {
            const name = entry.name.toLowerCase()
            const match = SUPPORTED_EXTS.some(ext => name.endsWith(ext))
            
            if (match && !seenFilesRef.current.has(entry.name)) {
              const file = await entry.getFile()
              newFiles.push(file)
              seenFilesRef.current.add(entry.name)
            }
          }
        }

        if (newFiles.length > 0) {
          toast.success(`Tethering: Syncing ${newFiles.length} new captures...`)
          const formData = new FormData()
          newFiles.forEach((file) => formData.append('files', file))
          await photosApi.upload(eventId!, formData)
          qc.invalidateQueries({ queryKey: ['event-photos', eventId] })
        }
      } catch (err) {
        console.error('Tethering Sync Error:', err)
        setIsTethering(false)
        toast.error('Tethering interrupted. Please re-connect.')
      }
    }

    if (isTethering) {
      interval = setInterval(syncFolder, 4000)
    }

    return () => { if (interval) clearInterval(interval) }
  }, [isTethering, tetherFolder, eventId, qc])

  const handleTetherToggle = async () => {
    if (isTethering) {
      setIsTethering(false)
      return
    }

    try {
      // @ts-ignore
      const handle = await window.showDirectoryPicker()
      setTetherFolder(handle)
      setIsTethering(true)
      seenFilesRef.current.clear() // Reset on new connection if needed, or keep to avoid re-upload
      toast.success('Live RAW Tethering Active! Watching folder...')
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        toast.error('Failed to access local folder')
      }
    }
  }

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    const checkStatus = async () => {
      try {
        const res = await photosApi.processStatus(eventId!)
        setProcessStatus(res.data)
        setProcessing(res.data.status === 'processing' || res.data.status === 'queued')
      } catch {}
    }
    checkStatus()
    interval = setInterval(checkStatus, 3000)
    return () => { if (interval) clearInterval(interval) }
  }, [eventId])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return
    setUploading(true)
    setUploadProgress(0)
    try {
      const formData = new FormData()
      acceptedFiles.forEach((file) => formData.append('files', file))
      await photosApi.upload(eventId!, formData, setUploadProgress)
      toast.success(`Success! ${acceptedFiles.length} frames ingested.`)
      qc.invalidateQueries({ queryKey: ['event-photos', eventId] })
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Ingestion failed')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [eventId, qc])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] }, multiple: true })

  const deleteMutation = useMutation({
    mutationFn: (photoId: string) => photosApi.delete(eventId!, photoId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['event-photos', eventId] }); toast.success('Frame deleted') },
  })

  const deleteAllMutation = useMutation({
    mutationFn: () => photosApi.deleteAll(eventId!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['event-photos', eventId] }); toast.success('Gallery purged') },
  })

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      <header className="px-2 flex flex-col md:flex-row items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3 text-[#D4AF37] font-black text-[10px] uppercase tracking-[0.4em]">
            <CloudUpload size={16} /> Premium Content Ingestion
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
            Gallery <span className="font-['Playfair_Display'] italic font-normal text-[#FF9933]">Nurturing</span>
          </h1>
          <p className="text-slate-500 font-medium mt-3 text-base">Ingesting high-fidelity frames into your neural studio.</p>
        </div>

        {/* Action Hub */}
        <div className="flex items-center gap-4">
          {/* Mobile Upload QR */}
          <div className="group relative">
            <button className="p-4 rounded-2xl bg-slate-900 text-white shadow-xl hover:scale-105 transition-all border-b-4 border-slate-950 active:border-b-0 active:translate-y-1">
              <QrCode size={20} />
            </button>
            <div className="absolute right-0 top-full mt-4 p-8 bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] w-[300px] text-center">
              <div className="bg-slate-50 p-4 rounded-2xl mb-6 inline-block border border-slate-100">
                <QRCodeSVG value={window.location.href} size={180} />
              </div>
              <h4 className="text-lg font-black text-slate-900 tracking-tight mb-2 uppercase">Mobile Ingestion</h4>
              <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-widest">
                Scan to start uploading from your phone. Perfect for Wi-Fi transfers.
              </p>
            </div>
          </div>

          {/* RAW Tethering Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleTetherToggle}
            className={`relative overflow-hidden flex items-center gap-4 px-8 py-4 rounded-2xl border-2 transition-all shadow-xl ${
              isTethering 
                ? 'border-emerald-500/50 bg-emerald-50 text-emerald-700' 
                : 'border-slate-100 bg-white text-slate-400 hover:text-slate-900'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isTethering ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-50'}`}>
              {isTethering ? <FolderSync className="animate-spin-slow" size={18} /> : <Play size={18} />}
            </div>
            <div className="text-left">
              <div className="text-[10px] font-black uppercase tracking-widest">
                {isTethering ? 'Live Sync Active' : 'Live Tethering'}
              </div>
              <div className="text-[9px] font-bold opacity-60 uppercase tracking-tighter truncate max-w-[120px]">
                {isTethering ? tetherFolder?.name : 'Connect Studio Folder'}
              </div>
            </div>
            {isTethering && (
              <div className="ml-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </motion.button>
        </div>
      </header>

      {/* Dropzone Area */}
      <section>
        <div
          {...getRootProps()}
          className={`relative group border-2 border-dashed rounded-[2.5rem] p-16 text-center cursor-pointer transition-all overflow-hidden ${
            isDragActive ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-slate-100 bg-white/50 hover:border-[#D4AF37]/30 hover:bg-white transition-all duration-500 shadow-xl shadow-slate-200/20'
          }`}
        >
          <input {...getInputProps()} />
          
          <AnimatePresence>
            {isDragActive && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 flex items-center justify-center bg-[#D4AF37]/10 backdrop-blur-sm z-10"
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#D4AF37] flex items-center justify-center text-white shadow-2xl mb-4">
                    <Zap size={28} />
                  </div>
                  <span className="text-sm font-black text-[#D4AF37] uppercase tracking-[0.3em]">Release to Ingest</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative z-0">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 group-hover:bg-[#FF9933] group-hover:text-white transition-all duration-500">
              <Upload size={24} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Drop Captures Here</h3>
            <p className="text-slate-400 mt-2 text-xs font-medium uppercase tracking-widest">Drag and drop photos or click to browse studio storage</p>
            <div className="flex justify-center gap-2 mt-8">
               {SUPPORTED_EXTS.slice(0, 4).map(ext => (
                 <span key={ext} className="text-[8px] font-black text-slate-300 uppercase tracking-widest border border-slate-100 px-2 py-1 rounded-md">{ext.replace('.', '')}</span>
               ))}
            </div>
          </div>

          {uploading && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-10 z-20">
              <div className="w-full max-w-sm">
                <div className="flex justify-between items-end mb-3 px-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]">Ingesting Stream</span>
                  <span className="text-3xl font-black text-slate-900">{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FF9933]"
                  />
                </div>
                <p className="text-[9px] font-black text-slate-400 mt-4 text-center uppercase tracking-[0.2em]">Syncing high-fidelity frames to secure studio vault...</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* AI Processing Status */}
      <AnimatePresence>
        {photos.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className={`rounded-[2rem] p-8 border transition-all flex flex-wrap items-center gap-8 ${
              processing ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'
            }`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${processing ? 'bg-amber-100 animate-pulse' : 'bg-emerald-100'}`}>
              {processing ? <Brain size={24} className="text-amber-600" /> : <CheckCircle size={24} className="text-emerald-600" />}
            </div>
            
            <div className="flex-1 min-w-[240px]">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${processing ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {processing ? 'Neural Analysis Active' : 'Studio Optimized'}
                </span>
                <Sparkles size={12} className="text-[#D4AF37]" />
              </div>
              <h4 className="text-lg font-black text-slate-900 tracking-tight uppercase">
                {processing 
                  ? `Neural Engine: Extracting Biometrics (${processStatus?.processed || 0}/${processStatus?.total || 1})`
                  : 'Neural Engine: Identity Mapping Established'
                }
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                {processing 
                  ? 'Our neural engine is currently extracting facial biometric data for instant guest matching.' 
                  : `Neural analysis complete. Identity mapping established for ${processStatus?.unique_faces || 0} unique subjects.`
                }
              </p>
            </div>

            <button
              onClick={() => { if (confirm('Purge Entire Gallery: This action cannot be undone.')) deleteAllMutation.mutate() }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 border border-red-100 hover:bg-red-500 hover:text-white transition-all shadow-sm"
            >
              <Trash2 size={14} /> Purge Gallery
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gallery View */}
      <section>
        <div className="flex items-center justify-between mb-8 px-2">
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
             <Image size={20} className="text-[#D4AF37]" /> Captured Frames 
             <span className="text-[10px] font-black bg-slate-100 px-3 py-1 rounded-lg text-slate-400">({photos.length})</span>
          </h3>
        </div>

        {photos.length === 0 ? (
          <div className="text-center py-20 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 border-dashed">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mx-auto mb-6 shadow-sm">
               <Image size={24} className="text-slate-200" />
            </div>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Your creative canvas is empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {photos.map((photo: any) => (
              <motion.div 
                key={photo.id} 
                layout
                whileHover={{ y: -5 }}
                className="relative group rounded-2xl overflow-hidden aspect-square bg-white border border-slate-100 shadow-lg shadow-slate-200/30"
              >
                <img src={photo.thumbnail_url || photo.s3_url} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                  <div className="flex items-center justify-between">
                    {photo.face_indexed ? (
                      <span className="text-[8px] font-black bg-emerald-500/90 text-white px-2 py-1 rounded-md backdrop-blur-sm uppercase tracking-widest">
                        {photo.faces_count} SUBJECTS
                      </span>
                    ) : (
                      <span className="text-[8px] font-black bg-amber-500/90 text-white px-2 py-1 rounded-md backdrop-blur-sm uppercase tracking-widest">
                        QUEUED
                      </span>
                    )}
                    <button
                      onClick={() => { if (confirm('Delete this frame?')) deleteMutation.mutate(photo.id) }}
                      className="w-8 h-8 rounded-lg bg-red-500/90 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  )
}

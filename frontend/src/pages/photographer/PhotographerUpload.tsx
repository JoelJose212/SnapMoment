import { useState, useCallback, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Trash2, Brain, CheckCircle, Image, X, Sparkles, CloudUpload, Zap, FolderSync, Play, Pause } from 'lucide-react'
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
      <header className="px-2 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
            <CloudUpload size={14} /> Content Ingestion
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-foreground" style={{ fontFamily: '"Plus Jakarta Sans"' }}>Upload Photos</h1>
          <p className="text-muted font-medium mt-2">Feed your AI-powered gallery</p>
        </div>

        {/* RAW Tethering Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleTetherToggle}
          className={`relative overflow-hidden flex items-center gap-4 px-8 py-5 rounded-[2rem] border-2 transition-all shadow-2xl ${
            isTethering 
              ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600' 
              : 'border-white/10 bg-white/5 text-subtle hover:text-foreground'
          }`}
        >
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isTethering ? 'bg-emerald-500 text-white shadow-emerald-xl' : 'bg-white/10'}`}>
            {isTethering ? <FolderSync className="animate-spin-slow" size={20} /> : <Play size={20} />}
          </div>
          <div className="text-left">
            <div className="text-sm font-black uppercase tracking-widest">
              {isTethering ? 'RAW Tether Active' : 'Enable RAW Sync'}
            </div>
            <div className="text-[10px] font-bold opacity-60">
              {isTethering ? 'Watching: ' + tetherFolder?.name : 'Connect local camera folder'}
            </div>
          </div>
          {isTethering && (
            <div className="ml-4 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </motion.button>
      </header>

      {/* Dropzone Area */}
      <section>
        <div
          {...getRootProps()}
          className={`relative group border-2 border-dashed rounded-[3rem] p-16 text-center cursor-pointer transition-all overflow-hidden ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-border bg-white/30 dark:bg-black/20'
          }`}
        >
          <input {...getInputProps()} />
          
          <AnimatePresence>
            {isDragActive && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 flex items-center justify-center bg-primary/10 backdrop-blur-sm z-10"
              >
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full aurora-bg flex items-center justify-center text-white shadow-xl mb-4">
                    <Zap size={32} />
                  </div>
                  <span className="text-xl font-black text-primary uppercase tracking-widest">Release to Ingest</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative z-0">
            <div className="w-20 h-20 rounded-[2rem] glass border-white/40 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 group-hover:aurora-bg group-hover:text-white transition-all">
              <Upload size={32} />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Drop your captures here</h3>
            <p className="text-muted mt-2 text-sm">Drag and drop photos or click to browse local storage</p>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mt-6">Supports {SUPPORTED_EXTS.join(' • ').toUpperCase()}</p>
          </div>

          {uploading && (
            <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-10 z-20">
              <div className="w-full max-w-sm">
                <div className="flex justify-between items-end mb-3 px-1">
                  <span className="text-xs font-black uppercase tracking-widest text-primary">Ingesting Stream</span>
                  <span className="text-2xl font-black text-foreground">{uploadProgress}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-border overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    className="h-full rounded-full aurora-bg"
                  />
                </div>
                <p className="text-[10px] font-bold text-muted mt-4 text-center uppercase tracking-tighter">Syncing frames to secure studio servers...</p>
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
            className={`rounded-[2.5rem] p-8 border border-dashed transition-all flex flex-wrap items-center gap-8 ${
              processing ? 'bg-amber-500/5 border-amber-500/30' : 'bg-emerald-500/5 border-emerald-500/30'
            }`}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${processing ? 'bg-amber-100 dark:bg-amber-900/30 animate-pulse' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
              {processing ? <Brain size={28} className="text-amber-600" /> : <CheckCircle size={28} className="text-emerald-600" />}
            </div>
            
            <div className="flex-1 min-w-[240px]">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${processing ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {processing ? 'Processing' : 'Active'}
                </span>
                <Sparkles size={14} className="text-primary" />
              </div>
              <h4 className="text-xl font-black text-foreground">
                {processing 
                  ? `AI Engine: Analyzing Frames (${processStatus?.processed || 0}/${processStatus?.total || 1})`
                  : 'AI Engine: Library Optimized'
                }
              </h4>
              <p className="text-sm text-muted mt-1 leading-relaxed">
                {processing 
                  ? 'Our neural engine is currently extracting facial biometric data for instant guest matching.' 
                  : `Neural analysis complete. Identity mapping established for ${processStatus?.unique_faces || 0} unique subjects.`
                }
              </p>
            </div>

            <button
              onClick={() => { if (confirm('Purge Entire Gallery: This action cannot be undone.')) deleteAllMutation.mutate() }}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold bg-white dark:bg-black/40 text-red-500 border border-red-100 dark:border-red-900/30 transition-all hover:bg-red-500 hover:text-white"
            >
              <Trash2 size={16} /> Purge Gallery
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gallery View */}
      <section>
        <div className="flex items-center justify-between mb-6 px-2">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            Captured Frames <span className="text-sm font-medium text-muted">({photos.length})</span>
          </h3>
        </div>

        {photos.length === 0 ? (
          <div className="text-center py-20 bg-white/20 dark:bg-black/10 rounded-[2.5rem] border border-border border-dashed">
            <Image size={48} className="mx-auto mb-4 opacity-10" />
            <p className="text-muted font-medium italic">Your creative canvas is empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {photos.map((photo: any) => (
              <motion.div 
                key={photo.id} 
                layout
                whileHover={{ scale: 1.02 }}
                className="relative group rounded-[2rem] overflow-hidden aspect-square glass border-white/20"
              >
                <img src={photo.thumbnail_url || photo.s3_url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                  <div className="flex items-center justify-between">
                    {photo.face_indexed ? (
                      <span className="text-[10px] font-black bg-emerald-500/90 text-white px-2 py-1 rounded-lg backdrop-blur-sm">
                        {photo.faces_count} SUBJECTS
                      </span>
                    ) : (
                      <span className="text-[10px] font-black bg-amber-500/90 text-white px-2 py-1 rounded-lg backdrop-blur-sm">
                        QUEUED
                      </span>
                    )}
                    <button
                      onClick={() => { if (confirm('Delete this frame?')) deleteMutation.mutate(photo.id) }}
                      className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
                    >
                      <Trash2 size={14} />
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

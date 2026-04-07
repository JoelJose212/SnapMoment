import { useState, useCallback, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload, Trash2, Brain, CheckCircle, Image, AlertCircle, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { photosApi } from '../../lib/api'
import SplashTag from '../../components/shared/SplashTag'

export default function PhotographerUpload() {
  const { id: eventId } = useParams()
  const qc = useQueryClient()
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [processing, setProcessing] = useState(false)
  const [processStatus, setProcessStatus] = useState<any>(null)
  const [pollInterval, setPollInterval] = useState<ReturnType<typeof setInterval> | null>(null)

  const { data: photos = [], isLoading } = useQuery({
    queryKey: ['event-photos', eventId],
    queryFn: () => photosApi.list(eventId!).then((r) => r.data),
  })

  // Auto-poll status on mount and during processing
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    const checkStatus = async () => {
      try {
        const res = await photosApi.processStatus(eventId!)
        setProcessStatus(res.data)
        if (res.data.status === 'processing' || res.data.status === 'queued') {
          setProcessing(true)
        } else {
          setProcessing(false)
        }
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
      toast.success(`${acceptedFiles.length} photo(s) uploaded! 📸`)
      qc.invalidateQueries({ queryKey: ['event-photos', eventId] })
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Upload failed')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [eventId, qc])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] }, multiple: true })

  const deleteMutation = useMutation({
    mutationFn: (photoId: string) => photosApi.delete(eventId!, photoId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['event-photos', eventId] }); toast.success('Photo deleted') },
  })

  const deleteAllMutation = useMutation({
    mutationFn: () => photosApi.deleteAll(eventId!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['event-photos', eventId] }); toast.success('All photos deleted') },
  })

  const handleProcess = async () => {
    // This is now automatic on the backend, but we keep this for manual re-indexing if needed
    setProcessing(true)
    try {
      await photosApi.process(eventId!)
      toast.success('AI is re-indexing your photos...')
    } catch {
      toast.error('Failed to start processing')
      setProcessing(false)
    }
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center gap-3 mb-8">
        <h1 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 32, color: 'var(--foreground)' }}>Upload Photos</h1>
        <SplashTag text="Powered by AI" color="crimson" rotation={-2} />
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className="border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all mb-6"
        style={{ borderColor: isDragActive ? '#FF6E6C' : 'var(--border)', background: isDragActive ? 'var(--background)' : 'var(--card)' }}
      >
        <input {...getInputProps()} />
        <Upload size={40} color="#A394A8" className="mx-auto mb-3" />
        <p className="font-medium text-text-muted">Drop photos here or click to browse</p>
        <p className="text-xs text-text-subtle mt-1">JPG, PNG, HEIC — multiple files supported</p>
        {uploading && (
          <div className="mt-5">
            <div className="w-full h-2 rounded-full bg-border overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${uploadProgress}%`, background: 'linear-gradient(135deg,#FF6E6C,#67568C)' }} />
            </div>
            <p className="text-xs text-[#FF6E6C] mt-2 font-medium">{uploadProgress}% uploaded...</p>
          </div>
        )}
      </div>

      {/* AI Status Banner */}
      {photos.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 mb-6 p-4 rounded-2xl border border-dashed border-opacity-50" style={{ background: 'var(--card)', borderColor: processing ? '#FFB800' : '#00C48C' }}>
          <div className="flex items-center gap-3 flex-1">
            <div className={`p-2 rounded-xl ${processing ? 'bg-amber-100 animate-pulse' : 'bg-emerald-100'}`}>
              {processing ? <Brain size={20} color="#FFB800" /> : <CheckCircle size={20} color="#00C48C" />}
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                {processing 
                  ? `AI is sorting your photos... (${processStatus?.processed || 0}/${processStatus?.total || 1})`
                  : 'AI Sorting Complete'
                }
              </p>
              <p className="text-xs text-text-subtle">
                {processing 
                  ? 'Guests will see their photos as soon as the processing finishes.' 
                  : `Successfully indexed ${processStatus?.unique_faces || 0} faces across your gallery.`
                }
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {processing && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-amber-50 text-amber-600 border border-amber-200">
                Live Indexing
              </span>
            )}
            <button
              onClick={() => { if (confirm('Delete ALL photos?')) deleteAllMutation.mutate() }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-red-200"
              style={{ background: '#FFF5F5', color: '#FF4B4B' }}
            >
              <Trash2 size={14} />Clear Gallery
            </button>
          </div>
        </div>
      )}

      {/* Photos grid */}
      {isLoading ? (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton rounded-2xl aspect-square" />)}
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-16">
          <Image size={40} color="#A394A8" className="mx-auto mb-3 opacity-50" />
          <p className="text-text-muted text-sm">No photos yet. Upload some above!</p>
        </div>
      ) : (
        <div>
          <p className="text-sm text-text-muted mb-3">{photos.length} photos</p>
          <div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
            {photos.map((photo: any) => (
              <div key={photo.id} className="relative group rounded-2xl overflow-hidden" style={{ aspectRatio: '1' }}>
                <img src={photo.thumbnail_url || photo.s3_url} alt="" className="w-full h-full object-cover" />
                {photo.face_indexed && (
                  <div className="absolute top-1 left-1">
                    <span className="text-xs px-1.5 py-0.5 rounded-full font-medium text-white" style={{ background: '#00C48C' }}>
                      {photo.faces_count}👤
                    </span>
                  </div>
                )}
                <button
                  onClick={() => { if (confirm('Delete this photo?')) deleteMutation.mutate(photo.id) }}
                  className="absolute top-1 right-1 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(255,75,75,0.9)' }}
                >
                  <X size={14} color="white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api'
import { 
  Search, Trash2, Camera, Calendar, MapPin, 
  ExternalLink, MoreVertical, Filter, Globe, 
  Zap, Clock, ShieldAlert, CheckCircle2, 
  User, Image as ImageIcon, Download, Settings2,
  ChevronDown, X, QrCode, Play, Cpu, ArrowRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import ConfirmModal from '../../components/shared/ConfirmModal'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function AdminEvents() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const [modal, setModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    type: 'danger' | 'warning'
    confirmText: string
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning',
    confirmText: 'Confirm'
  })

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['admin-events', search, typeFilter],
    queryFn: () => adminApi.events().then((r) => {
        let data = r.data;
        if (search) {
            data = data.filter((e: any) => 
                e.name.toLowerCase().includes(search.toLowerCase()) || 
                e.photographer_name?.toLowerCase().includes(search.toLowerCase())
            )
        }
        if (typeFilter) {
            data = data.filter((e: any) => e.type === typeFilter)
        }
        return data;
    }),
  })

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener('mouseup', handleClickOutside)
    return () => document.removeEventListener('mouseup', handleClickOutside)
  }, [])

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteEvent(id),
    onSuccess: () => { 
        qc.invalidateQueries({ queryKey: ['admin-events'] })
        toast.success('Event record purged from network') 
    },
    onError: () => toast.error('Security breach: Purge failed'),
  })

  const handleDelete = (id: string, name: string) => {
    setModal({
      isOpen: true,
      title: 'Force Purge Event?',
      message: `Destroy all data associated with "${name}"? This action will permanently wipe all neural photo archives and metadata from the broadcast network.`,
      confirmText: 'EXECUTE PURGE',
      type: 'danger',
      onConfirm: () => {
        deleteMutation.mutate(id)
        setModal(prev => ({ ...prev, isOpen: false }))
      }
    })
  }

  return (
    <div className="p-10 max-w-[1600px] mx-auto min-h-screen">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Globe size={14} className="text-indigo-600" />
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Global Broadcast Network</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Active Repositories</h1>
          <p className="text-slate-500 mt-1 font-medium">Monitor and manage all live event photo streams across the platform.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="Active" />
                    </div>
                ))}
            </div>
            <div className="px-2">
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none mb-1">{events.filter((e: any) => e.is_active).length} LIVE NOW</p>
                <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest leading-none">Global Coverage Active</p>
            </div>
        </div>
      </header>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-slate-50 border-none text-sm font-semibold placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            placeholder="Search events by name or photographer..."
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)} 
              className="pl-11 pr-10 py-3.5 rounded-2xl bg-slate-50 border-none text-sm font-bold text-slate-700 appearance-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="">Type: All Archives</option>
              <option value="wedding">Wedding</option>
              <option value="corporate">Corporate</option>
              <option value="birthday">Birthday</option>
              <option value="fashion">Fashion</option>
              <option value="other">Other</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50">
                {['Event Identity', 'Source Entity', 'Category', 'Broadcast Date', 'Status', 'Actions'].map((h, i) => (
                  <th key={h} className={`px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ${i === 5 ? 'text-right' : ''}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <td colSpan={6} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Accessing Event Logs...</span>
                      </div>
                    </td>
                  </motion.tr>
                ) : events.length === 0 ? (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td colSpan={6} className="px-8 py-20 text-center">
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No matching archives detected</p>
                    </td>
                  </motion.tr>
                ) : (
                  events.map((event: any, i: number) => (
                    <motion.tr 
                      key={event.id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm relative overflow-hidden">
                            <Camera size={20} />
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                          </div>
                          <div className="max-w-[250px]">
                            <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{event.name}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest font-mono truncate">{event.id.slice(0, 18)}...</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px]">
                                {event.photographer_name?.charAt(0)}
                            </div>
                            <span className="text-sm font-bold text-slate-600 italic uppercase tracking-tight">{event.photographer_name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 w-fit">
                            <Zap size={12} className="text-amber-500" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{event.type}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Clock size={14} />
                            <span className="text-xs font-bold uppercase">{event.event_date ? new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {event.is_active ? (
                            <div className="flex items-center gap-2 text-emerald-600">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest italic">Live Broadcast</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-slate-300">
                                <div className="w-2 h-2 rounded-full bg-slate-300" />
                                <span className="text-[10px] font-black uppercase tracking-widest italic">Archive Locked</span>
                            </div>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right relative">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => window.open(`/event/${event.qr_token}/gallery`, '_blank')}
                              className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 transition-colors"
                              title="Enter Broadcast Gallery"
                            >
                                <Play size={16} />
                            </button>
                            <div className="w-px h-4 bg-slate-100 mx-1" />
                            <div className="relative">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setOpenMenuId(openMenuId === event.id ? null : event.id)
                                  }}
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${openMenuId === event.id ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                >
                                    <MoreVertical size={16} />
                                </button>
                                
                                <AnimatePresence>
                                    {openMenuId === event.id && (
                                        <motion.div 
                                          ref={menuRef}
                                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                          animate={{ opacity: 1, scale: 1, y: 0 }}
                                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                          className="absolute right-0 mt-3 w-56 bg-white rounded-3xl border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-2 z-[999] origin-top-right pointer-events-auto"
                                        >
                                            <button onClick={() => { setOpenMenuId(null); window.open(`/event/${event.qr_token}/gallery`, '_blank') }} className="flex items-center gap-3 w-full px-4 py-3 text-[11px] font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-2xl transition-all">
                                                <ImageIcon size={14} /> VIEW PUBLIC GALLERY
                                            </button>
                                            <button onClick={() => { setOpenMenuId(null); toast.success('QR Dispatch: Access code regenerated') }} className="flex items-center gap-3 w-full px-4 py-3 text-[11px] font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-2xl transition-all">
                                                <QrCode size={14} /> DOWNLOAD ACCESS QR
                                            </button>
                                            <button onClick={() => { setOpenMenuId(null); toast.success('Neural indexing: Photo consistency audit initiated') }} className="flex items-center gap-3 w-full px-4 py-3 text-[11px] font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-2xl transition-all">
                                                <Cpu size={14} /> AUDIT FACE INDICES
                                            </button>
                                            <div className="h-px bg-slate-50 my-1 mx-2" />
                                            <button onClick={() => { setOpenMenuId(null); handleDelete(event.id, event.name) }} className="flex items-center gap-3 w-full px-4 py-3 text-[11px] font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                                                <Trash2 size={14} /> FORCE PURGE ARCHIVE
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {/* Footer info */}
        <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-50 flex justify-between items-center rounded-b-[40px]">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Showing {events.length} repositories</p>
          <div className="flex gap-4">
            <button className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Prev</button>
            <button className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:text-indigo-700 transition-colors underline underline-offset-4">Next Page</button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={modal.isOpen}
        onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        confirmText={modal.confirmText}
        type={modal.type}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}

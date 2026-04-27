import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api'
import { 
  Mail, Trash2, CheckCircle, Clock, 
  Search, Filter, MoreVertical, Send, 
  User, MessageSquare, AlertCircle, Sparkles,
  ShieldCheck, ExternalLink, ChevronDown, X,
  Inbox, Reply
} from 'lucide-react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import ConfirmModal from '../../components/shared/ConfirmModal'

export default function AdminMessages() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null)
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

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: () => adminApi.messages().then((r) => r.data),
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

  const resolveMutation = useMutation({
    mutationFn: (id: string) => adminApi.resolveMessage(id),
    onSuccess: () => { 
        qc.invalidateQueries({ queryKey: ['admin-messages'] })
        toast.success('Protocol: Ticket marked as RESOLVED') 
    },
    onError: () => toast.error('Command failed: Could not resolve ticket'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteMessage(id),
    onSuccess: () => { 
        qc.invalidateQueries({ queryKey: ['admin-messages'] })
        toast.success('Inquiry record purged') 
    },
    onError: () => toast.error('Purge protocol failed'),
  })

  const handleDelete = (id: string, name: string) => {
    setModal({
      isOpen: true,
      title: 'Purge Inquiry Record?',
      message: `Permanently delete message from ${name}? This will remove all associated telemetry from the support history.`,
      confirmText: 'EXECUTE PURGE',
      type: 'danger',
      onConfirm: () => {
        deleteMutation.mutate(id)
        setModal(prev => ({ ...prev, isOpen: false }))
      }
    })
  }

  const filteredMessages = messages.filter((m: any) => 
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.subject?.toLowerCase().includes(search.toLowerCase()) ||
    m.message.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-10 max-w-[1600px] mx-auto min-h-screen">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={14} className="text-pink-600" />
            <span className="text-[10px] font-bold text-pink-600 uppercase tracking-widest">Support Command Center</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Active Inquiries</h1>
          <p className="text-slate-500 mt-1 font-medium">Coordinate system communication and resolve network assistance requests.</p>
        </div>
        <div className="flex gap-4">
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center">
                    <Inbox size={20} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Queue Load</p>
                    <p className="text-xl font-black text-slate-900 italic uppercase leading-none">{messages.filter((m: any) => !m.is_resolved).length} Pending</p>
                </div>
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
            className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-slate-50 border-none text-sm font-semibold placeholder:text-slate-400 focus:ring-2 focus:ring-pink-500/20 transition-all"
            placeholder="Search communications by keyword, sender or subject..."
          />
        </div>
        <div className="flex gap-2">
           <button className="px-6 py-3.5 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:shadow-xl transition-all active:scale-95">
             ARCHIVE RESOLVED
           </button>
        </div>
      </div>

      {/* Communications Table */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50">
                {['Sender Identity', 'Transmission', 'Temporal Index', 'Status', 'Action Matrix'].map((h, i) => (
                  <th key={h} className={`px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ${i === 4 ? 'text-right' : ''}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Intercepting Signals...</span>
                      </div>
                    </td>
                  </motion.tr>
                ) : filteredMessages.length === 0 ? (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-30">
                        <Mail size={48} />
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Communications Channel Clear</p>
                      </div>
                    </td>
                  </motion.tr>
                ) : (
                  filteredMessages.map((m: any, i: number) => (
                    <motion.tr 
                      key={m.id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`group hover:bg-slate-50/50 transition-colors ${m.is_resolved ? 'opacity-60' : ''}`}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-600 font-black text-sm relative overflow-hidden">
                            {m.name.charAt(0)}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 group-hover:text-pink-600 transition-colors">{m.name}</p>
                            <span className="text-[11px] font-semibold text-slate-400 lowercase">{m.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="max-w-md">
                            <p className="text-xs font-black text-slate-900 uppercase tracking-tight mb-1 truncate">{m.subject || 'Standard Inquiry'}</p>
                            <p className="text-xs text-slate-500 font-medium line-clamp-1">{m.message}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Clock size={14} />
                            <span className="text-xs font-bold uppercase">{new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {m.is_resolved ? (
                            <div className="flex items-center gap-2 text-emerald-600 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 w-fit">
                                <ShieldCheck size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Settled</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-pink-600 px-3 py-1.5 rounded-full bg-pink-50 border border-pink-100 w-fit">
                                <AlertCircle size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Priority</span>
                            </div>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right relative">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!m.is_resolved && (
                                <button 
                                  onClick={() => resolveMutation.mutate(m.id)}
                                  className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-all active:scale-90"
                                  title="Resolve Ticket"
                                >
                                    <CheckCircle size={16} />
                                </button>
                            )}
                            <div className="w-px h-4 bg-slate-200 mx-1" />
                            <div className="relative">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setOpenMenuId(openMenuId === m.id ? null : m.id)
                                  }}
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${openMenuId === m.id ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                >
                                    <MoreVertical size={16} />
                                </button>
                                
                                <AnimatePresence>
                                    {openMenuId === m.id && (
                                        <motion.div 
                                          ref={menuRef}
                                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                          animate={{ opacity: 1, scale: 1, y: 0 }}
                                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                          className="absolute right-0 mt-3 w-56 bg-white rounded-3xl border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-2 z-[999] origin-top-right pointer-events-auto"
                                        >
                                            <button onClick={() => { setOpenMenuId(null); setSelectedMessage(m) }} className="flex items-center gap-3 w-full px-4 py-3 text-[11px] font-bold text-slate-600 hover:bg-slate-50 hover:text-pink-600 rounded-2xl transition-all">
                                                <ExternalLink size={14} /> VIEW TRANSMISSION
                                            </button>
                                            <button onClick={() => { setOpenMenuId(null); toast.success('Protocol: Response bridge initiated') }} className="flex items-center gap-3 w-full px-4 py-3 text-[11px] font-bold text-slate-600 hover:bg-slate-50 hover:text-pink-600 rounded-2xl transition-all">
                                                <Reply size={14} /> DISPATCH RESPONSE
                                            </button>
                                            <div className="h-px bg-slate-50 my-1 mx-2" />
                                            <button onClick={() => { setOpenMenuId(null); handleDelete(m.id, m.name) }} className="flex items-center gap-3 w-full px-4 py-3 text-[11px] font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                                                <Trash2 size={14} /> PURGE SIGNAL
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
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Total Communications Logged: {filteredMessages.length}</p>
          <div className="flex gap-4">
            <button className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Previous Wave</button>
            <button className="text-[10px] font-bold text-pink-600 uppercase tracking-widest hover:text-pink-700 transition-colors underline underline-offset-4">Next Wave</button>
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

      {/* Message View Overlay */}
      <AnimatePresence>
        {selectedMessage && (
            <>
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedMessage(null)}
                  className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1100]"
                />
                <motion.div 
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  className="fixed top-0 right-0 h-screen w-full max-w-xl bg-white shadow-2xl z-[1200] p-10 overflow-y-auto"
                >
                    <div className="flex items-center justify-between mb-12">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
                                <MessageSquare size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">Transmission Audit</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">ID: {selectedMessage.id.slice(0, 12)}</p>
                            </div>
                        </div>
                        <button onClick={() => setSelectedMessage(null)} className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-10">
                        <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Signal Source</h4>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-slate-900 text-pink-400 flex items-center justify-center text-2xl font-black italic shadow-xl">
                                    {selectedMessage.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">{selectedMessage.name}</p>
                                    <p className="text-sm font-medium text-slate-500">{selectedMessage.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Content Decryption</h4>
                            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative">
                                <div className="absolute top-6 right-8 text-pink-500/10">
                                    <Sparkles size={48} />
                                </div>
                                <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tight mb-6 pr-10">{selectedMessage.subject || 'Standard Support Inquiry'}</h3>
                                <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">{selectedMessage.message}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-10">
                            {!selectedMessage.is_resolved && (
                                <button 
                                  onClick={() => { resolveMutation.mutate(selectedMessage.id); setSelectedMessage(null) }}
                                  className="flex-1 px-8 py-5 rounded-[2rem] bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <ShieldCheck size={16} /> SETTLE TICKET
                                </button>
                            )}
                            <button 
                              onClick={() => { toast.success('Response bridge established'); setSelectedMessage(null) }}
                              className="flex-1 px-8 py-5 rounded-[2rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Send size={16} /> DISPATCH REPLY
                            </button>
                        </div>
                    </div>
                </motion.div>
            </>
        )}
      </AnimatePresence>
    </div>
  )
}

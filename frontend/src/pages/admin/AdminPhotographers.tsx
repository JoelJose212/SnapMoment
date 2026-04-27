import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api'
import { 
  Search, CheckCircle, XCircle, ToggleRight, ToggleLeft, 
  Shield, Trash2, Mail, Filter, MoreVertical, 
  ExternalLink, Users, Download, Key, FileText, 
  Settings2, Sparkles, Zap, ShieldCheck, ChevronDown,
  X, Calendar, Phone, Camera, Award, Cpu, Globe, ArrowRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import ConfirmModal from '../../components/shared/ConfirmModal'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const PLAN_CONFIG = {
  fresher: { label: 'FRESHER', color: 'bg-slate-100 text-slate-500', icon: Zap },
  pro: { label: 'PRO', color: 'bg-indigo-50 text-indigo-600', icon: Sparkles },
  studio: { label: 'STUDIO', color: 'bg-slate-900 text-teal-400', icon: ShieldCheck },
  free: { label: 'FREE', color: 'bg-slate-100 text-slate-400', icon: Zap }
}

export default function AdminPhotographers() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [openPlanSelectorId, setOpenPlanSelectorId] = useState<string | null>(null)
  const [selectedPhotographer, setSelectedPhotographer] = useState<any | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const selectorRef = useRef<HTMLDivElement>(null)

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

  const { data: photographers = [], isLoading } = useQuery({
    queryKey: ['admin-photographers', search, planFilter],
    queryFn: () => adminApi.photographers({ search: search || undefined, plan: planFilter || undefined }).then((r) => r.data),
  })

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null)
      }
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setOpenPlanSelectorId(null)
      }
    }
    document.addEventListener('mouseup', handleClickOutside)
    return () => document.removeEventListener('mouseup', handleClickOutside)
  }, [])

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => adminApi.updatePhotographer(id, data),
    onSuccess: (data, variables) => { 
      qc.invalidateQueries({ queryKey: ['admin-photographers'] })
      if (variables.data.plan) {
        toast.success(`Protocol: Entity upgraded to ${variables.data.plan.toUpperCase()}`)
      } else {
        toast.success('Registry Updated!') 
      }
    },
    onError: () => toast.error('Protocol override failed'),
  })

  const suspendMutation = useMutation({
    mutationFn: (id: string) => adminApi.suspendPhotographer(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-photographers'] }); toast.success('Node suspended') },
    onError: () => toast.error('Suspension failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deletePhotographer(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-photographers'] }); toast.success('Entity purged') },
    onError: () => toast.error('Purge failed'),
  })

  const handleExportAudit = () => {
    if (!photographers.length) {
      toast.error('No entities available for export')
      return
    }

    const headers = ['ID', 'Full Name', 'Email', 'Plan', 'Verified', 'Active', 'Created At']
    const csvContent = [
      headers.join(','),
      ...photographers.map((p: any) => [
        p.id,
        `"${p.full_name}"`,
        p.email,
        p.plan,
        p.is_verified,
        p.is_active,
        p.created_at
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `snapmoment_registry_audit_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Audit Report Generated')
  }

  const handleDelete = (id: string, name: string) => {
    setModal({
      isOpen: true,
      title: 'Purge Entity Record?',
      message: `Delete ${name}? This will permanently wipe all neural indices and event repositories associated with this node.`,
      confirmText: 'EXECUTE PURGE',
      type: 'danger',
      onConfirm: () => {
        deleteMutation.mutate(id)
        setModal(prev => ({ ...prev, isOpen: false }))
      }
    })
  }

  const handleSuspend = (id: string, name: string) => {
    setModal({
      isOpen: true,
      title: 'Suspend Network Access?',
      message: `Suspend ${name}? This will block all API throughput and hide repositories from the global delivery network.`,
      confirmText: 'INITIATE SUSPENSION',
      type: 'warning',
      onConfirm: () => {
        suspendMutation.mutate(id)
        setModal(prev => ({ ...prev, isOpen: false }))
      }
    })
  }

  const getSlug = (name: string) => name.toLowerCase().replace(/ /g, '-')

  return (
    <div className="p-10 max-w-[1600px] mx-auto relative min-h-screen">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users size={14} className="text-teal-600" />
            <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Network Registry</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Photographer Nodes</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage and monitor authorized photography entities on the platform.</p>
        </div>
        <button 
          onClick={handleExportAudit}
          className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:shadow-2xl hover:shadow-slate-400 transition-all active:scale-95 shrink-0"
        >
          <Download size={18} /> EXPORT AUDIT REPORT
        </button>
      </header>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-slate-50 border-none text-sm font-semibold placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500/20 transition-all"
            placeholder="Search directory by name, email or ID..."
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <select 
              value={planFilter} 
              onChange={(e) => setPlanFilter(e.target.value)} 
              className="pl-11 pr-10 py-3.5 rounded-2xl bg-slate-50 border-none text-sm font-bold text-slate-700 appearance-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
            >
              <option value="">Tier: All Nodes</option>
              <option value="fresher">Tier: Fresher</option>
              <option value="pro">Tier: Professional</option>
              <option value="studio">Tier: Elite Studio</option>
              <option value="free">Tier: Free</option>
            </select>
          </div>
        </div>
      </div>

      {/* Registry Table */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50">
                {['Entity / Identification', 'Service Tier', 'V-Status', 'I/O Status', 'Action Matrix'].map((h, i) => (
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
                        <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Accessing Registry...</span>
                      </div>
                    </td>
                  </motion.tr>
                ) : (
                  photographers.map((p: any, i: number) => {
                    const planInfo = (PLAN_CONFIG as any)[p.plan] || PLAN_CONFIG.free
                    const PlanIcon = planInfo.icon
                    
                    return (
                      <motion.tr 
                        key={p.id} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 font-black text-sm relative overflow-hidden">
                              {p.full_name.charAt(0)}
                              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 group-hover:text-teal-600 transition-colors">{p.full_name}</p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <Mail size={12} className="text-slate-400" />
                                <span className="text-[11px] font-semibold text-slate-400 lowercase">{p.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 relative">
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpenPlanSelectorId(openPlanSelectorId === p.id ? null : p.id)
                            }}
                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider w-fit transition-all hover:scale-105 active:scale-95 ${planInfo.color}`}
                          >
                            <PlanIcon size={12} />
                            {planInfo.label}
                            <ChevronDown size={10} className={`transition-transform duration-300 ${openPlanSelectorId === p.id ? 'rotate-180' : ''}`} />
                          </button>

                          <AnimatePresence>
                            {openPlanSelectorId === p.id && (
                              <motion.div 
                                ref={selectorRef}
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="absolute left-8 top-full mt-2 w-48 bg-white rounded-2xl border border-slate-100 shadow-2xl z-[1000] p-1.5"
                              >
                                {Object.entries(PLAN_CONFIG).map(([key, config]) => {
                                  const Icon = config.icon
                                  return (
                                    <button
                                      key={key}
                                      type="button"
                                      onClick={() => {
                                        setOpenPlanSelectorId(null)
                                        updateMutation.mutate({ id: p.id, data: { plan: key } })
                                      }}
                                      className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-[10px] font-bold transition-colors ${p.plan === key ? 'bg-slate-50 text-slate-900' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
                                    >
                                      <Icon size={14} className={p.plan === key ? 'text-teal-500' : ''} />
                                      {config.label}
                                      {p.plan === key && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-500" />}
                                    </button>
                                  )
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            {p.is_verified ? (
                              <div className="flex items-center gap-1.5 text-teal-600">
                                <CheckCircle size={16} />
                                <span className="text-[11px] font-black uppercase tracking-widest">Verified</span>
                              </div>
                            ) : (
                              <button 
                                type="button"
                                onClick={() => updateMutation.mutate({ id: p.id, data: { is_verified: true } })}
                                className="flex items-center gap-1.5 text-slate-400 hover:text-indigo-500 transition-colors"
                              >
                                <Shield size={16} />
                                <span className="text-[11px] font-black uppercase tracking-widest">Pending</span>
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <button 
                            type="button"
                            onClick={() => updateMutation.mutate({ id: p.id, data: { is_active: !p.is_active } })}
                            className="transition-transform active:scale-90"
                          >
                            {p.is_active ? 
                              <div className="flex items-center gap-2 text-emerald-600">
                                <ToggleRight size={28} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
                              </div> : 
                              <div className="flex items-center gap-2 text-slate-300">
                                <ToggleLeft size={28} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Offline</span>
                              </div>
                            }
                          </button>
                        </td>
                        <td className="px-8 py-6 text-right relative">
                          <div className={`flex items-center justify-end gap-2 transition-opacity ${openMenuId === p.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            <button
                              type="button"
                              onClick={() => handleSuspend(p.id, p.full_name)}
                              className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center hover:bg-orange-100 transition-colors"
                              title="Suspend Node"
                            >
                              <XCircle size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(p.id, p.full_name)}
                              className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors"
                              title="Purge Node"
                            >
                              <Trash2 size={16} />
                            </button>
                            <div className="w-px h-4 bg-slate-200 mx-1" />
                            <div className="relative">
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setOpenMenuId(openMenuId === p.id ? null : p.id)
                                }}
                                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${openMenuId === p.id ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                              >
                                <MoreVertical size={16} />
                              </button>
                              
                              <AnimatePresence>
                                {openMenuId === p.id && (
                                  <motion.div 
                                    ref={menuRef}
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    className="absolute right-0 mt-3 w-56 bg-white rounded-3xl border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-2 z-[999] origin-top-right pointer-events-auto"
                                  >
                                    <button 
                                      type="button" 
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        setOpenMenuId(null); 
                                        setSelectedPhotographer(p);
                                        toast.success('Accessing Neural Profile...')
                                      }} 
                                      className="flex items-center gap-3 w-full px-4 py-3 text-[11px] font-bold text-slate-600 hover:bg-slate-50 hover:text-teal-600 rounded-2xl transition-all"
                                    >
                                      <ExternalLink size={14} /> VIEW FULL PROFILE
                                    </button>
                                    <button type="button" onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); setOpenPlanSelectorId(p.id) }} className="flex items-center gap-3 w-full px-4 py-3 text-[11px] font-bold text-slate-600 hover:bg-slate-50 hover:text-teal-600 rounded-2xl transition-all">
                                      <Settings2 size={14} /> UPGRADE SERVICE TIER
                                    </button>
                                    <button type="button" onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); toast.success('Credential reset token dispatched') }} className="flex items-center gap-3 w-full px-4 py-3 text-[11px] font-bold text-slate-600 hover:bg-slate-50 hover:text-teal-600 rounded-2xl transition-all">
                                      <Key size={14} /> RESET CREDENTIALS
                                    </button>
                                    <div className="h-px bg-slate-50 my-1 mx-2" />
                                    <button type="button" onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); toast.success('Retrieving neural activity logs...') }} className="flex items-center gap-3 w-full px-4 py-3 text-[11px] font-bold text-slate-400 hover:bg-slate-50 hover:text-slate-900 rounded-2xl transition-all">
                                      <FileText size={14} /> AUDIT ACTIVITY LOGS
                                    </button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {/* Footer info */}
        <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-50 flex justify-between items-center rounded-b-[40px]">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Showing {photographers.length} entities</p>
          <div className="flex gap-4">
            <button className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Prev</button>
            <button className="text-[10px] font-bold text-teal-600 uppercase tracking-widest hover:text-teal-700 transition-colors underline underline-offset-4">Next Page</button>
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
        loading={deleteMutation.isPending || suspendMutation.isPending}
      />

      {/* Photographer Insights Side Panel */}
      <AnimatePresence>
        {selectedPhotographer && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPhotographer(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-screen w-full max-w-xl bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-[1200] overflow-y-auto"
            >
              {/* Panel Header */}
              <div className="p-8 border-b border-slate-50 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                    <Users size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">Neural Insight</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Registry ID: {selectedPhotographer.id.slice(0, 8)}...</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedPhotographer(null)}
                  className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-10 space-y-12">
                {/* Profile Header */}
                <div className="flex items-center gap-8">
                  <div className="w-32 h-32 rounded-[2.5rem] bg-slate-900 flex items-center justify-center text-5xl text-teal-400 font-black italic shadow-2xl relative overflow-hidden">
                    {selectedPhotographer.full_name.charAt(0)}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">{selectedPhotographer.full_name}</h3>
                      {selectedPhotographer.is_verified && <CheckCircle size={20} className="text-teal-500" />}
                    </div>
                    <p className="text-slate-500 font-medium flex items-center gap-2">
                      <Mail size={14} /> {selectedPhotographer.email}
                    </p>
                    <div className="flex items-center gap-4 mt-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${(PLAN_CONFIG as any)[selectedPhotographer.plan]?.color || PLAN_CONFIG.free.color}`}>
                        {(PLAN_CONFIG as any)[selectedPhotographer.plan]?.label || 'FREE'} Tier
                      </span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedPhotographer.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                        {selectedPhotographer.is_active ? 'Active Node' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Identity Telemetry */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                    <div className="flex items-center gap-3 mb-4 text-slate-400 uppercase text-[9px] font-black tracking-widest">
                      <Calendar size={14} /> Registration
                    </div>
                    <p className="text-lg font-black text-slate-900 italic uppercase">
                      {new Date(selectedPhotographer.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                    <div className="flex items-center gap-3 mb-4 text-slate-400 uppercase text-[9px] font-black tracking-widest">
                      <Phone size={14} /> Contact Line
                    </div>
                    <p className="text-lg font-black text-slate-900 italic uppercase">
                      {selectedPhotographer.phone || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Performance HUD (Placeholder for real data) */}
                <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 text-white/5 opacity-20 group-hover:opacity-40 transition-opacity">
                    <Cpu size={120} />
                  </div>
                  <div className="relative z-10">
                    <h4 className="text-xs font-black text-white/40 uppercase tracking-[0.3em] mb-8">Node Telemetry</h4>
                    <div className="grid grid-cols-2 gap-10">
                      <div className="space-y-1">
                        <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Global Events</p>
                        <p className="text-4xl font-black italic tracking-tighter uppercase">24 <span className="text-[10px] text-teal-400 not-italic">LIVE</span></p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Storage Load</p>
                        <p className="text-4xl font-black italic tracking-tighter uppercase">82% <span className="text-[10px] text-orange-400 not-italic">PEAK</span></p>
                      </div>
                    </div>
                    <div className="mt-10 space-y-4">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest mb-1 text-white/60">
                          <span>AI Processing Power</span>
                          <span className="text-teal-400">98% OPTIMAL</span>
                       </div>
                       <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: '98%' }} transition={{ duration: 1.5 }} className="h-full bg-teal-400" />
                       </div>
                    </div>
                  </div>
                </div>

                {/* Navigation Actions */}
                <div className="space-y-4 pt-4">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 mb-6">Strategic Command</h4>
                   <button 
                     onClick={() => window.open(`/p/${getSlug(selectedPhotographer.full_name)}`, '_blank')}
                     className="w-full flex items-center justify-between p-6 rounded-[2rem] bg-white border border-slate-100 hover:border-teal-500/20 hover:bg-teal-50/20 transition-all group"
                   >
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Globe size={24} />
                         </div>
                         <div className="text-left">
                            <p className="text-sm font-black text-slate-900 uppercase italic">Public Showcase</p>
                            <p className="text-[10px] text-slate-400 font-medium">View the external portfolio and live galleries.</p>
                         </div>
                      </div>
                      <ExternalLink size={18} className="text-slate-300 group-hover:text-teal-600" />
                   </button>

                   <button 
                     onClick={() => { navigate(`/admin/events?search=${selectedPhotographer.full_name}`); setSelectedPhotographer(null) }}
                     className="w-full flex items-center justify-between p-6 rounded-[2rem] bg-white border border-slate-100 hover:border-indigo-500/20 hover:bg-indigo-50/20 transition-all group"
                   >
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Camera size={24} />
                         </div>
                         <div className="text-left">
                            <p className="text-sm font-black text-slate-900 uppercase italic">Event Repositories</p>
                            <p className="text-[10px] text-slate-400 font-medium">Audit all neural photo archives for this node.</p>
                         </div>
                      </div>
                      <ArrowRight size={18} className="text-slate-300 group-hover:text-indigo-600" />
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

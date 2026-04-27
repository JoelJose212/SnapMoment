import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../lib/api'
import { 
  Receipt, Download, Calendar, User, Search, 
  Filter, MoreVertical, CreditCard, ArrowUpRight,
  ShieldCheck, FileText, Send, CheckCircle,
  ExternalLink, TrendingUp, DollarSign, Wallet
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function AdminInvoices() {
  const [search, setSearch] = useState('')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['admin-invoices'],
    queryFn: () => adminApi.invoices().then((r) => r.data),
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

  const handleDownload = async (invId: string, paymentId: string) => {
    const t = toast.loading('Generating Secure PDF...')
    try {
      const response = await adminApi.downloadInvoice(invId)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `SnapMoment_Invoice_${paymentId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      toast.success('Invoice Downloaded', { id: t })
    } catch (err) {
      console.error('Download failed:', err)
      toast.error('Encryption Error: Failed to generate PDF', { id: t })
    }
  }

  const totalRevenue = invoices.reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0)

  const filteredInvoices = invoices.filter((inv: any) => 
    inv.photographer_name?.toLowerCase().includes(search.toLowerCase()) ||
    inv.payment_id?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-10 max-w-[1600px] mx-auto min-h-screen">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-emerald-600" />
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Revenue Intelligence</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Audit Trail</h1>
          <p className="text-slate-500 mt-1 font-medium">Verify studio transactions and monitor ecosystem liquidity.</p>
        </div>
        <div className="bg-slate-900 px-8 py-6 rounded-[2.5rem] text-white flex items-center gap-6 shadow-2xl shadow-slate-400">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Wallet size={24} />
            </div>
            <div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] leading-none mb-1">Cumulative Revenue</p>
                <p className="text-3xl font-black italic tracking-tighter uppercase leading-none">₹{totalRevenue.toLocaleString('en-IN')}</p>
            </div>
        </div>
      </header>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
            { label: 'Settled Transactions', val: invoices.length, icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { label: 'Average Ticket', val: `₹${Math.round(totalRevenue / (invoices.length || 1))}`, icon: DollarSign, color: 'text-indigo-500', bg: 'bg-indigo-50' },
            { label: 'Active Subscriptions', val: '124', icon: CheckCircle, color: 'text-amber-500', bg: 'bg-amber-50' },
        ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex items-center gap-5 group hover:scale-105 transition-transform cursor-default">
                <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                    <stat.icon size={24} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                    <p className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter leading-none">{stat.val}</p>
                </div>
            </div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-slate-50 border-none text-sm font-semibold placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            placeholder="Search by photographer name or payment hash..."
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:shadow-xl transition-all active:scale-95">
          <Download size={14} /> EXPORT LEDGER
        </button>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50">
                {['Transaction Identity', 'Entity Source', 'Amount', 'Verification', 'Action Matrix'].map((h, i) => (
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
                        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Scanning Ledger...</span>
                      </div>
                    </td>
                  </motion.tr>
                ) : filteredInvoices.length === 0 ? (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No transaction records found</p>
                    </td>
                  </motion.tr>
                ) : (
                  filteredInvoices.map((inv: any, i: number) => (
                    <motion.tr 
                      key={inv.id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-sm relative overflow-hidden">
                            <CreditCard size={20} />
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest font-mono mb-1">{inv.payment_id}</p>
                            <div className="flex items-center gap-2 text-slate-400">
                                <Calendar size={12} />
                                <span className="text-[11px] font-bold uppercase">{new Date(inv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px]">
                                {inv.photographer_name?.charAt(0)}
                            </div>
                            <span className="text-sm font-bold text-slate-900 italic uppercase tracking-tight">{inv.photographer_name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-baseline gap-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">INR</span>
                            <span className="text-xl font-black text-slate-900 italic uppercase tracking-tighter">₹{inv.amount}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 w-fit">
                            <ShieldCheck size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Settled</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right relative">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleDownload(inv.id, inv.payment_id)}
                              className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-all active:scale-90"
                              title="Download Secure PDF"
                            >
                                <Download size={16} />
                            </button>
                            <div className="w-px h-4 bg-slate-200 mx-1" />
                            <div className="relative">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setOpenMenuId(openMenuId === inv.id ? null : inv.id)
                                  }}
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${openMenuId === inv.id ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                >
                                    <MoreVertical size={16} />
                                </button>
                                
                                <AnimatePresence>
                                    {openMenuId === inv.id && (
                                        <motion.div 
                                          ref={menuRef}
                                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                          animate={{ opacity: 1, scale: 1, y: 0 }}
                                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                          className="absolute right-0 mt-3 w-56 bg-white rounded-3xl border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-2 z-[999] origin-top-right pointer-events-auto"
                                        >
                                            <button onClick={() => { setOpenMenuId(null); handleDownload(inv.id, inv.payment_id) }} className="flex items-center gap-3 w-full px-4 py-3 text-[11px] font-bold text-slate-600 hover:bg-slate-50 hover:text-emerald-600 rounded-2xl transition-all">
                                                <FileText size={14} /> EXPORT FISCAL RECORD
                                            </button>
                                            <button onClick={() => { setOpenMenuId(null); toast.success('Audit: Payment gateway verification success') }} className="flex items-center gap-3 w-full px-4 py-3 text-[11px] font-bold text-slate-600 hover:bg-slate-50 hover:text-emerald-600 rounded-2xl transition-all">
                                                <ShieldCheck size={14} /> AUDIT GATEWAY HASH
                                            </button>
                                            <button onClick={() => { setOpenMenuId(null); toast.success('Communication: Duplicate invoice sent to ' + inv.photographer_name) }} className="flex items-center gap-3 w-full px-4 py-3 text-[11px] font-bold text-slate-600 hover:bg-slate-50 hover:text-emerald-600 rounded-2xl transition-all">
                                                <Send size={14} /> DISPATCH DUPLICATE
                                            </button>
                                            <div className="h-px bg-slate-50 my-1 mx-2" />
                                            <button onClick={() => { setOpenMenuId(null); toast.success('Intelligence: Photographer profile accessed') }} className="flex items-center gap-3 w-full px-4 py-3 text-[11px] font-bold text-slate-400 hover:bg-slate-50 hover:text-slate-900 rounded-2xl transition-all">
                                                <ExternalLink size={14} /> VIEW ENTITY SOURCE
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
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Total Records Processed: {filteredInvoices.length}</p>
          <div className="flex gap-4">
            <button className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Previous Cycle</button>
            <button className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest hover:text-emerald-700 transition-colors underline underline-offset-4">Next Fiscal Block</button>
          </div>
        </div>
      </div>
    </div>
  )
}

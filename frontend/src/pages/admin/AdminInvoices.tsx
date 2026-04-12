import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../lib/api'
import { Receipt, Download, Calendar, User, Search } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AdminInvoices() {
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['admin-invoices'],
    queryFn: () => adminApi.invoices().then((r) => r.data),
  })

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8"
    >
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
            <Receipt size={14} /> Revenue Tracking
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground" style={{ fontFamily: '"Plus Jakarta Sans"' }}>Invoices</h1>
          <p className="text-muted font-medium mt-1">Audit trail for all studio transactions</p>
        </div>
      </div>

      <div className="rounded-3xl overflow-hidden glass shadow-2xl border-white/20">
        <table className="w-full">
          <thead>
            <tr className="bg-black/5 dark:bg-white/5">
              {['Date', 'Photographer', 'Payment ID', 'Amount', 'Status', 'Download'].map((h) => (
                <th key={h} className="text-left px-6 py-4 text-xs font-bold text-subtle uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-20 animate-pulse">Scanning records...</td></tr>
            ) : invoices.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-20 text-muted italic">No invoices found</td></tr>
            ) : (
              invoices.map((inv: any) => (
                <tr key={inv.id} className="border-t border-black/5 dark:border-white/5 hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Calendar size={14} className="text-primary" />
                      <span className="text-sm font-bold">{new Date(inv.created_at).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full aurora-bg flex items-center justify-center text-white text-[10px] font-bold">
                        {inv.photographer_id.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm font-semibold">{inv.photographer_id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <code className="text-[10px] font-bold bg-black/5 dark:bg-white/10 px-2 py-1 rounded-lg opacity-60">
                      {inv.payment_id}
                    </code>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-black text-foreground">₹{inv.amount}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <a 
                      href={inv.pdf_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-lg hover:shadow-coral transition-all"
                    >
                      <Download size={16} />
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

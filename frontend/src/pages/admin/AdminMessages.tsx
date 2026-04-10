import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api'
import { Mail, Trash2, CheckCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminMessages() {
  const qc = useQueryClient()

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: () => adminApi.messages().then((r) => r.data),
  })

  const resolveMutation = useMutation({
    mutationFn: (id: string) => adminApi.resolveMessage(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-messages'] }); toast.success('Message marked as resolved') },
    onError: () => toast.error('Failed to resolve message'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteMessage(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-messages'] }); toast.success('Message deleted') },
    onError: () => toast.error('Failed to delete message'),
  })

  return (
    <div className="p-8">
      <h1 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 32, color: 'var(--foreground)', marginBottom: 24 }}>Messages</h1>

      <div className="rounded-3xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: 'var(--background)' }}>
              {['From', 'Subject', 'Message', 'Date', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-10 text-sm text-text-muted">Loading messages...</td></tr>
            ) : messages.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16">
                  <div className="flex flex-col items-center justify-center text-text-muted gap-3">
                    <Mail size={48} className="opacity-20" />
                    <p className="text-sm">No messages or inquiries found.</p>
                  </div>
                </td>
              </tr>
            ) : (
              messages.map((m: any) => (
                <tr key={m.id} className={`border-t border-border transition-colors ${m.is_resolved ? 'bg-bg-grey opacity-75' : 'hover:bg-bg-cream'}`}>
                  <td className="px-5 py-4">
                    <div className="text-sm font-medium text-text-main">{m.name}</div>
                    <div className="text-xs text-text-muted mt-0.5">{m.email}</div>
                  </td>
                  <td className="px-5 py-4 text-sm text-text-main font-medium">{m.subject || 'No Subject'}</td>
                  <td className="px-5 py-4 text-sm text-text-muted max-w-xs truncate">{m.message}</td>
                  <td className="px-5 py-4 text-sm text-text-muted">{new Date(m.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-4">
                    {m.is_resolved ? (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 px-2.5 py-1 rounded-full bg-green-50 w-fit">
                        <CheckCircle size={14} /> Resolved
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 px-2.5 py-1 rounded-full bg-amber-50 w-fit">
                        <Clock size={14} /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {!m.is_resolved && (
                        <button
                          onClick={() => resolveMutation.mutate(m.id)}
                          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium text-white transition-all hover:shadow-indigo-sm"
                          style={{ background: '#67568C' }}
                        >
                          <CheckCircle size={12} /> Resolve
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this message permanently?')) {
                            deleteMutation.mutate(m.id)
                          }
                        }}
                        className="p-1.5 rounded-lg transition-colors text-text-muted hover:bg-red-50 hover:text-red-500"
                        title="Delete Message"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

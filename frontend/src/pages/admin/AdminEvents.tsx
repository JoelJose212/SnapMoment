import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api'
import { Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminEvents() {
  const qc = useQueryClient()
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => adminApi.events().then((r) => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteEvent(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-events'] }); toast.success('Event deleted') },
  })

  return (
    <div className="p-8">
      <h1 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 32, color: 'var(--foreground)', marginBottom: 24 }}>All Events</h1>
      <div className="rounded-3xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: 'var(--background)' }}>
              {['Event Name', 'Photographer', 'Type', 'Date', 'Status', ''].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-10 text-sm text-text-muted">Loading...</td></tr>
            ) : events.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-sm text-text-muted">No events</td></tr>
            ) : (
              events.map((event: any) => (
                <tr key={event.id} className="border-t border-border hover:bg-bg-cream transition-colors">
                  <td className="px-5 py-4 text-sm font-medium text-text-main max-w-[200px] truncate">{event.name}</td>
                  <td className="px-5 py-4 text-sm text-text-muted">{event.photographer_name}</td>
                  <td className="px-5 py-4">
                    <span className="text-xs px-2.5 py-1 rounded-full capitalize" style={{ background: 'var(--background)', color: '#FF6E6C' }}>{event.type}</span>
                  </td>
                  <td className="px-5 py-4 text-xs text-text-muted">{event.event_date ? new Date(event.event_date).toLocaleDateString('en-IN') : '—'}</td>
                  <td className="px-5 py-4">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: event.is_active ? '#F0FDF4' : '#F9FAFB', color: event.is_active ? '#00C48C' : '#A394A8' }}>
                      {event.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => { if (confirm('Force delete this event?')) deleteMutation.mutate(event.id) }} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-red-100" style={{ background: '#FFF5F5' }}>
                      <Trash2 size={14} color="#FF4B4B" />
                    </button>
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

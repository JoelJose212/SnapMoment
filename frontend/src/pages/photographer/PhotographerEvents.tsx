import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, QrCode, Upload, Trash2, ToggleLeft, ToggleRight, Calendar, Image, Users, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { eventsApi } from '../../lib/api'

const EVENT_TYPES = ['wedding', 'birthday', 'college', 'corporate', 'anniversary', 'other']

export default function PhotographerEvents() {
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'wedding', event_date: '', location: '', description: '' })

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['photographer-events'],
    queryFn: () => eventsApi.list().then((r) => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => eventsApi.create(data),
    onSuccess: (res) => {
      qc.setQueryData(['photographer-events'], (old: any[]) => [res.data, ...(old || [])])
      toast.success('Event created! 🎉')
      setShowModal(false)
      setForm({ name: '', type: 'wedding', event_date: '', location: '', description: '' })
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Failed to create event'),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: any) => eventsApi.update(id, { is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['photographer-events'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => eventsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['photographer-events'] })
      toast.success('Event deleted')
    },
  })

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 32, color: 'var(--foreground)' }}>My Events</h1>
          <p className="text-sm text-text-muted mt-1">{events.length} event{events.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-coral hover:scale-105"
          style={{ background: 'linear-gradient(135deg,#FF6E6C,#67568C)' }}
        >
          <Plus size={16} /> New Event
        </button>
      </div>

      {/* Events grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton rounded-3xl" style={{ height: 200 }} />)}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20">
          <Calendar size={48} color="#A394A8" className="mx-auto mb-4 opacity-50" />
          <h3 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 24, color: 'var(--foreground)' }}>No events yet</h3>
          <p className="text-sm text-text-muted mt-2">Create your first event to get started</p>
          <button onClick={() => setShowModal(true)} className="mt-5 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-coral" style={{ background: 'linear-gradient(135deg,#FF6E6C,#67568C)' }}>
            Create Event
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {events.map((event: any) => (
            <div key={event.id} className="rounded-3xl p-6 transition-all hover:shadow-card" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full capitalize" style={{ background: 'var(--background)', color: '#FF6E6C' }}>{event.type}</span>
                  <h3 className="font-semibold text-text-main mt-2 leading-snug">{event.name}</h3>
                  {event.location && <p className="text-xs text-text-muted mt-0.5">{event.location}</p>}
                </div>
                <button onClick={() => toggleMutation.mutate({ id: event.id, is_active: !event.is_active })}>
                  {event.is_active ? <ToggleRight size={24} color="#FF6E6C" /> : <ToggleLeft size={24} color="#A394A8" />}
                </button>
              </div>
              <div className="flex gap-4 text-xs text-text-muted mb-5">
                <span className="flex items-center gap-1"><Image size={12} />{event.photo_count} photos</span>
                <span className="flex items-center gap-1"><Users size={12} />{event.guest_count} guests</span>
              </div>
              <div className="flex gap-2">
                <Link to={`/photographer/events/${event.id}/upload`} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:bg-coral-600" style={{ background: '#FF6E6C' }}>
                  <Upload size={12} />Upload
                </Link>
                <Link to={`/photographer/events/${event.id}/qr`} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-coral-50" style={{ background: 'var(--background)', color: '#FF6E6C' }}>
                  <QrCode size={12} />QR Code
                </Link>
                <button onClick={() => { if (confirm('Delete this event?')) deleteMutation.mutate(event.id) }} className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors hover:bg-red-100" style={{ background: '#FFF5F5' }}>
                  <Trash2 size={14} color="#FF4B4B" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md rounded-3xl p-8" style={{ background: 'var(--card)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 26, color: 'var(--foreground)' }}>New Event</h2>
              <button onClick={() => setShowModal(false)}><X size={20} color="#A394A8" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form) }} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-text-main block mb-1.5">Event Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border text-sm outline-none focus:border-primary" placeholder="Sharma-Patel Wedding" style={{ background: 'var(--background)' }} required />
              </div>
              <div>
                <label className="text-sm font-medium text-text-main block mb-1.5">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border text-sm outline-none focus:border-primary capitalize" style={{ background: 'var(--background)' }}>
                  {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-text-main block mb-1.5">Event Date</label>
                <input type="datetime-local" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border text-sm outline-none focus:border-primary" style={{ background: 'var(--background)' }} />
              </div>
              <div>
                <label className="text-sm font-medium text-text-main block mb-1.5">Location</label>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border text-sm outline-none focus:border-primary" placeholder="Mumbai, Maharashtra" style={{ background: 'var(--background)' }} />
              </div>
              <button type="submit" disabled={createMutation.isPending} className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-coral disabled:opacity-60 mt-2" style={{ background: 'linear-gradient(135deg,#FF6E6C,#67568C)' }}>
                {createMutation.isPending ? 'Creating...' : 'Create Event'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

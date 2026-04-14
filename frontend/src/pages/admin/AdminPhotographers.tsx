import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api'
import { Search, CheckCircle, XCircle, ToggleRight, ToggleLeft, Shield, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import ConfirmModal from '../../components/shared/ConfirmModal'

export default function AdminPhotographers() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('')
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

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => adminApi.updatePhotographer(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-photographers'] }); toast.success('Updated!') },
    onError: () => toast.error('Update failed'),
  })

  const suspendMutation = useMutation({
    mutationFn: (id: string) => adminApi.suspendPhotographer(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-photographers'] }); toast.success('Account suspended') },
    onError: () => toast.error('Failed to suspend account'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deletePhotographer(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-photographers'] }); toast.success('Photographer deleted') },
    onError: () => toast.error('Failed to delete photographer'),
  })

  const handleDelete = (id: string, name: string) => {
    setModal({
      isOpen: true,
      title: 'Delete Photographer?',
      message: `Are you sure you want to delete ${name}? This action will permanently remove their access and all associated data.`,
      confirmText: 'Delete Permanently',
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
      title: 'Suspend Account?',
      message: `Suspend ${name}? This will hide all their event data from guests until you manually reactivate the account.`,
      confirmText: 'Suspend Account',
      type: 'warning',
      onConfirm: () => {
        suspendMutation.mutate(id)
        setModal(prev => ({ ...prev, isOpen: false }))
      }
    })
  }

  return (
    <div className="p-8">
      <h1 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 32, color: 'var(--foreground)', marginBottom: 24 }}>Photographers</h1>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} color="#A394A8" className="absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border text-sm outline-none focus:border-primary"
            placeholder="Search name or email..."
            style={{ background: 'var(--card)' }}
          />
        </div>
        <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-border text-sm outline-none focus:border-primary" style={{ background: 'var(--card)' }}>
          <option value="">All Plans</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="studio">Studio</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-3xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: 'var(--background)' }}>
              {['Name', 'Email', 'Plan', 'Verified', 'Active', 'Actions'].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-10 text-sm text-text-muted">Loading...</td></tr>
            ) : photographers.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-sm text-text-muted">No photographers found</td></tr>
            ) : (
              photographers.map((p: any) => (
                <tr key={p.id} className="border-t border-border hover:bg-bg-cream transition-colors">
                  <td className="px-5 py-4 text-sm font-medium text-text-main">{p.full_name}</td>
                  <td className="px-5 py-4 text-sm text-text-muted">{p.email}</td>
                  <td className="px-5 py-4">
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium capitalize" style={{ background: p.plan === 'studio' ? '#1A1A24' : p.plan === 'pro' ? 'var(--background)' : '#F0FDF4', color: p.plan === 'studio' ? '#FF6E6C' : p.plan === 'pro' ? '#67568C' : '#00C48C' }}>{p.plan}</span>
                  </td>
                  <td className="px-5 py-4">
                    {p.is_verified ? <CheckCircle size={16} color="#00C48C" /> : <XCircle size={16} color="#D1D5DB" />}
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => updateMutation.mutate({ id: p.id, data: { is_active: !p.is_active } })}>
                      {p.is_active ? <ToggleRight size={22} color="#FF6E6C" /> : <ToggleLeft size={22} color="#D1D5DB" />}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {!p.is_verified && (
                        <button
                          onClick={() => updateMutation.mutate({ id: p.id, data: { is_verified: true } })}
                          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium text-white transition-all hover:shadow-indigo-sm"
                          style={{ background: '#67568C' }}
                        >
                          <Shield size={12} />Verify
                        </button>
                      )}
                      <button
                        onClick={() => handleSuspend(p.id, p.full_name)}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium bg-amber-500 text-white transition-all hover:bg-amber-600"
                        title="Suspend Account"
                      >
                        <XCircle size={12} /> Suspend
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.full_name)}
                        className="p-1.5 rounded-lg transition-colors text-text-muted hover:bg-red-50 hover:text-red-500"
                        title="Delete Photographer"
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
    </div>
  )
}

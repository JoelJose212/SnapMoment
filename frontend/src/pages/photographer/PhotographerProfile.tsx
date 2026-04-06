import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

export default function PhotographerProfile() {
  const { fullName } = useAuthStore()
  const [form, setForm] = useState({ full_name: fullName || '', studio_name: '', phone: '' })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Profile updated! (UI mock — no backend save needed for profile in basic flow)')
  }

  return (
    <div className="p-8 max-w-xl">
      <h1 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 32, color: 'var(--foreground)', marginBottom: 24 }}>Profile</h1>
      <div className="rounded-3xl p-8" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <form onSubmit={handleSave} className="space-y-4">
          {[
            { label: 'Full Name', key: 'full_name', placeholder: 'Rohan Mehta' },
            { label: 'Studio Name', key: 'studio_name', placeholder: 'Rohan Mehta Studios' },
            { label: 'Phone', key: 'phone', placeholder: '+91 98765 43210' },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="text-sm font-medium text-text-main block mb-1.5">{label}</label>
              <input
                value={(form as any)[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border text-sm outline-none focus:border-primary"
                placeholder={placeholder}
                style={{ background: 'var(--background)' }}
              />
            </div>
          ))}
          <button type="submit" className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-coral" style={{ background: 'linear-gradient(135deg,#FF6E6C,#67568C)' }}>
            Save Changes
          </button>
        </form>
      </div>
    </div>
  )
}

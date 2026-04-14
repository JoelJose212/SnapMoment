import toast from 'react-hot-toast'

export default function AdminSettings() {
  return (
    <div className="p-8 max-w-xl">
      <h1 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: 32, color: 'var(--foreground)', marginBottom: 24 }}>Settings</h1>
      <div className="rounded-3xl p-8 space-y-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        {[
          { label: 'Platform Name', value: 'SnapMoment' },
          { label: 'Support Email', value: 'support@snapmoment.app' },
          { label: 'Max Photos/Event (Fresher)', value: '200' },
          { label: 'Max Photos/Event (Pro)', value: '2000' },
          { label: 'OTP Expiry (seconds)', value: '300' },
        ].map(({ label, value }) => (
          <div key={label}>
            <label className="text-sm font-medium text-text-main block mb-1.5">{label}</label>
            <input defaultValue={value} className="w-full px-4 py-3 rounded-xl border border-border text-sm outline-none focus:border-primary" style={{ background: 'var(--background)' }} />
          </div>
        ))}
        <button onClick={() => toast.success('Settings saved! (UI mock)')} className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-coral" style={{ background: 'linear-gradient(135deg,#FF6E6C,#67568C)' }}>
          Save Settings
        </button>
      </div>
    </div>
  )
}

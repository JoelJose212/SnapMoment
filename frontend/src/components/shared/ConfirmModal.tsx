import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, AlertTriangle, X } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
  loading?: boolean
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  loading = false
}: ConfirmModalProps) {
  const themes = {
    danger: {
      icon: <AlertTriangle className="text-red-500" size={24} />,
      btn: 'bg-red-500 hover:bg-red-600 shadow-red-100',
      light: 'bg-red-50'
    },
    warning: {
      icon: <AlertCircle className="text-amber-500" size={24} />,
      btn: 'bg-amber-500 hover:bg-amber-600 shadow-amber-100',
      light: 'bg-amber-50'
    },
    info: {
      icon: <AlertCircle className="text-blue-500" size={24} />,
      btn: 'bg-blue-500 hover:bg-blue-600 shadow-blue-100',
      light: 'bg-blue-50'
    }
  }

  const theme = themes[type]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl shadow-2xl"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${theme.light}`}>
                  {theme.icon}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl transition-colors hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: '"Plus Jakarta Sans"', color: 'var(--foreground)' }}>
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                  {message}
                </p>
              </div>

              {/* Footer / Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-6 py-3 rounded-2xl text-sm font-bold border border-gray-200 transition-all hover:bg-gray-50 active:scale-95 disabled:opacity-50"
                  style={{ color: 'var(--foreground)' }}
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className={`flex-1 px-6 py-3 rounded-2xl text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 ${theme.btn}`}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    confirmText
                  )}
                </button>
              </div>
            </div>

            {/* Accent Bar */}
            <div className={`h-1.5 w-full ${theme.btn.split(' ')[0]}`} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

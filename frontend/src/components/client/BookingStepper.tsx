import React from 'react'
import { motion } from 'framer-motion'
import { Check, Clock, ShieldCheck, Camera, Sparkles } from 'lucide-react'

export type BookingPhase = 'pending' | 'confirmed' | 'disputed' | 'cancelled' | 'completed'

interface BookingStepperProps {
  status: BookingPhase
}

const PHASES = [
  { id: 'request', label: 'Inquiry Sent', icon: Clock, color: 'bg-blue-500' },
  { id: 'review', label: 'Artist Review', icon: Camera, color: 'bg-amber-500' },
  { id: 'locked', label: 'Elite Locked', icon: ShieldCheck, color: 'bg-emerald-500' },
  { id: 'delivery', label: 'Masterpiece', icon: Sparkles, color: 'bg-purple-500' },
]

export default function BookingStepper({ status }: BookingStepperProps) {
  const getActiveIndex = () => {
    if (status === 'pending') return 1
    if (status === 'confirmed') return 2
    if (status === 'completed') return 4
    return 0
  }

  const activeIndex = getActiveIndex()

  return (
    <div className="w-full py-8">
      <div className="relative flex justify-between">
        {/* Progress Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(activeIndex / (PHASES.length - 1)) * 100}%` }}
            className="h-full bg-gradient-to-r from-primary to-emerald-500"
          />
        </div>

        {PHASES.map((phase, index) => {
          const Icon = phase.icon
          const isCompleted = index < activeIndex
          const isActive = index === activeIndex
          const isFuture = index > activeIndex

          return (
            <div key={phase.id} className="relative z-10 flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.2 : 1,
                  backgroundColor: isCompleted ? '#10B981' : isActive ? '#000' : '#F1F5F9',
                  color: isCompleted || isActive ? '#FFF' : '#94A3B8'
                }}
                className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center shadow-xl transition-colors duration-500 ${
                  isActive ? 'shadow-primary/30' : 'shadow-slate-200/50'
                }`}
              >
                {isCompleted ? <Check size={20} /> : <Icon size={20} />}
              </motion.div>
              
              <div className="mt-4 text-center">
                <p className={`text-[10px] font-black uppercase tracking-widest ${
                  isActive ? 'text-slate-900' : 'text-slate-400'
                }`}>
                  {phase.label}
                </p>
                {isActive && (
                  <motion.div 
                    layoutId="active-dot"
                    className="w-1.5 h-1.5 bg-primary rounded-full mx-auto mt-2 animate-pulse"
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {status === 'cancelled' && (
        <div className="mt-12 p-6 bg-red-50 rounded-[2rem] border border-red-100 text-center">
          <p className="text-red-600 font-black uppercase tracking-widest text-[10px]">Transmission Terminated</p>
          <p className="text-red-500 font-medium text-sm mt-1">This booking request has been cancelled or rejected.</p>
        </div>
      )}

      {status === 'disputed' && (
        <div className="mt-12 p-6 bg-orange-50 rounded-[2rem] border border-orange-100 text-center">
          <p className="text-orange-600 font-black uppercase tracking-widest text-[10px]">Protocol: Disputed</p>
          <p className="text-orange-500 font-medium text-sm mt-1">Our Elite Concierge team is currently mediating this request.</p>
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, MessageSquare, Calendar, Check, Trash2, X, Sparkles, ShieldCheck } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationApi } from '../../lib/api'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'

interface Notification {
  id: string
  type: 'message' | 'booking' | 'system'
  title: string
  content: string
  link?: string
  is_read: boolean
  created_at: string
}

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await notificationApi.get()
      return res.data as Notification[]
    },
    refetchInterval: 30000 // Poll every 30s
  })

  const unreadCount = notifications.filter(n => !n.is_read).length

  const markRead = useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id, true),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  })

  const markAllRead = useMutation({
    mutationFn: () => notificationApi.readAll(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  })

  const removeNotif = useMutation({
    mutationFn: (id: string) => notificationApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  })

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/20 transition-all shadow-sm group"
      >
        <Bell size={20} className={unreadCount > 0 ? 'animate-swing' : ''} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg shadow-primary/20">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for closing */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-4 w-80 md:w-96 bg-white rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-50 origin-top-right"
            >
              <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div>
                   <h3 className="text-sm font-black text-slate-900 uppercase italic tracking-tighter">Notification Hub</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Updates on your visual story</p>
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={() => markAllRead.mutate()}
                    className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div 
                      key={n.id}
                      className={`p-6 border-b border-slate-50 flex gap-4 transition-colors relative group ${!n.is_read ? 'bg-primary/5' : 'hover:bg-slate-50'}`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        n.type === 'message' ? 'bg-emerald-50 text-emerald-500' : 
                        n.type === 'booking' ? 'bg-primary/10 text-primary' : 
                        'bg-slate-100 text-slate-400'
                      }`}>
                        {n.type === 'message' ? <MessageSquare size={18} /> : 
                         n.type === 'booking' ? <Calendar size={18} /> : 
                         <Sparkles size={18} />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className={`text-xs font-black uppercase tracking-tighter truncate ${!n.is_read ? 'text-slate-900' : 'text-slate-500'}`}>
                            {n.title}
                          </p>
                          <span className="text-[8px] font-bold text-slate-400 uppercase">
                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed mb-3">
                          {n.content}
                        </p>
                        
                        <div className="flex items-center gap-4">
                           {n.link && (
                             <Link 
                               to={n.link}
                               onClick={() => {
                                 markRead.mutate(n.id)
                                 setIsOpen(false)
                               }}
                               className="text-[9px] font-black text-primary uppercase tracking-[0.15em] flex items-center gap-1 hover:gap-2 transition-all"
                             >
                               View Details <Check size={10} />
                             </Link>
                           )}
                           {!n.is_read && (
                             <button 
                               onClick={() => markRead.mutate(n.id)}
                               className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.15em]"
                             >
                               Mark Read
                             </button>
                           )}
                        </div>
                      </div>

                      <button 
                        onClick={() => removeNotif.mutate(n.id)}
                        className="absolute top-6 right-6 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-slate-200 mx-auto mb-4">
                      <Bell size={32} />
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest italic">All Caught Up!</p>
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-slate-50/50 border-t border-slate-100">
                 <div className="flex items-center justify-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] text-slate-300">
                    <ShieldCheck size={10} /> Security Verified Channel
                 </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

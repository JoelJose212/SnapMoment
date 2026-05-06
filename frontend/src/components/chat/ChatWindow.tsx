import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, ExternalLink, Calendar, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean
  created_at: string
}

interface ChatWindowProps {
  messages: Message[]
  currentUserId: string
  otherUserName: string
  otherUserId: string
  isLoading: boolean
}

export default function ChatWindow({ messages, currentUserId, otherUserName, otherUserId, isLoading }: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/30">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Securing Connection...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50/30 overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 shadow-inner font-black text-lg">
            {otherUserName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-900 uppercase italic tracking-tighter leading-none">{otherUserName}</h3>
              <div className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                <ShieldCheck size={10} /> Verified Artist
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Studio</span>
            </div>
          </div>
        </div>

        <Link 
          to={`/photographers/${otherUserId}`}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-slate-300"
        >
          View Profile <ExternalLink size={12} />
        </Link>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6">
        {messages.length > 0 ? messages.map((msg, i) => {
          const isMe = msg.sender_id === currentUserId
          const prevMsg = messages[i-1]
          const showAvatar = !prevMsg || prevMsg.sender_id !== msg.sender_id

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isMe && (
                  <div className={`w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-black shrink-0 shadow-inner ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                    {otherUserName.charAt(0)}
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <div className={`px-6 py-4 rounded-[1.5rem] text-sm font-medium shadow-sm ${
                    isMe 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                  <span className={`text-[9px] font-bold text-slate-400 uppercase tracking-widest ${isMe ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </motion.div>
          )
        }) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
            <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-slate-300 mb-6 shadow-xl">
              <Calendar size={40} />
            </div>
            <p className="text-sm font-black text-slate-900 uppercase italic tracking-tighter">New Masterpiece Awaits</p>
            <p className="text-xs font-medium text-slate-500 mt-2">Start your conversation about your upcoming story.</p>
          </div>
        )}
      </div>
    </div>
  )
}

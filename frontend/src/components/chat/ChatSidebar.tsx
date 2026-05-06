import { Search, MessageSquare, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

interface Conversation {
  other_user_id: string
  other_user_name: string
  last_message: string
  last_message_at: string
  unread_count: number
}

interface ChatSidebarProps {
  conversations: Conversation[]
  activeId?: string
  onSelect: (id: string) => void
  search: string
  onSearchChange: (val: string) => void
}

export default function ChatSidebar({ conversations, activeId, onSelect, search, onSearchChange }: ChatSidebarProps) {
  const filtered = conversations.filter(c => 
    c.other_user_name.toLowerCase().includes(search.toLowerCase()) ||
    c.last_message.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="w-80 border-r border-slate-100 flex flex-col bg-white/50 backdrop-blur-xl h-full">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter mb-6">Conversations</h2>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search artists..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary transition-all text-sm font-medium"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
        {filtered.length > 0 ? filtered.map((c) => (
          <motion.button
            key={c.other_user_id}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(c.other_user_id)}
            className={`w-full p-4 rounded-[1.5rem] flex items-start gap-4 transition-all text-left group ${
              activeId === c.other_user_id 
              ? 'bg-slate-900 text-white shadow-xl shadow-slate-300' 
              : 'hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100'
            }`}
          >
            <div className="relative shrink-0">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black uppercase tracking-tighter ${
                activeId === c.other_user_id ? 'bg-primary/20 text-primary' : 'bg-slate-100 text-slate-400'
              }`}>
                {c.other_user_name.charAt(0)}
              </div>
              {c.unread_count > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white">
                  {c.unread_count}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className={`font-black text-sm uppercase tracking-tighter truncate ${activeId === c.other_user_id ? 'text-white' : 'text-slate-900'}`}>
                  {c.other_user_name}
                </span>
                <span className={`text-[10px] font-bold ${activeId === c.other_user_id ? 'text-white/40' : 'text-slate-400'}`}>
                  {new Date(c.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className={`text-xs font-medium truncate ${activeId === c.other_user_id ? 'text-white/60' : 'text-slate-400'}`}>
                {c.last_message || 'Start a conversation...'}
              </p>
            </div>
          </motion.button>
        )) : (
          <div className="flex flex-col items-center justify-center py-12 text-center px-6">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-4">
              <MessageSquare size={24} />
            </div>
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No chats found</p>
          </div>
        )}
      </div>
    </div>
  )
}

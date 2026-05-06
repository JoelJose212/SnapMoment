import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, Send, User, Search, 
  MoreVertical, Phone, Video, Info,
  ChevronLeft, Sparkles, CheckCheck, MapPin
} from 'lucide-react'
import { chatApi } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function PhotographerChatPage() {
  const [searchParams] = useSearchParams()
  const preselectedUserId = searchParams.get('id')
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedChat, setSelectedChat] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { userId } = useAuthStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  const fetchConversations = async () => {
    try {
      const res = await chatApi.getConversations()
      setConversations(res.data)
      
      // Auto-select chat if ID is provided in URL
      if (preselectedUserId && !selectedChat) {
        const target = res.data.find((c: any) => c.other_user_id === preselectedUserId)
        if (target) {
          setSelectedChat(target)
          fetchHistory(target.other_user_id)
        }
      }
    } catch (err) {
      console.error('Failed to fetch conversations')
    }
  }

  const fetchHistory = async (otherId: string) => {
    try {
      const res = await chatApi.getHistory(otherId)
      setMessages(res.data)
    } catch (err) {
      console.error('Failed to fetch history')
    }
  }

  useEffect(() => {
    fetchConversations()
    const interval = setInterval(() => {
      fetchConversations()
      if (selectedChat) fetchHistory(selectedChat.other_user_id)
    }, 5000)
    return () => clearInterval(interval)
  }, [selectedChat])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedChat) return
    try {
      await chatApi.sendMessage({
        receiver_id: selectedChat.other_user_id,
        content: newMessage
      })
      setNewMessage('')
      fetchHistory(selectedChat.other_user_id)
      fetchConversations()
    } catch (err) {
      toast.error('Failed to send message')
    }
  }

  const filteredConversations = conversations.filter(c => 
    c.other_user_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="h-[calc(100vh-180px)] flex gap-6">
      {/* --- Conversation List --- */}
      <div className="w-96 flex flex-col glass-card rounded-[2.5rem] overflow-hidden border-none shadow-xl shadow-slate-200/50">
        <div className="p-8 border-b border-slate-100">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 mb-6">Client Hub</h2>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:bg-white focus:border-primary/30 transition-all font-bold text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
          {filteredConversations.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-300">
               <MessageSquare size={48} strokeWidth={1} className="mb-4" />
               <p className="text-[10px] font-black uppercase tracking-widest">No Active Conversations</p>
            </div>
          ) : (
            filteredConversations.map((chat) => (
              <button
                key={chat.other_user_id}
                onClick={() => setSelectedChat(chat)}
                className={`w-full flex items-center gap-4 p-4 rounded-3xl transition-all ${
                  selectedChat?.other_user_id === chat.other_user_id 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black italic shadow-sm ${
                  selectedChat?.other_user_id === chat.other_user_id ? 'bg-white/20' : 'bg-slate-100 text-slate-400'
                }`}>
                  {chat.other_user_name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-black italic tracking-tight truncate pr-2">{chat.other_user_name}</h4>
                    <span className={`text-[8px] font-bold uppercase opacity-60 ${selectedChat?.other_user_id === chat.other_user_id ? 'text-white' : 'text-slate-400'}`}>
                      {new Date(chat.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={`text-xs truncate opacity-70 ${selectedChat?.other_user_id === chat.other_user_id ? 'text-white' : 'text-slate-400'}`}>
                      {chat.last_message}
                    </p>
                    {chat.unread_count > 0 && (
                      <span className="ml-2 w-5 h-5 rounded-full bg-accent text-white text-[10px] font-black flex items-center justify-center shadow-lg animate-bounce">
                        {chat.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* --- Chat Window --- */}
      <div className="flex-1 flex flex-col glass-card rounded-[2.5rem] overflow-hidden border-none shadow-xl shadow-slate-200/50">
        {selectedChat ? (
          <>
            {/* Header */}
            <div className="p-6 px-10 border-b border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-md">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center font-black italic text-xl shadow-lg shadow-primary/20">
                  {selectedChat.other_user_name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-black italic tracking-tighter uppercase text-slate-900">{selectedChat.other_user_name}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                       <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500">Client Online</span>
                    </div>
                    {selectedChat.other_user_location && (
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <MapPin size={10} className="text-primary" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">{selectedChat.other_user_location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <button className="h-11 w-11 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary transition-all border border-slate-100"><Phone size={18} /></button>
                 <button className="h-11 w-11 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary transition-all border border-slate-100"><Video size={18} /></button>
                 <button className="h-11 w-11 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary transition-all border border-slate-100"><Info size={18} /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-10 space-y-6 custom-scrollbar bg-slate-50/20" ref={scrollRef}>
              {messages.map((msg, i) => {
                const isMe = msg.sender_id === userId
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id} 
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] group`}>
                      <div className={`p-5 rounded-[2rem] shadow-sm font-medium text-sm leading-relaxed ${
                        isMe 
                          ? 'bg-primary text-white rounded-tr-none' 
                          : 'bg-white text-slate-900 border border-slate-100 rounded-tl-none'
                      }`}>
                        {msg.content}
                      </div>
                      <div className={`flex items-center gap-2 mt-2 px-2 text-[9px] font-bold uppercase ${isMe ? 'justify-end text-primary' : 'justify-start text-slate-400'}`}>
                         {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         {isMe && <CheckCheck size={12} className={msg.is_read ? 'text-primary' : 'text-slate-300'} />}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Input */}
            <div className="p-8 border-t border-slate-100 bg-white">
              <div className="flex items-center gap-4 bg-slate-50 rounded-[2rem] p-3 pl-8 border border-slate-100 focus-within:border-primary/30 transition-all shadow-inner">
                <input 
                  type="text" 
                  placeholder="Draft your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 bg-transparent border-none outline-none font-bold text-slate-900 placeholder:text-slate-300"
                />
                <button 
                  onClick={handleSend}
                  disabled={!newMessage.trim()}
                  className="px-8 py-4 rounded-2xl aurora-bg text-white font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  Dispatch <Send size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-20">
             <div className="w-32 h-32 rounded-[3rem] bg-primary/5 flex items-center justify-center text-primary mb-10 relative">
                <div className="absolute inset-0 rounded-[3rem] bg-primary/10 animate-ping opacity-20" />
                <Sparkles size={60} />
             </div>
             <h3 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 mb-4">Select a Connection</h3>
             <p className="max-w-md text-slate-400 font-medium leading-relaxed">
               Pick a client from the hub to continue your conversation. 
               All messages are private and secured with end-to-end encryption.
             </p>
          </div>
        )}
      </div>
    </div>
  )
}

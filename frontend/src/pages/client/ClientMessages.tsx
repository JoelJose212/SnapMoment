import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams, Link } from 'react-router-dom'
import { chatApi, bookingsApi } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import ChatSidebar from '../../components/chat/ChatSidebar'
import ChatWindow from '../../components/chat/ChatWindow'
import ChatInput from '../../components/chat/ChatInput'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Sparkles, ArrowLeft, ExternalLink } from 'lucide-react'

export default function ClientMessages() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeId = searchParams.get('id') || undefined
  const [search, setSearch] = useState('')
  const { userId, lastActiveChatId, setLastActiveChatId } = useAuthStore()
  const queryClient = useQueryClient()

  // Auto-redirect to last active chat if none selected
  useEffect(() => {
    if (!activeId && lastActiveChatId) {
      setSearchParams({ id: lastActiveChatId })
    }
  }, [activeId, lastActiveChatId, setSearchParams])

  // Save last active chat ID
  useEffect(() => {
    if (activeId) {
      setLastActiveChatId(activeId)
    }
  }, [activeId, setLastActiveChatId])

  // Fetch Conversations
  const { data: conversations = [], isLoading: isLoadingConvos } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await chatApi.getConversations()
      return res.data
    },
    refetchInterval: 10000 // Poll every 10s for list
  })

  // Fetch Active Chat History
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ['chat-history', activeId],
    queryFn: async () => {
      if (!activeId) return []
      const res = await chatApi.getHistory(activeId)
      return res.data
    },
    enabled: !!activeId,
    refetchInterval: 3000 // Poll every 3s for active chat
  })

  // Send Message Mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!activeId) return
      return chatApi.sendMessage({
        receiver_id: activeId,
        content
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-history', activeId] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    }
  })

  // Fetch Photographer Profile details if it's a new conversation or we need to resolve IDs
  const { data: activePhotographer } = useQuery({
    queryKey: ['photographer-mini', activeId],
    queryFn: async () => {
      if (!activeId) return null
      const res = await bookingsApi.getPhotographer(activeId)
      return res.data
    },
    enabled: !!activeId
  })

  // Find active conversation in the list
  // Note: activeId might be a Profile ID, while convo.other_user_id is always a User ID
  const activeConvo = conversations.find(c => 
    c.other_user_id === activeId || 
    (activeId && activePhotographer && c.other_user_id === activePhotographer.user_id)
  )

  // Merge current active photographer into conversations if they aren't already there
  const displayConversations = [...conversations]
  if (activeId && !activeConvo && activePhotographer) {
    displayConversations.unshift({
      other_user_id: activeId,
      other_user_name: activePhotographer.business_name,
      last_message: 'Starting new conversation...',
      last_message_at: new Date().toISOString(),
      unread_count: 0
    })
  }

  const otherName = activeConvo?.other_user_name || activePhotographer?.business_name || 'Photographer'

  // Notification logic for new messages
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1]
      // If the last message is from the other person and it's very recent
      const isNew = (new Date().getTime() - new Date(lastMsg.created_at).getTime()) < 5000
      if (lastMsg.sender_id === activeId && isNew && !lastMsg.is_read) {
        toast.success(`New message from ${otherName}`, {
          icon: '💬',
          duration: 4000,
          position: 'bottom-right'
        })
      }
    }
  }, [messages.length, activeId, otherName])

  return (
    <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-180px)] bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col md:flex-row relative">
      {/* Sidebar - Hidden on mobile when chat is active */}
      <div className={`w-full md:w-80 h-full ${activeId ? 'hidden md:flex' : 'flex'}`}>
        <ChatSidebar 
          conversations={displayConversations}
          activeId={activeId}
          onSelect={(id) => setSearchParams({ id })}
          search={search}
          onSearchChange={setSearch}
        />
      </div>

      {/* Main Chat Area - Visible on mobile when chat is active or no chat selected */}
      <div className={`flex-1 flex flex-col relative overflow-hidden ${!activeId ? 'hidden md:flex' : 'flex'}`}>
        {activeId ? (
          <>
            {/* Back button for mobile */}
            <button 
              onClick={() => setSearchParams({})}
              className="md:hidden absolute top-6 left-6 z-20 w-10 h-10 rounded-xl bg-white shadow-lg flex items-center justify-center text-slate-400"
            >
              <ArrowLeft size={18} />
            </button>
            <ChatWindow 
              messages={messages}
              currentUserId={userId || ''}
              otherUserName={otherName}
              otherUserId={activeId}
              isLoading={isLoadingMessages}
            />
            <ChatInput 
              onSend={(content) => sendMessageMutation.mutate(content)}
              disabled={sendMessageMutation.isPending}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-slate-50/30">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
            >
              <div className="w-32 h-32 bg-white rounded-[3rem] flex items-center justify-center text-slate-100 mb-8 shadow-2xl shadow-slate-200 relative z-10">
                <MessageSquare size={56} />
              </div>
              <div className="absolute inset-0 bg-primary/10 blur-[40px] rounded-full scale-150 animate-pulse" />
            </motion.div>
            <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter mb-4">
              Select a <span className="text-primary">Conversation</span>
            </h2>
            <p className="text-slate-500 font-bold max-w-sm mx-auto text-lg leading-relaxed mb-6">
              Connect with India's most elite photographers and start planning your visual masterpiece.
            </p>
            <div className="mt-10 flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
               <Sparkles size={14} className="text-primary" /> End-to-End Encryption Enabled
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

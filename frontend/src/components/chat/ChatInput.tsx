import { useState, useRef } from 'react'
import { Send, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

interface ChatInputProps {
  onSend: (content: string) => void
  disabled?: boolean
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [content, setContent] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (!content.trim() || disabled) return
    onSend(content.trim())
    setContent('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    // Auto-grow
    e.target.style.height = 'auto'
    e.target.style.height = `${e.target.scrollHeight}px`
  }

  return (
    <div className="px-8 py-6 bg-white border-t border-slate-100 relative z-10">
      <div className="relative flex items-end gap-4 max-w-5xl mx-auto">
        <div className="flex-1 relative group">
          <textarea
            ref={textareaRef}
            rows={1}
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            disabled={disabled}
            className="w-full pl-6 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium resize-none max-h-40 custom-scrollbar"
          />
          <div className="absolute right-4 bottom-4 text-slate-300 group-focus-within:text-primary transition-colors">
            <Sparkles size={16} />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={!content.trim() || disabled}
          className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all shadow-xl ${
            content.trim() && !disabled
            ? 'aurora-bg text-white shadow-primary/20'
            : 'bg-slate-100 text-slate-300 shadow-none grayscale'
          }`}
        >
          <Send size={20} />
        </motion.button>
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mt-4">
        Shift + Enter for new line • Instant Magic Matching enabled
      </p>
    </div>
  )
}

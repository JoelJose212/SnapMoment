import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Calendar, ShieldCheck, MapPin, 
  MessageSquare, ExternalLink, Download, FileText,
  X, Camera, Clock, Info
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingsApi } from '../../lib/api'
import BookingStepper, { BookingPhase } from '../../components/client/BookingStepper'
import toast from 'react-hot-toast'

export default function ClientEventDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [showAgreement, setShowAgreement] = useState(false)
  const queryClient = useQueryClient()

  const { data: event, isLoading } = useQuery({
    queryKey: ['client-event', id],
    queryFn: async () => {
      if (!id) return null
      const res = await bookingsApi.getEvent(id)
      return res.data
    },
    enabled: !!id
  })

  const disputeMutation = useMutation({
    mutationFn: (bookingId: string) => bookingsApi.disputeBooking(bookingId),
    onSuccess: () => {
      toast.success('Disagreement raised successfully. Support has been notified.')
      queryClient.invalidateQueries({ queryKey: ['client-event', id] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to raise disagreement')
    }
  })

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Synchronizing Neural Data...</p>
      </div>
    )
  }

  if (!event) return null

  const mainBooking = event.sub_events?.[0]
  const artistName = mainBooking?.photographer_name || 'Selecting Artist...'
  const bookingStatus = (mainBooking?.status || 'pending') as BookingPhase

  return (
    <div className="max-w-4xl mx-auto pb-20 p-6">
      <header className="flex items-center justify-between mb-12">
        <button 
          onClick={() => navigate('/client')}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest transition-all group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </button>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Hub: {event.event_title}</span>
        </div>
      </header>

      {/* Main Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden mb-8"
      >
        <div className="p-10 md:p-14">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic mb-4">{event.event_title}</h1>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2 text-slate-500">
                  <Calendar size={18} className="text-primary" />
                  <span className="font-bold text-sm uppercase tracking-tight">{new Date(event.event_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <MapPin size={18} className="text-primary" />
                  <span className="font-bold text-sm uppercase tracking-tight">{event.venue_name}, {event.district}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Assigned Artist</p>
               <p className="text-2xl font-black text-slate-900 italic tracking-tight">{artistName}</p>
            </div>
          </div>

          <div className="h-px bg-slate-100 w-full mb-12" />

          {/* Stepper */}
          <BookingStepper status={bookingStatus} />

          {/* Action Hub */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            <button 
              onClick={() => {
                if (mainBooking?.photographer?.user_id) {
                  navigate(`/client/messages?id=${mainBooking.photographer.user_id}`)
                } else {
                  toast.error('Artist communication bridge not yet established.')
                }
              }}
              className="flex items-center justify-between p-8 bg-slate-900 text-white rounded-[2.5rem] group hover:scale-[1.02] transition-all"
            >
              <div className="text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Communication Hub</p>
                <h3 className="text-lg font-black italic uppercase tracking-tight">Chat with {artistName.split(' ')[0]}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                <MessageSquare size={20} />
              </div>
            </button>

            <button 
              onClick={() => setShowAgreement(true)}
              className="flex items-center justify-between p-8 bg-white border border-slate-100 shadow-lg shadow-slate-100 rounded-[2.5rem] group hover:scale-[1.02] transition-all"
            >
              <div className="text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contractual Vault</p>
                <h3 className="text-lg font-black italic uppercase tracking-tight text-slate-900">Elite Agreement</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
                <FileText size={20} />
              </div>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Disagreement Section */}
      {bookingStatus === 'confirmed' && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-amber-500 shadow-sm">
              <Info size={24} />
            </div>
            <div>
              <h4 className="font-black text-slate-900 uppercase italic tracking-tight">Need to make changes?</h4>
              <p className="text-xs text-slate-500 font-medium">As this is an Elite Booking, direct cancellations are restricted. Our Concierge is here to help.</p>
            </div>
          </div>
          <button 
            disabled={disputeMutation.isPending}
            onClick={() => {
              if (window.confirm('Are you sure you want to raise a disagreement? Our support team will be notified to mediate.')) {
                if (mainBooking?.id) disputeMutation.mutate(mainBooking.id)
              }
            }}
            className="px-8 py-4 bg-white border border-amber-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-amber-600 hover:bg-amber-600 hover:text-white transition-all shadow-sm disabled:opacity-50"
          >
            {disputeMutation.isPending ? 'Notifying Support...' : 'Raise Disagreement'}
          </button>
        </motion.div>
      )}

      {/* Agreement Modal */}
      <AnimatePresence>
        {showAgreement && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAgreement(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-4 md:inset-20 bg-white rounded-[4rem] z-[60] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Elite Service Agreement</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference: {id?.slice(0, 8)}</p>
                  </div>
                </div>
                <button onClick={() => setShowAgreement(false)} className="w-12 h-12 rounded-full hover:bg-white flex items-center justify-center text-slate-400 transition-all">
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-10 md:p-16 space-y-8 text-slate-600 font-medium leading-relaxed">
                <section>
                  <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tight mb-4">1. The Elite Commitment</h3>
                  <p>
                    By initializing this booking with <strong>{artistName}</strong>, you have entered into a premium service contract. 
                    This artist has reserved the date of <strong>{new Date(event.event_date).toLocaleDateString()}</strong> exclusively for your vision.
                  </p>
                </section>
                <section>
                  <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tight mb-4">2. Professional Protection Policy</h3>
                  <p>
                    To ensure the highest level of professional discipline, direct client-side cancellations are restricted once a booking is "Elite Locked" (Confirmed). 
                    If circumstances require a change, you must initiate a formal "Disagreement Protocol" via our support concierge.
                  </p>
                </section>
                <section>
                  <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tight mb-4">3. Quality Guarantee</h3>
                  <p>
                    SnapMoment guarantees that your selected artist will deliver the masterpiece quality associated with their portfolio. 
                    Should any professional discrepancy occur, SnapMoment maintains a full mediation right to ensure client satisfaction.
                  </p>
                </section>
                <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Contract Status</p>
                    <p className="text-lg font-black text-slate-900">Digitally Executed & Verified</p>
                  </div>
                  <ShieldCheck size={40} className="text-primary opacity-20" />
                </div>
              </div>
              <div className="p-10 border-t border-slate-50 flex justify-end gap-4">
                 <button className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all active:scale-95">
                   <Download size={16} /> Export Legal PDF
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

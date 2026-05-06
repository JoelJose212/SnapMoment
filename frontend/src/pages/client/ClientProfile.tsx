import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clientApi } from '../../lib/api'
import { User, MapPin, Calendar, Smartphone, Mail, ShieldCheck, Camera, Loader2, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'

export default function ClientProfile() {
  const { fullName, email } = useAuthStore()
  const queryClient = useQueryClient()
  
  const [formData, setFormData] = useState({
    city: '',
    district: '',
    state: '',
    pincode: '',
    dob: '',
    gender: ''
  })

  const { data: profile, isLoading } = useQuery({
    queryKey: ['client-profile'],
    queryFn: async () => {
      const res = await clientApi.getProfile()
      setFormData({
        city: res.data.city || '',
        district: res.data.district || '',
        state: res.data.state || '',
        pincode: res.data.pincode || '',
        dob: res.data.dob || '',
        gender: res.data.gender || ''
      })
      return res.data
    }
  })

  const updateProfile = useMutation({
    mutationFn: async (data: any) => {
      // Clean up empty strings to null for date fields
      const payload = { ...data }
      if (!payload.dob) payload.dob = null
      const res = await clientApi.updateProfile(payload)
      return res.data
    },
    onSuccess: () => {
      toast.success('Profile updated successfully! 💎')
      queryClient.invalidateQueries({ queryKey: ['client-profile'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to update profile')
    }
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile.mutate(formData)
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-black italic tracking-tighter uppercase text-slate-900 mb-2">Personal Hub</h1>
        <p className="text-slate-500 font-medium">Manage your personal details and location preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Identity Card */}
        <div className="md:col-span-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card rounded-[2.5rem] p-8 text-center border-none shadow-xl shadow-slate-200/50 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2" />
            
            <div className="w-24 h-24 mx-auto rounded-[1.5rem] bg-white shadow-xl shadow-slate-200 p-1 mb-6 relative z-10 border border-slate-100">
               <img 
                 src={`https://api.dicebear.com/7.x/notionists/svg?seed=${fullName}`} 
                 className="w-full h-full object-cover rounded-[1.3rem]" 
                 alt="Avatar" 
               />
               <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  <Camera size={14} />
               </button>
            </div>

            <h2 className="text-2xl font-black uppercase tracking-tighter italic text-slate-900 mb-1">{profile?.full_name || fullName}</h2>
            <div className="flex items-center justify-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-6">
              <ShieldCheck size={12} /> Verified Client
            </div>

            <div className="space-y-4 text-left border-t border-slate-100 pt-6">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-2"><Mail size={10} /> Registered Email</p>
                <p className="text-sm font-bold text-slate-700 truncate">{profile?.email || email}</p>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-2"><Smartphone size={10} /> Phone Number</p>
                <p className="text-sm font-bold text-slate-700">{profile?.phone || 'Not Provided'}</p>
              </div>
            </div>
            
            <p className="text-[8px] font-bold text-slate-400 italic text-center mt-6">
              Identity details are secured and cannot be changed directly to prevent fraud. Contact support for changes.
            </p>
          </motion.div>
        </div>

        {/* Right Column: Editable Details */}
        <div className="md:col-span-2">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-[2.5rem] p-8 md:p-10 border-none shadow-xl shadow-slate-200/50"
          >
            <h3 className="text-xl font-black uppercase tracking-widest text-slate-900 mb-8 flex items-center gap-3">
              <MapPin size={20} className="text-primary" /> Location & Details
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">City</label>
                  <input 
                    type="text" 
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="E.g., Mumbai"
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary focus:bg-white outline-none font-bold text-slate-900 transition-all" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">District</label>
                  <input 
                    type="text" 
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="E.g., Mumbai Suburban"
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary focus:bg-white outline-none font-bold text-slate-900 transition-all" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">State</label>
                  <input 
                    type="text" 
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="E.g., Maharashtra"
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary focus:bg-white outline-none font-bold text-slate-900 transition-all" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Pincode</label>
                  <input 
                    type="text" 
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="E.g., 400050"
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary focus:bg-white outline-none font-bold text-slate-900 transition-all" 
                  />
                </div>
              </div>

              <div className="my-8 h-px bg-slate-100 w-full" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2"><Calendar size={12} /> Date of Birth</label>
                  <input 
                    type="date" 
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary focus:bg-white outline-none font-bold text-slate-900 transition-all" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2"><User size={12} /> Gender</label>
                  <select 
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary focus:bg-white outline-none font-bold text-slate-900 transition-all appearance-none"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  type="submit"
                  disabled={updateProfile.isPending}
                  className="px-10 py-4 rounded-2xl aurora-bg text-white font-black uppercase tracking-widest text-sm flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                  {updateProfile.isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Save Profile Updates
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

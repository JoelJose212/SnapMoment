import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronRight, 
  ChevronDown, 
  Search, 
  IndianRupee, 
  Plus, 
  Trash2, 
  Save, 
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { EVENT_TAXONOMY, Category, SubCategory } from '../../lib/eventTaxonomy'
import { photographerApi } from '../../lib/api'
import toast from 'react-hot-toast'

export default function PricingManager() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [mySpecializations, setMySpecializations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [priceInput, setPriceInput] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    fetchSpecializations()
  }, [])

  const fetchSpecializations = async () => {
    try {
      const res = await photographerApi.getSpecializations()
      setMySpecializations(res.data)
    } catch (err) {
      toast.error('Failed to load your services')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveService = async (category: string, subCategory: string) => {
    const price = priceInput[subCategory]
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      toast.error('Please enter a valid base price')
      return
    }

    const existing = mySpecializations.find(s => s.sub_category === subCategory)

    try {
      if (existing) {
        // Update
        await photographerApi.updateSpecialization(existing.id, {
          category,
          sub_category: subCategory,
          base_price: Number(price)
        })
        toast.success(`Updated ${subCategory} pricing!`)
      } else {
        // Add
        await photographerApi.addSpecialization({
          category,
          sub_category: subCategory,
          base_price: Number(price)
        })
        toast.success(`Added ${subCategory}!`)
      }
      fetchSpecializations()
      // Clear tick/input for new ones
      setTicked(prev => ({ ...prev, [subCategory]: false }))
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to save service')
    }
  }

  const handleRemoveService = async (id: string) => {
    try {
      await photographerApi.removeSpecialization(id)
      toast.success('Service removed')
      fetchSpecializations()
    } catch (err) {
      toast.error('Failed to remove service')
    }
  }

  const getExistingSpec = (subName: string) => {
    return mySpecializations.find(s => s.sub_category === subName)
  }

  const [ticked, setTicked] = useState<{ [key: string]: boolean }>({})

  const toggleTick = (subName: string) => {
    setTicked(prev => ({ ...prev, [subName]: !prev[subName] }))
  }

  const isAlreadyAdded = (subName: string) => {
    return mySpecializations.some(s => s.sub_category === subName)
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-black mb-4 uppercase italic tracking-tighter">Pricing & Services</h1>
        <p className="text-slate-500 font-medium">Tick the events you specialize in, then set your starting prices.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: Category Selector */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 px-2">Service Categories</h3>
          {EVENT_TAXONOMY.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat)}
              className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all border ${
                selectedCategory?.name === cat.name 
                ? 'aurora-bg text-white border-transparent shadow-lg shadow-primary/20 scale-[1.02]' 
                : 'bg-white border-slate-100 text-slate-600 hover:border-primary/30 hover:bg-slate-50'
              }`}
            >
              <span className="font-black italic text-sm">{cat.name}</span>
              <ChevronRight size={18} className={selectedCategory?.name === cat.name ? 'opacity-100' : 'opacity-30'} />
            </button>
          ))}
        </div>

        {/* Middle: Sub-Category Selection */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedCategory ? (
              <motion.div
                key={selectedCategory.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <Plus size={24} />
                   </div>
                   <div>
                      <h2 className="text-2xl font-black uppercase italic tracking-tighter">{selectedCategory.name}</h2>
                      <p className="text-xs font-bold text-slate-400">Available Specializations ({selectedCategory.subCategories.length})</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {selectedCategory.subCategories.map((sub) => {
                    const existing = getExistingSpec(sub.name)
                    const added = !!existing
                    const isTicked = ticked[sub.name] || false

                    return (
                      <div 
                        key={sub.name}
                        className={`p-6 rounded-3xl border transition-all ${
                          added ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100 hover:shadow-xl hover:shadow-slate-200/50'
                        } ${isTicked ? 'border-primary/40 ring-1 ring-primary/10' : ''}`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex items-center gap-6 flex-1">
                            {!added ? (
                              <button 
                                onClick={() => toggleTick(sub.name)}
                                className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${
                                  isTicked ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'border-slate-200 text-transparent'
                                }`}
                              >
                                <Plus size={16} strokeWidth={3} />
                              </button>
                            ) : (
                              <button 
                                onClick={() => toggleTick(sub.name)}
                                className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${
                                  isTicked ? 'bg-accent border-accent text-white shadow-lg shadow-accent/20' : 'bg-success border-success text-white'
                                }`}
                              >
                                {isTicked ? <Plus size={16} strokeWidth={3} /> : <CheckCircle2 size={16} />}
                              </button>
                            )}
                            <div className="flex-1">
                              <h4 className="text-lg font-black text-slate-900 mb-1">{sub.name}</h4>
                              <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-md">
                                {sub.description}
                              </p>
                            </div>
                          </div>
                          
                          {isTicked && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="flex items-center gap-3"
                            >
                              <div className="relative">
                                <IndianRupee size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input 
                                  type="text"
                                  placeholder="Base Price"
                                  autoFocus
                                  defaultValue={existing?.base_price || ''}
                                  value={priceInput[sub.name]}
                                  onChange={(e) => setPriceInput(prev => ({ ...prev, [sub.name]: e.target.value }))}
                                  className="pl-10 pr-4 py-3 w-32 rounded-xl bg-slate-50 border border-slate-200 focus:border-primary outline-none font-black text-sm"
                                />
                              </div>
                              <button 
                                onClick={() => handleSaveService(selectedCategory.name, sub.name)}
                                className="h-12 w-12 rounded-xl bg-primary text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                              >
                                <Save size={20} />
                              </button>
                            </motion.div>
                          )}
                          
                          {added && !isTicked && (
                            <div className="flex flex-col items-end gap-1">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active Price</p>
                              <div className="flex items-center gap-1 text-slate-900 font-black">
                                <IndianRupee size={12} className="text-primary" />
                                <span className="text-lg tracking-tighter">{existing.base_price.toLocaleString()}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            ) : (
              <div className="h-[500px] flex flex-col items-center justify-center text-center p-12 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
                 <div className="w-20 h-20 rounded-[2.5rem] bg-white flex items-center justify-center shadow-xl mb-6">
                    <Search size={32} className="text-slate-300" />
                 </div>
                 <h3 className="text-xl font-black text-slate-900 mb-2 uppercase italic">Select a Category</h3>
                 <p className="text-slate-400 text-sm font-medium max-w-xs">Pick a category from the left to browse and add specific services to your profile.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer: Summary of added services */}
      <div className="mt-20 pt-12 border-t border-slate-100">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8 px-2">Your Active Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mySpecializations.map((spec) => (
            <motion.div 
              layout
              key={spec.id}
              className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{spec.category}</p>
                  <h4 className="text-lg font-black text-slate-900 mb-4 italic tracking-tight">{spec.sub_category}</h4>
                  <div className="flex items-center gap-1 text-slate-900 font-black">
                    <IndianRupee size={14} className="text-slate-400" />
                    <span className="text-xl tracking-tighter">{spec.base_price.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 uppercase ml-1">Starting</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleRemoveService(spec.id)}
                  className="p-3 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
          {mySpecializations.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 font-bold italic">
               No services added yet. Select a category above to get started!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

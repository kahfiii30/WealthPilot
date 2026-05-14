import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function TransactionForm({ isOpen, onClose, onAddTransaction, t, fm, currency }) {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [method, setMethod] = useState('Cash');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleTypeChange = (newType) => {
    setType(newType);
    setCategory(newType === 'expense' ? 'Food & Dining' : 'Salary');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount) return;
    
    onAddTransaction({
      type,
      amount: parseFloat(amount),
      category,
      method,
      note,
      date
    });
    
    // Reset
    setAmount('');
    setNote('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl cursor-pointer"
          ></motion.div>
          
          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-[95vw] max-w-[500px] rounded-3xl border border-slate-700/30 bg-slate-900/80 shadow-2xl p-8 z-10 backdrop-blur-2xl flex flex-col max-h-[90vh] overflow-y-auto no-scrollbar"
          >
            <div className="flex justify-between items-center mb-10 shrink-0">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-1">New Entry</p>
                <h2 className="text-2xl font-black text-slate-100 tracking-tighter">{t('addTransaction')}</h2>
              </div>
              <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-950/40 border border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-500 transition-all cursor-pointer shrink-0">
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            <form className="flex flex-col space-y-8" onSubmit={handleSubmit}>
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-950/50 rounded-2xl border border-slate-700/30 shrink-0">
                <button 
                  type="button" 
                  onClick={() => handleTypeChange('expense')} 
                  className={`py-3 text-center text-xs font-black uppercase tracking-widest rounded-xl cursor-pointer transition-all ${type === 'expense' ? 'bg-red-500 text-slate-950 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {t('expense')}
                </button>
                <button 
                  type="button" 
                  onClick={() => handleTypeChange('income')} 
                  className={`py-3 text-center text-xs font-black uppercase tracking-widest rounded-xl cursor-pointer transition-all ${type === 'income' ? 'bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(74,222,128,0.3)]' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {t('income')}
                </button>
              </div>

              {/* Amount Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">{t('amount')}</label>
                <div className="flex items-center bg-slate-950/50 border border-slate-700/50 focus-within:border-emerald-400/50 focus-within:ring-2 focus-within:ring-emerald-400/10 rounded-2xl overflow-hidden h-16 transition-all">
                  <span className="px-6 text-emerald-400 font-black h-full flex items-center bg-slate-950/80 border-r border-slate-700/50 select-none">{currency === 'USD' ? '$' : 'Rp'}</span>
                  <input 
                    type="number" 
                    required 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    className="flex-1 bg-transparent px-6 h-full text-slate-100 font-black text-2xl outline-none w-full min-w-0 tracking-tight" 
                    placeholder="0" 
                    autoFocus 
                  />
                </div>
              </div>

              {/* Category & Method Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">{t('category')}</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)} 
                    className="w-full h-14 bg-slate-950/50 border border-slate-700/50 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/10 rounded-2xl px-5 text-slate-100 outline-none cursor-pointer transition-all font-bold appearance-none"
                  >
                    {type === 'expense' ? (
                      <>
                        <option value="Food & Dining" className="bg-slate-900">Food & Dining</option>
                        <option value="Transportation" className="bg-slate-900">Transportation</option>
                        <option value="Shopping" className="bg-slate-900">Shopping</option>
                        <option value="Entertainment" className="bg-slate-900">Entertainment</option>
                        <option value="Bills & Utilities" className="bg-slate-900">Bills & Utilities</option>
                      </>
                    ) : (
                      <>
                        <option value="Salary" className="bg-slate-900">Salary</option>
                        <option value="Business" className="bg-slate-900">Business</option>
                        <option value="Investment" className="bg-slate-900">Investment</option>
                        <option value="Gift" className="bg-slate-900">Gift</option>
                        <option value="Other Income" className="bg-slate-900">Other Income</option>
                      </>
                    )}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Method</label>
                  <select 
                    value={method} 
                    onChange={(e) => setMethod(e.target.value)} 
                    className="w-full h-14 bg-slate-950/50 border border-slate-700/50 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/10 rounded-2xl px-5 text-slate-100 outline-none cursor-pointer transition-all font-bold appearance-none"
                  >
                    <option value="Cash" className="bg-slate-900">Cash</option>
                    <option value="Bank Transfer" className="bg-slate-900">Bank Transfer</option>
                    <option value="Credit Card" className="bg-slate-900">Credit Card</option>
                    <option value="E-Wallet" className="bg-slate-900">E-Wallet</option>
                  </select>
                </div>
              </div>

              {/* Date & Note Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">{t('date')}</label>
                  <input 
                    type="date" 
                    required 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                    className="w-full h-14 bg-slate-950/50 border border-slate-700/50 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/10 rounded-2xl px-5 text-slate-100 outline-none cursor-pointer transition-all font-bold" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">{t('note')}</label>
                  <input 
                    type="text" 
                    value={note} 
                    onChange={(e) => setNote(e.target.value)} 
                    className="w-full h-14 bg-slate-950/50 border border-slate-700/50 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/10 rounded-2xl px-5 text-slate-100 outline-none transition-all font-bold" 
                    placeholder="Brief description..." 
                  />
                </div>
              </div>

              <div className="pt-6 shrink-0">
                <button 
                  type="submit" 
                  className={`w-full h-16 text-slate-950 text-sm font-black uppercase tracking-[0.2em] rounded-2xl transition-all cursor-pointer shadow-xl flex items-center justify-center gap-3 active:scale-95 ${type === 'income' ? 'bg-emerald-400 hover:bg-emerald-300 shadow-emerald-400/20' : 'bg-red-500 hover:bg-red-400 shadow-red-500/20'}`}
                >
                  <span className="material-symbols-outlined font-bold">save</span>
                  Confirm Transaction
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default TransactionForm;

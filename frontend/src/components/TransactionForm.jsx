import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function TransactionForm({ isOpen, onClose, onAddTransaction, t, currency, assets = [] }) {
  const [type, setType] = useState('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [method, setMethod] = useState('Cash');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const liquidAssets = assets.filter(a => ['Bank', 'E-Wallet', 'Cash'].includes(a.category));
  const defaultMethod = liquidAssets.length > 0 ? liquidAssets[0].name : 'Cash';

  // Automatically set method to first available liquid asset if 'Cash' is not found in assets
  useEffect(() => {
    if (isOpen && liquidAssets.length > 0 && !liquidAssets.find(a => a.name === method)) {
      setMethod(liquidAssets[0].name);
    }
  }, [isOpen, liquidAssets, method]);

  const handleTypeChange = (newType) => {
    setType(newType);
    setCategory(newType === 'expense' ? 'Food & Dining' : 'Salary');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount) return;
    
    try {
      setIsSaving(true);
      setError(null);
      await onAddTransaction({
        type,
        title: title || (type === 'income' ? 'Income' : 'Expense'),
        amount: parseFloat(amount),
        category,
        method,
        note,
        date
      });
      
      // Reset
      setAmount('');
      setTitle('');
      setNote('');
      onClose();
    } catch (err) {
      console.error("Failed to add transaction:", err);
      setError(err.message || "Failed to add transaction");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={onClose}></div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            className="relative z-[201] w-full max-w-[560px] min-w-[320px] max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-700/30 bg-slate-900/95 p-8 shadow-2xl backdrop-blur-xl no-scrollbar"
            style={{
              width: "100%",
              maxWidth: "560px",
              minWidth: "320px"
            }}
          >
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-1">Financial Intelligence</p>
                <h2 className="text-3xl font-black text-slate-100 tracking-tighter whitespace-normal">
                  {t('addTransaction')}
                </h2>
              </div>
              <button 
                onClick={onClose} 
                className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex items-center gap-3">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </div>
            )}

            <form className="w-full space-y-6" onSubmit={handleSubmit}>
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-950/50 rounded-2xl border border-slate-700/30">
                <button 
                  type="button" 
                  onClick={() => handleTypeChange('expense')} 
                  className={`py-3.5 text-center text-xs font-black uppercase tracking-widest rounded-xl transition-colors duration-200 ${type === 'expense' ? 'bg-red-500 text-slate-950 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {t('expense')}
                </button>
                <button 
                  type="button" 
                  onClick={() => handleTypeChange('income')} 
                  className={`py-3.5 text-center text-xs font-black uppercase tracking-widest rounded-xl transition-colors duration-200 ${type === 'income' ? 'bg-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(74,222,128,0.3)]' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {t('income')}
                </button>
              </div>

              {/* Transaction Name Field */}
              <div className="w-full space-y-2">
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400 ml-1">
                  TRANSACTION NAME
                </label>
                <input 
                  type="text" 
                  required
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  className="block h-14 w-full min-w-0 rounded-xl border border-slate-700/50 bg-slate-950/70 px-5 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/10 font-bold text-lg" 
                  placeholder={type === 'income' ? "e.g., Salary from OG Store" : "e.g., Food at KFC"} 
                />
              </div>

              {/* Amount Field */}
              <div className="w-full space-y-2">
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400 ml-1">
                  {t('amount')}
                </label>
                <div className="flex items-center bg-slate-950/70 border border-slate-700/50 focus-within:border-emerald-400/70 focus-within:ring-2 focus-within:ring-emerald-400/10 rounded-xl overflow-hidden h-14 transition-colors duration-200">
                  <span className="px-6 text-emerald-400 font-black h-full flex items-center bg-slate-950/80 border-r border-slate-700/50 select-none">
                    {currency === 'USD' ? '$' : 'Rp'}
                  </span>
                  <input 
                    type="number" 
                    required 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    className="flex-1 bg-transparent px-5 h-full text-slate-100 font-black text-xl outline-none w-full min-w-0 tracking-tight" 
                    placeholder="0" 
                  />
                </div>
              </div>

              {/* Category & Method Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="w-full space-y-2">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400 ml-1">
                    {t('category')}
                  </label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)} 
                    className="block h-12 w-full min-w-0 rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 text-slate-100 outline-none transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/10 appearance-none cursor-pointer font-bold"
                  >
                    {type === 'expense' ? (
                      <>
                        <option value="Food & Dining" className="bg-slate-900">Food & Dining</option>
                        <option value="Transportation" className="bg-slate-900">Transportation</option>
                        <option value="Shopping" className="bg-slate-900">Shopping</option>
                        <option value="Entertainment" className="bg-slate-900">Entertainment</option>
                        <option value="Bills & Utilities" className="bg-slate-900">Bills & Utilities</option>
                        <option value="Health" className="bg-slate-900">Health & Medical</option>
                        <option value="Education" className="bg-slate-900">Education</option>
                        <option value="Travel" className="bg-slate-900">Travel</option>
                        <option value="Insurance" className="bg-slate-900">Insurance</option>
                        <option value="Others" className="bg-slate-900">Others</option>
                      </>
                    ) : (
                      <>
                        <option value="Salary" className="bg-slate-900">Salary</option>
                        <option value="Business" className="bg-slate-900">Business</option>
                        <option value="Bonus" className="bg-slate-900">Bonus</option>
                        <option value="Freelance" className="bg-slate-900">Freelance</option>
                        <option value="Investment" className="bg-slate-900">Investment</option>
                        <option value="Gift" className="bg-slate-900">Gift</option>
                        <option value="Other Income" className="bg-slate-900">Other Income</option>
                      </>
                    )}
                  </select>
                </div>
                <div className="w-full space-y-2">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400 ml-1">
                    Method
                  </label>
                  <select 
                    value={method} 
                    onChange={(e) => setMethod(e.target.value)} 
                    className="block h-12 w-full min-w-0 rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 text-slate-100 outline-none transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/10 appearance-none cursor-pointer font-bold"
                  >
                    {liquidAssets.length > 0 ? liquidAssets.map(a => (
                      <option key={a.id} value={a.name} className="bg-slate-900">{a.name} ({a.category})</option>
                    )) : (
                      <>
                        <option value="Cash" className="bg-slate-900">Cash</option>
                        <option value="Bank Transfer" className="bg-slate-900">Bank Transfer</option>
                        <option value="Credit Card" className="bg-slate-900">Credit Card</option>
                        <option value="E-Wallet" className="bg-slate-900">E-Wallet</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Date & Note Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="w-full space-y-2">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400 ml-1">
                    {t('date')}
                  </label>
                  <input 
                    type="date" 
                    required 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                    className="block h-12 w-full min-w-0 rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 text-slate-100 outline-none transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/10 cursor-pointer font-bold" 
                  />
                </div>
                <div className="w-full space-y-2">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400 ml-1">
                    {t('note')}
                  </label>
                  <input 
                    type="text" 
                    value={note} 
                    onChange={(e) => setNote(e.target.value)} 
                    className="block h-12 w-full min-w-0 rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/10 font-bold" 
                    placeholder="Brief description..." 
                  />
                </div>
              </div>

              <div className="mt-10 flex w-full flex-col-reverse gap-4 sm:flex-row sm:justify-end">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="h-12 w-full rounded-xl border border-slate-700/50 px-8 font-semibold text-slate-300 transition hover:bg-slate-800 sm:w-auto"
                >
                  {t('cancel')}
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className={`h-12 w-full rounded-xl px-10 font-bold text-slate-950 shadow-xl transition-all duration-200 sm:w-auto flex items-center justify-center gap-2 ${type === 'income' ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 shadow-emerald-400/20' : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 shadow-red-500/20'} ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span className="material-symbols-outlined font-bold">save</span>
                      Confirm
                    </>
                  )}
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

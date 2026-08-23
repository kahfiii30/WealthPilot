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
  
  // Combine user liquid assets with default core methods, ensuring no duplicates
  const coreMethods = ['Cash', 'BCA', 'Mandiri', 'Seabank'];
  const assetMethods = liquidAssets.map(a => a.name);
  const combinedMethods = [...new Set([...assetMethods, ...coreMethods])];

  const defaultMethod = combinedMethods.length > 0 ? combinedMethods[0] : 'Cash';

  // Automatically set method to first available if current method is not found
  useEffect(() => {
    if (isOpen && combinedMethods.length > 0 && !combinedMethods.includes(method)) {
      setMethod(combinedMethods[0]);
    }
  }, [isOpen, method]);

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
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={onClose}></div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-[201] w-[90vw] max-w-[480px] max-h-[90vh] overflow-y-auto rounded-xl glass-card-premium shadow-2xl p-6 custom-scrollbar mx-auto my-auto"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-1">Financial Intelligence</p>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {t('addTransaction')}
                </h2>
              </div>
              <button 
                onClick={onClose} 
                className="shrink-0 p-2 text-neutral-400 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {error && (
              <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-400 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span>
                {error}
              </div>
            )}

            <form className="w-full space-y-5" onSubmit={handleSubmit}>
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-white/[0.02] rounded-lg border border-white/5">
                <button 
                  type="button" 
                  onClick={() => handleTypeChange('expense')} 
                  className={`py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider rounded-md transition-colors duration-200 ${type === 'expense' ? 'bg-red-500 text-white' : 'text-neutral-500 hover:text-white'}`}
                >
                  {t('expense')}
                </button>
                <button 
                  type="button" 
                  onClick={() => handleTypeChange('income')} 
                  className={`py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider rounded-md transition-colors duration-200 ${type === 'income' ? 'bg-primary text-black' : 'text-neutral-500 hover:text-white'}`}
                >
                  {t('income')}
                </button>
              </div>

              {/* Transaction Name Field */}
              <div className="w-full space-y-1.5">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-500 ml-1">
                  TRANSACTION NAME
                </label>
                <input 
                  type="text" 
                  required
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  className="glass-input px-4 py-3 text-sm w-full" 
                  placeholder={type === 'income' ? "e.g., Salary from OG Store" : "e.g., Food at KFC"} 
                />
              </div>

              {/* Amount Field */}
              <div className="w-full space-y-1.5">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-500 ml-1">
                  {t('amount')}
                </label>
                <div className="flex items-center bg-white/[0.02] border border-white/10 focus-within:border-primary/50 rounded-lg overflow-hidden transition-colors duration-200">
                  <span className="px-4 py-3 text-primary font-bold bg-white/[0.03] border-r border-white/10 select-none text-sm">
                    {currency === 'USD' ? '$' : 'Rp'}
                  </span>
                  <input 
                    type="number" 
                    required 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    className="flex-1 bg-transparent px-4 py-3 text-white font-bold outline-none tracking-tight text-sm" 
                    placeholder="0" 
                  />
                </div>
              </div>

              {/* Category & Method Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="w-full space-y-1.5">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-500 ml-1">
                    {t('category')}
                  </label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)} 
                    className="glass-input px-4 py-3 text-sm w-full appearance-none cursor-pointer"
                  >
                    {type === 'expense' ? (
                      <>
                        <option value="Food & Dining" className="bg-[#0a0a0a]">Food & Dining</option>
                        <option value="Trading" className="bg-[#0a0a0a]">Trading</option>
                        <option value="Kebutuhan" className="bg-[#0a0a0a]">Kebutuhan</option>
                        <option value="Transportasi" className="bg-[#0a0a0a]">Transportasi</option>
                        <option value="Investasi" className="bg-[#0a0a0a]">Investasi</option>
                        <option value="Lainnya" className="bg-[#0a0a0a]">Lainnya</option>
                      </>
                    ) : (
                      <>
                        <option value="Salary" className="bg-[#0a0a0a]">Salary</option>
                        <option value="Business" className="bg-[#0a0a0a]">Business</option>
                        <option value="Bonus" className="bg-[#0a0a0a]">Bonus</option>
                        <option value="Freelance" className="bg-[#0a0a0a]">Freelance</option>
                        <option value="Investment" className="bg-[#0a0a0a]">Investment</option>
                        <option value="Gift" className="bg-[#0a0a0a]">Gift</option>
                        <option value="Other Income" className="bg-[#0a0a0a]">Other Income</option>
                      </>
                    )}
                  </select>
                </div>
                <div className="w-full space-y-1.5">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-500 ml-1">
                    Method
                  </label>
                  <select 
                    value={method} 
                    onChange={(e) => setMethod(e.target.value)} 
                    className="glass-input px-4 py-3 text-sm w-full appearance-none cursor-pointer"
                  >
                    {combinedMethods.map(m => (
                      <option key={m} value={m} className="bg-[#0a0a0a]">{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date & Note Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="w-full space-y-1.5">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-500 ml-1">
                    {t('date')}
                  </label>
                  <input 
                    type="date" 
                    required 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                    className="glass-input px-4 py-3 text-sm w-full cursor-pointer [color-scheme:dark]" 
                  />
                </div>
                <div className="w-full space-y-1.5">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-500 ml-1">
                    {t('note')}
                  </label>
                  <input 
                    type="text" 
                    value={note} 
                    onChange={(e) => setNote(e.target.value)} 
                    className="glass-input px-4 py-3 text-sm w-full" 
                    placeholder="Brief description..." 
                  />
                </div>
              </div>

              <div className="mt-8 flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-end pt-4 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-semibold text-neutral-400 hover:text-white hover:bg-white/[0.05] transition-colors"
                >
                  {t('cancel')}
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${type === 'income' ? 'bg-white text-black hover:bg-neutral-200' : 'bg-red-500 text-white hover:bg-red-600'} ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">save</span>
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

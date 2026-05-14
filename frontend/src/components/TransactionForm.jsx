import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function TransactionForm({ isOpen, onClose, onAddTransaction }) {
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
      id: Date.now().toString(),
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
            className="absolute inset-0 bg-background/80 backdrop-blur-md cursor-pointer"
          ></motion.div>
          
          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-[90vw] max-w-[500px] glass-card rounded-2xl shadow-2xl p-6 md:p-8 z-10 inner-glow bg-surface-dim [color-scheme:dark] flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h2 className="text-2xl font-bold text-on-surface">Add Transaction</h2>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors cursor-pointer shrink-0">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form className="flex flex-col space-y-5" onSubmit={handleSubmit}>
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-surface-container-high rounded-xl shrink-0">
                <button type="button" onClick={() => handleTypeChange('expense')} className={`py-2.5 text-center font-bold rounded-lg cursor-pointer transition-all ${type === 'expense' ? 'bg-error text-background shadow-md' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'}`}>Expense</button>
                <button type="button" onClick={() => handleTypeChange('income')} className={`py-2.5 text-center font-bold rounded-lg cursor-pointer transition-all ${type === 'income' ? 'bg-primary text-background shadow-md' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'}`}>Income</button>
              </div>

              {/* Amount Field */}
              <div>
                <label className="text-on-surface-variant text-sm font-medium mb-2 block">Amount</label>
                <div className="flex items-center bg-surface-container-lowest border border-outline-variant/50 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary rounded-xl overflow-hidden h-[52px] transition-all">
                  <span className="px-4 text-on-surface-variant font-bold h-full flex items-center bg-surface-container-highest border-r border-outline-variant/30 select-none">Rp</span>
                  <input type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} className="flex-1 bg-transparent px-4 h-full text-on-surface font-mono-data text-xl outline-none w-full min-w-0" placeholder="0" autoFocus />
                </div>
              </div>

              {/* Category & Method Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-on-surface-variant text-sm font-medium mb-2 block">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full h-[52px] bg-surface-container-lowest border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 text-on-surface outline-none cursor-pointer transition-all">
                    {type === 'expense' ? (
                      <>
                        <option value="Food & Dining">Food & Dining</option>
                        <option value="Transportation">Transportation</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Bills & Utilities">Bills & Utilities</option>
                      </>
                    ) : (
                      <>
                        <option value="Salary">Salary</option>
                        <option value="Business">Business</option>
                        <option value="Investment">Investment</option>
                        <option value="Gift">Gift</option>
                        <option value="Other Income">Other Income</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="text-on-surface-variant text-sm font-medium mb-2 block">Method</label>
                  <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full h-[52px] bg-surface-container-lowest border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 text-on-surface outline-none cursor-pointer transition-all">
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="E-Wallet">E-Wallet</option>
                  </select>
                </div>
              </div>

              {/* Date & Note Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-on-surface-variant text-sm font-medium mb-2 block">Date</label>
                  <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full h-[52px] bg-surface-container-lowest border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 text-on-surface outline-none cursor-pointer transition-all" />
                </div>
                <div>
                  <label className="text-on-surface-variant text-sm font-medium mb-2 block">Note</label>
                  <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className="w-full h-[52px] bg-surface-container-lowest border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 text-on-surface outline-none transition-all" placeholder="What was this for?" />
                </div>
              </div>

              <div className="pt-4 shrink-0">
                <button type="submit" className={`w-full h-[52px] text-background text-lg font-bold rounded-xl hover:scale-[0.98] active:scale-[0.95] transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 ${type === 'income' ? 'bg-primary shadow-primary/20' : 'bg-error shadow-error/20'}`}>
                  <span className="material-symbols-outlined text-[20px]">save</span>
                  Save Transaction
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

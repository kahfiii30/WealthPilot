import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function Transactions({ transactions = [], onDelete, t, fm }) {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter Logic
  const filtered = transactions.filter(t_data => {
    const matchesFilter = filter === 'all' ? true : t_data.type === filter;
    const matchesSearch = 
      (t_data.note || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t_data.category || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t_data.method || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t_data.date || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { duration: 0.2 } }
  };

  const EmptyState = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-xl glass-card rounded-2xl border-dashed border-2 border-outline-variant/30 min-h-[300px]"
    >
      <div className="w-16 h-16 bg-surface-container-highest rounded-full flex items-center justify-center mb-md border border-outline-variant/20 shadow-inner">
        <span className="material-symbols-outlined text-primary text-[32px] opacity-50">receipt_long</span>
      </div>
      <h3 className="text-on-surface font-headline-lg text-lg mb-2">No transactions yet</h3>
      <p className="text-on-surface-variant text-sm text-center max-w-[280px] mb-lg">
        Keep track of your spending and income by adding your first transaction today.
      </p>
    </motion.div>
  );

  return (
    <div className="p-8 pb-[100px]">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="flex flex-wrap gap-2">
          {['all', 'expense', 'income'].map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f)} 
              className={`px-6 py-2.5 font-black rounded-xl text-xs uppercase tracking-widest cursor-pointer transition-all duration-200 active:scale-95 ${filter === f ? (f === 'expense' ? 'bg-red-400 text-slate-950 shadow-[0_0_20px_rgba(248,113,113,0.3)]' : 'bg-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(74,222,128,0.3)]') : 'bg-slate-900/50 border border-slate-700/40 text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64 group focus-within:w-72 transition-all duration-300">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors">search</span>
          <input 
            type="text" 
            placeholder="Search fleet data..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 bg-slate-950/55 border border-slate-700/40 rounded-xl pl-12 pr-4 text-slate-100 placeholder:text-slate-500 outline-none backdrop-blur transition-all duration-200 focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/10 text-sm shadow-inner"
          />
        </div>
      </div>

      {/* Mobile Transactions List */}
      <div className="md:hidden">
        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {filtered.map((t_data) => (
              <motion.div key={t_data.id} variants={item} className="rounded-2xl border border-slate-700/30 bg-slate-900/55 p-5 shadow-xl backdrop-blur-xl transition-all duration-300 active:scale-[0.98]">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 border ${t_data.type === 'income' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : 'bg-red-400/10 text-red-300 border-red-500/20'}`}>
                      <span className="material-symbols-outlined font-bold">{t_data.type === 'income' ? 'payments' : 'receipt_long'}</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-100 text-sm line-clamp-1 tracking-tight">{t_data.note || t_data.category}</p>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{new Date(t_data.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className={`text-lg font-black tracking-tighter ${t_data.type === 'income' ? 'text-emerald-400' : 'text-red-300'}`}>
                    {t_data.type === 'income' ? '+' : '-'} {fm(t_data.amount)}
                  </p>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-800/50">
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-slate-800/50 text-slate-400 rounded-lg text-[9px] uppercase font-black tracking-widest border border-white/5">{t_data.category}</span>
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <span className="material-symbols-outlined text-[16px]">wallet</span>
                      {t_data.method}
                    </div>
                  </div>
                  <button onClick={() => onDelete && onDelete(t_data.id)} className="text-red-300 p-2 hover:bg-red-500/10 rounded-xl transition-all active:scale-90">
                    <span className="material-symbols-outlined font-bold">delete</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-2xl border border-slate-700/30 bg-slate-900/55 shadow-xl backdrop-blur-xl overflow-hidden transition-all duration-300 hover:border-emerald-400/30">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/35 border-b border-slate-700/30">
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Date</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Note</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Category</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Method</th>
              <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Amount</th>
              <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500"></th>
            </tr>
          </thead>
          <motion.tbody 
            variants={container}
            initial="hidden"
            animate="show"
            className="divide-y divide-slate-800/50"
          >
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-8 py-16">
                  <EmptyState />
                </td>
              </tr>
            ) : (
              filtered.map((t_data) => (
                <motion.tr key={t_data.id} variants={item} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-8 py-5 text-xs font-bold text-slate-500 tracking-tight">
                    {new Date(t_data.date).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-5 font-bold text-slate-100 group-hover:text-emerald-400 transition-colors tracking-tight">
                    {t_data.note || t_data.category}
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-slate-800/50 text-slate-400 rounded-lg text-[9px] uppercase font-black tracking-widest border border-white/5">{t_data.category}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
                      <span className="material-symbols-outlined text-[18px]">wallet</span>
                      {t_data.method}
                    </div>
                  </td>
                  <td className={`px-8 py-5 text-right font-black tracking-tighter text-lg transition-all ${t_data.type === 'income' ? 'text-emerald-400' : 'text-slate-100'}`}>
                    {t_data.type === 'income' ? '+' : '-'} {fm(t_data.amount)}
                  </td>
                  <td className="px-8 py-5 text-center">
                    <button onClick={() => onDelete && onDelete(t_data.id)} className="text-red-300 hover:bg-red-500/10 p-2 rounded-xl transition-all active:scale-90">
                      <span className="material-symbols-outlined font-bold">delete</span>
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </motion.tbody>
        </table>
      </div>
    </div>
  );
}

export default Transactions;

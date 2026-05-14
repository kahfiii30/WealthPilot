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
    <div className="p-container-margin pb-[100px]">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-lg mb-lg">
        <div className="flex flex-wrap gap-sm">
          {['all', 'expense', 'income'].map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f)} 
              className={`px-4 py-2 font-bold rounded-full font-label-md text-label-md cursor-pointer transition-all premium-button-active ${filter === f ? (f === 'expense' ? 'bg-error text-background shadow-lg shadow-error/10' : 'bg-primary text-background shadow-lg shadow-primary/10') : 'bg-surface-container-highest border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64 group focus-within:w-72 transition-all duration-300">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
          <input 
            type="text" 
            placeholder="Search transactions..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 bg-surface-container-highest border border-outline-variant/30 rounded-xl pl-10 pr-4 text-on-surface outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-sm shadow-inner"
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
              <motion.div key={t_data.id} variants={item} className="glass-card p-md rounded-xl border border-outline-variant/20 shadow-sm active:scale-[0.98] transition-transform">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${t_data.type === 'income' ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'}`}>
                      <span className="material-symbols-outlined">{t_data.type === 'income' ? 'south_west' : 'north_east'}</span>
                    </div>
                    <div>
                      <p className="font-bold text-on-surface text-sm line-clamp-1">{t_data.note || t_data.category}</p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">{new Date(t_data.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className={`font-mono-data text-sm font-bold ${t_data.type === 'income' ? 'text-primary' : 'text-error'}`}>
                    {t_data.type === 'income' ? '+' : '-'} {fm(t_data.amount)}
                  </p>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-outline-variant/10">
                  <div className="flex items-center gap-4">
                    <span className="px-2 py-0.5 bg-surface-container-highest text-on-surface-variant rounded text-[9px] uppercase font-bold">{t_data.category}</span>
                    <div className="flex items-center gap-1 text-[10px] text-on-surface-variant">
                      <span className="material-symbols-outlined text-[14px]">wallet</span>
                      {t_data.method}
                    </div>
                  </div>
                  <button onClick={() => onDelete && onDelete(t_data.id)} className="text-error p-1 hover:bg-error/10 rounded-full transition-colors cursor-pointer premium-button-active">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block glass-card rounded-xl overflow-hidden border border-outline-variant/20 shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low/50 border-b border-outline-variant/30">
              <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Date</th>
              <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Note</th>
              <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Category</th>
              <th className="px-lg py-md font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Method</th>
              <th className="px-lg py-md text-right font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Amount</th>
              <th className="px-lg py-md text-center font-label-md text-label-md text-on-surface-variant uppercase tracking-widest"></th>
            </tr>
          </thead>
          <motion.tbody 
            variants={container}
            initial="hidden"
            animate="show"
            className="divide-y divide-outline-variant/10"
          >
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-lg py-xl">
                  <EmptyState />
                </td>
              </tr>
            ) : (
              filtered.map((t_data) => (
                <motion.tr key={t_data.id} variants={item} className="hover:bg-surface-variant/20 transition-colors group">
                  <td className="px-lg py-md font-mono-data text-mono-data text-on-surface-variant">
                    {new Date(t_data.date).toLocaleDateString()}
                  </td>
                  <td className="px-lg py-md font-bold text-on-surface group-hover:text-primary transition-colors">
                    {t_data.note || t_data.category}
                  </td>
                  <td className="px-lg py-md">
                    <span className="px-3 py-1 bg-surface-container-highest text-on-surface-variant rounded-full font-label-md text-[10px] uppercase tracking-wider">{t_data.category}</span>
                  </td>
                  <td className="px-lg py-md">
                    <div className="flex items-center gap-2 font-body-md text-body-md text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px]">wallet</span>
                      {t_data.method}
                    </div>
                  </td>
                  <td className={`px-lg py-md text-right font-mono-data text-mono-data font-bold ${t_data.type === 'income' ? 'text-primary' : 'text-error'}`}>
                    {t_data.type === 'income' ? '+' : '-'} {fm(t_data.amount)}
                  </td>
                  <td className="px-lg py-md text-center">
                    <button onClick={() => onDelete && onDelete(t_data.id)} className="text-error hover:bg-error/10 p-2 rounded-full transition-colors cursor-pointer premium-button-active">
                      <span className="material-symbols-outlined text-[20px]">delete</span>
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

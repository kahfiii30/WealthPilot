import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatDate } from '../utils/dateUtils';
import { getMonthKey } from '../services/financeService';

function Transactions({ transactions = [], onDelete, fm, selectedMonth, setSelectedMonth }) {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Filter by Month
  const monthlyTransactions = transactions.filter((transaction) => {
    if (!transaction.date) return false;
    const transactionMonth = getMonthKey(transaction.date);
    return transactionMonth === selectedMonth;
  });

  // 2. Apply Type and Search Filters
  const filtered = monthlyTransactions.filter(t_data => {
    const matchesFilter = filter === 'all' ? true : t_data.type === filter;
    const matchesSearch = 
      (t_data.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t_data.note || t_data.notes || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t_data.category || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t_data.method || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 150, damping: 20 } }
  };


  return (
    <div className="p-4 md:p-8 2xl:p-12 pb-[100px] 2xl:pb-[140px]">
      {/* Header & Search */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div className="flex flex-wrap gap-2">
          {['all', 'expense', 'income'].map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f)} 
              className={`px-5 py-2.5 font-semibold rounded-lg text-xs uppercase tracking-wider cursor-pointer transition-colors duration-200 ${
                filter === f 
                  ? (f === 'expense' ? 'bg-red-500 text-white' : (f === 'income' ? 'bg-primary text-black' : 'bg-white text-black'))
                  : 'bg-white/[0.03] border border-white/10 text-neutral-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
          <input 
            type="month" 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="glass-input h-11 px-4 cursor-pointer [color-scheme:dark]"
          />
          <div className="relative w-full sm:w-64 lg:w-80 group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-primary transition-colors text-[20px]">search</span>
            <input 
              type="text" 
              placeholder="Search transactions..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input h-11 w-full pl-12 pr-4 text-sm"
            />
          </div>
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
              <motion.div key={t_data.id} variants={item} className="rounded-2xl card-luxury p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${t_data.type === 'income' ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-400'}`}>
                      <span className="material-symbols-outlined font-medium text-[20px]">{t_data.type === 'income' ? 'south_west' : 'north_east'}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-100 text-sm line-clamp-1">{t_data.title}</p>
                      <p className="text-[11px] font-medium text-neutral-500 mt-0.5">{formatDate(t_data.date)}</p>
                    </div>
                  </div>
                  <p className={`text-sm font-bold shrink-0 ${t_data.type === 'income' ? 'text-primary' : 'text-white'}`}>
                    {t_data.type === 'income' ? '+' : '-'} {fm(t_data.amount)}
                  </p>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] bg-white/[0.03] px-2 py-1 rounded text-neutral-400 border border-white/5 uppercase tracking-wider font-semibold">{t_data.category}</span>
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                      <span className="material-symbols-outlined text-[14px]">account_balance_wallet</span>
                      {t_data.method}
                    </div>
                  </div>
                  <button onClick={() => onDelete && onDelete(t_data.id)} className="text-neutral-500 hover:text-red-400 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-3xl card-luxury overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Date</th>
              <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Transaction</th>
              <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Category</th>
              <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Method</th>
              <th className="px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">Amount</th>
              <th className="px-6 py-4 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500"></th>
            </tr>
          </thead>
          <motion.tbody 
            variants={container}
            initial="hidden"
            animate="show"
            className="divide-y divide-white/5"
          >
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-16">
                  <EmptyState />
                </td>
              </tr>
            ) : (
              filtered.map((t_data) => (
                <motion.tr key={t_data.id} variants={item} className="hover:bg-white/[0.03] transition-colors group">
                  <td className="px-6 py-4 text-sm font-medium text-slate-400 whitespace-nowrap">
                    {formatDate(t_data.date)}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-slate-100 group-hover:text-primary transition-colors">
                        {t_data.title}
                      </p>
                      {t_data.notes && (
                        <p className="text-[12px] text-slate-500 mt-0.5">
                          {t_data.notes}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-white/[0.03] text-slate-400 rounded text-[10px] uppercase font-semibold tracking-wider border border-white/5 whitespace-nowrap">{t_data.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
                      {t_data.method}
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-right font-bold whitespace-nowrap ${t_data.type === 'income' ? 'text-primary' : 'text-slate-100'}`}>
                    {t_data.type === 'income' ? '+' : '-'} {fm(t_data.amount)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => onDelete && onDelete(t_data.id)} className="text-neutral-600 hover:text-red-400 p-2 rounded-lg transition-colors">
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

const EmptyState = () => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 px-4"
  >
    <div className="w-16 h-16 bg-white/[0.03] rounded-full flex items-center justify-center mb-6 border border-white/5">
      <span className="material-symbols-outlined text-neutral-600 text-3xl">receipt_long</span>
    </div>
    <h3 className="text-white font-semibold text-lg mb-2">No transactions found</h3>
    <p className="text-neutral-500 text-sm text-center max-w-[280px]">
      Adjust your filters or add a new transaction to see them here.
    </p>
  </motion.div>
);


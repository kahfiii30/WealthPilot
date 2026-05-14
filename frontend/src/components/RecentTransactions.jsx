import React from 'react';
import { motion } from 'framer-motion';

function RecentTransactions({ transactions, onDelete, t, fm }) {
  // Sort by date descending
  const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  const recent = sorted.slice(0, 5); // Show only top 5 recent

  return (
    <div className="rounded-2xl border border-slate-700/30 bg-slate-900/55 p-8 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-emerald-400/30 hover:bg-slate-900/70 hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-black text-slate-100 tracking-tight">{t('recentTransactions')}</h3>
        <button className="text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors">SEE ALL</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-700/30">
              <th className="pb-4 font-black">TRANSACTION / {t('category')}</th>
              <th className="pb-4 font-black">{t('date')}</th>
              <th className="pb-4 font-black text-right">{t('amount')}</th>
              <th className="pb-4 font-black text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {recent.length === 0 ? (
              <tr><td colSpan="4" className="py-12 text-center text-slate-500 font-bold">{t('noData')}</td></tr>
            ) : (
              recent.map((t_data, i) => (
                <motion.tr 
                  key={t_data.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-slate-800/30 transition-colors group"
                >
                  <td className="py-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 border ${t_data.type === 'income' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : 'bg-slate-800/50 text-sky-300 border-slate-700/30'}`}>
                        <span className="material-symbols-outlined font-bold">{t_data.type === 'income' ? 'payments' : 'receipt_long'}</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-100 group-hover:text-emerald-400 transition-colors tracking-tight">{t_data.title}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t_data.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 text-sm font-bold text-slate-400 tracking-tight">{t_data.date}</td>
                  <td className={`py-5 text-right font-black tracking-tighter text-lg transition-all ${t_data.type === 'income' ? 'text-emerald-400' : 'text-slate-100'}`}>
                    {t_data.type === 'income' ? '+' : '-'} {fm(t_data.amount)}
                  </td>
                  <td className="py-5 text-center">
                    <button onClick={() => onDelete(t_data.id)} className="text-red-300 hover:text-red-400 cursor-pointer p-2 rounded-xl hover:bg-red-500/10 transition-all active:scale-90">
                      <span className="material-symbols-outlined font-bold">delete</span>
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecentTransactions;

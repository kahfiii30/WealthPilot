import React from 'react';
import { motion } from 'framer-motion';

function RecentTransactions({ transactions, onDelete, t, fm }) {
  // Sort by date descending
  const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  const recent = sorted.slice(0, 5); // Show only top 5 recent

  return (
    <div className="rounded-3xl glass-card-premium p-6 md:p-8 transition-colors duration-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white tracking-tight">{t('recentTransactions')}</h3>
        <button className="text-[11px] font-semibold uppercase tracking-wider text-primary hover:text-primary-dark transition-colors">SEE ALL</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5">
              <th className="pb-4 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">TRANSACTION / {t('category')}</th>
              <th className="pb-4 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">{t('date')}</th>
              <th className="pb-4 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 text-right">{t('amount')}</th>
              <th className="pb-4 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {recent.length === 0 ? (
              <tr><td colSpan="4" className="py-8 text-center text-neutral-500 text-sm font-medium">{t('noData')}</td></tr>
            ) : (
              recent.map((t_data, i) => (
                <motion.tr 
                  key={t_data.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="py-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${t_data.type === 'income' ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-400'}`}>
                        <span className="material-symbols-outlined font-medium text-[20px]">{t_data.type === 'income' ? 'south_west' : 'north_east'}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-white group-hover:text-primary transition-colors text-sm">{t_data.title}</p>
                        <p className="text-[11px] font-medium text-neutral-500 mt-0.5">{t_data.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-sm font-medium text-neutral-400">{t_data.date}</td>
                  <td className={`py-4 text-right font-bold text-base ${t_data.type === 'income' ? 'text-primary' : 'text-white'}`}>
                    {t_data.type === 'income' ? '+' : '-'} {fm(t_data.amount)}
                  </td>
                  <td className="py-4 text-center">
                    <button onClick={() => onDelete(t_data.id)} className="text-neutral-600 hover:text-red-400 p-2 rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-[20px]">delete</span>
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


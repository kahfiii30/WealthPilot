import React from 'react';
import { motion } from 'framer-motion';

function RecentTransactions({ transactions, onDelete, t, fm }) {
  // Sort by date descending
  const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  const recent = sorted.slice(0, 5); // Show only top 5 recent

  return (
    <div className="col-span-12 lg:col-span-8 glass-card rounded-xl p-lg">
      <div className="flex justify-between items-center mb-lg">
        <h3 className="font-headline-lg text-headline-lg">{t('recentTransactions')}</h3>
        <button className="text-xs font-bold text-primary hover:underline cursor-pointer">SEE ALL</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-on-surface-variant text-xs uppercase tracking-widest border-b border-outline-variant/30">
              <th className="pb-4 font-medium">{t('note')} / {t('category')}</th>
              <th className="pb-4 font-medium">{t('date')}</th>
              <th className="pb-4 font-medium text-right">{t('amount')}</th>
              <th className="pb-4 font-medium text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {recent.length === 0 ? (
              <tr><td colSpan="4" className="py-8 text-center text-on-surface-variant">{t('noData')}</td></tr>
            ) : (
              recent.map((t_data, i) => (
                <motion.tr 
                  key={t_data.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-surface-variant/40 transition-colors group"
                >
                  <td className="py-4">
                    <div className="flex items-center gap-md">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${t_data.type === 'income' ? 'bg-primary/20 text-primary' : 'bg-surface-container-highest text-secondary'}`}>
                        <span className="material-symbols-outlined">{t_data.type === 'income' ? 'payments' : 'receipt_long'}</span>
                      </div>
                      <div>
                        <p className="font-bold text-on-surface group-hover:text-primary transition-colors">{t_data.note || t_data.category}</p>
                        <p className="text-xs text-on-surface-variant">{t_data.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-on-surface-variant">{t_data.date}</td>
                  <td className={`py-4 text-right font-mono-data text-mono-data font-bold transition-all ${t_data.type === 'income' ? 'text-primary' : 'text-on-surface'}`}>
                    {t_data.type === 'income' ? '+' : '-'} {fm(t_data.amount)}
                  </td>
                  <td className="py-4 text-center">
                    <button onClick={() => onDelete(t_data.id)} className="text-error hover:text-error/80 cursor-pointer p-2 rounded-full hover:bg-error/10 transition-colors premium-button-active">
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

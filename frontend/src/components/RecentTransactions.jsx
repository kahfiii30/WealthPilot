import React from 'react';
import { formatCurrency } from '../utils/formatCurrency';

function RecentTransactions({ transactions, onDelete }) {
  // Sort by date descending
  const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  const recent = sorted.slice(0, 5); // Show only top 5 recent

  return (
    <div className="col-span-12 lg:col-span-8 glass-card rounded-xl p-lg">
      <div className="flex justify-between items-center mb-lg">
        <h3 className="font-headline-lg text-headline-lg">Recent Transactions</h3>
        <button className="text-xs font-bold text-primary hover:underline cursor-pointer">SEE ALL</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-on-surface-variant text-xs uppercase tracking-widest border-b border-outline-variant/30">
              <th className="pb-4 font-medium">Note / Category</th>
              <th className="pb-4 font-medium">Date</th>
              <th className="pb-4 font-medium text-right">Amount</th>
              <th className="pb-4 font-medium text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {recent.length === 0 ? (
              <tr><td colSpan="4" className="py-8 text-center text-on-surface-variant">No transactions yet.</td></tr>
            ) : (
              recent.map(t => (
                <tr key={t.id} className="hover:bg-surface-variant/40 transition-colors group">
                  <td className="py-4">
                    <div className="flex items-center gap-md">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-primary/20 text-primary' : 'bg-surface-container-highest text-secondary'}`}>
                        <span className="material-symbols-outlined">{t.type === 'income' ? 'payments' : 'receipt_long'}</span>
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">{t.note || t.category}</p>
                        <p className="text-xs text-on-surface-variant">{t.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-on-surface-variant">{t.date}</td>
                  <td className={`py-4 text-right font-mono-data text-mono-data ${t.type === 'income' ? 'text-primary' : 'text-on-surface'}`}>
                    {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                  </td>
                  <td className="py-4 text-center">
                    <button onClick={() => onDelete(t.id)} className="text-error hover:text-error/80 cursor-pointer p-2 rounded-full hover:bg-error/10 transition-colors">
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecentTransactions;

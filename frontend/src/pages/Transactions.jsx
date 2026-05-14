import React, { useState } from 'react';
import { formatCurrency } from '../utils/formatCurrency';

function Transactions({ transactions = [], onDelete }) {
  const [filter, setFilter] = useState('All');

  // Basic filters
  const filtered = filter === 'All' ? transactions : transactions.filter(t => t.type === filter.toLowerCase());

  return (
    <div className="p-container-margin">
      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-lg mb-lg">
        <div className="flex flex-wrap gap-sm">
          <button onClick={() => setFilter('All')} className={`px-4 py-2 font-bold rounded-full font-label-md text-label-md cursor-pointer transition-all ${filter === 'All' ? 'bg-primary text-background' : 'bg-surface-container-highest border border-outline-variant text-on-surface-variant hover:text-on-surface'}`}>All Time</button>
          <button onClick={() => setFilter('Expense')} className={`px-4 py-2 font-bold rounded-full font-label-md text-label-md cursor-pointer transition-all ${filter === 'Expense' ? 'bg-error text-background' : 'bg-surface-container-highest border border-outline-variant text-on-surface-variant hover:text-on-surface'}`}>Expenses</button>
          <button onClick={() => setFilter('Income')} className={`px-4 py-2 font-bold rounded-full font-label-md text-label-md cursor-pointer transition-all ${filter === 'Income' ? 'bg-primary text-background' : 'bg-surface-container-highest border border-outline-variant text-on-surface-variant hover:text-on-surface'}`}>Income</button>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="glass-card rounded-xl overflow-hidden mb-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-highest/50 border-b border-outline-variant/30">
              <th className="px-lg py-4 font-label-md text-label-md text-on-surface-variant">Date</th>
              <th className="px-lg py-4 font-label-md text-label-md text-on-surface-variant">Description</th>
              <th className="px-lg py-4 font-label-md text-label-md text-on-surface-variant">Category</th>
              <th className="px-lg py-4 font-label-md text-label-md text-on-surface-variant">Method</th>
              <th className="px-lg py-4 font-label-md text-label-md text-on-surface-variant text-right">Amount</th>
              <th className="px-lg py-4 font-label-md text-label-md text-on-surface-variant text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {filtered.length === 0 ? (
              <tr><td colSpan="6" className="py-8 text-center text-on-surface-variant">No transactions found.</td></tr>
            ) : (
              filtered.map(t => (
                <tr key={t.id} className="hover:bg-surface-variant/40 transition-colors group">
                  <td className="px-lg py-md font-mono-data text-mono-data text-on-surface-variant">{t.date}</td>
                  <td className="px-lg py-md">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.type === 'income' ? 'bg-primary/20 text-primary' : 'bg-surface-container-lowest text-secondary'}`}>
                        <span className="material-symbols-outlined text-[18px]">{t.type === 'income' ? 'payments' : 'receipt_long'}</span>
                      </div>
                      <span className="font-body-md text-body-md font-bold text-on-surface">{t.note || t.category}</span>
                    </div>
                  </td>
                  <td className="px-lg py-md">
                    <span className="px-3 py-1 bg-surface-container-highest text-on-surface-variant rounded-full font-label-md text-[10px] uppercase tracking-wider">{t.category}</span>
                  </td>
                  <td className="px-lg py-md">
                    <div className="flex items-center gap-2 font-body-md text-body-md text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px]">wallet</span>
                      {t.method}
                    </div>
                  </td>
                  <td className={`px-lg py-md text-right font-mono-data text-mono-data font-bold ${t.type === 'income' ? 'text-primary' : 'text-on-surface'}`}>
                    {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                  </td>
                  <td className="px-lg py-md text-center">
                    <button onClick={() => onDelete && onDelete(t.id)} className="text-error hover:bg-error/10 p-2 rounded-full transition-colors cursor-pointer">
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

export default Transactions;

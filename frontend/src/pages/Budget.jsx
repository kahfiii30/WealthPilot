import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../utils/formatCurrency';

function Budget({ transactions, budgets, onAddBudget, onUpdateBudget, onDeleteBudget }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const expenseCategories = ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities', 'Investment', 'Business', 'Other'];

  // Filter Data
  const monthlyExpenses = transactions.filter(t => t.type === 'expense' && t.date.startsWith(selectedMonth));
  const currentBudgets = budgets.filter(b => b.month === selectedMonth);

  // Metrics
  const totalBudget = currentBudgets.reduce((acc, b) => acc + b.limit, 0);
  const totalActual = monthlyExpenses.reduce((acc, t) => acc + t.amount, 0);
  const consumedPercent = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;
  
  // Safe to Spend Logic
  const getRemainingDays = (monthStr) => {
    const today = new Date();
    const currentMonthStr = today.toISOString().slice(0, 7);
    const [year, month] = monthStr.split('-').map(Number);
    
    if (monthStr === currentMonthStr) {
      const lastDay = new Date(year, month, 0).getDate();
      return lastDay - today.getDate() + 1;
    } else {
      return new Date(year, month, 0).getDate();
    }
  };

  const remainingBudget = totalBudget - totalActual;
  const remainingDays = getRemainingDays(selectedMonth);
  const dailySafeToSpend = remainingBudget > 0 ? remainingBudget / remainingDays : 0;

  // Category Breakdown Data
  const categoryStats = currentBudgets.map(b => {
    const actual = monthlyExpenses.filter(t => t.category === b.category).reduce((acc, t) => acc + t.amount, 0);
    const percent = b.limit > 0 ? (actual / b.limit) * 100 : 0;
    return { ...b, actual, percent };
  });

  const overBudgetCount = categoryStats.filter(s => s.actual > s.limit).length;

  // High Impact Spending
  const highImpact = monthlyExpenses
    .filter(t => 
      t.note.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Chart Data (Last 3 Months)
  const getLastThreeMonths = () => {
    const months = [];
    const [year, month] = selectedMonth.split('-').map(Number);
    for (let i = 2; i >= 0; i--) {
      const d = new Date(year, month - 1 - i, 1);
      months.push(d.toISOString().slice(0, 7));
    }
    return months;
  };

  const chartData = getLastThreeMonths().map(m => {
    const mBudgets = budgets.filter(b => b.month === m);
    const mExpenses = transactions.filter(t => t.type === 'expense' && t.date.startsWith(m));
    return {
      month: new Date(m + "-01").toLocaleString('default', { month: 'short' }),
      budgeted: mBudgets.reduce((acc, b) => acc + b.limit, 0),
      actual: mExpenses.reduce((acc, t) => acc + t.amount, 0)
    };
  });

  const maxVal = Math.max(...chartData.map(d => Math.max(d.budgeted, d.actual)), 1);

  return (
    <div className="p-container-margin max-w-[1400px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-xl gap-4">
        <div>
          <p className="font-label-md text-label-md text-primary uppercase tracking-widest mb-1">Financial Overview</p>
          <h2 className="font-display-sm text-display-sm font-bold text-on-surface">
            Budget {new Date(selectedMonth + "-01").toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
        </div>
        <div className="flex flex-wrap gap-md w-full md:w-auto">
          <div className="relative">
            <input 
              type="month" 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-lg py-2.5 glass-card rounded-lg flex items-center gap-2 hover:border-primary transition-all outline-none text-sm cursor-pointer [color-scheme:dark]"
            />
          </div>
          <button 
            onClick={() => { setEditingBudget(null); setIsModalOpen(true); }}
            className="px-lg py-2.5 bg-primary text-background font-bold rounded-lg flex items-center gap-2 hover:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Add Budget
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-lg">
        {/* Safe to Spend Indicator (Hero Card) */}
        <div className="col-span-12 lg:col-span-4 glass-card p-lg rounded-xl flex flex-col justify-between overflow-hidden relative group border border-outline-variant/20 shadow-xl">
          <div className="relative z-10">
            <p className="font-label-md text-label-md text-on-surface-variant mb-md uppercase tracking-wider">Safe to Spend Indicator</p>
            <h3 className={`font-display-sm text-display-sm font-bold mb-xs ${dailySafeToSpend > 0 ? 'text-primary' : 'text-error'}`}>
              {formatCurrency(dailySafeToSpend)} <span className="text-body-lg font-normal text-on-surface-variant">/ day</span>
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant opacity-80">
              Remaining for the next {remainingDays} days of {new Date(selectedMonth + "-01").toLocaleString('default', { month: 'long' })}.
            </p>
          </div>
          <div className="mt-xl relative z-10">
            <div className="flex justify-between font-label-md text-label-md mb-xs">
              <span className="text-on-surface-variant uppercase tracking-tighter">Monthly Utilization</span>
              <span className={consumedPercent > 100 ? 'text-error' : 'text-primary'}>{consumedPercent.toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden border border-outline-variant/10">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(consumedPercent, 100)}%` }}
                className={`h-full ${consumedPercent > 100 ? 'bg-error' : 'bg-primary'}`}
              ></motion.div>
            </div>
          </div>
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 blur-[64px] rounded-full group-hover:bg-primary/20 transition-all animate-pulse-glow"></div>
        </div>

        {/* Quick Summary Stats */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-lg">
          <div className="glass-card p-lg rounded-xl flex flex-col border-l-4 border-l-primary shadow-lg">
            <p className="font-label-md text-label-md text-on-surface-variant mb-sm uppercase">Total Budget</p>
            <p className="font-headline-lg text-headline-lg font-bold">{formatCurrency(totalBudget)}</p>
            <div className="mt-auto pt-md flex items-center gap-1 text-primary/60 text-[10px] uppercase font-bold">
              <span className="material-symbols-outlined text-[14px]">info</span>
              Target Limit
            </div>
          </div>
          <div className="glass-card p-lg rounded-xl flex flex-col border-l-4 border-l-secondary-container shadow-lg">
            <p className="font-label-md text-label-md text-on-surface-variant mb-sm uppercase">Total Actual</p>
            <p className="font-headline-lg text-headline-lg font-bold">{formatCurrency(totalActual)}</p>
            <p className="font-label-md text-label-md text-on-surface-variant mt-auto pt-md uppercase text-[10px] font-bold">
              {consumedPercent.toFixed(1)}% consumed
            </p>
          </div>
          <div className="glass-card p-lg rounded-xl flex flex-col border-l-4 border-l-error shadow-lg">
            <p className="font-label-md text-label-md text-on-surface-variant mb-sm uppercase">Over Budget Items</p>
            <p className={`font-headline-lg text-headline-lg font-bold ${overBudgetCount > 0 ? 'text-error' : 'text-primary'}`}>
              {overBudgetCount} Category
            </p>
            <p className={`font-label-md text-label-md mt-auto pt-md uppercase text-[10px] font-bold ${overBudgetCount > 0 ? 'text-error' : 'text-primary/60'}`}>
              {overBudgetCount > 0 ? 'Action Required' : 'Healthy Status'}
            </p>
          </div>
        </div>

        {/* Categories Progress Section */}
        <div className="col-span-12 lg:col-span-7 glass-card p-lg rounded-xl shadow-xl border border-outline-variant/10">
          <div className="flex items-center justify-between mb-xl">
            <h4 className="font-headline-lg text-headline-lg font-bold">Category Breakdown</h4>
            <span className="font-label-md text-label-md text-primary underline cursor-pointer hover:text-primary-fixed-dim transition-colors">Manage Limits</span>
          </div>
          <div className="space-y-xl max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {categoryStats.length === 0 ? (
              <div className="py-20 text-center text-on-surface-variant border border-dashed border-outline-variant rounded-xl">
                No budgets set for this month.
              </div>
            ) : (
              categoryStats.map(stat => (
                <div key={stat.id} className={`group ${stat.actual > stat.limit ? 'p-md rounded-xl bg-error-container/5 border border-error/10' : ''}`}>
                  <div className="flex justify-between items-end mb-sm">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`font-label-md text-label-md ${stat.actual > stat.limit ? 'text-error font-bold' : 'text-on-surface-variant'}`}>{stat.category}</p>
                        {stat.actual > stat.limit && <span className="material-symbols-outlined text-error text-[16px]">warning</span>}
                        <button onClick={() => { setEditingBudget(stat); setIsModalOpen(true); }} className="opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                      </div>
                      <p className={`font-headline-lg text-headline-lg font-bold ${stat.actual > stat.limit ? 'text-error' : 'text-on-surface'}`}>
                        {formatCurrency(stat.actual)} <span className="text-body-md font-normal text-on-surface-variant">/ {formatCurrency(stat.limit)}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-mono-data text-mono-data font-bold ${stat.actual > stat.limit ? 'text-error' : stat.percent > 80 ? 'text-yellow-500' : 'text-primary'}`}>
                        {stat.percent.toFixed(0)}%
                      </p>
                      {stat.actual > stat.limit && (
                        <p className="text-[10px] text-error font-bold uppercase">Over {formatCurrency(stat.actual - stat.limit)}</p>
                      )}
                    </div>
                  </div>
                  <div className="h-3 w-full bg-surface-container-highest rounded-full overflow-hidden border border-outline-variant/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(stat.percent, 100)}%` }}
                      className={`h-full ${stat.actual > stat.limit ? 'bg-error' : stat.percent > 80 ? 'bg-yellow-500' : 'bg-primary'}`}
                    ></motion.div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Budget vs Actual Comparison */}
        <div className="col-span-12 lg:col-span-5 glass-card p-lg rounded-xl shadow-xl border border-outline-variant/10">
          <h4 className="font-headline-lg text-headline-lg font-bold mb-xl">Budget vs Actual</h4>
          <div className="relative h-[280px] flex items-end justify-around gap-md px-4">
            {chartData.map((d, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 w-full max-w-[60px]">
                <div className="flex gap-1.5 w-full h-[200px] items-end justify-center">
                  <motion.div 
                    initial={{ height: 0 }} 
                    animate={{ height: `${(d.budgeted / maxVal) * 100}%` }}
                    className="w-4 bg-primary/20 rounded-t-sm border-t border-primary/30"
                  ></motion.div>
                  <motion.div 
                    initial={{ height: 0 }} 
                    animate={{ height: `${(d.actual / maxVal) * 100}%` }}
                    className={`w-4 rounded-t-sm ${d.actual > d.budgeted && d.budgeted > 0 ? 'bg-error' : 'bg-primary'}`}
                  ></motion.div>
                </div>
                <p className={`font-label-md text-label-md ${idx === 2 ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>{d.month}</p>
              </div>
            ))}
          </div>
          <div className="mt-xl flex justify-center gap-xl border-t border-outline-variant/30 pt-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary/20 border border-primary/30 rounded-sm"></div>
              <span className="font-label-md text-label-md text-on-surface-variant uppercase text-[10px] font-bold">Budgeted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-sm"></div>
              <span className="font-label-md text-label-md text-on-surface-variant uppercase text-[10px] font-bold">Actual</span>
            </div>
          </div>
        </div>

        {/* Recent Overspends / Transactions */}
        <div className="col-span-12 glass-card rounded-xl overflow-hidden shadow-2xl border border-outline-variant/10">
          <div className="p-lg border-b border-outline-variant/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h4 className="font-headline-lg text-headline-lg font-bold">Recent High-Impact Spending</h4>
            <div className="flex items-center gap-md bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant/20 w-full md:w-64">
              <span className="material-symbols-outlined text-on-surface-variant text-sm">search</span>
              <input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-xs w-full text-on-surface" 
                placeholder="Search impacts..." 
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="p-lg font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Description</th>
                  <th className="p-lg font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Category</th>
                  <th className="p-lg font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Amount</th>
                  <th className="p-lg font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Budget Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {highImpact.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-lg text-center text-on-surface-variant">No significant spending found for this period.</td>
                  </tr>
                ) : (
                  highImpact.map(t => {
                    const budget = currentBudgets.find(b => b.category === t.category);
                    const categoryActual = monthlyExpenses.filter(x => x.category === t.category).reduce((acc, x) => acc + x.amount, 0);
                    
                    let impactStatus = 'No Budget';
                    let impactColor = 'text-on-surface-variant';
                    
                    if (budget) {
                      if (categoryActual > budget.limit) {
                        impactStatus = 'Over Budget';
                        impactColor = 'text-error font-bold';
                      } else {
                        impactStatus = 'Within Limits';
                        impactColor = 'text-primary font-bold';
                      }
                    }

                    return (
                      <tr key={t.id} className="hover:bg-surface-variant/40 transition-colors">
                        <td className="p-lg">
                          <div className="flex items-center gap-md">
                            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                              <span className="material-symbols-outlined">{t.category === 'Food & Dining' ? 'restaurant' : t.category === 'Transportation' ? 'directions_car' : 'shopping_bag'}</span>
                            </div>
                            <div>
                              <p className="font-body-md text-body-md font-semibold">{t.note || t.category}</p>
                              <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">{new Date(t.date).toLocaleDateString()} • {t.method}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-lg">
                          <span className={`px-md py-1 rounded-full text-[11px] font-bold ${impactStatus === 'Over Budget' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                            {t.category}
                          </span>
                        </td>
                        <td className="p-lg text-right font-mono-data text-mono-data font-bold text-on-surface">{formatCurrency(t.amount)}</td>
                        <td className={`p-lg text-right text-xs uppercase tracking-tighter ${impactColor}`}>{impactStatus}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Budget Modal */}
      <BudgetModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialData={editingBudget}
        onSave={(data) => {
          if (editingBudget) onUpdateBudget(editingBudget.id, { ...data, month: selectedMonth });
          else onAddBudget({ ...data, month: selectedMonth });
          setIsModalOpen(false);
        }}
        onDelete={(id) => {
          onDeleteBudget(id);
          setIsModalOpen(false);
        }}
        categories={expenseCategories}
      />
    </div>
  );
}

function BudgetModal({ isOpen, onClose, initialData, onSave, onDelete, categories }) {
  const [formData, setFormData] = useState(initialData || { category: categories[0], limit: '' });

  React.useEffect(() => {
    if (initialData) setFormData(initialData);
    else setFormData({ category: categories[0], limit: '' });
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose}></div>
      <div className="asset-modal relative z-[101]">
        <div className="asset-modal-header">
          <h2 className="text-2xl font-bold">{initialData ? 'Edit Budget' : 'Add New Budget'}</h2>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <form className="asset-form" onSubmit={(e) => { e.preventDefault(); onSave({ ...formData, limit: parseFloat(formData.limit) }); }}>
          <div className="asset-field">
            <label>Expense Category</label>
            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="asset-field">
            <label>Monthly Limit (Rp)</label>
            <input required type="number" value={formData.limit} onChange={e => setFormData({...formData, limit: e.target.value})} placeholder="e.g. 1000000" />
          </div>

          <div className="asset-actions">
            {initialData && (
              <button type="button" onClick={() => onDelete(initialData.id)} className="asset-cancel-btn text-error border-error/20 hover:bg-error/10">
                Delete
              </button>
            )}
            {!initialData && <button type="button" onClick={onClose} className="asset-cancel-btn">Cancel</button>}
            <button type="submit" className="asset-save-btn">
              <span className="material-symbols-outlined">save</span>
              {initialData ? 'Update' : 'Set Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Budget;

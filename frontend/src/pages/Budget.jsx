import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import EmptyState from '../components/EmptyState';

function Budget({ transactions, budgets, onAddBudget, onUpdateBudget, onDeleteBudget, t, fm }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
  };

  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const expenseCategories = ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities', 'Investment', 'Business', 'Other'];

  // Filter Data
  const monthlyExpenses = transactions.filter(t_data => t_data.type === 'expense' && t_data.date.startsWith(selectedMonth));
  const currentBudgets = budgets.filter(b => b.month === selectedMonth);

  console.log("Budget Page - Selected Month:", selectedMonth);
  console.log("Budget Page - Current Budgets:", currentBudgets);
  console.log("Budget Page - Monthly Expenses:", monthlyExpenses.length);

  // Metrics
  const totalBudget = currentBudgets.reduce((acc, b) => acc + Number(b.limit_amount || 0), 0);
  const totalActual = monthlyExpenses.reduce((acc, t_data) => acc + t_data.amount, 0);
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
    const actual = monthlyExpenses.filter(t_data => t_data.category === b.category).reduce((acc, t_data) => acc + t_data.amount, 0);
    const limit = Number(b.limit_amount || 0);
    const percent = limit > 0 ? (actual / limit) * 100 : 0;
    return { ...b, actual, percent, limit };
  });

  const overBudgetCount = categoryStats.filter(s => s.actual > s.limit).length;

  // High Impact Spending
  const highImpact = monthlyExpenses
    .filter(t_data => 
      t_data.note?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t_data.category?.toLowerCase().includes(searchTerm.toLowerCase())
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
    const mExpenses = transactions.filter(t_data => t_data.type === 'expense' && t_data.date.startsWith(m));
    return {
      month: new Date(m + "-01").toLocaleString('default', { month: 'short' }),
      budgeted: mBudgets.reduce((acc, b) => acc + Number(b.limit_amount || 0), 0),
      actual: mExpenses.reduce((acc, t_data) => acc + t_data.amount, 0)
    };
  });

  const maxVal = Math.max(...chartData.map(d => Math.max(d.budgeted, d.actual)), 1);

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="p-container-margin max-w-[1400px] mx-auto"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-xl gap-4">
        <div>
          <p className="font-label-md text-label-md text-primary uppercase tracking-widest mb-1">Financial Overview</p>
          <h2 className="font-display-sm text-display-sm font-bold text-on-surface">
            {t('monthlyBudget')} {new Date(selectedMonth + "-01").toLocaleString('default', { month: 'long', year: 'numeric' })}
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
            <p className="font-label-md text-label-md text-on-surface-variant mb-md uppercase tracking-wider">{t('dailySafeToSpend')}</p>
            <h3 className={`font-display-sm text-display-sm font-bold mb-xs ${dailySafeToSpend > 0 ? 'text-primary' : 'text-error'}`}>
              {fm(dailySafeToSpend)} <span className="text-body-lg font-normal text-on-surface-variant">/ day</span>
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
        <motion.div variants={item} className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-lg">
          <div className="glass-card p-lg rounded-xl flex flex-col border-l-4 border-l-primary shadow-lg hover:translate-y-[-4px] transition-transform">
            <p className="font-label-md text-label-md text-on-surface-variant mb-sm uppercase">Total Budget</p>
            <p className="font-headline-lg text-headline-lg font-bold">{fm(totalBudget)}</p>
            <div className="mt-auto pt-md flex items-center gap-1 text-primary/60 text-[10px] uppercase font-bold">
              <span className="material-symbols-outlined text-[14px]">info</span>
              Target Limit
            </div>
          </div>
          <div className="glass-card p-lg rounded-xl flex flex-col border-l-4 border-l-secondary-container shadow-lg hover:translate-y-[-4px] transition-transform">
            <p className="font-label-md text-label-md text-on-surface-variant mb-sm uppercase">Total Actual</p>
            <p className="font-headline-lg text-headline-lg font-bold">{fm(totalActual)}</p>
            <p className="font-label-md text-label-md text-on-surface-variant mt-auto pt-md uppercase text-[10px] font-bold">
              {consumedPercent.toFixed(1)}% consumed
            </p>
          </div>
          <div className="glass-card p-lg rounded-xl flex flex-col border-l-4 border-l-error shadow-lg hover:translate-y-[-4px] transition-transform">
            <p className="font-label-md text-label-md text-on-surface-variant mb-sm uppercase">Over Budget Items</p>
            <p className={`font-headline-lg text-headline-lg font-bold ${overBudgetCount > 0 ? 'text-error' : 'text-primary'}`}>
              {overBudgetCount} Category
            </p>
            <p className={`font-label-md text-label-md mt-auto pt-md uppercase text-[10px] font-bold ${overBudgetCount > 0 ? 'text-error' : 'text-primary/60'}`}>
              {overBudgetCount > 0 ? 'Action Required' : 'Healthy Status'}
            </p>
          </div>
        </motion.div>

        {/* Categories Progress Section */}
        <motion.div variants={item} className="col-span-12 lg:col-span-7 glass-card p-lg rounded-xl shadow-xl border border-outline-variant/10">
          <div className="flex items-center justify-between mb-xl">
            <h4 className="font-headline-lg text-headline-lg font-bold">{t('categoryBreakdown')}</h4>
            <span className="font-label-md text-label-md text-primary underline cursor-pointer hover:text-primary-fixed-dim transition-colors">Manage Limits</span>
          </div>
          <div className="space-y-xl max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {categoryStats.length === 0 ? (
              <EmptyState 
                title="No budgets set" 
                desc="Start setting limits for your spending categories to stay on track." 
                icon="settings_suggest" 
              />
            ) : (
              <div className="space-y-8">
                {categoryStats.map((stat, i) => (
                  <motion.div 
                    key={stat.id} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + (i * 0.05) }}
                    className={`group ${stat.actual > stat.limit ? 'p-md rounded-xl bg-error-container/5 border border-error/10' : ''}`}
                  >
                    <div className="flex justify-between items-end mb-sm">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className={`font-label-md text-label-md ${stat.actual > stat.limit ? 'text-error font-bold' : 'text-on-surface-variant'}`}>{stat.category}</p>
                          {stat.actual > stat.limit && <span className="material-symbols-outlined text-error text-[16px]">warning</span>}
                          <button onClick={() => { setEditingBudget(stat); setIsModalOpen(true); }} className="opacity-0 group-hover:opacity-100 transition-opacity text-primary cursor-pointer">
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                        </div>
                        <p className={`font-headline-lg text-headline-lg font-bold ${stat.actual > stat.limit ? 'text-error' : 'text-on-surface'}`}>
                          {fm(stat.actual)} <span className="text-body-md font-normal text-on-surface-variant">/ {fm(stat.limit)}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-mono-data text-mono-data font-bold ${stat.actual > stat.limit ? 'text-error' : stat.percent > 80 ? 'text-yellow-500' : 'text-primary'}`}>
                          {stat.percent.toFixed(0)}%
                        </p>
                        {stat.actual > stat.limit && (
                          <p className="text-[10px] text-error font-bold uppercase">Over {fm(stat.actual - stat.limit)}</p>
                        )}
                      </div>
                    </div>
                    <div className="h-3 w-full bg-surface-container-highest rounded-full overflow-hidden border border-outline-variant/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(stat.percent, 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.5 + (i * 0.05) }}
                        className={`h-full ${stat.actual > stat.limit ? 'bg-error' : stat.percent > 80 ? 'bg-yellow-500' : 'bg-primary'}`}
                      ></motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Budget vs Actual Comparison */}
        <motion.div variants={item} className="col-span-12 lg:col-span-5 glass-card p-lg rounded-xl shadow-xl border border-outline-variant/10">
          <h4 className="font-headline-lg text-headline-lg font-bold mb-xl">Budget vs Actual</h4>
          <div className="relative h-[280px] flex items-end justify-around gap-md px-4">
            {chartData.map((d, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 w-full max-w-[60px]">
                <div className="flex gap-1.5 w-full h-[200px] items-end justify-center">
                  <motion.div 
                    initial={{ height: 0 }} 
                    animate={{ height: `${(d.budgeted / maxVal) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.5 + (idx * 0.1) }}
                    className="w-4 bg-primary/20 rounded-t-sm border-t border-primary/30"
                  ></motion.div>
                  <motion.div 
                    initial={{ height: 0 }} 
                    animate={{ height: `${(d.actual / maxVal) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.7 + (idx * 0.1) }}
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
        </motion.div>

        {/* Recent Overspends / Transactions */}
        <motion.div variants={item} className="col-span-12 glass-card rounded-xl overflow-hidden shadow-2xl border border-outline-variant/10">
          <div className="p-lg border-b border-outline-variant/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h4 className="font-headline-lg text-headline-lg font-bold">Recent High-Impact Spending</h4>
            <div className="flex items-center gap-md bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant/20 w-full md:w-64 focus-within:w-72 transition-all duration-300">
              <span className="material-symbols-outlined text-on-surface-variant text-sm">search</span>
              <input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-xs w-full text-on-surface" 
                placeholder="Search impacts..." 
              />
            </div>
          </div>
          
          <div className="divide-y divide-outline-variant/10">
            {highImpact.length === 0 ? (
              <EmptyState 
                title="No impacts found" 
                desc="Try a different search or add more transactions." 
                icon="search_off" 
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px] hidden md:table">
                  <thead>
                    <tr className="bg-surface-container-low">
                      <th className="p-lg font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">{t('note')}</th>
                      <th className="p-lg font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">{t('category')}</th>
                      <th className="p-lg font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">{t('amount')}</th>
                      <th className="p-lg font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Budget Impact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {highImpact.map((t_data, i) => {
                      const budget = currentBudgets.find(b => b.category === t_data.category);
                      const categoryActual = monthlyExpenses.filter(x => x.category === t_data.category).reduce((acc, x) => acc + x.amount, 0);
                      
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
                        <motion.tr 
                          key={t_data.id} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + (i * 0.05) }}
                          className="hover:bg-surface-variant/40 transition-colors group"
                        >
                          <td className="p-lg">
                            <div className="flex items-center gap-md">
                              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined">{t_data.category === 'Food & Dining' ? 'restaurant' : t_data.category === 'Transportation' ? 'directions_car' : 'shopping_bag'}</span>
                              </div>
                              <div>
                                <p className="font-body-md text-body-md font-semibold group-hover:text-primary transition-colors">{t_data.note || t_data.category}</p>
                                <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">{new Date(t_data.date).toLocaleDateString()} • {t_data.method}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-lg">
                            <span className={`px-md py-1 rounded-full text-[11px] font-bold ${impactStatus === 'Over Budget' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                              {t_data.category}
                            </span>
                          </td>
                          <td className="p-lg text-right font-mono-data text-mono-data font-bold text-on-surface group-hover:text-primary transition-colors">{fm(t_data.amount)}</td>
                          <td className={`p-lg text-right text-xs uppercase tracking-tighter ${impactColor}`}>{impactStatus}</td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
                
                {/* Mobile version of high impact list */}
                <div className="md:hidden divide-y divide-outline-variant/10">
                  {highImpact.map((t_data, i) => {
                    const budget = currentBudgets.find(b => b.category === t_data.category);
                    const categoryActual = monthlyExpenses.filter(x => x.category === t_data.category).reduce((acc, x) => acc + x.amount, 0);
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
                      <motion.div 
                        key={t_data.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + (i * 0.05) }}
                        className="p-lg active:bg-surface-variant/20 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-md">
                            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                              <span className="material-symbols-outlined">{t_data.category === 'Food & Dining' ? 'restaurant' : t_data.category === 'Transportation' ? 'directions_car' : 'shopping_bag'}</span>
                            </div>
                            <div>
                              <p className="font-body-md text-body-md font-semibold line-clamp-1">{t_data.note || t_data.category}</p>
                              <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">{new Date(t_data.date).toLocaleDateString()} • {t_data.method}</p>
                            </div>
                          </div>
                          <p className="font-mono-data text-mono-data font-bold text-on-surface">{fm(t_data.amount)}</p>
                        </div>
                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-outline-variant/5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${impactStatus === 'Over Budget' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                            {t_data.category}
                          </span>
                          <p className={`text-[10px] uppercase tracking-widest ${impactColor}`}>{impactStatus}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>
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
        t={t}
      />
    </motion.div>
  );
}

function BudgetModal({ isOpen, onClose, initialData, onSave, onDelete, categories, t }) {
  const [formData, setFormData] = useState(initialData || { category: categories[0], limit_amount: '' });

  useEffect(() => {
    if (initialData) setFormData({ category: initialData.category, limit_amount: initialData.limit_amount });
    else setFormData({ category: categories[0], limit_amount: '' });
  }, [initialData, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-md" 
            onClick={onClose}
          ></motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="asset-modal relative z-[101] shadow-2xl overflow-hidden"
          >
            <div className="asset-modal-header border-b border-outline-variant/30 pb-4 mb-6">
              <h2 className="text-2xl font-bold">{initialData ? t('edit') + ' Budget' : t('addBudget')}</h2>
              <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors cursor-pointer text-on-surface-variant">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form className="asset-form space-y-6" onSubmit={(e) => { e.preventDefault(); onSave({ ...formData, limit_amount: parseFloat(formData.limit_amount) }); }}>
              <div className="asset-field focus-ring">
                <label className="text-on-surface-variant text-sm font-medium mb-2 block">{t('category')}</label>
                <select className="w-full h-[52px] bg-surface-container-lowest border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 text-on-surface outline-none cursor-pointer transition-all" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="asset-field focus-ring">
                <label className="text-on-surface-variant text-sm font-medium mb-2 block">{t('amount')}</label>
                <input required type="number" className="w-full h-[52px] bg-surface-container-lowest border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 text-on-surface outline-none transition-all" value={formData.limit_amount} onChange={e => setFormData({...formData, limit_amount: e.target.value})} placeholder="e.g. 1000000" />
              </div>

              <div className="asset-actions flex gap-4 pt-4">
                {initialData && (
                  <button type="button" onClick={() => onDelete(initialData.id)} className="flex-1 h-[52px] text-error border border-error/20 hover:bg-error/10 rounded-xl font-bold transition-all cursor-pointer">
                    {t('delete')}
                  </button>
                )}
                {!initialData && <button type="button" onClick={onClose} className="flex-1 h-[52px] text-on-surface-variant bg-surface-container hover:bg-surface-variant rounded-xl font-bold transition-all cursor-pointer">{t('cancel')}</button>}
                <button type="submit" className="flex-[2] h-[52px] bg-primary text-background rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[0.98] active:scale-[0.95] transition-all cursor-pointer shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined text-[20px]">save</span>
                  {initialData ? t('update') : t('save')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default Budget;

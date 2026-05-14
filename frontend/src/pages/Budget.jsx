import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EmptyState from '../components/EmptyState';

// Helper Functions
const getMonthKey = (date) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const parseAmount = (value) => {
  const cleaned = String(value).replace(/[^\d]/g, "");
  return Number(cleaned || 0);
};

const formatRupiah = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return "Rp 0";
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
};

function Budget({ transactions = [], t, fm }) {
  // 1. State Management
  const [selectedMonthKey, setSelectedMonthKey] = useState(getMonthKey(new Date()));
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [budgets, setBudgets] = useState(() => {
    const saved = localStorage.getItem("budgets");
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed.map(budget => ({
        ...budget,
        limit: Number(budget.limit || 0)
      }));
    } catch (error) {
      console.error("Failed to load budgets from localStorage", error);
      return [];
    }
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("budgets", JSON.stringify(budgets));
  }, [budgets]);

  // 2. Calculations
  const monthlyBudgets = budgets.filter(
    budget => budget.month === selectedMonthKey
  );

  const totalBudget = monthlyBudgets.reduce((sum, budget) => {
    const value = Number(budget.limit);
    return sum + (Number.isFinite(value) ? value : 0);
  }, 0);

  const totalActual = transactions
    .filter(t_data => t_data.type === "expense")
    .filter(t_data => getMonthKey(t_data.date || t_data.createdAt) === selectedMonthKey)
    .reduce((sum, t_data) => {
      const value = Number(t_data.amount);
      return sum + (Number.isFinite(value) ? value : 0);
    }, 0);

  const remainingBudget = totalBudget - totalActual;

  const getRemainingDaysInMonth = () => {
    const now = new Date();
    const [year, month] = selectedMonthKey.split("-").map(Number);
    const lastDay = new Date(year, month, 0).getDate();
    const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month;
    return isCurrentMonth ? Math.max(lastDay - now.getDate() + 1, 1) : lastDay;
  };

  const remainingDays = getRemainingDaysInMonth();
  const safeToSpendPerDay = totalBudget > 0 && remainingDays > 0 ? remainingBudget / remainingDays : 0;
  const consumedPercent = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;

  // Category Breakdown Data
  const categoryStats = monthlyBudgets.map(budget => {
    const actualSpent = transactions
      .filter(t_data => t_data.type === "expense")
      .filter(t_data => t_data.category === budget.category)
      .filter(t_data => getMonthKey(t_data.date || t_data.createdAt) === selectedMonthKey)
      .reduce((sum, t_data) => {
        const value = Number(t_data.amount);
        return sum + (Number.isFinite(value) ? value : 0);
      }, 0);

    const percentage = budget.limit > 0 ? (actualSpent / budget.limit) * 100 : 0;
    return { ...budget, actualSpent, percentage };
  });

  const overBudgetItemsCount = categoryStats.filter(stat => stat.actualSpent > stat.limit).length;

  // High Impact Spending
  const monthlyExpenses = transactions.filter(t_data => t_data.type === 'expense' && getMonthKey(t_data.date || t_data.createdAt) === selectedMonthKey);
  const highImpact = monthlyExpenses
    .filter(t_data => 
      (t_data.note || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (t_data.category || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Chart Data
  const getLastThreeMonths = () => {
    const months = [];
    const [year, month] = selectedMonthKey.split('-').map(Number);
    for (let i = 2; i >= 0; i--) {
      const d = new Date(year, month - 1 - i, 1);
      months.push(getMonthKey(d));
    }
    return months;
  };

  const chartData = getLastThreeMonths().map(m => {
    const mBudgets = budgets.filter(b => b.month === m);
    const mExpenses = transactions.filter(t_data => t_data.type === 'expense' && getMonthKey(t_data.date || t_data.createdAt) === m);
    return {
      monthLabel: new Date(m + "-01").toLocaleString('default', { month: 'short' }),
      budgeted: mBudgets.reduce((acc, b) => acc + Number(b.limit || 0), 0),
      actual: mExpenses.reduce((acc, t_data) => acc + Number(t_data.amount || 0), 0)
    };
  });

  const maxVal = Math.max(...chartData.map(d => Math.max(d.budgeted, d.actual)), 1);

  // CRUD Handlers
  const handleSaveBudget = (formData) => {
    const numericLimit = parseAmount(formData.limit);
    if (!formData.category || numericLimit <= 0) return;

    if (editingBudget) {
      setBudgets(prev => prev.map(b => b.id === editingBudget.id ? { ...b, ...formData, limit: numericLimit, updatedAt: new Date().toISOString() } : b));
    } else {
      setBudgets(prev => [...prev, { 
        id: crypto.randomUUID(), 
        ...formData, 
        limit: numericLimit, 
        month: selectedMonthKey,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }]);
    }
    setIsBudgetModalOpen(false);
    setEditingBudget(null);
  };

  const handleDeleteBudget = (id) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } } };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-4 md:p-container-margin max-w-[1400px] mx-auto overflow-x-hidden">
      <div className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded mb-4 inline-block">BUDGET DEBUG ACTIVE</div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-xl gap-6">
        <div>
          <p className="font-label-md text-label-md text-primary uppercase tracking-widest mb-1">Financial Overview</p>
          <h2 className="text-2xl md:font-display-sm md:text-display-sm font-bold text-on-surface">
            {t('monthlyBudget')} {new Date(selectedMonthKey + "-01").toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <input type="month" value={selectedMonthKey} onChange={(e) => setSelectedMonthKey(e.target.value)} className="w-full px-lg py-2.5 glass-card rounded-lg flex items-center gap-2 hover:border-primary transition-all outline-none text-sm cursor-pointer [color-scheme:dark]" />
          <button onClick={() => { setEditingBudget(null); setIsBudgetModalOpen(true); }} className="w-full sm:w-auto px-lg py-2.5 bg-primary text-background font-bold rounded-lg flex items-center justify-center gap-2 hover:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-[20px]">add</span> {t('addBudget')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-lg">
        <div className="col-span-12 lg:col-span-4 glass-card p-6 md:p-lg rounded-xl flex flex-col justify-between overflow-hidden relative group border border-outline-variant/20 shadow-xl">
          <div className="relative z-10">
            <p className="font-label-md text-label-md text-on-surface-variant mb-4 md:mb-md uppercase tracking-wider">{t('dailySafeToSpend')}</p>
            <h3 className={`text-2xl md:text-display-sm font-bold mb-xs ${safeToSpendPerDay > 0 ? 'text-primary' : 'text-error'}`}>
              {fm(safeToSpendPerDay)} <span className="text-base md:text-body-lg font-normal text-on-surface-variant">/ day</span>
            </h3>
            <p className="text-sm md:font-body-md md:text-body-md text-on-surface-variant opacity-80">Remaining for the next {remainingDays} days.</p>
          </div>
          <div className="mt-8 md:mt-xl relative z-10">
            <div className="flex justify-between font-label-md text-label-md mb-xs">
              <span className="text-on-surface-variant uppercase tracking-tighter">Monthly Utilization</span>
              <span className={consumedPercent > 100 ? 'text-error' : 'text-primary'}>{consumedPercent.toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden border border-outline-variant/10">
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(consumedPercent, 100)}%` }} className={`h-full ${consumedPercent > 100 ? 'bg-error' : 'bg-primary'}`}></motion.div>
            </div>
          </div>
        </div>

        <motion.div variants={item} className="col-span-12 lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-lg">
          <div className="glass-card p-6 md:p-lg rounded-xl flex flex-col border-l-4 border-l-primary shadow-lg hover:translate-y-[-4px] transition-transform">
            <p className="font-label-md text-label-md text-on-surface-variant mb-2 md:mb-sm uppercase">Total Budget</p>
            <p className="text-xl md:text-headline-lg font-bold">{fm(totalBudget)}</p>
          </div>
          <div className="glass-card p-6 md:p-lg rounded-xl flex flex-col border-l-4 border-l-secondary-container shadow-lg hover:translate-y-[-4px] transition-transform">
            <p className="font-label-md text-label-md text-on-surface-variant mb-2 md:mb-sm uppercase">Total Actual</p>
            <p className="text-xl md:text-headline-lg font-bold">{fm(totalActual)}</p>
          </div>
          <div className="glass-card p-6 md:p-lg rounded-xl flex flex-col border-l-4 border-l-error shadow-lg sm:col-span-2 md:col-span-1 hover:translate-y-[-4px] transition-transform">
            <p className="font-label-md text-label-md text-on-surface-variant mb-2 md:mb-sm uppercase">Over Budget</p>
            <p className={`text-xl md:text-headline-lg font-bold ${overBudgetItemsCount > 0 ? 'text-error' : 'text-primary'}`}>{overBudgetItemsCount} Category</p>
          </div>
        </motion.div>

        <motion.div variants={item} className="col-span-12 lg:col-span-7 glass-card p-6 md:p-lg rounded-xl shadow-xl border border-outline-variant/10">
          <div className="flex items-center justify-between mb-8 md:mb-xl">
            <h4 className="text-lg md:text-headline-lg font-bold">{t('categoryBreakdown')}</h4>
            <span onClick={() => setIsManageModalOpen(true)} className="text-xs md:font-label-md md:text-label-md text-primary underline cursor-pointer">{t('manageLimits')}</span>
          </div>
          <div className="space-y-8 md:space-y-xl max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {categoryStats.length === 0 ? <EmptyState title="No budgets set" desc="Start setting limits." icon="settings_suggest" /> : categoryStats.map((stat, i) => (
              <motion.div key={stat.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + (i * 0.05) }} className="group">
                <div className="flex justify-between items-end mb-4">
                  <div className="flex-1">
                    <p className={`text-xs md:text-label-md ${stat.percentage > 100 ? 'text-error' : ''}`}>{stat.category}</p>
                    <p className={`text-lg md:text-headline-lg font-bold ${stat.percentage > 100 ? 'text-error' : ''}`}>
                      {fm(stat.actualSpent)} <span className="text-xs md:text-body-md font-normal text-on-surface-variant">/ {fm(stat.limit)}</span>
                    </p>
                  </div>
                  <p className={`text-sm md:text-mono-data font-bold ${stat.percentage > 100 ? 'text-error' : 'text-primary'}`}>{stat.percentage.toFixed(0)}%</p>
                </div>
                <div className="h-2.5 w-full bg-surface-container-highest rounded-full overflow-hidden border border-outline-variant/5">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(stat.percentage, 100)}%` }} className={`h-full ${stat.percentage > 100 ? 'bg-error' : 'bg-primary'}`}></motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={item} className="col-span-12 lg:col-span-5 glass-card p-6 md:p-lg rounded-xl shadow-xl border border-outline-variant/10">
          <h4 className="text-lg md:text-headline-lg font-bold mb-8">Budget vs Actual</h4>
          <div className="relative h-[220px] flex items-end justify-around gap-2 px-2">
            {chartData.map((d, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 w-full max-w-[40px]">
                <div className="flex gap-1 w-full h-[150px] items-end justify-center">
                  <div className="w-3 bg-primary/20 rounded-t-sm" style={{ height: `${(d.budgeted / maxVal) * 100}%` }}></div>
                  <div className={`w-3 rounded-t-sm ${d.actual > d.budgeted ? 'bg-error' : 'bg-primary'}`} style={{ height: `${(d.actual / maxVal) * 100}%` }}></div>
                </div>
                <p className="text-[10px] text-on-surface-variant">{d.monthLabel}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* High Impact Spending */}
        <motion.div variants={item} className="col-span-12 glass-card rounded-xl overflow-hidden shadow-2xl border border-outline-variant/10">
          <div className="p-6 md:p-lg border-b border-outline-variant/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h4 className="text-lg md:text-headline-lg font-bold">Recent High-Impact Spending</h4>
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
          <div className="overflow-x-auto custom-scrollbar">
            {highImpact.length === 0 ? (
              <EmptyState 
                title="No impacts found" 
                desc="Try a different search or add more transactions." 
                icon="search_off" 
              />
            ) : (
              <table className="w-full text-left border-collapse min-w-[600px] md:min-w-0">
                <thead>
                  <tr className="bg-surface-container-low">
                    <th className="p-4 md:p-lg font-label-md text-[10px] md:text-label-md text-on-surface-variant uppercase tracking-wider">{t('description')}</th>
                    <th className="p-4 md:p-lg font-label-md text-[10px] md:text-label-md text-on-surface-variant uppercase tracking-wider">{t('category')}</th>
                    <th className="p-4 md:p-lg font-label-md text-[10px] md:text-label-md text-on-surface-variant uppercase tracking-wider text-right">{t('amount')}</th>
                    <th className="p-4 md:p-lg font-label-md text-[10px] md:text-label-md text-on-surface-variant uppercase tracking-wider text-right">Budget Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {highImpact.map((t_data, i) => {
                    const budget = monthlyBudgets.find(b => b.category === t_data.category);
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
                        <td className="p-4 md:p-lg">
                          <div className="flex items-center gap-3 md:gap-md">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
                              <span className="material-symbols-outlined text-[18px] md:text-[24px]">payments</span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm md:text-body-md font-semibold truncate group-hover:text-primary transition-colors">{t_data.note || t_data.category}</p>
                              <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">{new Date(t_data.date).toLocaleDateString()} • {t_data.method}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 md:p-lg">
                          <span className={`px-2 md:px-md py-1 rounded-full text-[10px] md:text-[11px] font-bold inline-block whitespace-nowrap ${impactStatus === 'Over Budget' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                            {t_data.category}
                          </span>
                        </td>
                        <td className="p-4 md:p-lg text-right font-mono-data text-xs md:text-mono-data font-bold text-on-surface group-hover:text-primary transition-colors">{fm(t_data.amount)}</td>
                        <td className={`p-4 md:p-lg text-right text-[10px] md:text-xs uppercase tracking-tighter ${impactColor}`}>{impactStatus}</td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </div>

      <BudgetModal isOpen={isBudgetModalOpen} onClose={() => { setIsBudgetModalOpen(false); setEditingBudget(null); }} initialData={editingBudget} onSave={handleSaveBudget} t={t} />
      <ManageLimitsModal isOpen={isManageModalOpen} onClose={() => setIsManageModalOpen(false)} monthlyBudgets={monthlyBudgets} onEdit={(b) => { setEditingBudget(b); setIsBudgetModalOpen(true); }} onDelete={handleDeleteBudget} onAdd={() => { setEditingBudget(null); setIsBudgetModalOpen(true); }} t={t} />
    </motion.div>
  );
}

function BudgetModal({ isOpen, onClose, initialData, onSave, t }) {
  const categories = ['Food & Dining', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'];
  const [formData, setFormData] = useState({ category: categories[0], limit: '' });
  useEffect(() => {
    if (initialData) setFormData({ category: initialData.category, limit: initialData.limit.toString() });
    else setFormData({ category: categories[0], limit: '' });
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose}></div>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="asset-modal relative z-[201] w-full max-w-md">
        <div className="asset-modal-header">
          <h2 className="text-2xl font-bold">{initialData ? t('editBudget') : t('addBudget')}</h2>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors cursor-pointer"><span className="material-symbols-outlined">close</span></button>
        </div>
        <form className="asset-form" onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
          <div className="asset-field">
            <label>{t('category')}</label>
            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select>
          </div>
          <div className="asset-field">
            <label>{t('monthlyLimit')} (Rp)</label>
            <input required type="text" inputMode="numeric" value={formData.limit} onChange={e => setFormData({...formData, limit: e.target.value.replace(/[^\d]/g, '')})} placeholder="e.g. 1.000.000" />
            <p className="text-[10px] text-on-surface-variant mt-1 italic">Format: {formatRupiah(parseAmount(formData.limit))}</p>
          </div>
          <div className="asset-actions mt-6">
            <button type="button" onClick={onClose} className="asset-cancel-btn">{t('cancel')}</button>
            <button type="submit" className="asset-save-btn"><span className="material-symbols-outlined">save</span>{initialData ? t('update') : t('save')}</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function ManageLimitsModal({ isOpen, onClose, monthlyBudgets, onEdit, onDelete, onAdd, t }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose}></div>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="asset-modal relative z-[151] w-full max-w-lg">
        <div className="asset-modal-header">
          <h2 className="text-2xl font-bold">{t('manageLimits')}</h2>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors cursor-pointer"><span className="material-symbols-outlined">close</span></button>
        </div>
        <div className="p-lg space-y-md max-h-[60vh] overflow-y-auto custom-scrollbar">
          {monthlyBudgets.length === 0 ? <p className="text-center py-8 text-on-surface-variant italic">{t('noLimitsSet')}</p> : monthlyBudgets.map(b => (
            <div key={b.id} className="flex justify-between items-center p-md glass-card rounded-xl border border-outline-variant/20">
              <div><p className="font-bold text-on-surface">{b.category}</p><p className="text-sm text-primary">{formatRupiah(b.limit)}</p></div>
              <div className="flex gap-2">
                <button onClick={() => onEdit(b)} className="p-2 text-primary hover:bg-primary/10 rounded-full"><span className="material-symbols-outlined">edit</span></button>
                <button onClick={() => onDelete(b.id)} className="p-2 text-error hover:bg-error/10 rounded-full"><span className="material-symbols-outlined">delete</span></button>
              </div>
            </div>
          ))}
        </div>
        <div className="p-lg border-t border-outline-variant/20 flex justify-between gap-4">
          <button onClick={onClose} className="asset-cancel-btn flex-1">{t('close')}</button>
          <button onClick={() => { onClose(); onAdd(); }} className="asset-save-btn flex-1"><span className="material-symbols-outlined">add</span>{t('addNew')}</button>
        </div>
      </motion.div>
    </div>
  );
}

export default Budget;

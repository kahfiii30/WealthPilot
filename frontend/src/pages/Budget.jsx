import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EmptyState from '../components/EmptyState';
import { getMonthKey, isValidDate } from '../services/financeService';
import { formatDate } from '../utils/dateUtils';

// Helper Functions
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

function Budget({ transactions = [], budgets = [], onAddBudget, onUpdateBudget, onDeleteBudget, t, fm }) {
  // 1. State Management
  const [selectedMonthKey, setSelectedMonthKey] = useState(getMonthKey(new Date()));
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 2. Flags from localStorage
  useEffect(() => {
    const shouldOpen = localStorage.getItem("openBudgetModalOnLoad");
    if (shouldOpen === "true") {
      setIsBudgetModalOpen(true);
      localStorage.removeItem("openBudgetModalOnLoad");
    }
  }, []);

  // 3. Calculations
  const monthlyBudgets = budgets.filter(
    b => b.month === selectedMonthKey
  );

  const totalBudget = monthlyBudgets.reduce((sum, b) => {
    return sum + (Number.isFinite(b.limit) ? b.limit : 0);
  }, 0);

  const totalActual = transactions
    .filter(t_data => t_data.type === "expense")
    .filter(t_data => getMonthKey(t_data.date || t_data.createdAt) === selectedMonthKey)
    .reduce((sum, t_data) => {
      return sum + (Number.isFinite(t_data.amount) ? t_data.amount : 0);
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
  const cStats = monthlyBudgets.map(b => {
    const actualSpent = transactions
      .filter(t_data => t_data.type === "expense")
      .filter(t_data => t_data.category === b.category)
      .filter(t_data => getMonthKey(t_data.date || t_data.createdAt) === selectedMonthKey)
      .reduce((sum, t_data) => {
        return sum + (Number.isFinite(t_data.amount) ? t_data.amount : 0);
      }, 0);

    const percentage = b.limit > 0 ? (actualSpent / b.limit) * 100 : 0;
    return { ...b, actualSpent, percentage };
  });

  const overBudgetItemsCount = cStats.filter(s => s.actualSpent > s.limit).length;

  // High Impact Spending
  const monthlyExpenses = transactions.filter(t_data => t_data.type === 'expense' && getMonthKey(t_data.date || t_data.createdAt) === selectedMonthKey);
  const highImpact = monthlyExpenses
    .filter(t_data => 
      (t_data.notes || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (t_data.category || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Chart Data
  const getLastThreeMonths = () => {
    const monthsArr = [];
    const [year, month] = selectedMonthKey.split('-').map(Number);
    for (let idx = 2; idx >= 0; idx--) {
      const d = new Date(year, month - 1 - idx, 1);
      monthsArr.push(getMonthKey(d));
    }
    return monthsArr;
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

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSaveBudget = async (formData) => {
    const numericLimit = parseAmount(formData.limit);
    if (!formData.category || numericLimit <= 0) return;

    try {
      setIsSaving(true);
      setError(null);
      if (editingBudget) {
        await onUpdateBudget(editingBudget.id, {
          category: formData.category,
          limit: numericLimit,
          month: selectedMonthKey
        });
      } else {
        await onAddBudget({
          category: formData.category,
          limit: numericLimit,
          month: selectedMonthKey
        });
      }
      setIsBudgetModalOpen(false);
      setEditingBudget(null);
    } catch (err) {
      console.error("Failed to save budget:", err);
      setError(err.message || "Failed to save budget");
    } finally {
      setIsSaving(false);
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } } };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="p-8 max-w-[1400px] mx-auto overflow-x-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-2 ml-1">Strategy Center</p>
          <h2 className="text-4xl font-black text-slate-100 tracking-tighter">
            {t('monthlyBudget')} {new Date(selectedMonthKey + "-01").toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <input 
            type="month" 
            value={selectedMonthKey} 
            onChange={(e) => setSelectedMonthKey(e.target.value)} 
            className="rounded-xl border border-slate-700/40 bg-slate-950/55 px-6 py-3 text-slate-100 placeholder:text-slate-500 outline-none backdrop-blur transition-all duration-200 focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/10 cursor-pointer [color-scheme:dark]" 
          />
          <button 
            onClick={() => { setEditingBudget(null); setIsBudgetModalOpen(true); }} 
            className="rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 px-6 py-3 font-semibold text-slate-950 shadow-[0_0_30px_rgba(74,222,128,0.20)] transition-all duration-200 hover:from-emerald-300 hover:to-emerald-400 hover:shadow-[0_0_40px_rgba(74,222,128,0.28)] flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined font-bold text-[20px]">add</span> 
            {t('addBudget')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 mb-8">
        <div className="col-span-12 lg:col-span-4 rounded-2xl border border-slate-700/30 bg-gradient-to-br from-slate-900/80 via-slate-900/55 to-blue-950/30 p-8 flex flex-col justify-between shadow-xl backdrop-blur-xl transition-colors duration-200 ease-out hover:border-emerald-400/30 group">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4">{t('dailySafeToSpend')}</p>
            <h3 className={`text-5xl font-black tracking-tighter mb-2 ${safeToSpendPerDay > 0 ? 'text-emerald-400' : 'text-red-300'}`}>
              {fm(safeToSpendPerDay)} <span className="text-lg font-bold text-slate-500">/ day</span>
            </h3>
            <p className="text-sm font-bold text-slate-500 tracking-tight">Remaining for the next {remainingDays} days.</p>
          </div>
          <div className="mt-10 relative z-10">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
              <span className="text-slate-500">Monthly Utilization</span>
              <span className={consumedPercent > 100 ? 'text-red-300' : 'text-emerald-400'}>{consumedPercent.toFixed(1)}%</span>
            </div>
            <div className="h-4 w-full bg-slate-700/45 rounded-full overflow-hidden border border-slate-700/20 shadow-inner">
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(consumedPercent, 100)}%` }} className={`h-full bg-gradient-to-r ${consumedPercent > 100 ? 'from-red-400 to-red-500 shadow-[0_0_15px_rgba(248,113,113,0.3)]' : 'from-emerald-400 to-emerald-500 shadow-[0_0_15px_rgba(74,222,128,0.3)]'}`}></motion.div>
            </div>
          </div>
        </div>

        <motion.div variants={itemVariants} className="col-span-12 lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          <div className="rounded-2xl border border-slate-700/30 bg-slate-900/55 p-8 flex flex-col border-l-4 border-l-emerald-400 shadow-xl transition-colors duration-200 hover:bg-slate-900/70">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Total Budget</p>
            <p className="text-3xl font-black text-slate-100 tracking-tighter">{fm(totalBudget)}</p>
          </div>
          <div className="rounded-2xl border border-slate-700/30 bg-slate-900/55 p-8 flex flex-col border-l-4 border-l-sky-400 shadow-xl transition-colors duration-200 hover:bg-slate-900/70">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Total Actual</p>
            <p className="text-3xl font-black text-slate-100 tracking-tighter">{fm(totalActual)}</p>
          </div>
          <div className="rounded-2xl border border-slate-700/30 bg-slate-900/55 p-8 flex flex-col border-l-4 border-l-red-400 shadow-xl transition-colors duration-200 hover:bg-slate-900/70 sm:col-span-2 md:col-span-1">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Over Budget</p>
            <p className={`text-3xl font-black tracking-tighter ${overBudgetItemsCount > 0 ? 'text-red-300' : 'text-emerald-400'}`}>{overBudgetItemsCount} Category</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="col-span-12 lg:col-span-7 rounded-2xl border border-slate-700/30 bg-slate-900/55 p-8 shadow-xl backdrop-blur-xl transition-colors duration-200 hover:border-emerald-400/30 hover:bg-slate-900/70">
          <div className="flex items-center justify-between mb-10">
            <h4 className="text-2xl font-black text-slate-100 tracking-tight">{t('categoryBreakdown')}</h4>
            <span onClick={() => setIsManageModalOpen(true)} className="text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 underline cursor-pointer transition-colors">{t('manageLimits')}</span>
          </div>
          <div className="space-y-8 max-h-[500px] overflow-y-auto pr-4 no-scrollbar">
            {cStats.length === 0 ? <EmptyState title="No budgets set" desc="Start setting limits." icon="settings_suggest" /> : cStats.map((sObj, sIdx) => (
              <motion.div key={sObj.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + (sIdx * 0.05) }} className="group">
                <div className="flex justify-between items-end mb-3">
                  <div className="flex-1">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${sObj.percentage > 100 ? 'text-red-300' : 'text-slate-500'}`}>{sObj.category}</p>
                    <p className={`text-xl font-black tracking-tight ${sObj.percentage > 100 ? 'text-red-300' : 'text-slate-100'}`}>
                      {fm(sObj.actualSpent)} <span className="text-xs font-bold text-slate-500 tracking-tight">/ {fm(sObj.limit)}</span>
                    </p>
                  </div>
                  <p className={`text-sm font-black tracking-widest ${sObj.percentage > 100 ? 'text-red-300' : 'text-emerald-400'}`}>{sObj.percentage.toFixed(0)}%</p>
                </div>
                <div className="h-2.5 w-full bg-slate-700/45 rounded-full overflow-hidden border border-slate-700/20 shadow-inner">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(sObj.percentage, 100)}%` }} className={`h-full bg-gradient-to-r ${sObj.percentage > 100 ? 'from-red-400 to-red-500' : 'from-emerald-400 to-sky-400'}`}></motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="col-span-12 lg:col-span-5 rounded-2xl border border-slate-700/30 bg-slate-900/55 p-8 shadow-xl backdrop-blur-xl transition-colors duration-200 hover:border-emerald-400/30 hover:bg-slate-900/70">
          <h4 className="text-2xl font-black text-slate-100 tracking-tight mb-10">Budget vs Actual</h4>
          <div className="relative h-[220px] flex items-end justify-around gap-4 px-2">
            {chartData.map((d, idx) => (
              <div key={idx} className="flex flex-col items-center gap-3 w-full max-w-[50px]">
                <div className="flex gap-2 w-full h-[150px] items-end justify-center">
                  <div className="w-3.5 bg-slate-700/45 rounded-t-lg transition-all duration-500" style={{ height: `${(d.budgeted / maxVal) * 100}%` }}></div>
                  <div className={`w-3.5 rounded-t-lg shadow-[0_0_15px_rgba(74,222,128,0.2)] transition-all duration-500 ${d.actual > d.budgeted ? 'bg-gradient-to-b from-red-400 to-red-600' : 'bg-gradient-to-b from-emerald-400 to-emerald-600'}`} style={{ height: `${(d.actual / maxVal) * 100}%` }}></div>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{d.monthLabel}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* High Impact Spending */}
        <motion.div variants={itemVariants} className="col-span-12 rounded-2xl border border-slate-700/30 bg-slate-900/55 shadow-xl backdrop-blur-xl overflow-hidden transition-colors duration-200 hover:border-emerald-400/30">
          <div className="p-8 border-b border-slate-700/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <h4 className="text-2xl font-black text-slate-100 tracking-tight">Recent High-Impact Spending</h4>
            <div className="relative w-full md:w-64 group transition-all duration-300">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors">search</span>
              <input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 bg-slate-950/55 border border-slate-700/40 rounded-xl pl-12 pr-4 text-slate-100 placeholder:text-slate-500 outline-none backdrop-blur transition-all duration-200 focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/10 text-sm shadow-inner" 
                placeholder="Search impacts..." 
              />
            </div>
          </div>
          <div className="overflow-x-auto no-scrollbar">
            {highImpact.length === 0 ? (
              <EmptyState 
                title="No impacts found" 
                desc="Try a different search or add more transactions." 
                icon="search_off" 
              />
            ) : (
              <table className="w-full text-left border-collapse min-w-[600px] md:min-w-0">
                <thead>
                  <tr className="bg-slate-950/35">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t('description')}</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t('category')}</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t('amount')}</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Budget Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {highImpact.map((tItem, idx) => {
                    const bMatch = monthlyBudgets.find(b => b.category === tItem.category);
                    const cActualVal = monthlyExpenses.filter(x => x.category === tItem.category).reduce((acc, x) => acc + x.amount, 0);
                    
                    let iLabel = 'No Budget';
                    let iLabelColor = 'text-slate-500';
                    
                    if (bMatch) {
                      if (cActualVal > bMatch.limit) {
                        iLabel = 'Over Budget';
                        iLabelColor = 'text-red-300 font-black';
                      } else {
                        iLabel = 'Within Limits';
                        iLabelColor = 'text-emerald-400 font-black';
                      }
                    }

                    return (
                      <motion.tr 
                        key={tItem.id} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + (idx * 0.05) }}
                        className="hover:bg-slate-800/30 transition-colors duration-200 group"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl bg-slate-800/50 border border-slate-700/30 flex items-center justify-center text-emerald-400 transition-colors duration-200">
                              <span className="material-symbols-outlined font-bold text-[20px]">payments</span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-100 truncate group-hover:text-emerald-400 transition-colors tracking-tight">{tItem.notes || tItem.category}</p>
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{formatDate(tItem.date)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest inline-block border ${iLabel === 'Over Budget' ? 'bg-red-500/10 text-red-300 border-red-500/20' : 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'}`}>
                            {tItem.category}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right font-black tracking-tighter text-lg text-slate-100 group-hover:text-emerald-400 transition-colors">{fm(tItem.amount)}</td>
                        <td className={`px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest ${iLabelColor}`}>{iLabel}</td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </div>

      <BudgetModal isOpen={isBudgetModalOpen} onClose={() => { setIsBudgetModalOpen(false); setEditingBudget(null); setError(null); }} initialData={editingBudget} onSave={handleSaveBudget} t={t} isSaving={isSaving} error={error} />
      <ManageLimitsModal isOpen={isManageModalOpen} onClose={() => setIsManageModalOpen(false)} monthlyBudgets={monthlyBudgets} onEdit={(b) => { setEditingBudget(b); setIsBudgetModalOpen(true); }} onDelete={onDeleteBudget} onAdd={() => { setEditingBudget(null); setIsBudgetModalOpen(true); }} t={t} />
    </motion.div>
  );
}

function BudgetModal({ isOpen, onClose, initialData, onSave, t, isSaving, error }) {
  const categories = ['Food & Dining', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'];
  const [formData, setFormData] = useState({ category: categories[0], limit: '' });

  useEffect(() => {
    if (initialData) setFormData({ category: initialData.category, limit: initialData.limit.toString() });
    else setFormData({ category: categories[0], limit: '' });
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose}></div>
      <motion.div 
        initial={{ opacity: 0, y: 16 }} 
        animate={{ opacity: 1, y: 0 }} 
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-[201] w-full max-w-[560px] min-w-[320px] rounded-3xl border border-slate-700/30 bg-slate-900/95 p-8 shadow-2xl backdrop-blur-xl"
        style={{
          width: "100%",
          maxWidth: "560px",
          minWidth: "320px"
        }}
      >
        <div className="mb-8 flex items-start justify-between gap-4">
          <h2 className="text-3xl font-black text-slate-100 tracking-tight whitespace-normal">
            {initialData ? t('editBudget') : t('addBudget')}
          </h2>

          <button 
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex items-center gap-3">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}

        <form className="w-full space-y-6" onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
          <div className="w-full space-y-2">
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400 ml-1">
              {t('category')}
            </label>
            <select 
              value={formData.category} 
              onChange={e => setFormData({...formData, category: e.target.value})}
              className="block h-12 w-full min-w-0 rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 text-slate-100 outline-none transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/10 appearance-none cursor-pointer font-bold"
            >
              {categories.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
            </select>
          </div>

          <div className="w-full space-y-2">
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400 ml-1">
              {t('monthlyLimit')}
            </label>
            <div className="relative group">
              <input 
                required 
                type="text" 
                inputMode="numeric" 
                value={formData.limit} 
                onChange={e => setFormData({...formData, limit: e.target.value.replace(/[^\d]/g, '')})} 
                placeholder="e.g. 1.000.000" 
                className="block h-12 w-full min-w-0 rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 text-slate-100 outline-none transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/10 text-lg font-bold"
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 font-bold pointer-events-none group-focus-within:text-emerald-400/50 transition-colors">IDR</div>
            </div>
            <p className="text-[10px] font-bold text-emerald-400/70 mt-2 ml-1 italic tracking-tight">
              Format: {formatRupiah(parseAmount(formData.limit))}
            </p>
          </div>

          <div className="mt-10 flex w-full flex-col-reverse gap-4 sm:flex-row sm:justify-end">
            <button 
              type="button" 
              onClick={onClose} 
              className="h-12 w-full rounded-xl border border-slate-700/50 px-8 font-semibold text-slate-300 transition hover:bg-slate-800 sm:w-auto"
            >
              {t('cancel')}
            </button>
            <button 
              type="submit" 
              disabled={isSaving}
              className={`h-12 w-full rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 px-10 font-black text-slate-950 shadow-[0_0_30px_rgba(74,222,128,0.20)] transition hover:from-emerald-300 hover:to-emerald-400 sm:w-auto flex items-center justify-center gap-2 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="material-symbols-outlined font-bold">save</span>
              )}
              {initialData ? t('update') : t('save')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function ManageLimitsModal({ isOpen, onClose, monthlyBudgets, onEdit, onDelete, onAdd, t }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose}></div>
      <motion.div 
        initial={{ opacity: 0, y: 16 }} 
        animate={{ opacity: 1, y: 0 }} 
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-[151] w-full max-w-[560px] min-w-[320px] rounded-3xl border border-slate-700/30 bg-slate-900/95 shadow-2xl backdrop-blur-xl overflow-hidden"
        style={{
          width: "100%",
          maxWidth: "560px",
          minWidth: "320px"
        }}
      >
        <div className="p-8 border-b border-slate-700/30 flex justify-between items-center gap-4">
          <h2 className="text-3xl font-black text-slate-100 tracking-tight whitespace-normal">{t('manageLimits')}</h2>
          <button 
            onClick={onClose} 
            className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined font-bold">close</span>
          </button>
        </div>
        <div className="p-8 space-y-5 max-h-[50vh] overflow-y-auto no-scrollbar bg-slate-950/20">
          {monthlyBudgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="material-symbols-outlined text-slate-700 text-5xl mb-4">analytics</span>
              <p className="text-slate-500 italic font-bold tracking-tight">{t('noLimitsSet')}</p>
            </div>
          ) : (
            monthlyBudgets.map(bItem => (
              <div key={bItem.id} className="flex justify-between items-center p-6 bg-slate-900/40 rounded-2xl border border-slate-700/30 hover:border-emerald-400/30 transition-all group">
                <div>
                  <p className="font-black text-slate-100 tracking-tight group-hover:text-emerald-400 transition-colors mb-1">{bItem.category}</p>
                  <p className="text-lg font-black text-emerald-400 tracking-tighter">{formatRupiah(bItem.limit)}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => onEdit(bItem)} className="w-11 h-11 flex items-center justify-center text-emerald-400 hover:bg-emerald-400/10 rounded-xl border border-emerald-400/10 transition-all"><span className="material-symbols-outlined font-bold text-xl">edit</span></button>
                  <button onClick={() => onDelete(bItem.id)} className="w-11 h-11 flex items-center justify-center text-red-400 hover:bg-red-400/10 rounded-xl border border-red-400/10 transition-all"><span className="material-symbols-outlined font-bold text-xl">delete</span></button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-8 border-t border-slate-700/30 flex flex-col sm:flex-row gap-4 bg-slate-900/80">
          <button onClick={onClose} className="flex-1 h-12 rounded-xl border border-slate-700/50 text-slate-400 font-bold hover:bg-slate-800 hover:text-slate-100 transition-all">{t('close')}</button>
          <button onClick={() => { onClose(); onAdd(); }} className="flex-1 h-12 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 text-slate-950 font-black shadow-[0_0_20px_rgba(74,222,128,0.2)] hover:from-emerald-300 hover:to-emerald-400 transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined font-bold">add</span>
            {t('addNew')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default Budget;

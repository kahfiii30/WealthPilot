import { useState } from 'react';
import { motion } from 'framer-motion';
import { getMonthKey } from '../services/financeService';
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

function Budget({ transactions = [], budgets = [], onAddBudget, onUpdateBudget, onDeleteBudget, t, fm, selectedMonth, setSelectedMonth }) {
  // 1. State Management
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 3. Calculations
  const monthlyBudgets = budgets.filter(b => b.month === selectedMonth);

  const totalBudget = monthlyBudgets.reduce((sum, b) => {
    return sum + (Number.isFinite(b.limit) ? b.limit : 0);
  }, 0);

  const totalActual = transactions
    .filter(t_data => t_data.type === "expense")
    .filter(t_data => getMonthKey(t_data.date || t_data.createdAt) === selectedMonth)
    .reduce((sum, t_data) => {
      return sum + (Number.isFinite(t_data.amount) ? t_data.amount : 0);
    }, 0);

  const remainingBudget = totalBudget - totalActual;

  const getRemainingDaysInMonth = () => {
    const now = new Date();
    const [year, month] = selectedMonth.split("-").map(Number);
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
      .filter(t_data => getMonthKey(t_data.date || t_data.createdAt) === selectedMonth)
      .reduce((sum, t_data) => {
        return sum + (Number.isFinite(t_data.amount) ? t_data.amount : 0);
      }, 0);

    const percentage = b.limit > 0 ? (actualSpent / b.limit) * 100 : 0;
    return { ...b, actualSpent, percentage };
  });

  // High Impact Spending
  const monthlyExpenses = transactions.filter(t_data => t_data.type === 'expense' && getMonthKey(t_data.date || t_data.createdAt) === selectedMonth);
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
    const [year, month] = selectedMonth.split('-').map(Number);
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
          month: selectedMonth
        });
      } else {
        await onAddBudget({
          category: formData.category,
          limit: numericLimit,
          month: selectedMonth
        });
      }
      setIsBudgetModalOpen(false);
      setEditingBudget(null);
    } catch (err) {
      setError(err.message || "Failed to save budget");
    } finally {
      setIsSaving(false);
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } } };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="p-4 md:p-8 pb-[100px]">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary mb-1">Strategy Center</p>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            {t('monthlyBudget')} {new Date(selectedMonth + "-01").toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <input 
            type="month" 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)} 
            className="h-11 bg-white/[0.03] border border-white/10 rounded-lg px-4 text-white font-medium outline-none focus:border-primary/50 transition-colors [color-scheme:dark]"
          />
          <button 
            onClick={() => { setEditingBudget(null); setIsBudgetModalOpen(true); }} 
            className="h-11 bg-primary text-black px-6 font-semibold rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined font-bold text-[20px]">add</span> 
            {t('addBudget')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6 mb-6">
        <div className="col-span-12 glass-card-premium rounded-3xl p-6 lg:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 min-w-0">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-4">{t('dailySafeToSpend')}</p>
            <h3 className={`text-4xl lg:text-5xl font-bold tracking-tight mb-2 truncate ${safeToSpendPerDay > 0 ? 'text-primary' : 'text-red-400'}`}>
              {fm(safeToSpendPerDay)} <span className="text-2xl font-semibold text-neutral-500">/ day</span>
            </h3>
            <p className="text-sm font-medium text-neutral-400">Remaining for the next {remainingDays} days.</p>
          </div>
          <div className="w-full lg:w-[400px] shrink-0">
            <div className="flex justify-between text-[11px] font-semibold uppercase tracking-wider mb-2">
              <span className="text-neutral-500">Monthly Utilization</span>
              <span className={consumedPercent > 100 ? 'text-red-400' : 'text-primary'}>{consumedPercent.toFixed(1)}%</span>
            </div>
            <div className="h-3 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/5">
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(consumedPercent, 100)}%` }} className={`h-full ${consumedPercent > 100 ? 'bg-red-500' : 'bg-primary'}`}></motion.div>
            </div>
          </div>
        </div>

        <motion.div variants={itemVariants} className="col-span-12 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 min-w-0">
          <div className="glass-card-premium rounded-2xl p-6 flex flex-col border-l-2 border-l-primary min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-2 truncate">Total Budget</p>
            <p className="text-2xl lg:text-3xl font-bold text-white tracking-tight truncate">{fm(totalBudget)}</p>
          </div>
          <div className="glass-card-premium rounded-2xl p-6 flex flex-col border-l-2 border-l-blue-400 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-2 truncate">Actual Spending</p>
            <p className="text-2xl lg:text-3xl font-bold text-white tracking-tight truncate">{fm(totalActual)}</p>
          </div>
          <div className="glass-card-premium rounded-2xl p-6 flex flex-col border-l-2 border-l-red-400 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-2 truncate">Remaining Budget</p>
            <p className={`text-2xl lg:text-3xl font-bold tracking-tight truncate ${remainingBudget >= 0 ? 'text-primary' : 'text-red-400'}`}>{fm(remainingBudget)}</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="col-span-12 lg:col-span-7 glass-card-premium rounded-3xl p-6 lg:p-8 min-w-0">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-xl font-bold text-white tracking-tight">{t('categoryBreakdown')}</h4>
            <span onClick={() => setIsManageModalOpen(true)} className="text-[11px] font-semibold uppercase tracking-wider text-primary hover:text-primary-dark cursor-pointer transition-colors">{t('manageLimits')}</span>
          </div>
          <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {cStats.length === 0 ? <EmptyState title="No budgets set" desc="Start setting limits." icon="settings_suggest" /> : cStats.map((sObj, sIdx) => (
              <motion.div key={sObj.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * sIdx }} className="min-w-0">
                <div className="flex justify-between items-end mb-2 min-w-0">
                  <div className="min-w-0 flex-1 pr-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 truncate">{sObj.category}</p>
                    <p className={`text-lg font-bold tracking-tight truncate ${sObj.percentage > 100 ? 'text-red-400' : 'text-white'}`}>
                      {fm(sObj.actualSpent)} <span className="text-sm font-medium text-neutral-500 tracking-normal">/ {fm(sObj.limit)}</span>
                    </p>
                  </div>
                  <p className={`text-sm font-bold shrink-0 ${sObj.percentage > 100 ? 'text-red-400' : 'text-primary'}`}>{sObj.percentage.toFixed(0)}%</p>
                </div>
                <div className="h-2 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/5">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(sObj.percentage, 100)}%` }} className={`h-full ${sObj.percentage > 100 ? 'bg-red-500' : 'bg-primary'}`}></motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="col-span-12 lg:col-span-5 glass-card-premium rounded-3xl p-6 lg:p-8">
          <h4 className="text-xl font-bold text-white tracking-tight mb-8">Budget vs Actual</h4>
          {chartData.every(d => d.budgeted === 0 && d.actual === 0) ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-center">
              <span className="material-symbols-outlined text-neutral-600 text-3xl mb-2">query_stats</span>
              <p className="text-sm font-medium text-neutral-400">
                Not enough budget history yet.
              </p>
            </div>
          ) : (
            <div className="relative h-[200px] flex items-end justify-around gap-4">
              {chartData.map((d, idx) => (
                <div key={idx} className="flex flex-col items-center gap-3 w-full max-w-[40px]">
                  <div className="flex gap-1.5 w-full h-[140px] items-end justify-center">
                    <div className="w-3 bg-white/[0.05] rounded-t-sm transition-all duration-500" style={{ height: `${(d.budgeted / maxVal) * 100}%` }}></div>
                    <div className={`w-3 rounded-t-sm transition-all duration-500 ${d.actual > d.budgeted ? 'bg-red-400' : 'bg-primary'}`} style={{ height: `${(d.actual / maxVal) * 100}%` }}></div>
                  </div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">{d.monthLabel}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* High Impact Spending */}
        <motion.div variants={itemVariants} className="col-span-12 glass-card-premium rounded-3xl overflow-hidden">
          <div className="p-6 lg:p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h4 className="text-xl font-bold text-white tracking-tight">Recent High-Impact Spending</h4>
            <div className="relative w-full md:w-64 group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-primary transition-colors text-[18px]">search</span>
              <input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 bg-white/[0.03] border border-white/10 rounded-lg pl-10 pr-4 text-white placeholder:text-neutral-500 outline-none transition-colors focus:border-primary/50 text-sm" 
                placeholder="Search impacts..." 
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            {highImpact.length === 0 ? (
              <EmptyState 
                title="No impacts found" 
                desc="Try a different search or add more transactions." 
                icon="search_off" 
              />
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">{t('description')}</th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">{t('category')}</th>
                    <th className="px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-wider text-neutral-500">{t('amount')}</th>
                    <th className="px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {highImpact.map((tItem, idx) => {
                    const bMatch = monthlyBudgets.find(b => b.category === tItem.category);
                    const cActualVal = monthlyExpenses.filter(x => x.category === tItem.category).reduce((acc, x) => acc + x.amount, 0);
                    
                    let iLabel = 'No Budget';
                    let iLabelColor = 'text-neutral-500';
                    
                    if (bMatch) {
                      if (cActualVal > bMatch.limit) {
                        iLabel = 'Over Budget';
                        iLabelColor = 'text-red-400 font-bold';
                      } else {
                        iLabel = 'Within Limits';
                        iLabelColor = 'text-primary font-bold';
                      }
                    }

                    return (
                      <motion.tr 
                        key={tItem.id} 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * idx }}
                        className="hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center text-primary shrink-0">
                              <span className="material-symbols-outlined font-medium text-[20px]">payments</span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-white truncate group-hover:text-primary transition-colors">{tItem.notes || tItem.category}</p>
                              <p className="text-[11px] font-medium text-neutral-500 mt-0.5">{formatDate(tItem.date)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider inline-block border ${iLabel === 'Over Budget' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                            {tItem.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-base text-white group-hover:text-primary transition-colors">{fm(tItem.amount)}</td>
                        <td className={`px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-wider ${iLabelColor}`}>{iLabel}</td>
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
  const categories = ['Food & Dining', 'Trading', 'Kebutuhan', 'Transportasi', 'Investasi', 'Lainnya'];
  const [formData, setFormData] = useState({ category: categories[0], limit: '' });

  const [prevInitialData, setPrevInitialData] = useState(initialData);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (initialData !== prevInitialData || isOpen !== prevIsOpen) {
    setPrevInitialData(initialData);
    setPrevIsOpen(isOpen);
    if (initialData) {
      setFormData({ 
        category: initialData.category, 
        limit: initialData.limit.toString() 
      });
    } else {
      setFormData({ 
        category: categories[0], 
        limit: '' 
      });
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose}></div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="relative z-[201] w-full max-w-md rounded-2xl border border-white/10 bg-[#0a0a0a] p-8 shadow-2xl"
      >
        <div className="mb-8 flex items-start justify-between gap-4">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {initialData ? t('editBudget') : t('addBudget')}
          </h2>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 flex items-center gap-3">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}

        <form className="w-full space-y-5" onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 ml-1">
              {t('category')}
            </label>
            <select 
              value={formData.category} 
              onChange={e => setFormData({...formData, category: e.target.value})}
              className="block h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 text-white outline-none transition focus:border-primary/50 text-sm"
            >
              {categories.map(c => <option key={c} value={c} className="bg-[#0a0a0a]">{c}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 ml-1">
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
                className="block h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 text-white outline-none transition focus:border-primary/50 text-base font-medium"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 font-semibold text-sm">IDR</div>
            </div>
            <p className="text-[10px] font-semibold text-primary mt-1.5 ml-1">
              Format: {formatRupiah(parseAmount(formData.limit))}
            </p>
          </div>

          <div className="mt-8 flex w-full flex-col sm:flex-row gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="h-11 flex-1 rounded-lg border border-white/10 font-semibold text-white hover:bg-white/[0.05] transition-colors text-sm"
            >
              {t('cancel')}
            </button>
            <button 
              type="submit" 
              disabled={isSaving}
              className={`h-11 flex-1 rounded-lg bg-white text-black font-semibold hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 text-sm ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="material-symbols-outlined text-[18px]">save</span>
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
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose}></div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="relative z-[151] w-full max-w-lg rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white tracking-tight">{t('manageLimits')}</h2>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar">
          {monthlyBudgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <span className="material-symbols-outlined text-neutral-600 text-4xl mb-3">analytics</span>
              <p className="text-neutral-500 font-medium text-sm">{t('noLimitsSet')}</p>
            </div>
          ) : (
            monthlyBudgets.map(bItem => (
              <div key={bItem.id} className="flex justify-between items-center p-4 bg-white/[0.02] rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                <div>
                  <p className="font-semibold text-white mb-0.5 text-sm">{bItem.category}</p>
                  <p className="font-bold text-primary">{formatRupiah(bItem.limit)}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onEdit(bItem)} className="w-9 h-9 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                  <button onClick={() => onDelete(bItem.id)} className="w-9 h-9 flex items-center justify-center text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-6 border-t border-white/5 flex flex-col sm:flex-row gap-3">
          <button onClick={onClose} className="flex-1 h-11 rounded-lg border border-white/10 text-white font-semibold hover:bg-white/[0.05] transition-colors text-sm">{t('close')}</button>
          <button onClick={() => { onClose(); onAdd(); }} className="flex-1 h-11 rounded-lg bg-white text-black font-semibold hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 text-sm">
            <span className="material-symbols-outlined text-[18px]">add</span>
            {t('addNew')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default Budget;

const EmptyState = ({ title, desc, icon }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4">
    <div className="w-16 h-16 bg-white/[0.03] rounded-full flex items-center justify-center mb-4 border border-white/5">
      <span className="material-symbols-outlined text-neutral-600 text-3xl">{icon}</span>
    </div>
    <h3 className="text-white font-semibold text-base mb-1">{title}</h3>
    <p className="text-neutral-500 text-sm text-center max-w-[280px]">
      {desc}
    </p>
  </div>
);

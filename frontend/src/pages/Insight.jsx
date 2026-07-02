import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMonthKey } from '../services/financeService';


// Helper Functions
const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const formatRupiah = (value) => {
  const number = toNumber(value);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
};

function Insight({ transactions = [], assets = [], debts = [], budgets = [], receivables = [], onNavigate, onQuickAdd, t, fm, selectedMonth, setSelectedMonth }) {
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isInsightDismissed, setIsInsightDismissed] = useState(localStorage.getItem("smartInsightDismissed") === "true");

  const filteredTransactions = useMemo(() => {
    return transactions.filter(ti => (ti.date || ti.createdAt) && getMonthKey(ti.date || ti.createdAt) === selectedMonth);
  }, [transactions, selectedMonth]);

  

  // Current Context

  // 1. Core Calculations
  const analysis = useMemo(() => {
    const totalAssets = assets.reduce((sum, a) => sum + toNumber(a.amount), 0);
    const totalLiabilities = debts.reduce((sum, d) => sum + toNumber(d.amount), 0);
    
    // Calculate total outstanding receivables
    const activeReceivables = (receivables || []).filter(r => r.status !== 'paid');
    const outstandingReceivables = activeReceivables.reduce((sum, r) => sum + toNumber(r.remainingAmount), 0);
    
    // Calculate all-time cashflow
    const allTimeIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + toNumber(t.amount), 0);
    const allTimeExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + toNumber(t.amount), 0);
    const cashBalance = allTimeIncome - allTimeExpense;

    const netWorth = cashBalance + totalAssets + outstandingReceivables - totalLiabilities;

    const monthlyIncome = filteredTransactions
      .filter(t_item => t_item.type === 'income')
      .reduce((sum, t_item) => sum + toNumber(t_item.amount), 0);

    const monthlyExpense = filteredTransactions
      .filter(t_item => t_item.type === 'expense')
      .reduce((sum, t_item) => sum + toNumber(t_item.amount), 0);

    const monthlySavings = monthlyIncome - monthlyExpense;
    const saveRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;
    const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;
    const expenseRatio = monthlyIncome > 0 ? (monthlyExpense / monthlyIncome) * 100 : 0;

    const currentBudgets = budgets.filter(b => b.month === selectedMonth);
    const monthlyBudget = currentBudgets.reduce((sum, b) => sum + toNumber(b.limit), 0);
    const budgetUsage = monthlyBudget > 0 ? (monthlyExpense / monthlyBudget) * 100 : 0;

    // Liquid Assets Calculation
    const liquidCategories = ['Cash', 'Bank', 'E-Wallet', 'Investment', 'Crypto'];
    const liquidAssets = assets
      .filter(a => liquidCategories.includes(a.category))
      .reduce((sum, a) => sum + toNumber(a.amount), 0);
    
    const effectiveLiquid = liquidAssets > 0 ? liquidAssets : totalAssets;

    const monthsWithData = new Set(transactions.map(ti => getMonthKey(ti.date || ti.createdAt))).size || 1;
    const realMonthlyExpenseAvg = transactions
      .filter(t_item => t_item.type === 'expense')
      .reduce((sum, t_item) => sum + toNumber(t_item.amount), 0) / monthsWithData;

    const emergencyFundMonths = realMonthlyExpenseAvg > 0 ? effectiveLiquid / realMonthlyExpenseAvg : 0;

    // Biggest Category
    const categoryTotals = {};
    filteredTransactions
      .filter(t_item => t_item.type === 'expense')
      .forEach(t_item => {
        categoryTotals[t_item.category] = (categoryTotals[t_item.category] || 0) + toNumber(t_item.amount);
      });
    const biggestCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0] || [null, 0];

    // Wealth Score Logic
    const saveRateScore = saveRate >= 30 ? 30 : Math.max(saveRate, 0);
    let debtScore = 3;
    if (debtToAssetRatio <= 20) debtScore = 25;
    else if (debtToAssetRatio <= 40) debtScore = 18;
    else if (debtToAssetRatio <= 60) debtScore = 10;

    let emergencyScore = 3;
    if (emergencyFundMonths >= 6) emergencyScore = 25;
    else if (emergencyFundMonths >= 3) emergencyScore = 18;
    else if (emergencyFundMonths >= 1) emergencyScore = 10;

    let budgetScore = 8;
    if (monthlyBudget > 0) {
      if (budgetUsage <= 80) budgetScore = 20;
      else if (budgetUsage <= 100) budgetScore = 14;
      else budgetScore = 5;
    }

    const wealthScore = Math.round(saveRateScore + debtScore + emergencyScore + budgetScore);
    
    let status = "Critical";
    let statusColor = "text-red-400";
    if (wealthScore >= 80) { status = "Excellent"; statusColor = "text-emerald-400"; }
    else if (wealthScore >= 60) { status = "Good"; statusColor = "text-emerald-300"; }
    else if (wealthScore >= 40) { status = "Needs Attention"; statusColor = "text-yellow-400"; }

    // Receivables Metrics
    const outstandingReceivables = (receivables || []).reduce((acc, r) => acc + toNumber(r.remainingAmount), 0);
    const paidReceivablesThisMonth = (receivables || []).reduce((acc, r) => {
      const isPaidThisMonth = getMonthKey(r.updatedAt) === selectedMonth;
      return isPaidThisMonth ? acc + toNumber(r.paidAmount) : acc;
    }, 0);
    const overdueCount = (receivables || []).filter(r => r.status !== 'paid' && r.dueDate && new Date(r.dueDate) < new Date()).length;

    return {
      totalAssets, totalLiabilities, netWorth, monthlyIncome, monthlyExpense, monthlySavings,
      saveRate, debtToAssetRatio, expenseRatio, monthlyBudget, budgetUsage,
      effectiveLiquid, emergencyFundMonths, biggestCategory, wealthScore, status, statusColor,
      currentBudgets, outstandingReceivables, paidReceivablesThisMonth, overdueCount
    };
  }, [filteredTransactions, assets, debts, budgets, receivables, selectedMonth, transactions]);

  // 3. Smart Insight AI Logic (Rule-based)
  const smartInsight = useMemo(() => {
    const { 
      totalAssets, totalLiabilities, monthlyIncome, monthlyExpense, 
      saveRate, debtToAssetRatio, budgetUsage, biggestCategory, netWorth 
    } = analysis;

    const recommendations = [];
    let riskLevel = "Low";
    let riskSummary = "Your financial position looks stable based on current data.";
    let opportunitySummary = "No major accumulation signals detected yet.";
    let mainInsight = "Add transactions, assets, debts, and budgets to unlock personalized financial insights.";

    if (transactions.length > 0 || assets.length > 0) {
      const monthName = new Date(selectedMonth + "-01").toLocaleString('default', { month: 'long' });
      mainInsight = `Financial analysis for ${monthName} initialized.`;

      if (monthlyExpense === 0 && monthlyIncome > 0) {
        recommendations.push({ title: "Incomplete Expense Data", description: "Expense data is still incomplete. Add spending records for more accurate analysis.", priority: "medium", action: "Add Expense" });
      }
      
      if (biggestCategory[0]) {
        mainInsight = `Your biggest spending category in ${monthName} is ${biggestCategory[0]} at ${fm(biggestCategory[1])}.`;
      }

      if (monthlyExpense > monthlyIncome && monthlyIncome > 0) {
        riskLevel = "High";
        riskSummary = "You spent more than your income this month. Negative cashflow detected.";
        recommendations.push({ title: "Cut monthly spending", description: "Review non-essential expenses and reduce spending until expenses stay below income.", priority: "high", action: "Review" });
      }

      if (totalLiabilities > totalAssets) {
        riskLevel = "Critical";
        riskSummary = "Your liabilities are higher than your assets. Critical debt exposure detected.";
        recommendations.push({ title: "Reduce debt exposure", description: "Focus on paying high-interest or short-term debts first before increasing discretionary spending.", priority: "high", action: "Pay Down" });
      } else if (debtToAssetRatio > 50) {
        riskLevel = riskLevel === "Critical" ? "Critical" : "High";
        riskSummary = "Debt-to-asset ratio is above 50%, which increases financial pressure.";
      }

      // Receivables Insights
      if (analysis.outstandingReceivables > 0) {
        opportunitySummary = `You have ${fm(analysis.outstandingReceivables)} in outstanding receivables. Collect these to improve liquidity.`;
        if (analysis.overdueCount > 0) {
          recommendations.push({ title: "Overdue Receivables", description: `You have ${analysis.overdueCount} receivables past their due date. Take action to recover these funds.`, priority: "medium", action: "Collect" });
        }
      }

      if (saveRate >= 20) {
        opportunitySummary = `You are saving ${saveRate.toFixed(1)}% of your income this month. This is a strong capital accumulation signal.`;
      } else if (saveRate < 10 && monthlyIncome > 0) {
        recommendations.push({ title: "Increase saving rate", description: "Aim for at least 10-20% saving rate before increasing lifestyle spending.", priority: "medium", action: "Set Goal" });
      }

      if (budgetUsage > 100) {
        riskSummary = `You have exceeded your monthly budget by ${fm(monthlyExpense - analysis.monthlyBudget)}.`;
        recommendations.push({ title: "Review over-budget categories", description: "Check which category exceeded the limit and reduce spending for the rest of the month.", priority: "high", action: "Optimize" });
      }

      if (analysis.monthlyBudget <= 0) {
        recommendations.push({ title: "Set monthly budget limits", description: "Add category limits so spending can be measured against a target.", priority: "medium", action: "Set Budget" });
      }

      if (netWorth > 0 && saveRate > 0) {
        opportunitySummary = "Your net worth is positive and your monthly cashflow is profitable. Continue compounding assets.";
      }
    } else {
      recommendations.push({ title: "Record your first transaction", description: "Add your recent income or expenses to start the analysis.", priority: "high", action: "Add" });
      recommendations.push({ title: "Add your assets", description: "Include bank balances, cash, or investments for net worth tracking.", priority: "medium", action: "Add" });
      recommendations.push({ title: "Set your monthly budget", description: "Define spending limits to improve your wealth score.", priority: "medium", action: "Add" });
    }

    return { mainInsight, riskLevel, riskSummary, opportunitySummary, recommendations };
  }, [analysis, transactions.length, assets.length, fm]);

  // 4. Strategic Tasks Logic
  const strategicTasks = useMemo(() => {
    const tasks = [];
    const { emergencyFundMonths, debtToAssetRatio, saveRate, monthlyBudget, budgetUsage, monthlyIncome } = analysis;

    if (assets.length === 0) tasks.push({ icon: 'add_card', color: 'text-emerald-400', bg: 'bg-emerald-400/10', title: 'Add your first asset', desc: 'Required for net worth calculation.', priority: 'high', target: 'assets', flag: 'openAssetModalOnLoad' });
    if (debts.length === 0 && assets.length > 0) tasks.push({ icon: 'fact_check', color: 'text-sky-400', bg: 'bg-sky-400/10', title: 'Review debt position', desc: 'Ensure all liabilities are recorded.', priority: 'low', target: 'assets', flag: 'openDebtModalOnLoad' });
    if (emergencyFundMonths < 3) tasks.push({ icon: 'emergency', color: 'text-red-400', bg: 'bg-red-400/10', title: 'Build emergency fund', desc: 'Current buffer is less than 3 months.', priority: 'high', target: 'insight' });
    if (debtToAssetRatio > 30) tasks.push({ icon: 'trending_down', color: 'text-orange-400', bg: 'bg-orange-400/10', title: 'Reduce debt exposure', desc: 'Keep debt-to-asset below 30% for stability.', priority: 'medium', target: 'assets', flag: 'openDebtModalOnLoad' });
    if (saveRate < 20 && monthlyIncome > 0) tasks.push({ icon: 'savings', color: 'text-emerald-300', bg: 'bg-emerald-300/10', title: 'Increase saving rate', desc: 'Target 20% savings for faster growth.', priority: 'medium', target: 'budget', flag: 'openBudgetModalOnLoad' });
    if (monthlyBudget <= 0) tasks.push({ icon: 'assignment', color: 'text-blue-400', bg: 'bg-blue-400/10', title: 'Set monthly budget limits', desc: 'Essential for expense discipline.', priority: 'medium', target: 'budget', flag: 'openBudgetModalOnLoad' });
    if (budgetUsage > 100) tasks.push({ icon: 'warning', color: 'text-red-300', bg: 'bg-red-300/10', title: 'Review over-budget items', desc: 'You have exceeded monthly limits.', priority: 'high', target: 'budget' });
    if (monthlyIncome <= 0) tasks.push({ icon: 'payments', color: 'text-emerald-400', bg: 'bg-emerald-400/10', title: 'Record this month income', desc: 'No income recorded for this period.', priority: 'high', target: 'transactions' });

    return tasks.slice(0, 3);
  }, [analysis, assets.length, debts.length]);

  const handleTaskClick = (task) => {
    if (task.flag) {
      localStorage.setItem(task.flag, "true");
    }
    if (task.target === 'transactions') {
      onQuickAdd();
    } else {
      onNavigate(task.target);
    }
  };

  // 5. Trend Chart Data
  const trendData = useMemo(() => {
    const last6Months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push(getMonthKey(d));
    }

    return last6Months.map(mKey => {
      const income = transactions
        .filter(t_i => t_i.type === 'income' && getMonthKey(t_i.date || t_i.createdAt) === mKey)
        .reduce((sum, t_i) => sum + toNumber(t_i.amount), 0);
      const expense = transactions
        .filter(t_i => t_i.type === 'expense' && getMonthKey(t_i.date || t_i.createdAt) === mKey)
        .reduce((sum, t_i) => sum + toNumber(t_i.amount), 0);
      
      const label = new Date(mKey + "-01").toLocaleString('default', { month: 'short' });
      return { label, income, expense, mKey };
    });
  }, [transactions]);

  const maxTrendVal = Math.max(...trendData.map(d => Math.max(d.income, d.expense)), 1);

  const handleDismissInsight = () => {
    setIsInsightDismissed(true);
    localStorage.setItem("smartInsightDismissed", "true");
  };

  const handleResetInsight = () => {
    setIsInsightDismissed(false);
    localStorage.removeItem("smartInsightDismissed");
  };

  // Emergency Fund Goal Details
  const efTarget = analysis.monthlyExpense > 0 ? analysis.monthlyExpense * 6 : 25000000;
  const efSaved = analysis.effectiveLiquid;
  const efPercent = Math.min((efSaved / efTarget) * 100, 100);

  return (
    <div className="max-w-[1600px] mx-auto p-8 2xl:p-12 pb-32">
      {/* Page Title Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 2xl:mb-14 gap-4 2xl:gap-6">
        <div>
          <p className="text-[10px] 2xl:text-xs font-black uppercase tracking-[0.3em] text-emerald-400 mb-2 2xl:mb-3 ml-1">Strategy & Analysis</p>
          <h2 className="text-4xl 2xl:text-6xl font-black text-slate-100 tracking-tighter">{t('insight')}</h2>
          <p className="text-sm 2xl:text-lg font-bold text-slate-500 tracking-tight mt-1 2xl:mt-3">Real-time intelligence based on your command center data.</p>
        </div>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
          <div className="flex flex-col gap-1.5 2xl:gap-2 min-w-[160px] 2xl:min-w-[200px]">
            <label className="text-[10px] 2xl:text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Analysis Period</label>
            <input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-900/55 border border-slate-700/30 rounded-xl px-4 2xl:px-6 py-2 2xl:py-3 text-slate-100 font-bold outline-none focus:border-emerald-400/50 transition-colors [color-scheme:dark] 2xl:text-lg"
            />
          </div>
          {isInsightDismissed && (
            <button 
              onClick={handleResetInsight}
              className="px-5 py-2 mt-auto bg-slate-900/55 border border-slate-700/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:bg-emerald-400/10 transition-colors duration-200"
            >
              Show Smart Insight
            </button>
          )}
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-8 2xl:gap-12">
        {/* Financial Health Score Card */}
        <div className="col-span-12 lg:col-span-5 rounded-3xl border border-slate-700/30 bg-gradient-to-br from-slate-900/80 via-slate-900/55 to-blue-950/30 p-10 2xl:p-14 flex flex-col items-center justify-center relative overflow-hidden min-h-[480px] 2xl:min-h-[560px] shadow-2xl backdrop-blur-xl group">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-400/10 blur-[120px] rounded-full transition-colors duration-500"></div>
          
          <div className="relative flex flex-col items-center">
            <div className="w-48 h-48 md:w-56 md:h-56 2xl:w-72 2xl:h-72 rounded-full border-[12px] 2xl:border-[16px] border-slate-800/50 flex items-center justify-center relative shadow-[0_0_50px_rgba(0,0,0,0.3)]">
              <svg className="absolute inset-0 w-full h-full -rotate-90 scale-[1.08]">
                <circle 
                  className={`${analysis.statusColor} transition-all duration-1000 ease-out drop-shadow-[0_0_12px_rgba(74,222,128,0.4)]`} 
                  cx="50%" cy="50%" fill="none" r="42%" stroke="currentColor" 
                  strokeDasharray="527" 
                  strokeDashoffset={527 - (527 * analysis.wealthScore / 100)} 
                  strokeWidth="12" strokeLinecap="round"
                ></circle>
              </svg>
              <div className="text-center">
                <span className="text-6xl md:text-7xl 2xl:text-8xl font-black text-slate-100 tracking-tighter block leading-none">{analysis.wealthScore}</span>
                <span className="text-[10px] 2xl:text-xs font-black text-slate-500 uppercase tracking-[0.3em] mt-2 block">Wealth Score</span>
              </div>
            </div>
            <div className={`mt-10 2xl:mt-14 px-8 2xl:px-10 py-3 2xl:py-4 ${analysis.statusColor} bg-white/5 border border-white/10 rounded-2xl font-black text-xs 2xl:text-sm uppercase tracking-[0.2em] shadow-xl backdrop-blur-md`}>
              Status: {analysis.status}
            </div>
          </div>
          
          <div className="mt-12 w-full grid grid-cols-3 gap-6 2xl:gap-8 border-t border-slate-700/30 pt-10 2xl:pt-14">
            <div className="text-center group/item">
              <p className="text-[10px] 2xl:text-xs font-black uppercase tracking-widest text-slate-500 mb-2 group-hover/item:text-emerald-400 transition-colors">Income Flow</p>
              <span className={`material-symbols-outlined font-bold text-2xl 2xl:text-4xl mb-1 2xl:mb-2 ${analysis.monthlyIncome > analysis.monthlyExpense ? 'text-emerald-400' : 'text-red-400'}`}>
                {analysis.monthlyIncome > analysis.monthlyExpense ? 'trending_up' : 'trending_down'}
              </span>
              <p className="text-[9px] 2xl:text-[11px] font-black text-slate-100 uppercase tracking-widest">{analysis.monthlyIncome > analysis.monthlyExpense ? 'Surplus' : 'Deficit'}</p>
            </div>
            <div className="text-center group/item">
              <p className="text-[10px] 2xl:text-xs font-black uppercase tracking-widest text-slate-500 mb-2 group-hover/item:text-emerald-400 transition-colors">Debt Level</p>
              <span className={`material-symbols-outlined font-bold text-2xl 2xl:text-4xl mb-1 2xl:mb-2 ${analysis.debtToAssetRatio > 40 ? 'text-red-400' : 'text-emerald-400'}`}>
                {analysis.debtToAssetRatio > 40 ? 'gpp_maybe' : 'verified_user'}
              </span>
              <p className="text-[9px] 2xl:text-[11px] font-black text-slate-100 uppercase tracking-widest">{analysis.debtToAssetRatio > 40 ? 'High Risk' : 'Healthy'}</p>
            </div>
            <div className="text-center group/item">
              <p className="text-[10px] 2xl:text-xs font-black uppercase tracking-widest text-slate-500 mb-2 group-hover/item:text-emerald-400 transition-colors">Liquidity</p>
              <span className={`material-symbols-outlined font-bold text-2xl 2xl:text-4xl mb-1 2xl:mb-2 ${analysis.emergencyFundMonths < 3 ? 'text-red-400' : 'text-emerald-400'}`}>
                {analysis.emergencyFundMonths < 3 ? 'warning' : 'savings'}
              </span>
              <p className="text-[9px] 2xl:text-[11px] font-black text-slate-100 uppercase tracking-widest">{analysis.emergencyFundMonths.toFixed(1)} Mo</p>
            </div>
          </div>
        </div>

        {/* Analysis & Improvements Bento Group */}
        <div className="col-span-12 lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-8 2xl:gap-12">
          {/* Strength Analysis */}
          <div className="rounded-3xl border border-slate-700/30 bg-slate-900/55 p-8 2xl:p-12 shadow-xl backdrop-blur-xl transition-colors duration-200 hover:border-emerald-400/30 flex flex-col justify-between">
            <div className="flex items-center gap-3 2xl:gap-4 mb-8 2xl:mb-10">
              <span className="material-symbols-outlined text-emerald-400 font-bold 2xl:text-3xl">check_circle</span>
              <h3 className="text-xl 2xl:text-3xl font-black text-slate-100 tracking-tight">Strength Analysis</h3>
            </div>
            <ul className="space-y-6 2xl:space-y-8 flex-1 flex flex-col justify-center">
              <li className="flex justify-between items-center">
                <span className="text-sm 2xl:text-lg font-bold text-slate-400 tracking-tight">
                  {analysis.monthlyIncome > analysis.monthlyExpense ? 'Income exceeds expenses' : 'Expenses exceed income'}
                </span>
                <span className={`text-[9px] 2xl:text-[11px] font-black uppercase tracking-widest px-2.5 2xl:px-4 py-1 2xl:py-2 rounded-lg ${analysis.monthlyIncome > analysis.monthlyExpense ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-300 bg-red-400/10'}`}>
                  {analysis.monthlyIncome > analysis.monthlyExpense ? 'Optimal' : 'Critical'}
                </span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-sm 2xl:text-lg font-bold text-slate-400 tracking-tight">Save rate {analysis.saveRate.toFixed(1)}%</span>
                <span className={`text-[9px] 2xl:text-[11px] font-black uppercase tracking-widest px-2.5 2xl:px-4 py-1 2xl:py-2 rounded-lg ${analysis.saveRate >= 20 ? 'text-emerald-400 bg-emerald-400/10' : analysis.saveRate >= 10 ? 'text-emerald-300 bg-emerald-300/10' : 'text-yellow-400 bg-yellow-400/10'}`}>
                  {analysis.saveRate >= 20 ? 'Excellent' : analysis.saveRate >= 10 ? 'Good' : 'Needs Work'}
                </span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-sm 2xl:text-lg font-bold text-slate-400 tracking-tight">Debt Exposure</span>
                <span className={`text-[9px] 2xl:text-[11px] font-black uppercase tracking-widest px-2.5 2xl:px-4 py-1 2xl:py-2 rounded-lg ${analysis.debtToAssetRatio <= 30 ? 'text-emerald-400 bg-emerald-400/10' : analysis.debtToAssetRatio <= 60 ? 'text-yellow-400 bg-yellow-400/10' : 'text-red-300 bg-red-400/10'}`}>
                  {analysis.debtToAssetRatio <= 30 ? 'Stable' : analysis.debtToAssetRatio <= 60 ? 'Attention' : 'Critical'}
                </span>
              </li>
            </ul>
          </div>

          {/* Risk Factors */}
          <div className="rounded-3xl border border-slate-700/30 bg-slate-900/55 p-8 2xl:p-12 shadow-xl backdrop-blur-xl transition-colors duration-200 hover:border-red-400/30 flex flex-col justify-between">
            <div className="flex items-center gap-3 2xl:gap-4 mb-8 2xl:mb-10">
              <span className="material-symbols-outlined text-red-400 font-bold 2xl:text-3xl">warning</span>
              <h3 className="text-xl 2xl:text-3xl font-black text-slate-100 tracking-tight">Risk Factors</h3>
            </div>
            <div className="space-y-4 2xl:space-y-6 max-h-[160px] 2xl:max-h-[220px] overflow-y-auto no-scrollbar pr-2 flex-1 flex flex-col justify-center">
              {smartInsight.riskLevel !== "Low" ? (
                <>
                  <div className={`p-4 2xl:p-6 rounded-2xl border ${smartInsight.riskLevel === 'Critical' ? 'bg-red-400/10 border-red-500/20 text-red-300' : 'bg-orange-400/10 border-orange-500/20 text-orange-300'}`}>
                    <p className="text-[9px] 2xl:text-[11px] font-black uppercase tracking-[0.2em] mb-1 2xl:mb-2">{smartInsight.riskLevel}</p>
                    <p className="text-sm 2xl:text-lg font-bold tracking-tight">{smartInsight.riskSummary}</p>
                  </div>
                  {analysis.budgetUsage > 100 && (
                    <div className="p-4 2xl:p-6 bg-slate-800/40 rounded-2xl border border-slate-700/30">
                      <p className="text-[9px] 2xl:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 2xl:mb-2">Budget</p>
                      <p className="text-sm 2xl:text-lg font-bold text-slate-100 tracking-tight">Monthly budget exceeded by {formatRupiah(analysis.monthlyExpense - analysis.monthlyBudget)}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-10 flex flex-col items-center justify-center text-center">
                  <span className="material-symbols-outlined text-emerald-400/30 text-5xl 2xl:text-7xl mb-4 2xl:mb-6">gpp_good</span>
                  <p className="text-sm 2xl:text-lg font-bold text-slate-500 italic">No major risks detected based on current data.</p>
                </div>
              )}
            </div>
          </div>

          {/* Smart Insight AI Card */}
          <AnimatePresence>
            {!isInsightDismissed && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="md:col-span-2 rounded-3xl border border-emerald-400/20 bg-emerald-400/5 p-8 2xl:p-12 shadow-xl backdrop-blur-xl flex flex-col md:flex-row gap-8 2xl:gap-12 items-center group hover:border-emerald-400/40 transition-colors duration-200"
              >
                <div className="w-20 h-20 2xl:w-28 2xl:h-28 rounded-3xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_30px_rgba(74,222,128,0.1)] relative">
                  <div className="absolute inset-0 bg-emerald-400/5 animate-pulse rounded-3xl"></div>
                  <span className="material-symbols-outlined text-emerald-400 text-5xl 2xl:text-6xl font-bold relative z-10">auto_awesome</span>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row items-center gap-3 2xl:gap-4 mb-4 2xl:mb-6">
                    <h3 className="text-2xl 2xl:text-4xl font-black text-slate-100 tracking-tight">Smart Insight AI</h3>
                    <span className={`text-[9px] 2xl:text-xs font-black px-3 2xl:px-4 py-1 2xl:py-1.5 rounded-full uppercase tracking-widest border ${smartInsight.riskLevel === 'Critical' ? 'bg-red-400/10 text-red-300 border-red-500/20' : 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'}`}>
                      {smartInsight.riskLevel} Risk Profile
                    </span>
                  </div>
                  <p className="text-lg 2xl:text-2xl font-bold text-slate-300 leading-relaxed tracking-tight mb-2 2xl:mb-4">
                    {smartInsight.mainInsight}
                  </p>
                  <p className="text-sm 2xl:text-lg font-bold text-emerald-400/80 italic mb-8 2xl:mb-10">
                    {smartInsight.opportunitySummary}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 2xl:gap-6">
                    <button 
                      onClick={() => setIsAuditModalOpen(true)}
                      className="px-8 2xl:px-10 py-3 2xl:py-4 bg-emerald-400 text-slate-950 rounded-2xl text-xs 2xl:text-sm font-black uppercase tracking-widest hover:bg-emerald-300 transition-colors duration-200 shadow-[0_0_30px_rgba(74,222,128,0.2)]"
                    >
                      Execute Full Audit
                    </button>
                    <button 
                      onClick={handleDismissInsight}
                      className="px-8 2xl:px-10 py-3 2xl:py-4 text-slate-400 hover:text-slate-100 text-xs 2xl:text-sm font-black uppercase tracking-widest transition-colors duration-200"
                    >
                      Dismiss Analysis
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Goal Tracker Card */}
        <div className="col-span-12 rounded-3xl border border-slate-700/30 bg-slate-900/55 p-10 2xl:p-14 shadow-xl backdrop-blur-xl transition-colors duration-200 hover:border-emerald-400/30">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 2xl:mb-16 gap-6">
            <div>
              <h3 className="text-3xl 2xl:text-5xl font-black text-slate-100 tracking-tight">Strategic Goal Tracker</h3>
              <p className="text-base 2xl:text-xl font-bold text-slate-500 tracking-tight mt-1 2xl:mt-3">Projecting your journey to absolute financial freedom.</p>
            </div>
            <button className="px-8 2xl:px-10 py-3 2xl:py-4 border border-slate-700/50 rounded-2xl text-[10px] 2xl:text-xs font-black uppercase tracking-widest text-slate-400 hover:text-emerald-400 hover:border-emerald-400/30 transition-colors duration-200">View Strategic Map</button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 2xl:gap-24">
            <div className="space-y-10 2xl:space-y-14 flex flex-col justify-center">
              <div className="flex justify-between items-end">
                <div>
                  <h4 className="text-2xl 2xl:text-4xl font-black text-slate-100 tracking-tight">Emergency Fund (6 Months)</h4>
                  <p className="text-[11px] 2xl:text-sm font-black text-slate-500 uppercase tracking-widest mt-2 2xl:mt-4">Target: {formatRupiah(efTarget)}</p>
                </div>
                <div className="text-right">
                  <span className="text-4xl 2xl:text-6xl font-black text-emerald-400 tracking-tighter block leading-none">{efPercent.toFixed(0)}%</span>
                  <span className="text-[10px] 2xl:text-xs font-black text-slate-500 uppercase tracking-[0.2em] mt-2 2xl:mt-4 block">Completed</span>
                </div>
              </div>
              <div className="w-full h-5 2xl:h-6 bg-slate-700/45 rounded-full overflow-hidden border border-slate-700/20 shadow-inner p-1">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${efPercent}%` }} 
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full shadow-[0_0_15px_rgba(74,222,128,0.3)]"
                ></motion.div>
              </div>
              <div className="flex justify-between text-[11px] 2xl:text-sm font-black uppercase tracking-[0.2em] text-slate-500">
                <span>Liquid Assets: {formatRupiah(efSaved)}</span>
                <span>Requirement: {formatRupiah(Math.max(efTarget - efSaved, 0))}</span>
              </div>
            </div>

            <div className="flex items-end gap-3 h-48 pt-10">
              {trendData.map((d, i) => {
                const net = d.income - d.expense;
                const height = Math.max((Math.abs(net) / maxTrendVal) * 100, 5);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-4 group h-full">
                    <div className="flex-1 w-full flex items-end justify-center relative">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        className={`w-full max-w-[32px] rounded-t-xl transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.2)] ${net >= 0 ? 'bg-gradient-to-t from-emerald-600 to-emerald-400' : 'bg-gradient-to-t from-red-600 to-red-400'}`}
                      ></motion.div>
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                        <p className="text-[10px] font-black text-slate-100">{formatRupiah(net)}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{d.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Capital Accumulation Trend */}
        <div className="col-span-12 lg:col-span-8 rounded-3xl border border-slate-700/30 bg-slate-900/55 p-10 2xl:p-14 shadow-xl backdrop-blur-xl transition-colors duration-200 hover:border-emerald-400/30 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 2xl:mb-16 gap-6">
            <h3 className="text-3xl 2xl:text-5xl font-black text-slate-100 tracking-tight">Monthly Flow Analysis</h3>
            <div className="flex gap-8 2xl:gap-10">
              <span className="flex items-center gap-2 2xl:gap-3 text-[10px] 2xl:text-xs font-black uppercase tracking-widest text-slate-500">
                <span className="w-3 h-3 2xl:w-4 2xl:h-4 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.4)]"></span> Income
              </span>
              <span className="flex items-center gap-2 2xl:gap-3 text-[10px] 2xl:text-xs font-black uppercase tracking-widest text-slate-500">
                <span className="w-3 h-3 2xl:w-4 2xl:h-4 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.4)]"></span> Expense
              </span>
            </div>
          </div>
          <div className="h-[280px] 2xl:h-[360px] w-full flex items-end gap-6 2xl:gap-8 px-4 overflow-x-auto no-scrollbar">
            {trendData.map((d, i) => (
              <div key={i} className="min-w-[80px] 2xl:min-w-[100px] flex-1 flex flex-col items-center gap-6 2xl:gap-8 group cursor-default h-full">
                <div className="w-full flex gap-2.5 2xl:gap-4 items-end h-[200px] 2xl:h-[280px]">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.income / maxTrendVal) * 100}%` }}
                    className={`flex-1 rounded-t-lg transition-all duration-300 ${i === 5 ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_15px_rgba(74,222,128,0.2)]' : 'bg-emerald-400/20 group-hover:bg-emerald-400/40'}`}
                  ></motion.div>
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.expense / maxTrendVal) * 100}%` }}
                    className={`flex-1 rounded-t-lg transition-all duration-300 ${i === 5 ? 'bg-gradient-to-t from-red-600 to-red-400 shadow-[0_0_15px_rgba(248,113,113,0.2)]' : 'bg-red-400/20 group-hover:bg-red-400/40'}`}
                  ></motion.div>
                </div>
                <span className={`text-xs 2xl:text-sm font-black uppercase tracking-[0.2em] transition-colors ${i === 5 ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'}`}>{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Strategic Tasks */}
        <div className="col-span-12 lg:col-span-4 rounded-3xl border border-slate-700/30 bg-slate-900/55 p-10 2xl:p-14 shadow-xl backdrop-blur-xl transition-colors duration-200 hover:border-emerald-400/30 flex flex-col">
          <h3 className="text-3xl 2xl:text-4xl font-black text-slate-100 tracking-tight mb-10 2xl:mb-12">Strategic Tasks</h3>
          <div className="space-y-6 2xl:space-y-8 flex-1 flex flex-col justify-center">
            {strategicTasks.length > 0 ? strategicTasks.map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => handleTaskClick(item)}
                className="flex items-start gap-5 2xl:gap-6 p-5 2xl:p-7 bg-slate-950/40 border border-slate-700/30 hover:border-emerald-400/30 transition-colors duration-200 rounded-2xl group cursor-pointer"
              >
                <div className={`w-14 h-14 2xl:w-16 2xl:h-16 rounded-2xl ${item.bg} flex items-center justify-center shrink-0 border border-white/5 shadow-inner`}>
                  <span className={`material-symbols-outlined font-bold text-3xl 2xl:text-4xl ${item.color}`}>{item.icon}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-base 2xl:text-xl font-black text-slate-100 tracking-tight group-hover:text-emerald-400 transition-colors">{item.title}</p>
                  <p className="text-[11px] 2xl:text-xs font-bold text-slate-500 uppercase tracking-widest mt-1 2xl:mt-2 line-clamp-2 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            )) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-10">
                <span className="material-symbols-outlined text-slate-700 text-6xl 2xl:text-8xl mb-4 2xl:mb-6">task_alt</span>
                <p className="text-sm 2xl:text-lg font-bold text-slate-500">All strategic objectives for this period have been analyzed.</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => setIsLogModalOpen(true)}
            className="w-full mt-10 2xl:mt-12 py-5 2xl:py-6 text-center text-[11px] 2xl:text-sm font-black uppercase tracking-[0.3em] text-slate-500 hover:text-emerald-400 transition-colors border-t border-slate-800/50 pt-8 2xl:pt-10"
          >
            View Optimization Log
          </button>
        </div>
      </div>

      {/* Audit Modal */}
      <Modal isOpen={isAuditModalOpen} onClose={() => setIsAuditModalOpen(false)} title="Full System Audit" t={t}>
        <div className="space-y-10">
          <div className="grid grid-cols-2 gap-8">
            <div className="p-6 bg-slate-950/40 rounded-2xl border border-slate-700/30">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Wealth Snapshot</p>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-xs font-bold text-slate-400">Total Assets</span><span className="text-xs font-black text-slate-100">{formatRupiah(analysis.totalAssets)}</span></div>
                <div className="flex justify-between"><span className="text-xs font-bold text-slate-400">Liabilities</span><span className="text-xs font-black text-red-300">{formatRupiah(analysis.totalLiabilities)}</span></div>
                <div className="border-t border-slate-800 my-2 pt-2 flex justify-between"><span className="text-xs font-bold text-slate-100">Net Worth</span><span className="text-sm font-black text-emerald-400">{formatRupiah(analysis.netWorth)}</span></div>
              </div>
            </div>
            <div className="p-6 bg-slate-950/40 rounded-2xl border border-slate-700/30">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Cashflow (MTD)</p>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-xs font-bold text-slate-400">Income</span><span className="text-xs font-black text-emerald-400">{formatRupiah(analysis.monthlyIncome)}</span></div>
                <div className="flex justify-between"><span className="text-xs font-bold text-slate-400">Expenses</span><span className="text-xs font-black text-red-300">{formatRupiah(analysis.monthlyExpense)}</span></div>
                <div className="border-t border-slate-800 my-2 pt-2 flex justify-between"><span className="text-xs font-bold text-slate-100">Savings</span><span className="text-sm font-black text-emerald-400">{formatRupiah(analysis.monthlySavings)}</span></div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-black text-slate-100 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400">insights</span>
              Efficiency Metrics
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-5 bg-slate-950/40 rounded-2xl border border-slate-700/30 text-center">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Save Rate</p>
                <p className="text-xl font-black text-emerald-400">{analysis.saveRate.toFixed(1)}%</p>
              </div>
              <div className="p-5 bg-slate-950/40 rounded-2xl border border-slate-700/30 text-center">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Debt Ratio</p>
                <p className="text-xl font-black text-emerald-300">{analysis.debtToAssetRatio.toFixed(1)}%</p>
              </div>
              <div className="p-5 bg-slate-950/40 rounded-2xl border border-slate-700/30 text-center">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Budget Usage</p>
                <p className="text-xl font-black text-sky-400">{analysis.budgetUsage.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-black text-slate-100 mb-6">Strategic Recommendations</h4>
            <div className="space-y-4">
              {smartInsight.recommendations.map((rec, i) => (
                <div key={i} className="p-5 bg-slate-950/40 border border-slate-700/30 rounded-2xl flex justify-between items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-black text-slate-100 tracking-tight">{rec.title}</p>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${rec.priority === 'high' ? 'bg-red-400/10 text-red-300' : 'bg-emerald-400/10 text-emerald-400'}`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-500 leading-relaxed">{rec.description}</p>
                  </div>
                  <button onClick={() => rec.action === 'Add' ? onQuickAdd() : onNavigate(rec.action.toLowerCase().includes('budget') ? 'budget' : 'assets')} className="px-5 py-2 bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-colors duration-200 shrink-0">
                    {rec.action}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Optimization Log Modal */}
      <Modal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} title="Optimization Log" t={t}>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-slate-950/40 border border-slate-700/30 rounded-2xl">
            <div>
              <p className="text-xs font-black text-slate-100 tracking-tight">System Initialization</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Status: Success</p>
            </div>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Just Now</span>
          </div>
          {analysis.wealthScore < 60 && (
            <div className="flex items-center justify-between p-4 bg-red-400/5 border border-red-500/20 rounded-2xl">
              <div>
                <p className="text-xs font-black text-red-300 tracking-tight">Low Wealth Score Detected</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Audit Required</p>
              </div>
              <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Warning</span>
            </div>
          )}
          {analysis.saveRate > 20 && (
            <div className="flex items-center justify-between p-4 bg-emerald-400/5 border border-emerald-400/20 rounded-2xl">
              <div>
                <p className="text-xs font-black text-emerald-400 tracking-tight">High Accumulation Signal</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Status: Active</p>
              </div>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Signal</span>
            </div>
          )}
          <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-3xl opacity-50">
            <span className="material-symbols-outlined text-4xl mb-3">history</span>
            <p className="text-xs font-bold text-slate-500">No previous logs found. System history cleared.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Reusable Modal Component
function Modal({ isOpen, onClose, title, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" 
            onClick={onClose}
          ></motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            className="relative z-[201] w-full max-w-[640px] rounded-3xl border border-slate-700/30 bg-slate-900/90 shadow-2xl p-10 max-h-[90vh] overflow-y-auto no-scrollbar"
          >
            <div className="flex justify-between items-center mb-10">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-1">Intelligence Report</p>
                <h2 className="text-3xl font-black text-slate-100 tracking-tight">{title}</h2>
              </div>
              <button 
                onClick={onClose}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-950/40 border border-slate-700/50 text-slate-400 hover:text-white transition-colors duration-200"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {children}
            <div className="mt-12 pt-8 border-t border-slate-800 text-center">
              <button 
                onClick={onClose}
                className="px-10 py-4 bg-emerald-400 text-slate-950 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-300 transition-colors duration-200 shadow-[0_0_30px_rgba(74,222,128,0.2)]"
              >
                Close Report
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default Insight;

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMonthKey } from '../services/financeService';
import { 
  getCashBalance, 
  getTotalAssets, 
  getTotalLiabilities, 
  getNetWorth, 
  getMonthlyIncome, 
  getMonthlyExpense, 
  getSavingsRate,
  getDebtToAssetRatio,
  getLiquidityMonths,
  classifyTransaction
} from '../lib/finance/calculations';


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
  const [goals, setGoals] = useState({ targetType: 'auto', manualTarget: 0, autoMonths: 6 });

  useEffect(() => {
    const loadGoals = async () => {
      try {
        const { fetchGoals } = await import('../services/goalService');
        const userGoals = await fetchGoals();
        if (userGoals) setGoals(userGoals);
      } catch (err) {
        console.error('Failed to load goals:', err);
      }
    };
    loadGoals();
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(ti => (ti.date || ti.createdAt) && getMonthKey(ti.date || ti.createdAt) === selectedMonth);
  }, [transactions, selectedMonth]);

  

  // Current Context

  // 1. Core Calculations
  const analysis = useMemo(() => {
    const cashBalance = getCashBalance(transactions);
    const totalAssets = getTotalAssets(cashBalance, assets, receivables, transactions);
    const totalLiabilities = getTotalLiabilities(debts);
    const netWorth = getNetWorth(totalAssets, totalLiabilities);

    const monthlyIncome = getMonthlyIncome(transactions, selectedMonth);
    const monthlyExpense = getMonthlyExpense(transactions, selectedMonth);

    const monthlySavings = monthlyIncome - monthlyExpense;
    const saveRate = getSavingsRate(monthlyIncome, monthlyExpense) * 100;
    const debtToAssetRatio = getDebtToAssetRatio(totalLiabilities, totalAssets) * 100;
    const expenseRatio = monthlyIncome > 0 ? (monthlyExpense / monthlyIncome) * 100 : 0;

    const currentBudgets = budgets.filter(b => b.month === selectedMonth);
    const monthlyBudget = currentBudgets.reduce((sum, b) => sum + toNumber(b.limit), 0);
    const budgetUsage = monthlyBudget > 0 ? (monthlyExpense / monthlyBudget) * 100 : 0;

    // Liquid Assets Calculation
    const liquidCategories = ['Cash', 'Bank', 'E-Wallet', 'Investment', 'Crypto'];
    const liquidPortfolio = assets
      .filter(a => liquidCategories.includes(a.category))
      .reduce((sum, a) => sum + toNumber(a.amount), 0);
    
    const effectiveLiquid = cashBalance + liquidPortfolio > 0 ? cashBalance + liquidPortfolio : totalAssets;

    const { months: emergencyFundMonths } = getLiquidityMonths(effectiveLiquid, transactions);

    // Biggest Category
    const categoryTotals = {};
    filteredTransactions
      .filter(t_item => classifyTransaction(t_item) === 'expense')
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
    
    const { status, statusColor, riskLevel } = getFinancialHealth(wealthScore);

    // Receivables Metrics
    const paidReceivablesThisMonth = (receivables || []).reduce((acc, r) => {
      const isPaidThisMonth = getMonthKey(r.updatedAt) === selectedMonth;
      return isPaidThisMonth ? acc + toNumber(r.paidAmount) : acc;
    }, 0);
    const overdueCount = (receivables || []).filter(r => r.status !== 'paid' && r.dueDate && new Date(r.dueDate) < new Date()).length;

    const activeReceivables = (receivables || []).filter(r => r.status !== 'paid');
    const outstandingReceivables = activeReceivables.reduce((sum, r) => sum + toNumber(r.remainingAmount), 0);

    return {
      totalAssets, totalLiabilities, netWorth, monthlyIncome, monthlyExpense, monthlySavings,
      saveRate, debtToAssetRatio, expenseRatio, monthlyBudget, budgetUsage,
      effectiveLiquid, emergencyFundMonths, biggestCategory, wealthScore, status, statusColor,
      currentBudgets, outstandingReceivables, paidReceivablesThisMonth, overdueCount
    };
  }, [filteredTransactions, assets, debts, budgets, receivables, selectedMonth, transactions]);

  const smartInsight = useMemo(() => {
    const { 
      totalAssets, totalLiabilities, monthlyIncome, monthlyExpense, 
      saveRate, debtToAssetRatio, budgetUsage, biggestCategory, netWorth, riskLevel: baseRiskLevel 
    } = analysis;

    const recommendations = [];
    let riskLevel = baseRiskLevel;
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
        if (riskLevel === "Low") {
          opportunitySummary = "Your net worth is positive and your monthly cashflow is profitable. Continue compounding assets.";
        } else {
          opportunitySummary = "Your net worth is positive, but you must resolve risk factors to safely continue compounding.";
        }
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

    if (debts.length === 0 && assets.length > 0) tasks.push({ icon: 'fact_check', color: 'text-sky-400', bg: 'bg-sky-400/10', title: 'Review debt position', desc: 'Ensure all liabilities are recorded.', priority: 'low', target: 'assets', flag: 'openDebtModalOnLoad' });
    if (emergencyFundMonths < 3) tasks.push({ icon: 'emergency', color: 'text-red-400', bg: 'bg-red-400/10', title: 'Build emergency fund', desc: 'Current buffer is less than 3 months.', priority: 'high', target: 'insight' });
    if (debtToAssetRatio > 30) tasks.push({ icon: 'trending_down', color: 'text-orange-400', bg: 'bg-orange-400/10', title: 'Reduce debt exposure', desc: 'Keep debt-to-asset below 30% for stability.', priority: 'medium', target: 'assets', flag: 'openDebtModalOnLoad' });
    if (saveRate < 20 && monthlyIncome > 0) tasks.push({ icon: 'savings', color: 'text-primary', bg: 'bg-primary/10', title: 'Increase saving rate', desc: 'Target 20% savings for faster growth.', priority: 'medium', target: 'budget', flag: 'openBudgetModalOnLoad' });
    if (monthlyBudget <= 0) tasks.push({ icon: 'assignment', color: 'text-blue-400', bg: 'bg-blue-400/10', title: 'Set monthly budget limits', desc: 'Essential for expense discipline.', priority: 'medium', target: 'budget', flag: 'openBudgetModalOnLoad' });
    if (budgetUsage > 100) tasks.push({ icon: 'warning', color: 'text-red-400', bg: 'bg-red-400/10', title: 'Review over-budget items', desc: 'You have exceeded monthly limits.', priority: 'high', target: 'budget' });
    if (monthlyIncome <= 0) tasks.push({ icon: 'payments', color: 'text-primary', bg: 'bg-primary/10', title: 'Record this month income', desc: 'No income recorded for this period.', priority: 'high', target: 'transactions' });

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
    if (transactions.length === 0) return [];
    
    // Find the month of the first transaction
    const firstTx = [...transactions].sort((a, b) => new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt))[0];
    const firstMonthKey = getMonthKey(firstTx.date || firstTx.createdAt);
    
    const last6Months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mKey = getMonthKey(d);
      if (mKey >= firstMonthKey) {
        last6Months.push(mKey);
      }
    }

    return last6Months.map(mKey => {
      const income = getMonthlyIncome(transactions, mKey);
      const expense = getMonthlyExpense(transactions, mKey);
      
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
  let efTarget = 0;
  if (goals.targetType === 'manual') {
    efTarget = goals.manualTarget;
  } else {
    // automatic
    const { avgMonthlyEssentialExpense } = getLiquidityMonths(analysis.effectiveLiquid, transactions);
    efTarget = avgMonthlyEssentialExpense > 0 ? avgMonthlyEssentialExpense * goals.autoMonths : 0;
  }
  
  const efSaved = analysis.effectiveLiquid;
  const efPercent = efTarget > 0 ? Math.min((efSaved / efTarget) * 100, 100) : 0;

  return (
    <div className="p-4 md:p-8 pb-[100px]">
      {/* Page Title Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1 ml-1">Strategy & Analysis</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-100 tracking-tight title-luxury">{t('insight')}</h2>
          <p className="text-sm font-medium text-slate-400 mt-1">Real-time intelligence based on your command center data.</p>
        </div>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
          <div className="flex flex-col gap-1.5 min-w-[160px]">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 ml-1">Analysis Period</label>
            <input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="glass-input px-4 py-2 text-sm font-medium"
            />
          </div>
          {isInsightDismissed && (
            <button 
              onClick={handleResetInsight}
              className="px-4 py-2 mt-auto bg-white/[0.02] border border-white/10 rounded-lg text-[11px] font-semibold uppercase tracking-wider text-primary hover:bg-white/[0.05] transition-colors"
            >
              Show Smart Insight
            </button>
          )}
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
        {/* Financial Health Score Card */}
        <div className="col-span-1 md:col-span-12 lg:col-span-5 card-luxury p-8 flex flex-col items-center justify-center relative min-h-[420px] rounded-2xl">
          
          <div className="relative flex flex-col items-center">
            <div className="w-48 h-48 md:w-56 md:h-56 rounded-full border-[12px] border-white/5 flex items-center justify-center relative">
              <svg className="absolute inset-0 w-full h-full -rotate-90 scale-[1.08]">
                <circle 
                  className={`${analysis.statusColor} transition-all duration-1000 ease-out`} 
                  cx="50%" cy="50%" fill="none" r="42%" stroke="currentColor" 
                  strokeDasharray="527" 
                  strokeDashoffset={527 - (527 * analysis.wealthScore / 100)} 
                  strokeWidth="12" strokeLinecap="round"
                ></circle>
              </svg>
              <div className="text-center">
                <span className="text-5xl md:text-6xl font-bold text-slate-100 tracking-tighter block leading-none">{analysis.wealthScore}</span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-2 block">Wealth Score</span>
              </div>
            </div>
            <div className={`mt-8 px-6 py-2 ${analysis.statusColor} bg-white/[0.03] border border-white/10 rounded-lg font-semibold text-xs uppercase tracking-wider`}>
              Status: {analysis.status}
            </div>
          </div>
          
          <div className="mt-8 w-full grid grid-cols-3 gap-4 border-t border-white/5 pt-8">
            <div className="text-center group/item">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1 group-hover/item:text-primary transition-colors">Income Flow</p>
              <span className={`material-symbols-outlined font-medium text-2xl mb-1 ${analysis.monthlyIncome > analysis.monthlyExpense ? 'text-primary' : 'text-red-400'}`}>
                {analysis.monthlyIncome > analysis.monthlyExpense ? 'trending_up' : 'trending_down'}
              </span>
              <p className="text-[9px] font-bold text-slate-100 uppercase tracking-widest">{analysis.monthlyIncome > analysis.monthlyExpense ? 'Surplus' : 'Deficit'}</p>
            </div>
            <div className="text-center group/item">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1 group-hover/item:text-primary transition-colors">Debt Level</p>
              <span className={`material-symbols-outlined font-medium text-2xl mb-1 ${analysis.debtToAssetRatio > 40 ? 'text-red-400' : 'text-primary'}`}>
                {analysis.debtToAssetRatio > 40 ? 'gpp_maybe' : 'verified_user'}
              </span>
              <p className="text-[9px] font-bold text-slate-100 uppercase tracking-widest">{analysis.debtToAssetRatio > 40 ? 'High Risk' : 'Healthy'}</p>
            </div>
            <div className="text-center group/item">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1 group-hover/item:text-primary transition-colors">Liquidity</p>
              <span className={`material-symbols-outlined font-medium text-2xl mb-1 ${analysis.emergencyFundMonths < 3 ? 'text-red-400' : 'text-primary'}`}>
                {analysis.emergencyFundMonths < 3 ? 'warning' : 'savings'}
              </span>
              <p className="text-[9px] font-bold text-slate-100 uppercase tracking-widest">{analysis.emergencyFundMonths.toFixed(1)} Mo</p>
            </div>
          </div>
        </div>

        {/* Analysis & Improvements Bento Group */}
        <div className="col-span-1 md:col-span-12 lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
          {/* Strength Analysis */}
          <div className="card-luxury p-6 lg:p-8 flex flex-col justify-between rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary text-[24px]">check_circle</span>
              <h3 className="text-xl font-bold text-slate-100 tracking-tight title-luxury">Strength Analysis</h3>
            </div>
            <ul className="space-y-6 flex-1 flex flex-col justify-center">
              <li className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-400 tracking-tight">
                  {analysis.monthlyIncome > analysis.monthlyExpense ? 'Income exceeds expenses' : 'Expenses exceed income'}
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-md ${analysis.monthlyIncome > analysis.monthlyExpense ? 'text-primary bg-primary/10' : 'text-red-400 bg-red-400/10'}`}>
                  {analysis.monthlyIncome > analysis.monthlyExpense ? 'Optimal' : 'Critical'}
                </span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-400 tracking-tight">Save rate {analysis.saveRate.toFixed(1)}%</span>
                <span className={`text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-md ${analysis.saveRate >= 20 ? 'text-primary bg-primary/10' : analysis.saveRate >= 10 ? 'text-primary bg-primary/10' : 'text-yellow-400 bg-yellow-400/10'}`}>
                  {analysis.saveRate >= 20 ? 'Excellent' : analysis.saveRate >= 10 ? 'Good' : 'Needs Work'}
                </span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-400 tracking-tight">Debt Exposure</span>
                <span className={`text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-md ${analysis.debtToAssetRatio <= 30 ? 'text-primary bg-primary/10' : analysis.debtToAssetRatio <= 60 ? 'text-yellow-400 bg-yellow-400/10' : 'text-red-400 bg-red-400/10'}`}>
                  {analysis.debtToAssetRatio <= 30 ? 'Stable' : analysis.debtToAssetRatio <= 60 ? 'Attention' : 'Critical'}
                </span>
              </li>
            </ul>
          </div>

          {/* Risk Factors */}
          <div className="card-luxury p-6 lg:p-8 flex flex-col justify-between rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-red-400 text-[24px]">warning</span>
              <h3 className="text-xl font-bold text-slate-100 tracking-tight title-luxury">Risk Factors</h3>
            </div>
            <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-1 flex flex-col justify-center">
              {smartInsight.riskLevel !== "Low" ? (
                <>
                  <div className={`p-4 rounded-lg border ${smartInsight.riskLevel === 'Critical' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-orange-500/10 border-orange-500/20 text-orange-400'}`}>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1">{smartInsight.riskLevel}</p>
                    <p className="text-sm font-semibold tracking-tight">{smartInsight.riskSummary}</p>
                  </div>
                  {analysis.budgetUsage > 100 && (
                    <div className="p-4 bg-white/[0.03] rounded-lg border border-white/10">
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Budget</p>
                      <p className="text-sm font-semibold text-slate-100 tracking-tight">Monthly budget exceeded by {formatRupiah(analysis.monthlyExpense - analysis.monthlyBudget)}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-6 flex flex-col items-center justify-center text-center">
                  <span className="material-symbols-outlined text-slate-600 text-4xl mb-3">gpp_good</span>
                  <p className="text-sm font-semibold text-slate-500">No major risks detected based on current data.</p>
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
                className="sm:col-span-2 rounded-xl border border-primary/20 bg-primary/5 p-6 lg:p-8 flex flex-col md:flex-row gap-6 items-center group hover:bg-primary/10 transition-colors"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-[32px]">auto_awesome</span>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-slate-100 tracking-tight title-luxury">Smart Insight AI</h3>
                    <span className={`text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${smartInsight.riskLevel === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                      {smartInsight.riskLevel} Risk Profile
                    </span>
                  </div>
                  <p className="text-base font-semibold text-slate-300 leading-relaxed tracking-tight mb-2">
                    {smartInsight.mainInsight}
                  </p>
                  
                  {smartInsight.riskLevel !== "Low" && (
                    <div className="mb-4 mt-4 p-4 rounded-xl border border-red-500/20 bg-red-500/5 flex gap-3 text-left">
                      <span className="material-symbols-outlined text-red-400 text-[20px]">warning</span>
                      <div>
                        <p className="text-sm font-semibold text-red-400 mb-1">Risk Factors</p>
                        <p className="text-sm text-slate-400 leading-relaxed">{smartInsight.riskSummary}</p>
                      </div>
                    </div>
                  )}

                  {smartInsight.riskLevel === "Low" && (
                    <div className="mb-4 mt-4 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex gap-3 text-left">
                      <span className="material-symbols-outlined text-emerald-400 text-[20px]">trending_up</span>
                      <div>
                        <p className="text-sm font-semibold text-emerald-400 mb-1">Strength Analysis</p>
                        <p className="text-sm text-slate-400 leading-relaxed">{smartInsight.opportunitySummary}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                      onClick={() => setIsAuditModalOpen(true)}
                      className="px-6 py-2.5 bg-white text-black rounded-lg text-xs font-semibold hover:bg-neutral-200 transition-colors"
                    >
                      Execute Full Audit
                    </button>
                    <button 
                      onClick={handleDismissInsight}
                      className="px-6 py-2.5 text-neutral-400 hover:text-white text-xs font-semibold transition-colors border border-transparent hover:border-white/10 rounded-lg"
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
        <div className="col-span-1 md:col-span-12 card-luxury rounded-3xl p-6 lg:p-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
            <div>
              <h3 className="text-2xl font-bold text-slate-100 tracking-tight title-luxury">Strategic Goal Tracker</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">Projecting your journey to absolute financial freedom.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            <div className="space-y-8 flex flex-col justify-center">
              <div className="flex justify-between items-end">
                <div>
                  <h4 className="text-xl font-bold text-slate-100 tracking-tight">Emergency Fund</h4>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-1">Target: {formatRupiah(efTarget)} ({goals.targetType === 'auto' ? `${goals.autoMonths} Months` : 'Manual'})</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold text-primary tracking-tighter block leading-none">{efPercent.toFixed(0)}%</span>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-1 block">Completed</span>
                </div>
              </div>
              <div className="w-full h-3 bg-white/[0.03] rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${efPercent}%` }} 
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-primary"
                ></motion.div>
              </div>
              <div className="flex justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <span>Liquid Assets: {formatRupiah(efSaved)}</span>
                <span>Requirement: {formatRupiah(Math.max(efTarget - efSaved, 0))}</span>
              </div>
            </div>

            <div className="flex items-end gap-2 h-40 pt-6">
              {trendData.map((d, i) => {
                const net = d.income - d.expense;
                const height = Math.max((Math.abs(net) / maxTrendVal) * 100, 5);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-3 group h-full">
                    <div className="flex-1 w-full flex items-end justify-center relative">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        className={`w-full max-w-[24px] rounded-t-md transition-all duration-300 ${net >= 0 ? 'bg-primary' : 'bg-red-500'}`}
                      ></motion.div>
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#0a0a0a] border border-white/10 px-2 py-1 rounded text-center opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                        <p className="text-[10px] font-semibold text-white whitespace-nowrap">{formatRupiah(net)}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-neutral-500">{d.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Capital Accumulation Trend */}
        <div className="col-span-1 lg:col-span-6 card-luxury rounded-3xl p-6 lg:p-10 flex flex-col justify-center">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
            <h3 className="text-2xl font-bold text-slate-100 tracking-tight title-luxury">Monthly Flow Analysis</h3>
            <div className="flex gap-6">
              <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-primary"></span> Income
              </span>
              <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Expense
              </span>
            </div>
          </div>
          <div className="h-[240px] w-full flex items-end gap-4 px-2 overflow-x-auto custom-scrollbar">
            {trendData.map((d, i) => (
              <div key={i} className="min-w-[60px] flex-1 flex flex-col items-center gap-4 group h-full">
                <div className="w-full flex gap-1.5 items-end h-[180px]">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.income / maxTrendVal) * 100}%` }}
                    className={`flex-1 rounded-t-md transition-all duration-300 ${i === 5 ? 'bg-primary' : 'bg-primary/20 group-hover:bg-primary/40'}`}
                  ></motion.div>
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.expense / maxTrendVal) * 100}%` }}
                    className={`flex-1 rounded-t-md transition-all duration-300 ${i === 5 ? 'bg-red-500' : 'bg-red-500/20 group-hover:bg-red-500/40'}`}
                  ></motion.div>
                </div>
                <span className={`text-[10px] font-semibold uppercase tracking-wider transition-colors ${i === 5 ? 'text-primary' : 'text-neutral-500 group-hover:text-neutral-300'}`}>{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Strategic Tasks */}
        <div className="col-span-1 md:col-span-12 lg:col-span-4 card-luxury rounded-3xl p-6 lg:p-8 flex flex-col">
          <h3 className="text-xl font-bold text-slate-100 tracking-tight title-luxury mb-6">Strategic Tasks</h3>
          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {strategicTasks.length > 0 ? strategicTasks.map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => handleTaskClick(item)}
                className="flex items-start gap-4 p-4 bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors rounded-lg cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}>
                  <span className={`material-symbols-outlined font-medium text-[20px] ${item.color}`}>{item.icon}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-100 tracking-tight">{item.title}</p>
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5 line-clamp-2">{item.desc}</p>
                </div>
              </motion.div>
            )) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <span className="material-symbols-outlined text-neutral-600 text-4xl mb-3">task_alt</span>
                <p className="text-sm font-medium text-neutral-500">All strategic objectives for this period have been analyzed.</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => setIsLogModalOpen(true)}
            className="w-full mt-6 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-100 transition-colors border-t border-white/5"
          >
            View Optimization Log
          </button>
        </div>
      </div>

      {/* Audit Modal */}
      <Modal isOpen={isAuditModalOpen} onClose={() => setIsAuditModalOpen(false)} title="Full System Audit" t={t}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-white/[0.02] rounded-lg border border-white/5">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Wealth Snapshot</p>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-xs font-medium text-slate-400">Total Assets</span><span className="text-xs font-bold text-slate-100">{formatRupiah(analysis.totalAssets)}</span></div>
                <div className="flex justify-between"><span className="text-xs font-medium text-slate-400">Liabilities</span><span className="text-xs font-bold text-red-400">{formatRupiah(analysis.totalLiabilities)}</span></div>
                <div className="border-t border-white/5 my-2 pt-2 flex justify-between"><span className="text-xs font-medium text-slate-100">Net Worth</span><span className="text-sm font-bold text-primary">{formatRupiah(analysis.netWorth)}</span></div>
              </div>
            </div>
            <div className="p-5 bg-white/[0.02] rounded-lg border border-white/5">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Cashflow (MTD)</p>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-xs font-medium text-slate-400">Income</span><span className="text-xs font-bold text-primary">{formatRupiah(analysis.monthlyIncome)}</span></div>
                <div className="flex justify-between"><span className="text-xs font-medium text-slate-400">Expenses</span><span className="text-xs font-bold text-red-400">{formatRupiah(analysis.monthlyExpense)}</span></div>
                <div className="border-t border-white/5 my-2 pt-2 flex justify-between"><span className="text-xs font-medium text-slate-100">Savings</span><span className="text-sm font-bold text-primary">{formatRupiah(analysis.monthlySavings)}</span></div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">insights</span>
              Efficiency Metrics
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-white/[0.02] rounded-lg border border-white/5 text-center">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Save Rate</p>
                <p className="text-lg font-bold text-primary">{analysis.saveRate.toFixed(1)}%</p>
              </div>
              <div className="p-4 bg-white/[0.02] rounded-lg border border-white/5 text-center">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Debt Ratio</p>
                <p className="text-lg font-bold text-primary">{analysis.debtToAssetRatio.toFixed(1)}%</p>
              </div>
              <div className="p-4 bg-white/[0.02] rounded-lg border border-white/5 text-center">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Budget Usage</p>
                <p className="text-lg font-bold text-blue-400">{analysis.budgetUsage.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-base font-bold text-slate-100 mb-4">Strategic Recommendations</h4>
            <div className="space-y-3">
              {smartInsight.recommendations.map((rec, i) => (
                <div key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-lg flex justify-between items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-slate-100 tracking-tight">{rec.title}</p>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${rec.priority === 'high' ? 'bg-red-500/10 text-red-400' : 'bg-primary/10 text-primary'}`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-400 leading-relaxed">{rec.description}</p>
                  </div>
                  <button onClick={() => rec.action === 'Add' ? onQuickAdd() : onNavigate(rec.action.toLowerCase().includes('budget') ? 'budget' : 'assets')} className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-slate-100 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-colors shrink-0 border border-white/10">
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
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-lg">
            <div>
              <p className="text-xs font-bold text-slate-100 tracking-tight">System Initialization</p>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-1">Ready for analysis</p>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System</span>
          </div>
          {analysis.budgetUsage > 100 && (
            <div className="flex items-center justify-between p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
              <div>
                <p className="text-xs font-bold text-red-400 tracking-tight">Budget Exceeded Alert</p>
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-1">Requires intervention</p>
              </div>
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Warning</span>
            </div>
          )}
          {analysis.saveRate > 20 && (
            <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div>
                <p className="text-xs font-bold text-primary tracking-tight">High Accumulation Signal</p>
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-1">Status: Active</p>
              </div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Signal</span>
            </div>
          )}
          <div className="p-6 text-center border border-dashed border-white/10 rounded-lg bg-white/[0.01]">
            <span className="material-symbols-outlined text-3xl mb-2 text-slate-600">history</span>
            <p className="text-xs font-medium text-slate-500">No previous logs found. System history cleared.</p>
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={onClose}></div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-[201] w-[90vw] max-w-2xl rounded-3xl card-luxury shadow-2xl p-6 lg:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar mx-auto my-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-1">Intelligence Report</p>
                <h2 className="text-xl font-bold text-slate-100 tracking-tight title-luxury">{title}</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-100 transition-colors rounded-lg hover:bg-white/5"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            {children}
            <div className="mt-8 pt-6 border-t border-white/10 text-right">
              <button 
                onClick={onClose}
                className="px-6 py-2 bg-slate-100 text-slate-900 rounded-lg text-xs font-bold hover:bg-slate-300 transition-colors"
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

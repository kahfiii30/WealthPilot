import { CATEGORIES } from './categories.js';

export function classifyTransaction(transaction) {
  const investCategories = ['Trading', 'Investasi'];
  if (investCategories.includes(transaction.category) || transaction.type === 'transfer' || transaction.type === 'investment') {
    return 'transfer/investment';
  }
  if (transaction.type === 'income') return 'income';
  return 'expense';
}

export function getMonthKey(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// Trading & Investment Engine
export function getTradingBalanceAndGain(transactions) {
  let investmentAssets = 0;
  const gainsByMonth = {};
  const lossesByMonth = {};

  const sorted = [...transactions].sort((a, b) => {
    const da = new Date(a.date || a.createdAt).getTime();
    const db = new Date(b.date || b.createdAt).getTime();
    return da - db;
  });

  sorted.forEach(t => {
    const isInvest = ['Trading', 'Investasi'].includes(t.category) || t.type === 'transfer' || t.type === 'investment';
    if (!isInvest) return;

    const amt = Number.isFinite(Number(t.amount)) ? Number(t.amount) : 0;
    const m = getMonthKey(t.date || t.createdAt);
    if (!gainsByMonth[m]) gainsByMonth[m] = 0;
    if (!lossesByMonth[m]) lossesByMonth[m] = 0;

    // Outflow to investment
    if (t.type === 'expense' || t.type === 'transfer') {
      investmentAssets += amt;
    } 
    // Inflow from investment
    else if (t.type === 'income') {
      if (amt > investmentAssets) {
        const gain = amt - investmentAssets;
        gainsByMonth[m] += gain;
        investmentAssets = 0;
      } else {
        investmentAssets -= amt;
      }
    }
    // Explicit investment gain/loss (if added in the future)
    else if (t.type === 'investment') {
      if (amt > 0) gainsByMonth[m] += amt;
      else lossesByMonth[m] += Math.abs(amt);
    }
  });

  return { investmentAssets, gainsByMonth, lossesByMonth };
}

export function getCashBalance(transactions) {
  let cash = 0;
  transactions.forEach(t => {
    const isInvest = ['Trading', 'Investasi'].includes(t.category) || t.type === 'transfer' || t.type === 'investment';
    const amt = Number.isFinite(Number(t.amount)) ? Number(t.amount) : 0;
    
    if (t.type === 'income') {
      cash += amt;
    } else if (t.type === 'expense' || (isInvest && (t.type === 'expense' || t.type === 'transfer'))) {
      cash -= amt;
    }
  });
  return cash;
}

export function getTotalAssets(cash, assets, receivables, transactions) {
  const portfolio = (assets || []).reduce((acc, a) => acc + (Number(a.amount) || 0), 0);
  const activeReceivables = (receivables || []).filter(r => r.status !== 'paid');
  const outstandingReceivables = activeReceivables.reduce((sum, r) => sum + (Number(r.remainingAmount) || 0), 0);
  
  // Add remaining trading balance
  const { investmentAssets } = getTradingBalanceAndGain(transactions);
  
  return cash + portfolio + outstandingReceivables + investmentAssets;
}

export function getTotalLiabilities(debts) {
  return (debts || []).reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
}

export function getNetWorth(totalAssets, liabilities) {
  return totalAssets - liabilities;
}

export function getDebtToAssetRatio(liabilities, totalAssetsPlusCash) {
  if (totalAssetsPlusCash <= 0) return 0;
  return (liabilities / totalAssetsPlusCash);
}

export function getMonthlyIncome(transactions, monthKey) {
  const { gainsByMonth } = getTradingBalanceAndGain(transactions);
  const tradingGain = gainsByMonth[monthKey] || 0;

  const normalIncome = transactions
    .filter(t => classifyTransaction(t) === 'income')
    .filter(t => getMonthKey(t.date || t.createdAt) === monthKey)
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  return normalIncome + tradingGain;
}

export function getMonthlyExpense(transactions, monthKey) {
  const { lossesByMonth } = getTradingBalanceAndGain(transactions);
  const tradingLoss = lossesByMonth[monthKey] || 0;

  const normalExpense = transactions
    .filter(t => classifyTransaction(t) === 'expense')
    .filter(t => getMonthKey(t.date || t.createdAt) === monthKey)
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  return normalExpense + tradingLoss;
}

export function getSavingsRate(income, expense) {
  if (income <= 0) return 0;
  const savings = income - expense;
  return (savings / income);
}

export function getLiquidityMonths(cash, transactions) {
  const expenseTx = transactions.filter(t => classifyTransaction(t) === 'expense');
  
  // Find only essential expenses
  const essentialCategories = CATEGORIES.filter(c => c.isEssential).map(c => c.name);
  const essentialTx = expenseTx.filter(t => essentialCategories.includes(t.category));
  
  const allMonths = new Set(essentialTx.map(t => getMonthKey(t.date || t.createdAt)));
  const monthsWithData = allMonths.size || 1;
  
  const allTimeEssentialExpense = essentialTx.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const avgMonthlyEssentialExpense = allTimeEssentialExpense / monthsWithData;
  
  if (avgMonthlyEssentialExpense <= 0) return { months: 0, flag: "data belum cukup" };
  return { months: cash / avgMonthlyEssentialExpense, flag: null, avgMonthlyEssentialExpense };
}

export function getFinancialHealth(wealthScore) {
  let status = "Critical";
  let statusColor = "text-red-400";
  let riskLevel = "Critical";
  
  if (wealthScore >= 80) { status = "Excellent"; statusColor = "text-primary"; riskLevel = "Low"; }
  else if (wealthScore >= 60) { status = "Good"; statusColor = "text-primary"; riskLevel = "Low"; }
  else if (wealthScore >= 40) { status = "Needs Attention"; statusColor = "text-yellow-400"; riskLevel = "High"; }
  
  return { status, statusColor, riskLevel };
}

export function getBudgetSummary(transactions, budgets, selectedMonth) {
  const monthlyBudgets = budgets.filter(b => b.month === selectedMonth);
  
  const totalBudget = monthlyBudgets.reduce((sum, b) => {
    return sum + (Number.isFinite(b.limit) ? b.limit : 0);
  }, 0);

  const monthlyExpenses = transactions
    .filter(t => classifyTransaction(t) === 'expense')
    .filter(t => {
      const tMonth = t.date ? getMonthKey(t.date) : getMonthKey(t.createdAt);
      return tMonth === selectedMonth;
    });

  const totalActual = monthlyExpenses.reduce((sum, t) => {
    return sum + (Number.isFinite(t.amount) ? t.amount : 0);
  }, 0);

  const remainingBudget = totalBudget > 0 ? totalBudget - totalActual : null;

  const now = new Date();
  const [year, month] = selectedMonth.split("-").map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month;
  const remainingDays = isCurrentMonth ? Math.max(lastDay - now.getDate() + 1, 1) : lastDay;

  const safeToSpendPerDay = totalBudget > 0 && remainingDays > 0 
    ? Math.max(0, remainingBudget / remainingDays) 
    : null;
    
  const consumedPercent = totalBudget > 0 ? (totalActual / totalBudget) * 100 : null;

  const expenseMap = new Map();
  monthlyExpenses.forEach(t => {
    const cat = t.category || 'Lainnya';
    expenseMap.set(cat, (expenseMap.get(cat) || 0) + (Number.isFinite(t.amount) ? t.amount : 0));
  });

  const categoryStats = [];
  
  monthlyBudgets.forEach(b => {
    const actualSpent = expenseMap.get(b.category) || 0;
    const percentage = b.limit > 0 ? (actualSpent / b.limit) * 100 : 0;
    expenseMap.delete(b.category);
    categoryStats.push({
      ...b,
      actualSpent,
      percentage,
      hasBudget: true
    });
  });

  expenseMap.forEach((actualSpent, category) => {
    categoryStats.push({
      id: `no-budget-${category}`,
      category,
      limit: 0,
      actualSpent,
      percentage: null,
      hasBudget: false
    });
  });

  categoryStats.sort((a, b) => b.actualSpent - a.actualSpent);

  return {
    totalBudget,
    totalActual,
    remainingBudget,
    safeToSpendPerDay,
    consumedPercent,
    remainingDays,
    categoryStats,
    monthlyBudgets,
    monthlyExpenses
  };
}

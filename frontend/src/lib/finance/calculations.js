export function classifyTransaction(transaction) {
  if (transaction.type === 'income') return 'income';
  
  // Categorize specific ones as transfer/investment
  const investCategories = ['Trading', 'Investasi'];
  if (investCategories.includes(transaction.category)) {
    return 'transfer/investment';
  }
  
  return 'expense';
}

export function getMonthKey(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function getCashBalance(transactions) {
  // Cash balance is defined as all-time income minus all-time expense
  // Note: if a transaction is a transfer to investment, it should reduce cash balance, 
  // but for FASE 1 we follow the existing logic (income - expense).
  // FASE 1 also says "EXCLUDE tipe transfer & investment" for Monthly Income/Expense.
  // For cash balance, any money out (expense or investment) reduces cash.
  let cash = 0;
  transactions.forEach(t => {
    const type = classifyTransaction(t);
    const amount = Number.isFinite(Number(t.amount)) ? Number(t.amount) : 0;
    if (t.type === 'income') {
      cash += amount;
    } else if (t.type === 'expense' || type === 'transfer/investment') {
      cash -= amount;
    }
  });
  return cash;
}

export function getTotalAssets(cash, assets, receivables) {
  const portfolio = (assets || []).reduce((acc, a) => acc + (Number(a.amount) || 0), 0);
  const activeReceivables = (receivables || []).filter(r => r.status !== 'paid');
  const outstandingReceivables = activeReceivables.reduce((sum, r) => sum + (Number(r.remainingAmount) || 0), 0);
  return cash + portfolio + outstandingReceivables;
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
  return transactions
    .filter(t => classifyTransaction(t) === 'income')
    .filter(t => getMonthKey(t.date || t.createdAt) === monthKey)
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
}

export function getMonthlyExpense(transactions, monthKey) {
  return transactions
    .filter(t => classifyTransaction(t) === 'expense')
    .filter(t => getMonthKey(t.date || t.createdAt) === monthKey)
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
}

export function getSavingsRate(income, expense) {
  if (income <= 0) return 0;
  const savings = income - expense;
  return (savings / income);
}

export function getLiquidityMonths(cash, transactions) {
  const expenseTx = transactions.filter(t => classifyTransaction(t) === 'expense');
  const monthsWithData = new Set(expenseTx.map(t => getMonthKey(t.date || t.createdAt))).size || 1;
  
  const allTimeExpense = expenseTx.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const avgMonthlyExpense = allTimeExpense / monthsWithData;
  
  if (avgMonthlyExpense <= 0) return { months: 0, flag: "data belum cukup" };
  return { months: cash / avgMonthlyExpense, flag: null };
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

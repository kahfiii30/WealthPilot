import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import StatCard from '../components/StatCard';
import RecentTransactions from '../components/RecentTransactions';
import CashflowChart from '../components/CashflowChart';
import CategoryChart from '../components/CategoryChart';
import { getMonthKey } from '../services/financeService';
import { exportToCSV, exportToPDF } from '../utils/export';

function Dashboard({ transactions, assets = [], debts = [], receivables = [], onDeleteTransaction, t, fm, userProfile, selectedMonth, setSelectedMonth }) {
  const displayName = [userProfile?.firstName, userProfile?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim() || "Pilot";

  // 1. Filter transactions by selected month
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (!transaction.date) return false;
      const transactionMonth = getMonthKey(transaction.date);
      return transactionMonth === selectedMonth;
    });
  }, [transactions, selectedMonth]);

  // 2. Metrics for selected month
  const { totalIncome, totalExpense, savings, savingsRate } = useMemo(() => {
    const income = filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const sav = income - expense;
    const rate = income > 0 ? ((sav / income) * 100).toFixed(1) : 0;
    return { totalIncome: income, totalExpense: expense, savings: sav, savingsRate: rate };
  }, [filteredTransactions]);
  
  const totalAssets = useMemo(() => assets.reduce((acc, a) => acc + a.amount, 0), [assets]);
  const totalDebts = useMemo(() => debts.reduce((acc, d) => acc + d.amount, 0), [debts]);

  // Receivables Metrics
  const { totalReceivablesActive, outstandingReceivables, paidThisMonth } = useMemo(() => {
    const active = (receivables || []).filter(r => r.status !== 'paid');
    const totalActive = active.reduce((acc, r) => acc + r.amount, 0);
    const outstanding = active.reduce((acc, r) => acc + r.remainingAmount, 0);
    const paid = (receivables || []).reduce((acc, r) => {
      const isPaidThisMonth = r.status === 'paid' && getMonthKey(r.updatedAt) === selectedMonth;
      return isPaidThisMonth ? acc + r.paidAmount : acc;
    }, 0);
    return { totalReceivablesActive: totalActive, outstandingReceivables: outstanding, paidThisMonth: paid };
  }, [receivables, selectedMonth]);

  const { cashBalance, netWorth } = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const cash = income - expense;
    const net = cash + totalAssets + outstandingReceivables - totalDebts;
    return { cashBalance: cash, netWorth: net };
  }, [transactions, totalAssets, totalDebts, outstandingReceivables]);

  // Account Balances Calculation
  const accountBalances = useMemo(() => {
    const balances = {};
    const coreMethods = ['Cash', 'BCA', 'Mandiri', 'Seabank'];
    
    // Initialize with assets
    assets.forEach(a => {
      const key = a.name.toUpperCase();
      balances[key] = { name: a.name, amount: a.amount, category: a.category };
    });

    // Ensure core methods exist
    coreMethods.forEach(m => {
      const key = m.toUpperCase();
      if (!balances[key]) {
        balances[key] = { name: m, amount: 0, category: m === 'Cash' ? 'Cash' : 'Bank' };
      }
    });

    // Process all transactions
    transactions.forEach(t => {
      let method = (t.method || '').trim();
      const upperMethod = method.toUpperCase();
      
      // Map empty, -, 0, Bank Transfer to 'Cash'
      if (!method || upperMethod === '-' || upperMethod === '0' || upperMethod === 'BANK TRANSFER') {
        method = 'Cash';
      }
      
      const key = method.toUpperCase();
      if (!balances[key]) {
        balances[key] = { name: method, amount: 0, category: 'Other' };
      }
      if (t.type === 'income') {
        balances[key].amount += t.amount;
      } else if (t.type === 'expense') {
        balances[key].amount -= t.amount;
      }
    });

    return Object.values(balances)
      .filter(b => {
        // Keep core methods
        if (coreMethods.some(m => m.toUpperCase() === b.name.toUpperCase())) return true;
        // Explicitly hide assets from the wallets view to prevent double-counting
        if (assets.some(a => a.name.toUpperCase() === b.name.toUpperCase())) return false;
        // Hide others if amount is 0 or if it's a weird artifact
        if (b.amount === 0) return false;
        if (b.name === '-' || b.name === '0') return false;
        return true;
      })
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, assets]);

  const totalAccountBalance = useMemo(() => accountBalances.reduce((acc, a) => acc + a.amount, 0), [accountBalances]);

  const [isReportOpen, setIsReportOpen] = useState(false);

  // 3. Monthly History (from ALL transactions)
  const monthlySummaryList = useMemo(() => {
    const summary = transactions.reduce((acc, transaction) => {
      if (!transaction.date) return acc;
      const month = getMonthKey(transaction.date);
      if (!acc[month]) {
        acc[month] = { month, income: 0, expense: 0, balance: 0 };
      }
      const amount = Number(transaction.amount) || 0;
      if (transaction.type === "income") acc[month].income += amount;
      if (transaction.type === "expense") acc[month].expense += amount;
      acc[month].balance = acc[month].income - acc[month].expense;
      return acc;
    }, {});
    return Object.values(summary).sort((a, b) => b.month.localeCompare(a.month));
  }, [transactions]);

  // Spending Breakdown Categories
  const categories = useMemo(() => [
    { name: 'Food & Dining', icon: 'restaurant', color: 'bg-emerald-400', text: 'text-emerald-400' },
    { name: 'Trading', icon: 'show_chart', color: 'bg-blue-500', text: 'text-blue-500' },
    { name: 'Kebutuhan', icon: 'shopping_bag', color: 'bg-orange-400', text: 'text-orange-400' },
    { name: 'Transportasi', icon: 'directions_car', color: 'bg-yellow-500', text: 'text-yellow-500' },
    { name: 'Investasi', icon: 'trending_up', color: 'bg-purple-500', text: 'text-purple-500' },
    { name: 'Lainnya', icon: 'more_horiz', color: 'bg-slate-500', text: 'text-slate-500' },
  ], []);

  const expensesByCategory = useMemo(() => {
    if (!filteredTransactions) return [];
    
    return categories.map(cat => {
      const amount = filteredTransactions
        .filter(t => t.type === 'expense' && t.category === cat.name)
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        category: cat.name,
        icon: cat.icon,
        amount: amount,
      };
    }).filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions, categories]);

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

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="p-4 md:p-8"
    >
      {/* Welcome Header */}
      <motion.section variants={item} className="mb-6 md:mb-8 2xl:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
        <div className="flex flex-col gap-1 2xl:gap-2">
          <h2 className="text-3xl 2xl:text-4xl font-semibold text-white tracking-tight">
            {t('welcome')}, {displayName}.
          </h2>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <p className="text-sm 2xl:text-base font-medium text-neutral-400 tracking-tight">{t('healthStatus')}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsReportOpen(true)}
            className="h-10 px-5 bg-white/[0.03] border border-white/10 rounded-lg text-white font-medium text-sm hover:bg-white/[0.06] transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-primary text-[18px]">analytics</span>
            Report
          </button>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500 ml-1">Period</label>
            <input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2 text-white font-medium outline-none focus:border-primary/50 transition-colors [color-scheme:dark] h-10"
            />
          </div>
        </div>
      </motion.section>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 2xl:gap-8 mb-6 md:mb-8 2xl:mb-12">
        {/* Total Net Worth Card */}
        <motion.div variants={item} className="rounded-2xl glass-card-premium p-6 md:p-8 flex flex-col min-w-0">
          <div className="flex justify-between items-start mb-6 min-w-0">
            <div className="min-w-0 w-full overflow-hidden">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 truncate block">{t('totalNetWorth')}</span>
              <p className="text-4xl 2xl:text-5xl font-bold text-white tracking-tight mt-2 truncate">{fm(netWorth)}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-primary">
              <span className="material-symbols-outlined font-medium">account_balance_wallet</span>
            </div>
          </div>

          <div className="mt-auto space-y-3 pt-6 border-t border-white/5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-400">Cash Balance</span>
              <span className="font-medium text-white">{fm(cashBalance)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-400">Assets</span>
              <span className="text-primary font-medium">+ {fm(totalAssets)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-400">Receivables</span>
              <span className="text-primary font-medium">+ {fm(outstandingReceivables)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-400">Debts</span>
              <span className="text-red-400 font-medium">- {fm(totalDebts)}</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1 truncate block">{t('savingsRate')}</p>
              <p className="text-2xl font-bold text-white tracking-tight truncate">{savingsRate}%</p>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1 truncate block">Monthly Savings</p>
              <p className={`text-2xl font-bold tracking-tight truncate ${savings >= 0 ? 'text-primary' : 'text-red-400'}`}>{fm(savings)}</p>
            </div>
          </div>
        </motion.div>

        {/* Cashflow Card */}
        <motion.div variants={item} className="rounded-2xl glass-card-premium p-6 md:p-8 flex flex-col">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white tracking-tight mb-1">{t('cashflowOverview')}</h3>
            <p className="text-sm text-neutral-400">Income vs expenses</p>
          </div>
          
          <div className="grid grid-cols-2 gap-6 my-auto border-white/5 border-y py-6 mb-6">
            <StatCard title={t('totalIncome')} amount={fm(totalIncome)} icon="south_west" isError={false} />
            <StatCard title={t('totalExpense')} amount={fm(totalExpense)} icon="north_east" isError={true} />
          </div>
          
          <div>
            <div className="flex justify-between text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-2">
              <span className="truncate mr-4">{t('totalIncome')} {fm(totalIncome)}</span>
              <span className="truncate">{t('totalExpense')} {fm(totalExpense)}</span>
            </div>
            <div className="w-full h-3 bg-white/[0.03] rounded-full overflow-hidden flex mb-6">
              {totalIncome > 0 ? (
                <>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(0, 100 - (totalExpense / totalIncome) * 100)}%` }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} className="h-full bg-primary"></motion.div>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (totalExpense / totalIncome) * 100)}%` }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }} className="h-full bg-red-500"></motion.div>
                </>
              ) : (
                <div className="h-full bg-red-500/20 w-full"></div>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/5">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-3">6-Month Trend</h4>
              <CashflowChart transactions={transactions} />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 2xl:gap-8 mb-6 md:mb-8 2xl:mb-12">
        {/* Wallets & Accounts */}
        <motion.div variants={item} className="rounded-2xl glass-card-premium p-6 md:p-8 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white tracking-tight">Wallets & Accounts</h3>
            <button className="text-primary hover:text-primary-dark transition-colors text-sm font-medium">View All</button>
          </div>
          <div className="space-y-3">
            {assets.slice(0,4).map((asset) => (
              <div key={asset.id} className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors min-w-0">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-white text-[20px]">account_balance</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-white truncate">{asset.name}</p>
                    <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider truncate">{asset.type}</p>
                  </div>
                </div>
                <p className="font-bold text-white shrink-0 ml-4">{fm(asset.value)}</p>
              </div>
            ))}
            {assets.length === 0 && (
              <div className="text-center py-8 text-neutral-500 text-sm">
                No accounts added yet.
              </div>
            )}
          </div>
        </motion.div>

        {/* Spending Breakdown */}
        <motion.div variants={item} className="rounded-xl border border-white/5 bg-white/[0.02] p-5 md:p-8 flex flex-col min-w-0">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white tracking-tight">{t('spendingBreakdown')}</h3>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            {expensesByCategory.length > 0 ? (
              <div className="space-y-4">
                {expensesByCategory.map((cat, index) => (
                  <div key={index} className="min-w-0">
                    <div className="flex justify-between text-sm mb-1.5 min-w-0">
                      <span className="font-medium text-white flex items-center gap-2 truncate pr-2">
                        <span className="material-symbols-outlined text-[16px] text-neutral-400">{cat.icon}</span>
                        {cat.category}
                      </span>
                      <span className="font-medium text-white shrink-0">{fm(cat.amount)}</span>
                    </div>
                    <div className="w-full bg-white/[0.03] rounded-full h-2 overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${Math.min(100, (cat.amount / totalExpense) * 100)}%` }} 
                        transition={{ duration: 1, delay: 0.1 * index }}
                        className="bg-primary h-2 rounded-full"
                      ></motion.div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-neutral-500 space-y-3 py-8">
                <span className="material-symbols-outlined text-[48px] opacity-20">receipt_long</span>
                <p className="text-sm">No expenses this month.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bento Grid: Transactions */}
      <div className="grid grid-cols-12 gap-4 md:gap-8 2xl:gap-12">
        <motion.div variants={item} className="col-span-12 lg:col-span-8">
          <RecentTransactions transactions={filteredTransactions} onDelete={onDeleteTransaction} t={t} fm={fm} />
        </motion.div>
      </div>

      <motion.section variants={item} className="mt-12">
        <h3 className="text-xl font-bold text-white tracking-tight mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-neutral-400">history</span>
          Monthly History
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {monthlySummaryList.map((summary) => (
            <div key={summary.month} className="rounded-2xl glass-card-premium p-6 group">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-4">{summary.month}</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-neutral-400">Income</span>
                  <span className="text-sm font-semibold text-white tracking-tight">{fm(summary.income)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-neutral-400">Expense</span>
                  <span className="text-sm font-semibold text-white tracking-tight">{fm(summary.expense)}</span>
                </div>
                <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Balance</span>
                  <span className={`text-sm font-bold tracking-tight ${summary.balance >= 0 ? 'text-primary' : 'text-red-400'}`}>
                    {fm(summary.balance)}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {monthlySummaryList.length === 0 && (
            <div className="col-span-full py-12 text-center rounded-xl border border-dashed border-white/10 text-neutral-500 font-semibold uppercase tracking-wider text-[11px]">
              No historical data available
            </div>
          )}
        </div>
      </motion.section>
      <ReportModal 
        isOpen={isReportOpen} 
        onClose={() => setIsReportOpen(false)} 
        data={{
          income: totalIncome,
          expense: totalExpense,
          cashflow: savings,
          cashBalance,
          assets: totalAssets,
          debts: totalDebts,
          receivables: outstandingReceivables,
          savingsRate
        }}
        fm={fm}
        month={selectedMonth}
        transactions={filteredTransactions}
      />
    </motion.div>
  );
}

function ReportModal({ isOpen, onClose, data, fm, month, transactions }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="absolute inset-0" onClick={onClose}></div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 w-full max-w-2xl glass-card-premium rounded-3xl p-8 overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Monthly Report</h2>
            <p className="text-neutral-500 font-semibold uppercase tracking-wider text-[11px] mt-1">{month}</p>
          </div>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined font-medium">close</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-10">
          <div className="space-y-6">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 border-l-2 border-primary pl-3">Cashflow Analysis</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center"><span className="text-neutral-400 text-sm">Total Income</span><span className="text-white font-medium">{fm(data.income)}</span></div>
              <div className="flex justify-between items-center"><span className="text-neutral-400 text-sm">Total Expenses</span><span className="text-white font-medium">{fm(data.expense)}</span></div>
              <div className="flex justify-between items-center pt-2 border-t border-white/5"><span className="text-white font-medium">Net Cashflow</span><span className={`font-semibold ${data.cashflow >= 0 ? 'text-primary' : 'text-red-400'}`}>{fm(data.cashflow)}</span></div>
              <div className="flex justify-between items-center"><span className="text-white font-medium">Savings Rate</span><span className="text-white font-semibold">{data.savingsRate}%</span></div>
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 border-l-2 border-secondary pl-3">Asset & Debt Summary</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center"><span className="text-neutral-400 text-sm">Cash Balance</span><span className="text-white font-medium">{fm(data.cashBalance)}</span></div>
              <div className="flex justify-between items-center"><span className="text-neutral-400 text-sm">Total Assets</span><span className="text-white font-medium">{fm(data.assets)}</span></div>
              <div className="flex justify-between items-center"><span className="text-neutral-400 text-sm">Total Debts</span><span className="text-red-400 font-medium">{fm(data.debts)}</span></div>
              <div className="flex justify-between items-center pt-2 border-t border-white/5"><span className="text-white font-medium">Outstanding Piutang</span><span className="text-primary font-semibold">{fm(data.receivables)}</span></div>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 mb-8">
           <div className="flex items-center gap-3 mb-4">
             <span className="material-symbols-outlined text-secondary text-[18px]">info</span>
             <h5 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-300">Financial Risk Notes</h5>
           </div>
           <div className="space-y-3">
             {data.debts > data.assets && <p className="text-sm text-red-400 font-medium">⚠️ Critical: Your total debts exceed your assets. Focus on debt reduction.</p>}
             {data.cashflow < 0 && <p className="text-sm text-orange-400 font-medium">⚠️ Warning: Negative cashflow this month. Review your expenses.</p>}
             {data.savingsRate < 20 && data.cashflow > 0 && <p className="text-sm text-blue-400 font-medium">💡 Tip: Your savings rate is below 20%. Try to optimize smaller expenses.</p>}
             {data.cashflow > 0 && data.savingsRate >= 20 && <p className="text-sm text-primary font-medium">✅ Excellent: Your savings rate is healthy. Consider investing the surplus.</p>}
           </div>
        </div>

        <button 
          onClick={() => exportToCSV(transactions, `WealthPilot_Report_${month}`)}
          className="w-full py-3.5 bg-white border border-white/10 text-black font-semibold rounded-lg hover:bg-neutral-200 transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined font-medium">download</span>
          Export CSV (Full Report)
        </button>
      </motion.div>
    </div>
  );
}

export default Dashboard;

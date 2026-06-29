import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import StatCard from '../components/StatCard';
import RecentTransactions from '../components/RecentTransactions';
import { getMonthKey } from '../services/financeService';
import { exportToCSV } from '../utils/export';

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
    const net = cash + totalAssets - totalDebts;
    return { cashBalance: cash, netWorth: net };
  }, [transactions, totalAssets, totalDebts]);

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
  const categories = [
    { name: 'Food & Dining', icon: 'restaurant', color: 'bg-primary', text: 'text-primary' },
    { name: 'Transportation', icon: 'directions_car', color: 'bg-secondary', text: 'text-secondary' },
    { name: 'Shopping', icon: 'shopping_bag', color: 'bg-tertiary', text: 'text-tertiary' },
    { name: 'Entertainment', icon: 'movie', color: 'bg-orange-500', text: 'text-orange-500' },
    { name: 'Bills & Utilities', icon: 'electric_bolt', color: 'bg-yellow-500', text: 'text-yellow-500' },
    { name: 'Health & Medical', icon: 'favorite', color: 'bg-red-500', text: 'text-red-500' },
    { name: 'Education', icon: 'school', color: 'bg-blue-500', text: 'text-blue-500' },
    { name: 'Travel', icon: 'flight', color: 'bg-cyan-500', text: 'text-cyan-500' },
    { name: 'Insurance', icon: 'health_and_safety', color: 'bg-emerald-500', text: 'text-emerald-500' },
    { name: 'Others', icon: 'more_horiz', color: 'bg-slate-500', text: 'text-slate-500' },
  ];

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
      className="p-8"
    >
      {/* Welcome Header */}
      <motion.section variants={item} className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl font-black text-slate-100 tracking-tighter">
            {t('welcome')}, {displayName}.
          </h2>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_15px_rgba(74,222,128,0.4)]"></span>
            <p className="text-base font-bold text-slate-400 tracking-tight">{t('healthStatus')}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsReportOpen(true)}
            className="h-11 px-6 bg-slate-800 border border-slate-700/50 rounded-xl text-slate-100 font-bold text-sm hover:bg-slate-700 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-emerald-400 text-[20px]">analytics</span>
            Report
          </button>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Period</label>
            <input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2 text-slate-100 font-bold outline-none focus:border-emerald-400/50 transition-colors [color-scheme:dark] h-11"
            />
          </div>
        </div>
      </motion.section>

      {/* Primary Metrics */}
      <div className="grid grid-cols-12 gap-8 mb-8">
        {/* Total Net Worth Card */}
        <motion.div variants={item} className="col-span-12 md:col-span-12 lg:col-span-5 rounded-2xl border border-slate-700/30 bg-gradient-to-br from-slate-900/80 via-slate-900/55 to-blue-950/30 p-8 flex flex-col shadow-xl backdrop-blur-xl transition-colors duration-200 ease-out hover:border-emerald-400/30 group">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{t('totalNetWorth')}</span>
              <p className="text-5xl font-black text-slate-100 tracking-tighter mt-1">{fm(netWorth)}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-400/10 border border-emerald-400/20">
              <span className="material-symbols-outlined text-emerald-400 font-bold">account_balance_wallet</span>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-medium">Cash Balance</span>
              <span className="text-slate-200 font-black">{fm(cashBalance)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-medium">Assets</span>
              <span className="text-emerald-400 font-black">+ {fm(totalAssets)}</span>
            </div>
            <div className="flex justify-between items-center text-sm pb-4 border-b border-slate-700/30">
              <span className="text-slate-400 font-medium">Debts</span>
              <span className="text-red-300 font-black">- {fm(totalDebts)}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Formula</span>
              <span className="text-[10px] font-bold text-slate-600">Cash + Assets - Debts</span>
            </div>
          </div>

          <div className="mt-auto grid grid-cols-2 gap-4 border-t border-slate-700/30 pt-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{t('savingsRate')}</p>
              <p className="text-2xl font-black text-slate-100 tracking-tighter">{savingsRate}%</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Monthly {t('savings')}</p>
              <p className={`text-2xl font-black tracking-tighter ${savings >= 0 ? 'text-emerald-400' : 'text-red-300'}`}>{fm(savings)}</p>
            </div>
          </div>
        </motion.div>

        {/* Income vs Expense Dashboard */}
        <motion.div variants={item} className="col-span-12 md:col-span-12 lg:col-span-7 rounded-2xl border border-slate-700/30 bg-slate-900/55 p-8 flex flex-col justify-between shadow-xl backdrop-blur-xl transition-colors duration-200 ease-out hover:border-emerald-400/30 hover:bg-slate-900/70">
          <div className="mb-8">
            <h3 className="text-2xl font-black text-slate-100 tracking-tight mb-2">{t('cashflowOverview')}</h3>
            <p className="text-sm font-bold text-slate-500 tracking-tight">Real-time breakdown of your income vs expenses.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-6 my-auto border-slate-700/30 border-y py-8 mb-8">
            <StatCard title={t('totalIncome')} amount={fm(totalIncome)} icon="south_west" isError={false} />
            <StatCard title={t('totalExpense')} amount={fm(totalExpense)} icon="north_east" isError={true} />
          </div>
          
          <div>
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">
              <span className="truncate mr-4">{t('totalIncome')} {fm(totalIncome)}</span>
              <span className="truncate">{t('totalExpense')} {fm(totalExpense)}</span>
            </div>
            <div className="w-full h-4 bg-slate-700/45 rounded-full overflow-hidden flex border border-slate-700/20 shadow-inner">
              {totalIncome > 0 ? (
                <>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(0, 100 - (totalExpense / totalIncome) * 100)}%` }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_0_15px_rgba(74,222,128,0.3)]"></motion.div>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (totalExpense / totalIncome) * 100)}%` }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }} className="h-full bg-gradient-to-r from-red-400 to-red-500 shadow-[0_0_15px_rgba(248,113,113,0.3)]"></motion.div>
                </>
              ) : (
                <div className="h-full bg-red-500/20 w-full"></div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Receivables Summary Row */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-2xl border border-slate-700/30 bg-slate-900/40 backdrop-blur-xl hover:border-emerald-400/30 transition-all group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-emerald-400/10 group-hover:bg-emerald-400/20 transition-colors">
              <span className="material-symbols-outlined text-emerald-400 font-bold">payments</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Active Receivables</span>
          </div>
          <div className="text-2xl font-black text-slate-100">{fm(totalReceivablesActive)}</div>
        </div>
        <div className="p-6 rounded-2xl border border-slate-700/30 bg-slate-900/40 backdrop-blur-xl hover:border-blue-400/30 transition-all group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-400/10 group-hover:bg-blue-400/20 transition-colors">
              <span className="material-symbols-outlined text-blue-400 font-bold">check_circle</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Paid This Month</span>
          </div>
          <div className="text-2xl font-black text-slate-100">{fm(paidThisMonth)}</div>
        </div>
        <div className="p-6 rounded-2xl border border-slate-700/30 bg-slate-900/40 backdrop-blur-xl hover:border-amber-400/30 transition-all group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-amber-400/10 group-hover:bg-amber-400/20 transition-colors">
              <span className="material-symbols-outlined text-amber-400 font-bold">pending</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Outstanding</span>
          </div>
          <div className="text-2xl font-black text-slate-100">{fm(outstandingReceivables)}</div>
        </div>
      </motion.div>

      {/* Bento Grid: Spending & Transactions */}
      <div className="grid grid-cols-12 gap-8">
        <motion.div variants={item} className="col-span-12 lg:col-span-4 rounded-2xl border border-slate-700/30 bg-slate-900/55 p-8 shadow-xl backdrop-blur-xl transition-colors duration-200 ease-out hover:border-emerald-400/30 hover:bg-slate-900/70">
          <h3 className="text-2xl font-black text-slate-100 tracking-tight mb-8">{t('spendingBreakdown')}</h3>
          <div className="space-y-6">
            {categories.map((cat) => {
               const catTotal = filteredTransactions.filter(t_data => t_data.type === 'expense' && t_data.category === cat.name).reduce((acc, t_data) => acc + t_data.amount, 0);
               const percent = totalExpense > 0 ? Math.round((catTotal / totalExpense) * 100) : 0;
               return (
                <div key={cat.name}>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${cat.color.replace('bg-', 'bg-')}/10 border border-white/5`}>
                        <span className={`material-symbols-outlined ${cat.text} text-[18px] font-bold`}>{cat.icon}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-300">{cat.name}</span>
                    </div>
                    <span className="text-xs font-black text-slate-500 tracking-widest">{percent}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-700/45 rounded-full overflow-hidden border border-white/5 shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${percent}%` }} 
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
                      className={`h-full bg-gradient-to-r from-emerald-400 to-sky-400 rounded-full shadow-[0_0_10px_rgba(74,222,128,0.2)]`}
                    ></motion.div>
                  </div>
                </div>
               );
            })}
          </div>
        </motion.div>

        <motion.div variants={item} className="col-span-12 lg:col-span-8">
          <RecentTransactions transactions={filteredTransactions} onDelete={onDeleteTransaction} t={t} fm={fm} />
        </motion.div>
      </div>

      <motion.section variants={item} className="mt-12">
        <h3 className="text-2xl font-black text-slate-100 tracking-tight mb-8 flex items-center gap-3">
          <span className="material-symbols-outlined text-emerald-400">history</span>
          Monthly History
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {monthlySummaryList.map((summary) => (
            <div key={summary.month} className="rounded-2xl border border-slate-700/30 bg-slate-900/55 p-6 shadow-lg backdrop-blur-xl hover:border-emerald-400/30 transition-all duration-200 group">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">{summary.month}</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400">Income</span>
                  <span className="text-sm font-black text-emerald-400 tracking-tight">{fm(summary.income)}</span>
                </div>
                <div className="flex justify-between items-center text-red-300">
                  <span className="text-xs font-bold text-slate-400">Expense</span>
                  <span className="text-sm font-black tracking-tight">{fm(summary.expense)}</span>
                </div>
                <div className="pt-3 border-t border-slate-700/30 flex justify-between items-center">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Balance</span>
                  <span className={`text-sm font-black tracking-tight ${summary.balance >= 0 ? 'text-slate-100' : 'text-red-300'}`}>
                    {fm(summary.balance)}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {monthlySummaryList.length === 0 && (
            <div className="col-span-full py-12 text-center rounded-2xl border border-dashed border-slate-700/30 text-slate-500 font-bold uppercase tracking-widest text-xs">
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
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 w-full max-w-2xl bg-slate-900 border border-slate-700/50 rounded-3xl p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <div className="flex justify-between items-center mb-8 border-b border-slate-700/30 pb-6">
          <div>
            <h2 className="text-3xl font-black text-slate-100 tracking-tight">Monthly Report</h2>
            <p className="text-emerald-400 font-bold uppercase tracking-widest text-[10px] mt-1">{month}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-100 transition-colors">
            <span className="material-symbols-outlined font-bold">close</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-10">
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-l-2 border-emerald-400 pl-3">Cashflow Analysis</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center"><span className="text-slate-400 text-sm">Total Income</span><span className="text-emerald-400 font-black">{fm(data.income)}</span></div>
              <div className="flex justify-between items-center"><span className="text-slate-400 text-sm">Total Expenses</span><span className="text-red-300 font-black">{fm(data.expense)}</span></div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-700/30"><span className="text-slate-100 font-bold">Net Cashflow</span><span className={`font-black ${data.cashflow >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fm(data.cashflow)}</span></div>
              <div className="flex justify-between items-center"><span className="text-slate-100 font-bold">Savings Rate</span><span className="text-slate-100 font-black">{data.savingsRate}%</span></div>
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-l-2 border-sky-400 pl-3">Asset & Debt Summary</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center"><span className="text-slate-400 text-sm">Cash Balance</span><span className="text-slate-200 font-black">{fm(data.cashBalance)}</span></div>
              <div className="flex justify-between items-center"><span className="text-slate-400 text-sm">Total Assets</span><span className="text-slate-200 font-black">{fm(data.assets)}</span></div>
              <div className="flex justify-between items-center"><span className="text-slate-400 text-sm">Total Debts</span><span className="text-red-300 font-black">{fm(data.debts)}</span></div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-700/30"><span className="text-slate-100 font-bold">Outstanding Piutang</span><span className="text-amber-400 font-black">{fm(data.receivables)}</span></div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/30 rounded-2xl p-6 mb-8">
           <div className="flex items-center gap-3 mb-4">
             <span className="material-symbols-outlined text-sky-400">info</span>
             <h5 className="text-xs font-black uppercase tracking-widest text-slate-300">Financial Risk Notes</h5>
           </div>
           <div className="space-y-3">
             {data.debts > data.assets && <p className="text-xs text-red-300 font-medium">⚠️ Critical: Your total debts exceed your assets. Focus on debt reduction.</p>}
             {data.cashflow < 0 && <p className="text-xs text-amber-300 font-medium">⚠️ Warning: Negative cashflow this month. Review your expenses.</p>}
             {data.savingsRate < 20 && data.cashflow > 0 && <p className="text-xs text-blue-300 font-medium">💡 Tip: Your savings rate is below 20%. Try to optimize smaller expenses.</p>}
             {data.cashflow > 0 && data.savingsRate >= 20 && <p className="text-xs text-emerald-300 font-medium">✅ Excellent: Your savings rate is healthy. Consider investing the surplus.</p>}
           </div>
        </div>

        <button 
          onClick={() => exportToCSV(transactions, `WealthPilot_Report_${month}`)}
          className="w-full py-4 bg-emerald-500 text-slate-950 font-black rounded-xl border border-emerald-400 hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(74,222,128,0.2)]"
        >
          <span className="material-symbols-outlined font-bold">download</span>
          Export CSV (Full Report)
        </button>
      </motion.div>
    </div>
  );
}

export default Dashboard;

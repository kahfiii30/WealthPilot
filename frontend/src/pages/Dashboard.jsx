import { motion } from 'framer-motion';
import StatCard from '../components/StatCard';
import RecentTransactions from '../components/RecentTransactions';
import { getMonthKey } from '../services/financeService';

function Dashboard({ transactions, assets = [], debts = [], onDeleteTransaction, t, fm, userProfile, selectedMonth, setSelectedMonth }) {
  const displayName = [userProfile?.firstName, userProfile?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim() || "Pilot";

  // 1. Filter transactions by selected month
  const filteredTransactions = transactions.filter((transaction) => {
    if (!transaction.date) return false;
    const transactionMonth = getMonthKey(transaction.date);
    return transactionMonth === selectedMonth;
  });

  // 2. Metrics for selected month
  const totalIncome = filteredTransactions.filter(t_data => t_data.type === 'income').reduce((acc, t_data) => acc + t_data.amount, 0);
  const totalExpense = filteredTransactions.filter(t_data => t_data.type === 'expense').reduce((acc, t_data) => acc + t_data.amount, 0);
  const savings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(1) : 0;
  
  const totalAssets = assets.reduce((acc, a) => acc + a.amount, 0);
  const totalDebts = debts.reduce((acc, d) => acc + d.amount, 0);
  const netWorth = totalAssets + (filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0) - filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)) - totalDebts;

  // 3. Monthly History (from ALL transactions)
  const monthlySummary = transactions.reduce((acc, transaction) => {
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

  const monthlySummaryList = Object.values(monthlySummary).sort((a, b) => b.month.localeCompare(a.month));

  // Spending Breakdown Categories
  const categories = [
    { name: 'Food & Dining', icon: 'restaurant', color: 'bg-primary', text: 'text-primary' },
    { name: 'Transportation', icon: 'directions_car', color: 'bg-secondary', text: 'text-secondary' },
    { name: 'Shopping', icon: 'shopping_bag', color: 'bg-tertiary', text: 'text-tertiary' },
    { name: 'Entertainment', icon: 'movie', color: 'bg-orange-500', text: 'text-orange-500' },
    { name: 'Bills & Utilities', icon: 'electric_bolt', color: 'bg-yellow-500', text: 'text-yellow-500' },
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

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Analysis Period</label>
          <input 
            type="month" 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-slate-100 font-bold outline-none focus:border-emerald-400/50 transition-colors [color-scheme:dark]"
          />
        </div>
      </motion.section>

      {/* Primary Metrics */}
      <div className="grid grid-cols-12 gap-8 mb-8">
        {/* Total Net Worth Card */}
        <motion.div variants={item} className="col-span-12 md:col-span-12 lg:col-span-5 rounded-2xl border border-slate-700/30 bg-gradient-to-br from-slate-900/80 via-slate-900/55 to-blue-950/30 p-8 flex flex-col justify-between shadow-xl backdrop-blur-xl transition-colors duration-200 ease-out hover:border-emerald-400/30 group">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{t('totalNetWorth')}</span>
              <div className="p-3 rounded-xl bg-emerald-400/10 border border-emerald-400/20 transition-colors duration-200">
                <span className="material-symbols-outlined text-emerald-400 font-bold">account_balance_wallet</span>
              </div>
            </div>
            <p className="text-5xl font-black text-slate-100 tracking-tighter line-clamp-1">{fm(netWorth)}</p>
            <div className="flex items-center gap-3 mt-6 flex-wrap">
              <span className={`flex items-center gap-1.5 font-bold text-sm px-3 py-1.5 rounded-xl border ${savings >= 0 ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-red-300 bg-red-500/10 border-red-500/20'}`}>
                <span className="material-symbols-outlined text-lg font-bold">{savings >= 0 ? 'trending_up' : 'trending_down'}</span>
                {savings >= 0 ? '+' : ''}{fm(savings)}
              </span>
              <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">this cycle</span>
            </div>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-8 border-t border-slate-700/30 pt-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{t('savingsRate')}</p>
              <p className="text-3xl font-black text-slate-100 tracking-tighter">{savingsRate}%</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{t('savings')}</p>
              <p className={`text-3xl font-black tracking-tighter ${savings >= 0 ? 'text-emerald-400' : 'text-red-300'}`}>{fm(savings)}</p>
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
          
          {/* Progress bar visual for Income vs Expense */}
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

      {/* Bento Grid: Spending & Transactions */}
      <div className="grid grid-cols-12 gap-8">
        {/* Spending Breakdown */}
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

      {/* Monthly History Tracking */}
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
    </motion.div>
  );
}

export default Dashboard;

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import StatCard from '../components/StatCard';
import RecentTransactions from '../components/RecentTransactions';
import CashflowChart from '../components/CashflowChart';
import CategoryChart from '../components/CategoryChart';
import { getMonthKey } from '../services/financeService';
import { 
  getCashBalance, 
  getTotalAssets, 
  getTotalLiabilities, 
  getNetWorth, 
  getMonthlyIncome, 
  getMonthlyExpense, 
  getSavingsRate,
  classifyTransaction
} from '../lib/finance/calculations';
import { exportToCSV, exportToPDF } from '../utils/export';

// ─── Category config ────────────────────────────────────────────────────────
const CATEGORIES = [
  { name: 'Food & Dining',  icon: 'restaurant',     gradient: 'from-emerald-500 to-teal-500',    bar: 'bg-gradient-to-r from-emerald-500 to-teal-400' },
  { name: 'Trading',        icon: 'show_chart',      gradient: 'from-blue-500 to-indigo-500',      bar: 'bg-gradient-to-r from-blue-500 to-indigo-400' },
  { name: 'Kebutuhan',      icon: 'shopping_bag',    gradient: 'from-orange-400 to-amber-500',    bar: 'bg-gradient-to-r from-orange-400 to-amber-400' },
  { name: 'Transportasi',   icon: 'directions_car',  gradient: 'from-yellow-400 to-orange-400',   bar: 'bg-gradient-to-r from-yellow-400 to-orange-300' },
  { name: 'Investasi',      icon: 'trending_up',     gradient: 'from-purple-500 to-violet-500',   bar: 'bg-gradient-to-r from-purple-500 to-violet-400' },
  { name: 'Lainnya',        icon: 'more_horiz',      gradient: 'from-slate-500 to-slate-400',     bar: 'bg-gradient-to-r from-slate-500 to-slate-400' },
];

// ─── Animation variants ──────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { type: "spring", stiffness: 120, damping: 15, mass: 1 } 
  },
};

// ─── Main Component ──────────────────────────────────────────────────────────
function Dashboard({ transactions, assets = [], debts = [], receivables = [], onDeleteTransaction, t, fm, userProfile, selectedMonth, setSelectedMonth }) {
  const displayName = [userProfile?.firstName, userProfile?.lastName].filter(Boolean).join(" ").trim() || "Pilot";

  // Filtered transactions
  const filteredTransactions = useMemo(() =>
    transactions.filter(tx => tx.date && getMonthKey(tx.date) === selectedMonth),
    [transactions, selectedMonth]
  );

  // Monthly metrics
  const { totalIncome, totalExpense, savings, savingsRate } = useMemo(() => {
    const income = getMonthlyIncome(transactions, selectedMonth);
    const expense = getMonthlyExpense(transactions, selectedMonth);
    const sav = income - expense;
    const rate = getSavingsRate(income, expense);
    return { 
      totalIncome: income, 
      totalExpense: expense, 
      savings: sav, 
      savingsRate: rate === 0 ? '—' : (rate * 100).toFixed(1) 
    };
  }, [transactions, selectedMonth]);

  const { cashBalance, netWorth, totalAssetsAmount, totalDebtsAmount, outstandingReceivables } = useMemo(() => {
    const cash = getCashBalance(transactions);
    const assetsTotal = getTotalAssets(cash, assets, receivables, transactions);
    const liabilitiesTotal = getTotalLiabilities(debts);
    const net = getNetWorth(assetsTotal, liabilitiesTotal);
    
    const active = (receivables || []).filter(r => r.status !== 'paid');
    const outReceivables = active.reduce((a, r) => a + r.remainingAmount, 0);
    const portfolioAssets = (assets || []).reduce((a, x) => a + x.amount, 0);

    return { 
      cashBalance: cash, 
      netWorth: net, 
      totalAssetsAmount: portfolioAssets, 
      totalDebtsAmount: liabilitiesTotal,
      outstandingReceivables: outReceivables
    };
  }, [transactions, assets, receivables, debts]);

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
        // Keep explicitly added assets
        if (assets.some(a => a.name.toUpperCase() === b.name.toUpperCase())) return true;
        // Hide others if amount is 0 or if it's a weird artifact
        if (b.amount === 0) return false;
        if (b.name === '-' || b.name === '0') return false;
        return true;
      })
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, assets]);

  // Spending breakdown
  const expensesByCategory = useMemo(() => {
    return CATEGORIES.map(cat => {
      const amount = filteredTransactions
        .filter(t => classifyTransaction(t) === 'expense' && t.category === cat.name)
        .reduce((sum, t) => sum + t.amount, 0);
      return { ...cat, amount };
    }).filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions]);

  // Monthly history
  const monthlySummaryList = useMemo(() => {
    const summary = transactions.reduce((acc, tx) => {
      if (!tx.date) return acc;
      const month = getMonthKey(tx.date);
      if (!acc[month]) acc[month] = { month, income: 0, expense: 0, balance: 0 };
      const amt = Number(tx.amount) || 0;
      const type = classifyTransaction(tx);
      if (type === 'income')  acc[month].income  += amt;
      if (type === 'expense') acc[month].expense += amt;
      acc[month].balance = acc[month].income - acc[month].expense;
      return acc;
    }, {});
    return Object.values(summary).sort((a, b) => b.month.localeCompare(a.month));
  }, [transactions]);

  const [isReportOpen, setIsReportOpen] = useState(false);
  const incomeRatio = totalIncome > 0 ? Math.max(0, 100 - (totalExpense / totalIncome) * 100) : 0;
  const expenseRatio = totalIncome > 0 ? Math.min(100, (totalExpense / totalIncome) * 100) : 100;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-4 md:p-7 2xl:p-10">

      {/* ── Welcome Header ─────────────────────────────────────────── */}
      <motion.section variants={item} className="mb-7 md:mb-9 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h2 className="text-3xl 2xl:text-4xl font-bold text-slate-100 tracking-tight title-luxury mb-4">
            Halo, <span className="text-primary">{displayName}</span>.
          </h2>
          <div className="card-luxury p-4 rounded-xl border border-primary/20 bg-primary/5 inline-flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-[20px]">{totalExpense > totalIncome ? 'warning' : 'tips_and_updates'}</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-100">
                {totalIncome === 0 && totalExpense === 0
                  ? "Belum ada data pemasukan atau pengeluaran bulan ini."
                  : totalExpense > totalIncome 
                    ? `Pengeluaran bulan ini lebih besar dari pemasukan sebesar ${fm(totalExpense - totalIncome)}.`
                    : `Cashflow bulan ini aman. Sisa surplus ${fm(totalIncome - totalExpense)}.`
                }
              </p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Ringkasan aksi berdasarkan data berjalan</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsReportOpen(true)}
            className="btn-ghost h-10 px-4"
          >
            <span className="material-symbols-outlined text-primary text-[17px]">analytics</span>
            Report
          </button>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 ml-1">Period</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="glass-input h-10 px-4 text-sm font-medium cursor-pointer min-w-[160px]"
            />
          </div>
        </div>
      </motion.section>

      {/* ── Primary Metrics Row ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6 mb-6">

        <motion.div variants={item} className="card-luxury p-6 md:p-7 flex flex-col min-w-0 relative overflow-hidden">
          {/* Ambient glow blob */}
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

          <div className="flex justify-between items-start mb-5 min-w-0 relative z-10">
            <div className="min-w-0">
              <span className="text-label mb-2 block">
                {t('totalNetWorth')}
              </span>
              <p className="text-4xl 2xl:text-5xl font-bold tracking-tight mt-1 truncate text-slate-100 title-luxury">
                {fm(netWorth)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary shrink-0 glow-emerald-sm">
              <span className="material-symbols-outlined font-medium" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
            </div>
          </div>

          {/* Breakdown rows */}
          <div className="space-y-2.5 border-t border-white/5 pt-5 relative z-10">
            {[
              { label: 'Cash Balance',  val: fm(cashBalance),            color: 'text-slate-200' },
              { label: 'Assets',        val: `+${fm(totalAssetsAmount)}`,       color: 'text-emerald-400' },
              { label: 'Receivables',   val: `+${fm(outstandingReceivables)}`, color: 'text-cyan-400' },
              { label: 'Debts',         val: `−${fm(totalDebtsAmount)}`,        color: 'text-red-400' },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">{row.label}</span>
                <span className={`font-bold tracking-tight ${row.color}`}>{row.val}</span>
              </div>
            ))}
          </div>

          {/* Bottom metrics */}
          <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/5 pt-5 relative z-10">
            <div className="gradient-border-card p-3 rounded-xl">
              <p className="text-label mb-1">Savings Rate</p>
              <p className="text-2xl font-bold text-white tracking-tight">{savingsRate === '—' ? '—' : `${savingsRate}%`}</p>
            </div>
            <div className="gradient-border-card p-3 rounded-xl">
              <p className="text-label mb-1">Monthly Savings</p>
              <p className={`text-2xl font-bold tracking-tight ${savings >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fm(savings)}</p>
            </div>
          </div>
        </motion.div>

        {/* Cashflow Card */}
        <motion.div variants={item} className="card-luxury p-6 md:p-7 flex flex-col relative overflow-hidden">
          <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

          <div className="mb-5 relative z-10">
            <h3 className="text-xl font-bold text-slate-100 tracking-tight title-luxury">{t('cashflowOverview')}</h3>
            <p className="text-sm text-slate-400 mt-0.5 font-medium">Income vs expenses this period</p>
          </div>

          <div className="grid grid-cols-2 gap-5 border-y border-white/5 py-5 my-auto relative z-10">
            <StatCard title={t('totalIncome')}  amount={fm(totalIncome)}  icon="south_west" isError={false} />
            <StatCard title={t('totalExpense')} amount={fm(totalExpense)} icon="north_east"  isError={true} />
          </div>

          {/* Premium ratio bar */}
          <div className="relative z-10 mt-5">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.12em] text-slate-600 mb-2">
              <span>Income {fm(totalIncome)}</span>
              <span>Expense {fm(totalExpense)}</span>
            </div>
            <div className="w-full h-2.5 bg-white/[0.04] rounded-full overflow-hidden flex gap-0.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${incomeRatio}%` }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${expenseRatio}%` }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                className="h-full bg-gradient-to-r from-red-500 to-rose-400 rounded-full"
              />
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-white/5 relative z-10">
            <h4 className="text-label mb-3">6-Month Trend</h4>
            <CashflowChart transactions={transactions} />
          </div>
        </motion.div>
      </div>

      {/* ── Wallets & Accounts ─────────────────────────────────────── */}
      <motion.div variants={item} className="card-luxury p-6 md:p-7 mb-6 relative overflow-hidden">
        <div className="absolute -top-16 right-8 w-48 h-48 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <div className="flex justify-between items-center mb-6 relative z-10">
          <div>
            <h3 className="text-xl font-bold text-slate-100 tracking-tight title-luxury">Wallets & Accounts</h3>
            <p className="text-sm text-slate-400 font-medium mt-0.5">Your asset portfolio</p>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
            {accountBalances.length} accounts
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 relative z-10">
          {accountBalances.slice(0, 9).map((asset, idx) => {
            const colors = [
              { ring: 'ring-emerald-400/20', icon: 'text-emerald-400', bg: 'bg-emerald-400/10' },
              { ring: 'ring-blue-400/20',    icon: 'text-blue-400',    bg: 'bg-blue-400/10' },
              { ring: 'ring-purple-400/20',  icon: 'text-purple-400',  bg: 'bg-purple-400/10' },
              { ring: 'ring-amber-400/20',   icon: 'text-amber-400',   bg: 'bg-amber-400/10' },
            ];
            const c = colors[idx % colors.length];
            const getIcon = (name) => {
              const n = name.toLowerCase();
              if (n.includes('cash') || n.includes('tunai')) return 'payments';
              if (n.includes('gopay') || n.includes('ovo') || n.includes('dana') || n.includes('shopeepay')) return 'account_balance_wallet';
              if (n.includes('credit') || n.includes('kartu') || n.includes('paylater')) return 'credit_card';
              return 'account_balance';
            };
            const iconName = getIcon(asset.name);
            return (
              <div key={asset.name}
                className="flex items-center gap-3.5 p-4 rounded-xl bg-white/[0.025] border border-white/[0.06] hover:bg-white/[0.045] hover:border-white/10 transition-all duration-200 cursor-default group"
              >
                <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.ring} ring-1 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-200`}>
                  <span className={`material-symbols-outlined text-[18px] ${c.icon}`} style={{ fontVariationSettings: "'FILL' 1" }}>{iconName}</span>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-100 text-sm truncate">{asset.name}</p>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-600 truncate">{asset.type || asset.category}</p>
                  <p className={`font-bold text-sm mt-0.5 flex items-center gap-1 ${asset.amount < 0 ? 'text-red-400' : 'text-white'}`}>
                    {fm(asset.amount)}
                    {asset.amount < 0 && <span className="material-symbols-outlined text-[14px]" title="Saldo tidak wajar">warning</span>}
                  </p>
                </div>
              </div>
            );
          })}
          {accountBalances.length === 0 && (
            <div className="col-span-full py-10 text-center text-slate-600 text-sm font-medium">
              Belum ada akun yang ditambahkan.
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Bottom Grid: Spending + Transactions ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">

        {/* Spending Breakdown */}
        <motion.div variants={item} className="lg:col-span-4 card-luxury p-6 flex flex-col">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold text-slate-100 tracking-tight title-luxury">{t('spendingBreakdown')}</h3>
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">{selectedMonth}</span>
          </div>

          <div className="flex-1">
            {expensesByCategory.length > 0 ? (
              <div className="space-y-4">
                {expensesByCategory.map((cat, index) => {
                  const pct = totalExpense > 0 ? Math.min(100, (cat.amount / totalExpense) * 100) : 0;
                  return (
                    <div key={index}>
                      <div className="flex justify-between items-center text-sm mb-1.5">
                        <span className="font-semibold text-slate-300 flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-lg bg-gradient-to-br ${cat.gradient} flex items-center justify-center shrink-0`}>
                            <span className="material-symbols-outlined text-[12px] text-white">{cat.icon}</span>
                          </span>
                          {cat.name}
                        </span>
                        <span className="font-bold text-white">{fm(cat.amount)}</span>
                      </div>
                      <div className="w-full bg-white/[0.04] rounded-full h-1.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.9, delay: 0.08 * index, ease: [0.22, 1, 0.36, 1] }}
                          className={`h-full rounded-full ${cat.bar}`}
                        />
                      </div>
                      <p className="text-[10px] text-slate-600 mt-0.5 text-right">{pct.toFixed(1)}%</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-3 py-10">
                <span className="material-symbols-outlined text-[48px] opacity-20">receipt_long</span>
                <p className="text-sm font-medium">No expenses this month.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div variants={item} className="lg:col-span-8">
          <RecentTransactions transactions={filteredTransactions} onDelete={onDeleteTransaction} t={t} fm={fm} />
        </motion.div>
      </div>

      {/* ── Monthly History ────────────────────────────────────────── */}
      <motion.section variants={item} className="mt-4">
        <div className="flex items-center gap-3 mb-5">
          <span className="material-symbols-outlined text-slate-500" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
          <h3 className="text-xl font-bold text-slate-100 tracking-tight title-luxury">Monthly History</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {monthlySummaryList.map((summary) => (
            <div key={summary.month} className="card-luxury rounded-xl p-5 group relative overflow-hidden">
              {/* Subtle background blob */}
              <div className={`absolute -bottom-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${summary.balance >= 0 ? 'bg-primary/10' : 'bg-red-500/10'}`} />

              <p className="text-label mb-4 relative z-10">{summary.month}</p>
              <div className="space-y-2.5 relative z-10">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-500">Income</span>
                  <span className="text-sm font-bold text-emerald-400">{fm(summary.income)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-500">Expense</span>
                  <span className="text-sm font-bold text-red-400">{fm(summary.expense)}</span>
                </div>
                <div className="pt-2.5 border-t border-white/5 flex justify-between items-center">
                  <span className="text-label">Balance</span>
                  <span className={`text-sm font-bold tracking-tight ${summary.balance >= 0 ? 'text-white' : 'text-red-400'}`}>
                    {fm(summary.balance)}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {monthlySummaryList.length === 0 && (
            <div className="col-span-full py-14 text-center rounded-xl border border-dashed border-white/8 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              No historical data available
            </div>
          )}
        </div>
      </motion.section>

      {/* ── Report Modal ───────────────────────────────────────────── */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        data={{ income: totalIncome, expense: totalExpense, cashflow: savings, cashBalance, assets: totalAssetsAmount, debts: totalDebtsAmount, receivables: outstandingReceivables, savingsRate }}
        fm={fm}
        month={selectedMonth}
        transactions={filteredTransactions}
      />
    </motion.div>
  );
}

// ─── Report Modal ────────────────────────────────────────────────────────────
function ReportModal({ isOpen, onClose, data, fm, month, transactions }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-2xl card-luxury rounded-3xl p-8 max-h-[88vh] overflow-y-auto no-scrollbar"
      >
        {/* Top hairline */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent rounded-t-3xl" />

        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-100 tracking-tight title-luxury">Monthly Report</h2>
            <p className="text-label mt-1">{month}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all">
            <span className="material-symbols-outlined font-medium">close</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="space-y-5">
            <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 border-l-2 border-emerald-400 pl-3">Cashflow Analysis</h4>
            {[
              { label: 'Total Income',   val: fm(data.income),    color: 'text-emerald-400' },
              { label: 'Total Expenses', val: fm(data.expense),   color: 'text-red-400' },
              { label: 'Net Cashflow',   val: fm(data.cashflow),  color: data.cashflow >= 0 ? 'text-emerald-400' : 'text-red-400', border: true },
              { label: 'Savings Rate',   val: `${data.savingsRate}%`, color: 'text-white' },
            ].map(r => (
              <div key={r.label} className={`flex justify-between items-center text-sm ${r.border ? 'pt-2 border-t border-white/5' : ''}`}>
                <span className="text-slate-400 font-medium">{r.label}</span>
                <span className={`font-bold ${r.color}`}>{r.val}</span>
              </div>
            ))}
          </div>
          <div className="space-y-5">
            <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 border-l-2 border-indigo-400 pl-3">Asset & Debt Summary</h4>
            {[
              { label: 'Cash Balance',  val: fm(data.cashBalance),   color: 'text-white' },
              { label: 'Total Assets',  val: fm(data.assets),        color: 'text-emerald-400' },
              { label: 'Total Debts',   val: fm(data.debts),         color: 'text-red-400' },
              { label: 'Receivables',   val: fm(data.receivables),   color: 'text-cyan-400', border: true },
            ].map(r => (
              <div key={r.label} className={`flex justify-between items-center text-sm ${r.border ? 'pt-2 border-t border-white/5' : ''}`}>
                <span className="text-slate-400 font-medium">{r.label}</span>
                <span className={`font-bold ${r.color}`}>{r.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk notes */}
        <div className="card-luxury p-5 mb-7 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-indigo-400 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
            <h5 className="text-label">Financial Risk Notes</h5>
          </div>
          <div className="space-y-2.5 text-sm">
            {data.debts > data.assets && <p className="text-red-400 font-medium flex items-center gap-2"><span>⚠️</span> Critical: Total debts exceed assets. Focus on debt reduction.</p>}
            {data.cashflow < 0 && <p className="text-orange-400 font-medium flex items-center gap-2"><span>⚠️</span> Warning: Negative cashflow this month. Review your expenses.</p>}
            {data.savingsRate < 20 && data.cashflow > 0 && <p className="text-blue-400 font-medium flex items-center gap-2"><span>💡</span> Tip: Savings rate below 20%. Try to optimize smaller expenses.</p>}
            {data.cashflow > 0 && data.savingsRate >= 20 && <p className="text-emerald-400 font-medium flex items-center gap-2"><span>✅</span> Excellent: Savings rate is healthy. Consider investing the surplus.</p>}
          </div>
        </div>

        <button
          onClick={() => exportToCSV(transactions, `WealthPilot_Report_${month}`)}
          className="btn-primary w-full py-3.5 rounded-xl text-sm"
        >
          <span className="material-symbols-outlined font-medium text-[18px]">download</span>
          Export CSV (Full Report)
        </button>
      </motion.div>
    </div>
  );
}

export default Dashboard;

import React from 'react';
import { motion } from 'framer-motion';
import StatCard from '../components/StatCard';
import RecentTransactions from '../components/RecentTransactions';

function Dashboard({ transactions, assets = [], debts = [], onDeleteTransaction, t, fm }) {
  // calculate metrics
  const totalIncome = transactions.filter(t_data => t_data.type === 'income').reduce((acc, t_data) => acc + t_data.amount, 0);
  const totalExpense = transactions.filter(t_data => t_data.type === 'expense').reduce((acc, t_data) => acc + t_data.amount, 0);
  const savings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(1) : 0;
  
  const totalAssets = assets.reduce((acc, a) => acc + a.amount, 0);
  const totalDebts = debts.reduce((acc, d) => acc + d.amount, 0);
  const netWorth = totalAssets + savings - totalDebts;

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
      className="p-container-margin"
    >
      {/* Welcome Header */}
      <motion.section variants={item} className="mb-xl flex flex-col gap-sm">
        <h2 className="font-headline-lg text-headline-lg text-on-surface">{t('welcome')}</h2>
        <div className="flex items-center gap-md">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          <p className="font-body-lg text-body-lg text-on-surface-variant">{t('healthStatus')}</p>
        </div>
      </motion.section>

      {/* Primary Metrics */}
      <div className="grid grid-cols-12 gap-lg mb-lg">
        {/* Total Net Worth Card */}
        <motion.div variants={item} className="col-span-12 md:col-span-12 lg:col-span-5 glass-card rounded-xl p-lg flex flex-col justify-between shadow-lg border border-outline-variant/20">
          <div>
            <div className="flex justify-between items-start mb-sm">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">{t('totalNetWorth')}</span>
              <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
            </div>
            <p className="font-display-sm text-display-sm font-bold text-on-surface line-clamp-1">{fm(netWorth)}</p>
            <div className="flex items-center gap-sm mt-sm flex-wrap">
              <span className={`flex items-center font-mono-data text-mono-data px-2 py-0.5 rounded ${savings >= 0 ? 'text-primary bg-primary/10' : 'text-error bg-error/10'}`}>
                <span className="material-symbols-outlined text-[16px]">{savings >= 0 ? 'trending_up' : 'trending_down'}</span>
                {savings >= 0 ? '+' : ''}{fm(savings)}
              </span>
              <span className="text-on-surface-variant text-sm">this month</span>
            </div>
          </div>
          <div className="mt-xl grid grid-cols-2 gap-md border-t border-outline-variant/30 pt-lg">
            <div>
              <p className="text-xs text-on-surface-variant mb-1">{t('savingsRate')}</p>
              <p className="font-headline-lg text-headline-lg text-on-surface">{savingsRate}%</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant mb-1">{t('savings')}</p>
              <p className={`font-headline-lg text-headline-lg ${savings >= 0 ? 'text-primary' : 'text-error'}`}>{fm(savings)}</p>
            </div>
          </div>
        </motion.div>

        {/* Income vs Expense Dashboard */}
        <motion.div variants={item} className="col-span-12 md:col-span-12 lg:col-span-7 glass-card rounded-xl p-lg flex flex-col justify-between shadow-lg border border-outline-variant/20">
          <div className="mb-lg">
            <h3 className="font-headline-lg text-headline-lg">{t('cashflowOverview')}</h3>
            <p className="text-sm text-on-surface-variant">Real-time breakdown of your income vs expenses.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 md:gap-lg my-auto border-outline-variant/30 border-y py-lg mb-lg">
            <StatCard title={t('totalIncome')} amount={fm(totalIncome)} icon="south_west" isError={false} />
            <StatCard title={t('totalExpense')} amount={fm(totalExpense)} icon="north_east" isError={true} />
          </div>
          
          {/* Progress bar visual for Income vs Expense */}
          <div>
            <div className="flex justify-between text-xs text-on-surface-variant mb-2 font-mono-data">
              <span className="truncate mr-2">{t('totalIncome')} {fm(totalIncome)}</span>
              <span className="truncate">{t('totalExpense')} {fm(totalExpense)}</span>
            </div>
            <div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden flex border border-outline-variant/10">
              {totalIncome > 0 ? (
                <>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(0, 100 - (totalExpense / totalIncome) * 100)}%` }} transition={{ duration: 1, ease: "easeOut" }} className="h-full bg-primary"></motion.div>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (totalExpense / totalIncome) * 100)}%` }} transition={{ duration: 1, ease: "easeOut", delay: 0.2 }} className="h-full bg-error"></motion.div>
                </>
              ) : (
                <div className="h-full bg-error/20 w-full"></div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bento Grid: Spending & Transactions */}
      <div className="grid grid-cols-12 gap-lg">
        {/* Spending Breakdown */}
        <motion.div variants={item} className="col-span-12 lg:col-span-4 glass-card rounded-xl p-lg shadow-lg border border-outline-variant/20">
          <h3 className="font-headline-lg text-headline-lg mb-lg">{t('spendingBreakdown')}</h3>
          <div className="space-y-lg">
            {categories.map((cat) => {
               const catTotal = transactions.filter(t_data => t_data.type === 'expense' && t_data.category === cat.name).reduce((acc, t_data) => acc + t_data.amount, 0);
               const percent = totalExpense > 0 ? Math.round((catTotal / totalExpense) * 100) : 0;
               return (
                <div key={cat.name}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined ${cat.text} text-[20px]`}>{cat.icon}</span>
                      <span className="text-sm font-medium">{cat.name}</span>
                    </div>
                    <span className="font-mono-data text-mono-data text-sm">{percent}%</span>
                  </div>
                  <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${percent}%` }} 
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
                      className={`h-full ${cat.color} rounded-full`}
                    ></motion.div>
                  </div>
                </div>
               );
            })}
          </div>
        </motion.div>

        <motion.div variants={item} className="col-span-12 lg:col-span-8">
          <RecentTransactions transactions={transactions} onDelete={onDeleteTransaction} t={t} fm={fm} />
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Dashboard;

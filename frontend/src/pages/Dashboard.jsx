import React from 'react';
import StatCard from '../components/StatCard';
import RecentTransactions from '../components/RecentTransactions';
import { formatCurrency } from '../utils/formatCurrency';

function Dashboard({ transactions, assets = [], debts = [], onDeleteTransaction }) {
  // calculate metrics
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
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

  return (
    <div className="p-container-margin">
      {/* Welcome Header */}
      <section className="mb-xl flex flex-col gap-sm">
        <h2 className="font-headline-lg text-headline-lg text-on-surface">Good Evening, Pilot.</h2>
        <div className="flex items-center gap-md">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Your financial health is tracking well.</p>
        </div>
      </section>

      {/* Primary Metrics */}
      <div className="grid grid-cols-12 gap-lg mb-lg">
        {/* Total Net Worth Card */}
        <div className="col-span-12 lg:col-span-5 glass-card rounded-xl p-lg flex flex-col justify-between shadow-lg border border-outline-variant/20">
          <div>
            <div className="flex justify-between items-start mb-sm">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Total Net Worth</span>
              <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
            </div>
            <p className="font-display-sm text-display-sm font-bold text-on-surface">{formatCurrency(netWorth)}</p>
            <div className="flex items-center gap-sm mt-sm">
              <span className={`flex items-center font-mono-data text-mono-data px-2 py-0.5 rounded ${savings >= 0 ? 'text-primary bg-primary/10' : 'text-error bg-error/10'}`}>
                <span className="material-symbols-outlined text-[16px]">{savings >= 0 ? 'trending_up' : 'trending_down'}</span>
                {savings >= 0 ? '+' : ''}{formatCurrency(savings)}
              </span>
              <span className="text-on-surface-variant text-sm">this month</span>
            </div>
          </div>
          <div className="mt-xl grid grid-cols-2 gap-md border-t border-outline-variant/30 pt-lg">
            <div>
              <p className="text-xs text-on-surface-variant mb-1">Savings Rate</p>
              <p className="font-headline-lg text-headline-lg text-on-surface">{savingsRate}%</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant mb-1">Monthly Savings</p>
              <p className={`font-headline-lg text-headline-lg ${savings >= 0 ? 'text-primary' : 'text-error'}`}>{formatCurrency(savings)}</p>
            </div>
          </div>
        </div>

        {/* Income vs Expense Dashboard */}
        <div className="col-span-12 lg:col-span-7 glass-card rounded-xl p-lg flex flex-col justify-between shadow-lg border border-outline-variant/20">
          <div className="mb-lg">
            <h3 className="font-headline-lg text-headline-lg">Cashflow Overview</h3>
            <p className="text-sm text-on-surface-variant">Real-time breakdown of your income vs expenses.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-lg my-auto border-outline-variant/30 border-y py-lg mb-lg">
            <StatCard title="Total Income" amount={formatCurrency(totalIncome)} icon="south_west" isError={false} />
            <StatCard title="Total Expense" amount={formatCurrency(totalExpense)} icon="north_east" isError={true} />
          </div>
          
          {/* Progress bar visual for Income vs Expense */}
          <div>
            <div className="flex justify-between text-xs text-on-surface-variant mb-2 font-mono-data">
              <span>Income {formatCurrency(totalIncome)}</span>
              <span>Expense {formatCurrency(totalExpense)}</span>
            </div>
            <div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden flex border border-outline-variant/10">
              {totalIncome > 0 ? (
                <>
                  <div className="h-full bg-primary transition-all duration-500" style={{ width: `${Math.max(0, 100 - (totalExpense / totalIncome) * 100)}%` }}></div>
                  <div className="h-full bg-error transition-all duration-500" style={{ width: `${Math.min(100, (totalExpense / totalIncome) * 100)}%` }}></div>
                </>
              ) : (
                <div className="h-full bg-error/20 w-full"></div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid: Spending & Transactions */}
      <div className="grid grid-cols-12 gap-lg">
        {/* Spending Breakdown */}
        <div className="col-span-12 lg:col-span-4 glass-card rounded-xl p-lg shadow-lg border border-outline-variant/20">
          <h3 className="font-headline-lg text-headline-lg mb-lg">Spending Breakdown</h3>
          <div className="space-y-lg">
            {categories.map((cat) => {
               const catTotal = transactions.filter(t => t.type === 'expense' && t.category === cat.name).reduce((acc, t) => acc + t.amount, 0);
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
                    <div className={`h-full ${cat.color} rounded-full transition-all duration-500`} style={{ width: `${percent}%` }}></div>
                  </div>
                </div>
               );
            })}
          </div>
        </div>

        <RecentTransactions transactions={transactions} onDelete={onDeleteTransaction} />
      </div>
    </div>
  );
}

export default Dashboard;

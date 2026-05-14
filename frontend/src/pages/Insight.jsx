import React from 'react';

function Insight({ t, fm }) {
  return (
    <div className="max-w-[1400px] mx-auto p-lg">
      {/* Page Title Area */}
      <div className="flex flex-col mb-lg">
        <h2 className="font-headline-lg text-headline-lg text-on-surface">{t('insight')}</h2>
        <p className="text-on-surface-variant font-body-md">Personalized analysis for your financial future.</p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-lg">
        {/* Financial Health Score Card */}
        <div className="col-span-12 lg:col-span-5 glass-card rounded-xl p-lg flex flex-col items-center justify-center relative overflow-hidden min-h-[400px]">
          {/* Background Accent Glow */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/10 blur-[100px] rounded-full"></div>
          <div className="relative flex flex-col items-center">
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-full border-[10px] md:border-[12px] border-surface-container-highest flex items-center justify-center relative">
              {/* Progress Stroke (SVG for precision) */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle className="text-primary" cx="50%" cy="50%" fill="none" r="42%" stroke="currentColor" strokeDasharray="527" strokeDashoffset="116" strokeWidth="10"></circle>
              </svg>
              <div className="text-center">
                <span className="font-display-lg text-4xl md:text-5xl lg:text-display-lg text-on-surface block">78</span>
                <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Score</span>
              </div>
            </div>
            <div className="mt-lg px-4 py-1.5 bg-primary/20 text-primary border border-primary/30 rounded-full font-bold text-label-md">
              Status: Healthy
            </div>
          </div>
          <div className="mt-xl w-full grid grid-cols-3 gap-md border-t border-outline-variant/30 pt-lg">
            <div className="text-center">
              <p className="text-[10px] md:text-on-surface-variant font-label-md mb-xs">{t('totalIncome')}</p>
              <span className="material-symbols-outlined text-primary text-xl">trending_up</span>
              <p className="font-mono-data text-[10px] md:text-mono-data text-on-surface mt-xs">Surplus</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] md:text-on-surface-variant font-label-md mb-xs">{t('debts')}</p>
              <span className="material-symbols-outlined text-primary text-xl">verified_user</span>
              <p className="font-mono-data text-[10px] md:text-mono-data text-on-surface mt-xs">Low Risk</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] md:text-on-surface-variant font-label-md mb-xs">{t('savings')}</p>
              <span className="material-symbols-outlined text-primary text-xl">savings</span>
              <p className="font-mono-data text-[10px] md:text-mono-data text-on-surface mt-xs">Active</p>
            </div>
          </div>
        </div>

        {/* Analysis & Improvements Bento Group */}
        <div className="col-span-12 lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-lg">
          {/* Positive Points */}
          <div className="glass-card rounded-xl p-lg">
            <div className="flex items-center gap-sm mb-lg">
              <span className="material-symbols-outlined text-primary">check_circle</span>
              <h3 className="font-headline-lg text-headline-lg-mobile text-on-surface">Analysis points</h3>
            </div>
            <ul className="space-y-lg">
              <li className="flex justify-between items-center text-sm md:text-base">
                <span className="text-on-surface-variant">{t('totalIncome')} &gt; {t('totalExpense')}</span>
                <span className="text-primary font-mono-data">Optimal</span>
              </li>
              <li className="flex justify-between items-center text-sm md:text-base">
                <span className="text-on-surface-variant">Save rate 27.8%</span>
                <span className="text-primary font-mono-data">Excellent</span>
              </li>
              <li className="flex justify-between items-center text-sm md:text-base">
                <span className="text-on-surface-variant">Debt controlled</span>
                <span className="text-primary font-mono-data">Stable</span>
              </li>
            </ul>
          </div>

          {/* Improvements Needed */}
          <div className="glass-card rounded-xl p-lg border-error/20">
            <div className="flex items-center gap-sm mb-lg">
              <span className="material-symbols-outlined text-error">warning</span>
              <h3 className="font-headline-lg text-headline-lg-mobile text-on-surface">Improvements needed</h3>
            </div>
            <div className="space-y-lg">
              <div className="p-md bg-error/10 rounded-lg border border-error/20">
                <p className="text-error font-label-md mb-xs font-bold uppercase">Critical</p>
                <p className="text-on-surface text-sm">Emergency fund &lt; 3 months</p>
              </div>
              <div className="p-md bg-surface-container-high rounded-lg border border-outline-variant/30">
                <p className="text-tertiary font-label-md mb-xs font-bold uppercase">Caution</p>
                <p className="text-on-surface text-sm">Consumptive spending up</p>
              </div>
            </div>
          </div>

          {/* Smart Insight AI Card */}
          <div className="md:col-span-2 glass-card rounded-xl p-lg border-primary/20 flex flex-col md:flex-row gap-lg items-center">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-3xl md:text-4xl">auto_awesome</span>
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-sm mb-xs">
                <h3 className="font-headline-lg text-headline-lg-mobile text-on-surface">Smart Insight (AI)</h3>
                <span className="text-primary font-label-md px-2 py-0.5 bg-primary/10 rounded-full text-[10px]">New Update</span>
              </div>
              <p className="text-on-surface text-sm md:text-base leading-relaxed">
                Your food spending increased by <span className="text-error font-bold">22%</span>. Potential over budget <span className="text-primary font-bold">{fm(310000)}</span>.
              </p>
              <div className="mt-md flex flex-col sm:flex-row gap-md">
                <button className="px-4 py-2 bg-primary/10 text-primary border border-primary/30 rounded-lg text-label-md font-bold hover:bg-primary/20 transition-all cursor-pointer w-full sm:w-auto text-xs">Review Spending</button>
                <button className="px-4 py-2 text-on-surface-variant hover:text-on-surface text-label-md transition-all cursor-pointer w-full sm:w-auto text-xs">Dismiss</button>
              </div>
            </div>
          </div>
        </div>

        {/* Goal Tracker Card */}
        <div className="col-span-12 glass-card rounded-xl p-md md:p-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-xl gap-4">
            <div>
              <h3 className="font-headline-lg text-headline-lg text-on-surface">Goal Tracker</h3>
              <p className="text-on-surface-variant text-sm">Track your journey to financial freedom.</p>
            </div>
            <button className="w-full sm:w-auto px-4 py-2 border border-outline-variant rounded-lg text-on-surface hover:border-primary transition-colors font-label-md cursor-pointer text-xs">View All Goals</button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
            <div className="space-y-md">
              <div className="flex justify-between items-end">
                <div>
                  <h4 className="font-headline-lg text-lg md:text-headline-lg-mobile text-on-surface">Emergency Fund</h4>
                  <p className="text-on-surface-variant text-[10px] md:text-label-md">Target: {fm(50000000)}</p>
                </div>
                <div className="text-right">
                  <span className="font-display-sm text-2xl md:text-display-sm text-primary block">24%</span>
                  <span className="text-on-surface-variant text-[10px] md:text-label-md">Complete</span>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[24%]" style={{ boxShadow: '0 0 10px rgba(75, 226, 119, 0.4)' }}></div>
              </div>
              <div className="flex justify-between text-[10px] md:text-label-md text-on-surface-variant">
                <span>Current: {fm(12000000)}</span>
                <span>Remaining: {fm(38000000)}</span>
              </div>
            </div>
            {/* Mini Chart/Visual Representation of Savings */}
            <div className="flex items-end gap-1 md:gap-2 h-24 md:h-32 pt-lg">
              {[20, 35, 25, 50, 45, 60, 80].map((h, i) => (
                <div key={i} className={`flex-1 rounded-t-lg transition-all ${i === 6 ? 'bg-primary' : 'bg-surface-container-high hover:bg-primary/40'}`} style={{ height: `${h}%` }}></div>
              ))}
            </div>
          </div>
        </div>

        {/* Asset vs Debt Trends */}
        <div className="col-span-12 lg:col-span-8 glass-card rounded-xl p-md md:p-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-lg gap-3">
            <h3 className="font-headline-lg text-headline-lg text-on-surface">Wealth Growth Trend</h3>
            <div className="flex gap-sm">
              <span className="flex items-center gap-1.5 text-[10px] md:text-label-md text-on-surface-variant">
                <span className="w-2.5 h-2.5 rounded-full bg-primary"></span> {t('assets')}
              </span>
              <span className="flex items-center gap-1.5 text-[10px] md:text-label-md text-on-surface-variant">
                <span className="w-2.5 h-2.5 rounded-full bg-error"></span> {t('debts')}
              </span>
            </div>
          </div>
          <div className="h-[200px] md:h-[240px] w-full flex items-end gap-1 md:gap-gutter px-1 md:px-md overflow-x-auto no-scrollbar">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => (
              <div key={i} className="min-w-[50px] md:min-w-0 flex-1 flex flex-col items-center gap-sm">
                <div className="w-full flex gap-1 items-end h-[120px] md:h-[160px]">
                  <div className={`flex-1 bg-primary${i === 5 ? '' : '/40'} rounded-sm`} style={{ height: `${40 + i * 10}%` }}></div>
                  <div className={`flex-1 bg-error${i === 5 ? '' : '/40'} rounded-sm`} style={{ height: `${20 - i * 2}%` }}></div>
                </div>
                <span className={`text-[10px] md:text-label-md ${i === 5 ? 'text-on-surface font-bold' : 'text-on-surface-variant'}`}>{month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities / Notifications */}
        <div className="col-span-12 lg:col-span-4 glass-card rounded-xl p-md md:p-lg">
          <h3 className="font-headline-lg text-headline-lg text-on-surface mb-lg">Action Items</h3>
          <div className="space-y-md">
            {[
              { icon: 'account_balance', color: 'secondary', title: 'Connect Bank Account', desc: 'Sync Mandiri or BCA for accuracy.' },
              { icon: 'calendar_month', color: 'tertiary', title: 'Budget Review', desc: 'Monthly review is due in 2 days.' },
              { icon: 'add_moderator', color: 'primary', title: 'Update Insurance', desc: 'Match coverage with current assets.' }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-md p-3 md:p-md bg-surface-container hover:bg-surface-container-high transition-colors rounded-lg group cursor-pointer border border-outline-variant/10">
                <div className={`w-10 h-10 rounded-lg bg-${item.color}-container/20 flex items-center justify-center shrink-0`}>
                  <span className={`material-symbols-outlined text-${item.color}`}>{item.icon}</span>
                </div>
                <div>
                  <p className="text-on-surface font-bold text-sm md:text-body-md">{item.title}</p>
                  <p className="text-on-surface-variant text-[10px] md:text-label-md line-clamp-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-lg py-3 text-center text-on-surface-variant font-label-md hover:text-primary transition-colors border-t border-outline-variant/30 pt-md cursor-pointer text-xs">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
}

export default Insight;

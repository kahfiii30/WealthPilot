import React from 'react';

function Insight() {
  return (
    <div className="max-w-[1400px] mx-auto p-lg">
      {/* Page Title Area */}
      <div className="flex flex-col mb-lg">
        <h2 className="font-headline-lg text-headline-lg text-on-surface">Financial Insight</h2>
        <p className="text-on-surface-variant font-body-md">Personalized analysis for your financial future.</p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-lg">
        {/* Financial Health Score Card */}
        <div className="col-span-12 lg:col-span-5 glass-card rounded-xl p-lg flex flex-col items-center justify-center relative overflow-hidden">
          {/* Background Accent Glow */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/10 blur-[100px] rounded-full"></div>
          <div className="relative flex flex-col items-center">
            <div className="w-48 h-48 rounded-full border-[12px] border-surface-container-highest flex items-center justify-center relative">
              {/* Progress Stroke (SVG for precision) */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle className="text-primary" cx="96" cy="96" fill="none" r="84" stroke="currentColor" strokeDasharray="527" strokeDashoffset="116" strokeWidth="12"></circle>
              </svg>
              <div className="text-center">
                <span className="font-display-lg text-display-lg text-on-surface block">78</span>
                <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Score</span>
              </div>
            </div>
            <div className="mt-lg px-4 py-1.5 bg-primary/20 text-primary border border-primary/30 rounded-full font-bold text-label-md">
              Status: Healthy
            </div>
          </div>
          <div className="mt-xl w-full grid grid-cols-3 gap-md border-t border-outline-variant/30 pt-lg">
            <div className="text-center">
              <p className="text-on-surface-variant font-label-md mb-xs">Income</p>
              <span className="material-symbols-outlined text-primary">trending_up</span>
              <p className="font-mono-data text-mono-data text-on-surface mt-xs">Surplus</p>
            </div>
            <div className="text-center">
              <p className="text-on-surface-variant font-label-md mb-xs">Debt</p>
              <span className="material-symbols-outlined text-primary">verified_user</span>
              <p className="font-mono-data text-mono-data text-on-surface mt-xs">Low Risk</p>
            </div>
            <div className="text-center">
              <p className="text-on-surface-variant font-label-md mb-xs">Saving</p>
              <span className="material-symbols-outlined text-primary">savings</span>
              <p className="font-mono-data text-mono-data text-on-surface mt-xs">Active</p>
            </div>
          </div>
        </div>

        {/* Analysis & Improvements Bento Group */}
        <div className="col-span-12 lg:col-span-7 grid grid-cols-2 gap-lg">
          {/* Positive Points */}
          <div className="glass-card rounded-xl p-lg col-span-2 md:col-span-1">
            <div className="flex items-center gap-sm mb-lg">
              <span className="material-symbols-outlined text-primary">check_circle</span>
              <h3 className="font-headline-lg text-headline-lg-mobile text-on-surface">Analysis points</h3>
            </div>
            <ul className="space-y-lg">
              <li className="flex justify-between items-center">
                <span className="text-on-surface-variant">Income &gt; Expense</span>
                <span className="text-primary font-mono-data">Optimal</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-on-surface-variant">Save rate 27.8%</span>
                <span className="text-primary font-mono-data">Excellent</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-on-surface-variant">Debt controlled</span>
                <span className="text-primary font-mono-data">Stable</span>
              </li>
            </ul>
          </div>

          {/* Improvements Needed */}
          <div className="glass-card rounded-xl p-lg col-span-2 md:col-span-1 border-error/20">
            <div className="flex items-center gap-sm mb-lg">
              <span className="material-symbols-outlined text-error">warning</span>
              <h3 className="font-headline-lg text-headline-lg-mobile text-on-surface">Improvements needed</h3>
            </div>
            <div className="space-y-lg">
              <div className="p-md bg-error/10 rounded-lg border border-error/20">
                <p className="text-error font-label-md mb-xs font-bold uppercase">Critical</p>
                <p className="text-on-surface font-body-md">Emergency fund &lt; 3 months</p>
              </div>
              <div className="p-md bg-surface-container-high rounded-lg border border-outline-variant/30">
                <p className="text-tertiary font-label-md mb-xs font-bold uppercase">Caution</p>
                <p className="text-on-surface font-body-md">Consumptive spending up</p>
              </div>
            </div>
          </div>

          {/* Smart Insight AI Card */}
          <div className="col-span-2 glass-card rounded-xl p-lg border-primary/20 flex flex-col md:flex-row gap-lg items-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-4xl">auto_awesome</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-sm mb-xs">
                <h3 className="font-headline-lg text-headline-lg-mobile text-on-surface">Smart Insight (AI)</h3>
                <span className="text-primary font-label-md px-2 py-0.5 bg-primary/10 rounded-full">New Update</span>
              </div>
              <p className="text-on-surface font-body-lg leading-relaxed">
                Pengeluaran makan kamu naik <span className="text-error font-bold">22%</span>. Potensi over budget <span className="text-primary font-bold">Rp 310.000</span>.
              </p>
              <div className="mt-md flex gap-md">
                <button className="px-4 py-2 bg-primary/10 text-primary border border-primary/30 rounded-lg text-label-md font-bold hover:bg-primary/20 transition-all cursor-pointer">Review Spending</button>
                <button className="px-4 py-2 text-on-surface-variant hover:text-on-surface text-label-md transition-all cursor-pointer">Dismiss</button>
              </div>
            </div>
          </div>
        </div>

        {/* Goal Tracker Card */}
        <div className="col-span-12 glass-card rounded-xl p-lg">
          <div className="flex justify-between items-center mb-xl">
            <div>
              <h3 className="font-headline-lg text-headline-lg text-on-surface">Goal Tracker</h3>
              <p className="text-on-surface-variant font-body-md">Track your journey to financial freedom.</p>
            </div>
            <button className="px-4 py-2 border border-outline-variant rounded-lg text-on-surface hover:border-primary transition-colors font-label-md cursor-pointer">View All Goals</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
            <div className="space-y-md">
              <div className="flex justify-between items-end">
                <div>
                  <h4 className="font-headline-lg text-headline-lg-mobile text-on-surface">Emergency Fund</h4>
                  <p className="text-on-surface-variant text-label-md">Target: Rp 50.000.000</p>
                </div>
                <div className="text-right">
                  <span className="font-display-sm text-display-sm text-primary block">24%</span>
                  <span className="text-on-surface-variant text-label-md">Complete</span>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[24%]" style={{ boxShadow: '0 0 10px rgba(75, 226, 119, 0.4)' }}></div>
              </div>
              <div className="flex justify-between text-label-md text-on-surface-variant">
                <span>Current: Rp 12.000.000</span>
                <span>Remaining: Rp 38.000.000</span>
              </div>
            </div>
            {/* Mini Chart/Visual Representation of Savings */}
            <div className="flex items-end gap-2 h-32 pt-lg">
              <div className="flex-1 bg-surface-container-high rounded-t-lg transition-all hover:bg-primary/40 h-[20%]"></div>
              <div className="flex-1 bg-surface-container-high rounded-t-lg transition-all hover:bg-primary/40 h-[35%]"></div>
              <div className="flex-1 bg-surface-container-high rounded-t-lg transition-all hover:bg-primary/40 h-[25%]"></div>
              <div className="flex-1 bg-surface-container-high rounded-t-lg transition-all hover:bg-primary/40 h-[50%]"></div>
              <div className="flex-1 bg-surface-container-high rounded-t-lg transition-all hover:bg-primary/40 h-[45%]"></div>
              <div className="flex-1 bg-primary/60 rounded-t-lg transition-all hover:bg-primary h-[60%]"></div>
              <div className="flex-1 bg-primary rounded-t-lg transition-all hover:bg-primary h-[80%]"></div>
            </div>
          </div>
        </div>

        {/* Asset vs Debt Trends */}
        <div className="col-span-12 lg:col-span-8 glass-card rounded-xl p-lg">
          <div className="flex justify-between items-center mb-lg">
            <h3 className="font-headline-lg text-headline-lg text-on-surface">Wealth Growth Trend</h3>
            <div className="flex gap-sm">
              <span className="flex items-center gap-1.5 text-label-md text-on-surface-variant">
                <span className="w-3 h-3 rounded-full bg-primary"></span> Assets
              </span>
              <span className="flex items-center gap-1.5 text-label-md text-on-surface-variant">
                <span className="w-3 h-3 rounded-full bg-error"></span> Debt
              </span>
            </div>
          </div>
          <div className="h-[240px] w-full flex items-end gap-gutter px-md">
            <div className="flex-1 flex flex-col items-center gap-sm">
              <div className="w-full flex gap-1 items-end h-[160px]">
                <div className="flex-1 bg-primary/40 rounded-sm h-[40%]"></div>
                <div className="flex-1 bg-error/40 rounded-sm h-[20%]"></div>
              </div>
              <span className="text-label-md text-on-surface-variant">Jan</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-sm">
              <div className="w-full flex gap-1 items-end h-[160px]">
                <div className="flex-1 bg-primary/40 rounded-sm h-[45%]"></div>
                <div className="flex-1 bg-error/40 rounded-sm h-[18%]"></div>
              </div>
              <span className="text-label-md text-on-surface-variant">Feb</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-sm">
              <div className="w-full flex gap-1 items-end h-[160px]">
                <div className="flex-1 bg-primary/40 rounded-sm h-[55%]"></div>
                <div className="flex-1 bg-error/40 rounded-sm h-[15%]"></div>
              </div>
              <span className="text-label-md text-on-surface-variant">Mar</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-sm">
              <div className="w-full flex gap-1 items-end h-[160px]">
                <div className="flex-1 bg-primary/40 rounded-sm h-[60%]"></div>
                <div className="flex-1 bg-error/40 rounded-sm h-[12%]"></div>
              </div>
              <span className="text-label-md text-on-surface-variant">Apr</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-sm">
              <div className="w-full flex gap-1 items-end h-[160px]">
                <div className="flex-1 bg-primary/40 rounded-sm h-[75%]"></div>
                <div className="flex-1 bg-error/40 rounded-sm h-[10%]"></div>
              </div>
              <span className="text-label-md text-on-surface-variant">May</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-sm">
              <div className="w-full flex gap-1 items-end h-[160px]">
                <div className="flex-1 bg-primary rounded-sm h-[90%]" style={{ boxShadow: '0 0 15px rgba(75,226,119,0.3)' }}></div>
                <div className="flex-1 bg-error rounded-sm h-[8%]"></div>
              </div>
              <span className="text-label-md text-on-surface font-bold">Jun</span>
            </div>
          </div>
        </div>

        {/* Recent Activities / Notifications */}
        <div className="col-span-12 lg:col-span-4 glass-card rounded-xl p-lg">
          <h3 className="font-headline-lg text-headline-lg text-on-surface mb-lg">Action Items</h3>
          <div className="space-y-md">
            <div className="flex items-start gap-md p-md bg-surface-container hover:bg-surface-container-high transition-colors rounded-lg group cursor-pointer border border-outline-variant/10">
              <div className="w-10 h-10 rounded-lg bg-secondary-container/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-secondary">account_balance</span>
              </div>
              <div>
                <p className="text-on-surface font-bold font-body-md">Connect Bank Account</p>
                <p className="text-on-surface-variant text-label-md">Sync Mandiri or BCA for better accuracy.</p>
              </div>
            </div>
            <div className="flex items-start gap-md p-md bg-surface-container hover:bg-surface-container-high transition-colors rounded-lg group cursor-pointer border border-outline-variant/10">
              <div className="w-10 h-10 rounded-lg bg-tertiary-container/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-tertiary">calendar_month</span>
              </div>
              <div>
                <p className="text-on-surface font-bold font-body-md">Schedule Budget Review</p>
                <p className="text-on-surface-variant text-label-md">Your monthly review is due in 2 days.</p>
              </div>
            </div>
            <div className="flex items-start gap-md p-md bg-surface-container hover:bg-surface-container-high transition-colors rounded-lg group cursor-pointer border border-outline-variant/10">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">add_moderator</span>
              </div>
              <div>
                <p className="text-on-surface font-bold font-body-md">Update Insurance Policy</p>
                <p className="text-on-surface-variant text-label-md">Ensure your coverage matches current assets.</p>
              </div>
            </div>
          </div>
          <button className="w-full mt-lg py-3 text-center text-on-surface-variant font-label-md hover:text-primary transition-colors border-t border-outline-variant/30 pt-md cursor-pointer">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
}

export default Insight;

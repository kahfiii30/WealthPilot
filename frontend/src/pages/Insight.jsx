import React from 'react';

function Insight({ t, fm }) {
  return (
    <div className="max-w-[1400px] mx-auto p-8">
      {/* Page Title Area */}
      <div className="flex flex-col mb-10">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-2 ml-1">Strategy & Analysis</p>
        <h2 className="text-4xl font-black text-slate-100 tracking-tighter">{t('insight')}</h2>
        <p className="text-sm font-bold text-slate-500 tracking-tight mt-1">Personalized intelligence for your financial future.</p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-8">
        {/* Financial Health Score Card */}
        <div className="col-span-12 lg:col-span-5 rounded-2xl border border-slate-700/30 bg-gradient-to-br from-slate-900/80 via-slate-900/55 to-blue-950/30 p-10 flex flex-col items-center justify-center relative overflow-hidden min-h-[450px] shadow-2xl backdrop-blur-xl group">
          {/* Background Accent Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-400/10 blur-[120px] rounded-full group-hover:bg-emerald-400/15 transition-all duration-500"></div>
          
          <div className="relative flex flex-col items-center">
            <div className="w-48 h-48 md:w-56 md:h-56 rounded-full border-[12px] border-slate-800/50 flex items-center justify-center relative shadow-[0_0_50px_rgba(0,0,0,0.3)]">
              {/* Progress Stroke (SVG for precision) */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 scale-[1.08]">
                <circle 
                  className="text-emerald-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.4)]" 
                  cx="50%" 
                  cy="50%" 
                  fill="none" 
                  r="42%" 
                  stroke="currentColor" 
                  strokeDasharray="527" 
                  strokeDashoffset="116" 
                  strokeWidth="12" 
                  strokeLinecap="round"
                ></circle>
              </svg>
              <div className="text-center">
                <span className="text-6xl md:text-7xl font-black text-slate-100 tracking-tighter block leading-none">78</span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2 block">Wealth Score</span>
              </div>
            </div>
            <div className="mt-10 px-6 py-2 bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 rounded-full font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(74,222,128,0.1)]">
              Status: Excellent
            </div>
          </div>
          
          <div className="mt-12 w-full grid grid-cols-3 gap-6 border-t border-slate-700/30 pt-10">
            <div className="text-center group/item">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 group-hover/item:text-emerald-400 transition-colors">{t('totalIncome')}</p>
              <span className="material-symbols-outlined text-emerald-400 font-bold text-2xl mb-1">trending_up</span>
              <p className="text-xs font-black text-slate-100 tracking-tight">Surplus</p>
            </div>
            <div className="text-center group/item">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 group-hover/item:text-emerald-400 transition-colors">{t('debts')}</p>
              <span className="material-symbols-outlined text-emerald-400 font-bold text-2xl mb-1">verified_user</span>
              <p className="text-xs font-black text-slate-100 tracking-tight">Low Risk</p>
            </div>
            <div className="text-center group/item">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 group-hover/item:text-emerald-400 transition-colors">{t('savings')}</p>
              <span className="material-symbols-outlined text-emerald-400 font-bold text-2xl mb-1">savings</span>
              <p className="text-xs font-black text-slate-100 tracking-tight">Active</p>
            </div>
          </div>
        </div>

        {/* Analysis & Improvements Bento Group */}
        <div className="col-span-12 lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Positive Points */}
          <div className="rounded-2xl border border-slate-700/30 bg-slate-900/55 p-8 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-emerald-400/30 hover:bg-slate-900/70">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-emerald-400 font-bold">check_circle</span>
              <h3 className="text-xl font-black text-slate-100 tracking-tight">Strength Analysis</h3>
            </div>
            <ul className="space-y-6">
              <li className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-400 tracking-tight">{t('totalIncome')} &gt; {t('totalExpense')}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 px-2 py-1 bg-emerald-400/10 rounded-lg">Optimal</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-400 tracking-tight">Save rate 27.8%</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 px-2 py-1 bg-emerald-400/10 rounded-lg">Excellent</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-400 tracking-tight">Debt controlled</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 px-2 py-1 bg-emerald-400/10 rounded-lg">Stable</span>
              </li>
            </ul>
          </div>

          {/* Improvements Needed */}
          <div className="rounded-2xl border border-slate-700/30 bg-slate-900/55 p-8 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-red-400/30 hover:bg-slate-900/70">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-red-300 font-bold">warning</span>
              <h3 className="text-xl font-black text-slate-100 tracking-tight">Risk Factors</h3>
            </div>
            <div className="space-y-6">
              <div className="p-5 bg-red-400/10 rounded-2xl border border-red-500/20">
                <p className="text-[9px] font-black text-red-300 uppercase tracking-[0.2em] mb-1">Critical</p>
                <p className="text-sm font-bold text-slate-100 tracking-tight">Emergency fund &lt; 3 months</p>
              </div>
              <div className="p-5 bg-slate-800/40 rounded-2xl border border-slate-700/30">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Attention</p>
                <p className="text-sm font-bold text-slate-100 tracking-tight">Consumptive spending up 12%</p>
              </div>
            </div>
          </div>

          {/* Smart Insight AI Card */}
          <div className="md:col-span-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-8 shadow-xl backdrop-blur-xl flex flex-col md:flex-row gap-8 items-center group hover:border-emerald-400/40 transition-all duration-300">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_30px_rgba(74,222,128,0.1)]">
              <span className="material-symbols-outlined text-emerald-400 text-4xl md:text-5xl font-bold">auto_awesome</span>
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-3 mb-3">
                <h3 className="text-2xl font-black text-slate-100 tracking-tight">Smart Insight AI</h3>
                <span className="text-[9px] font-black text-emerald-400 px-2 py-0.5 bg-emerald-400/10 border border-emerald-400/20 rounded-full uppercase tracking-widest">Real-time Analysis</span>
              </div>
              <p className="text-base font-bold text-slate-300 leading-relaxed tracking-tight">
                Your lifestyle spending increased by <span className="text-red-300">22%</span>. Potential savings of <span className="text-emerald-400 font-black">{fm(310000)}</span> found in subscription audits.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button className="px-6 py-2.5 bg-emerald-400 text-slate-950 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-300 transition-all shadow-[0_0_20px_rgba(74,222,128,0.2)] active:scale-95">Execute Audit</button>
                <button className="px-6 py-2.5 text-slate-400 hover:text-slate-100 text-xs font-black uppercase tracking-widest transition-all">Dismiss Analysis</button>
              </div>
            </div>
          </div>
        </div>

        {/* Goal Tracker Card */}
        <div className="col-span-12 rounded-2xl border border-slate-700/30 bg-slate-900/55 p-8 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-emerald-400/30">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
            <div>
              <h3 className="text-2xl font-black text-slate-100 tracking-tight">Strategic Goal Tracker</h3>
              <p className="text-sm font-bold text-slate-500 tracking-tight">Projecting your journey to absolute financial freedom.</p>
            </div>
            <button className="px-6 py-2.5 border border-slate-700/50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-400 hover:border-emerald-400/30 transition-all">View Strategic Map</button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="flex justify-between items-end">
                <div>
                  <h4 className="text-xl font-black text-slate-100 tracking-tight">Emergency Fund</h4>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Target: {fm(50000000)}</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-emerald-400 tracking-tighter block leading-none">24%</span>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1 block">Completed</span>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="w-full h-4 bg-slate-700/45 rounded-full overflow-hidden border border-slate-700/20 shadow-inner">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-[0_0_15px_rgba(74,222,128,0.3)] w-[24%]"></div>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                <span>Invested: {fm(12000000)}</span>
                <span>Requirement: {fm(38000000)}</span>
              </div>
            </div>
            {/* Mini Chart/Visual Representation of Savings */}
            <div className="flex items-end gap-2 h-32 pt-4">
              {[20, 35, 25, 50, 45, 60, 80].map((h, i) => (
                <div 
                  key={i} 
                  className={`flex-1 rounded-t-lg transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.2)] ${i === 6 ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_15px_rgba(74,222,128,0.2)]' : 'bg-slate-800/60 hover:bg-emerald-400/30'}`}
                  style={{ height: `${h}%` }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Asset vs Debt Trends */}
        <div className="col-span-12 lg:col-span-8 rounded-2xl border border-slate-700/30 bg-slate-900/55 p-8 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-emerald-400/30">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
            <h3 className="text-2xl font-black text-slate-100 tracking-tight">Capital Accumulation Trend</h3>
            <div className="flex gap-6">
              <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(74,222,128,0.4)]"></span> {t('assets')}
              </span>
              <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.4)]"></span> {t('debts')}
              </span>
            </div>
          </div>
          <div className="h-[240px] w-full flex items-end gap-3 px-2 overflow-x-auto no-scrollbar">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => (
              <div key={i} className="min-w-[60px] flex-1 flex flex-col items-center gap-4 group cursor-default">
                <div className="w-full flex gap-1.5 items-end h-[160px]">
                  <div 
                    className={`flex-1 rounded-t-md transition-all duration-300 ${i === 5 ? 'bg-gradient-to-t from-emerald-600 to-emerald-400' : 'bg-emerald-400/30 group-hover:bg-emerald-400/50'}`}
                    style={{ height: `${40 + i * 10}%` }}
                  ></div>
                  <div 
                    className={`flex-1 rounded-t-md transition-all duration-300 ${i === 5 ? 'bg-gradient-to-t from-red-600 to-red-400' : 'bg-red-400/30 group-hover:bg-red-400/50'}`}
                    style={{ height: `${20 - i * 2}%` }}
                  ></div>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${i === 5 ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'}`}>{month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities / Action Items */}
        <div className="col-span-12 lg:col-span-4 rounded-2xl border border-slate-700/30 bg-slate-900/55 p-8 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-emerald-400/30">
          <h3 className="text-2xl font-black text-slate-100 tracking-tight mb-8">Strategic Tasks</h3>
          <div className="space-y-4">
            {[
              { icon: 'account_balance', color: 'text-emerald-400', bg: 'bg-emerald-400/10', title: 'Sync Capital Source', desc: 'Mandiri & BCA accounts pending sync.' },
              { icon: 'calendar_month', color: 'text-sky-400', bg: 'bg-sky-400/10', title: 'Tactical Review', desc: 'Monthly performance audit due.' },
              { icon: 'add_moderator', color: 'text-purple-400', bg: 'bg-purple-400/10', title: 'Optimize Insurance', desc: 'Coverage alignment for Q3 assets.' }
            ].map((item, i) => (
              <div 
                key={i} 
                className="flex items-start gap-4 p-4 bg-slate-950/40 border border-slate-700/30 hover:border-emerald-400/30 transition-all rounded-2xl group cursor-pointer"
              >
                <div className={`w-11 h-11 rounded-xl ${item.bg} flex items-center justify-center shrink-0 border border-white/5 shadow-inner`}>
                  <span className={`material-symbols-outlined font-bold ${item.color}`}>{item.icon}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-100 tracking-tight group-hover:text-emerald-400 transition-colors">{item.title}</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest line-clamp-1 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-emerald-400 transition-colors border-t border-slate-800 pt-6">
            View Intelligence Log
          </button>
        </div>
      </div>
    </div>
  );
}

export default Insight;

import React from 'react';
import { motion } from 'framer-motion';

function Sidebar({ activePage, setActivePage, onQuickAdd, onLogout, t }) {
  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: 'dashboard' },
    { id: 'transactions', label: t('transactions'), icon: 'receipt_long' },
    { id: 'budget', label: t('budget'), icon: 'account_balance_wallet' },
    { id: 'assets', label: t('assetsDebt'), icon: 'account_balance' },
    { id: 'insight', label: t('insight'), icon: 'insights' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] border-r border-slate-700/30 bg-slate-950/50 backdrop-blur-xl z-50 flex flex-col py-8 shadow-2xl">
      <div className="px-8 mb-10 flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_0_20px_rgba(74,222,128,0.2)]">
            <span className="material-symbols-outlined text-slate-950 font-bold">rocket_launch</span>
          </div>
          <h1 className="text-xl font-black tracking-tighter text-slate-100">WealthPilot</h1>
        </div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black mt-2 ml-1">Fleet Commander</p>
      </div>

      <nav className="flex-1 space-y-2 px-4">
        {navItems.map(item => {
          const isActive = activePage === item.id;
          return (
            <motion.button
              key={item.id}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-emerald-400/12 text-emerald-400 border border-emerald-400/20 shadow-[0_0_30px_rgba(74,222,128,0.08)]' 
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
              }`}
            >
              <span className={`material-symbols-outlined transition-transform duration-300 group-hover:scale-110 ${isActive ? 'font-bold' : ''}`}>
                {item.icon}
              </span>
              <span className="font-bold tracking-tight text-sm">{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      <div className="mt-auto px-4 pt-6 space-y-3 border-t border-slate-800/50">
        <button 
          onClick={onQuickAdd} 
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 to-emerald-500 text-slate-950 py-3.5 rounded-xl font-bold shadow-[0_0_30px_rgba(74,222,128,0.20)] transition-all duration-200 hover:from-emerald-300 hover:to-emerald-400 hover:shadow-[0_0_40px_rgba(74,222,128,0.28)] active:scale-[0.98] text-sm mb-4"
        >
          <span className="material-symbols-outlined text-[20px] font-bold">add</span>
          {t('addTransaction')}
        </button>

        <button 
          onClick={() => setActivePage('settings')}
          className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${
            activePage === 'settings' 
              ? 'bg-emerald-400/12 text-emerald-400 border border-emerald-400/20 shadow-[0_0_30px_rgba(74,222,128,0.08)]' 
              : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
          }`}
        >
          <span className={`material-symbols-outlined transition-transform duration-300 group-hover:scale-110 ${activePage === 'settings' ? 'font-bold' : ''}`}>settings</span>
          <span className="font-bold tracking-tight text-sm">{t('settings')}</span>
        </button>

        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-300 group"
        >
          <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">logout</span>
          <span className="font-bold tracking-tight text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;

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
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-surface-container/80 backdrop-blur-xl border-r border-outline-variant/30 shadow-2xl flex flex-col py-lg z-50">
      <div className="px-lg mb-xl">
        <h1 className="font-display-sm text-display-sm font-bold text-primary tracking-tight">WealthPilot</h1>
        <p className="font-label-md text-label-md text-on-surface-variant opacity-70">Track. Control. Grow.</p>
      </div>
      <nav className="flex-1 space-y-sm px-sm flex flex-col gap-1">
        {navItems.map(item => {
          const isActive = activePage === item.id;
          return (
            <motion.a
              key={item.id}
              href="#"
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => { e.preventDefault(); setActivePage(item.id); }}
              className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 rounded-lg ${
                isActive
                  ? 'bg-primary/10 text-primary border-l-4 border-primary font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'
              }`}
            >
              <span className={`material-symbols-outlined ${isActive ? 'font-fill' : ''}`} style={isActive ? {fontVariationSettings: "'FILL' 1"} : {}}>{item.icon}</span>
              <span className="font-label-md text-label-md">{item.label}</span>
            </motion.a>
          );
        })}
      </nav>
      <div className="mt-auto px-sm pt-lg space-y-sm border-t border-outline-variant/20">
        <button onClick={onQuickAdd} className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary py-3 rounded-lg font-bold hover:scale-[0.98] transition-transform text-sm mb-lg cursor-pointer">
          <span className="material-symbols-outlined text-[20px]">add</span>
          {t('addTransaction')}
        </button>
        <a 
          onClick={(e) => { e.preventDefault(); setActivePage('settings'); }}
          className={`flex items-center gap-3 px-4 py-2 transition-colors cursor-pointer ${activePage === 'settings' ? 'text-primary bg-surface-variant/30 rounded-lg' : 'text-on-surface-variant hover:text-on-surface'}`} 
          href="#"
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="font-label-md text-label-md">{t('settings')}</span>
        </a>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-error hover:bg-error/10 transition-all cursor-pointer rounded-lg mt-1 premium-button-active"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-label-md text-label-md font-bold">Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;

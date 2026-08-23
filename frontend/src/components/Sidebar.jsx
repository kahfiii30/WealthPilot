import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

function Sidebar({ onQuickAdd, onLogout, onUpgrade, t }) {
  const location = useLocation();
  const activePage = location.pathname.split('/')[1] || 'dashboard';

  const navItems = [
    { id: 'dashboard', path: '/', label: t('dashboard'), icon: 'dashboard' },
    { id: 'transactions', path: '/transactions', label: t('transactions'), icon: 'receipt_long' },
    { id: 'budget', path: '/budget', label: t('budget'), icon: 'account_balance_wallet' },
    { id: 'assets', path: '/assets', label: t('assetsDebt'), icon: 'account_balance' },
    { id: 'receivables', path: '/receivables', label: t('receivables'), icon: 'payments' },
    { id: 'insight', path: '/insight', label: t('insight'), icon: 'insights' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] border-r border-white/5 bg-[#050505] z-50 flex flex-col py-8 shadow-2xl">
      <div className="px-8 mb-10 flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary font-bold text-[18px]">rocket_launch</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">WealthPilot</h1>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4 mt-4">
        {navItems.map(item => {
          const isActive = activePage === item.id;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`relative w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors duration-200 group ${
                isActive 
                  ? 'text-white bg-white/[0.03]' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
                />
              )}
              <span className={`material-symbols-outlined transition-colors duration-200 ${isActive ? 'text-primary' : 'group-hover:text-neutral-300'}`}>
                {item.icon}
              </span>
              <span className="font-medium text-sm tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-4 pt-6 space-y-2 border-t border-white/5">
        <button 
          onClick={onQuickAdd} 
          className="w-full flex items-center justify-center gap-2 bg-primary text-black py-3 rounded-lg font-semibold transition-transform duration-200 hover:scale-[1.02] text-sm mb-4 shadow-lg shadow-primary/10"
        >
          <span className="material-symbols-outlined text-[18px] font-bold">add</span>
          {t('addTransaction')}
        </button>

        <Link 
          to="/settings"
          className={`relative w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors duration-200 group ${
            activePage === 'settings' 
              ? 'text-white bg-white/[0.03]' 
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          {activePage === 'settings' && (
            <motion.div 
              layoutId="sidebar-active-indicator"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
            />
          )}
          <span className={`material-symbols-outlined transition-colors duration-200 ${activePage === 'settings' ? 'text-primary' : 'group-hover:text-neutral-300'}`}>settings</span>
          <span className="font-medium text-sm tracking-wide">{t('settings')}</span>
        </Link>

        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors duration-200"
        >
          <span className="material-symbols-outlined font-light">logout</span>
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;

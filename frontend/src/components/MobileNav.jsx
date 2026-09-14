import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

function MobileNav({ onQuickAdd, t }) {
  const location = useLocation();
  const activePage = location.pathname.split('/')[1] || 'dashboard';

  const navItems = [
    { id: 'dashboard',    path: '/',             label: t('dashboard'),    icon: 'dashboard' },
    { id: 'transactions', path: '/transactions', label: t('transactions'), icon: 'receipt_long' },
    { id: 'budget',       path: '/budget',       label: t('budget'),       icon: 'account_balance_wallet' },
    { id: 'assets',       path: '/assets',       label: t('assetsDebt'),   icon: 'account_balance' },
    { id: 'receivables',  path: '/receivables',  label: t('receivables'),  icon: 'payments' },
    { id: 'insight',      path: '/insight',       label: t('insight'),      icon: 'insights' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[60] flex items-center justify-around px-2 pb-safe h-[72px] glass-panel border-t border-white/5 shadow-[0_-8px_30px_rgba(0,0,0,0.4)] rounded-t-2xl">
      {navItems.slice(0, 3).map(item => {
        const isActive = activePage === item.id;
        return (
          <Link
            key={item.id}
            to={item.path}
            className="relative flex flex-col items-center gap-1 min-w-[52px] py-1 group"
          >
            {/* Active pill indicator above icon */}
            {isActive && (
              <motion.div
                layoutId="mobile-active-pill"
                className="absolute -top-1 w-8 h-[3px] rounded-full bg-primary shadow-sm shadow-primary/30"
                transition={{ type: 'spring', bounce: 0.25, duration: 0.4 }}
              />
            )}
            <span
              className={`material-symbols-outlined text-[24px] transition-all duration-200 ${
                isActive
                  ? 'text-primary scale-110'
                  : 'text-slate-500 group-hover:text-slate-300'
              }`}
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
            <span className={`text-[9px] font-bold tracking-wide transition-colors duration-200 ${
              isActive ? 'text-primary' : 'text-slate-500 group-hover:text-slate-300'
            }`}>
              {item.label}
            </span>
          </Link>
        );
      })}

      {/* Center FAB */}
      <div className="relative -top-5">
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-md animate-ambient" />
        <button
          onClick={onQuickAdd}
          className="relative w-[52px] h-[52px] bg-primary text-surface rounded-full shadow-lg shadow-primary/20 flex items-center justify-center hover:bg-[#34d399] active:scale-95 transition-all duration-200 border border-primary/50"
        >
          <span className="material-symbols-outlined text-[24px] font-bold">add</span>
        </button>
      </div>

      {navItems.slice(3).map(item => {
        const isActive = activePage === item.id;
        return (
          <Link
            key={item.id}
            to={item.path}
            className="relative flex flex-col items-center gap-1 min-w-[52px] py-1 group"
          >
            {isActive && (
              <motion.div
                layoutId="mobile-active-pill"
                className="absolute -top-1 w-8 h-[3px] rounded-full bg-primary shadow-sm shadow-primary/30"
                transition={{ type: 'spring', bounce: 0.25, duration: 0.4 }}
              />
            )}
            <span
              className={`material-symbols-outlined text-[24px] transition-all duration-200 ${
                isActive
                  ? 'text-primary scale-110'
                  : 'text-slate-500 group-hover:text-slate-300'
              }`}
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
            <span className={`text-[9px] font-bold tracking-wide transition-colors duration-200 ${
              isActive ? 'text-primary' : 'text-slate-500 group-hover:text-slate-300'
            }`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export default MobileNav;

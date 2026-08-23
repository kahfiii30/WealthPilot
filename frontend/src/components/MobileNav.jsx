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
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-[60] flex items-center justify-around px-2 pb-safe"
      style={{
        height: '72px',
        background: 'linear-gradient(0deg, rgba(3,4,8,0.98) 0%, rgba(5,7,14,0.92) 100%)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 -4px 30px rgba(0,0,0,0.5), 0 -1px 0 rgba(255,255,255,0.02)',
      }}
    >
      {/* Hairline top glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/25 to-transparent pointer-events-none" />

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
                className="absolute -top-0 w-8 h-0.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 shadow-sm shadow-emerald-400/50"
                transition={{ type: 'spring', bounce: 0.3, duration: 0.35 }}
              />
            )}
            <span
              className={`material-symbols-outlined text-[24px] transition-all duration-200 ${
                isActive
                  ? 'text-emerald-400 scale-110'
                  : 'text-slate-600 group-hover:text-slate-300'
              }`}
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
            <span className={`text-[9px] font-bold tracking-wide transition-colors duration-200 ${
              isActive ? 'text-emerald-400' : 'text-slate-600 group-hover:text-slate-400'
            }`}>
              {item.label}
            </span>
          </Link>
        );
      })}

      {/* Center FAB */}
      <div className="relative -top-5">
        <div className="absolute inset-0 rounded-full bg-emerald-400/30 blur-md animate-ambient" />
        <button
          onClick={onQuickAdd}
          className="relative w-13 h-13 bg-gradient-to-br from-emerald-400 to-emerald-600 text-black rounded-full shadow-lg shadow-emerald-500/30 flex items-center justify-center hover:from-emerald-300 hover:to-emerald-500 active:scale-95 transition-all duration-200 border border-emerald-300/30"
          style={{ width: '52px', height: '52px' }}
        >
          <span className="material-symbols-outlined text-[22px] font-bold">add</span>
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
                className="absolute -top-0 w-8 h-0.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 shadow-sm shadow-emerald-400/50"
                transition={{ type: 'spring', bounce: 0.3, duration: 0.35 }}
              />
            )}
            <span
              className={`material-symbols-outlined text-[24px] transition-all duration-200 ${
                isActive
                  ? 'text-emerald-400 scale-110'
                  : 'text-slate-600 group-hover:text-slate-300'
              }`}
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
            <span className={`text-[9px] font-bold tracking-wide transition-colors duration-200 ${
              isActive ? 'text-emerald-400' : 'text-slate-600 group-hover:text-slate-400'
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

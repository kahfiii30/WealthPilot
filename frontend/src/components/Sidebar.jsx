import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

function Sidebar({ onQuickAdd, onLogout, onUpgrade, t }) {
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
    <aside className="fixed left-0 top-0 h-screen w-[240px] z-50 flex flex-col py-7 glass-panel-premium shadow-2xl">
      {/* Ambient top glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

      {/* Logo */}
      <div className="px-6 mb-8 flex flex-col gap-1">
        <div className="flex items-center gap-3">
          {/* Logo icon with glow ring */}
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-xl bg-emerald-500/20 blur-md animate-ambient" />
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <span className="material-symbols-outlined text-black font-bold text-[18px]">rocket_launch</span>
            </div>
          </div>
          <div>
            <h1 className="text-[17px] font-bold tracking-tight text-white leading-none" style={{ fontFamily: 'Outfit, sans-serif' }}>
              WealthPilot
            </h1>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-gradient-emerald mt-0.5">
              Finance OS
            </p>
          </div>
        </div>
      </div>

      {/* Section label */}
      <p className="px-6 mb-3 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Navigation</p>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3">
        {navItems.map(navItem => {
          const isActive = activePage === navItem.id;
          return (
            <Link
              key={navItem.id}
              to={navItem.path}
              className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group z-10 ${
                isActive
                  ? 'text-emerald-300'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-bg"
                  className="absolute inset-0 rounded-xl nav-active-pill"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span
                className={`relative material-symbols-outlined text-[20px] transition-all duration-200 shrink-0 ${
                  isActive
                    ? 'text-emerald-400'
                    : 'group-hover:text-slate-300'
                }`}
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {navItem.icon}
              </span>
              <span className={`relative font-semibold text-sm tracking-tight ${isActive ? 'text-emerald-200' : ''}`}>
                {navItem.label}
              </span>
              {isActive && (
                <div className="relative ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto px-3 pt-5 space-y-1.5">
        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/8 to-transparent mb-4" />

        {/* Add Transaction CTA */}
        <button
          onClick={onQuickAdd}
          className="btn-primary w-full h-11 rounded-xl text-sm mb-3 glow-emerald-sm"
        >
          <span className="material-symbols-outlined text-[18px] font-bold">add_circle</span>
          {t('addTransaction')}
        </button>

        {/* Settings */}
        <Link
          to="/settings"
          className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group z-10 ${
            activePage === 'settings'
              ? 'text-emerald-300'
              : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.03]'
          }`}
        >
          {activePage === 'settings' && (
            <motion.div
              layoutId="sidebar-active-bg"
              className="absolute inset-0 rounded-xl nav-active-pill"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
            />
          )}
          <span
            className={`relative material-symbols-outlined text-[20px] transition-all shrink-0 ${activePage === 'settings' ? 'text-emerald-400' : 'group-hover:text-slate-300'}`}
            style={activePage === 'settings' ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            settings
          </span>
          <span className="relative font-semibold text-sm tracking-tight">{t('settings')}</span>
        </Link>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-red-400 hover:bg-red-500/[0.07] transition-all duration-200 group"
        >
          <span className="material-symbols-outlined text-[20px] group-hover:text-red-400 transition-colors">logout</span>
          <span className="font-semibold text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;

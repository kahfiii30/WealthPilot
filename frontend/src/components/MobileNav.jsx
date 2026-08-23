import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function MobileNav({ onQuickAdd, t }) {
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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[72px] bg-black/80 backdrop-blur-md border-t border-white/5 flex items-center justify-around px-2 z-[60] pb-safe">
      {navItems.slice(0, 3).map(item => (
        <Link 
          key={item.id}
          to={item.path}
          className={`flex flex-col items-center gap-1 min-w-[60px] ${activePage === item.id ? 'text-primary' : 'text-neutral-500 hover:text-white'}`} 
        >
          <span className={`material-symbols-outlined text-[24px] ${activePage === item.id ? 'text-primary' : ''}`} style={activePage === item.id ? {fontVariationSettings: "'FILL' 1"} : {}}>{item.icon}</span>
          <span className={`text-[10px] text-center ${activePage === item.id ? 'font-semibold' : ''}`}>{item.label}</span>
        </Link>
      ))}

      <div className="relative -top-4">
        <button 
          onClick={onQuickAdd}
          className="w-12 h-12 bg-white text-black rounded-full shadow-lg flex items-center justify-center hover:bg-neutral-200 transition-colors duration-200 cursor-pointer border border-white/10"
        >
          <span className="material-symbols-outlined text-2xl font-bold">add</span>
        </button>
      </div>

      {navItems.slice(3).map(item => (
        <Link 
          key={item.id}
          to={item.path}
          className={`flex flex-col items-center gap-1 min-w-[60px] ${activePage === item.id ? 'text-primary' : 'text-neutral-500 hover:text-white'}`} 
        >
          <span className={`material-symbols-outlined text-[24px] ${activePage === item.id ? 'text-primary' : ''}`} style={activePage === item.id ? {fontVariationSettings: "'FILL' 1"} : {}}>{item.icon}</span>
          <span className={`text-[10px] text-center ${activePage === item.id ? 'font-semibold' : ''}`}>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

export default MobileNav;

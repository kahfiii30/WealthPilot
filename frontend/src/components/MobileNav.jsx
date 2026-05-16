import React from 'react';

function MobileNav({ activePage, setActivePage, onQuickAdd, t }) {
  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: 'dashboard' },
    { id: 'transactions', label: t('transactions'), icon: 'receipt_long' },
    { id: 'budget', label: t('budget'), icon: 'account_balance_wallet' },
    { id: 'receivables', label: t('receivables'), icon: 'payments' },
    { id: 'settings', label: t('settings'), icon: 'settings' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[80px] bg-surface-container/95 backdrop-blur-xl border-t border-outline-variant/30 flex items-center justify-around px-2 z-[60] pb-safe">
      {navItems.slice(0, 2).map(item => (
        <a 
          key={item.id}
          className={`flex flex-col items-center gap-1 min-w-[60px] ${activePage === item.id ? 'text-primary' : 'text-on-surface-variant'}`} 
          href="#" 
          onClick={(e) => { e.preventDefault(); setActivePage(item.id); }}
        >
          <span className="material-symbols-outlined text-[24px]" style={activePage === item.id ? {fontVariationSettings: "'FILL' 1"} : {}}>{item.icon}</span>
          <span className={`text-[10px] text-center ${activePage === item.id ? 'font-bold' : ''}`}>{item.label}</span>
        </a>
      ))}

      <div className="relative -top-5">
        <button 
          onClick={onQuickAdd}
          className="w-14 h-14 bg-primary text-on-primary rounded-full shadow-[0_8px_20px_rgba(75,226,119,0.3)] flex items-center justify-center hover:brightness-110 transition-colors duration-200 cursor-pointer"
        >
          <span className="material-symbols-outlined text-3xl">add</span>
        </button>
      </div>

      {navItems.slice(2).map(item => (
        <a 
          key={item.id}
          className={`flex flex-col items-center gap-1 min-w-[60px] ${activePage === item.id ? 'text-primary' : 'text-on-surface-variant'}`} 
          href="#" 
          onClick={(e) => { e.preventDefault(); setActivePage(item.id); }}
        >
          <span className="material-symbols-outlined text-[24px]" style={activePage === item.id ? {fontVariationSettings: "'FILL' 1"} : {}}>{item.icon}</span>
          <span className={`text-[10px] text-center ${activePage === item.id ? 'font-bold' : ''}`}>{item.label}</span>
        </a>
      ))}
    </nav>
  );
}

export default MobileNav;

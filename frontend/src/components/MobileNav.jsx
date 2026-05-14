import React from 'react';

function MobileNav({ activePage, setActivePage }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-container/90 backdrop-blur-xl border-t border-outline-variant/30 flex items-center justify-around px-md z-50">
      <a 
        className={`flex flex-col items-center gap-1 ${activePage === 'dashboard' ? 'text-primary' : 'text-on-surface-variant'}`} 
        href="#" 
        onClick={(e) => { e.preventDefault(); setActivePage('dashboard'); }}
      >
        <span className="material-symbols-outlined" style={activePage === 'dashboard' ? {fontVariationSettings: "'FILL' 1"} : {}}>dashboard</span>
        <span className={`text-[10px] ${activePage === 'dashboard' ? 'font-bold' : ''}`}>Dashboard</span>
      </a>
      
      <a 
        className={`flex flex-col items-center gap-1 ${activePage === 'budget' ? 'text-primary' : 'text-on-surface-variant'}`} 
        href="#" 
        onClick={(e) => { e.preventDefault(); setActivePage('budget'); }}
      >
        <span className="material-symbols-outlined" style={activePage === 'budget' ? {fontVariationSettings: "'FILL' 1"} : {}}>account_balance_wallet</span>
        <span className={`text-[10px] ${activePage === 'budget' ? 'font-bold' : ''}`}>Budget</span>
      </a>
      
      <div className="relative -top-6">
        <button className="w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center hover:brightness-110 active:scale-95 transition-all">
          <span className="material-symbols-outlined text-3xl">add</span>
        </button>
      </div>
      
      <a 
        className={`flex flex-col items-center gap-1 ${activePage === 'insight' ? 'text-primary' : 'text-on-surface-variant'}`} 
        href="#" 
        onClick={(e) => { e.preventDefault(); setActivePage('insight'); }}
      >
        <span className="material-symbols-outlined" style={activePage === 'insight' ? {fontVariationSettings: "'FILL' 1"} : {}}>insights</span>
        <span className={`text-[10px] ${activePage === 'insight' ? 'font-bold' : ''}`}>Insight</span>
      </a>
      
      <a 
        className={`flex flex-col items-center gap-1 text-on-surface-variant`} 
        href="#"
      >
        <span className="material-symbols-outlined">settings</span>
        <span className="text-[10px]">Settings</span>
      </a>
    </nav>
  );
}

export default MobileNav;

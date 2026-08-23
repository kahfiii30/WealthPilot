import React from 'react';
import { useLocation } from 'react-router-dom';

function Header({ onQuickAdd, userProfile, t, onUpgrade }) {
  const location = useLocation();
  const activePage = location.pathname.split('/')[1] || 'dashboard';

  const avatarSrc = userProfile?.avatarUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuCZ_OXPH6lIRbjpy2ahFWztRDnU3cTGstfntAjv2D6IG_NKdZrO62xpA8NcAGNi0uNc9ZLNDHEiRnndTYwMkUq9OSq5o9VwFIpkelPTLkv5FJL3nM74iT8m2TZLfqHpDLKAVEfQta8DOCPbUphTDvrvBPQjAtK-3zRD7Gu7nIQ31brcMuTQUYCzfyzJSD3NpqsVKeAFbj34ER9D6vZxV0QrGTIDmHbpaE1E2eLcSQegXGD68q3xNxe41IYOnDGGGJZtG53q2gX8AQ";

  const getSearchPlaceholder = () => {
    switch(activePage) {
      case 'transactions': return "Search transactions...";
      case 'receivables': return "Search debtor name...";
      case 'assets': return "Search assets or debts...";
      default: return "Search financial data...";
    }
  };

  return (
    <header className="fixed top-0 right-0 left-0 md:left-[240px] z-40 bg-black/80 backdrop-blur-md border-b border-white/5 h-[72px] flex justify-between items-center px-4 md:px-8">
      {/* Mobile Logo */}
      <div className="md:hidden">
        <h1 className="text-lg font-bold text-white tracking-tight">WealthPilot</h1>
      </div>

      {/* Search Container */}
      <div className="hidden lg:flex items-center gap-3 bg-white/[0.03] px-4 py-2 rounded-lg border border-white/5 w-[300px] xl:w-[400px] focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-colors duration-200 group">
        <span className="material-symbols-outlined text-neutral-500 group-focus-within:text-primary transition-colors text-[18px]">search</span>
        <input 
          className="bg-transparent border-none focus:ring-0 text-sm w-full text-white placeholder:text-neutral-500 outline-none" 
          placeholder={getSearchPlaceholder()} 
          type="text" 
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <button className="p-2 text-neutral-400 hover:text-white transition-colors duration-200 hidden sm:block">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>
          
          <button 
            onClick={onQuickAdd} 
            className="hidden md:block px-4 py-2 text-primary font-medium hover:bg-white/5 rounded-lg transition-all duration-200 text-sm"
          >
            {t('addTransaction')}
          </button>

          <button 
            onClick={onUpgrade}
            className="rounded-lg border border-secondary/20 bg-secondary/10 px-4 py-2 font-semibold text-secondary text-sm transition-all duration-200 hover:bg-secondary/20"
          >
            Upgrade Pro
          </button>
        </div>
        
        <div className="flex items-center gap-4 border-l border-white/5 pl-6">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white tracking-tight line-clamp-1">
              {[userProfile?.firstName, userProfile?.lastName].filter(Boolean).join(" ") || 'Pilot'}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Platinum</p>
          </div>
          <img 
            alt="User Avatar" 
            className="w-9 h-9 rounded-full object-cover border border-white/10" 
            src={avatarSrc} 
          />
        </div>
      </div>
    </header>
  );
}

export default Header;

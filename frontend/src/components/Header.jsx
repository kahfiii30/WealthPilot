import React from 'react';
import { useLocation } from 'react-router-dom';

function Header({ onQuickAdd, userProfile, t, onUpgrade }) {
  const location = useLocation();
  const activePage = location.pathname.split('/')[1] || 'dashboard';

  const avatarSrc = userProfile?.avatarUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuCZ_OXPH6lIRbjpy2ahFWztRDnU3cTGstfntAjv2D6IG_NKdZrO62xpA8NcAGNi0uNc9ZLNDHEiRnndTYwMkUq9OSq5o9VwFIpkelPTLkv5FJL3nM74iT8m2TZLfqHpDLKAVEfQta8DOCPbUphTDvrvBPQjAtK-3zRD7Gu7nIQ31brcMuTQUYCzfyzJSD3NpqsVKeAFbj34ER9D6vZxV0QrGTIDmHbpaE1E2eLcSQegXGD68q3xNxe41IYOnDGGGJZtG53q2gX8AQ";

  const getSearchPlaceholder = () => {
    switch(activePage) {
      case 'transactions': return "Search transactions...";
      case 'receivables':  return "Search debtor name...";
      case 'assets':       return "Search assets or debts...";
      default:             return "Search financial data...";
    }
  };

  const displayName = [userProfile?.firstName, userProfile?.lastName]
    .filter(Boolean).join(" ") || 'Pilot';

  return (
    <header className="fixed top-0 right-0 left-0 md:left-[240px] z-40 h-[68px] flex justify-between items-center px-4 md:px-7 glass-panel">
      {/* Mobile Logo */}
      <div className="md:hidden flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-sm">
          <span className="material-symbols-outlined text-surface font-bold text-[14px]">rocket_launch</span>
        </div>
        <h1 className="text-base font-bold text-slate-100 tracking-tight title-luxury">WealthPilot</h1>
      </div>

      {/* Search Bar */}
      <div className="hidden lg:flex items-center gap-2.5 px-4 py-2 rounded-xl w-[280px] xl:w-[360px] transition-all duration-300 group focus-within:w-[420px] bg-white/[0.02] border border-white/5 focus-within:bg-white/[0.04] focus-within:border-primary/40">
        <span className="material-symbols-outlined text-slate-500 group-focus-within:text-primary transition-colors text-[18px]">search</span>
        <input
          className="bg-transparent border-none focus:ring-0 text-sm w-full text-slate-200 placeholder:text-slate-500 outline-none font-medium"
          placeholder={getSearchPlaceholder()}
          type="text"
        />
        <span className="hidden xl:flex items-center text-[10px] font-bold text-slate-500 bg-white/5 px-1.5 py-0.5 rounded-md border border-white/10 tracking-wide shrink-0">⌘K</span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3 md:gap-4">

        {/* Notification bell */}
        <button className="relative p-2 text-slate-400 hover:text-slate-100 transition-colors hidden sm:flex items-center justify-center rounded-lg hover:bg-white/5">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          {/* Red dot */}
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500 ring-2 ring-surface" />
        </button>

        {/* Add Transaction */}
        <button
          onClick={onQuickAdd}
          className="hidden md:flex items-center gap-2 px-3 h-9 rounded-xl text-primary font-semibold text-sm hover:bg-primary/10 border border-primary/20 hover:border-primary/40 transition-all duration-200"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          {t('addTransaction')}
        </button>

        {/* Upgrade Pro */}
        <button
          onClick={onUpgrade}
          className="btn-gold hidden sm:flex h-9 px-4 rounded-xl text-xs"
        >
          <span className="material-symbols-outlined text-[15px]">workspace_premium</span>
          Pro
        </button>

        {/* Divider */}
        <div className="hidden sm:block w-px h-6 bg-white/10" />

        {/* User section */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[13px] font-semibold text-slate-100 tracking-tight leading-tight line-clamp-1">
              {displayName}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-gradient-gold leading-tight">
              Platinum
            </p>
          </div>

          {/* Avatar with gradient ring */}
          <div className="relative">
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-primary via-emerald-500 to-teal-400 opacity-50 animate-spin-slow" />
            <img
              alt="User Avatar"
              className="relative w-9 h-9 rounded-full object-cover border-2 border-surface"
              src={avatarSrc}
            />
            {/* Online dot */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary border-2 border-surface" />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

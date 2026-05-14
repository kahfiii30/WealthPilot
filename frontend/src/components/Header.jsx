import React from 'react';

function Header({ onQuickAdd, userProfile, t }) {
  const avatarSrc = userProfile?.avatarUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuCZ_OXPH6lIRbjpy2ahFWztRDnU3cTGstfntAjv2D6IG_NKdZrO62xpA8NcAGNi0uNc9ZLNDHEiRnndTYwMkUq9OSq5o9VwFIpkelPTLkv5FJL3nM74iT8m2TZLfqHpDLKAVEfQta8DOCPbUphTDvrvBPQjAtK-3zRD7Gu7nIQ31brcMuTQUYCzfyzJSD3NpqsVKeAFbj34ER9D6vZxV0QrGTIDmHbpaE1E2eLcSQegXGD68q3xNxe41IYOnDGGGJZtG53q2gX8AQ";

  return (
    <header className="fixed top-0 right-0 left-0 md:left-[240px] z-40 bg-slate-950/35 backdrop-blur-xl border-b border-slate-700/30 h-[72px] flex justify-between items-center px-8">
      {/* Mobile Logo */}
      <div className="md:hidden">
        <h1 className="text-lg font-black text-slate-100 tracking-tighter">WealthPilot</h1>
      </div>

      {/* Search Container */}
      <div className="hidden lg:flex items-center gap-3 bg-slate-950/55 px-4 py-2.5 rounded-xl border border-slate-700/40 w-[300px] xl:w-[400px] focus-within:border-emerald-400/70 focus-within:ring-2 focus-within:ring-emerald-400/10 transition-colors duration-200 group">
        <span className="material-symbols-outlined text-slate-500 group-focus-within:text-emerald-400 transition-colors">search</span>
        <input 
          className="bg-transparent border-none focus:ring-0 text-sm w-full text-slate-100 placeholder:text-slate-500 outline-none" 
          placeholder="Search fleet data..." 
          type="text" 
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-400 hover:text-emerald-400 transition-colors duration-200 hidden sm:block">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          
          <button 
            onClick={onQuickAdd} 
            className="hidden md:block px-4 py-2 text-emerald-400 font-bold hover:bg-emerald-400/10 rounded-xl transition-all duration-200 text-sm"
          >
            {t('addTransaction')}
          </button>

          <button className="rounded-xl border border-sky-400/20 bg-sky-400/10 px-4 py-2 font-bold text-sky-200 text-sm transition-all duration-200 hover:bg-sky-400/15 hover:border-sky-300/30 hover:scale-[0.98]">
            Upgrade Pro
          </button>
        </div>
        
        <div className="flex items-center gap-4 border-l border-slate-700/30 pl-6">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-slate-100 tracking-tight line-clamp-1">
              {[userProfile?.firstName, userProfile?.lastName].filter(Boolean).join(" ") || 'Pilot'}
            </p>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Platinum</p>
          </div>
          <img 
            alt="User Avatar" 
            className="w-10 h-10 rounded-xl border-2 border-emerald-400/20 object-cover shadow-[0_0_15px_rgba(74,222,128,0.1)]" 
            src={avatarSrc} 
          />
        </div>
      </div>
    </header>
  );
}

export default Header;

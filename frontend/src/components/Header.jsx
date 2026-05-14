import React from 'react';

function Header({ onQuickAdd, userProfile }) {
  const avatarSrc = userProfile?.avatarUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuCZ_OXPH6lIRbjpy2ahFWztRDnU3cTGstfntAjv2D6IG_NKdZrO62xpA8NcAGNi0uNc9ZLNDHEiRnndTYwMkUq9OSq5o9VwFIpkelPTLkv5FJL3nM74iT8m2TZLfqHpDLKAVEfQta8DOCPbUphTDvrvBPQjAtK-3zRD7Gu7nIQ31brcMuTQUYCzfyzJSD3NpqsVKeAFbj34ER9D6vZxV0QrGTIDmHbpaE1E2eLcSQegXGD68q3xNxe41IYOnDGGGJZtG53q2gX8AQ";

  return (
    <header className="fixed top-0 right-0 left-0 md:left-[240px] z-40 bg-surface/60 backdrop-blur-md border-b border-outline-variant/20 h-[72px] flex justify-between items-center px-container-margin">
      <div className="hidden md:flex items-center gap-md bg-surface-container-lowest px-md py-sm rounded-xl border border-outline-variant/20 w-[400px]">
        <span className="material-symbols-outlined text-on-surface-variant">search</span>
        <input className="bg-transparent border-none focus:ring-0 text-sm w-full text-on-surface focus:outline-none" placeholder="Search transactions or insights..." type="text" />
      </div>
      <div className="flex items-center gap-lg">
        <div className="flex items-center gap-md">
          <button className="p-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer hidden sm:block">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button onClick={onQuickAdd} className="hidden sm:block px-4 py-2 text-primary font-bold hover:bg-primary/10 rounded-lg transition-colors text-sm cursor-pointer">
            Quick Add
          </button>
          <button className="bg-secondary-container/10 border border-secondary-container/30 text-secondary px-4 py-2 rounded-lg font-bold text-sm hover:scale-[0.98] transition-all cursor-pointer">
            Upgrade Pro
          </button>
        </div>
        <div className="flex items-center gap-md border-l border-outline-variant/30 pl-lg">
          <div className="text-right hidden xl:block">
            <p className="font-label-md text-label-md font-bold text-on-surface">{userProfile?.firstName || 'User'}</p>
            <p className="text-[10px] text-primary">Platinum Tier</p>
          </div>
          <img alt="User Avatar" className="w-10 h-10 rounded-full border-2 border-primary/20 object-cover" src={avatarSrc} />
        </div>
      </div>
    </header>
  );
}

export default Header;

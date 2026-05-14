import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function MobileDrawer({ isOpen, onClose, activePage, setActivePage, onLogout, userProfile, t }) {
  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: 'dashboard' },
    { id: 'transactions', label: t('transactions'), icon: 'receipt_long' },
    { id: 'budget', label: t('budget'), icon: 'account_balance_wallet' },
    { id: 'assets', label: t('assetsDebt'), icon: 'account_balance' },
    { id: 'insight', label: t('insight'), icon: 'insights' },
    { id: 'settings', label: t('settings'), icon: 'settings' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-[280px] max-w-[85vw] bg-surface-container/95 backdrop-blur-xl border-r border-outline-variant/30 shadow-2xl z-[60] flex flex-col md:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-outline-variant/20">
              <h1 className="font-display-sm text-xl font-bold text-primary tracking-tight">WealthPilot</h1>
              <button onClick={onClose} className="p-2 -mr-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Profile Info (Optional) */}
            <div className="p-6 pb-2 flex items-center gap-4">
              <img 
                src={userProfile?.avatarUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuCZ_OXPH6lIRbjpy2ahFWztRDnU3cTGstfntAjv2D6IG_NKdZrO62xpA8NcAGNi0uNc9ZLNDHEiRnndTYwMkUq9OSq5o9VwFIpkelPTLkv5FJL3nM74iT8m2TZLfqHpDLKAVEfQta8DOCPbUphTDvrvBPQjAtK-3zRD7Gu7nIQ31brcMuTQUYCzfyzJSD3NpqsVKeAFbj34ER9D6vZxV0QrGTIDmHbpaE1E2eLcSQegXGD68q3xNxe41IYOnDGGGJZtG53q2gX8AQ"} 
                alt="Avatar" 
                className="w-12 h-12 rounded-full border-2 border-primary/20 object-cover"
              />
              <div>
                <p className="font-label-md font-bold text-on-surface line-clamp-1">{userProfile?.firstName || 'User'}</p>
                <p className="text-xs text-primary">Platinum</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
              {navItems.map(item => {
                const isActive = activePage === item.id;
                return (
                  <a
                    key={item.id}
                    href="#"
                    onClick={(e) => { 
                      e.preventDefault(); 
                      setActivePage(item.id);
                      onClose();
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface'
                    }`}
                  >
                    <span className={`material-symbols-outlined ${isActive ? 'font-fill' : ''}`} style={isActive ? {fontVariationSettings: "'FILL' 1"} : {}}>
                      {item.icon}
                    </span>
                    <span className="font-label-md text-[15px]">{item.label}</span>
                  </a>
                );
              })}
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-outline-variant/20">
              <button 
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-error/10 text-error rounded-xl font-bold hover:bg-error hover:text-white transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined">logout</span>
                Logout
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default MobileDrawer;

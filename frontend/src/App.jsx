import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MobileNav from './components/MobileNav';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budget from './pages/Budget';
import Insight from './pages/Insight';
import AssetsDebt from './pages/AssetsDebt';
import Login from './pages/Login';
import Settings from './pages/Settings';
import AnimatedPage from './components/AnimatedPage';
import TransactionForm from './components/TransactionForm';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('wealthpilot_auth') === 'true';
  });
  const [activePage, setActivePage] = useState('dashboard');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState(() => {
    return localStorage.getItem('wealthpilot_current_user') || '';
  });

  // User Profile State
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('wealthpilot_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) { console.error("Profile parse error", e); }
    return {
      firstName: "Alexander",
      lastName: "Pilot",
      email: "alexander@wealthpilot.local",
      avatarUrl: ""
    };
  });

  // Helper to sync profile changes back to master users list
  const updateGlobalUser = (updatedProfile) => {
    try {
      const users = JSON.parse(localStorage.getItem('wealthpilot_users') || '[]');
      const updatedUsers = users.map(u => 
        u.email === updatedProfile.email ? { ...u, ...updatedProfile } : u
      );
      localStorage.setItem('wealthpilot_users', JSON.stringify(updatedUsers));
    } catch (e) { console.error("Global user update error", e); }
  };

  const handleSetUserProfile = (updated) => {
    if (typeof updated === 'function') {
      setUserProfile(prev => {
        const next = updated(prev);
        updateGlobalUser(next);
        return next;
      });
    } else {
      setUserProfile(updated);
      updateGlobalUser(updated);
    }
  };

  // Preferences State
  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem('wealthpilot_preferences');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed) return parsed;
      }
    } catch (e) {}
    return { currency: "IDR", theme: "Dark", dashboardPeriod: "This Month", numberFormat: "Indonesian" };
  });

  // Notifications State
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('wealthpilot_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed) return parsed;
      }
    } catch (e) {}
    return { budgetWarning: true, monthlyReport: true, debtReminder: true, goalProgress: false, largeExpenseAlert: true };
  });

  // Transactions State
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem('wealthpilot_transactions');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: '1', type: 'expense', amount: 65000, category: 'Food & Dining', method: 'Cash', note: 'Starbucks Reserve', date: new Date().toISOString().split('T')[0] },
      { id: '2', type: 'income', amount: 5200000, category: 'Salary', method: 'Bank Transfer', note: 'Salary Deposit', date: new Date().toISOString().split('T')[0] },
      { id: '3', type: 'expense', amount: 450000, category: 'Shopping', method: 'E-Wallet', note: 'Tokopedia', date: new Date().toISOString().split('T')[0] }
    ];
  });

  // Assets State
  const [assets, setAssets] = useState(() => {
    try {
      const saved = localStorage.getItem('wealthpilot_assets');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 'a1', name: 'Emergency Fund', category: 'Bank', amount: 10000000, note: 'BCA Savings', updatedAt: new Date().toISOString() }
    ];
  });

  // Debts State
  const [debts, setDebts] = useState(() => {
    try {
      const saved = localStorage.getItem('wealthpilot_debts');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 'd1', name: 'Credit Card', category: 'Kartu Kredit', amount: 1500000, note: 'Visa Platinum', dueDate: '2026-06-15', updatedAt: new Date().toISOString() }
    ];
  });

  // Budgets State
  const [budgets, setBudgets] = useState(() => {
    try {
      const saved = localStorage.getItem('wealthpilot_budgets');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 'b1', category: 'Food & Dining', limit: 1000000, month: new Date().toISOString().slice(0, 7) },
      { id: 'b2', category: 'Transportation', limit: 500000, month: new Date().toISOString().slice(0, 7) },
      { id: 'b3', category: 'Shopping', limit: 700000, month: new Date().toISOString().slice(0, 7) }
    ];
  });

  useEffect(() => {
    localStorage.setItem('wealthpilot_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('wealthpilot_preferences', JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    localStorage.setItem('wealthpilot_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('wealthpilot_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('wealthpilot_assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('wealthpilot_debts', JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    localStorage.setItem('wealthpilot_budgets', JSON.stringify(budgets));
  }, [budgets]);

  const handleLogin = (user) => {
    localStorage.setItem('wealthpilot_auth', 'true');
    localStorage.setItem('wealthpilot_current_user', user.email);
    localStorage.setItem('wealthpilot_user_profile', JSON.stringify({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatarUrl: user.avatarUrl || ""
    }));
    
    setIsAuthenticated(true);
    setCurrentUserEmail(user.email);
    setUserProfile({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatarUrl: user.avatarUrl || ""
    });
    setActivePage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('wealthpilot_auth');
    localStorage.removeItem('wealthpilot_current_user');
    setIsAuthenticated(false);
    setCurrentUserEmail('');
  };

  const handleResetFinanceData = () => {
    if (window.confirm("Are you sure you want to reset all financial data? This will delete all transactions, assets, and debts. Profile settings will remain.")) {
      localStorage.removeItem('wealthpilot_transactions');
      localStorage.removeItem('wealthpilot_assets');
      localStorage.removeItem('wealthpilot_debts');
      localStorage.removeItem('wealthpilot_budgets');
      setTransactions([]);
      setAssets([]);
      setDebts([]);
      setBudgets([]);
    }
  };

  const handleAddTransaction = (t) => {
    setTransactions(prev => [t, ...prev]);
  };

  const handleDeleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Asset CRUD
  const addAsset = (a) => setAssets(prev => [...prev, { ...a, id: Date.now().toString(), updatedAt: new Date().toISOString() }]);
  const updateAsset = (id, updated) => setAssets(prev => prev.map(a => a.id === id ? { ...updated, updatedAt: new Date().toISOString() } : a));
  const deleteAsset = (id) => setAssets(prev => prev.filter(a => a.id !== id));

  // Debt CRUD
  const addDebt = (d) => setDebts(prev => [...prev, { ...d, id: Date.now().toString(), updatedAt: new Date().toISOString() }]);
  const updateDebt = (id, updated) => setDebts(prev => prev.map(d => d.id === id ? { ...updated, updatedAt: new Date().toISOString() } : d));
  const deleteDebt = (id) => setDebts(prev => prev.filter(d => d.id !== id));

  // Budget CRUD
  const addBudget = (b) => setBudgets(prev => [...prev, { ...b, id: Date.now().toString() }]);
  const updateBudget = (id, updated) => setBudgets(prev => prev.map(b => b.id === id ? { ...updated } : b));
  const deleteBudget = (id) => setBudgets(prev => prev.filter(b => b.id !== id));

  if (!isAuthenticated) {
    return (
      <AnimatePresence mode="wait">
        <Login key="login" onLogin={handleLogin} />
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key="app-shell"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="relative min-h-screen bg-[#0b0f19]"
      >
        <div className="hidden md:block">
          <Sidebar 
            activePage={activePage} 
            setActivePage={setActivePage} 
            onQuickAdd={() => setIsQuickAddOpen(true)} 
            onLogout={handleLogout}
          />
        </div>
        <Header 
          onQuickAdd={() => setIsQuickAddOpen(true)} 
          onLogout={handleLogout} 
          userProfile={userProfile}
        />

        <main className="md:ml-[240px] pt-[72px] pb-[80px] md:pb-0 min-h-screen overflow-y-auto overflow-x-hidden relative bg-[#0b0f19]">
          <AnimatePresence mode="wait">
            {activePage === 'dashboard' && <AnimatedPage key="dashboard"><Dashboard transactions={transactions} assets={assets} debts={debts} onDeleteTransaction={handleDeleteTransaction} /></AnimatedPage>}
            {activePage === 'transactions' && <AnimatedPage key="transactions"><Transactions transactions={transactions} onDelete={handleDeleteTransaction} /></AnimatedPage>}
            {activePage === 'budget' && (
              <AnimatedPage key="budget">
                <Budget 
                  transactions={transactions} 
                  budgets={budgets} 
                  onAddBudget={addBudget} 
                  onUpdateBudget={updateBudget} 
                  onDeleteBudget={deleteBudget} 
                />
              </AnimatedPage>
            )}
            {activePage === 'assets' && (
              <AnimatedPage key="assets">
                <AssetsDebt 
                  assets={assets} 
                  debts={debts}
                  onAddAsset={addAsset}
                  onUpdateAsset={updateAsset}
                  onDeleteAsset={deleteAsset}
                  onAddDebt={addDebt}
                  onUpdateDebt={updateDebt}
                  onDeleteDebt={deleteDebt}
                />
              </AnimatedPage>
            )}
            {activePage === 'insight' && <AnimatedPage key="insight"><Insight /></AnimatedPage>}
            {activePage === 'settings' && (
              <AnimatedPage key="settings">
                <Settings 
                  userProfile={userProfile} 
                  setUserProfile={handleSetUserProfile}
                  preferences={preferences}
                  setPreferences={setPreferences}
                  notifications={notifications}
                  setNotifications={setNotifications}
                  onLogout={handleLogout}
                  onResetData={handleResetFinanceData}
                />
              </AnimatedPage>
            )}
          </AnimatePresence>
        </main>
        
        <MobileNav activePage={activePage} setActivePage={setActivePage} onQuickAdd={() => setIsQuickAddOpen(true)} />

        <TransactionForm isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} onAddTransaction={handleAddTransaction} />
      </motion.div>
    </AnimatePresence>
  );
}

export default App;

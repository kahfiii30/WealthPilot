import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from './lib/supabaseClient';
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
  const [session, setSession] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Core Data States
  const [userProfile, setUserProfile] = useState({ firstName: "", lastName: "", email: "", avatarUrl: "" });
  const [preferences, setPreferences] = useState({ currency: "IDR", theme: "Dark", dashboardPeriod: "This Month", numberFormat: "Indonesian" });
  const [notifications, setNotifications] = useState({ budgetWarning: true, monthlyReport: true, debtReminder: true, goalProgress: false, largeExpenseAlert: true });
  const [transactions, setTransactions] = useState([]);
  const [assets, setAssets] = useState([]);
  const [debts, setDebts] = useState([]);
  const [budgets, setBudgets] = useState([]);

  // Auth State Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserData(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserData(session.user.id);
      else {
        resetLocalState();
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const resetLocalState = () => {
    setUserProfile({ firstName: "", lastName: "", email: "", avatarUrl: "" });
    setTransactions([]);
    setAssets([]);
    setDebts([]);
    setBudgets([]);
  };

  const fetchUserData = async (userId) => {
    setLoading(true);
    try {
      // 1. Fetch Profile
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (profile) {
        setUserProfile({
          firstName: profile.first_name || "",
          lastName: profile.last_name || "",
          email: profile.email || "",
          avatarUrl: profile.avatar_url || ""
        });
      }

      // 2. Fetch Settings
      const { data: settings } = await supabase.from('user_settings').select('*').eq('user_id', userId).single();
      if (settings) {
        setPreferences(settings.preferences);
        setNotifications(settings.notifications);
      }

      // 3. Fetch Transactions
      const { data: transData } = await supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false });
      if (transData) setTransactions(transData);

      // 4. Fetch Assets
      const { data: assetsData } = await supabase.from('assets').select('*').eq('user_id', userId).order('updated_at', { ascending: false });
      if (assetsData) {
        setAssets(assetsData.map(a => ({
          ...a,
          updatedAt: a.updated_at
        })));
      }

      // 5. Fetch Debts
      const { data: debtsData } = await supabase.from('debts').select('*').eq('user_id', userId).order('updated_at', { ascending: false });
      if (debtsData) {
        setDebts(debtsData.map(d => ({
          ...d,
          dueDate: d.due_date,
          updatedAt: d.updated_at
        })));
      }

      // 6. Fetch Budgets
      const { data: budgetsData } = await supabase.from('budgets').select('*').eq('user_id', userId);
      if (budgetsData) setBudgets(budgetsData);

    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    resetLocalState();
  };

  // --- CRUD FUNCTIONS (SUPABASE MIGRATED) ---

  const handleAddTransaction = async (t) => {
    const { data, error } = await supabase.from('transactions').insert([{ ...t, user_id: session.user.id }]).select();
    if (!error && data) setTransactions(prev => [data[0], ...prev]);
  };

  const handleDeleteTransaction = async (id) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (!error) setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addAsset = async (a) => {
    const { data, error } = await supabase.from('assets').insert([{
      user_id: session.user.id,
      name: a.name,
      category: a.category,
      amount: a.amount,
      note: a.note
    }]).select();
    if (!error && data) setAssets(prev => [{ ...data[0], updatedAt: data[0].updated_at }, ...prev]);
  };

  const updateAsset = async (id, updated) => {
    const { data, error } = await supabase.from('assets').update({
      name: updated.name,
      category: updated.category,
      amount: updated.amount,
      note: updated.note,
      updated_at: new Date().toISOString()
    }).eq('id', id).select();
    if (!error && data) setAssets(prev => prev.map(a => a.id === id ? { ...data[0], updatedAt: data[0].updated_at } : a));
  };

  const deleteAsset = async (id) => {
    const { error } = await supabase.from('assets').delete().eq('id', id);
    if (!error) setAssets(prev => prev.filter(a => a.id !== id));
  };

  const addDebt = async (d) => {
    const { data, error } = await supabase.from('debts').insert([{
      user_id: session.user.id,
      name: d.name,
      category: d.category,
      amount: d.amount,
      note: d.note,
      due_date: d.dueDate
    }]).select();
    if (!error && data) setDebts(prev => [{ ...data[0], dueDate: data[0].due_date, updatedAt: data[0].updated_at }, ...prev]);
  };

  const updateDebt = async (id, updated) => {
    const { data, error } = await supabase.from('debts').update({
      name: updated.name,
      category: updated.category,
      amount: updated.amount,
      note: updated.note,
      due_date: updated.dueDate,
      updated_at: new Date().toISOString()
    }).eq('id', id).select();
    if (!error && data) setDebts(prev => prev.map(d => d.id === id ? { ...data[0], dueDate: data[0].due_date, updatedAt: data[0].updated_at } : d));
  };

  const deleteDebt = async (id) => {
    const { error } = await supabase.from('debts').delete().eq('id', id);
    if (!error) setDebts(prev => prev.filter(d => d.id !== id));
  };

  const addBudget = async (b) => {
    const { data, error } = await supabase.from('budgets').insert([{ ...b, user_id: session.user.id }]).select();
    if (!error && data) setBudgets(prev => [...prev, data[0]]);
  };

  const updateBudget = async (id, updated) => {
    const { data, error } = await supabase.from('budgets').update(updated).eq('id', id).select();
    if (!error && data) setBudgets(prev => prev.map(b => b.id === id ? data[0] : b));
  };

  const deleteBudget = async (id) => {
    const { error } = await supabase.from('budgets').delete().eq('id', id);
    if (!error) setBudgets(prev => prev.filter(b => b.id !== id));
  };

  const handleSetUserProfile = async (updated) => {
    const nextProfile = typeof updated === 'function' ? updated(userProfile) : updated;
    const { error } = await supabase.from('profiles').update({
      first_name: nextProfile.firstName,
      last_name: nextProfile.lastName,
      avatar_url: nextProfile.avatarUrl,
      updated_at: new Date().toISOString()
    }).eq('id', session.user.id);
    
    if (!error) setUserProfile(nextProfile);
  };

  const handleSetPreferences = async (prefs) => {
    const { error } = await supabase.from('user_settings').update({ preferences: prefs, updated_at: new Date().toISOString() }).eq('user_id', session.user.id);
    if (!error) setPreferences(prefs);
  };

  const handleSetNotifications = async (notifs) => {
    const { error } = await supabase.from('user_settings').update({ notifications: notifs, updated_at: new Date().toISOString() }).eq('user_id', session.user.id);
    if (!error) setNotifications(notifs);
  };

  const handleResetFinanceData = async () => {
    if (window.confirm("Are you sure you want to reset all financial data? This will delete all transactions, assets, debts, and budgets from the cloud.")) {
      await supabase.from('transactions').delete().eq('user_id', session.user.id);
      await supabase.from('assets').delete().eq('user_id', session.user.id);
      await supabase.from('debts').delete().eq('user_id', session.user.id);
      await supabase.from('budgets').delete().eq('user_id', session.user.id);
      resetLocalState();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-on-surface-variant font-label-md uppercase tracking-widest animate-pulse">Initializing Flight Systems...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <AnimatePresence mode="wait">
        <Login key="login" />
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
                  setPreferences={handleSetPreferences}
                  notifications={notifications}
                  setNotifications={handleSetNotifications}
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

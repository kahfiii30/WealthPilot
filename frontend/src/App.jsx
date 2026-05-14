import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';
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
import { translate } from './utils/translations';
import { formatMoney } from './utils/formatMoney';

function App() {
  const [session, setSession] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");
  const [activePage, setActivePage] = useState('dashboard');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Core Data States
  const [userProfile, setUserProfile] = useState({ firstName: "Pilot", lastName: "", email: "", avatarUrl: "" });
  const [preferences, setPreferences] = useState({ 
    currency: "IDR", 
    theme: "Dark", 
    dashboardPeriod: "This Month", 
    numberFormat: "Indonesian",
    language: "en",
    exchangeRate: 16000 
  });
  const [notifications, setNotifications] = useState({ budgetWarning: true, monthlyReport: true, debtReminder: true, goalProgress: false, largeExpenseAlert: true });
  const [transactions, setTransactions] = useState([]);
  const [assets, setAssets] = useState([]);
  const [debts, setDebts] = useState([]);
  const [budgets, setBudgets] = useState([]);


  // Auth State Listener
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        localStorage.setItem("isLoggedIn", "true");
        setIsLoggedIn(true);
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        localStorage.setItem("isLoggedIn", "true");
        setIsLoggedIn(true);
        fetchUserData(session.user.id);
      } else {
        localStorage.setItem("isLoggedIn", "false");
        setIsLoggedIn(false);
        resetLocalState();
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);


  const resetLocalState = () => {
    setUserProfile({ firstName: "Pilot", lastName: "", email: "", avatarUrl: "" });
    setTransactions([]);
    setAssets([]);
    setDebts([]);
    setBudgets([]);
  };

  const fetchUserData = async (userId) => {
    setLoading(true);
    try {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (profile) {
        setUserProfile({
          firstName: profile.first_name || "Pilot",
          lastName: profile.last_name || "",
          email: profile.email || "",
          avatarUrl: profile.avatar_url || ""
        });
      }

      const { data: settings } = await supabase.from('user_settings').select('*').eq('user_id', userId).single();
      if (settings) {
        setPreferences({
          ...settings.preferences,
          language: 'en',
          exchangeRate: settings.exchange_rate_usd_idr || 16000,
          currency: settings.preferences.currency || 'IDR'
        });
        setNotifications(settings.notifications);
      }

      const { data: transData } = await supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false });
      if (transData) setTransactions(transData);

      const { data: assetsData } = await supabase.from('assets').select('*').eq('user_id', userId).order('updated_at', { ascending: false });
      if (assetsData) setAssets(assetsData);

      const { data: debtsData } = await supabase.from('debts').select('*').eq('user_id', userId).order('updated_at', { ascending: false });
      if (debtsData) setDebts(debtsData);

      const { data: budgetsData } = await supabase.from('budgets').select('*').eq('user_id', userId);
      if (budgetsData) {
        setBudgets(budgetsData);
        localStorage.setItem("budgets", JSON.stringify(budgetsData));
      } else {
        // Fallback to local if Supabase empty but local has something (for migration/offline)
        const local = localStorage.getItem("budgets");
        if (local) setBudgets(JSON.parse(local));
      }

    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.setItem("isLoggedIn", "false");
    setIsLoggedIn(false);
    resetLocalState();
  };

  const handleAddTransaction = async (t_data) => {
    const { data, error } = await supabase.from('transactions').insert([{ ...t_data, user_id: session.user.id }]).select();
    if (!error && data) setTransactions(prev => [data[0], ...prev]);
  };

  const handleDeleteTransaction = async (id) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (!error) setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Helpers
  const t = (key) => translate(key, 'en');
  const fm = (amount) => formatMoney(amount, preferences);

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
      <div className="min-h-screen bg-[#020617] flex items-center justify-center relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full animate-pulse delay-700"></div>

        <div className="flex flex-col items-center gap-8 relative z-10">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-[6px] border-slate-800/50 rounded-2xl"></div>
            <div className="absolute inset-0 border-[6px] border-emerald-400 border-t-transparent border-r-transparent rounded-2xl animate-spin shadow-[0_0_20px_rgba(74,222,128,0.2)]"></div>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black text-slate-100 tracking-[0.3em] uppercase mb-2">WealthPilot</h1>
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.5em] animate-pulse">Initializing Command Center</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isSupabaseConfigured) {
    return <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-error">Supabase Configuration Missing</div>;
  }

  if (!isLoggedIn) {
    return <Login />;
  }

  return (
    <div className="relative min-h-screen text-slate-100 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.10),transparent_30%),radial-gradient(circle_at_top_right,rgba(74,222,128,0.08),transparent_26%),linear-gradient(135deg,#020617_0%,#07111f_45%,#0b1628_100%)]">
      <div className="hidden md:block">
        <Sidebar 
          activePage={activePage} 
          setActivePage={setActivePage} 
          onQuickAdd={() => setIsQuickAddOpen(true)} 
          onLogout={handleLogout}
          t={t}
        />
      </div>
      <Header 
        onQuickAdd={() => setIsQuickAddOpen(true)} 
        onLogout={handleLogout} 
        userProfile={userProfile}
        t={t}
      />

      <main className="md:ml-[240px] pt-[72px] pb-[80px] md:pb-0 min-h-screen overflow-y-auto overflow-x-hidden relative">
        <AnimatePresence mode="wait">
          {activePage === 'dashboard' && <AnimatedPage key="dashboard"><Dashboard transactions={transactions} assets={assets} debts={debts} onDeleteTransaction={handleDeleteTransaction} t={t} fm={fm} /></AnimatedPage>}
          {activePage === 'transactions' && <AnimatedPage key="transactions"><Transactions transactions={transactions} onDelete={handleDeleteTransaction} t={t} fm={fm} /></AnimatedPage>}
          {activePage === 'budget' && (
            <AnimatedPage key="budget">
              <Budget 
                transactions={transactions} 
                budgets={budgets}
                setBudgets={setBudgets}
                t={t}
                fm={fm}
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
                t={t}
                fm={fm}
              />
            </AnimatedPage>
          )}
          {activePage === 'insight' && (
            <AnimatedPage key="insight">
              <Insight 
                transactions={transactions}
                assets={assets}
                debts={debts}
                budgets={budgets}
                t={t} 
                fm={fm} 
              />
            </AnimatedPage>
          )}
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
                t={t}
                fm={fm}
              />
            </AnimatedPage>
          )}
        </AnimatePresence>
      </main>
      
      <MobileNav activePage={activePage} setActivePage={setActivePage} onQuickAdd={() => setIsQuickAddOpen(true)} t={t} />

      <TransactionForm isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} onAddTransaction={handleAddTransaction} t={t} fm={fm} currency={preferences.currency} />
    </div>
  );
}

export default App;

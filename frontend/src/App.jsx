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
      if (session) fetchUserData(session.user.id);
      else setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
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

  const handleAddTransaction = async (t) => {
    const { data, error } = await supabase.from('transactions').insert([{ ...t, user_id: session.user.id }]).select();
    if (!error && data) setTransactions(prev => [data[0], ...prev]);
  };

  const handleDeleteTransaction = async (id) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (!error) setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Helpers
  const t = (key) => translate(key, 'en');
  const fm = (amount) => formatMoney(amount, preferences);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-on-surface font-bold tracking-[0.2em] uppercase animate-pulse">WealthPilot</p>
        </div>
      </div>
    );
  }

  if (!isSupabaseConfigured) {
    return <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-error">Supabase Configuration Missing</div>;
  }

  if (!session) {
    return <Login />;
  }

  return (
    <div className="relative min-h-screen bg-[#0b0f19]">
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

      <main className="md:ml-[240px] pt-[72px] pb-[100px] md:pb-lg min-h-screen overflow-y-auto overflow-x-hidden relative">
        <AnimatePresence mode="wait">
          {activePage === 'dashboard' && <AnimatedPage key="dashboard"><Dashboard transactions={transactions} assets={assets} debts={debts} onDeleteTransaction={handleDeleteTransaction} t={t} fm={fm} /></AnimatedPage>}
          {activePage === 'transactions' && <AnimatedPage key="transactions"><Transactions transactions={transactions} onDelete={handleDeleteTransaction} t={t} fm={fm} /></AnimatedPage>}
          {activePage === 'budget' && (
            <AnimatedPage key="budget">
              <Budget 
                transactions={transactions} 
                budgets={budgets} 
                onAddBudget={async (b) => {
                  const { data } = await supabase.from('budgets').insert([{ ...b, user_id: session.user.id }]).select();
                  if (data) setBudgets(prev => [...prev, data[0]]);
                }}
                onUpdateBudget={async (id, updated) => {
                  const { data } = await supabase.from('budgets').update(updated).eq('id', id).select();
                  if (data) setBudgets(prev => prev.map(b => b.id === id ? data[0] : b));
                }}
                onDeleteBudget={async (id) => {
                  await supabase.from('budgets').delete().eq('id', id);
                  setBudgets(prev => prev.filter(b => b.id !== id));
                }}
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
                onAddAsset={async (a) => {
                  const { data } = await supabase.from('assets').insert([{ ...a, user_id: session.user.id }]).select();
                  if (data) setAssets(prev => [data[0], ...prev]);
                }}
                onDeleteAsset={async (id) => {
                  await supabase.from('assets').delete().eq('id', id);
                  setAssets(prev => prev.filter(a => a.id !== id));
                }}
                onAddDebt={async (d) => {
                  const { data } = await supabase.from('debts').insert([{ ...d, user_id: session.user.id }]).select();
                  if (data) setDebts(prev => [data[0], ...prev]);
                }}
                onDeleteDebt={async (id) => {
                  await supabase.from('debts').delete().eq('id', id);
                  setDebts(prev => prev.filter(d => d.id !== id));
                }}
                t={t}
                fm={fm}
              />
            </AnimatedPage>
          )}
          {activePage === 'insight' && <AnimatedPage key="insight"><Insight t={t} fm={fm} /></AnimatedPage>}
          {activePage === 'settings' && (
            <AnimatedPage key="settings">
              <Settings 
                userProfile={userProfile} 
                setUserProfile={async (p) => {
                  await supabase.from('profiles').update(p).eq('id', session.user.id);
                  setUserProfile(p);
                }}
                preferences={preferences}
                setPreferences={setPreferences}
                notifications={notifications}
                setNotifications={setNotifications}
                onLogout={handleLogout}
                onResetData={async () => {
                  await supabase.from('transactions').delete().eq('user_id', session.user.id);
                  resetLocalState();
                }}
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

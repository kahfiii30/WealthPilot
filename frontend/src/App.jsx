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
import { 
  fetchTransactions, createTransaction, deleteTransaction,
  fetchAssets, createAsset, updateAsset as apiUpdateAsset, deleteAsset as apiDeleteAsset,
  fetchDebts, createDebt, updateDebt as apiUpdateDebt, deleteDebt as apiDeleteDebt,
  fetchBudgets, createBudget as apiCreateBudget, updateBudget as apiUpdateBudget, deleteBudget as apiDeleteBudget,
  fetchReceivables, createReceivable as apiCreateReceivable, updateReceivable as apiUpdateReceivable, deleteReceivable as apiDeleteReceivable, markReceivablePayment as apiMarkReceivablePayment,
  fetchProfile, updateProfile as apiUpdateProfile, normalizeProfile
} from './services/financeService';
import Receivables from './pages/Receivables';

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
  const [receivables, setReceivables] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });


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
    setReceivables([]);
  };

  const fetchUserData = async (userId) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const profileData = await fetchProfile();
      if (profileData) {
        setUserProfile(normalizeProfile(profileData, user));
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

      const [transData, assetsData, debtsData, budgetsData, receivablesData] = await Promise.all([
        fetchTransactions(userId),
        fetchAssets(userId),
        fetchDebts(userId),
        fetchBudgets(userId),
        fetchReceivables(userId)
      ]);

      setTransactions(transData);
      setAssets(assetsData);
      setDebts(debtsData);
      setBudgets(budgetsData);
      setReceivables(receivablesData);

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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const created = await createTransaction(user.id, t_data);
      setTransactions(prev => [created, ...prev]);
      return created;
    } catch (error) {
      console.error("Error adding transaction:", error);
      throw error;
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      await deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const t = (key) => translate(key, 'en');
  const fm = (amount) => formatMoney(amount, preferences);

  const addAsset = async (a) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const created = await createAsset(user.id, a);
      setAssets(prev => [created, ...prev]);
      return created;
    } catch (error) {
      throw error;
    }
  };

  const updateAsset = async (id, updated) => {
    try {
      const res = await apiUpdateAsset(id, updated);
      setAssets(prev => prev.map(a => a.id === id ? res : a));
    } catch (error) {}
  };

  const deleteAsset = async (id) => {
    try {
      await apiDeleteAsset(id);
      setAssets(prev => prev.filter(a => a.id !== id));
    } catch (error) {}
  };

  const addDebt = async (d) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const created = await createDebt(user.id, d);
      setDebts(prev => [created, ...prev]);
      return created;
    } catch (error) {
      throw error;
    }
  };

  const updateDebt = async (id, updated) => {
    try {
      const res = await apiUpdateDebt(id, updated);
      setDebts(prev => prev.map(d => d.id === id ? res : d));
    } catch (error) {}
  };

  const deleteDebt = async (id) => {
    try {
      await apiDeleteDebt(id);
      setDebts(prev => prev.filter(d => d.id !== id));
    } catch (error) {}
  };

  const addBudget = async (b) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const created = await apiCreateBudget(user.id, b);
      setBudgets(prev => [created, ...prev]);
      return created;
    } catch (error) {
      throw error;
    }
  };

  const updateBudget = async (id, updated) => {
    try {
      const res = await apiUpdateBudget(id, updated);
      setBudgets(prev => prev.map(b => b.id === id ? res : b));
    } catch (error) {}
  };

  const deleteBudget = async (id) => {
    try {
      await apiDeleteBudget(id);
      setBudgets(prev => prev.filter(b => b.id !== id));
    } catch (error) {}
  };

  const addReceivable = async (data) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const created = await apiCreateReceivable(user.id, data);
      setReceivables(prev => [created, ...prev]);
      return created;
    } catch (error) {
      throw error;
    }
  };

  const updateReceivable = async (id, updated) => {
    try {
      const res = await apiUpdateReceivable(id, updated);
      setReceivables(prev => prev.map(r => r.id === id ? res : r));
    } catch (error) {}
  };

  const deleteReceivable = async (id) => {
    try {
      await apiDeleteReceivable(id);
      setReceivables(prev => prev.filter(r => r.id !== id));
    } catch (error) {}
  };

  const markReceivablePayment = async (id, currentPaid, amount) => {
    try {
      const res = await apiMarkReceivablePayment(id, currentPaid, amount);
      setReceivables(prev => prev.map(r => r.id === id ? res : r));
    } catch (error) {}
  };

  const handleUpdateProfile = async (payload) => {
    try {
      const updated = await apiUpdateProfile(payload);
      setUserProfile(updated);
      return updated;
    } catch (error) {
      throw error;
    }
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
    if (window.confirm("Are you sure you want to reset all financial data?")) {
      await Promise.all([
        supabase.from('transactions').delete().eq('user_id', session.user.id),
        supabase.from('assets').delete().eq('user_id', session.user.id),
        supabase.from('debts').delete().eq('user_id', session.user.id),
        supabase.from('budgets').delete().eq('user_id', session.user.id),
        supabase.from('receivables').delete().eq('user_id', session.user.id)
      ]);
      resetLocalState();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[150px] rounded-full animate-pulse"></div>
        <div className="flex flex-col items-center gap-8 relative z-10">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-[6px] border-slate-800/50 rounded-2xl"></div>
            <div className="absolute inset-0 border-[6px] border-emerald-400 border-t-transparent border-r-transparent rounded-2xl animate-spin shadow-[0_0_20px_rgba(74,222,128,0.2)]"></div>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black text-slate-100 tracking-[0.3em] uppercase mb-2">WealthPilot</h1>
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.5em] animate-pulse">Initializing</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isSupabaseConfigured) return <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-error">Supabase Configuration Missing</div>;
  if (!isLoggedIn) return <Login />;

  return (
    <div className="relative min-h-screen text-slate-100 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.10),transparent_30%),radial-gradient(circle_at_top_right,rgba(74,222,128,0.08),transparent_26%),linear-gradient(135deg,#020617_0%,#07111f_45%,#0b1628_100%)]">
      <div className="hidden md:block">
        <Sidebar activePage={activePage} setActivePage={setActivePage} onQuickAdd={() => setIsQuickAddOpen(true)} onLogout={handleLogout} t={t} />
      </div>
      <Header onQuickAdd={() => setIsQuickAddOpen(true)} onLogout={handleLogout} userProfile={userProfile} t={t} />

      <main className="md:ml-[240px] pt-[72px] pb-[80px] md:pb-0 min-h-screen relative">
        <AnimatePresence mode="wait">
          {activePage === 'dashboard' && <AnimatedPage key="dashboard"><Dashboard transactions={transactions} assets={assets} debts={debts} receivables={receivables} onDeleteTransaction={handleDeleteTransaction} t={t} fm={fm} userProfile={userProfile} selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} /></AnimatedPage>}
          {activePage === 'transactions' && <AnimatedPage key="transactions"><Transactions transactions={transactions} onDelete={handleDeleteTransaction} t={t} fm={fm} selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} /></AnimatedPage>}
          {activePage === 'budget' && (
            <AnimatedPage key="budget">
              <Budget transactions={transactions} budgets={budgets} onAddBudget={addBudget} onUpdateBudget={updateBudget} onDeleteBudget={deleteBudget} t={t} fm={fm} selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
            </AnimatedPage>
          )}
          {activePage === 'assets' && (
            <AnimatedPage key="assets">
              <AssetsDebt assets={assets} debts={debts} onAddAsset={addAsset} onUpdateAsset={updateAsset} onDeleteAsset={deleteAsset} onAddDebt={addDebt} onUpdateDebt={updateDebt} onDeleteDebt={deleteDebt} t={t} fm={fm} />
            </AnimatedPage>
          )}
          {activePage === 'receivables' && (
            <AnimatedPage key="receivables">
              <Receivables receivables={receivables} onAddReceivable={addReceivable} onUpdateReceivable={updateReceivable} onDeleteReceivable={deleteReceivable} onMarkPayment={markReceivablePayment} t={t} fm={fm} />
            </AnimatedPage>
          )}
          {activePage === 'insight' && (
            <AnimatedPage key="insight">
              <Insight transactions={transactions} assets={assets} debts={debts} budgets={budgets} onNavigate={setActivePage} onQuickAdd={() => setIsQuickAddOpen(true)} t={t} fm={fm} selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
            </AnimatedPage>
          )}
          {activePage === 'settings' && (
            <AnimatedPage key="settings">
              <Settings userProfile={userProfile} setUserProfile={handleUpdateProfile} preferences={preferences} setPreferences={handleSetPreferences} notifications={notifications} setNotifications={handleSetNotifications} onLogout={handleLogout} onResetData={handleResetFinanceData} t={t} fm={fm} />
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

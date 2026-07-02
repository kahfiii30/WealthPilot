import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from '../utils/dateUtils';

function AssetsDebt({ 
  assets = [], 
  debts = [],
  receivables = [],
  transactions = [],
  onAddAsset, 
  onUpdateAsset, 
  onDeleteAsset, 
  onAddDebt, 
  onUpdateDebt, 
  onDeleteDebt,
  t,
  fm
}) {
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(() => {
    const flag = localStorage.getItem("openAssetModalOnLoad");
    if (flag === "true") {
      localStorage.removeItem("openAssetModalOnLoad");
      return true;
    }
    return false;
  });

  const [isDebtModalOpen, setIsDebtModalOpen] = useState(() => {
    const flag = localStorage.getItem("openDebtModalOnLoad");
    if (flag === "true") {
      localStorage.removeItem("openDebtModalOnLoad");
      return true;
    }
    return false;
  });

  const [editingItem, setEditingItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const totalAssets = assets.reduce((acc, a) => acc + (Number(a.amount) || 0), 0);
  const totalDebts = debts.reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
  
  const activeReceivables = (receivables || []).filter(r => r.status !== 'paid');
  const outstandingReceivables = activeReceivables.reduce((sum, r) => sum + (Number(r.remainingAmount) || 0), 0);
  
  const cashBalance = transactions.reduce((acc, t_item) => {
    if (t_item.type === 'income') return acc + Number(t_item.amount || 0);
    if (t_item.type === 'expense') return acc - Number(t_item.amount || 0);
    return acc;
  }, 0);

  const netWorth = cashBalance + totalAssets + outstandingReceivables - totalDebts;

  const assetCategories = ['Cash', 'Bank', 'E-Wallet', 'Crypto', 'Stocks', 'Business Inventory', 'Receivables', 'Others'];
  const debtCategories = ['Paylater', 'Installment', 'Loan', 'Credit Card', 'Personal Debt', 'Others'];

  const getAssetIcon = (cat) => {
    switch(cat) {
      case 'Cash': return 'payments';
      case 'Bank': return 'account_balance';
      case 'Crypto': return 'currency_bitcoin';
      case 'Stocks': return 'show_chart';
      case 'E-Wallet': return 'wallet';
      default: return 'account_balance_wallet';
    }
  };

  const getDebtIcon = (cat) => {
    switch(cat) {
      case 'Kartu Kredit': return 'credit_card';
      case 'Installment': return 'shopping_cart';
      case 'Paylater': return 'timer';
      default: return 'real_estate_agent';
    }
  };

  const handleEditAsset = (asset) => {
    setEditingItem(asset);
    setIsAssetModalOpen(true);
  };

  const handleEditDebt = (debt) => {
    setEditingItem(debt);
    setIsDebtModalOpen(true);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-[1600px] mx-auto p-4 md:p-8 2xl:p-12"
    >
      {/* Header / Summary Section */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6 2xl:gap-10 mb-10 2xl:mb-16">
        <div className="lg:col-span-2 rounded-3xl border border-slate-700/30 bg-gradient-to-br from-slate-900/80 via-slate-900/55 to-blue-950/30 p-10 2xl:p-14 flex flex-col justify-between overflow-hidden relative group shadow-2xl backdrop-blur-xl transition-colors duration-200 hover:border-emerald-400/30">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400/5 rounded-full blur-[120px] -mr-40 -mt-40 group-hover:bg-emerald-400/10 transition-colors duration-500"></div>
          <div className="relative z-10">
            <h2 className="text-[11px] 2xl:text-xs font-black uppercase tracking-[0.4em] text-slate-500 mb-6 2xl:mb-8 truncate block">Total Net Worth</h2>
            <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-4 mb-10 2xl:mb-14 min-w-0">
              <span className={`text-5xl md:text-6xl 2xl:text-8xl font-black tracking-tighter leading-none truncate ${netWorth >= 0 ? 'text-slate-100' : 'text-red-300'}`}>
                {fm(netWorth)}
              </span>
              <p className="text-xs 2xl:text-sm font-bold text-slate-500 uppercase tracking-widest mb-2 2xl:mb-3">Liquid + Portfolio</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 2xl:gap-6 mt-4 relative z-10">
            <div className="p-5 2xl:p-7 bg-emerald-400/10 rounded-2xl border border-emerald-400/20 backdrop-blur-md min-w-0">
              <p className="text-[10px] 2xl:text-xs font-black uppercase tracking-widest text-emerald-400/70 mb-2 truncate block">Cash Balance</p>
              <p className="text-xl 2xl:text-3xl font-black text-emerald-400 tracking-tight truncate">{fm(cashBalance)}</p>
            </div>
            <div className="p-5 2xl:p-7 bg-blue-400/10 rounded-2xl border border-blue-400/20 backdrop-blur-md min-w-0">
              <p className="text-[10px] 2xl:text-xs font-black uppercase tracking-widest text-blue-400/70 mb-2 truncate block">Portfolio Assets</p>
              <p className="text-xl 2xl:text-3xl font-black text-blue-400 tracking-tight truncate">{fm(totalAssets)}</p>
            </div>
            <div className="p-5 2xl:p-7 bg-red-400/10 rounded-2xl border border-red-500/20 backdrop-blur-md min-w-0">
              <p className="text-[10px] 2xl:text-xs font-black uppercase tracking-widest text-red-300/70 mb-2 truncate block">Total Liabilities</p>
              <p className="text-xl 2xl:text-3xl font-black text-red-300 tracking-tight truncate">{fm(totalDebts)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700/30 bg-slate-900/55 p-8 2xl:p-12 flex flex-col gap-8 2xl:gap-12 shadow-xl backdrop-blur-xl transition-colors duration-200 hover:border-emerald-400/30">
          <div>
            <h3 className="text-[10px] 2xl:text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-4 2xl:mb-6 truncate block">Asset Ratio</h3>
            <div className="flex items-center justify-between min-w-0">
              <span className="text-2xl 2xl:text-4xl font-black text-emerald-400 tracking-tight truncate mr-4 min-w-0">{fm(totalAssets)}</span>
              <span className="text-[10px] 2xl:text-sm font-black text-slate-400 tracking-widest shrink-0">
                {totalAssets + totalDebts > 0 ? ((totalAssets / (totalAssets + totalDebts)) * 100).toFixed(1) : 100}%
              </span>
            </div>
            <div className="w-full h-3 2xl:h-4 bg-slate-700/45 rounded-full mt-4 2xl:mt-6 overflow-hidden border border-slate-700/20 shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${totalAssets + totalDebts > 0 ? (totalAssets / (totalAssets + totalDebts)) * 100 : 100}%` }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_0_15px_rgba(74,222,128,0.3)]"
              ></motion.div>
            </div>
          </div>
          <div>
            <h3 className="text-[10px] 2xl:text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-4 2xl:mb-6 truncate block">Debt Exposure</h3>
            <div className="flex items-center justify-between min-w-0">
              <span className="text-2xl 2xl:text-4xl font-black text-red-300 tracking-tight truncate mr-4 min-w-0">{fm(totalDebts)}</span>
              <span className="text-[10px] 2xl:text-sm font-black text-slate-400 tracking-widest shrink-0">
                {totalAssets + totalDebts > 0 ? ((totalDebts / (totalAssets + totalDebts)) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="w-full h-3 2xl:h-4 bg-slate-700/45 rounded-full mt-4 2xl:mt-6 overflow-hidden border border-slate-700/20 shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${totalAssets + totalDebts > 0 ? (totalDebts / (totalAssets + totalDebts)) * 100 : 0}%` }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="h-full bg-gradient-to-r from-red-400 to-red-500 shadow-[0_0_15px_rgba(248,113,113,0.3)]"
              ></motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bento Grid: Assets vs Liabilities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 2xl:gap-12">
        {/* Assets Section */}
        <motion.section variants={item} className="space-y-6 2xl:space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl 2xl:text-4xl font-black text-emerald-400 tracking-tight flex items-center gap-3">
              <span className="material-symbols-outlined font-bold 2xl:text-3xl">account_balance_wallet</span>
              Assets Portfolio
            </h3>
            <button 
              onClick={() => { setEditingItem(null); setIsAssetModalOpen(true); }}
              className="bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 hover:bg-emerald-400/20 px-4 py-2 rounded-xl font-bold text-sm transition-colors duration-200 flex items-center gap-2"
            >
              <span className="material-symbols-outlined font-bold text-[18px]">add</span>
              {t('addAsset')}
            </button>
          </div>
          <div className="space-y-4">
            {assets.length === 0 ? (
              <EmptyState 
                title="No assets listed" 
                desc="Start tracking your wealth by adding your first asset today." 
                icon="account_balance" 
                colorClass="text-emerald-400"
              />
            ) : (
              assets.map((asset, i) => (
                <motion.div 
                  key={asset.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + (i * 0.05) }}
                  className="rounded-2xl border border-slate-700/30 bg-slate-900/55 p-5 2xl:p-7 flex items-center justify-between group hover:border-emerald-400/50 hover:bg-slate-900/70 transition-colors duration-200 shadow-lg"
                >
                  <div className="flex items-center gap-5 2xl:gap-6">
                    <div className="w-11 h-11 2xl:w-14 2xl:h-14 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400 transition-colors duration-200">
                      <span className="material-symbols-outlined font-bold 2xl:text-[24px]">{getAssetIcon(asset.category)}</span>
                    </div>
                    <div>
                      <h4 className="font-bold 2xl:text-xl text-slate-100 group-hover:text-emerald-400 transition-colors tracking-tight">{asset.name}</h4>
                      <p className="text-[10px] 2xl:text-xs font-black text-slate-500 uppercase tracking-[0.2em]">{asset.category} • {asset.note || 'No notes'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 2xl:gap-8">
                    <div className="text-right">
                      <p className="text-lg 2xl:text-2xl font-black text-emerald-400 tracking-tighter">{fm(asset.amount)}</p>
                      <p className="text-[10px] 2xl:text-xs font-black text-slate-500 uppercase tracking-widest">Updated {formatDate(asset.updatedAt)}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <button onClick={() => handleEditAsset(asset)} className="p-2 2xl:p-3 text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-xl transition-colors">
                        <span className="material-symbols-outlined font-bold text-[18px] 2xl:text-[22px]">edit</span>
                      </button>
                      <button onClick={() => onDeleteAsset(asset.id)} className="p-2 2xl:p-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors">
                        <span className="material-symbols-outlined font-bold text-[18px] 2xl:text-[22px]">delete</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.section>

        {/* Debt Section */}
        <motion.section variants={item} className="space-y-6 2xl:space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl 2xl:text-4xl font-black text-red-300 tracking-tight flex items-center gap-3">
              <span className="material-symbols-outlined font-bold 2xl:text-3xl">credit_card_off</span>
              Total Liabilities
            </h3>
            <button 
              onClick={() => { setEditingItem(null); setIsDebtModalOpen(true); }}
              className="bg-red-400/10 text-red-300 border border-red-500/20 hover:bg-red-400/20 px-4 py-2 rounded-xl font-bold text-sm transition-colors duration-200 flex items-center gap-2"
            >
              <span className="material-symbols-outlined font-bold text-[18px]">add</span>
              {t('addDebt')}
            </button>
          </div>
          <div className="space-y-4">
            {debts.length === 0 ? (
              <EmptyState 
                title="No liabilities listed" 
                desc="Good job! You currently have no debts to track." 
                icon="credit_card_off" 
                colorClass="text-red-300"
              />
            ) : (
              debts.map((debt, i) => (
                <motion.div 
                  key={debt.id} 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + (i * 0.05) }}
                  className="rounded-2xl border border-slate-700/30 bg-slate-900/55 p-5 2xl:p-7 flex items-center justify-between group hover:border-red-400/50 hover:bg-slate-900/70 transition-colors duration-200 shadow-lg border-l-4 border-l-red-400"
                >
                  <div className="flex items-center gap-5 2xl:gap-6">
                    <div className="w-11 h-11 2xl:w-14 2xl:h-14 rounded-xl bg-red-400/10 border border-red-500/20 flex items-center justify-center text-red-300 transition-colors duration-200">
                      <span className="material-symbols-outlined font-bold 2xl:text-[24px]">{getDebtIcon(debt.category)}</span>
                    </div>
                    <div>
                      <h4 className="font-bold 2xl:text-xl text-slate-100 group-hover:text-red-300 transition-colors tracking-tight">{debt.name}</h4>
                      <p className="text-[10px] 2xl:text-xs font-black text-slate-500 uppercase tracking-[0.2em]">{debt.category} • Due: {formatDate(debt.dueDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 2xl:gap-8">
                    <div className="text-right">
                      <p className="text-lg 2xl:text-2xl font-black text-red-300 tracking-tighter">{fm(debt.amount)}</p>
                      <p className="text-[10px] 2xl:text-xs font-black text-slate-500 uppercase tracking-widest">Updated {formatDate(debt.updatedAt)}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <button onClick={() => handleEditDebt(debt)} className="p-2 2xl:p-3 text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-xl transition-colors">
                        <span className="material-symbols-outlined font-bold text-[18px] 2xl:text-[22px]">edit</span>
                      </button>
                      <button onClick={() => onDeleteDebt(debt.id)} className="p-2 2xl:p-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors">
                        <span className="material-symbols-outlined font-bold text-[18px] 2xl:text-[22px]">delete</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.section>
      </div>

      {/* Asset Modal */}
      <Modal 
        isOpen={isAssetModalOpen} 
        onClose={() => setIsAssetModalOpen(false)} 
        title={editingItem ? t('edit') + ' ' + t('assets') : t('addAsset')}
        t={t}
      >
        <AssetForm 
          initialData={editingItem} 
          categories={assetCategories} 
          onSave={async (data) => {
            try {
              setIsSaving(true);
              setError(null);
              if (editingItem) await onUpdateAsset(editingItem.id, data);
              else await onAddAsset(data);
              setIsAssetModalOpen(false);
            } catch (err) {
              console.error("Failed to save asset:", err);
              setError(err.message || "Failed to save asset");
            } finally {
              setIsSaving(false);
            }
          }} 
          onCancel={() => { setIsAssetModalOpen(false); setError(null); }}
          t={t}
          isSaving={isSaving}
          error={error}
        />
      </Modal>

      {/* Debt Modal */}
      <Modal 
        isOpen={isDebtModalOpen} 
        onClose={() => setIsDebtModalOpen(false)} 
        title={editingItem ? t('edit') + ' ' + t('debts') : t('addDebt')}
        t={t}
      >
        <DebtForm 
          initialData={editingItem} 
          categories={debtCategories} 
          onSave={async (data) => {
            try {
              setIsSaving(true);
              setError(null);
              if (editingItem) await onUpdateDebt(editingItem.id, data);
              else await onAddDebt(data);
              setIsDebtModalOpen(false);
            } catch (err) {
              console.error("Failed to save liability:", err);
              setError(err.message || "Failed to save liability");
            } finally {
              setIsSaving(false);
            }
          }} 
          onCancel={() => { setIsDebtModalOpen(false); setError(null); }}
          t={t}
          isSaving={isSaving}
          error={error}
        />
      </Modal>
    </motion.div>
  );
}

const EmptyState = ({ title, desc, icon, colorClass }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 px-6 glass-card rounded-2xl border-dashed border-2 border-outline-variant/30 text-center"
  >
    <div className={`w-14 h-14 bg-surface-container-highest rounded-full flex items-center justify-center mb-md border border-outline-variant/20 shadow-inner`}>
      <span className={`material-symbols-outlined ${colorClass} text-[28px] opacity-50`}>{icon}</span>
    </div>
    <h3 className="text-on-surface font-headline-lg text-lg mb-2">{title}</h3>
    <p className="text-on-surface-variant text-sm max-w-[240px] opacity-70">
      {desc}
    </p>
  </motion.div>
);

// Sub-components for better organization
function Modal({ isOpen, onClose, title, children, t }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={onClose}></div>
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-[201] w-full max-w-[560px] min-w-[320px] max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-700/30 bg-slate-900/95 p-8 shadow-2xl backdrop-blur-xl no-scrollbar"
            style={{
              width: "100%",
              maxWidth: "560px",
              minWidth: "320px"
            }}
          >
            <div className="mb-8 flex items-start justify-between gap-4">
              <h2 className="text-3xl font-black text-slate-100 tracking-tight whitespace-normal">{title}</h2>
              <button 
                onClick={onClose} 
                className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined font-bold text-[24px]">close</span>
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function AssetForm({ initialData, categories, onSave, onCancel, t, isSaving, error }) {
  const [formData, setFormData] = useState(initialData || { name: '', category: categories[0], amount: '', note: '' });
  return (
    <form className="w-full space-y-6" onSubmit={(e) => { e.preventDefault(); onSave({ ...formData, amount: parseFloat(formData.amount) }); }}>
      {error && (
        <div className="mb-6 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex items-center gap-3">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {error}
        </div>
      )}
      <div className="w-full space-y-2">
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400 ml-1">{t('note')} ({t('assets')})</label>
        <input 
          required 
          className="block h-12 w-full min-w-0 rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/10 font-bold" 
          value={formData.name} 
          onChange={e => setFormData({...formData, name: e.target.value})} 
          placeholder="e.g. Bank Account" 
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="w-full space-y-2">
          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400 ml-1">{t('category')}</label>
          <select 
            className="block h-12 w-full min-w-0 rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 text-slate-100 outline-none transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/10 appearance-none cursor-pointer font-bold" 
            value={formData.category} 
            onChange={e => setFormData({...formData, category: e.target.value})}
          >
            {categories.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
          </select>
        </div>
        <div className="w-full space-y-2">
          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400 ml-1">{t('amount')}</label>
          <input 
            required 
            type="number" 
            className="block h-12 w-full min-w-0 rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/10 font-black" 
            value={formData.amount} 
            onChange={e => setFormData({...formData, amount: e.target.value})} 
            placeholder="0" 
          />
        </div>
      </div>
      <div className="w-full space-y-2">
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400 ml-1">{t('note')} (Optional)</label>
        <textarea 
          className="block min-h-[110px] w-full min-w-0 resize-none rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/10" 
          value={formData.note} 
          onChange={e => setFormData({...formData, note: e.target.value})} 
          placeholder="Description..." 
        />
      </div>
      <div className="mt-8 flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button 
          type="button" 
          onClick={onCancel} 
          className="h-12 w-full rounded-xl border border-slate-700/50 px-5 font-semibold text-slate-300 transition hover:bg-slate-800 sm:w-auto"
        >
          {t('cancel')}
        </button>
        <button 
          type="submit" 
          disabled={isSaving}
          className={`h-12 w-full rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 px-8 font-bold text-slate-950 shadow-[0_0_30px_rgba(74,222,128,0.20)] transition hover:from-emerald-300 hover:to-emerald-400 sm:w-auto flex items-center justify-center gap-2 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <span className="material-symbols-outlined font-bold">save</span>
          )}
          {t('save')}
        </button>
      </div>
    </form>
  );
}

function DebtForm({ initialData, categories, onSave, onCancel, t, isSaving, error }) {
  const [formData, setFormData] = useState(initialData || { name: '', category: categories[0], amount: '', dueDate: '', note: '' });
  return (
    <form className="w-full space-y-6" onSubmit={(e) => { e.preventDefault(); onSave({ ...formData, amount: parseFloat(formData.amount) }); }}>
      {error && (
        <div className="mb-6 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex items-center gap-3">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {error}
        </div>
      )}
      <div className="w-full space-y-2">
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400 ml-1">{t('note')} ({t('debts')})</label>
        <input 
          required 
          className="block h-12 w-full min-w-0 rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/10 font-bold" 
          value={formData.name} 
          onChange={e => setFormData({...formData, name: e.target.value})} 
          placeholder="e.g. Credit Card" 
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="w-full space-y-2">
          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400 ml-1">{t('category')}</label>
          <select 
            className="block h-12 w-full min-w-0 rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 text-slate-100 outline-none transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/10 appearance-none cursor-pointer font-bold" 
            value={formData.category} 
            onChange={e => setFormData({...formData, category: e.target.value})}
          >
            {categories.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
          </select>
        </div>
        <div className="w-full space-y-2">
          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400 ml-1">{t('amount')}</label>
          <input 
            required 
            type="number" 
            className="block h-12 w-full min-w-0 rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/10 font-black" 
            value={formData.amount} 
            onChange={e => setFormData({...formData, amount: e.target.value})} 
            placeholder="0" 
          />
        </div>
      </div>
      <div className="w-full space-y-2">
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400 ml-1">{t('date')}</label>
        <input 
          required 
          type="date" 
          className="block h-12 w-full min-w-0 rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 text-slate-100 outline-none transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/10 cursor-pointer [color-scheme:dark] font-bold" 
          value={formData.dueDate} 
          onChange={e => setFormData({...formData, dueDate: e.target.value})} 
        />
      </div>
      <div className="w-full space-y-2">
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400 ml-1">{t('note')} (Optional)</label>
        <textarea 
          className="block min-h-[110px] w-full min-w-0 resize-none rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/10" 
          value={formData.note} 
          onChange={e => setFormData({...formData, note: e.target.value})} 
          placeholder="Description..." 
        />
      </div>
      <div className="mt-8 flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button 
          type="button" 
          onClick={onCancel} 
          className="h-12 w-full rounded-xl border border-slate-700/50 px-5 font-semibold text-slate-300 transition hover:bg-slate-800 sm:w-auto"
        >
          {t('cancel')}
        </button>
        <button 
          type="submit" 
          disabled={isSaving}
          className={`h-12 w-full rounded-xl bg-gradient-to-r from-red-400 to-red-500 px-8 font-bold text-slate-950 shadow-[0_0_30px_rgba(248,113,113,0.20)] transition hover:from-red-300 hover:to-red-400 sm:w-auto flex items-center justify-center gap-2 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <span className="material-symbols-outlined font-bold">save</span>
          )}
          {t('save')}
        </button>
      </div>
    </form>
  );
}

export default AssetsDebt;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function AssetsDebt({ 
  assets = [], 
  debts = [], 
  onAddAsset, 
  onUpdateAsset, 
  onDeleteAsset, 
  onAddDebt, 
  onUpdateDebt, 
  onDeleteDebt,
  t,
  fm
}) {
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const totalAssets = assets.reduce((acc, a) => acc + a.amount, 0);
  const totalDebts = debts.reduce((acc, d) => acc + d.amount, 0);
  const netWorth = totalAssets - totalDebts;

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

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-[1400px] mx-auto p-8"
    >
      {/* Header / Summary Section */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 rounded-2xl border border-slate-700/30 bg-gradient-to-br from-slate-900/80 via-slate-900/55 to-blue-950/30 p-8 flex flex-col justify-between overflow-hidden relative group shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-emerald-400/30">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
          <div className="relative z-10">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4">{t('totalNetWorth')} (Portfolio)</h2>
            <div className="flex items-end gap-3 mb-8">
              <span className={`text-6xl font-black tracking-tighter ${netWorth >= 0 ? 'text-slate-100' : 'text-red-300'}`}>
                {fm(netWorth)}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4 relative z-10">
            <div className="p-4 bg-emerald-400/10 rounded-2xl border border-emerald-400/20">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400/70 mb-2">{t('assets')}</p>
              <p className="text-xl font-black text-emerald-400 tracking-tight">{fm(totalAssets)}</p>
            </div>
            <div className="p-4 bg-red-400/10 rounded-2xl border border-red-500/20">
              <p className="text-[10px] font-black uppercase tracking-widest text-red-300/70 mb-2">{t('debts')}</p>
              <p className="text-xl font-black text-red-300 tracking-tight">{fm(totalDebts)}</p>
            </div>
            <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/30">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Debt-to-Asset</p>
              <p className="text-xl font-black text-slate-100 tracking-tight">{totalAssets > 0 ? ((totalDebts / totalAssets) * 100).toFixed(1) : 0}%</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700/30 bg-slate-900/55 p-8 flex flex-col gap-8 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-emerald-400/30">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4">Asset Ratio</h3>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-emerald-400 tracking-tight truncate mr-4">{fm(totalAssets)}</span>
              <span className="text-[10px] font-black text-slate-400 tracking-widest shrink-0">
                {totalAssets + totalDebts > 0 ? ((totalAssets / (totalAssets + totalDebts)) * 100).toFixed(1) : 100}%
              </span>
            </div>
            <div className="w-full h-3 bg-slate-700/45 rounded-full mt-4 overflow-hidden border border-slate-700/20 shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${totalAssets + totalDebts > 0 ? (totalAssets / (totalAssets + totalDebts)) * 100 : 100}%` }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_0_15px_rgba(74,222,128,0.3)]"
              ></motion.div>
            </div>
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4">Debt Exposure</h3>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-red-300 tracking-tight truncate mr-4">{fm(totalDebts)}</span>
              <span className="text-[10px] font-black text-slate-400 tracking-widest shrink-0">
                {totalAssets + totalDebts > 0 ? ((totalDebts / (totalAssets + totalDebts)) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="w-full h-3 bg-slate-700/45 rounded-full mt-4 overflow-hidden border border-slate-700/20 shadow-inner">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Assets Section */}
        <motion.section variants={item} className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-emerald-400 tracking-tight flex items-center gap-3">
              <span className="material-symbols-outlined font-bold">account_balance_wallet</span>
              Assets Portfolio
            </h3>
            <button 
              onClick={() => { setEditingItem(null); setIsAssetModalOpen(true); }}
              className="bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 hover:bg-emerald-400/20 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2"
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
                  className="rounded-2xl border border-slate-700/30 bg-slate-900/55 p-5 flex items-center justify-between group hover:border-emerald-400/50 hover:bg-slate-900/70 transition-all duration-300 shadow-lg hover:translate-y-[-2px]"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-11 h-11 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                      <span className="material-symbols-outlined font-bold">{getAssetIcon(asset.category)}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-100 group-hover:text-emerald-400 transition-colors tracking-tight">{asset.name}</h4>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{asset.category} • {asset.note || 'No notes'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-lg font-black text-emerald-400 tracking-tighter">{fm(asset.amount)}</p>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Updated {new Date(asset.updatedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <button onClick={() => handleEditAsset(asset)} className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-xl transition-all">
                        <span className="material-symbols-outlined font-bold text-[18px]">edit</span>
                      </button>
                      <button onClick={() => onDeleteAsset(asset.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all">
                        <span className="material-symbols-outlined font-bold text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.section>

        {/* Debt Section */}
        <motion.section variants={item} className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-red-300 tracking-tight flex items-center gap-3">
              <span className="material-symbols-outlined font-bold">credit_card_off</span>
              Total Liabilities
            </h3>
            <button 
              onClick={() => { setEditingItem(null); setIsDebtModalOpen(true); }}
              className="bg-red-400/10 text-red-300 border border-red-500/20 hover:bg-red-400/20 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2"
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
                  className="rounded-2xl border border-slate-700/30 bg-slate-900/55 p-5 flex items-center justify-between group hover:border-red-400/50 hover:bg-slate-900/70 transition-all duration-300 shadow-lg hover:translate-y-[-2px] border-l-4 border-l-red-400"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-11 h-11 rounded-xl bg-red-400/10 border border-red-500/20 flex items-center justify-center text-red-300 group-hover:scale-110 transition-transform duration-300">
                      <span className="material-symbols-outlined font-bold">{getDebtIcon(debt.category)}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-100 group-hover:text-red-300 transition-colors tracking-tight">{debt.name}</h4>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{debt.category} • Due: {debt.dueDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-lg font-black text-red-300 tracking-tighter">{fm(debt.amount)}</p>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Updated {new Date(debt.updatedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <button onClick={() => handleEditDebt(debt)} className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-xl transition-all">
                        <span className="material-symbols-outlined font-bold text-[18px]">edit</span>
                      </button>
                      <button onClick={() => onDeleteDebt(debt.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all">
                        <span className="material-symbols-outlined font-bold text-[18px]">delete</span>
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
          onSave={(data) => {
            if (editingItem) onUpdateAsset(editingItem.id, data);
            else onAddAsset(data);
            setIsAssetModalOpen(false);
          }} 
          onCancel={() => setIsAssetModalOpen(false)}
          t={t}
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
          onSave={(data) => {
            if (editingItem) onUpdateDebt(editingItem.id, data);
            else onAddDebt(data);
            setIsDebtModalOpen(false);
          }} 
          onCancel={() => setIsDebtModalOpen(false)}
          t={t}
        />
      </Modal>
    </motion.div>
  );
}

// Sub-components for better organization
function Modal({ isOpen, onClose, title, children, t }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" 
            onClick={onClose}
          ></motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-[101] w-full max-w-md rounded-3xl border border-slate-700/50 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl overflow-hidden"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-100 tracking-tight">{title}</h2>
              <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-800 transition-colors cursor-pointer text-slate-400">
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

function AssetForm({ initialData, categories, onSave, onCancel, t }) {
  const [formData, setFormData] = useState(initialData || { name: '', category: categories[0], amount: '', note: '' });
  return (
    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onSave({ ...formData, amount: parseFloat(formData.amount) }); }}>
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">{t('note')} ({t('assets')})</label>
        <input required className="w-full h-12 bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 text-slate-100 outline-none focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/10 transition-all font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Bank Account" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">{t('category')}</label>
          <select className="w-full h-12 bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 text-slate-100 outline-none focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/10 transition-all appearance-none cursor-pointer" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
            {categories.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">{t('amount')}</label>
          <input required type="number" className="w-full h-12 bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 text-slate-100 outline-none focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/10 transition-all font-black" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="0" />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">{t('note')} (Optional)</label>
        <textarea className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-100 outline-none focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/10 transition-all resize-none h-24 text-sm" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} placeholder="Description..." />
      </div>
      <div className="flex gap-4 pt-4">
        <button type="button" onClick={onCancel} className="flex-1 h-12 text-slate-400 border border-slate-700/50 hover:bg-slate-800 rounded-xl font-bold transition-all">{t('cancel')}</button>
        <button type="submit" className="flex-[2] h-12 bg-gradient-to-r from-emerald-400 to-emerald-500 text-slate-950 rounded-xl font-black flex items-center justify-center gap-2 hover:from-emerald-300 hover:to-emerald-400 transition-all shadow-[0_0_20px_rgba(74,222,128,0.2)]">
          <span className="material-symbols-outlined font-bold">save</span>
          {t('save')}
        </button>
      </div>
    </form>
  );
}

function DebtForm({ initialData, categories, onSave, onCancel, t }) {
  const [formData, setFormData] = useState(initialData || { name: '', category: categories[0], amount: '', dueDate: '', note: '' });
  return (
    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onSave({ ...formData, amount: parseFloat(formData.amount) }); }}>
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">{t('note')} ({t('debts')})</label>
        <input required className="w-full h-12 bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 text-slate-100 outline-none focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/10 transition-all font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Credit Card" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">{t('category')}</label>
          <select className="w-full h-12 bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 text-slate-100 outline-none focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/10 transition-all appearance-none cursor-pointer" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
            {categories.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">{t('amount')}</label>
          <input required type="number" className="w-full h-12 bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 text-slate-100 outline-none focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/10 transition-all font-black" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="0" />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">{t('date')}</label>
        <input required type="date" className="w-full h-12 bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 text-slate-100 outline-none focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/10 transition-all cursor-pointer [color-scheme:dark] font-bold" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">{t('note')} (Optional)</label>
        <textarea className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-100 outline-none focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/10 transition-all resize-none h-24 text-sm" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} placeholder="Description..." />
      </div>
      <div className="flex gap-4 pt-4">
        <button type="button" onClick={onCancel} className="flex-1 h-12 text-slate-400 border border-slate-700/50 hover:bg-slate-800 rounded-xl font-bold transition-all">{t('cancel')}</button>
        <button type="submit" className="flex-[2] h-12 bg-gradient-to-r from-red-400 to-red-500 text-slate-950 rounded-xl font-black flex items-center justify-center gap-2 hover:from-red-300 hover:to-red-400 transition-all shadow-[0_0_20px_rgba(248,113,113,0.2)]">
          <span className="material-symbols-outlined font-bold">save</span>
          {t('save')}
        </button>
      </div>
    </form>
  );
}

export default AssetsDebt;

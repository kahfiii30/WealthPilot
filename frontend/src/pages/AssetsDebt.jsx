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
      className="max-w-[1400px] mx-auto p-lg"
    >
      {/* Header / Summary Section */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-lg mb-lg">
        <div className="lg:col-span-2 glass-card p-lg rounded-xl flex flex-col justify-between overflow-hidden relative group shadow-lg border border-outline-variant/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div>
            <h2 className="text-on-surface-variant font-label-md text-label-md mb-2">{t('totalNetWorth')} (Portfolio)</h2>
            <div className="flex items-end gap-3 mb-6">
              <span className={`font-display-sm text-display-sm font-bold ${netWorth >= 0 ? 'text-primary' : 'text-error'}`}>
                {fm(netWorth)}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
              <p className="text-[10px] uppercase text-on-surface-variant mb-1">{t('assets')}</p>
              <p className="font-bold text-primary">{fm(totalAssets)}</p>
            </div>
            <div className="p-3 bg-error/5 rounded-lg border border-error/10">
              <p className="text-[10px] uppercase text-on-surface-variant mb-1">{t('debts')}</p>
              <p className="font-bold text-error">{fm(totalDebts)}</p>
            </div>
            <div className="p-3 bg-surface-container rounded-lg border border-outline-variant/10">
              <p className="text-[10px] uppercase text-on-surface-variant mb-1">Debt-to-Asset</p>
              <p className="font-bold text-on-surface">{totalAssets > 0 ? ((totalDebts / totalAssets) * 100).toFixed(1) : 0}%</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-lg rounded-xl flex flex-col gap-6 shadow-lg border border-outline-variant/20">
          <div>
            <h3 className="text-on-surface-variant font-label-md text-label-md mb-2 uppercase tracking-widest">Asset Ratio</h3>
            <div className="flex items-center justify-between">
              <span className="font-headline-lg text-headline-lg font-bold text-primary truncate mr-2">{fm(totalAssets)}</span>
              <span className="text-on-surface-variant font-mono-data text-mono-data text-xs shrink-0">
                {totalAssets + totalDebts > 0 ? ((totalAssets / (totalAssets + totalDebts)) * 100).toFixed(1) : 100}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-surface-container rounded-full mt-3 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${totalAssets + totalDebts > 0 ? (totalAssets / (totalAssets + totalDebts)) * 100 : 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-primary"
              ></motion.div>
            </div>
          </div>
          <div>
            <h3 className="text-on-surface-variant font-label-md text-label-md mb-2 uppercase tracking-widest">Debt Exposure</h3>
            <div className="flex items-center justify-between">
              <span className="font-headline-lg text-headline-lg font-bold text-error truncate mr-2">{fm(totalDebts)}</span>
              <span className="text-on-surface-variant font-mono-data text-mono-data text-xs shrink-0">
                {totalAssets + totalDebts > 0 ? ((totalDebts / (totalAssets + totalDebts)) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-surface-container rounded-full mt-3 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${totalAssets + totalDebts > 0 ? (totalDebts / (totalAssets + totalDebts)) * 100 : 0}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-error"
              ></motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bento Grid: Assets vs Liabilities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        {/* Assets Section */}
        <motion.section variants={item} className="space-y-md">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-lg text-headline-lg text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">account_balance_wallet</span>
              Assets Portfolio
            </h3>
            <button 
              onClick={() => { setEditingItem(null); setIsAssetModalOpen(true); }}
              className="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-lg font-bold text-sm transition-all cursor-pointer flex items-center gap-2 premium-button-active"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              {t('addAsset')}
            </button>
          </div>
          <div className="space-y-sm">
            {assets.length === 0 ? (
              <EmptyState 
                title="No assets listed" 
                desc="Start tracking your wealth by adding your first asset today." 
                icon="account_balance" 
                colorClass="text-primary"
              />
            ) : (
              assets.map((asset, i) => (
                <motion.div 
                  key={asset.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + (i * 0.05) }}
                  className="glass-card p-md rounded-xl flex items-center justify-between group hover:border-primary/50 transition-all border border-outline-variant/10 hover:shadow-lg hover:translate-y-[-2px]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined">{getAssetIcon(asset.category)}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors">{asset.name}</h4>
                      <p className="text-on-surface-variant text-[11px] uppercase tracking-wider">{asset.category} • {asset.note || 'No notes'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-mono-data text-mono-data font-bold text-primary">{fm(asset.amount)}</p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Updated {new Date(asset.updatedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditAsset(asset)} className="p-1.5 hover:bg-primary/10 text-primary rounded-lg transition-colors cursor-pointer premium-button-active">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button onClick={() => onDeleteAsset(asset.id)} className="p-1.5 hover:bg-error/10 text-error rounded-lg transition-colors cursor-pointer premium-button-active">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.section>

        {/* Debt Section */}
        <motion.section variants={item} className="space-y-md">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-lg text-headline-lg text-error flex items-center gap-2">
              <span className="material-symbols-outlined">credit_card_off</span>
              Total Liabilities
            </h3>
            <button 
              onClick={() => { setEditingItem(null); setIsDebtModalOpen(true); }}
              className="bg-error/10 text-error hover:bg-error/20 px-4 py-2 rounded-lg font-bold text-sm transition-all cursor-pointer flex items-center gap-2 premium-button-active"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              {t('addDebt')}
            </button>
          </div>
          <div className="space-y-sm">
            {debts.length === 0 ? (
              <EmptyState 
                title="No liabilities listed" 
                desc="Good job! You currently have no debts to track." 
                icon="credit_card_off" 
                colorClass="text-error"
              />
            ) : (
              debts.map((debt, i) => (
                <motion.div 
                  key={debt.id} 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + (i * 0.05) }}
                  className="glass-card p-md rounded-xl border-l-4 border-l-error flex items-center justify-between group hover:border-error/50 transition-all border border-outline-variant/10 hover:shadow-lg hover:translate-y-[-2px]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center text-error group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined">{getDebtIcon(debt.category)}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface group-hover:text-error transition-colors">{debt.name}</h4>
                      <p className="text-on-surface-variant text-[11px] uppercase tracking-wider">{debt.category} • Due: {debt.dueDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-mono-data text-mono-data font-bold text-error">{fm(debt.amount)}</p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Updated {new Date(debt.updatedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditDebt(debt)} className="p-1.5 hover:bg-primary/10 text-primary rounded-lg transition-colors cursor-pointer premium-button-active">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button onClick={() => onDeleteDebt(debt.id)} className="p-1.5 hover:bg-error/10 text-error rounded-lg transition-colors cursor-pointer premium-button-active">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
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
            className="absolute inset-0 bg-background/80 backdrop-blur-md" 
            onClick={onClose}
          ></motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="asset-modal relative z-[101] shadow-2xl overflow-hidden"
          >
            <div className="asset-modal-header border-b border-outline-variant/30 pb-4 mb-6">
              <h2 className="text-2xl font-bold">{title}</h2>
              <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors cursor-pointer text-on-surface-variant">
                <span className="material-symbols-outlined text-[24px]">close</span>
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
    <form className="asset-form space-y-5" onSubmit={(e) => { e.preventDefault(); onSave({ ...formData, amount: parseFloat(formData.amount) }); }}>
      <div className="asset-field focus-ring">
        <label className="text-on-surface-variant text-sm font-medium mb-1 block">{t('note')} ({t('assets')})</label>
        <input required className="w-full h-12 bg-surface-container-lowest border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 text-on-surface outline-none transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Bank Account" />
      </div>
      <div className="asset-field focus-ring">
        <label className="text-on-surface-variant text-sm font-medium mb-1 block">{t('category')}</label>
        <select className="w-full h-12 bg-surface-container-lowest border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 text-on-surface outline-none transition-all cursor-pointer" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="asset-field focus-ring">
        <label className="text-on-surface-variant text-sm font-medium mb-1 block">{t('amount')}</label>
        <input required type="number" className="w-full h-12 bg-surface-container-lowest border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 text-on-surface outline-none transition-all" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="0" />
      </div>
      <div className="asset-field focus-ring">
        <label className="text-on-surface-variant text-sm font-medium mb-1 block">{t('note')} (Optional)</label>
        <textarea className="w-full bg-surface-container-lowest border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-on-surface outline-none transition-all resize-none h-24" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} placeholder="Description..." />
      </div>
      <div className="asset-actions flex gap-4 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 h-12 text-on-surface-variant bg-surface-container hover:bg-surface-variant rounded-xl font-bold transition-all cursor-pointer">{t('cancel')}</button>
        <button type="submit" className="flex-[2] h-12 bg-primary text-background rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[0.98] active:scale-[0.95] transition-all cursor-pointer shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-[20px]">save</span>
          {t('save')}
        </button>
      </div>
    </form>
  );
}

function DebtForm({ initialData, categories, onSave, onCancel, t }) {
  const [formData, setFormData] = useState(initialData || { name: '', category: categories[0], amount: '', dueDate: '', note: '' });
  return (
    <form className="asset-form space-y-5" onSubmit={(e) => { e.preventDefault(); onSave({ ...formData, amount: parseFloat(formData.amount) }); }}>
      <div className="asset-field focus-ring">
        <label className="text-on-surface-variant text-sm font-medium mb-1 block">{t('note')} ({t('debts')})</label>
        <input required className="w-full h-12 bg-surface-container-lowest border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 text-on-surface outline-none transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Credit Card" />
      </div>
      <div className="asset-field focus-ring">
        <label className="text-on-surface-variant text-sm font-medium mb-1 block">{t('category')}</label>
        <select className="w-full h-12 bg-surface-container-lowest border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 text-on-surface outline-none transition-all cursor-pointer" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="asset-field focus-ring">
        <label className="text-on-surface-variant text-sm font-medium mb-1 block">{t('amount')}</label>
        <input required type="number" className="w-full h-12 bg-surface-container-lowest border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 text-on-surface outline-none transition-all" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="0" />
      </div>
      <div className="asset-field focus-ring">
        <label className="text-on-surface-variant text-sm font-medium mb-1 block">{t('date')}</label>
        <input required type="date" className="w-full h-12 bg-surface-container-lowest border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 text-on-surface outline-none transition-all cursor-pointer [color-scheme:dark]" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
      </div>
      <div className="asset-field focus-ring">
        <label className="text-on-surface-variant text-sm font-medium mb-1 block">{t('note')} (Optional)</label>
        <textarea className="w-full bg-surface-container-lowest border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-on-surface outline-none transition-all resize-none h-24" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} placeholder="Description..." />
      </div>
      <div className="asset-actions flex gap-4 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 h-12 text-on-surface-variant bg-surface-container hover:bg-surface-variant rounded-xl font-bold transition-all cursor-pointer">{t('cancel')}</button>
        <button type="submit" className="flex-[2] h-12 bg-error text-background rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[0.98] active:scale-[0.95] transition-all cursor-pointer shadow-lg shadow-error/20">
          <span className="material-symbols-outlined text-[20px]">save</span>
          {t('save')}
        </button>
      </div>
    </form>
  );
}

export default AssetsDebt;

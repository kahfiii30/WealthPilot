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
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
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

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } } };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-4 md:p-8 pb-[100px]">
      {/* Header / Summary Section */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
        <div className="lg:col-span-2 card-luxury rounded-3xl p-6 lg:p-10 flex flex-col justify-between">
          <div>
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Total Net Worth</h2>
            <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-4 mb-8">
              <span className={`text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-none truncate title-luxury ${netWorth >= 0 ? 'text-slate-100' : 'text-red-400'}`}>
                {fm(netWorth)}
              </span>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Liquid + Portfolio</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
            <div className="p-4 bg-white/[0.03] rounded-lg border border-white/5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-primary mb-1">Cash Balance</p>
              <p className="text-xl font-bold text-primary tracking-tight truncate">{fm(cashBalance)}</p>
            </div>
            <div className="p-4 bg-white/[0.03] rounded-lg border border-white/5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-400 mb-1">Portfolio Assets</p>
              <p className="text-xl font-bold text-blue-400 tracking-tight truncate">{fm(totalAssets)}</p>
            </div>
            <div className="p-4 bg-white/[0.03] rounded-lg border border-white/5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-red-400 mb-1">Total Liabilities</p>
              <p className="text-xl font-bold text-red-400 tracking-tight truncate">{fm(totalDebts)}</p>
            </div>
          </div>
        </div>

        <div className="card-luxury rounded-3xl p-6 lg:p-8 flex flex-col justify-center gap-8">
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3">Asset Ratio</h3>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-primary tracking-tight truncate pr-4">{fm(totalAssets)}</span>
              <span className="text-xs font-semibold text-slate-400">
                {totalAssets + totalDebts > 0 ? ((totalAssets / (totalAssets + totalDebts)) * 100).toFixed(1) : 100}%
              </span>
            </div>
            <div className="w-full h-2 bg-white/[0.03] rounded-full mt-3 overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${totalAssets + totalDebts > 0 ? (totalAssets / (totalAssets + totalDebts)) * 100 : 100}%` }}
                className="h-full bg-primary"
              ></motion.div>
            </div>
          </div>
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3">Debt Exposure</h3>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-red-400 tracking-tight truncate pr-4">{fm(totalDebts)}</span>
              <span className="text-xs font-semibold text-slate-400">
                {totalAssets + totalDebts > 0 ? ((totalDebts / (totalAssets + totalDebts)) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="w-full h-2 bg-white/[0.03] rounded-full mt-3 overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${totalAssets + totalDebts > 0 ? (totalDebts / (totalAssets + totalDebts)) * 100 : 0}%` }}
                className="h-full bg-red-500"
              ></motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bento Grid: Assets vs Liabilities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Assets Section */}
        <motion.section variants={item} className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-slate-100 tracking-tight title-luxury flex items-center gap-2">
              <span className="material-symbols-outlined text-[24px]">account_balance_wallet</span>
              Assets Portfolio
            </h3>
            <button 
              onClick={() => { setEditingItem(null); setIsAssetModalOpen(true); }}
              className="text-[11px] font-semibold uppercase tracking-wider text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              {t('addAsset')}
            </button>
          </div>
          <div className="space-y-3">
            {assets.length === 0 ? (
              <EmptyState 
                title="No assets listed" 
                desc="Start tracking your wealth by adding your first asset today." 
                icon="account_balance" 
              />
            ) : (
              assets.map((asset, i) => (
                <motion.div 
                  key={asset.id} 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="card-luxury rounded-2xl p-4 flex items-center justify-between group transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined font-medium text-[20px]">{getAssetIcon(asset.category)}</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-slate-100 group-hover:text-primary transition-colors text-sm truncate">{asset.name}</h4>
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5 truncate">{asset.category} • {asset.note || 'No notes'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pl-4 shrink-0">
                    <div className="text-right">
                      <p className="text-base font-bold text-primary">{fm(asset.amount)}</p>
                      <p className="text-[10px] font-medium text-slate-500">Updated {formatDate(asset.updatedAt)}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-1">
                      <button onClick={() => handleEditAsset(asset)} className="p-1.5 text-slate-500 hover:text-slate-100 transition-colors rounded">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button onClick={() => onDeleteAsset(asset.id)} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors rounded">
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
        <motion.section variants={item} className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-slate-100 tracking-tight title-luxury flex items-center gap-2">
              <span className="material-symbols-outlined text-[24px]">credit_card_off</span>
              Total Liabilities
            </h3>
            <button 
              onClick={() => { setEditingItem(null); setIsDebtModalOpen(true); }}
              className="text-[11px] font-semibold uppercase tracking-wider text-red-400 hover:text-red-500 transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              {t('addDebt')}
            </button>
          </div>
          <div className="space-y-3">
            {debts.length === 0 ? (
              <EmptyState 
                title="No liabilities listed" 
                desc="Good job! You currently have no debts to track." 
                icon="credit_card_off" 
              />
            ) : (
              debts.map((debt, i) => (
                <motion.div 
                  key={debt.id} 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="card-luxury rounded-2xl p-4 flex items-center justify-between group transition-colors border-l-2 border-l-red-500"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 shrink-0">
                      <span className="material-symbols-outlined font-medium text-[20px]">{getDebtIcon(debt.category)}</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-slate-100 group-hover:text-red-400 transition-colors text-sm truncate">{debt.name}</h4>
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5 truncate">{debt.category} • Due: {formatDate(debt.dueDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pl-4 shrink-0">
                    <div className="text-right">
                      <p className="text-base font-bold text-red-400">{fm(debt.amount)}</p>
                      <p className="text-[10px] font-medium text-slate-500">Updated {formatDate(debt.updatedAt)}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-1">
                      <button onClick={() => handleEditDebt(debt)} className="p-1.5 text-slate-500 hover:text-slate-100 transition-colors rounded">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button onClick={() => onDeleteDebt(debt.id)} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors rounded">
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
          onSave={async (data) => {
            try {
              setIsSaving(true);
              setError(null);
              if (editingItem) await onUpdateAsset(editingItem.id, data);
              else await onAddAsset(data);
              setIsAssetModalOpen(false);
            } catch (err) {
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

const EmptyState = ({ title, desc, icon }) => (
  <div className="flex flex-col items-center justify-center py-10 px-4 rounded-xl border border-white/5 bg-white/[0.02]">
    <div className="w-12 h-12 bg-white/[0.03] rounded-full flex items-center justify-center mb-3">
      <span className="material-symbols-outlined text-neutral-600 text-[24px]">{icon}</span>
    </div>
    <h3 className="text-white font-semibold text-sm mb-1">{title}</h3>
    <p className="text-neutral-500 text-xs text-center max-w-[240px]">
      {desc}
    </p>
  </div>
);

// Sub-components for better organization
function Modal({ isOpen, onClose, title, children, t }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={onClose}></div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-[201] w-[90vw] max-w-[480px] max-h-[90vh] overflow-y-auto rounded-2xl card-luxury p-6 shadow-2xl custom-scrollbar mx-auto my-auto"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-100 tracking-tight title-luxury">{title}</h2>
              <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-100 transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
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
    <form className="w-full space-y-4" onSubmit={(e) => { e.preventDefault(); onSave({ ...formData, amount: parseFloat(formData.amount) }); }}>
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {error}
        </div>
      )}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 ml-1">{t('note')} ({t('assets')})</label>
        <input 
          required 
          className="glass-input h-10 w-full px-3 text-sm" 
          value={formData.name} 
          onChange={e => setFormData({...formData, name: e.target.value})} 
          placeholder="e.g. Bank Account" 
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 ml-1">{t('category')}</label>
          <select 
            className="glass-input h-10 w-full px-3 text-sm appearance-none" 
            value={formData.category} 
            onChange={e => setFormData({...formData, category: e.target.value})}
          >
            {categories.map(c => <option key={c} value={c} className="bg-[#0a0a0a]">{c}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 ml-1">{t('amount')}</label>
          <input 
            required 
            type="number" 
            className="glass-input h-10 w-full px-3 text-sm" 
            value={formData.amount} 
            onChange={e => setFormData({...formData, amount: e.target.value})} 
            placeholder="0" 
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 ml-1">{t('note')} (Optional)</label>
        <textarea 
          className="glass-input h-24 w-full px-3 py-2 text-sm resize-none custom-scrollbar" 
          value={formData.note} 
          onChange={e => setFormData({...formData, note: e.target.value})} 
          placeholder="Description..." 
        />
      </div>
      <div className="mt-6 flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost flex-1 h-10 text-sm">{t('cancel')}</button>
        <button type="submit" disabled={isSaving} className={`btn-primary flex-1 h-10 text-sm ${isSaving ? 'opacity-50' : ''}`}>
          {isSaving ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : <span className="material-symbols-outlined text-[18px]">save</span>}
          {t('save')}
        </button>
      </div>
    </form>
  );
}

function DebtForm({ initialData, categories, onSave, onCancel, t, isSaving, error }) {
  const [formData, setFormData] = useState(initialData || { name: '', category: categories[0], amount: '', dueDate: '', note: '' });
  return (
    <form className="w-full space-y-4" onSubmit={(e) => { e.preventDefault(); onSave({ ...formData, amount: parseFloat(formData.amount) }); }}>
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {error}
        </div>
      )}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 ml-1">{t('note')} ({t('debts')})</label>
        <input 
          required 
          className="glass-input h-10 w-full px-3 text-sm" 
          value={formData.name} 
          onChange={e => setFormData({...formData, name: e.target.value})} 
          placeholder="e.g. Credit Card" 
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 ml-1">{t('category')}</label>
          <select 
            className="glass-input h-10 w-full px-3 text-sm appearance-none" 
            value={formData.category} 
            onChange={e => setFormData({...formData, category: e.target.value})}
          >
            {categories.map(c => <option key={c} value={c} className="bg-[#0a0a0a]">{c}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 ml-1">{t('amount')}</label>
          <input 
            required 
            type="number" 
            className="glass-input h-10 w-full px-3 text-sm" 
            value={formData.amount} 
            onChange={e => setFormData({...formData, amount: e.target.value})} 
            placeholder="0" 
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 ml-1">{t('date')}</label>
        <input 
          required 
          type="date" 
          className="glass-input h-10 w-full px-3 text-sm [color-scheme:dark]" 
          value={formData.dueDate} 
          onChange={e => setFormData({...formData, dueDate: e.target.value})} 
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 ml-1">{t('note')} (Optional)</label>
        <textarea 
          className="glass-input h-24 w-full px-3 py-2 text-sm resize-none custom-scrollbar" 
          value={formData.note} 
          onChange={e => setFormData({...formData, note: e.target.value})} 
          placeholder="Description..." 
        />
      </div>
      <div className="mt-6 flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost flex-1 h-10 text-sm">{t('cancel')}</button>
        <button type="submit" disabled={isSaving} className={`btn-primary flex-1 h-10 text-sm ${isSaving ? 'opacity-50' : ''}`}>
          {isSaving ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : <span className="material-symbols-outlined text-[18px]">save</span>}
          {t('save')}
        </button>
      </div>
    </form>
  );
}

export default AssetsDebt;


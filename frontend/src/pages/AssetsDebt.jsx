import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../utils/formatCurrency';

function AssetsDebt({ 
  assets = [], 
  debts = [], 
  onAddAsset, 
  onUpdateAsset, 
  onDeleteAsset, 
  onAddDebt, 
  onUpdateDebt, 
  onDeleteDebt 
}) {
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const totalAssets = assets.reduce((acc, a) => acc + a.amount, 0);
  const totalDebts = debts.reduce((acc, d) => acc + d.amount, 0);
  const netWorth = totalAssets - totalDebts;

  const assetCategories = ['Cash', 'Bank', 'E-Wallet', 'Crypto', 'Saham', 'Inventory Bisnis', 'Piutang', 'Lainnya'];
  const debtCategories = ['Paylater', 'Cicilan', 'Pinjaman', 'Kartu Kredit', 'Utang Pribadi', 'Lainnya'];

  const getAssetIcon = (cat) => {
    switch(cat) {
      case 'Cash': return 'payments';
      case 'Bank': return 'account_balance';
      case 'Crypto': return 'currency_bitcoin';
      case 'Saham': return 'show_chart';
      case 'E-Wallet': return 'wallet';
      default: return 'account_balance_wallet';
    }
  };

  const getDebtIcon = (cat) => {
    switch(cat) {
      case 'Kartu Kredit': return 'credit_card';
      case 'Cicilan': return 'shopping_cart';
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

  return (
    <div className="max-w-[1400px] mx-auto p-lg">
      {/* Header / Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg mb-lg">
        <div className="lg:col-span-2 glass-card p-lg rounded-xl flex flex-col justify-between overflow-hidden relative group shadow-lg border border-outline-variant/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div>
            <h2 className="text-on-surface-variant font-label-md text-label-md mb-2">Total Net Worth (Portfolio)</h2>
            <div className="flex items-end gap-3 mb-6">
              <span className={`font-display-sm text-display-sm font-bold ${netWorth >= 0 ? 'text-primary' : 'text-error'}`}>
                {formatCurrency(netWorth)}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
              <p className="text-[10px] uppercase text-on-surface-variant mb-1">Total Assets</p>
              <p className="font-bold text-primary">{formatCurrency(totalAssets)}</p>
            </div>
            <div className="p-3 bg-error/5 rounded-lg border border-error/10">
              <p className="text-[10px] uppercase text-on-surface-variant mb-1">Total Debts</p>
              <p className="font-bold text-error">{formatCurrency(totalDebts)}</p>
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
              <span className="font-headline-lg text-headline-lg font-bold text-primary">{formatCurrency(totalAssets)}</span>
              <span className="text-on-surface-variant font-mono-data text-mono-data text-xs">
                {totalAssets + totalDebts > 0 ? ((totalAssets / (totalAssets + totalDebts)) * 100).toFixed(1) : 100}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-surface-container rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${totalAssets + totalDebts > 0 ? (totalAssets / (totalAssets + totalDebts)) * 100 : 100}%` }}></div>
            </div>
          </div>
          <div>
            <h3 className="text-on-surface-variant font-label-md text-label-md mb-2 uppercase tracking-widest">Debt Exposure</h3>
            <div className="flex items-center justify-between">
              <span className="font-headline-lg text-headline-lg font-bold text-error">{formatCurrency(totalDebts)}</span>
              <span className="text-on-surface-variant font-mono-data text-mono-data text-xs">
                {totalAssets + totalDebts > 0 ? ((totalDebts / (totalAssets + totalDebts)) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-surface-container rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-error" style={{ width: `${totalAssets + totalDebts > 0 ? (totalDebts / (totalAssets + totalDebts)) * 100 : 0}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid: Assets vs Liabilities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        {/* Assets Section */}
        <section className="space-y-md">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-lg text-headline-lg text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">account_balance_wallet</span>
              Assets Portfolio
            </h3>
            <button 
              onClick={() => { setEditingItem(null); setIsAssetModalOpen(true); }}
              className="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-lg font-bold text-sm transition-all cursor-pointer flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Asset
            </button>
          </div>
          <div className="space-y-sm">
            {assets.length === 0 ? (
              <div className="glass-card p-xl text-center text-on-surface-variant rounded-xl border border-dashed border-outline-variant">
                No assets recorded.
              </div>
            ) : (
              assets.map(asset => (
                <div key={asset.id} className="glass-card p-md rounded-xl flex items-center justify-between group hover:border-primary/50 transition-all border border-outline-variant/10">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">{getAssetIcon(asset.category)}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface">{asset.name}</h4>
                      <p className="text-on-surface-variant text-xs">{asset.category} • {asset.note || 'No notes'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-mono-data text-mono-data font-bold text-primary">{formatCurrency(asset.amount)}</p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Updated {new Date(asset.updatedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditAsset(asset)} className="p-1.5 hover:bg-primary/10 text-primary rounded-lg transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button onClick={() => onDeleteAsset(asset.id)} className="p-1.5 hover:bg-error/10 text-error rounded-lg transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Debt Section */}
        <section className="space-y-md">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-lg text-headline-lg text-error flex items-center gap-2">
              <span className="material-symbols-outlined">credit_card_off</span>
              Total Liabilities
            </h3>
            <button 
              onClick={() => { setEditingItem(null); setIsDebtModalOpen(true); }}
              className="bg-error/10 text-error hover:bg-error/20 px-4 py-2 rounded-lg font-bold text-sm transition-all cursor-pointer flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Debt
            </button>
          </div>
          <div className="space-y-sm">
            {debts.length === 0 ? (
              <div className="glass-card p-xl text-center text-on-surface-variant rounded-xl border border-dashed border-outline-variant">
                No debts recorded.
              </div>
            ) : (
              debts.map(debt => (
                <div key={debt.id} className="glass-card p-md rounded-xl border-l-4 border-l-error flex items-center justify-between group hover:border-error/50 transition-all border border-outline-variant/10">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center text-error">
                      <span className="material-symbols-outlined">{getDebtIcon(debt.category)}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface">{debt.name}</h4>
                      <p className="text-on-surface-variant text-xs">{debt.category} • Due: {debt.dueDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-mono-data text-mono-data font-bold text-error">{formatCurrency(debt.amount)}</p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Updated {new Date(debt.updatedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditDebt(debt)} className="p-1.5 hover:bg-primary/10 text-primary rounded-lg transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button onClick={() => onDeleteDebt(debt.id)} className="p-1.5 hover:bg-error/10 text-error rounded-lg transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Asset Modal */}
      <Modal 
        isOpen={isAssetModalOpen} 
        onClose={() => setIsAssetModalOpen(false)} 
        title={editingItem ? 'Edit Asset' : 'Add New Asset'}
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
        />
      </Modal>

      {/* Debt Modal */}
      <Modal 
        isOpen={isDebtModalOpen} 
        onClose={() => setIsDebtModalOpen(false)} 
        title={editingItem ? 'Edit Debt' : 'Add New Debt'}
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
        />
      </Modal>
    </div>
  );
}

// Sub-components for better organization
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose}></div>
      <div className="asset-modal">
        <div className="asset-modal-header">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AssetForm({ initialData, categories, onSave, onCancel }) {
  const [formData, setFormData] = useState(initialData || { name: '', category: categories[0], amount: '', note: '' });
  return (
    <form className="asset-form" onSubmit={(e) => { e.preventDefault(); onSave({ ...formData, amount: parseFloat(formData.amount) }); }}>
      <div className="asset-field">
        <label>Asset Name</label>
        <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Bank Account" />
      </div>
      <div className="asset-field">
        <label>Category</label>
        <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="asset-field">
        <label>Amount</label>
        <input required type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="0" />
      </div>
      <div className="asset-field">
        <label>Note (Optional)</label>
        <textarea value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} placeholder="Description..." />
      </div>
      <div className="asset-actions">
        <button type="button" onClick={onCancel} className="asset-cancel-btn">Cancel</button>
        <button type="submit" className="asset-save-btn">
          <span className="material-symbols-outlined">save</span>
          Save Asset
        </button>
      </div>
    </form>
  );
}

function DebtForm({ initialData, categories, onSave, onCancel }) {
  const [formData, setFormData] = useState(initialData || { name: '', category: categories[0], amount: '', dueDate: '', note: '' });
  return (
    <form className="asset-form" onSubmit={(e) => { e.preventDefault(); onSave({ ...formData, amount: parseFloat(formData.amount) }); }}>
      <div className="asset-field">
        <label>Debt Name</label>
        <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Credit Card" />
      </div>
      <div className="asset-field">
        <label>Category</label>
        <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="asset-field">
        <label>Amount</label>
        <input required type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="0" />
      </div>
      <div className="asset-field">
        <label>Due Date</label>
        <input required type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
      </div>
      <div className="asset-field">
        <label>Note (Optional)</label>
        <textarea value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} placeholder="Description..." />
      </div>
      <div className="asset-actions">
        <button type="button" onClick={onCancel} className="asset-cancel-btn">Cancel</button>
        <button type="submit" className="asset-save-btn debt-save-btn">
          <span className="material-symbols-outlined">save</span>
          Save Debt
        </button>
      </div>
    </form>
  );
}

export default AssetsDebt;

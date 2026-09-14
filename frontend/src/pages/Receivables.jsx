import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { formatDate } from '../utils/dateUtils';

function Receivables({ 
  receivables = [], 
  assets = [],
  onAddReceivable, 
  onUpdateReceivable, 
  onDeleteReceivable, 
  onMarkPayment,
  t,
  fm
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');

  // Stats
  const activeReceivables = (receivables || []).filter(r => r.status !== 'paid');
  const totalReceivablesAmount = activeReceivables.reduce((acc, r) => acc + r.amount, 0);
  const totalPaidAmount = (receivables || []).reduce((acc, r) => acc + r.paidAmount, 0);
  const totalRemainingAmount = (receivables || []).reduce((acc, r) => acc + r.remainingAmount, 0);
  const activeDebtorsCount = new Set(activeReceivables.map(r => r.debtorName)).size;

  const filteredReceivables = useMemo(() => {
    return (receivables || []).filter(r => {
      const matchesSearch = r.debtorName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesMonth = monthFilter === 'all' || (r.debtDate && r.debtDate.startsWith(monthFilter));
      return matchesSearch && matchesStatus && matchesMonth;
    });
  }, [receivables, searchQuery, statusFilter, monthFilter]);

  const uniqueMonths = useMemo(() => {
    const months = new Set();
    (receivables || []).forEach(r => {
      if (r.debtDate) months.add(r.debtDate.substring(0, 7));
    });
    return Array.from(months).sort().reverse();
  }, [receivables]);

  const handleEdit = (r) => {
    setEditingItem(r);
    setIsModalOpen(true);
  };

  const handlePayment = (r) => {
    setSelectedItem(r);
    setIsPaymentModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'partial': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-[1600px] mx-auto p-4 md:p-8 2xl:p-12"
    >
      {/* Header section */}
      <motion.div variants={item} className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-100 tracking-tight title-luxury">Receivables</h2>
          <p className="text-slate-400 font-medium mt-1">Track money you lent and repayment progress.</p>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="btn-primary h-12 px-6 text-sm"
        >
          <span className="material-symbols-outlined font-bold text-[20px]">add</span>
          Add Receivable
        </button>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatCard title="Active" value={fm(totalReceivablesAmount)} icon="payments" color="text-emerald-400" />
        <StatCard title="Total Paid" value={fm(totalPaidAmount)} icon="check_circle" color="text-blue-400" />
        <StatCard title="Remaining" value={fm(totalRemainingAmount)} icon="pending" color="text-amber-400" />
        <StatCard title="Debtors" value={activeDebtorsCount} icon="group" color="text-purple-400" />
      </motion.div>

      {/* Toolbar */}
      <motion.div variants={item} className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between card-luxury p-4 rounded-3xl">
        <div className="flex flex-wrap gap-4 w-full">
          <div className="relative flex-1 md:min-w-[300px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">search</span>
            <input 
              type="text" 
              placeholder="Search debtor name..." 
              className="glass-input h-11 w-full pl-10 pr-4 text-sm font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 2xl:gap-4">
            <select 
              className="glass-input h-11 px-4 text-xs font-semibold uppercase tracking-wider appearance-none cursor-pointer min-w-[140px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Status: All</option>
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
            </select>
            <select 
              className="glass-input h-11 px-4 text-xs font-semibold uppercase tracking-wider appearance-none cursor-pointer min-w-[140px]"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
            >
              <option value="all">Month: All</option>
              {uniqueMonths.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={item} className="card-luxury rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Debtor</th>
                <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Date / Due</th>
                <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500 text-right">Amount</th>
                <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500 text-right">Remaining</th>
                <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceivables.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-500 font-medium">No receivables found matching your criteria.</td>
                </tr>
              ) : (
                filteredReceivables.map((r) => (
                  <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-100">{r.debtorName}</div>
                      {r.notes && <div className="text-[11px] text-slate-400 truncate max-w-[200px] font-medium">{r.notes}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-300">{formatDate(r.debtDate)}</div>
                      {r.dueDate && <div className="text-[10px] font-semibold text-red-400 uppercase tracking-wider">Due: {formatDate(r.dueDate)}</div>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-base font-bold text-slate-100">{fm(r.amount)}</div>
                      <div className="text-[10px] text-emerald-400 font-semibold">Paid: {fm(r.paidAmount)}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`text-base font-bold ${r.remainingAmount > 0 ? 'text-amber-400' : 'text-slate-500'}`}>{fm(r.remainingAmount)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${getStatusColor(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {r.status !== 'paid' && (
                          <button 
                            onClick={() => handlePayment(r)}
                            title="Record Payment"
                            className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-400/10 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">payments</span>
                          </button>
                        )}
                        <button 
                          onClick={() => handleEdit(r)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button 
                          onClick={() => { if(confirm('Delete this record?')) onDeleteReceivable(r.id); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingItem ? "Edit Receivable" : "Add Receivable"}
      >
        <ReceivableForm 
          initialData={editingItem}
          assets={assets}
          onSave={async (data) => {
            try {
              setIsSaving(true);
              if (editingItem) await onUpdateReceivable(editingItem.id, data);
              else await onAddReceivable(data);
              setIsModalOpen(false);
            } catch (err) {
              setError(err.message);
            } finally {
              setIsSaving(false);
            }
          }}
          onCancel={() => setIsModalOpen(false)}
          isSaving={isSaving}
          error={error}
        />
      </Modal>

      {/* Payment Modal */}
      <Modal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        title="Record Payment"
      >
        <PaymentForm 
          receivable={selectedItem}
          assets={assets}
          onSave={async (amount, assetId) => {
            try {
              setIsSaving(true);
              await onMarkPayment(selectedItem.id, selectedItem.paidAmount, amount, assetId);
              setIsPaymentModalOpen(false);
            } catch (err) {
              setError(err.message);
            } finally {
              setIsSaving(false);
            }
          }}
          onCancel={() => setIsPaymentModalOpen(false)}
          isSaving={isSaving}
          error={error}
          fm={fm}
        />
      </Modal>
    </motion.div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="card-luxury p-5 md:p-6 rounded-2xl">
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${color}`}>
          <span className="material-symbols-outlined font-medium text-[20px]">{icon}</span>
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{title}</span>
      </div>
      <div className="text-2xl md:text-3xl font-bold text-slate-100 tracking-tight">{value}</div>
    </div>
  );
}

function Modal({ isOpen, onClose, title, children }) {
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-md overflow-y-auto">
          <div className="absolute inset-0 bg-slate-950/40" onClick={onClose}></div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-[1000] w-[90vw] max-w-[560px] max-h-[90vh] overflow-y-auto rounded-3xl card-luxury p-8 shadow-2xl no-scrollbar mx-auto my-auto"
            style={{
                width: 'calc(100% - 2rem)',
                maxWidth: '560px',
                minWidth: '320px'
            }}
          >
            <div className="mb-8 flex items-start justify-between gap-4">
              <h2 className="text-2xl font-bold text-slate-100 tracking-tight title-luxury whitespace-normal">{title}</h2>
              <button 
                onClick={onClose} 
                className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined font-medium text-[24px]">close</span>
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

function ReceivableForm({ initialData, assets = [], onSave, onCancel, isSaving, error }) {
  const [formData, setFormData] = useState(initialData || {
    debtorName: '',
    amount: '',
    paidAmount: 0,
    debtDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: '',
    assetId: ''
  });

  return (
    <form className="space-y-6 w-full" onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
      {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold">{error}</div>}
      
      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 ml-1">Debtor Name</label>
        <input 
          required
          type="text"
          className="glass-input h-12 w-full px-4 text-base font-medium"
          placeholder="e.g. John Doe"
          value={formData.debtorName}
          onChange={e => setFormData({...formData, debtorName: e.target.value})}
        />
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 ml-1">Amount</label>
          <input 
            required
            type="number"
            className="glass-input h-12 w-full px-4 text-base font-medium"
            placeholder="0"
            value={formData.amount}
            onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 ml-1">Initial Paid</label>
          <input 
            type="number"
            className="glass-input h-12 w-full px-4 text-base font-medium"
            placeholder="0"
            value={formData.paidAmount}
            onChange={e => setFormData({...formData, paidAmount: parseFloat(e.target.value)})}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 ml-1">Date Borrowed</label>
          <input 
            required
            type="date"
            className="glass-input h-12 w-full px-4 font-medium [color-scheme:dark]"
            value={formData.debtDate}
            onChange={e => setFormData({...formData, debtDate: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 ml-1">Due Date (Optional)</label>
          <input 
            type="date"
            className="glass-input h-12 w-full px-4 font-medium [color-scheme:dark]"
            value={formData.dueDate}
            onChange={e => setFormData({...formData, dueDate: e.target.value})}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 ml-1">Notes</label>
        <textarea 
          className="glass-input min-h-[100px] w-full p-4 text-sm resize-none custom-scrollbar"
          placeholder="Extra details..."
          value={formData.notes}
          onChange={e => setFormData({...formData, notes: e.target.value})}
        />
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4">
        <button type="button" onClick={onCancel} className="btn-ghost flex-1 h-12 text-sm">Cancel</button>
        <button 
          type="submit" 
          disabled={isSaving}
          className={`btn-primary flex-[2] h-12 text-sm ${isSaving ? 'opacity-50' : ''}`}
        >
          {isSaving ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : <span className="material-symbols-outlined font-medium text-[20px]">save</span>}
          {initialData ? 'Update' : 'Save'} Receivable
        </button>
      </div>
    </form>
  );
}

function PaymentForm({ receivable, assets = [], onSave, onCancel, isSaving, error, fm }) {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [assetId, setAssetId] = useState('');
  const remaining = receivable?.remainingAmount || 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(paymentAmount);
    if (amount > remaining) {
      alert("Payment amount cannot exceed remaining debt.");
      return;
    }
    onSave(amount, assetId);
  };

  return (
    <form className="space-y-8 w-full" onSubmit={handleSubmit}>
      {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold">{error}</div>}
      
      <div className="p-6 bg-white/[0.03] border border-white/5 rounded-2xl">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Debtor</div>
        <div className="text-2xl font-bold text-slate-100">{receivable?.debtorName}</div>
        <div className="flex justify-between mt-6 text-sm font-semibold">
          <span className="text-slate-500">Total: {fm(receivable?.amount)}</span>
          <span className="text-emerald-400">Remaining: {fm(remaining)}</span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 ml-1">Payment Amount</label>
        <div className="relative">
          <input 
            required
            type="number"
            autoFocus
            className="glass-input w-full h-14 px-4 text-slate-100 text-2xl font-bold"
            placeholder="0"
            value={paymentAmount}
            onChange={e => setPaymentAmount(e.target.value)}
            max={remaining}
          />
          <button 
            type="button" 
            onClick={() => setPaymentAmount(remaining.toString())}
            className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-emerald-400/10 text-emerald-400 text-[10px] font-bold uppercase rounded-lg border border-emerald-400/20 hover:bg-emerald-400/20 transition-all"
          >
            Full Pay
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 ml-1">Destination (Asset)</label>
        <select 
          required
          className="glass-input w-full h-12 px-4 text-slate-100 text-sm font-medium appearance-none"
          value={assetId}
          onChange={e => setAssetId(e.target.value)}
        >
          <option value="" disabled>Select Asset to Receive Money</option>
          {assets.map(a => (
            <option key={a.id} value={a.id}>{a.name} ({a.amount.toLocaleString()})</option>
          ))}
        </select>
        <p className="text-[11px] text-slate-500 ml-1 mt-1.5">Money will be added to this asset, and an income transaction will be recorded.</p>
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4">
        <button type="button" onClick={onCancel} className="btn-ghost flex-1 h-12 text-sm">Cancel</button>
        <button 
          type="submit" 
          disabled={isSaving || !paymentAmount || parseFloat(paymentAmount) <= 0}
          className="btn-primary flex-[2] h-12 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSaving ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : <span className="material-symbols-outlined font-medium text-[20px]">check_circle</span>}
          Confirm Payment
        </button>
      </div>
    </form>
  );
}

export default Receivables;

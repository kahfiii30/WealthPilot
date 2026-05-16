import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { formatDate } from '../utils/dateUtils';

function Receivables({ 
  receivables = [], 
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
      className="max-w-[1400px] mx-auto p-4 md:p-8"
    >
      {/* Summary Cards */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Active" value={fm(totalReceivablesAmount)} icon="payments" color="text-emerald-400" />
        <StatCard title="Total Paid" value={fm(totalPaidAmount)} icon="check_circle" color="text-blue-400" />
        <StatCard title="Total Remaining" value={fm(totalRemainingAmount)} icon="pending" color="text-amber-400" />
        <StatCard title="Active Debtors" value={activeDebtorsCount} icon="group" color="text-purple-400" />
      </motion.div>

      {/* Toolbar */}
      <motion.div variants={item} className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none md:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">search</span>
            <input 
              type="text" 
              placeholder="Search by name..." 
              className="w-full pl-10 pr-4 h-11 bg-slate-900/50 border border-slate-700/30 rounded-xl text-sm focus:border-emerald-400/50 outline-none transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            className="h-11 px-4 bg-slate-900/50 border border-slate-700/30 rounded-xl text-sm focus:border-emerald-400/50 outline-none transition-colors appearance-none cursor-pointer min-w-[120px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="unpaid">Unpaid</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
          </select>
          <select 
            className="h-11 px-4 bg-slate-900/50 border border-slate-700/30 rounded-xl text-sm focus:border-emerald-400/50 outline-none transition-colors appearance-none cursor-pointer min-w-[120px]"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
          >
            <option value="all">All Months</option>
            {uniqueMonths.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="w-full md:w-auto bg-gradient-to-r from-emerald-400 to-emerald-500 text-slate-950 px-6 h-11 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined font-bold">add</span>
          Add Receivable
        </button>
      </motion.div>

      {/* Table */}
      <motion.div variants={item} className="bg-slate-900/40 border border-slate-700/30 rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700/30 bg-slate-800/30">
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Debtor</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Date / Due</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Amount</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Remaining</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceivables.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-500 font-medium">No receivables found matching your criteria.</td>
                </tr>
              ) : (
                filteredReceivables.map((r) => (
                  <tr key={r.id} className="border-b border-slate-700/20 hover:bg-slate-800/20 transition-colors group">
                    <td className="p-4">
                      <div className="font-bold text-slate-100">{r.debtorName}</div>
                      {r.notes && <div className="text-[10px] text-slate-500 truncate max-w-[150px]">{r.notes}</div>}
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-slate-300">{formatDate(r.debtDate)}</div>
                      {r.dueDate && <div className="text-[10px] font-black text-red-400/70 uppercase">Due: {formatDate(r.dueDate)}</div>}
                    </td>
                    <td className="p-4 text-right">
                      <div className="text-sm font-black text-slate-100">{fm(r.amount)}</div>
                      <div className="text-[10px] text-emerald-400/70">Paid: {fm(r.paidAmount)}</div>
                    </td>
                    <td className="p-4 text-right">
                      <div className={`text-sm font-black ${r.remainingAmount > 0 ? 'text-amber-400' : 'text-slate-500'}`}>{fm(r.remainingAmount)}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {r.status !== 'paid' && (
                          <button 
                            onClick={() => handlePayment(r)}
                            title="Record Payment"
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400 hover:text-slate-950 transition-all"
                          >
                            <span className="material-symbols-outlined text-[18px] font-bold">payments</span>
                          </button>
                        )}
                        <button 
                          onClick={() => handleEdit(r)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-slate-100 transition-all"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button 
                          onClick={() => { if(confirm('Delete this record?')) onDeleteReceivable(r.id); }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
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
          onSave={async (amount) => {
            try {
              setIsSaving(true);
              await onMarkPayment(selectedItem.id, selectedItem.paidAmount, amount);
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
    <div className="bg-slate-900/40 border border-slate-700/30 p-5 rounded-2xl backdrop-blur-xl">
      <div className="flex items-center gap-4 mb-3">
        <div className={`w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center ${color}`}>
          <span className="material-symbols-outlined font-bold">{icon}</span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{title}</span>
      </div>
      <div className="text-2xl font-black text-slate-100 tracking-tight">{value}</div>
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
            className="relative z-[1000] w-full max-w-[560px] min-w-[320px] max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-700/30 bg-slate-900/95 p-8 shadow-2xl backdrop-blur-xl no-scrollbar mx-auto my-auto"
            style={{
                width: 'calc(100% - 2rem)',
                maxWidth: '560px',
                minWidth: '320px'
            }}
          >
            <div className="mb-8 flex items-start justify-between gap-4">
              <h2 className="text-3xl font-black text-slate-100 tracking-tighter whitespace-normal">{title}</h2>
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
    </AnimatePresence>,
    document.body
  );
}

function ReceivableForm({ initialData, onSave, onCancel, isSaving, error }) {
  const [formData, setFormData] = useState(initialData || {
    debtorName: '',
    amount: '',
    paidAmount: 0,
    debtDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: ''
  });

  return (
    <form className="space-y-6 w-full" onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
      {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold">{error}</div>}
      
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Debtor Name</label>
        <input 
          required
          className="w-full h-14 px-5 bg-slate-950/70 border border-slate-700/50 rounded-xl text-slate-100 font-bold focus:border-emerald-400/70 outline-none transition-all"
          placeholder="Who borrowed the money?"
          value={formData.debtorName}
          onChange={e => setFormData({...formData, debtorName: e.target.value})}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Amount</label>
          <input 
            required
            type="number"
            className="w-full h-14 px-5 bg-slate-950/70 border border-slate-700/50 rounded-xl text-slate-100 font-black text-lg focus:border-emerald-400/70 outline-none transition-all"
            placeholder="0"
            value={formData.amount}
            onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Initial Paid</label>
          <input 
            type="number"
            className="w-full h-14 px-5 bg-slate-950/70 border border-slate-700/50 rounded-xl text-slate-100 font-black text-lg focus:border-emerald-400/70 outline-none transition-all"
            placeholder="0"
            value={formData.paidAmount}
            onChange={e => setFormData({...formData, paidAmount: parseFloat(e.target.value)})}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Date Borrowed</label>
          <input 
            required
            type="date"
            className="w-full h-14 px-5 bg-slate-950/70 border border-slate-700/50 rounded-xl text-slate-100 font-bold focus:border-emerald-400/70 outline-none transition-all [color-scheme:dark]"
            value={formData.debtDate}
            onChange={e => setFormData({...formData, debtDate: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Due Date (Optional)</label>
          <input 
            type="date"
            className="w-full h-14 px-5 bg-slate-950/70 border border-slate-700/50 rounded-xl text-slate-100 font-bold focus:border-emerald-400/70 outline-none transition-all [color-scheme:dark]"
            value={formData.dueDate}
            onChange={e => setFormData({...formData, dueDate: e.target.value})}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Notes</label>
        <textarea 
          className="w-full min-h-[100px] p-5 bg-slate-950/70 border border-slate-700/50 rounded-xl text-slate-100 text-sm focus:border-emerald-400/70 outline-none resize-none transition-all"
          placeholder="Extra details..."
          value={formData.notes}
          onChange={e => setFormData({...formData, notes: e.target.value})}
        />
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4">
        <button type="button" onClick={onCancel} className="flex-1 h-14 rounded-xl border border-slate-700/50 font-bold text-slate-400 hover:bg-slate-800 transition-all">Cancel</button>
        <button 
          type="submit" 
          disabled={isSaving}
          className="flex-[2] h-14 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 text-slate-950 font-black shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {isSaving ? <div className="w-6 h-6 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div> : <span className="material-symbols-outlined font-bold text-[22px]">save</span>}
          {initialData ? 'Update' : 'Save'} Receivable
        </button>
      </div>
    </form>
  );
}

function PaymentForm({ receivable, onSave, onCancel, isSaving, error, fm }) {
  const [paymentAmount, setPaymentAmount] = useState('');
  const remaining = receivable?.remainingAmount || 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(paymentAmount);
    if (amount > remaining) {
      alert("Payment amount cannot exceed remaining debt.");
      return;
    }
    onSave(amount);
  };

  return (
    <form className="space-y-8 w-full" onSubmit={handleSubmit}>
      {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold">{error}</div>}
      
      <div className="p-6 bg-slate-950/50 border border-slate-700/30 rounded-2xl">
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Debtor</div>
        <div className="text-2xl font-black text-slate-100">{receivable?.debtorName}</div>
        <div className="flex justify-between mt-6 text-sm font-bold">
          <span className="text-slate-500">Total: {fm(receivable?.amount)}</span>
          <span className="text-emerald-400">Remaining: {fm(remaining)}</span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Payment Amount</label>
        <div className="relative">
          <input 
            required
            type="number"
            autoFocus
            className="w-full h-16 px-6 bg-slate-950 border border-slate-700/50 rounded-2xl text-slate-100 text-3xl font-black focus:border-emerald-400 outline-none transition-all"
            placeholder="0"
            value={paymentAmount}
            onChange={e => setPaymentAmount(e.target.value)}
            max={remaining}
          />
          <button 
            type="button" 
            onClick={() => setPaymentAmount(remaining.toString())}
            className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-emerald-400/10 text-emerald-400 text-[10px] font-black uppercase rounded-lg border border-emerald-400/20 hover:bg-emerald-400/20 transition-all"
          >
            Full Pay
          </button>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4">
        <button type="button" onClick={onCancel} className="flex-1 h-14 rounded-xl border border-slate-700/50 font-bold text-slate-400 hover:bg-slate-800 transition-all">Cancel</button>
        <button 
          type="submit" 
          disabled={isSaving || !paymentAmount || parseFloat(paymentAmount) <= 0}
          className="flex-[2] h-14 rounded-xl bg-emerald-400 text-slate-950 font-black shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {isSaving ? <div className="w-6 h-6 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div> : <span className="material-symbols-outlined font-bold text-[22px]">check_circle</span>}
          Confirm Payment
        </button>
      </div>
    </form>
  );
}

export default Receivables;

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getMonthKey } from '../services/financeService';

export default function CashflowChart({ transactions }) {
  const chartData = useMemo(() => {
    const summary = transactions.reduce((acc, t) => {
      if (!t.date) return acc;
      const month = getMonthKey(t.date);
      if (!acc[month]) acc[month] = { name: month, income: 0, expense: 0 };
      if (t.type === 'income') acc[month].income += t.amount;
      if (t.type === 'expense') acc[month].expense += t.amount;
      return acc;
    }, {});
    
    return Object.values(summary)
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(-6); // Last 6 months
  }, [transactions]);

  if (chartData.length === 0) {
    return <div className="h-full flex items-center justify-center text-slate-500 font-bold text-xs uppercase tracking-widest">No Data Available</div>;
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/90 border border-slate-700/50 p-4 rounded-xl backdrop-blur-md shadow-2xl">
          <p className="text-slate-300 font-black text-xs uppercase tracking-widest mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-emerald-400 font-bold text-sm">Income: Rp {payload[0].value.toLocaleString('id-ID')}</p>
            <p className="text-red-400 font-bold text-sm">Expense: Rp {payload[1].value.toLocaleString('id-ID')}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full min-h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f87171" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
          <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dy={10} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="income" stroke="#34d399" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
          <Area type="monotone" dataKey="expense" stroke="#f87171" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

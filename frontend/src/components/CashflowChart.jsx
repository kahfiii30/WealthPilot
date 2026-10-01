import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
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
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
          <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dy={10} />
          <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `Rp ${val >= 1000000 ? (val/1000000).toFixed(1) + 'M' : val}`} width={60} />
          <Tooltip content={<CustomTooltip />} cursor={{fill: '#334155', opacity: 0.2}} />
          <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
          <Bar dataKey="income" name="Income" fill="#34d399" radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey="expense" name="Expense" fill="#f87171" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

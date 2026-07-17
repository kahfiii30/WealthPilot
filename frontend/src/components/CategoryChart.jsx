import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts';

const COLORS = ['#34d399', '#38bdf8', '#818cf8', '#fb923c', '#eab308', '#f87171', '#3b82f6', '#06b6d4', '#10b981', '#64748b'];

export default function CategoryChart({ transactions, totalExpense }) {
  const chartData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const summary = expenses.reduce((acc, t) => {
      if (!acc[t.category]) acc[t.category] = { name: t.category, value: 0 };
      acc[t.category].value += t.amount;
      return acc;
    }, {});

    return Object.values(summary).sort((a, b) => b.value - a.value);
  }, [transactions]);

  if (chartData.length === 0) {
    return <div className="h-full flex items-center justify-center text-slate-500 font-bold text-xs uppercase tracking-widest">No Expenses Found</div>;
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const percent = totalExpense > 0 ? ((payload[0].value / totalExpense) * 100).toFixed(1) : 0;
      return (
        <div className="bg-slate-900/90 border border-slate-700/50 p-4 rounded-xl backdrop-blur-md shadow-2xl flex items-center gap-3">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: payload[0].payload.fill || COLORS[0] }}></div>
          <div>
            <p className="text-slate-200 font-bold text-sm">{payload[0].payload.name}</p>
            <p className="text-slate-400 font-black text-xs">{percent}% • Rp {payload[0].value.toLocaleString('id-ID')}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
          <XAxis 
            type="number" 
            tickFormatter={(value) => `Rp${value >= 1000000 ? (value/1000000).toFixed(1)+'M' : value >= 1000 ? (value/1000).toFixed(0)+'k' : value}`} 
            stroke="#64748b" 
            fontSize={10} 
            axisLine={false} 
            tickLine={false} 
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            stroke="#64748b" 
            fontSize={11} 
            fontWeight={600} 
            axisLine={false} 
            tickLine={false} 
            width={90}
          />
          <Tooltip cursor={{ fill: '#1e293b' }} content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

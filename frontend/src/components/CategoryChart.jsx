import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

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
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: payload[0].payload.fill }}></div>
          <div>
            <p className="text-slate-200 font-bold text-sm">{payload[0].name}</p>
            <p className="text-slate-400 font-black text-xs">{percent}% • Rp {payload[0].value.toLocaleString('id-ID')}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[250px] relative">
      {/* Center Label (Donut Hole) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Expenses</span>
        <span className="text-xl font-black text-slate-200 tracking-tighter">
          Rp {totalExpense >= 1000000 ? (totalExpense / 1000000).toFixed(1) + 'M' : (totalExpense / 1000).toFixed(0) + 'k'}
        </span>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<CustomTooltip />} />
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} style={{ filter: `drop-shadow(0px 0px 8px ${COLORS[index % COLORS.length]}40)` }} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

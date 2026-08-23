import React from 'react';

function StatCard({ title, amount, icon, isError }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/[0.03] border border-white/5 shrink-0">
        <span className={`material-symbols-outlined text-[20px] ${isError ? 'text-red-400' : 'text-primary'}`}>
          {icon}
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 truncate">{title}</p>
        <p className={`text-lg font-bold truncate text-white`}>{amount}</p>
      </div>
    </div>
  );
}

export default StatCard;

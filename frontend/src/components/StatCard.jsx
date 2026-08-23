import React from 'react';

function StatCard({ title, amount, icon, isError }) {
  return (
    <div className="flex items-center gap-4 group">
      <div className={`relative w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
        isError
          ? 'stat-badge-expense'
          : 'stat-badge-income'
      }`}>
        {/* Glow behind icon */}
        <div className={`absolute inset-0 rounded-xl blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-300 ${
          isError ? 'bg-red-500' : 'bg-emerald-400'
        }`} />
        <span className={`relative material-symbols-outlined text-[20px] font-medium ${
          isError ? 'text-red-400' : 'text-emerald-400'
        }`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {icon}
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 truncate mb-0.5">{title}</p>
        <p className={`text-xl font-bold tracking-tight truncate ${
          isError ? 'text-red-300' : 'text-emerald-300'
        }`}>
          {amount}
        </p>
      </div>
    </div>
  );
}

export default StatCard;

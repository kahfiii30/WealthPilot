import React from 'react';

function StatCard({ title, amount, icon, isError }) {
  return (
    <div className="flex items-center gap-md">
      <div className={`p-2 rounded-lg ${isError ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <p className="text-xs text-on-surface-variant">{title}</p>
        <p className="font-bold text-on-surface">{amount}</p>
      </div>
    </div>
  );
}

export default StatCard;

import React from 'react';

import { motion } from 'framer-motion';

function StatCard({ title, amount, icon, isError }) {
  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="flex items-center gap-4 group cursor-default"
    >
      <div className={`p-3 rounded-xl transition-all duration-300 group-hover:scale-110 border ${isError ? 'bg-red-500/10 text-red-300 border-red-500/20 group-hover:bg-red-500/20' : 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20 group-hover:bg-emerald-400/20'}`}>
        <span className="material-symbols-outlined font-bold">{icon}</span>
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-400 transition-colors">{title}</p>
        <p className={`text-lg font-black tracking-tight transition-colors ${isError ? 'text-slate-100 group-hover:text-red-300' : 'text-slate-100 group-hover:text-emerald-400'}`}>{amount}</p>
      </div>
    </motion.div>
  );
}

export default StatCard;

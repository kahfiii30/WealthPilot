import React from 'react';

import { motion } from 'framer-motion';

function StatCard({ title, amount, icon, isError }) {
  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="flex items-center gap-md group cursor-default"
    >
      <div className={`p-2 rounded-lg transition-all duration-300 group-hover:scale-110 ${isError ? 'bg-error/10 text-error group-hover:bg-error/20' : 'bg-primary/10 text-primary group-hover:bg-primary/20'}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <p className="text-xs text-on-surface-variant group-hover:text-on-surface transition-colors">{title}</p>
        <p className="font-bold text-on-surface group-hover:text-primary transition-colors">{amount}</p>
      </div>
    </motion.div>
  );
}

export default StatCard;

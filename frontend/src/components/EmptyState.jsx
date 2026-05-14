import React from 'react';
import { motion } from 'framer-motion';

const EmptyState = ({ title, desc, icon = 'info', actionLabel, onAction }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-xl text-center"
    >
      <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-lg shadow-inner">
        <span className="material-symbols-outlined text-[40px] text-on-surface-variant opacity-40">
          {icon}
        </span>
      </div>
      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-sm">{title}</h3>
      <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[320px] mb-xl opacity-70">
        {desc}
      </p>
      {actionLabel && (
        <button 
          onClick={onAction}
          className="px-lg py-2.5 bg-primary/10 text-primary font-bold rounded-lg border border-primary/20 hover:bg-primary/20 transition-colors duration-200 cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
};

export default EmptyState;

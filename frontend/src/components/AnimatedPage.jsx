import React from 'react';
import { motion } from 'framer-motion';

const animations = {
  initial: { 
    opacity: 0, 
    y: 80, 
    filter: 'blur(8px)' 
  },
  animate: { 
    opacity: 1, 
    y: 0, 
    filter: 'blur(0px)',
    transition: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1], // easeOutQuint for snappy feel
    }
  },
  exit: { 
    opacity: 0, 
    y: -80, 
    filter: 'blur(8px)',
    transition: { duration: 0.25, ease: 'easeIn' }
  },
};

const AnimatedPage = ({ children, className = '', direction = 1 }) => {
  return (
    <motion.div
      custom={direction}
      variants={animations}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`w-full min-h-full ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedPage;

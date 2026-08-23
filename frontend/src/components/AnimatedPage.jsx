import React from 'react';
import { motion } from 'framer-motion';

const animations = {
  initial: { opacity: 0, filter: 'blur(4px)', y: 10 },
  animate: { opacity: 1, filter: 'blur(0px)', y: 0 },
  exit: { opacity: 0, filter: 'blur(4px)', y: -10 },
};

const AnimatedPage = ({ children, className = '' }) => {
  return (
    <motion.div
      variants={animations}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={`w-full min-h-full ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedPage;

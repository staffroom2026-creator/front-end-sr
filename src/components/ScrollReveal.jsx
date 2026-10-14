import React from 'react';
import { motion as Motion } from 'framer-motion';

export default function ScrollReveal({ children, delay = 0, y = 40, className = "" }) {
  return (
    <Motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.1 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </Motion.div>
  );
}

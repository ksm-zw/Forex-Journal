'use client';

import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

type Props = HTMLMotionProps<'div'> & {
  children: React.ReactNode;
};

export default function AnimatedCard({ children, className = '', ...props }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.995 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.995 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className={`card ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

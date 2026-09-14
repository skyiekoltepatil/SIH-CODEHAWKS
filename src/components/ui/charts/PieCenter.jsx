import React from 'react';
import { usePieChart } from './PieChartContext';
import { motion, AnimatePresence } from 'motion/react';

export function PieCenter({
  defaultLabel = 'Total',
  prefix = '',
  suffix = '',
  children,
  className = '',
}) {
  const { data, hoveredIndex, innerRadius } = usePieChart();
  
  if (innerRadius <= 0) return null;

  const activeItem = hoveredIndex !== null ? data[hoveredIndex] : null;
  const label = activeItem ? activeItem.label : defaultLabel;
  const value = activeItem ? activeItem.value : data.reduce((acc, curr) => acc + curr.value, 0);

  if (children) {
    return (
      <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${className}`} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        {children({ label, value })}
      </div>
    );
  }

  return (
    <div 
      className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none ${className}`}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={label + value}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          style={{ textAlign: 'center' }}
        >
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1e293b', lineHeight: '1' }}>
            {prefix}{value}{suffix}
          </div>
          <div style={{ fontSize: '1rem', color: '#94a3b8', marginTop: '4px' }}>
            {label}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

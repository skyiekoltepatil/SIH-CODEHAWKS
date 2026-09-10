import React, { useState } from 'react';
import { motion } from 'motion/react';
import { usePieChart } from './PieChartContext';

export function PieSlice({
  index,
  color,
  fill,
  animate = true,
  showGlow = true,
  hoverEffect = 'translate',
  hoverOffset = 10,
  arcs,
  path,
}) {
  const { data, hoveredIndex, setHoveredIndex } = usePieChart();
  const arc = arcs[index];
  
  if (!arc) return null;

  const item = data[index];
  const itemColor = color || item.color || '#cbd5e1';
  const itemFill = fill || item.fill || itemColor;

  const isHovered = hoveredIndex === index;
  const isOtherHovered = hoveredIndex !== null && hoveredIndex !== index;

  // Calculate the centroid for translation
  const [x, y] = path.centroid(arc);
  
  // Normalize vector to get direction for hover offset
  const length = Math.sqrt(x * x + y * y);
  const normalizedX = length ? (x / length) : 0;
  const normalizedY = length ? (y / length) : 0;

  const hoverX = isHovered && hoverEffect === 'translate' ? normalizedX * hoverOffset : 0;
  const hoverY = isHovered && hoverEffect === 'translate' ? normalizedY * hoverOffset : 0;
  const hoverScale = isHovered && hoverEffect === 'grow' ? 1.05 : 1;

  const pathD = path(arc);

  return (
    <motion.g
      initial={animate ? { opacity: 0, scale: 0.8 } : false}
      animate={{ 
        opacity: isOtherHovered ? 0.3 : 1,
        scale: hoverScale,
        x: hoverX,
        y: hoverY,
      }}
      transition={{ 
        duration: 0.3,
        ease: 'easeOut',
      }}
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
      style={{ cursor: 'pointer', transformOrigin: 'center' }}
    >
      <motion.path
        d={pathD}
        fill={isHovered ? itemColor : itemFill}
        initial={animate ? { pathLength: 0 } : false}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay: animate ? index * 0.1 : 0, ease: 'easeInOut' }}
        style={{
          filter: isHovered && showGlow ? `drop-shadow(0 0 10px ${itemColor})` : 'none',
          transition: 'filter 0.3s ease',
        }}
      />
    </motion.g>
  );
}

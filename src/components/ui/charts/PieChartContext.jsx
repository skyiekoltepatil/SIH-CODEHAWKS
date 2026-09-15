import { createContext, useContext, useState } from 'react';

const PieChartContext = createContext(undefined);

export function PieChartProvider({ children, data, innerRadius, outerRadius }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const value = {
    data,
    hoveredIndex,
    setHoveredIndex,
    innerRadius,
    outerRadius,
  };

  return <PieChartContext.Provider value={value}>{children}</PieChartContext.Provider>;
}

export function usePieChart() {
  const context = useContext(PieChartContext);
  if (context === undefined) {
    throw new Error('usePieChart must be used within a PieChart');
  }
  return context;
}

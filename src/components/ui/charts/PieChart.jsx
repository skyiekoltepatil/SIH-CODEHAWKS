import React from 'react';
import { Group } from '@visx/group';
import { Pie } from '@visx/shape';
import { ParentSize } from '@visx/responsive';
import { PieChartProvider } from './PieChartContext';

export function PieChart({
  data,
  size,
  innerRadius = 0,
  padAngle = 0,
  cornerRadius = 0,
  startAngle = -Math.PI / 2,
  endAngle = (3 * Math.PI) / 2,
  children,
  className = '',
}) {
  const renderChart = ({ width, height }) => {
    const dimension = size || Math.min(width, height);
    if (!dimension || dimension === 0) return null;

    const radius = dimension / 2;
    const centerY = dimension / 2;
    const centerX = dimension / 2;

    const calculatedInnerRadius = innerRadius > 0 ? (innerRadius / 100) * radius : 0;

    return (
      <PieChartProvider data={data} innerRadius={calculatedInnerRadius} outerRadius={radius}>
        <div className={`relative ${className}`} style={{ width: dimension, height: dimension }}>
          <svg width={dimension} height={dimension} style={{ overflow: 'visible' }}>
            <Group top={centerY} left={centerX}>
              <Pie
                data={data}
                pieValue={(d) => d.value}
                outerRadius={radius}
                innerRadius={calculatedInnerRadius}
                cornerRadius={cornerRadius}
                padAngle={padAngle}
                startAngle={startAngle}
                endAngle={endAngle}
              >
                {(pie) => (
                  <g>
                    {React.Children.map(children, (child) => {
                      // Check for index prop to identify PieSlice robustly across Fast Refresh boundaries
                      if (React.isValidElement(child) && child.props.index !== undefined) {
                        return React.cloneElement(child, { arcs: pie.arcs, path: pie.path });
                      }
                      return null;
                    })}
                  </g>
                )}
              </Pie>
            </Group>
          </svg>
          {React.Children.map(children, (child) => {
            // If it doesn't have an index prop, it's the PieCenter
            if (React.isValidElement(child) && child.props.index === undefined) {
              return child;
            }
            return null;
          })}
        </div>
      </PieChartProvider>
    );
  };

  if (size) {
    return renderChart({ width: size, height: size });
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ParentSize>{renderChart}</ParentSize>
    </div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';

interface ConfidenceMeterProps {
  value: number;
  size?: number;
}

const RING_RADIUS = 18;
const STROKE_WIDTH = 4;
const VIEWBOX = 48;

function getColor(value: number): string {
  if (value >= 0.75) return '#10B981';
  if (value >= 0.5) return '#F59E0B';
  return '#EF4444';
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  value,
  size = 48,
}) => {
  const clamped = Math.max(0, Math.min(1, value));
  const circumference = 2 * Math.PI * RING_RADIUS;
  const offset = circumference * (1 - clamped);
  const color = getColor(clamped);
  const pct = Math.round(clamped * 100);

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      className="flex-shrink-0"
    >
      <circle
        cx={VIEWBOX / 2}
        cy={VIEWBOX / 2}
        r={RING_RADIUS}
        fill="none"
        stroke="#334155"
        strokeWidth={STROKE_WIDTH}
      />
      <motion.circle
        cx={VIEWBOX / 2}
        cy={VIEWBOX / 2}
        r={RING_RADIUS}
        fill="none"
        stroke={color}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${VIEWBOX / 2} ${VIEWBOX / 2})`}
        initial={false}
        animate={{ strokeDashoffset: offset, stroke: color }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
      <text
        x={VIEWBOX / 2}
        y={VIEWBOX / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#F8FAFC"
        fontSize={12}
        fontWeight={600}
        fontFamily="Inter, system-ui, sans-serif"
      >
        {pct}
      </text>
    </motion.svg>
  );
};

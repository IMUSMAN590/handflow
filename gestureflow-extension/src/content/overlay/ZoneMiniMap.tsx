import React from 'react';
import { motion } from 'framer-motion';

type GestureZone = 'top' | 'left' | 'center' | 'right' | 'bottom';

interface ZoneMiniMapProps {
  activeZone: GestureZone | null;
  handPosition?: { x: number; y: number };
}

const ZONES: { id: GestureZone; gridArea: string; label: string }[] = [
  { id: 'top', gridArea: '1 / 2 / 2 / 3', label: 'T' },
  { id: 'left', gridArea: '2 / 1 / 3 / 2', label: 'L' },
  { id: 'center', gridArea: '2 / 2 / 3 / 3', label: 'C' },
  { id: 'right', gridArea: '2 / 3 / 3 / 4', label: 'R' },
  { id: 'bottom', gridArea: '3 / 2 / 4 / 3', label: 'B' },
];

export const ZoneMiniMap: React.FC<ZoneMiniMapProps> = ({
  activeZone,
  handPosition,
}) => {
  return (
    <div
      className="relative flex-shrink-0 rounded border border-dark-border bg-dark-surface overflow-hidden"
      style={{ width: 100, height: 75 }}
    >
      <div
        className="grid h-full w-full"
        style={{
          gridTemplateColumns: '1fr 1fr 1fr',
          gridTemplateRows: '1fr 1fr 1fr',
        }}
      >
        {ZONES.map((zone) => {
          const isActive = activeZone === zone.id;
          return (
            <motion.div
              key={zone.id}
              style={{ gridArea: zone.gridArea }}
              className={`flex items-center justify-center border border-dark-border text-[9px] font-medium transition-colors duration-150 ${
                isActive
                  ? 'bg-primary/30 text-primary'
                  : 'bg-dark-surface text-text-muted'
              }`}
              animate={{ backgroundColor: isActive ? 'rgba(14,165,233,0.3)' : '#1E293B' }}
              transition={{ duration: 0.15 }}
            >
              {zone.label}
            </motion.div>
          );
        })}
      </div>
      {handPosition && (
        <motion.div
          className="absolute w-2 h-2 rounded-full bg-primary"
          style={{
            left: `${handPosition.x * 100}%`,
            top: `${handPosition.y * 100}%`,
            transform: 'translate(-50%, -50%)',
          }}
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </div>
  );
};

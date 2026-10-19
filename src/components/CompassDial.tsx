import React from 'react';
import { getHeadingDirection } from '../utils/geo';

interface CompassDialProps {
  heading: number;
  size?: number;
  interactive?: boolean;
  onHeadingChange?: (newHeading: number) => void;
}

export const CompassDial: React.FC<CompassDialProps> = ({
  heading,
  size = 96,
  interactive = true,
  onHeadingChange,
}) => {
  const dir = getHeadingDirection(heading);
  const normalizedHeading = Math.round(heading % 360);

  // Generate 24 tick marks (every 15 degrees)
  const ticks = Array.from({ length: 24 }).map((_, i) => {
    const angle = i * 15;
    const isMajor = angle % 90 === 0;
    const isMedium = angle % 45 === 0;
    return { angle, isMajor, isMedium };
  });

  return (
    <div
      className="relative select-none pointer-events-auto cursor-pointer group"
      style={{ width: size, height: size }}
      title={`Kompas: ${normalizedHeading}° (${dir}) - Klik untuk putar arah`}
      onClick={() => {
        if (interactive && onHeadingChange) {
          onHeadingChange((heading + 45) % 360);
        }
      }}
    >
      {/* Outer Glow Ring & Glass Disc */}
      <div
        className="w-full h-full rounded-full flex items-center justify-center relative overflow-hidden shadow-2xl transition-all duration-200 border border-white/40"
        style={{
          background:
            'radial-gradient(circle at 35% 35%, rgba(45, 55, 72, 0.75) 0%, rgba(15, 23, 42, 0.85) 100%)',
          backdropFilter: 'blur(4px)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.25)',
        }}
      >
        {/* Subtle Outer Graduation Ticks */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full pointer-events-none opacity-60"
        >
          {ticks.map(({ angle, isMajor, isMedium }) => {
            const rad = (angle * Math.PI) / 180;
            const r1 = isMajor ? 41 : isMedium ? 43 : 45;
            const r2 = 48;
            const x1 = 50 + r1 * Math.sin(rad);
            const y1 = 50 - r1 * Math.cos(rad);
            const x2 = 50 + r2 * Math.sin(rad);
            const y2 = 50 - r2 * Math.cos(rad);

            return (
              <line
                key={angle}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isMajor ? '#ffffff' : isMedium ? '#93c5fd' : '#94a3b8'}
                strokeWidth={isMajor ? 2 : 1}
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        {/* Cardinal Direction Letters */}
        <span className="absolute top-1 text-white font-extrabold text-[12px] tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
          N
        </span>
        <span className="absolute right-2 text-white/95 font-bold text-[11px] tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
          E
        </span>
        <span className="absolute bottom-1.5 text-white/95 font-bold text-[11px] tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
          S
        </span>
        <span className="absolute left-2 text-white/95 font-bold text-[11px] tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
          W
        </span>

        {/* Rotating Compass Needle Dial */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform ease-out"
          style={{
            transform: `rotate(${-heading}deg)`,
            transitionDuration: '160ms',
          }}
        >
          {/* North Needle Pointer (Aerodynamic Dual-Tone Wedge) */}
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.6)]"
          >
            {/* North Left Half - Bright Cyan */}
            <path
              d="M 50 14 L 50 48 L 41 50 Z"
              fill="#38bdf8"
            />
            {/* North Right Half - Royal Blue */}
            <path
              d="M 50 14 L 59 50 L 50 48 Z"
              fill="#0284c7"
            />
            {/* Subtle highlight sheen */}
            <path
              d="M 50 14 L 46 38 L 50 46 Z"
              fill="rgba(255, 255, 255, 0.4)"
            />

            {/* South Left Half - Light Slate */}
            <path
              d="M 50 82 L 43 50 L 50 52 Z"
              fill="#cbd5e1"
              opacity="0.8"
            />
            {/* South Right Half - Dark Slate */}
            <path
              d="M 50 82 L 50 52 L 57 50 Z"
              fill="#64748b"
              opacity="0.8"
            />

            {/* Center Metallic Pivot */}
            <circle cx="50" cy="50" r="7" fill="#0f172a" stroke="#ffffff" strokeWidth="2" />
            <circle cx="50" cy="50" r="3.5" fill="#38bdf8" />
          </svg>
        </div>

        {/* Degree Badge on hover / active */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-full backdrop-blur-xs">
          <span className="text-[10px] font-mono font-bold text-white tracking-tighter">
            {normalizedHeading}° {dir}
          </span>
        </div>
      </div>
    </div>
  );
};

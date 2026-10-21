import React from 'react';
import { getHeadingDirection } from '../utils/geo';

interface CompassDialProps {
  heading: number;
  size?: number;
  interactive?: boolean;
  styleVariant?: 'reference' | 'classic' | 'tactical';
  onHeadingChange?: (newHeading: number) => void;
}

export const CompassDial: React.FC<CompassDialProps> = ({
  heading,
  size = 96,
  interactive = true,
  styleVariant = 'reference',
  onHeadingChange,
}) => {
  const dir = getHeadingDirection(heading);
  const normalizedHeading = Math.round(((heading % 360) + 360) % 360);

  // Generate 24 tick marks (every 15 degrees)
  const ticks = Array.from({ length: 24 }).map((_, i) => {
    const angle = i * 15;
    const isMajor = angle % 90 === 0;
    const isMedium = angle % 45 === 0;
    return { angle, isMajor, isMedium };
  });

  return (
    <div
      className="relative select-none pointer-events-auto cursor-pointer flex flex-col items-center group"
      style={{ width: size }}
      title={`Kompas: ${normalizedHeading}° (${dir}) - Klik untuk putar arah`}
      onClick={() => {
        if (interactive && onHeadingChange) {
          onHeadingChange((heading + 45) % 360);
        }
      }}
    >
      {/* Compass Circular Dial */}
      <div
        className="w-full relative flex items-center justify-center rounded-full overflow-hidden transition-transform active:scale-95 duration-150"
        style={{
          height: size,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.55), inset 0 0 0 1px rgba(255, 255, 255, 0.35)',
        }}
      >
        {/* Reference Style: Dark Translucent Circular Bezel with Ring Track */}
        <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0">
          <defs>
            {/* Dark Bezel Gradient */}
            <radialGradient id="compassBgGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(15, 23, 42, 0.75)" />
              <stop offset="65%" stopColor="rgba(30, 41, 59, 0.85)" />
              <stop offset="100%" stopColor="rgba(15, 23, 42, 0.95)" />
            </radialGradient>
            {/* Outer Ring Shadow */}
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.4)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0.15)" />
            </linearGradient>
            {/* Cyan Needle Gradient */}
            <linearGradient id="cyanNeedleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>

          {/* Background Outer Ring & Bezel */}
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="url(#compassBgGrad)"
            stroke="url(#ringGrad)"
            strokeWidth="1.5"
          />

          {/* Inner Groove Line */}
          <circle
            cx="50"
            cy="50"
            r="35"
            fill="rgba(15, 23, 42, 0.35)"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="1"
          />

          {/* Subtle Graduation Ticks */}
          {ticks.map(({ angle, isMajor, isMedium }) => {
            const rad = (angle * Math.PI) / 180;
            const r1 = isMajor ? 41 : isMedium ? 43 : 45;
            const r2 = 47.5;
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
                stroke={isMajor ? '#ffffff' : isMedium ? '#7dd3fc' : 'rgba(255, 255, 255, 0.4)'}
                strokeWidth={isMajor ? 1.75 : 1}
                strokeLinecap="round"
              />
            );
          })}

          {/* Cardinal Directions (Bold, Crisp White Inside Ring Track) */}
          <text
            x="50"
            y="20"
            fill="#ffffff"
            fontSize="9"
            fontWeight="bold"
            fontFamily="system-ui, -apple-system, sans-serif"
            textAnchor="middle"
            dominantBaseline="central"
            style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.9))' }}
          >
            N
          </text>
          <text
            x="80"
            y="50"
            fill="#ffffff"
            fontSize="8.5"
            fontWeight="bold"
            fontFamily="system-ui, -apple-system, sans-serif"
            textAnchor="middle"
            dominantBaseline="central"
            style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.9))' }}
          >
            E
          </text>
          <text
            x="50"
            y="80"
            fill="#ffffff"
            fontSize="8.5"
            fontWeight="bold"
            fontFamily="system-ui, -apple-system, sans-serif"
            textAnchor="middle"
            dominantBaseline="central"
            style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.9))' }}
          >
            S
          </text>
          <text
            x="20"
            y="50"
            fill="#ffffff"
            fontSize="8.5"
            fontWeight="bold"
            fontFamily="system-ui, -apple-system, sans-serif"
            textAnchor="middle"
            dominantBaseline="central"
            style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.9))' }}
          >
            W
          </text>
        </svg>

        {/* Rotating Cyan Needle (Oriented by Heading) */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform ease-out"
          style={{
            transform: `rotate(${-heading}deg)`,
            transitionDuration: '180ms',
          }}
        >
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]"
          >
            {/* North Pointer - Left Bright Cyan Wedge */}
            <path
              d="M 50 16 L 44 49 L 50 46 Z"
              fill="#38bdf8"
            />
            {/* North Pointer - Right Royal Blue Wedge */}
            <path
              d="M 50 16 L 50 46 L 56 49 Z"
              fill="#0284c7"
            />
            {/* Center High-Luminance Highlight Spine */}
            <path
              d="M 50 16 L 48 35 L 50 44 Z"
              fill="rgba(255, 255, 255, 0.6)"
            />

            {/* South Tail - Light Slate Left */}
            <path
              d="M 50 80 L 46 51 L 50 54 Z"
              fill="#cbd5e1"
              opacity="0.85"
            />
            {/* South Tail - Dark Slate Right */}
            <path
              d="M 50 80 L 50 54 L 54 51 Z"
              fill="#64748b"
              opacity="0.85"
            />

            {/* Center Metallic Pivot */}
            <circle cx="50" cy="50" r="6" fill="#0f172a" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="3" fill="#38bdf8" />
          </svg>
        </div>
      </div>

      {/* Degrees & Direction Readout Badge */}
      <div className="mt-1 px-2 py-0.5 rounded-full bg-slate-900/80 border border-white/20 backdrop-blur-xs text-white text-[10px] font-mono font-semibold tracking-wider tabular-nums flex items-center gap-1 shadow-md">
        <span className="text-sky-300">{normalizedHeading}°</span>
        <span className="text-white/80">{dir}</span>
      </div>
    </div>
  );
};

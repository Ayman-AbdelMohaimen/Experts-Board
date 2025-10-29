import React from 'react';

export const EyeOfHorusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="gold-metal-eye" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="50%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
      <filter id="drop-shadow-eye" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="1.5"/>
        <feOffset dx="1" dy="1" result="offsetblur"/>
        <feComponentTransfer>
          <feFuncA type="linear" slope="0.5"/>
        </feComponentTransfer>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <g filter="url(#drop-shadow-eye)" stroke="url(#gold-metal-eye)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        {/* Eyebrow */}
        <path d="M14 20 Q 32 12, 50 20" />
        {/* Main Eye Shape */}
        <path d="M8 32 C 16 22, 48 22, 56 32 C 48 42, 16 42, 8 32 Z" />
        {/* Teardrop */}
        <path d="M26 40 L 22 52" />
        {/* Spiral */}
        <path d="M38 40 C 42 46, 50 50, 58 46" />
    </g>
  </svg>
);
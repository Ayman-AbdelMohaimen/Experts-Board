import React from 'react';

export const ExpertIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="gold-metal" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="50%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
      <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
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
    <g filter="url(#drop-shadow)">
      {/* Face outline */}
      <circle cx="32" cy="32" r="28" fill="none" stroke="url(#gold-metal)" strokeWidth="3" />
      
      {/* Glasses */}
      <circle cx="22" cy="28" r="8" stroke="url(#gold-metal)" strokeWidth="3.5" fill="none" />
      <circle cx="42" cy="28" r="8" stroke="url(#gold-metal)" strokeWidth="3.5" fill="none" />
      <line x1="30" y1="28" x2="34" y2="28" stroke="url(#gold-metal)" strokeWidth="3.5" />
      <path d="M14 28 C 8 26, 6 22, 4 20" stroke="url(#gold-metal)" strokeWidth="3" fill="none" />
      
      {/* Smile */}
      <path d="M22 42 Q 32 48, 42 42" stroke="url(#gold-metal)" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      
      {/* Shine effect */}
      <path d="M48 20 Q 46 28, 49 32" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6"/>
    </g>
  </svg>
);
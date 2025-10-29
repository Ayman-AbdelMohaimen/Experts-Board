import React from 'react';

export const EyeOfRaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="gold-metal-eye-ra" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="50%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
      <filter id="drop-shadow-eye-ra" x="-20%" y="-20%" width="140%" height="140%">
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
    <g filter="url(#drop-shadow-eye-ra)" fill="url(#gold-metal-eye-ra)">
      {/* A refined, single-path shape for the Eye of Ra/Horus for a clean, solid fill. */}
      <path fillRule="evenodd" d="M54.8,17.2c-15-4.3-31.9-4.3-46.9,0C4,18,1.3,20.8,1.3,24.6c0,5.6,4,10.5,9.4,12.5l-3.8,15.6h7.6l2.9-11.8 c-1.3-1.4-2.3-3-2.9-4.7c-2.3-6.6,1.4-13.8,8-16.1C28,17.8,36.5,17.8,42,20c6.6,2.3,10.3,9.5,8,16.1c-0.6,1.7-1.6,3.3-2.9,4.7 l2.9,11.8h7.6l-3.8-15.6c5.4-2,9.4-6.9,9.4-12.5C61.3,20.8,58.7,18,54.8,17.2z M31.3,37.3c-4.8,0-8.8-3.9-8.8-8.8 s3.9-8.8,8.8-8.8s8.8,3.9,8.8,8.8S36.1,37.3,31.3,37.3z" />
    </g>
  </svg>
);
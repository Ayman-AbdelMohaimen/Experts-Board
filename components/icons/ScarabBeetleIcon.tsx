import React from 'react';

export const ScarabBeetleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="gold-metal-scarab" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="50%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
      <filter id="drop-shadow-scarab" x="-20%" y="-20%" width="140%" height="140%">
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
    <g filter="url(#drop-shadow-scarab)" fill="url(#gold-metal-scarab)">
      {/* A single, stylized path for a Scarab Beetle */}
      <path fillRule="evenodd" d="M53.1,27.3c-2.3-5.2-6.1-9.5-11-12.4c-2.4-1.4-5.2-2.3-8.1-2.4c-2.9,0.1-5.7,1-8.1,2.4 c-4.9,2.9-8.7,7.2-11,12.4C12.6,33,12,39.3,13,45.4c1.1,6.5,4.3,12.2,9,16.2c3.4,2.9,7.6,4.5,12,4.5s8.6-1.6,12-4.5 c4.7-4,7.9-9.7,9-16.2C56,39.3,55.4,33,53.1,27.3z M43,18.5c-0.8-0.9-1.8-1.7-2.9-2.2c-0.2-0.1-0.5-0.2-0.7-0.3 c-2.9-1.2-6-1.5-9-1.3c-3,0.2-6,0.9-8.7,2.5c-1,0.6-1.9,1.3-2.7,2.2c-1.3,1.4-2.3,3-3.1,4.7c-0.9,2-1.5,4-1.8,6.2 c-0.3,1.9-0.3,3.8,0,5.7c0.4,2.6,1.4,5,2.8,7.1c2.1,3.1,5,5.5,8.5,6.8c3.1,1.1,6.4,1.1,9.5,0c3.5-1.3,6.4-3.7,8.5-6.8 c1.5-2.1,2.4-4.5,2.8-7.1c0.3-1.9,0.3,3.8,0-5.7c-0.3-2.1-0.9-4.2-1.8-6.2C45.3,21.5,44.3,19.9,43,18.5z" />
    </g>
  </svg>
);
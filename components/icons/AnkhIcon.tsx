import React from 'react';

export const AnkhIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="gold-metal-ankh" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="50%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
      <filter id="drop-shadow-ankh" x="-20%" y="-20%" width="140%" height="140%">
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
    <g filter="url(#drop-shadow-ankh)" fill="url(#gold-metal-ankh)">
        {/* A single, detailed path for the Ankh with inner "engraved" details using fill-rule. */}
        <path fillRule="evenodd" clipRule="evenodd" d="M32,34.5C22.9,34.5,15.5,27.1,15.5,18S22.9,1.5,32,1.5S48.5,8.9,48.5,18S41.1,34.5,32,34.5z M32,29.5c-6.4,0-11.5-5.2-11.5-11.5S25.6,6.5,32,6.5s11.5,5.2,11.5,11.5S38.4,29.5,32,29.5z M37,32.5V62H27V32.5H11v-5h16V27c0.2-1.7,0.5-3.4,1-5c-5.7-1.4-10-6.5-10-12.5C18,4.2,24.2-1,32-1s14,5.2,14,11.5c0,6-4.3,11.1-10,12.5c0.5,1.6,0.8,3.3,1,5v0.5h16v5H37z M34,35.5h-4v23h4V35.5z M14,30.5h10v-1H14V30.5z M40,30.5h10v-1H40V30.5z M32,18m-3,0a3,3,0,1,1,6,0a3,3,0,1,1,-6,0" />
    </g>
  </svg>
);
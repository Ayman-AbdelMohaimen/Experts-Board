import React from 'react';

export const SmileIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" {...props}>
    <defs>
      <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#FDE047' }} />
        <stop offset="50%" style={{ stopColor: '#F59E0B' }} />
        <stop offset="100%" style={{ stopColor: '#D97706' }} />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10" stroke="url(#gold-gradient)" strokeWidth="2.5" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="url(#gold-gradient)" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="9" cy="9.5" r="1.25" fill="url(#gold-gradient)" />
    <circle cx="15" cy="9.5" r="1.25" fill="url(#gold-gradient)" />
  </svg>
);

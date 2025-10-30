import React from 'react';

export const ExpertIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Face outline */}
      <circle cx="32" cy="32" r="28" fill="none" stroke="#F59E0B" strokeWidth="3" />
      
      {/* Glasses */}
      <circle cx="22" cy="28" r="8" stroke="#F59E0B" strokeWidth="3.5" fill="none" />
      <circle cx="42" cy="28" r="8" stroke="#F59E0B" strokeWidth="3.5" fill="none" />
      <line x1="30" y1="28" x2="34" y2="28" stroke="#F59E0B" strokeWidth="3.5" />
      <path d="M14 28 C 8 26, 6 22, 4 20" stroke="#F59E0B" strokeWidth="3" fill="none" />
      
      {/* Smile */}
      <path d="M22 42 Q 32 48, 42 42" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      
      {/* Shine effect */}
      <path d="M48 20 Q 46 28, 49 32" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6"/>
  </svg>
);
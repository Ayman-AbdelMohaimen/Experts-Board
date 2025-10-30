import React from 'react';

export const SmileIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" {...props}>
    <circle cx="12" cy="12" r="10" stroke="#F59E0B" strokeWidth="2.5" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="9" cy="9.5" r="1.25" fill="#F59E0B" />
    <circle cx="15" cy="9.5" r="1.25" fill="#F59E0B" />
  </svg>
);
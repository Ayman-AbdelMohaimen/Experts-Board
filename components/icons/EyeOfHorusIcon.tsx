import React from 'react';

export const EyeOfHorusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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
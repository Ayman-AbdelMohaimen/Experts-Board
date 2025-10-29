import React from 'react';

export const ClipboardCheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 00-7.5 0" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.75a3.75 3.75 0 003.75-3.75H8.25A3.75 3.75 0 0012 21.75z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18V9.75m-3.75 3.75h7.5" />
    </svg>
);

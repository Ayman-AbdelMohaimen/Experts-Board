import React from 'react';
import { Page } from '../App';
import { translations } from '../lib/translations';
import { trackEvent } from '../services/analyticsService';
import { ClipboardCheckIcon } from './icons/ClipboardCheckIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { TagIcon } from './icons/TagIcon';
import { AnkhIcon } from './icons/AnkhIcon';
import { AcademicCapIcon } from './icons/AcademicCapIcon';
import { BrainCircuitIcon } from './icons/BrainCircuitIcon';
import { AITool } from '../types';

interface FloatingNavProps {
    page: Page;
    setPage: (page: Page) => void;
    t: (key: keyof typeof translations) => string;
    setActiveAiTool: (tool: AITool) => void;
}

const navItems: { id: Page; icon: React.FC<any>; labelKey: keyof typeof translations, tool?: AITool }[] = [
    { id: 'tasks', icon: ClipboardCheckIcon, labelKey: 'tasks' },
    { id: 'aiAgentic', icon: BrainCircuitIcon, labelKey: 'aiTools', tool: 'content' },
    { id: 'courses', icon: AcademicCapIcon, labelKey: 'courses' },
    { id: 'offers', icon: TagIcon, labelKey: 'offers' },
    { id: 'profile', icon: AnkhIcon, labelKey: 'sProfile' },
];

export const FloatingNav: React.FC<FloatingNavProps> = ({ page, setPage, t, setActiveAiTool }) => {
    const handleNavClick = (newPage: Page, tool?: AITool) => {
        setPage(newPage);
         if (newPage === 'aiAgentic' && tool) {
            setActiveAiTool(tool);
        }
        trackEvent('floating_nav_click', { page: newPage });
    };

    return (
        <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-sm h-20 bg-[var(--sidebar-background)] backdrop-blur-2xl border border-[var(--border-color)] rounded-2xl shadow-2xl z-40 md:hidden">
            <div className="flex justify-around items-center h-full">
                {navItems.map(item => {
                    const Icon = item.icon;
                    const isActive = page === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => handleNavClick(item.id, item.tool)}
                            className="flex-1 h-full flex items-center justify-center"
                            aria-label={t(item.labelKey)}
                        >
                            <div className={`flex flex-col items-center gap-1 transition-all duration-300 ease-out transform ${
                                isActive ? '-translate-y-3' : 'translate-y-0'
                            }`}>
                                <div className={`flex items-center justify-center rounded-full transition-all duration-300 ease-out ${
                                    isActive 
                                    ? 'w-16 h-16 bg-[var(--background-elevated-color)] border-2 border-[var(--border-muted-color)] shadow-lg' 
                                    : 'w-12 h-12 bg-transparent'
                                }`}>
                                    <Icon className={`transition-all duration-300 ${
                                        isActive ? 'w-9 h-9 text-[var(--primary-color)]' : 'w-7 h-7 text-[var(--text-muted-color)]'
                                    }`} />
                                </div>
                                <span className={`text-xs font-semibold transition-colors duration-300 ${
                                    isActive ? 'text-[var(--primary-color)]' : 'text-[var(--text-muted-color)]'
                                }`}>
                                    {t(item.labelKey)}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

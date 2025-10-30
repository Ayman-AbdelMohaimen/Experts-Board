import React, { useState } from 'react';
import { Page } from '../App';
import { AnkhIcon } from './icons/AnkhIcon';
import { UsersIcon } from './icons/UsersIcon';
import { AcademicCapIcon } from './icons/AcademicCapIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { ClipboardCheckIcon } from './icons/ClipboardCheckIcon';
import { translations } from '../lib/translations';
import { trackEvent } from '../services/analyticsService';
import { XIcon } from './icons/XIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { TagIcon } from './icons/TagIcon';
import { BrainCircuitIcon } from './icons/BrainCircuitIcon';
import { AITool } from '../types';
import { PencilIcon } from './icons/PencilIcon';
import { PhotographIcon } from './icons/PhotographIcon';
import { VideoCameraIcon } from './icons/VideoCameraIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { SearchIcon } from './icons/SearchIcon';
import { DocumentReportIcon } from './icons/DocumentReportIcon';
import { QuestionMarkCircleIcon } from './icons/QuestionMarkCircleIcon';


interface SidebarProps {
    page: Page;
    setPage: (page: Page) => void;
    activeAiTool: AITool;
    setActiveAiTool: (tool: AITool) => void;
    t: (key: keyof typeof translations) => string;
    onLogoClick: () => void;
    isPinned: boolean;
    isOpen: boolean;
    onClose: () => void;
}

const aiToolsSubMenu: { id: AITool; labelKey: keyof typeof translations; icon: React.FC<any> }[] = [
    { id: 'content', labelKey: 'contentGenerator', icon: PencilIcon },
    { id: 'image', labelKey: 'imageGenerator', icon: PhotographIcon },
    { id: 'video', labelKey: 'videoGenerator', icon: VideoCameraIcon },
    { id: 'marketingPlan', labelKey: 'marketingPlan', icon: ChartBarIcon },
    { id: 'marketResearch', labelKey: 'marketResearch', icon: SearchIcon },
    { id: 'swot', labelKey: 'swotAnalysis', icon: DocumentReportIcon },
];

const menuItems: { id: Page; icon: React.FC<React.SVGProps<SVGSVGElement>>; labelKey: keyof typeof translations; subMenu?: typeof aiToolsSubMenu }[] = [
    { id: 'cvAnalysis', icon: DocumentTextIcon, labelKey: 'cvAnalysis' },
    { id: 'profile', icon: AnkhIcon, labelKey: 'profile' },
    { id: 'aiAgentic', icon: BrainCircuitIcon, labelKey: 'aiTools', subMenu: aiToolsSubMenu },
    { id: 'developmentPlan', icon: SparklesIcon, labelKey: 'developmentPlan'},
    { id: 'tasks', icon: ClipboardCheckIcon, labelKey: 'tasks' },
    { id: 'library', icon: BookmarkIcon, labelKey: 'library' },
    { id: 'community', icon: UsersIcon, labelKey: 'community' },
    { id: 'courses', icon: AcademicCapIcon, labelKey: 'courses' },
    { id: 'offers', icon: TagIcon, labelKey: 'offers' },
    { id: 'userManual', icon: QuestionMarkCircleIcon, labelKey: 'userManual' },
];

export const Sidebar: React.FC<SidebarProps> = ({ page, setPage, activeAiTool, setActiveAiTool, t, onLogoClick, isPinned, isOpen, onClose }) => {
    
    const [isAiSubMenuOpen, setIsAiSubMenuOpen] = useState(page === 'aiAgentic');

    const handleNavClick = (itemPage: Page, hasSubMenu: boolean) => {
        if (hasSubMenu) {
            // Toggle submenu only if we are already on the parent page
            if (page === itemPage) {
                setIsAiSubMenuOpen(prev => !prev);
            } else {
                setIsAiSubMenuOpen(true); // Always open when navigating to it
                setPage(itemPage);
            }
        } else {
            setPage(itemPage);
            setIsAiSubMenuOpen(false); // Close sub-menu if navigating elsewhere
            onClose(); 
        }
    };
    
    const handleSubMenuClick = (toolId: AITool) => {
        setActiveAiTool(toolId);
        setPage('aiAgentic'); // ensure we're on the right page
        onClose(); // Close mobile sidebar
    };

    const isAiPageActive = page === 'aiAgentic';

    const NavContent = () => (
        <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden">
            <div className="flex items-center justify-between h-20 px-6 shrink-0">
                <button onClick={onLogoClick} className="flex items-center gap-3" aria-label="Go to homepage">
                     <AnkhIcon className="w-10 h-10 transition-transform hover:rotate-12" />
                     <span className="text-xl font-bold text-[var(--sidebar-text-color)] transition-opacity duration-200 whitespace-nowrap md:opacity-0 group-hover:md:opacity-100 group-data-[pinned=true]:md:opacity-100">{t('aiTools')}</span>
                </button>
                <button onClick={onClose} className="md:hidden p-2 rounded-full hover:bg-white/10">
                    <XIcon className="w-6 h-6 text-[var(--sidebar-text-color)]" />
                </button>
            </div>
            <nav className="flex-grow px-4 space-y-2 mt-8">
                {menuItems.map(item => {
                    const isActive = page === item.id;
                    const isSubMenuVisible = item.subMenu && (isAiSubMenuOpen || isAiPageActive);

                    return (
                        <React.Fragment key={item.id}>
                            <button
                                onClick={() => handleNavClick(item.id, !!item.subMenu)}
                                className={`w-full flex items-center gap-4 p-3 rounded-lg transition-colors duration-200 ${
                                    isActive 
                                        ? 'bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-white shadow-lg' 
                                        : 'text-[var(--sidebar-text-muted-color)] hover:bg-[var(--sidebar-hover-background)] hover:text-[var(--sidebar-text-color)]'
                                }`}
                            >
                                <item.icon className="w-6 h-6 shrink-0" />
                                <span className="font-semibold transition-opacity duration-200 whitespace-nowrap md:opacity-0 group-hover:md:opacity-100 group-data-[pinned=true]:md:opacity-100">{t(item.labelKey)}</span>
                            </button>
                             {isSubMenuVisible && (
                                <div className="pl-8 rtl:pr-8 space-y-1 mt-1 animate-fade-in transition-opacity duration-200 md:opacity-0 group-hover:md:opacity-100 group-data-[pinned=true]:md:opacity-100">
                                    {item.subMenu!.map(subItem => (
                                        <button key={subItem.id} onClick={() => handleSubMenuClick(subItem.id)} 
                                            className={`w-full flex items-center gap-3 p-2 rounded-md text-sm text-left rtl:text-right transition-colors duration-200 ${
                                                activeAiTool === subItem.id && isAiPageActive ? 'text-[var(--primary-color-light)]' : 'text-slate-400 hover:text-white'
                                            }`}>
                                            <subItem.icon className="w-5 h-5 shrink-0" />
                                            <span className="whitespace-nowrap">{t(subItem.labelKey)}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </React.Fragment>
                    )
                })}
            </nav>
        </div>
    );
    
    return (
        <>
            {/* Overlay for mobile */}
            <div
                className={`fixed inset-0 bg-black/50 z-40 transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />
            <aside 
               className={`group fixed top-0 right-0 h-full bg-[var(--sidebar-background)] backdrop-blur-xl border-l border-[var(--border-color)] z-50 transition-transform md:transition-[width] duration-300 ease-in-out
                    w-[250px] ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                    md:translate-x-0 ${isPinned ? 'md:w-[250px]' : 'md:w-[90px] md:hover:w-[250px]'}
               `}
               data-pinned={isPinned}
            >
                <NavContent />
            </aside>
        </>
    );
};
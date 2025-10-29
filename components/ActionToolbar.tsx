import React, { useState, useEffect, useRef } from 'react';
import { SavedItemType } from '../types';
import { translations } from '../lib/translations';
import { copyToClipboard, downloadAsTxt, downloadAsPdf, formatContentForExport } from '../lib/exportUtils';
import { saveLibraryItem, isItemInLibrary, deleteLibraryItemByTypeAndTitle, addTask, isTaskCreatedFromSource } from '../lib/storageUtils';
import { CopyIcon } from './icons/CopyIcon';
import { FileDownloadIcon } from './icons/FileDownloadIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { BookmarkSolidIcon } from './icons/BookmarkSolidIcon';
import { CheckIcon } from './icons/CheckIcon';
import { PlusSquareIcon } from './icons/PlusSquareIcon';
import { DotsVerticalIcon } from './icons/DotsVerticalIcon';

interface ActionToolbarProps {
    content: any;
    type: SavedItemType;
    title: string;
    t: (key: keyof typeof translations) => string;
    isCompact?: boolean;
}

export const ActionToolbar: React.FC<ActionToolbarProps> = ({ content, type, title, t, isCompact = false }) => {
    const [copied, setCopied] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [taskAdded, setTaskAdded] = useState(false);
    const [isTaskCreated, setIsTaskCreated] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsSaved(isItemInLibrary(type, title));
        setIsTaskCreated(isTaskCreatedFromSource(type, title));
    }, [type, title, content]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCopy = () => {
        const text = formatContentForExport(content, type);
        copyToClipboard(text).then(success => {
            if (success) {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        });
        setIsMenuOpen(false);
    };

    const handleDownload = (format: 'txt' | 'pdf') => {
        if (format === 'txt') {
            const text = formatContentForExport(content, type);
            downloadAsTxt(title, text);
        } else if (format === 'pdf') {
            downloadAsPdf(title, content, type, title);
        }
        setIsMenuOpen(false);
    };

    const handleToggleSave = () => {
        if (isSaved) {
            deleteLibraryItemByTypeAndTitle(type, title);
            setIsSaved(false);
        } else {
            saveLibraryItem(type, title, content);
            setIsSaved(true);
        }
        setIsMenuOpen(false);
    };
    
    const handleAddTask = () => {
        if (isTaskCreated) return;
        const taskSource = { type, title, content };
        addTask(title, taskSource);
        setIsTaskCreated(true);
        setTaskAdded(true);
        setTimeout(() => setTaskAdded(false), 2000);
        setIsMenuOpen(false);
    };

    const buttonClass = "flex items-center gap-3 w-full text-right rtl:text-left px-4 py-2 text-sm text-[var(--text-color)] hover:bg-slate-500/10 transition-colors duration-150";
    const iconClass = "w-4 h-4 text-[var(--text-muted-color)]";

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsMenuOpen(prev => !prev)}
                className={`p-2 rounded-full transition-colors text-[var(--text-muted-color)] hover:bg-slate-500/10 hover:text-[var(--text-color)] ${isCompact ? 'p-1.5' : 'p-2'}`}
            >
                <DotsVerticalIcon className={isCompact ? "w-5 h-5" : "w-6 h-6"} />
            </button>
            {isMenuOpen && (
                <div className="absolute top-full mt-2 right-0 rtl:right-auto rtl:left-0 bg-[var(--background-elevated-color)] border border-[var(--border-color)] rounded-lg shadow-2xl z-20 w-48 animate-fade-in py-1">
                    <button onClick={handleCopy} className={buttonClass}>
                        {copied ? <CheckIcon className={`${iconClass} text-green-500`} /> : <CopyIcon className={iconClass} />}
                        <span className={copied ? 'text-green-500' : ''}>{copied ? t('copied') : t('copy')}</span>
                    </button>
                    <button onClick={() => handleDownload('txt')} className={buttonClass}>
                        <FileDownloadIcon className={iconClass} />
                        <span>{t('downloadAsTxt')}</span>
                    </button>
                    <button onClick={() => handleDownload('pdf')} className={buttonClass}>
                         <FileDownloadIcon className={iconClass} />
                        <span>{t('downloadAsPdf')}</span>
                    </button>
                     <button onClick={handleAddTask} disabled={isTaskCreated && !taskAdded} className={`${buttonClass} disabled:opacity-50`}>
                        {taskAdded ? <CheckIcon className={`${iconClass} text-green-500`} /> : <PlusSquareIcon className={iconClass} />}
                        <span className={taskAdded ? 'text-green-500' : ''}>{taskAdded ? t('taskAdded') : (isTaskCreated ? t('tasks') : t('addToTasks'))}</span>
                    </button>
                    <button onClick={handleToggleSave} className={buttonClass}>
                        {isSaved ? <BookmarkSolidIcon className={`${iconClass} text-[var(--primary-color)]`} /> : <BookmarkIcon className={iconClass} />}
                        <span className={isSaved ? 'text-[var(--primary-color)]' : ''}>{isSaved ? t('removeFromLibrary') : t('saveToLibrary')}</span>
                    </button>
                </div>
            )}
        </div>
    );
};

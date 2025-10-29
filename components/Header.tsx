import React from 'react';
import { Theme, Language } from '../App';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { GlobeIcon } from './icons/GlobeIcon';
import { MenuIcon } from './icons/MenuIcon';
import { SmileIcon } from './icons/SmileIcon';
import { translations } from '../lib/translations';

interface HeaderProps {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    language: Language;
    setLanguage: (lang: Language) => void;
    onToggleMobileMenu: () => void;
    onMedooToggle: () => void;
    t: (key: keyof typeof translations) => string;
}

export const Header: React.FC<HeaderProps> = ({ theme, setTheme, language, setLanguage, onToggleMobileMenu, onMedooToggle, t }) => {
    const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
    const toggleLanguage = () => setLanguage(language === 'ar' ? 'en' : 'ar');

    return (
        <header className="fixed top-0 left-0 md:left-auto right-0 md:pr-[90px] h-16 z-40 w-full transition-all duration-300">
            <div className="relative mx-4 md:mx-8 mt-4 h-full">
                <div className="flex items-center justify-between p-2 sm:p-4 bg-[var(--card-background)] backdrop-blur-xl rounded-2xl shadow-lg border border-[var(--border-color)] h-full">
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={onToggleMobileMenu}
                            className="md:hidden p-2.5 rounded-full bg-[var(--button-muted-background)] text-[var(--text-color)] hover:bg-[var(--button-muted-hover-background)] transition-colors"
                            aria-label="Toggle Menu"
                        >
                            <MenuIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onMedooToggle}
                            className="w-12 h-12 rounded-full bg-transparent hover:scale-110 transition-transform flex items-center justify-center"
                            aria-label={t('medooName')}
                            title={t('medooName')}
                        >
                            <SmileIcon className="w-10 h-10" />
                        </button>
                    </div>
                    
                    <div className="flex justify-end">
                        <div className="flex items-center gap-2 sm:gap-4">
                            <button
                                onClick={toggleLanguage}
                                className="p-2.5 rounded-full bg-[var(--button-muted-background)] text-[var(--text-color)] hover:bg-[var(--button-muted-hover-background)] transition-colors"
                                aria-label="Toggle Language"
                            >
                                <GlobeIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={toggleTheme}
                                className="p-2.5 rounded-full bg-[var(--button-muted-background)] text-[var(--text-color)] hover:bg-[var(--button-muted-hover-background)] transition-colors"
                                aria-label="Toggle Theme"
                            >
                                {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
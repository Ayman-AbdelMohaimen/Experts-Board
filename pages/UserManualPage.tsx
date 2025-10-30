import React, { useState, useEffect, useRef } from 'react';
import { translations } from '../lib/translations';
import { Language } from '../App';
import { trackEvent } from '../services/analyticsService';
import { BookOpenIcon } from '../components/icons/BookOpenIcon';

// --- Illustrations (defined locally for encapsulation) ---
const IllustrationUpload: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M62.5,32.5 C77.5,32.5 85,42.5 85,50 C85,57.5 77.5,65 62.5,65 L37.5,65 C22.5,65 15,57.5 15,50 C15,42.5 22.5,32.5 37.5,32.5" fill="var(--primary-color-translucent)" stroke="var(--primary-color)" strokeWidth="2"/>
        <path d="M50,5 L50,45" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round"/>
        <path d="M35,20 L50,5 L65,20" fill="none" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
const IllustrationDashboard: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect x="5" y="5" width="90" height="70" rx="5" fill="var(--primary-color-translucent)" stroke="var(--primary-color)" strokeWidth="2" />
        <line x1="5" y1="20" x2="95" y2="20" stroke="var(--primary-color)" strokeWidth="2" />
        <circle cx="15" cy="12.5" r="3" fill="var(--primary-color-dark)" />
        <circle cx="25" cy="12.5" r="3" fill="var(--primary-color-dark)" />
        <rect x="15" y="30" width="30" height="40" rx="3" fill="var(--primary-color-deep-translucent)" />
        <circle cx="30" cy="40" r="8" fill="var(--primary-color-dark)" />
        <rect x="22" y="52" width="16" height="3" rx="1.5" fill="var(--primary-color)" />
        <rect x="55" y="30" width="30" height="8" rx="2" fill="var(--primary-color-deep-translucent)" />
        <rect x="55" y="42" width="30" height="8" rx="2" fill="var(--primary-color-deep-translucent)" />
        <rect x="55" y="54" width="30" height="8" rx="2" fill="var(--primary-color-deep-translucent)" />
    </svg>
);
const IllustrationAITools: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M35,30 C35,15 65,15 65,30 C80,30 85,45 80,60 L20,60 C15,45 20,30 35,30 Z" fill="var(--primary-color-translucent)" stroke="var(--primary-color)" strokeWidth="2" />
        <circle cx="50" cy="45" r="20" fill="var(--primary-color-deep-translucent)" stroke="var(--primary-color)" strokeWidth="2" />
        <path d="M50,25 L50,15 M50,65 L50,75 M70,45 L80,45 M30,45 L20,45" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" />
        <path d="M38,33 L30,25 M62,33 L70,25 M38,57 L30,65 M62,57 L70,65" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" />
    </svg>
);
const IllustrationManagement: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M20,10 L40,10 C45,10 45,15 40,15 L20,15 Z M20,25 L60,25 C65,25 65,30 60,30 L20,30 Z M20,40 L50,40 C55,40 55,45 50,45 L20,45 Z" fill="var(--primary-color-deep-translucent)"/>
        <path d="M15,5 H85 V75 H15 Z" fill="var(--primary-color-translucent)" stroke="var(--primary-color)" strokeWidth="2" rx="5" />
        <path d="M25,20 L30,25 L40,15" stroke="var(--primary-color)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M25,35 L30,40 L40,30" stroke="var(--primary-color)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M25,50 L30,55 L40,45" stroke="var(--primary-color)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="45" y1="22.5" x2="75" y2="22.5" stroke="var(--primary-color-dark)" strokeWidth="2" />
        <line x1="45" y1="37.5" x2="75" y2="37.5" stroke="var(--primary-color-dark)" strokeWidth="2" />
        <line x1="45" y1="52.5" x2="75" y2="52.5" stroke="var(--primary-color-dark)" strokeWidth="2" />
    </svg>
);
const IllustrationMedoo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M10,5 H90 V55 H30 L10,75 V55 H10 Z" fill="var(--primary-color-translucent)" stroke="var(--primary-color)" strokeWidth="2" rx="5" />
        <circle cx="50" cy="30" r="15" fill="var(--primary-color-deep-translucent)" />
        <circle cx="44" cy="27" r="2" fill="var(--primary-color)" />
        <circle cx="56" cy="27" r="2" fill="var(--primary-color)" />
        <path d="M45,35 C47.5,39 52.5,39 55,35" stroke="var(--primary-color)" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
);
// --- End Illustrations ---

const sections = [
  { id: 'intro', titleKey: 'manualIntroTitle', contentKey: 'manualIntroContent', illustration: BookOpenIcon, special: true },
  { id: 'upload', titleKey: 'manualUploadTitle', contentKey: 'manualUploadContent', illustration: IllustrationUpload },
  { id: 'dashboard', titleKey: 'manualDashboardTitle', contentKey: 'manualDashboardContent', illustration: IllustrationDashboard },
  { id: 'ai-tools', titleKey: 'manualAIToolsTitle', contentKey: 'manualAIToolsContent', illustration: IllustrationAITools },
  { id: 'management', titleKey: 'manualManagementTitle', contentKey: 'manualManagementContent', illustration: IllustrationManagement },
  { id: 'medoo', titleKey: 'manualMedooTitle', contentKey: 'manualMedooContent', illustration: IllustrationMedoo },
] as const;

const UserManualPage: React.FC<{ t: (key: keyof typeof translations) => string; language: Language; }> = ({ t, language }) => {
    const [activeSection, setActiveSection] = useState(sections[0].id);
    const observer = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        trackEvent('page_view', { pageName: 'UserManual' });

        observer.current = new IntersectionObserver((entries) => {
            const visibleSection = entries.find((entry) => entry.isIntersecting)?.target;
            if (visibleSection) {
                setActiveSection(visibleSection.id);
            }
        }, { rootMargin: '-30% 0px -70% 0px' }); // Trigger when section is in the top 30% of the viewport

        const elements = sections.map(({ id }) => document.getElementById(id)).filter(el => el);
        elements.forEach((el) => observer.current?.observe(el));

        return () => {
            elements.forEach((el) => observer.current?.unobserve(el));
        };
    }, []);

    const handleTocClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="flex flex-col lg:flex-row-reverse gap-12 animate-fade-in">
            {/* Table of Contents Sidebar */}
            <aside className="lg:w-64 flex-shrink-0 lg:sticky top-28 self-start">
                <div className="bg-[var(--card-background)] backdrop-blur-xl p-4 rounded-2xl shadow-lg border border-[var(--border-color)]">
                    <h3 className="text-lg font-bold mb-3 px-2">{t('manualToc')}</h3>
                    <nav>
                        <ul className="space-y-1">
                            {sections.map(section => (
                                <li key={section.id}>
                                    <a 
                                        href={`#${section.id}`}
                                        onClick={(e) => handleTocClick(e, section.id)}
                                        className={`block w-full text-right px-3 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                                            activeSection === section.id
                                                ? 'bg-[var(--primary-color-translucent)] text-[var(--primary-color)]'
                                                : 'text-[var(--text-muted-color)] hover:bg-[var(--button-muted-background)] hover:text-[var(--text-color)]'
                                        }`}
                                    >
                                        {t(section.titleKey)}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow">
                <div className="bg-[var(--card-background)] backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-lg border border-[var(--border-color)]">
                    <header className="text-center border-b border-[var(--border-muted-color)] pb-6 mb-8">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-color)]">{t('manualTitle')}</h1>
                        <p className="text-md sm:text-lg text-[var(--text-muted-color)] mt-2 max-w-2xl mx-auto">{t('manualSubtitle')}</p>
                    </header>

                    <div className="space-y-16">
                        {sections.map((section, index) => {
                            const Illustration = section.illustration;
                            const contentWithBreaks = t(section.contentKey).replace(/- /g, '<br>- ').replace(/\n/g, '<br/>');
                            
                            return (
                                <section key={section.id} id={section.id} className="scroll-mt-24">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                                        <div className={`flex items-center justify-center h-48 md:h-full ${index % 2 === 0 ? 'md:order-last' : ''}`}>
                                            {/* FIX: Check if 'special' property exists before using it to prevent TypeScript error. */}
                                            <Illustration className={`w-full h-full max-w-[200px] ${'special' in section && section.special ? 'text-[var(--primary-color)]' : ''}`} />
                                        </div>
                                        <div className="md:col-span-2">
                                            <h2 className="text-2xl font-bold text-[var(--text-color)] mb-3">{t(section.titleKey)}</h2>
                                            <div className="prose prose-sm dark:prose-invert max-w-none text-[var(--text-muted-color)]" dangerouslySetInnerHTML={{ __html: contentWithBreaks }} />
                                        </div>
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserManualPage;

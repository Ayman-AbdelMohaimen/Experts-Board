import React, { useState, useEffect } from 'react';
import type { Program, GiftCourse, SpecializedCourse, GiftModule } from '../types';
import { translations } from '../lib/translations';
import { trackEvent } from '../services/analyticsService';
import { AcademicCapIcon } from '../components/icons/AcademicCapIcon';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';
import { ChevronDownIcon } from '../components/icons/ChevronDownIcon';
import { FireIcon } from '../components/icons/FireIcon';
import { CrownIcon } from '../components/icons/CrownIcon';
import { GiftIcon } from '../components/icons/GiftIcon';
import { trainingPrograms, giftCourse, specializedCourses } from '../data/coursesData';

interface OffersPageProps {
  t: (key: keyof typeof translations) => string;
}

const icons = {
  FireIcon,
  CrownIcon,
};

const themeClasses = {
  orange: {
    bg: 'bg-amber-500',
    border: 'border-amber-500',
    shadow: 'shadow-amber-500/30',
    text: 'text-amber-500',
    darkText: 'dark:text-amber-400',
    buttonBg: 'bg-gradient-to-r from-amber-500 to-orange-600',
    buttonHoverBg: 'hover:from-amber-600 hover:to-orange-700',
  },
  indigo: {
    bg: 'bg-[var(--primary-color)]',
    border: 'border-[var(--primary-color)]',
    shadow: 'shadow-cyan-500/30',
    text: 'text-[var(--primary-color)]',
    darkText: 'dark:text-[var(--primary-color-light)]',
    buttonBg: 'bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)]',
    buttonHoverBg: 'hover:from-[var(--gradient-start-hover)] hover:to-[var(--gradient-end-hover)]',
  }
};

const ComingSoonToast: React.FC = () => (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-sky-500/90 text-white font-semibold px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in-up">
        <CheckCircleIcon className="w-6 h-6" />
        قريباً... التسجيل سيفتح قريباً!
    </div>
);

const Accordion: React.FC<{ title: string; children: React.ReactNode; isOpen: boolean; onToggle: () => void; }> = ({ title, children, isOpen, onToggle }) => {
    return (
        <div className="border-t border-white/10">
            <button
                onClick={onToggle}
                className="w-full flex justify-between items-center py-3 text-white/80 hover:text-white"
            >
                <span className="font-semibold">{title}</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="pb-3 text-white/70 animate-fade-in">{children}</div>}
        </div>
    );
};

const ProgramCard: React.FC<{ program: Program; onClick: () => void }> = ({ program, onClick }) => {
    const Icon = icons[program.icon];
    const theme = themeClasses[program.themeColor];
    const [openAccordion, setOpenAccordion] = useState<string | null>('محتويات البرنامج');

    const handleAccordionToggle = (title: string) => {
        setOpenAccordion(prev => (prev === title ? null : title));
    };

    const accordionTitles = {
        contents: "محتويات البرنامج",
        package: "#قيمة الإستثمار",
        requirements: "المتطلبات",
    };


    return (
        <div className={`relative bg-slate-900 border-2 ${theme.border} rounded-3xl shadow-2xl ${theme.shadow} p-8 space-y-6 flex flex-col`}>
            {program.isRecommended && <div className="absolute -top-3 right-8 bg-red-500 text-white text-sm font-bold px-4 py-1 rounded-full shadow-lg">🔥 موصى به</div>}
            
            <div className="text-center space-y-2">
                <Icon className={`w-12 h-12 mx-auto ${theme.text} ${theme.darkText}`} />
                <h3 className="text-3xl font-extrabold text-white">{program.title}</h3>
                <p className="text-base text-white/70 font-semibold -mt-1">بواسطة: {program.instructor}</p>
                <div className="flex justify-center flex-wrap gap-2 text-sm pt-2">
                    <span className="bg-white/10 px-3 py-1 rounded-full">{program.duration}</span>
                    <span className="bg-white/10 px-3 py-1 rounded-full">{program.level}</span>
                    <span className="bg-white/10 px-3 py-1 rounded-full">{program.pathType}</span>
                    <span className={`${theme.bg} text-white px-3 py-1 rounded-full font-semibold`}>{program.discount}</span>
                </div>
            </div>
            
            <p className="text-white/80 text-center flex-grow">{program.description}</p>
            
            <div className="bg-slate-800/50 rounded-xl p-4 space-y-2">
                <Accordion 
                    title={accordionTitles.contents} 
                    isOpen={openAccordion === accordionTitles.contents} 
                    onToggle={() => handleAccordionToggle(accordionTitles.contents)}
                >
                    <ul className="list-disc list-inside space-y-1 text-sm pl-2">
                        {program.contents.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </Accordion>
                <Accordion 
                    title={accordionTitles.package}
                    isOpen={openAccordion === accordionTitles.package}
                    onToggle={() => handleAccordionToggle(accordionTitles.package)}
                >
                     <ul className="space-y-1 text-sm">
                        {program.packageIncludes.map((item, i) => <li key={i} className="flex justify-between"><span>{item.item}</span> <strong>{item.value}</strong></li>)}
                    </ul>
                </Accordion>
                <Accordion 
                    title={accordionTitles.requirements}
                    isOpen={openAccordion === accordionTitles.requirements}
                    onToggle={() => handleAccordionToggle(accordionTitles.requirements)}
                >
                    <ul className="list-disc list-inside space-y-1 text-sm pl-2">
                        {program.requirements.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </Accordion>
            </div>
            
            <div className="text-center space-y-3">
                <p className="text-white/70 text-sm">قيمة الإستثمار <span className="font-bold text-white">{program.totalValue}</span></p>
                <div>
                    <span className="text-4xl font-bold text-white">{program.investment}</span>
                    <span className="text-lg text-white/80"> جنيه مصري</span>
                    <span className="text-lg text-red-400 line-through ml-2">{program.originalPrice}</span>
                </div>
                <button 
                    onClick={onClick}
                    className={`w-full py-3 font-bold text-lg text-white rounded-xl shadow-lg ${theme.buttonBg} ${theme.buttonHoverBg} transform hover:scale-105 transition-all`}>
                    سجل الآن
                </button>
            </div>
        </div>
    );
};

const GiftCourseCard: React.FC<{ course: GiftCourse }> = ({ course }) => (
    <div className="relative bg-[var(--card-background)] backdrop-blur-xl p-8 rounded-2xl border border-yellow-400/50">
        <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 p-4 bg-yellow-400 rounded-full shadow-lg">
            <GiftIcon className="w-8 h-8 text-slate-900" />
        </div>
        <div className="text-center pt-8">
            <h3 className="text-2xl font-bold text-yellow-300">{course.title}</h3>
            <p className="text-[var(--text-muted-color)] mt-1">{course.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 text-left">
                {course.modules.map((mod, i) => (
                    <div key={i} className="bg-slate-500/10 p-4 rounded-lg">
                        <h4 className="font-semibold text-[var(--text-color)] mb-2">{mod.title}</h4>
                        <ul className="list-disc list-inside text-sm text-[var(--text-muted-color)] space-y-1">
                            {mod.items.map((item, j) => <li key={j}>{item}</li>)}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const SpecializedCourseCard: React.FC<{ course: SpecializedCourse; onClick: () => void }> = ({ course, onClick }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-[var(--card-background)] backdrop-blur-xl rounded-2xl shadow-lg border border-[var(--border-color)] flex flex-col transform hover:-translate-y-2 transition-transform duration-300">
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="w-full text-right p-6 focus:outline-none"
                aria-expanded={isOpen}
            >
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-[var(--text-color)] mb-2">{course.title}</h3>
                        <p className="text-sm font-medium text-[var(--text-muted-color)] -mt-1 mb-3">بواسطة: {course.instructor}</p>
                    </div>
                    <ChevronDownIcon className={`w-6 h-6 text-[var(--text-muted-color)] transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
                <p className="text-[var(--text-muted-color)] text-sm mb-4">{course.description}</p>
            </button>
            
            {isOpen && (
                <div className="px-6 pb-6 pt-0 animate-fade-in">
                    <div className="border-t border-[var(--border-muted-color)] pt-4">
                        <h4 className="font-semibold text-[var(--text-color)] mb-2">محتويات الدورة:</h4>
                        <ul className="space-y-1.5">
                            {course.contents.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-muted-color)]">
                                    <CheckCircleIcon className="w-4 h-4 text-green-500 shrink-0 mt-1"/>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
            
            <div className="flex justify-between items-center mt-auto p-6 border-t border-[var(--border-color)] bg-slate-500/5 rounded-b-2xl">
                <div className="font-bold text-xl text-[var(--text-color)]">{course.price} <span className="text-sm">جنيه مصري</span></div>
                <button onClick={onClick} className="px-5 py-2 font-semibold text-white bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] rounded-lg hover:from-[var(--gradient-start-hover)] hover:to-[var(--gradient-end-hover)] transition-all">
                    سجل الآن
                </button>
            </div>
        </div>
    );
};

const OffersPage: React.FC<OffersPageProps> = ({ t }) => {
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        trackEvent('page_view', { pageName: 'Offers' });
    }, []);
    
    const handleCTAClick = () => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    return (
        <div className="space-y-12 animate-fade-in">
            {showToast && <ComingSoonToast />}
            
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-extrabold text-[var(--text-color)]">{t('offersTitle')}</h1>
                <p className="text-lg text-[var(--text-muted-color)] max-w-2xl mx-auto">
                    {t('offersSubtitle')}
                </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {trainingPrograms.map(program => (
                    <ProgramCard key={program.id} program={program} onClick={handleCTAClick} />
                ))}
            </div>

            <GiftCourseCard course={giftCourse} />

            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-[var(--text-color)]">الدورات المتخصصة</h2>
                    <p className="text-[var(--text-muted-color)] mt-1">تعمق في مجالات محددة وعزز مهاراتك مع دوراتنا المركزة.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {specializedCourses.map((course, index) => (
                         <div key={course.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                            <SpecializedCourseCard course={course} onClick={handleCTAClick} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OffersPage;
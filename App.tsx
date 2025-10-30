import React, { useState, useEffect, useRef, lazy, Suspense, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { translations } from './lib/translations';
import { ChatAssistant, ChatAssistantHandle } from './components/ChatAssistant';
import { OnboardingGuide } from './components/OnboardingGuide';
import { FloatingNav } from './components/FloatingNav';
import { AITool } from './types';

// Lazy load pages for better performance
const CvAnalysisPage = lazy(() => import('./pages/CvAnalysisPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const CoursesPage = lazy(() => import('./pages/CoursesPage'));
const OffersPage = lazy(() => import('./pages/OffersPage'));
const DevelopmentPlanPage = lazy(() => import('./pages/DevelopmentPlanPage'));
const LibraryPage = lazy(() => import('./pages/LibraryPage'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AIAgenticPage = lazy(() => import('./pages/AIAgenticPage'));
const UserManualPage = lazy(() => import('./pages/UserManualPage'));

export type Page = 'cvAnalysis' | 'profile' | 'developmentPlan' | 'tasks' | 'community' | 'courses' | 'library' | 'offers' | 'aiAgentic' | 'userManual';
export type Theme = 'light' | 'dark';
export type Language = 'ar' | 'en';
type AppView = 'landing' | 'main';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [language, setLanguage] = useState<Language>('ar');
  const [page, setPage] = useState<Page>('profile');
  const [activeAiTool, setActiveAiTool] = useState<AITool>('content');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [appView, setAppView] = useState<AppView>('landing');
  const chatAssistantRef = useRef<ChatAssistantHandle>(null);


  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.lang = language;
    root.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('language', language);
  }, [language]);
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) setTheme(savedTheme);
    const savedLang = localStorage.getItem('language') as Language | null;
    if (savedLang) setLanguage(savedLang);

    // Check if a profile exists to determine the initial view
    const existingProfile = localStorage.getItem('expertProfile');
    if (existingProfile) {
        setAppView('main');
    }
    
    // Check if onboarding is complete only if we are in the main app view
    if (existingProfile) {
        const onboardingComplete = localStorage.getItem('onboardingComplete');
        if (onboardingComplete !== 'true') {
            setShowOnboarding(true);
        }
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboardingComplete', 'true');
    setShowOnboarding(false);
  };

  const handleToggleSidebar = useCallback(() => {
    if (window.innerWidth < 768) { // Corresponds to Tailwind's 'md' breakpoint
        setIsMobileMenuOpen(prev => !prev);
    } else {
        setIsSidebarPinned(prev => !prev);
    }
  }, []);
  
  const handleMedooToggle = () => {
    chatAssistantRef.current?.toggleOpenState();
  };

  const t = (key: keyof typeof translations) => {
    return translations[key][language];
  };

  const renderPage = () => {
    switch (page) {
      case 'cvAnalysis':
        return <CvAnalysisPage t={t} language={language} onAnalysisComplete={setPage} />;
      case 'profile':
        return <ProfilePage t={t} language={language} onLogout={() => setAppView('landing')} setPage={setPage} />;
      case 'developmentPlan':
        return <DevelopmentPlanPage t={t} language={language} />;
      case 'tasks':
        return <TasksPage t={t} />;
      case 'community':
        return <CommunityPage t={t} />;
      case 'courses':
        return <CoursesPage t={t} />;
      case 'offers':
        return <OffersPage t={t} />;
      case 'library':
        return <LibraryPage t={t} />;
      case 'aiAgentic':
        return <AIAgenticPage t={t} language={language} activeTool={activeAiTool} />;
      case 'userManual':
        return <UserManualPage t={t} language={language} />;
      default:
        return <ProfilePage t={t} language={language} onLogout={() => setAppView('landing')} setPage={setPage} />;
    }
  };
  
  const SuspenseFallback = () => (
    <div className="flex justify-center items-center h-screen w-full">
        <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent border-solid rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className={`min-h-screen ${language === 'ar' ? 'font-[Cairo]' : 'font-sans'}`}>
        <Suspense fallback={<SuspenseFallback />}>
            {appView === 'landing' ? (
                <LandingPage onGetStarted={() => setAppView('main')} t={t} />
            ) : (
                <>
                    {showOnboarding && <OnboardingGuide onComplete={handleOnboardingComplete} t={t} />}
                    <Sidebar 
                        page={page} 
                        setPage={setPage} 
                        activeAiTool={activeAiTool}
                        setActiveAiTool={setActiveAiTool}
                        t={t}
                        onLogoClick={() => setAppView('landing')}
                        isPinned={isSidebarPinned}
                        isOpen={isMobileMenuOpen}
                        onClose={() => setIsMobileMenuOpen(false)}
                    />
                    <div className={`md:pr-[${isSidebarPinned ? '250px' : '90px'}] transition-all duration-300 flex flex-col min-h-screen`}>
                        <Header 
                            theme={theme}
                            setTheme={setTheme}
                            language={language}
                            setLanguage={setLanguage}
                            isSidebarPinned={isSidebarPinned}
                            onToggleSidebar={handleToggleSidebar}
                            onMedooToggle={handleMedooToggle}
                            t={t}
                        />
                        <main className="container mx-auto px-4 md:px-8 pt-28 pb-32 md:pb-24 sm:md:pb-28 flex-grow">
                            <Suspense fallback={
                                <div className="flex justify-center items-center h-64">
                                    <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent border-solid rounded-full animate-spin"></div>
                                </div>
                            }>
                                {renderPage()}
                            </Suspense>
                        </main>
                    </div>
                    <ChatAssistant ref={chatAssistantRef} t={t} language={language} />
                    <FloatingNav page={page} setPage={setPage} t={t} setActiveAiTool={setActiveAiTool} />
                </>
            )}
        </Suspense>
    </div>
  );
};

export default App;
import React from 'react';
import { translations } from '../lib/translations';
import { AnkhIcon } from '../components/icons/AnkhIcon';
import { UploadCloudIcon } from '../components/icons/UploadCloudIcon';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { UserIcon } from '../components/icons/UserIcon';
import { BookOpenIcon } from '../components/icons/BookOpenIcon';
import { DocumentTextIcon } from '../components/icons/DocumentTextIcon';
import { BrainCircuitIcon } from '../components/icons/BrainCircuitIcon';
import { SmileIcon } from '../components/icons/SmileIcon';

interface LandingPageProps {
    onGetStarted: () => void;
    t: (key: keyof typeof translations) => string;
}

const FeatureCard: React.FC<{ icon: React.FC<any>, title: string, description: string, screenshotIcon: React.FC<any> }> = ({ icon: Icon, title, description, screenshotIcon: ScreenshotIcon }) => (
    <div className="bg-slate-900/40 p-6 rounded-2xl border border-[var(--border-color)] backdrop-blur-lg shadow-lg transform hover:-translate-y-2 transition-transform duration-300 h-full flex flex-col">
        <div className="flex items-center mb-4">
            <div className="p-2 bg-[var(--primary-color-translucent)] rounded-lg mr-4 rtl:mr-0 rtl:ml-4">
                <Icon className="w-6 h-6 text-[var(--primary-color-light)]"/>
            </div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        <p className="text-slate-400 mb-4 flex-grow">{description}</p>
        <div className="bg-slate-950/70 rounded-lg p-4 h-40 flex items-center justify-center text-slate-600 border border-slate-800">
            <ScreenshotIcon className="w-16 h-16" />
        </div>
    </div>
);


const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, t }) => {

    const features = [
        { icon: UserIcon, title: t('smartProfile'), description: t('landingFeatureProfileDesc'), screenshotIcon: UserIcon },
        { icon: BookOpenIcon, title: t('courseStructure'), description: t('landingFeatureCourseDesc'), screenshotIcon: BookOpenIcon },
        { icon: DocumentTextIcon, title: t('atsCv'), description: t('landingFeatureCvDesc'), screenshotIcon: DocumentTextIcon },
        { icon: BrainCircuitIcon, title: t('improvementPlan'), description: t('landingFeaturePlanDesc'), screenshotIcon: BrainCircuitIcon },
        { icon: SmileIcon, title: t('medooAssistant'), description: t('landingFeatureChatDesc'), screenshotIcon: SmileIcon },
    ];
    
    return (
        <div className="bg-[var(--background-dark)] text-white animate-fade-in">
             <header className="py-4 px-8 flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    <AnkhIcon className="w-10 h-10" />
                    <span className="text-xl font-bold">GalaxyEd</span>
                 </div>
                 <button 
                    onClick={onGetStarted}
                    className="hidden sm:block px-6 py-2 bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] font-semibold rounded-lg shadow-md hover:from-[var(--gradient-start-hover)] hover:to-[var(--gradient-end-hover)] transition-all"
                 >
                    {t('landingStartNow')}
                </button>
            </header>
            
            <main>
                {/* Hero Section */}
                <section className="text-center py-20 px-4">
                    <div className="max-w-4xl mx-auto">
                        <AnkhIcon className="w-32 h-32 mx-auto mb-6 animate-float-subtle"/>
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
                            {t('landingHeroTitle')}
                        </h1>
                        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-8">
                            {t('landingHeroSubtitle')}
                        </p>
                        <button 
                            onClick={onGetStarted}
                            className="px-8 py-4 bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-lg font-bold text-white rounded-lg shadow-lg shadow-cyan-500/30 hover:from-[var(--gradient-start-hover)] hover:to-[var(--gradient-end-hover)] transform hover:scale-105 transition-all"
                        >
                            {t('landingStartNow')}
                        </button>
                    </div>
                </section>

                {/* How It Works */}
                <section className="py-20 px-4 bg-slate-950/50">
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-12">{t('landingHowItWorks')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                            {[
                                { icon: UploadCloudIcon, title: t('landingStep1Title'), desc: t('landingStep1Desc') },
                                { icon: SparklesIcon, title: t('landingStep2Title'), desc: t('landingStep2Desc') },
                                { icon: UserIcon, title: t('landingStep3Title'), desc: t('landingStep3Desc') },
                                { icon: BookOpenIcon, title: t('landingStep4Title'), desc: t('landingStep4Desc') },
                            ].map((step, index) => {
                                const Icon = step.icon;
                                return (
                                    <div key={index} className="flex flex-col items-center">
                                        <div className="p-4 bg-[var(--primary-color-translucent)] rounded-full mb-4 border-2 border-[var(--primary-color-light)]">
                                            <Icon className="w-10 h-10 text-[var(--primary-color-light)]" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                                        <p className="text-slate-400">{step.desc}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 px-4">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-12">{t('landingFeaturesTitle')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {features.slice(0, 3).map((feature, index) => <FeatureCard key={index} {...feature} />)}
                             <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
                                {features.slice(3).map((feature, index) => <FeatureCard key={index} {...feature} />)}
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Final CTA */}
                <section className="text-center py-20 px-4 bg-slate-950/50">
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            {t('landingFinalCtaTitle')}
                        </h2>
                         <button 
                            onClick={onGetStarted}
                            className="px-8 py-4 bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-lg font-bold text-white rounded-lg shadow-lg shadow-cyan-500/30 hover:from-[var(--gradient-start-hover)] hover:to-[var(--gradient-end-hover)] transform hover:scale-105 transition-all"
                        >
                            {t('landingStartNow')}
                        </button>
                    </div>
                </section>
            </main>

            <footer className="text-center py-6 border-t border-[var(--border-color)]">
                <p className="text-slate-500">Developed by Z@ghosT, Copyright 100MillionDEV</p>
            </footer>
        </div>
    );
};

export default LandingPage;
import React, { useState, useEffect } from 'react';
import type { AnalysisResult } from '../types';
import { BrainCircuitIcon } from '../components/icons/BrainCircuitIcon';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { generateDevelopmentPlan } from '../services/geminiService';
import { translations } from '../lib/translations';
import { Language } from '../App';
import { ActionToolbar } from '../components/ActionToolbar';
import { trackEvent } from '../services/analyticsService';

interface DevelopmentPlanPageProps {
  t: (key: keyof typeof translations) => string;
  language: Language;
}

const playCompletionSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (!audioContext) return;

    const playNote = (frequency: number, startTime: number, duration: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, startTime);
        gainNode.gain.setValueAtTime(0.5, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    };

    const now = audioContext.currentTime;
    playNote(880, now, 0.12); // First "uh"
    playNote(740, now + 0.15, 0.2); // Second "oh"
};


const CategoryCard: React.FC<{ emoji: string; title: string; items: string[] }> = ({ emoji, title, items }) => {
    return (
        <div className="bg-[var(--card-background)] backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-[var(--border-color)] h-full">
            <div className="flex items-center mb-4">
                <div className="text-3xl mr-4 rtl:mr-0 rtl:ml-4">{emoji}</div>
                <h4 className="text-xl font-bold text-[var(--text-color)]">{title}</h4>
            </div>
            <ul className="space-y-2 list-disc list-inside text-[var(--text-muted-color)]">
                {items.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        </div>
    );
};


const DevelopmentPlanPage: React.FC<DevelopmentPlanPageProps> = ({ t, language }) => {
    const [profileData, setProfileData] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            trackEvent('page_view', { pageName: 'DevelopmentPlan' });
            const storedProfile = localStorage.getItem('expertProfile');
            if (storedProfile) {
                setProfileData(JSON.parse(storedProfile));
            }
        } catch (e) {
            console.error("Failed to parse saved profile from localStorage", e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleGeneratePlan = async () => {
        if (!profileData) return;
        setIsGenerating(true);
        setError(null);
        trackEvent('development_plan_generation_started');
        try {
            const plan = await generateDevelopmentPlan(profileData, language);
            const updatedProfile = { ...profileData, ...plan };
            setProfileData(updatedProfile);
            localStorage.setItem('expertProfile', JSON.stringify(updatedProfile));
            playCompletionSound();
            trackEvent('development_plan_generation_success');
        } catch (err) {
            setError('حدث خطأ أثناء إنشاء الخطة. يرجى المحاولة مرة أخرى.');
            console.error(err);
            trackEvent('development_plan_generation_failed', { error: err instanceof Error ? err.message : String(err) });
        } finally {
            setIsGenerating(false);
        }
    };

    const hasDevelopmentPlan = profileData?.assessments && profileData.assessments.length > 0 && profileData?.improvementPlan && profileData.improvementPlan.length > 0;

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent border-solid rounded-full animate-spin"></div></div>;
    }

    if (!profileData) {
        return (
             <div className="flex flex-col items-center justify-center text-center h-[50vh]">
                <div className="p-6 bg-[var(--primary-color-translucent)] rounded-full mb-6">
                    <BrainCircuitIcon className="w-16 h-16 text-[var(--primary-color-light)]" />
                </div>
                <h1 className="text-4xl font-bold text-[var(--text-color)] mb-2">
                    {t('noProfile')}
                </h1>
                <p className="text-lg text-[var(--text-muted-color)]">
                    {t('noProfileDesc')}
                </p>
            </div>
        );
    }
    
    return (
        <div className="animate-fade-in space-y-8">
            {isGenerating ? (
                <div className="flex flex-col items-center justify-center text-center h-[50vh]">
                    <div className="w-16 h-16 border-4 border-[var(--primary-color)] border-t-transparent border-solid rounded-full animate-spin"></div>
                    <p className="mt-4 text-lg font-semibold text-[var(--text-color)] animate-pulse">يقوم الخبير الذكي بتحليل ملفك الآن...</p>
                </div>
            ) : hasDevelopmentPlan ? (
                <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-[var(--primary-color-translucent)] to-emerald-400/10 border border-[var(--border-color)]">
                    <div className="space-y-8 animate-fade-in">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <h2 className="text-3xl font-bold text-[var(--text-color)]">{t('developmentPlan')}</h2>
                            <button
                                onClick={handleGeneratePlan}
                                disabled={isGenerating}
                                className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-white font-semibold rounded-lg shadow-md hover:from-[var(--gradient-start-hover)] hover:to-[var(--gradient-end-hover)] transition-all disabled:opacity-50"
                            >
                                <SparklesIcon className="w-5 h-5 mr-2" />
                                {t('regeneratePlan')}
                            </button>
                        </div>

                        <div className="space-y-12">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-2xl font-bold text-[var(--text-color)]">{t('suggestedAssessments')}</h3>
                                    <ActionToolbar content={profileData.assessments!} type="assessments" title={t('suggestedAssessments')} t={t} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {profileData.assessments!.map((cat, i) => (
                                        <CategoryCard key={`assess-${i}`} emoji={cat.emoji} title={cat.category} items={cat.suggestions} />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-2xl font-bold text-[var(--text-color)]">{t('improvementPlan')}</h3>
                                    <ActionToolbar content={profileData.improvementPlan!} type="improvementPlan" title={t('improvementPlan')} t={t} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {profileData.improvementPlan!.map((cat, i) => (
                                        <CategoryCard key={`improve-${i}`} emoji={cat.emoji} title={cat.category} items={cat.suggestions} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-center h-[50vh]">
                    <div className="p-6 bg-[var(--primary-color-translucent)] rounded-full mb-6">
                        <SparklesIcon className="w-16 h-16 text-[var(--primary-color-light)]" />
                    </div>
                    <h1 className="text-4xl font-bold text-[var(--text-color)] mb-2">
                        {t('generatePlan')}
                    </h1>
                    <p className="text-lg text-[var(--text-muted-color)] max-w-2xl mb-6">
                        {t('generatePlanDesc')}
                    </p>
                    {error && <p className="text-sm text-[var(--error-color)] dark:text-[var(--error-color-light)] mb-4">{error}</p>}
                    <button
                        onClick={handleGeneratePlan}
                        disabled={isGenerating}
                        className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-white text-lg font-semibold rounded-lg shadow-md hover:from-[var(--gradient-start-hover)] hover:to-[var(--gradient-end-hover)] transition-all disabled:opacity-50"
                    >
                        <SparklesIcon className="w-6 h-6 mr-3" />
                        {t('consultExpert')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default DevelopmentPlanPage;
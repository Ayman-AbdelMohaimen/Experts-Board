

import React, { useState } from 'react';
import type { AnalysisResult } from '../types';
import { ProfileCard } from './ProfileCard';
import { Timeline } from './Timeline';
import { CourseOutlineView } from './CourseOutlineView';
import { AtsCvPreview } from './AtsCvPreview';
import { SuggestionsCard } from './SuggestionsCard';
import { UserIcon } from './icons/UserIcon';
import { TimelineIcon } from './icons/TimelineIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { SaveIcon } from './icons/SaveIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { Language } from '../App';
import { translations } from '../lib/translations';

interface DashboardProps {
  data: AnalysisResult;
  onSave: () => void;
  onRegenerate: () => void;
  onStartOver: () => void;
  t: (key: keyof typeof translations) => string;
  language: Language;
}

type Tab = 'profile' | 'timeline' | 'course' | 'cv';

export const Dashboard: React.FC<DashboardProps> = ({ data, onSave, onRegenerate, onStartOver, t, language }) => {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: t('smartProfile'), icon: <UserIcon className="w-5 h-5 mr-2" /> },
    { id: 'timeline', label: t('timeline'), icon: <TimelineIcon className="w-5 h-5 mr-2" /> },
    { id: 'course', label: t('courseStructure'), icon: <BookOpenIcon className="w-5 h-5 mr-2" /> },
    { id: 'cv', label: t('atsCv'), icon: <DocumentTextIcon className="w-5 h-5 mr-2" /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileCard profile={data.profile} t={t} language={language} />;
      case 'timeline':
        return <Timeline events={data.timeline} t={t} />;
      case 'course':
        return <CourseOutlineView outline={data.courseOutline} t={t} language={language} />;
      case 'cv':
        return <AtsCvPreview cv={data.atsCv} t={t} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
       <div className="bg-[var(--card-background)] backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-[var(--border-color)] text-center">
            <div className="flex items-center justify-center mb-2">
                <SparklesIcon className="w-8 h-8 text-[var(--primary-color)] dark:text-[var(--primary-color-light)] mr-3" />
                <h2 className="text-2xl font-bold text-[var(--text-color)]">{t('analysisComplete')}</h2>
            </div>
            <p className="text-[var(--text-muted-color)] mb-4">{t('analysisCompleteDesc')}</p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
                <button
                    onClick={onSave}
                    className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-white font-semibold rounded-lg shadow-md hover:from-[var(--gradient-start-hover)] hover:to-[var(--gradient-end-hover)] transition-all"
                >
                    <SaveIcon className="w-5 h-5 mr-2" />
                    {t('saveToProfile')}
                </button>
                 <button
                    onClick={onRegenerate}
                    className="flex items-center justify-center px-6 py-3 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 transition"
                >
                    <RefreshIcon className="w-5 h-5 mr-2" />
                    {t('regenerate')}
                </button>
                <button
                    onClick={onStartOver}
                    className="px-6 py-3 bg-[var(--button-muted-background)] text-[var(--text-color)] font-semibold rounded-lg hover:bg-[var(--button-muted-hover-background)] transition"
                >
                    {t('startOver')}
                </button>
            </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[var(--card-background)] backdrop-blur-xl p-2 rounded-2xl shadow-lg border border-[var(--border-color)]">
            <div className="flex border-b border-[var(--border-muted-color)]">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center text-sm md:text-base px-3 py-3 font-semibold transition-colors duration-200 ease-in-out w-full
                    ${activeTab === tab.id ? 'text-[var(--primary-color)] dark:text-[var(--primary-color-light)] border-b-2 border-[var(--primary-color)]' : 'text-[var(--text-muted-color)] hover:bg-slate-500/10'}`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="p-2 sm:p-6">{renderContent()}</div>
          </div>
        </div>
        <div className="lg:col-span-1 space-y-8">
            {data.assessments && data.assessments.length > 0 && (
              <SuggestionsCard title={t('suggestedAssessments')} categories={data.assessments} icon={<CheckCircleIcon className="w-6 h-6 text-white" />} type="assessments" t={t} />
            )}
            {data.improvementPlan && data.improvementPlan.length > 0 && (
              <SuggestionsCard title={t('improvementPlan')} categories={data.improvementPlan} icon={<LightBulbIcon className="w-6 h-6 text-white" />} type="improvementPlan" t={t} />
            )}
        </div>
      </div>
    </div>
  );
};
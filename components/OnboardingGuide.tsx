import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { translations } from '../lib/translations';
import { ScarabBeetleIcon } from './icons/ScarabBeetleIcon';
import { UploadCloudIcon } from './icons/UploadCloudIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { UsersIcon } from './icons/UsersIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { EyeOfRaIcon } from './icons/EyeOfRaIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';

interface OnboardingGuideProps {
  onComplete: () => void;
  t: (key: keyof typeof translations) => string;
}

const steps = [
  {
    icon: ScarabBeetleIcon,
    titleKey: 'onboardingWelcomeTitle',
    descKey: 'onboardingWelcomeDesc',
  },
  {
    icon: UploadCloudIcon,
    titleKey: 'onboardingUploadTitle',
    descKey: 'onboardingUploadDesc',
  },
  {
    icon: SparklesIcon,
    titleKey: 'onboardingAnalysisTitle',
    descKey: 'onboardingAnalysisDesc',
  },
  {
    icon: UsersIcon,
    titleKey: 'onboardingDashboardTitle',
    descKey: 'onboardingDashboardDesc',
  },
  {
    icon: BookOpenIcon,
    titleKey: 'onboardingCourseTitle',
    descKey: 'onboardingCourseDesc',
  },
  {
    icon: BookmarkIcon,
    titleKey: 'onboardingLibraryTitle',
    descKey: 'onboardingLibraryDesc',
  },
  {
    icon: EyeOfRaIcon,
    titleKey: 'onboardingChatTitle',
    descKey: 'onboardingChatDesc',
  },
];

export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ onComplete, t }) => {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const currentStep = steps[step];
  const Icon = currentStep.icon;

  const progressPercentage = ((step + 1) / steps.length) * 100;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="bg-slate-900/80 backdrop-blur-xl border border-red-500/30 rounded-2xl shadow-2xl shadow-red-500/20 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Progress Bar */}
        <div className="w-full bg-slate-700/50 h-1.5">
            <div 
                className="bg-red-600 h-1.5 rounded-r-full transition-all duration-500 ease-out shadow-[0_0_10px_theme(colors.red.500)]" 
                style={{ width: `${progressPercentage}%` }}
            ></div>
        </div>

        {/* Header */}
        <div className="p-4 flex justify-between items-center">
           <span className="text-sm font-bold text-amber-400">
                {`${t('onboardingStep')} ${step + 1} / ${steps.length}`}
           </span>
           <button onClick={onComplete} className="text-sm font-semibold text-slate-400 hover:text-white">
             {t('onboardingSkip')}
           </button>
        </div>
        
        {/* Content */}
        <div key={step} className="p-8 text-center flex-grow flex flex-col items-center justify-center min-h-[300px] animate-fade-in-up">
            <div className="w-24 h-24 mb-6 flex items-center justify-center bg-red-900/30 border border-red-500/50 rounded-full p-4 transform transition-transform duration-500 hover:scale-110">
                <Icon className="w-full h-full text-amber-300" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-white">{t(currentStep.titleKey)}</h2>
            <p className="text-slate-300">{t(currentStep.descKey)}</p>
        </div>
        
        {/* Step Dots */}
        <div className="flex justify-center gap-2 mb-4">
            {steps.map((_, index) => (
                <div 
                    key={index} 
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 
                        ${step === index ? 'bg-red-500 scale-125' : 'bg-slate-600'} 
                        ${step > index ? 'bg-red-500/60' : ''}`} 
                />
            ))}
        </div>

        {/* Footer */}
        <div className="p-4 flex justify-between items-center bg-black/30 border-t border-red-500/30">
            <button 
              onClick={handlePrev}
              disabled={step === 0}
              className="px-4 py-2 text-white font-semibold rounded-lg hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('onboardingPrev')}
            </button>
            <button 
              onClick={handleNext}
              className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md shadow-red-500/30 hover:bg-red-700 transition"
            >
              {step === steps.length - 1 ? t('onboardingFinish') : t('onboardingNext')}
            </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

import React, { useState } from 'react';
import { FileUpload } from '../components/FileUpload';
import { Dashboard } from '../components/Dashboard';
import { Loader } from '../components/Loader';
import { analyzeExpertData } from '../services/geminiService';
import type { AnalysisResult } from '../types';
import { translations } from '../lib/translations';
import { Language, Page } from '../App';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';
import { trackEvent } from '../services/analyticsService';
import { DocumentTextIcon } from '../components/icons/DocumentTextIcon';

const playAnalysisCompletionSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (!audioContext) return;

    const playNote = (frequency: number, startTime: number, duration: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, startTime);
        gainNode.gain.setValueAtTime(0.1, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    };

    const now = audioContext.currentTime;
    playNote(880, now, 0.12);
    playNote(740, now + 0.15, 0.2);
};

const ConfirmationToast: React.FC<{ message: string }> = ({ message }) => (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-green-500/90 text-white font-semibold px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in-up">
        <CheckCircleIcon className="w-6 h-6" />
        {message}
    </div>
);

interface CvAnalysisPageProps {
  t: (key: keyof typeof translations) => string;
  language: Language;
  onAnalysisComplete: (page: Page) => void;
}

const CvAnalysisPage: React.FC<CvAnalysisPageProps> = ({ t, language, onAnalysisComplete }) => {
  const [previewResult, setPreviewResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastAnalysisContent, setLastAnalysisContent] = useState<string | null>(null);
  const [lastImageParts, setLastImageParts] = useState<any[]>([]);
  const [lastProfilePicture, setLastProfilePicture] = useState<string | null>(null);


  const handleAnalyze = async (textContent: string, imageParts: any[], profilePicture: string | null) => {
    setIsAnalyzing(true);
    setError(null);
    setPreviewResult(null);
    setLastAnalysisContent(textContent);
    setLastImageParts(imageParts);
    setLastProfilePicture(profilePicture);
    trackEvent('analysis_started');

    try {
      const result = await analyzeExpertData(textContent, imageParts, language);
       if (profilePicture) {
        result.profile.profilePicture = profilePicture;
      }
      setPreviewResult(result);
      playAnalysisCompletionSound();
      trackEvent('analysis_success');
    } catch (err) {
      setError(t('analysisError'));
      console.error(err);
      trackEvent('analysis_failed', { error: err instanceof Error ? err.message : String(err) });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRegenerate = () => {
    if (lastAnalysisContent !== null) {
      trackEvent('analysis_regenerated');
      handleAnalyze(lastAnalysisContent, lastImageParts, lastProfilePicture);
    }
  };

  const handleSaveProfile = () => {
    if (previewResult) {
      const existingProfile = localStorage.getItem('expertProfile');
      if (existingProfile && !window.confirm(t('overwriteProfileConfirm'))) {
          return; // User cancelled overwrite
      }

      localStorage.setItem('expertProfile', JSON.stringify(previewResult));
      setPreviewResult(null);
      setShowConfirmation(t('profileSavedSuccess'));
      trackEvent('profile_saved');
      
      setTimeout(() => {
        setShowConfirmation(null);
        onAnalysisComplete('profile');
      }, 2000);
    }
  };

  const handleStartOver = () => {
    setPreviewResult(null);
    setError(null);
    trackEvent('analysis_started_over');
  };

  const renderContent = () => {
    if (previewResult) {
      return <Dashboard 
                data={previewResult} 
                onSave={handleSaveProfile} 
                onRegenerate={handleRegenerate}
                onStartOver={handleStartOver}
                t={t}
                language={language}
             />;
    }
    
    return (
      <div className="max-w-2xl mx-auto">
         {error && (
            <div className="bg-[var(--error-background-translucent)] border border-[var(--error-border-translucent)] text-[var(--error-color-dark)] dark:text-[var(--error-color-light)] px-4 py-3 rounded-lg relative mb-6" role="alert">
                <strong className="font-bold">{t('errorAlert')}</strong>
                <span className="block sm:inline"> {error}</span>
            </div>
        )}
        <FileUpload onAnalyze={handleAnalyze} t={t} />
      </div>
    );
  };


  return (
    <>
      {isAnalyzing && <Loader language={language} />}
      {showConfirmation && <ConfirmationToast message={showConfirmation} />}
      {renderContent()}
    </>
  );
};

export default CvAnalysisPage;
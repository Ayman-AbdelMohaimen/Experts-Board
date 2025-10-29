import React, { useState, useEffect } from 'react';
import type { AnalysisResult } from '../types';
import { UserDashboard } from '../components/UserDashboard';
import { translations } from '../lib/translations';
import { Language, Page } from '../App';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';
import { trackEvent } from '../services/analyticsService';
import { DocumentTextIcon } from '../components/icons/DocumentTextIcon';

const ConfirmationToast: React.FC<{ message: string }> = ({ message }) => (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-green-500/90 text-white font-semibold px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in-up">
        <CheckCircleIcon className="w-6 h-6" />
        {message}
    </div>
);

interface ProfilePageProps {
  t: (key: keyof typeof translations) => string;
  language: Language;
  onLogout: () => void;
  setPage: (page: Page) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ t, language, onLogout, setPage }) => {
  const [savedProfile, setSavedProfile] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState<string | null>(null);

  useEffect(() => {
    try {
      trackEvent('page_view', { pageName: 'Profile' });
      const storedProfile = localStorage.getItem('expertProfile');
      if (storedProfile) {
        setSavedProfile(JSON.parse(storedProfile));
      } else {
        setSavedProfile(null);
      }
    } catch (e) {
      console.error("Failed to parse saved profile from localStorage", e);
      localStorage.removeItem('expertProfile');
      setSavedProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDeleteProfile = () => {
    if (window.confirm(t('deleteProfileConfirm'))) {
        localStorage.removeItem('expertProfile');
        localStorage.removeItem('expertLibrary');
        localStorage.removeItem('developmentTasks');
        setSavedProfile(null);
        trackEvent('profile_deleted');
        onLogout(); // This will trigger the app view to change to 'landing'
    }
  };
  
  const handleUpdateProfile = (updatedProfile: AnalysisResult) => {
    setSavedProfile(updatedProfile);
    localStorage.setItem('expertProfile', JSON.stringify(updatedProfile));
    setShowConfirmation(t('profileUpdatedSuccess'));
    setTimeout(() => setShowConfirmation(null), 3000);
    trackEvent('profile_updated');
  }

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-64"><div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent border-solid rounded-full animate-spin"></div></div>;
    }

    if (savedProfile) {
      return <UserDashboard 
                profileData={savedProfile} 
                onUpdate={handleUpdateProfile} 
                onDelete={handleDeleteProfile} 
                t={t} 
                language={language} 
             />;
    }
    
    // No profile found view
    return (
        <div className="flex flex-col items-center justify-center text-center h-[50vh] animate-fade-in">
          <div className="p-6 bg-[var(--primary-color-translucent)] rounded-full mb-6">
            <DocumentTextIcon className="w-16 h-16 text-[var(--primary-color-light)]" />
          </div>
          <h1 className="text-4xl font-bold text-[var(--text-color)] mb-2">
            {t('noProfileFound')}
          </h1>
          <p className="text-lg text-[var(--text-muted-color)] max-w-md mx-auto mb-8">
            {t('pageDescription')}
          </p>
          <button
            onClick={() => setPage('cvAnalysis')}
            className="px-8 py-4 bg-[var(--primary-color)] text-lg font-bold text-white rounded-lg shadow-lg shadow-indigo-500/30 hover:bg-[var(--primary-color-hover)] transform hover:scale-105 transition-all"
          >
            {t('goToAnalysisPage')}
          </button>
        </div>
    );
  };


  return (
    <>
      {showConfirmation && <ConfirmationToast message={showConfirmation} />}
      {renderContent()}
    </>
  );
};

export default ProfilePage;

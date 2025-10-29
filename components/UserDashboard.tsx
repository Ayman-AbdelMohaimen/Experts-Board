import React, { useState } from 'react';
import type { AnalysisResult, SuggestionCategory } from '../types';
import { Timeline } from './Timeline';
import { CourseOutlineView } from './CourseOutlineView';
import { AtsCvPreview } from './AtsCvPreview';
import { ProfileHeaderSection } from './ProfileHeaderSection';
import { ExpertExtrasSection } from './ExpertExtrasSection';
import { translations } from '../lib/translations';
import { Language } from '../App';
import { UpdateProfileModal } from './UpdateProfileModal';
import { generateAssessmentsForCourse } from '../services/geminiService';

interface UserDashboardProps {
  profileData: AnalysisResult;
  onUpdate: (updatedProfile: AnalysisResult) => void;
  onDelete: () => void;
  t: (key: keyof typeof translations) => string;
  language: Language;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ profileData, onUpdate, onDelete, t, language }) => {
  const [localData, setLocalData] = useState<AnalysisResult>(profileData);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const handleUpdate = <K extends keyof AnalysisResult>(section: K, data: AnalysisResult[K]) => {
      const updatedData = { ...localData, [section]: data };
      setLocalData(updatedData);
      onUpdate(updatedData); // Persist changes
  };
  
  const handleProfileUpdateFromModal = (updatedData: AnalysisResult) => {
    setLocalData(updatedData);
    onUpdate(updatedData);
    setIsUpdateModalOpen(false);
  }

  const handleGenerateAssessments = async () => {
    try {
        const newAssessments = await generateAssessmentsForCourse(localData.courseOutline, language);
        const updatedData = { ...localData, assessments: newAssessments };
        // Note: The assessments are part of the Development Plan, which is not directly displayed here.
        // We update the main profile object, and this will be reflected if the user navigates
        // to the development plan page or if a suggestions card for assessments is visible.
        onUpdate(updatedData);
        setLocalData(updatedData);
         alert(t('assessmentsGeneratedSuccess')); // Simple feedback
    } catch (e) {
        console.error("Failed to generate assessments", e);
        alert(t('assessmentsGeneratedError'));
    }
  };


  return (
    <>
      <UpdateProfileModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        currentProfile={localData}
        onUpdateProfile={handleProfileUpdateFromModal}
        language={language}
        t={t}
      />
      <div className="space-y-8 animate-fade-in">
        <ProfileHeaderSection 
            profile={localData.profile} 
            isEditable={true} 
            onUpdate={(data) => handleUpdate('profile', data)}
            onDelete={onDelete}
            onOpenUpdateModal={() => setIsUpdateModalOpen(true)}
            t={t}
            language={language}
        />
        <Timeline 
            events={localData.timeline} 
            isEditable={true} 
            onUpdate={(data) => handleUpdate('timeline', data)}
            t={t}
        />
        <ExpertExtrasSection
            profile={localData.profile}
            isEditable={true}
            onUpdate={(data) => handleUpdate('profile', data)}
            t={t}
        />
        <div>
            <h2 className="text-3xl font-bold text-[var(--text-color)] mb-4">{t('courseStructure')}</h2>
            <CourseOutlineView 
                outline={localData.courseOutline} 
                isEditable={true} 
                onUpdate={(data) => handleUpdate('courseOutline', data)}
                onGenerateAssessments={handleGenerateAssessments}
                t={t}
                language={language}
            />
        </div>
        <AtsCvPreview 
            cv={localData.atsCv} 
            isEditable={true}
            onUpdate={(data) => handleUpdate('atsCv', data)}
            t={t}
        />
      </div>
    </>
  );
};
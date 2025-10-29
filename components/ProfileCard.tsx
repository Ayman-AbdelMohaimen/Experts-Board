import React from 'react';
import type { ExpertProfile } from '../types';
import { ProfileHeaderSection } from './ProfileHeaderSection';
import { ExpertExtrasSection } from './ExpertExtrasSection';
import { Language } from '../App';
import { translations } from '../lib/translations';

interface ProfileCardProps {
  profile: ExpertProfile;
  t: (key: keyof typeof translations) => string;
  language: Language;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, t, language }) => {
  return (
    <div className="space-y-8">
      <ProfileHeaderSection profile={profile} t={t} language={language}/>
      <ExpertExtrasSection profile={profile} t={t} />
    </div>
  );
};
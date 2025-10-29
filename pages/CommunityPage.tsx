import React, { useEffect } from 'react';
import { UsersIcon } from '../components/icons/UsersIcon';
import { translations } from '../lib/translations';
import { trackEvent } from '../services/analyticsService';

interface CommunityPageProps {
  t: (key: keyof typeof translations) => string;
}

const CommunityPage: React.FC<CommunityPageProps> = ({ t }) => {
  useEffect(() => {
    trackEvent('page_view', { pageName: 'Community' });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center h-[50vh]">
      <div className="p-6 bg-[var(--primary-color-translucent)] rounded-full mb-6">
        <UsersIcon className="w-16 h-16 text-[var(--primary-color-light)]" />
      </div>
      <h1 className="text-4xl font-bold text-[var(--text-color)] mb-2">
        {t('pageUnderDevelopment')}
      </h1>
      <p className="text-lg text-[var(--text-muted-color)]">
        {t('pageDescription')}
      </p>
    </div>
  );
};

export default CommunityPage;

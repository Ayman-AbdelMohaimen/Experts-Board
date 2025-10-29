import React from 'react';
import type { SuggestionCategory } from '../types';
import { ActionToolbar } from './ActionToolbar';
import { translations } from '../lib/translations';

interface SuggestionsCardProps {
  title: string;
  categories: SuggestionCategory[];
  icon: React.ReactNode;
  type: 'assessments' | 'improvementPlan'; // To identify what is being saved
  t: (key: keyof typeof translations) => string;
}

export const SuggestionsCard: React.FC<SuggestionsCardProps> = ({ title, categories, icon, type, t }) => {
  return (
    <div className="bg-[var(--card-background)] backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-[var(--border-color)] h-full">
      <div className="flex items-start justify-between mb-4 gap-2">
        <div className="flex items-center">
          <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-[var(--primary-color)] mr-4 rtl:mr-0 rtl:ml-4">
            {icon}
          </div>
          <h4 className="text-xl font-bold text-[var(--text-color)]">{title}</h4>
        </div>
        <div className="flex-shrink-0">
          <ActionToolbar content={categories} type={type} title={title} t={t} />
        </div>
      </div>
      <div className="space-y-4">
        {categories.map((category, index) => (
          <div key={index}>
            <div className="flex items-center mb-2">
              <span className="text-xl mr-2 rtl:mr-0 rtl:ml-2">{category.emoji}</span>
              <h5 className="font-semibold text-[var(--text-color)]">{category.category}</h5>
            </div>
            <ul className="space-y-1 list-disc list-inside text-[var(--text-muted-color)] pl-4 rtl:pr-4">
              {category.suggestions.map((suggestion, sIndex) => (
                <li key={sIndex}>{suggestion}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
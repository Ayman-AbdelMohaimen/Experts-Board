import React, { lazy, Suspense } from 'react';
import { translations } from '../lib/translations';
import { Language } from '../App';
import { AITool } from '../types';

const ContentGenerator = lazy(() => import('../components/ai_tools/ContentGenerator'));
const VideoGenerator = lazy(() => import('../components/ai_tools/VideoGenerator'));
const ToolPlaceholder = lazy(() => import('../components/ai_tools/ToolPlaceholder'));

interface AIAgenticPageProps {
  t: (key: keyof typeof translations) => string;
  language: Language;
  activeTool: AITool;
}

const AIAgenticPage: React.FC<AIAgenticPageProps> = ({ t, language, activeTool }) => {

    const renderActiveTool = () => {
        switch (activeTool) {
            case 'content':
                return <ContentGenerator t={t} language={language} />;
            case 'video':
                return <VideoGenerator t={t} language={language} />;
            case 'image':
            case 'marketingPlan':
            case 'marketResearch':
            case 'swot':
                 const toolNameMap: Record<AITool, string> = {
                    image: t('imageGenerator'),
                    marketingPlan: t('marketingPlan'),
                    marketResearch: t('marketResearch'),
                    swot: t('swotAnalysis'),
                    content: '', // Will not be used here
                    video: '', // Will not be used here
                };
                return <ToolPlaceholder toolName={toolNameMap[activeTool]} />;
            default:
                return null;
        }
    };

    return (
        <main className="flex-grow">
            <Suspense fallback={
                <div className="flex justify-center items-center h-64">
                    <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent border-solid rounded-full animate-spin"></div>
                </div>
            }>
                {renderActiveTool()}
            </Suspense>
        </main>
    );
};

export default AIAgenticPage;

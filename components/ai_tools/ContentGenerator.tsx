import React, { useState } from 'react';
import { translations } from '../../lib/translations';
import { Language } from '../../App';
import { generateText } from '../../services/multiModelService';
import { RobotIcon } from '../icons/RobotIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { SparklesIcon } from '../icons/SparklesIcon';

interface ContentGeneratorProps {
    t: (key: keyof typeof translations) => string;
    language: Language;
}

const createSanitizedMarkup = (text: string) => {
    if (!(window as any).DOMPurify) {
        console.error('DOMPurify not loaded. Cannot sanitize HTML.');
        const safeText = document.createTextNode(text).textContent || '';
        return { __html: safeText.replace(/\n/g, '<br />') };
    }

    const dirtyHTML = text
        .replace(/\n/g, '<br/>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    const cleanHTML = (window as any).DOMPurify.sanitize(dirtyHTML);
    return { __html: cleanHTML };
};

const ContentGenerator: React.FC<ContentGeneratorProps> = ({ t, language }) => {
    const [prompt, setPrompt] = useState('');
    const [model, setModel] = useState('gemini-2.5-flash');
    const [quality, setQuality] = useState('high');
    const [contentType, setContentType] = useState('article');
    const [contentLength, setContentLength] = useState('short');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setIsLoading(true);
        setResult('');
        setError('');

        const systemInstruction = `You are an expert content creator. Generate a compelling piece of content based on the user's request.
        Language: ${language === 'ar' ? 'Arabic' : 'English'}
        Content Type: ${contentType}
        Length: ${contentLength} (${contentLength === 'short' ? '100-300 words' : contentLength === 'medium' ? '300-600 words' : '600+ words'})
        Quality: ${quality} (write in a professional, high-quality manner)
        Format your response using Markdown.`;
        
        try {
            const generatedText = await generateText(systemInstruction, prompt, model);
            setResult(generatedText);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const SelectField: React.FC<{label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode}> = ({label, value, onChange, children}) => (
        <div>
            <label className="block text-sm font-medium text-[var(--text-muted-color)] mb-1">{label}</label>
            <select
                value={value}
                onChange={onChange}
                className="w-full p-2 border rounded-lg bg-[var(--input-background)] border-[var(--border-muted-color)] text-[var(--text-color)] focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
            >
                {children}
            </select>
        </div>
    );


    return (
        <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-[var(--text-color)]">{t('contentGenerator')}</h1>
                <PencilIcon className="w-7 h-7 text-[var(--text-muted-color)]" />
            </div>
            <p className="text-[var(--text-muted-color)] mb-6">{t('contentGeneratorSubtitle')}</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Result */}
                <div className="bg-[var(--card-background)] backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-[var(--border-color)] h-full min-h-[400px] lg:min-h-[500px] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent border-solid rounded-full animate-spin mb-4"></div>
                            <p className="text-lg font-semibold text-[var(--text-color)]">{t('generating')}</p>
                        </div>
                    ) : result ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none text-[var(--text-color)]" dangerouslySetInnerHTML={createSanitizedMarkup(result)} />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-[var(--text-muted-color)]">
                            <RobotIcon className="w-16 h-16 mb-4" />
                            <p>{t('resultPlaceholder')}</p>
                        </div>
                    )}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label htmlFor="prompt" className="block text-sm font-medium text-[var(--text-muted-color)] mb-1">{t('describeContent')}</label>
                        <textarea
                            id="prompt"
                            rows={5}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="اكتب وصفاً تفصيلياً لما تريد إنشاءه..."
                            className="w-full p-2 border rounded-lg bg-[var(--input-background)] border-[var(--border-muted-color)] text-[var(--text-color)] focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <SelectField label={t('aiModel')} value={model} onChange={(e) => setModel(e.target.value)}>
                            <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                            <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                            <option value="qwen3-32b">Qwen3-32B (Huawei)</option>
                            <option value="deepseek-v3.1">DeepSeek-v3.1 (Huawei)</option>
                        </SelectField>
                        <SelectField label={t('resultQuality')} value={quality} onChange={(e) => setQuality(e.target.value)}>
                            <option value="high">عالية</option>
                            <option value="medium">متوسطة</option>
                        </SelectField>
                        <SelectField label={t('contentType')} value={contentType} onChange={(e) => setContentType(e.target.value)}>
                            <option value="article">مقال</option>
                            <option value="blog_post">منشور مدونة</option>
                            <option value="social_media_post">منشور تواصل اجتماعي</option>
                            <option value="email">بريد إلكتروني</option>
                        </SelectField>
                        <SelectField label={t('contentLength')} value={contentLength} onChange={(e) => setContentLength(e.target.value)}>
                            <option value="short">قصير (100-300 كلمة)</option>
                            <option value="medium">متوسط (300-600 كلمة)</option>
                            <option value="long">طويل (600+ كلمة)</option>
                        </SelectField>
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <button
                        type="submit"
                        disabled={isLoading || !prompt.trim()}
                        className="w-full flex items-center justify-center gap-2 py-3 px-6 text-lg font-semibold text-white bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] rounded-lg shadow-md hover:from-[var(--gradient-start-hover)] hover:to-[var(--gradient-end-hover)] disabled:bg-slate-500 disabled:from-slate-500 disabled:to-slate-600 disabled:cursor-not-allowed transition-all"
                    >
                        <SparklesIcon className="w-6 h-6" />
                        {isLoading ? t('generating') : t('generateContent')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ContentGenerator;

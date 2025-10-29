import React, { useState, useEffect } from 'react';
import { translations } from '../../lib/translations';
import { Language } from '../../App';
import { generateVideo } from '../../services/geminiService';
import { RobotIcon } from '../icons/RobotIcon';
import { VideoCameraIcon } from '../icons/VideoCameraIcon';
import { SparklesIcon } from '../icons/SparklesIcon';

interface VideoGeneratorProps {
    t: (key: keyof typeof translations) => string;
    language: Language;
}

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ t, language }) => {
    const [prompt, setPrompt] = useState('');
    const [duration, setDuration] = useState(15);
    const [resolution, setResolution] = useState('720p');
    const [aspectRatio, setAspectRatio] = useState('16:9');
    
    const [isLoading, setIsLoading] = useState(false);
    const [resultUrl, setResultUrl] = useState('');
    const [error, setError] = useState('');

    const [hasApiKey, setHasApiKey] = useState(false);

    useEffect(() => {
        const checkApiKey = async () => {
            if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
                const keyStatus = await window.aistudio.hasSelectedApiKey();
                setHasApiKey(keyStatus);
            }
        };
        checkApiKey();
    }, []);

    const handleSelectKey = async () => {
        if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
            await window.aistudio.openSelectKey();
            // Assume success after dialog opens to avoid race conditions
            setHasApiKey(true);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || !hasApiKey) return;

        setIsLoading(true);
        setResultUrl('');
        setError('');
        
        try {
            const config = { resolution, aspectRatio, duration };
            const videoUrl = await generateVideo(prompt, config);
            setResultUrl(videoUrl);
        } catch (err) {
            let errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
             if (errorMessage.includes("Requested entity was not found.")) {
                errorMessage = "API Key error. Please re-select your key.";
                setHasApiKey(false); // Reset key state
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const SelectField: React.FC<{label: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode}> = ({label, value, onChange, children}) => (
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
    
    if (!hasApiKey) {
        return (
            <div className="bg-[var(--card-background)] backdrop-blur-xl p-8 rounded-2xl shadow-lg border border-[var(--border-color)] text-center animate-fade-in">
                <h2 className="text-2xl font-bold mb-2">{t('selectApiKey')}</h2>
                <p className="text-[var(--text-muted-color)] mb-4">{t('selectApiKeyDescription')} <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-[var(--primary-color)] underline">{t('billingInfo')}</a></p>
                <button onClick={handleSelectKey} className="px-6 py-3 bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-white font-semibold rounded-lg shadow-md hover:from-[var(--gradient-start-hover)] hover:to-[var(--gradient-end-hover)] transition-all">
                    {t('selectApiKey')}
                </button>
            </div>
        )
    }

    return (
        <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-[var(--text-color)]">{t('videoGenerator')}</h1>
                <VideoCameraIcon className="w-7 h-7 text-[var(--text-muted-color)]" />
            </div>
            <p className="text-[var(--text-muted-color)] mb-6">{t('videoGeneratorSubtitle')}</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Result */}
                <div className="bg-[var(--card-background)] backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-[var(--border-color)] h-full min-h-[400px] lg:min-h-[500px] flex items-center justify-center">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent border-solid rounded-full animate-spin mb-4"></div>
                            <p className="text-lg font-semibold text-[var(--text-color)]">{t('videoIsGenerating')}</p>
                            <p className="text-sm text-[var(--text-muted-color)]">{t('videoTakesTime')}</p>
                        </div>
                    ) : resultUrl ? (
                       <video src={resultUrl} controls autoPlay loop className="w-full h-full rounded-lg object-contain" />
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
                        <label htmlFor="prompt" className="block text-sm font-medium text-[var(--text-muted-color)] mb-1">{t('describeVideo')}</label>
                        <textarea
                            id="prompt"
                            rows={5}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="A neon hologram of a cat driving at top speed..."
                            className="w-full p-2 border rounded-lg bg-[var(--input-background)] border-[var(--border-muted-color)] text-[var(--text-color)] focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <SelectField label={t('aiModel')} value={'veo'} onChange={() => {}}>
                            <option value="veo">Veo Fast</option>
                        </SelectField>
                        <SelectField label={t('videoDuration')} value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
                            <option value={7}>قصير (7 ثواني)</option>
                            <option value={15}>متوسط (15 ثانية)</option>
                        </SelectField>
                        <SelectField label={t('videoQuality')} value={resolution} onChange={(e) => setResolution(e.target.value)}>
                            <option value="720p">HD (720p)</option>
                            <option value="1080p">Full HD (1080p)</option>
                        </SelectField>
                         <SelectField label="Aspect Ratio" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}>
                            <option value="16:9">16:9 (Landscape)</option>
                            <option value="9:16">9:16 (Portrait)</option>
                        </SelectField>
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <button
                        type="submit"
                        disabled={isLoading || !prompt.trim()}
                        className="w-full flex items-center justify-center gap-2 py-3 px-6 text-lg font-semibold text-white bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] rounded-lg shadow-md hover:from-[var(--gradient-start-hover)] hover:to-[var(--gradient-end-hover)] disabled:bg-slate-500 disabled:from-slate-500 disabled:to-slate-600 disabled:cursor-not-allowed transition-all"
                    >
                        <SparklesIcon className="w-6 h-6" />
                        {isLoading ? t('generating') : t('generateVideo')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VideoGenerator;

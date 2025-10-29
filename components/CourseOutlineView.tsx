import React, { useState, useEffect, useRef } from 'react';
import type { CourseOutline, CourseModule, CourseTopic, SuggestionCategory } from '../types';
import { EditIcon } from './icons/EditIcon';
import { CheckIcon } from './icons/CheckIcon';
import { XIcon } from './icons/XIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { ActionToolbar } from './ActionToolbar';
import { translations } from '../lib/translations';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { generateTopicContent } from '../services/geminiService';
import { Language } from '../App';

interface CourseOutlineViewProps {
  outline: CourseOutline;
  isEditable?: boolean;
  onUpdate?: (updatedOutline: CourseOutline) => void;
  onGenerateAssessments?: () => Promise<void>;
  t: (key: keyof typeof translations) => string;
  language: Language;
}

const EditableList: React.FC<{ title: string; items: string[]; onChange: (newItems: string[]) => void }> = ({ title, items, onChange }) => (
    <div>
        <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">{title}</label>
        <textarea
            value={items.join('\n')}
            onChange={(e) => onChange(e.target.value.split('\n').filter(Boolean))}
            className="w-full p-2 mt-1 border rounded bg-[var(--input-background)] border-[var(--border-muted-color)] text-sm"
            rows={4}
        />
    </div>
);

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


const ModuleView: React.FC<{ module: CourseModule; isEditing: boolean; onChange: (updatedModule: CourseModule) => void; onRemove: () => void; courseTitle: string; language: Language; t: CourseOutlineViewProps['t']; }> = ({ module, isEditing, onChange, onRemove, courseTitle, language, t }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [generatingTopicIndex, setGeneratingTopicIndex] = useState<number | null>(null);
    const dragTopic = useRef<number | null>(null);
    const dragOverTopic = useRef<number | null>(null);

    const handleTopicChange = (topicIndex: number, field: keyof CourseTopic, value: string) => {
        const newTopics = [...module.topics];
        newTopics[topicIndex] = { ...newTopics[topicIndex], [field]: value };
        onChange({ ...module, topics: newTopics });
    };

    const handleGenerateContent = async (topicIndex: number) => {
        const topicTitle = module.topics[topicIndex]?.title;
        if (!topicTitle || generatingTopicIndex !== null) return;
        
        setGeneratingTopicIndex(topicIndex);
        try {
            const content = await generateTopicContent(courseTitle, module.title, topicTitle, language);
            handleTopicChange(topicIndex, 'content', content);
        } catch (error) {
            console.error("Failed to generate topic content:", error);
            handleTopicChange(topicIndex, 'content', 'Error: Could not generate content.');
        } finally {
            setGeneratingTopicIndex(null);
        }
    };

    const addTopic = () => {
        const newTopics = [...module.topics, { title: '', content: '' }];
        onChange({ ...module, topics: newTopics });
    };

    const removeTopic = (topicIndex: number) => {
        const newTopics = module.topics.filter((_, i) => i !== topicIndex);
        onChange({ ...module, topics: newTopics });
    };

    const handleTopicDrop = () => {
        if (dragTopic.current === null || dragOverTopic.current === null || dragTopic.current === dragOverTopic.current) return;
        const newTopics = [...module.topics];
        const draggedItemContent = newTopics[dragTopic.current];
        newTopics.splice(dragTopic.current, 1);
        newTopics.splice(dragOverTopic.current, 0, draggedItemContent);
        dragTopic.current = null;
        dragOverTopic.current = null;
        onChange({ ...module, topics: newTopics });
    };

    if (isEditing) {
        return (
            <div className="bg-slate-500/10 p-4 rounded-lg space-y-3 relative">
                <button onClick={onRemove} className="absolute top-2 left-2 p-1 text-red-500 hover:bg-red-500/20 rounded-full"><TrashIcon className="w-4 h-4" /></button>
                <input
                    type="text"
                    value={module.title}
                    onChange={(e) => onChange({ ...module, title: e.target.value })}
                    className="w-full p-2 border rounded bg-[var(--input-background)] border-[var(--border-muted-color)] font-bold"
                    placeholder={t('moduleTitlePlaceholder')}
                />
                <EditableList title={t('objectives')} items={module.objectives} onChange={(items) => onChange({ ...module, objectives: items })} />
                
                <div>
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">{t('topics')}</label>
                    <div className="space-y-2 mt-1">
                        {module.topics.map((topic, index) => (
                            <div 
                                key={index} 
                                draggable
                                onDragStart={() => dragTopic.current = index}
                                onDragEnter={() => dragOverTopic.current = index}
                                onDragEnd={handleTopicDrop}
                                onDragOver={(e) => e.preventDefault()}
                                className="bg-slate-800/20 dark:bg-slate-900/40 p-2 rounded cursor-move"
                            >
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={topic.title}
                                        onChange={(e) => handleTopicChange(index, 'title', e.target.value)}
                                        className="w-full p-1.5 border rounded bg-[var(--input-background)] border-[var(--border-muted-color)] text-sm"
                                        placeholder={t('topicTitlePlaceholder')}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleGenerateContent(index)}
                                        disabled={generatingTopicIndex !== null}
                                        className="p-2 rounded-full text-[var(--primary-color)] hover:bg-[var(--primary-color-translucent)] disabled:opacity-50 disabled:cursor-wait shrink-0"
                                        title={t('generateContentAI')}
                                    >
                                        <SparklesIcon className={`w-5 h-5 ${generatingTopicIndex === index ? 'animate-pulse' : ''}`} />
                                    </button>
                                    <button type="button" onClick={() => removeTopic(index)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full shrink-0">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                                {(topic.content || generatingTopicIndex === index) && (
                                    <textarea
                                        value={topic.content || t('generatingContent')}
                                        onChange={(e) => handleTopicChange(index, 'content', e.target.value)}
                                        className="w-full p-2 mt-2 border rounded bg-[var(--input-background)] border-[var(--border-muted-color)] text-sm font-mono"
                                        rows={8}
                                        disabled={generatingTopicIndex === index}
                                    />
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={addTopic} className="flex items-center text-xs font-semibold text-[var(--primary-color)] dark:text-[var(--primary-color-light)] hover:text-[var(--primary-color-hover)] mt-2">
                            <PlusCircleIcon className="w-4 h-4 mr-1" />
                            {t('addTopic')}
                        </button>
                    </div>
                </div>

                <EditableList title={t('activities')} items={module.activities} onChange={(items) => onChange({ ...module, activities: items })} />
            </div>
        );
    }
    
    return (
        <div className="border border-[var(--border-muted-color)] rounded-lg overflow-hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 bg-slate-500/10 hover:bg-slate-500/20">
                <h4 className="text-lg font-bold text-[var(--text-color)]">{module.title}</h4>
                <ChevronDownIcon className={`w-6 h-6 text-[var(--text-muted-color)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <h5 className="font-semibold mb-2 text-slate-800 dark:text-slate-200">{t('objectives')}</h5>
                        <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                            {module.objectives.map((obj, i) => <li key={i}>{obj}</li>)}
                        </ul>
                    </div>
                    <div className="space-y-2">
                        <h5 className="font-semibold text-slate-800 dark:text-slate-200">{t('topics')}</h5>
                        {module.topics.map((topic, i) => (
                           <details key={i} className="bg-slate-500/5 dark:bg-slate-900/40 rounded-lg group">
                                <summary className="p-3 font-semibold cursor-pointer flex items-center justify-between list-none text-sm text-[var(--text-color)]">
                                    {topic.title}
                                    <ChevronDownIcon className="w-5 h-5 text-[var(--text-muted-color)] transition-transform group-open:rotate-180 shrink-0" />
                                </summary>
                                {topic.content && 
                                    <div className="p-3 border-t border-slate-500/20">
                                        <div 
                                            className="prose prose-sm dark:prose-invert max-w-none text-[var(--text-muted-color)]"
                                            dangerouslySetInnerHTML={createSanitizedMarkup(topic.content)}
                                        />
                                    </div>
                                }
                            </details>
                        ))}
                    </div>
                    <div>
                        <h5 className="font-semibold mb-2 text-slate-800 dark:text-slate-200">{t('activities')}</h5>
                        <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                            {module.activities.map((act, i) => <li key={i}>{act}</li>)}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};


export const CourseOutlineView: React.FC<CourseOutlineViewProps> = ({ outline, isEditable = false, onUpdate, onGenerateAssessments, t, language }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editableOutline, setEditableOutline] = useState<CourseOutline>(outline);
    const [showSaveFeedback, setShowSaveFeedback] = useState(false);
    const [isGeneratingAssessments, setIsGeneratingAssessments] = useState(false);
    const dragModule = useRef<number | null>(null);
    const dragOverModule = useRef<number | null>(null);


    useEffect(() => {
        setEditableOutline(outline);
    }, [outline]);

    const handleGenerateAssessmentsClick = async () => {
        if (!onGenerateAssessments) return;
        setIsGeneratingAssessments(true);
        await onGenerateAssessments();
        setIsGeneratingAssessments(false);
    };

    const handleSave = () => {
        if (onUpdate) {
            onUpdate(editableOutline);
        }
        setIsEditing(false);
        setShowSaveFeedback(true);
        setTimeout(() => setShowSaveFeedback(false), 2000);
    };

    const handleCancel = () => {
        setEditableOutline(outline);
        setIsEditing(false);
    };

    const handleModuleChange = (index: number, updatedModule: CourseModule) => {
        const newModules = [...editableOutline.modules];
        newModules[index] = updatedModule;
        setEditableOutline(prev => ({ ...prev, modules: newModules }));
    };

    const addModule = () => {
        const newModule: CourseModule = { title: t('newModule'), objectives: [], topics: [{title: t('newTopic'), content: ''}], activities: [] };
        setEditableOutline(prev => ({ ...prev, modules: [...prev.modules, newModule] }));
    };

    const removeModule = (index: number) => {
        setEditableOutline(prev => ({ ...prev, modules: prev.modules.filter((_, i) => i !== index) }));
    };

    const handleModuleDrop = () => {
        if (dragModule.current === null || dragOverModule.current === null || dragModule.current === dragOverModule.current) return;
        const newModules = [...editableOutline.modules];
        const draggedItemContent = newModules[dragModule.current];
        newModules.splice(dragModule.current, 1);
        newModules.splice(dragOverModule.current, 0, draggedItemContent);
        dragModule.current = null;
        dragOverModule.current = null;
        setEditableOutline(prev => ({...prev, modules: newModules}));
    };

    return (
        <div className="animate-fade-in relative bg-[var(--card-background)] backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-[var(--border-color)]">
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <ClipboardListIcon className="w-12 h-12 shrink-0 text-[var(--primary-color)] dark:text-[var(--primary-color-light)]" />
                        <div className="flex-grow">
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editableOutline.courseTitle}
                                    onChange={(e) => setEditableOutline(p => ({ ...p, courseTitle: e.target.value }))}
                                    className="text-2xl font-bold w-full p-2 border rounded bg-[var(--input-background)] border-[var(--border-muted-color)]"
                                />
                            ) : (
                                <h3 className="text-2xl font-bold text-[var(--text-color)]">{outline.courseTitle}</h3>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {showSaveFeedback && (
                            <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full animate-fade-in">
                                <CheckCircleIcon className="w-4 h-4" />
                                <span>{t('saved')}</span>
                            </div>
                        )}
                         {!isEditing && (
                            <ActionToolbar content={outline} type="courseOutline" title={outline.courseTitle} t={t} />
                         )}
                         {isEditable && !isEditing && (
                            <button onClick={() => setIsEditing(true)} className="p-2.5 rounded-lg bg-[var(--button-muted-background)] hover:bg-[var(--button-muted-hover-background)] transition">
                                <EditIcon className="w-5 h-5 text-[var(--text-muted-color)]" />
                            </button>
                         )}
                    </div>
                </div>
                <div>
                     {isEditing ? (
                        <textarea
                            value={editableOutline.description}
                            onChange={(e) => setEditableOutline(p => ({ ...p, description: e.target.value }))}
                            className="w-full p-2 mt-2 border rounded bg-[var(--input-background)] border-[var(--border-muted-color)] text-sm"
                            rows={3}
                        />
                    ) : (
                        <p className="text-[var(--text-muted-color)] mt-1">{outline.description}</p>
                    )}
                </div>

                 {isEditable && onGenerateAssessments && !isEditing && (
                    <div className="border-t border-[var(--border-muted-color)] pt-4">
                        <button
                            onClick={handleGenerateAssessmentsClick}
                            disabled={isGeneratingAssessments}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] rounded-lg shadow-md hover:from-[var(--gradient-start-hover)] hover:to-[var(--gradient-end-hover)] transition-all disabled:opacity-60 disabled:cursor-wait"
                        >
                            <SparklesIcon className={`w-5 h-5 ${isGeneratingAssessments ? 'animate-pulse' : ''}`} />
                            {isGeneratingAssessments ? t('generating') : t('generateAssessmentIdeas')}
                        </button>
                    </div>
                )}

                <div className="space-y-4">
                    {editableOutline.modules.map((module, index) => (
                         <div 
                            key={index}
                            draggable={isEditing}
                            onDragStart={isEditing ? () => dragModule.current = index : undefined}
                            onDragEnter={isEditing ? () => dragOverModule.current = index : undefined}
                            onDragEnd={isEditing ? handleModuleDrop : undefined}
                            onDragOver={isEditing ? (e) => e.preventDefault() : undefined}
                            className={isEditing ? 'cursor-move' : ''}
                        >
                            <ModuleView
                                module={module}
                                isEditing={isEditing}
                                onChange={(updated) => handleModuleChange(index, updated)}
                                onRemove={() => removeModule(index)}
                                courseTitle={editableOutline.courseTitle}
                                language={language}
                                t={t}
                            />
                        </div>
                    ))}
                </div>

                {isEditing && (
                    <div className="flex justify-center">
                        <button onClick={addModule} className="flex items-center text-sm font-semibold text-[var(--primary-color)] dark:text-[var(--primary-color-light)] hover:text-[var(--primary-color-hover)]">
                            <PlusCircleIcon className="w-5 h-5 mr-1" />
                            {t('addModule')}
                        </button>
                    </div>
                )}
            </div>

            {isEditing && (
                <div className="mt-6 flex justify-end gap-3 border-t border-[var(--border-muted-color)] pt-4">
                    <button onClick={handleCancel} className="flex items-center px-4 py-2 bg-[var(--button-muted-background)] text-[var(--text-color)] rounded-lg hover:bg-[var(--button-muted-hover-background)] transition">
                        <XIcon className="w-5 h-5 mr-1" />
                        {t('cancel')}
                    </button>
                    <button onClick={handleSave} className="flex items-center px-4 py-2 bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-white rounded-lg hover:from-[var(--gradient-start-hover)] hover:to-[var(--gradient-end-hover)] transition-all">
                        <CheckIcon className="w-5 h-5 mr-1" />
                        {t('saveChanges')}
                    </button>
                </div>
            )}
        </div>
    );
};
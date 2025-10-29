import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { Language } from '../App';
import { translations } from '../lib/translations';
import type { AnalysisResult, TimelineEvent } from '../types';
import { analyzeExpertData } from '../services/geminiService';
import { XIcon } from './icons/XIcon';
import { UploadCloudIcon } from './icons/UploadCloudIcon';
import { FileIcon } from './icons/FileIcon';
import { TrashIcon } from './icons/TrashIcon';

interface UpdateProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentProfile: AnalysisResult;
    onUpdateProfile: (updatedProfile: AnalysisResult) => void;
    language: Language;
    t: (key: keyof typeof translations) => string;
}

type Step = 'upload' | 'analyzing' | 'merge';

interface MergeSelection {
    summary: 'current' | 'new';
    skills: {
        add: Set<string>;
        remove: Set<string>;
    };
    timeline: {
        add: Set<string>;
        remove: Set<string>;
    }
}

const getEventId = (event: TimelineEvent) => `${event.title?.trim()}|${event.company?.trim()}`;

const loadPdfParser = async () => {
    if ((window as any).pdfjsLib) {
        return (window as any).pdfjsLib;
    }
    await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        script.onload = () => {
            const pdfjsLib = (window as any).pdfjsLib;
            if (pdfjsLib) {
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                resolve(pdfjsLib);
            } else {
                reject(new Error("pdf.js library failed to load."));
            }
        };
        script.onerror = reject;
        document.body.appendChild(script);
    });
    return (window as any).pdfjsLib;
};


export const UpdateProfileModal: React.FC<UpdateProfileModalProps> = ({ isOpen, onClose, currentProfile, onUpdateProfile, language, t }) => {
    const [step, setStep] = useState<Step>('upload');
    const [error, setError] = useState<string | null>(null);
    const [newProfile, setNewProfile] = useState<AnalysisResult | null>(null);
    const [files, setFiles] = useState<File[]>([]);
    
    // Diff states
    const [skillsToAdd, setSkillsToAdd] = useState<string[]>([]);
    const [skillsToRemove, setSkillsToRemove] = useState<string[]>([]);
    const [timelineToAdd, setTimelineToAdd] = useState<TimelineEvent[]>([]);
    const [timelineToRemove, setTimelineToRemove] = useState<TimelineEvent[]>([]);

    const [selection, setSelection] = useState<MergeSelection>({
        summary: 'current',
        skills: { add: new Set(), remove: new Set() },
        timeline: { add: new Set(), remove: new Set() },
    });

    useEffect(() => {
        if (isOpen) {
            // Reset state when modal opens
            setStep('upload');
            setError(null);
            setNewProfile(null);
            setFiles([]);
        }
    }, [isOpen]);

    // Calculate diffs when a new profile is generated
    useEffect(() => {
        if (step === 'merge' && newProfile) {
            // Summary
            const isNewSummary = newProfile.profile.summary !== currentProfile.profile.summary;
            
            // Skills
            const currentSkills = new Set(currentProfile.profile.skills || []);
            const newSkills = new Set(newProfile.profile.skills || []);
            const toAdd = [...newSkills].filter(s => !currentSkills.has(s));
            const toRemove = [...currentSkills].filter(s => !newSkills.has(s));
            setSkillsToAdd(toAdd);
            setSkillsToRemove(toRemove);

            // Timeline
            const currentTimelineIds = new Set((currentProfile.timeline || []).map(getEventId));
            const newTimelineEvents = newProfile.timeline || [];
            const currentTimelineEvents = currentProfile.timeline || [];
            const timelineEventsMap = new Map(newTimelineEvents.map(e => [getEventId(e), e]));

            const timelineToAdd = newTimelineEvents.filter(e => !currentTimelineIds.has(getEventId(e)));
            const timelineToRemove = currentTimelineEvents.filter(e => !timelineEventsMap.has(getEventId(e)));
            setTimelineToAdd(timelineToAdd);
            setTimelineToRemove(timelineToRemove);

            // Set initial selections
            setSelection({
                summary: isNewSummary ? 'new' : 'current',
                skills: {
                    add: new Set(toAdd), // Add all new by default
                    remove: new Set(), // Don't remove any by default
                },
                timeline: {
                    add: new Set(timelineToAdd.map(getEventId)),
                    remove: new Set(),
                }
            });
        }
    }, [step, newProfile, currentProfile]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files || []);
        if (selectedFiles.length > 0) {
            setFiles(prev => [...prev, ...selectedFiles].slice(0, 5));
            setError(null);
        }
    };
    const removeFile = (index: number) => setFiles(prev => prev.filter((_, i) => i !== index));

    const handleAnalyze = useCallback(async () => {
        if (files.length === 0) {
            setError('الرجاء اختيار ملف واحد على الأقل.');
            return;
        }
        setError(null);
        setStep('analyzing');

        try {
            const fileContents = await Promise.all(files.map(file => {
                return new Promise<string>(async (resolve, reject) => {
                    try {
                        if (file.type === 'application/pdf') {
                            const pdfjsLib = await loadPdfParser();
                            const reader = new FileReader();
                            reader.onload = async (e) => {
                               try {
                                 if (!e.target?.result) throw new Error("Could not read PDF file");
                                 const pdf = await pdfjsLib.getDocument(e.target.result).promise;
                                 let text = '';
                                 for (let i = 1; i <= pdf.numPages; i++) {
                                    const page = await pdf.getPage(i);
                                    const textContent = await page.getTextContent();
                                    text += textContent.items.map((s: any) => s.str).join(' ');
                                    text += '\n';
                                 }
                                 resolve(text);
                               } catch (err) {
                                 reject(err instanceof Error ? err : new Error(String(err)));
                               }
                            };
                            reader.onerror = () => reject(new Error(`Error reading ${file.name}`));
                            reader.readAsArrayBuffer(file);
                        } else {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                resolve(e.target?.result as string);
                            };
                            reader.onerror = () => reject(new Error(`Error reading ${file.name}`));
                            reader.readAsText(file);
                        }
                    } catch (err) {
                        reject(err instanceof Error ? err : new Error(String(err)));
                    }
                });
            }));

            const combinedContent = fileContents.join('\n\n---\n\n');
            const result = await analyzeExpertData(combinedContent, [], language);
            
            setNewProfile(result);
            setStep('merge');

        } catch (err) {
            console.error("Error processing files:", err);
            setError(err instanceof Error ? err.message : 'حدث خطأ أثناء معالجة الملفات.');
            setStep('upload');
        }
    }, [files, language]);

    const handleApplyChanges = () => {
        if (!newProfile) return;

        // Construct the final profile
        const finalProfile = JSON.parse(JSON.stringify(currentProfile)); // Deep copy

        // 1. Update simple fields from newProfile.profile if they exist
        Object.assign(finalProfile.profile, {
            name: newProfile.profile.name,
            title: newProfile.profile.title,
            links: newProfile.profile.links,
            services: newProfile.profile.services,
            products: newProfile.profile.products,
        });

        // 2. Update summary based on selection
        if (selection.summary === 'new') {
            finalProfile.profile.summary = newProfile.profile.summary;
        }

        // 3. Update skills
        const finalSkills = new Set(currentProfile.profile.skills || []);
        selection.skills.remove.forEach(skill => finalSkills.delete(skill));
        selection.skills.add.forEach(skill => finalSkills.add(skill));
        finalProfile.profile.skills = Array.from(finalSkills);

        // 4. Update Timeline
        const finalTimelineMap = new Map((currentProfile.timeline || []).map(e => [getEventId(e), e]));
        const newTimelineMap = new Map((newProfile.timeline || []).map(e => [getEventId(e), e]));
        selection.timeline.remove.forEach(id => finalTimelineMap.delete(id));
        selection.timeline.add.forEach(id => {
            if (newTimelineMap.has(id)) {
                finalTimelineMap.set(id, newTimelineMap.get(id)!);
            }
        });
        // Fix: Explicitly type the sort callback parameters to resolve type inference issues.
        finalProfile.timeline = Array.from(finalTimelineMap.values()).sort((a: TimelineEvent, b: TimelineEvent) => parseInt(b.year) - parseInt(a.year));
        
        // 5. Update other root-level objects wholesale
        finalProfile.atsCv = newProfile.atsCv;
        finalProfile.courseOutline = newProfile.courseOutline;

        onUpdateProfile(finalProfile);
    };

    const toggleSetItem = (set: Set<string>, item: string) => {
        const newSet = new Set(set);
        if (newSet.has(item)) newSet.delete(item);
        else newSet.add(item);
        return newSet;
    };
    
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-[var(--background-elevated-color)] rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-[var(--border-color)]">
                    <h2 className="text-xl font-bold">{t('updateProfile')}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--button-muted-background)]"><XIcon className="w-6 h-6"/></button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    {step === 'upload' && (
                        <div className="space-y-4">
                             <p className="text-[var(--text-muted-color)]">{t('uploadNewFilesDesc')}</p>
                             <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-[var(--border-muted-color)] border-dashed rounded-lg cursor-pointer bg-slate-500/10 hover:bg-slate-500/20">
                                <UploadCloudIcon className="w-8 h-8 mb-3 text-[var(--text-muted-color)]" />
                                <p className="text-sm"><span className="font-semibold">{t('profile')}</span></p>
                                <input type="file" className="hidden" onChange={handleFileChange} accept=".txt,.md,.pdf,.html" multiple/>
                             </label>
                             {files.length > 0 && (
                                <div className="space-y-2">
                                    {files.map((file, i) => (
                                        <div key={i} className="flex items-center justify-between bg-[var(--primary-color-translucent)] p-2 rounded-lg text-sm">
                                            <div className="flex items-center gap-2"><FileIcon className="w-5 h-5" /><span>{file.name}</span></div>
                                            <button onClick={() => removeFile(i)} className="p-1 text-red-500 rounded-full hover:bg-red-500/20"><TrashIcon className="w-4 h-4"/></button>
                                        </div>
                                    ))}
                                </div>
                             )}
                             {error && <p className="text-sm text-[var(--error-color)]">{error}</p>}
                        </div>
                    )}

                    {step === 'analyzing' && (
                        <div className="flex flex-col items-center justify-center h-48">
                            <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div>
                            <p className="mt-4 font-semibold animate-pulse">جاري التحليل...</p>
                        </div>
                    )}
                    
                    {step === 'merge' && newProfile && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-center text-[var(--primary-color)]">{t('reviewChanges')}</h3>
                            {/* Summary */}
                             <div>
                                <h4 className="font-bold mb-2 border-b border-[var(--border-muted-color)] pb-1">{t('summary')}</h4>
                                <div className="space-y-3">
                                    <label className="block p-3 border border-[var(--border-muted-color)] rounded-lg has-[:checked]:bg-[var(--primary-color-translucent)] has-[:checked]:border-[var(--primary-color)]">
                                        <div className="flex items-center gap-3">
                                            <input type="radio" name="summary" checked={selection.summary === 'current'} onChange={() => setSelection(s => ({...s, summary: 'current'}))} className="text-[var(--primary-color)] focus:ring-[var(--primary-color)]" />
                                            <div><span className="font-semibold">{t('keep')} {t('current')}</span><p className="text-sm text-[var(--text-muted-color)] line-clamp-2">{currentProfile.profile.summary}</p></div>
                                        </div>
                                    </label>
                                    <label className="block p-3 border border-[var(--border-muted-color)] rounded-lg has-[:checked]:bg-[var(--primary-color-translucent)] has-[:checked]:border-[var(--primary-color)]">
                                        <div className="flex items-center gap-3">
                                            <input type="radio" name="summary" checked={selection.summary === 'new'} onChange={() => setSelection(s => ({...s, summary: 'new'}))} className="text-[var(--primary-color)] focus:ring-[var(--primary-color)]"/>
                                            <div><span className="font-semibold">{t('updateTo')} {t('proposed')}</span><p className="text-sm text-[var(--text-muted-color)] line-clamp-2">{newProfile.profile.summary}</p></div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            
                            {/* Skills */}
                            <div className="space-y-4">
                               <h4 className="font-bold mb-2 border-b border-[var(--border-muted-color)] pb-1">{t('skills')}</h4>
                               {skillsToAdd.length > 0 && <div>
                                   <h5 className="font-semibold text-sm mb-2">{t('newSkillsToAdd')}</h5>
                                   <div className="flex flex-wrap gap-2">
                                       {skillsToAdd.map(skill => (
                                           <label key={skill} className="flex items-center gap-2 text-sm bg-[var(--button-muted-background)] px-2 py-1 rounded cursor-pointer has-[:checked]:bg-emerald-500/30">
                                               <input type="checkbox" checked={selection.skills.add.has(skill)} onChange={() => setSelection(s => ({...s, skills: {...s.skills, add: toggleSetItem(s.skills.add, skill)}}))} className="rounded text-[var(--primary-color)] focus:ring-transparent"/>
                                               {skill}
                                           </label>
                                       ))}
                                   </div>
                               </div>}
                               {skillsToRemove.length > 0 && <div>
                                   <h5 className="font-semibold text-sm mb-2">{t('skillsToRemove')}</h5>
                                   <div className="flex flex-wrap gap-2">
                                       {skillsToRemove.map(skill => (
                                           <label key={skill} className="flex items-center gap-2 text-sm bg-[var(--button-muted-background)] px-2 py-1 rounded cursor-pointer has-[:checked]:bg-rose-500/30">
                                               <input type="checkbox" checked={selection.skills.remove.has(skill)} onChange={() => setSelection(s => ({...s, skills: {...s.skills, remove: toggleSetItem(s.skills.remove, skill)}}))} className="rounded text-[var(--primary-color)] focus:ring-transparent"/>
                                               {skill}
                                           </label>
                                       ))}
                                   </div>
                               </div>}
                               {skillsToAdd.length === 0 && skillsToRemove.length === 0 && <p className="text-sm text-[var(--text-muted-color)]">{t('noNewSkills')}</p>}
                            </div>

                             {/* Timeline */}
                            <div className="space-y-4">
                                <h4 className="font-bold mb-2 border-b border-[var(--border-muted-color)] pb-1">{t('experience')}</h4>
                                {timelineToAdd.length > 0 && <div>
                                    <h5 className="font-semibold text-sm mb-2">{t('newExperiencesToAdd')}</h5>
                                    {timelineToAdd.map(event => (
                                        <label key={getEventId(event)} className="flex items-start gap-2 text-sm p-2 rounded mb-2 has-[:checked]:bg-emerald-500/20">
                                            <input type="checkbox" checked={selection.timeline.add.has(getEventId(event))} onChange={() => setSelection(s => ({...s, timeline: {...s.timeline, add: toggleSetItem(s.timeline.add, getEventId(event))}}))} className="mt-1 rounded text-[var(--primary-color)] focus:ring-transparent"/>
                                            <div><b>{event.title}</b> at {event.company} ({event.year})</div>
                                        </label>
                                    ))}
                                </div>}
                                {timelineToRemove.length > 0 && <div>
                                    <h5 className="font-semibold text-sm mb-2">{t('experiencesToRemove')}</h5>
                                     {timelineToRemove.map(event => (
                                        <label key={getEventId(event)} className="flex items-start gap-2 text-sm p-2 rounded mb-2 has-[:checked]:bg-rose-500/20">
                                            <input type="checkbox" checked={selection.timeline.remove.has(getEventId(event))} onChange={() => setSelection(s => ({...s, timeline: {...s.timeline, remove: toggleSetItem(s.timeline.remove, getEventId(event))}}))} className="mt-1 rounded text-[var(--primary-color)] focus:ring-transparent"/>
                                            <div><b>{event.title}</b> at {event.company} ({event.year})</div>
                                        </label>
                                    ))}
                                </div>}
                                {timelineToAdd.length === 0 && timelineToRemove.length === 0 && <p className="text-sm text-[var(--text-muted-color)]">{t('noNewExperiences')}</p>}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-[var(--border-color)] flex justify-end gap-3">
                     <button onClick={onClose} className="px-4 py-2 bg-[var(--button-muted-background)] text-[var(--text-color)] rounded-lg hover:bg-[var(--button-muted-hover-background)] transition font-semibold">{t('cancel')}</button>
                    {step === 'upload' && <button onClick={handleAnalyze} disabled={files.length === 0} className="px-4 py-2 bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-white rounded-lg hover:from-[var(--gradient-start-hover)] hover:to-[var(--gradient-end-hover)] transition-all font-semibold disabled:opacity-50">حلل الملفات</button>}
                    {step === 'merge' && <button onClick={handleApplyChanges} className="px-4 py-2 bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-white rounded-lg hover:from-[var(--gradient-start-hover)] hover:to-[var(--gradient-end-hover)] transition-all font-semibold">{t('applyChanges')}</button>}
                </div>
            </div>
        </div>,
        document.body
    );
};

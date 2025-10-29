import React, { useState, useEffect } from 'react';
import type { TimelineEvent } from '../types';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { EditIcon } from './icons/EditIcon';
import { CheckIcon } from './icons/CheckIcon';
import { XIcon } from './icons/XIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { translations } from '../lib/translations';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface TimelineProps {
  events: TimelineEvent[];
  isEditable?: boolean;
  onUpdate?: (updatedEvents: TimelineEvent[]) => void;
  t: (key: keyof typeof translations) => string;
}

export const Timeline: React.FC<TimelineProps> = ({ events, isEditable = false, onUpdate, t }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editableEvents, setEditableEvents] = useState<TimelineEvent[]>(events);
    const [showSaveFeedback, setShowSaveFeedback] = useState(false);

    useEffect(() => {
        setEditableEvents(events);
    }, [events]);

    const handleSave = () => {
        if (onUpdate) {
            onUpdate(editableEvents);
        }
        setIsEditing(false);
        setShowSaveFeedback(true);
        setTimeout(() => setShowSaveFeedback(false), 2000);
    };

    const handleCancel = () => {
        setEditableEvents(events);
        setIsEditing(false);
    };

    const handleEventChange = (index: number, field: keyof TimelineEvent, value: string) => {
        const newEvents = [...editableEvents];
        newEvents[index] = { ...newEvents[index], [field]: value };
        setEditableEvents(newEvents);
    };
    
    const addEvent = () => {
        setEditableEvents([...editableEvents, { year: '', title: '', company: '', description: '' }]);
    };

    const removeEvent = (index: number) => {
        const newEvents = editableEvents.filter((_, i) => i !== index);
        setEditableEvents(newEvents);
    };

    const TimelineCard: React.FC<{event: TimelineEvent, index: number}> = ({ event, index }) => {
        if (isEditing) {
            return (
                <div className="bg-slate-100 dark:bg-slate-800/80 border border-[var(--border-muted-color)] p-4 rounded-lg space-y-2 relative w-full">
                    <button onClick={() => removeEvent(index)} className="absolute top-2 left-2 rtl:left-auto rtl:right-2 p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-full"><TrashIcon className="w-4 h-4" /></button>
                    <input type="text" placeholder={t('year')} value={event.year} onChange={e => handleEventChange(index, 'year', e.target.value)} className="w-full p-1 border rounded text-sm bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600"/>
                    <input type="text" placeholder={t('jobTitle')} value={event.title} onChange={e => handleEventChange(index, 'title', e.target.value)} className="w-full p-1 border rounded font-bold bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600"/>
                    <input type="text" placeholder={t('company')} value={event.company} onChange={e => handleEventChange(index, 'company', e.target.value)} className="w-full p-1 border rounded bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600"/>
                    <textarea placeholder={t('description')} value={event.description} onChange={e => handleEventChange(index, 'description', e.target.value)} className="w-full p-1 border rounded text-sm bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600" rows={2}></textarea>
                </div>
            )
        }
        return (
             <div className="bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 p-4 rounded-lg shadow-md w-full">
                <time className="text-sm font-semibold text-[var(--primary-color)] dark:text-[var(--primary-color-light)]">{event.year}</time>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">{event.title}</h3>
                <h4 className="text-md font-medium text-slate-700 dark:text-slate-300">{event.company}</h4>
                <p className="text-base text-slate-600 dark:text-slate-400 mt-2">{event.description}</p>
            </div>
        )
    }

    return (
        <div className="animate-fade-in relative bg-[var(--card-background)] backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-[var(--border-color)]">
            <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4 flex items-center gap-2">
                {showSaveFeedback && (
                    <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400 bg-green-500/10 px-3 py-1 rounded-full animate-fade-in">
                        <CheckCircleIcon className="w-4 h-4" />
                        <span>Saved!</span>
                    </div>
                )}
                {isEditable && !isEditing && (
                    <button onClick={() => setIsEditing(true)} className="p-2 bg-[var(--button-muted-background)] rounded-full hover:bg-[var(--button-muted-hover-background)] transition z-10">
                        <EditIcon className="w-5 h-5 text-[var(--text-muted-color)]" />
                    </button>
                )}
            </div>
            
            <div className="relative border-s-4 border-slate-300 dark:border-slate-700 ltr:ml-3 rtl:mr-3">
                {(isEditing ? editableEvents : events).map((event, index) => (
                    <div key={index} className="mb-10 ms-8 animate-fade-in-up" style={{ animationDelay: `${index * 150}ms`}}>
                        <span className="absolute flex items-center justify-center w-6 h-6 bg-[var(--primary-color)] rounded-full -start-3 ring-8 ring-[var(--background-elevated-color)]">
                            <BriefcaseIcon className="w-3 h-3 text-white" />
                        </span>
                        <TimelineCard event={event} index={index}/>
                    </div>
                ))}
            </div>
            
            {isEditing && (
                <div className="flex justify-center mt-4">
                    <button onClick={addEvent} className="flex items-center text-[var(--primary-color)] dark:text-[var(--primary-color-light)] hover:text-[var(--primary-color-hover)] dark:hover:text-white font-semibold">
                        <PlusCircleIcon className="w-6 h-6 mx-2" />
                        {t('addEvent')}
                    </button>
                </div>
            )}

            {isEditing && (
                <div className="mt-6 flex justify-end gap-3 border-t border-[var(--border-muted-color)] pt-4">
                    <button onClick={handleCancel} className="flex items-center px-4 py-2 bg-[var(--button-muted-background)] text-[var(--text-color)] rounded-lg hover:bg-[var(--button-muted-hover-background)] transition">
                        <XIcon className="w-5 h-5 mx-1" />
                        {t('cancel')}
                    </button>
                    <button onClick={handleSave} className="flex items-center px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:bg-[var(--primary-color-hover)] transition">
                        <CheckIcon className="w-5 h-5 mx-1" />
                        {t('saveChanges')}
                    </button>
                </div>
            )}
        </div>
    );
};

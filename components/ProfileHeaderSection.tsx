import React, { useState, useEffect, useRef } from 'react';
import type { ExpertProfile } from '../types';
import { EditIcon } from './icons/EditIcon';
import { CheckIcon } from './icons/CheckIcon';
import { XIcon } from './icons/XIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { TrashIcon } from './icons/TrashIcon';
import { LinkIcon } from './icons/LinkIcon';
import { BadgeCheckIcon } from './icons/BadgeCheckIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { GithubIcon } from './icons/GithubIcon';
import { LinkedinIcon } from './icons/LinkedinIcon';
import { TwitterIcon } from './icons/TwitterIcon';
import { Language } from '../App';
import { translations } from '../lib/translations';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { DotsVerticalIcon } from './icons/DotsVerticalIcon';
import { RefreshIcon } from './icons/RefreshIcon';

interface ProfileHeaderSectionProps {
  profile: ExpertProfile;
  isEditable?: boolean;
  onUpdate?: (updatedProfile: ExpertProfile) => void;
  onDelete?: () => void;
  onOpenUpdateModal?: () => void;
  t: (key: keyof typeof translations) => string;
  language: Language;
}

const socialLinksConfig = [
    { key: 'linkedin', icon: LinkedinIcon, label: 'LinkedIn' },
    { key: 'github', icon: GithubIcon, label: 'GitHub' },
    { key: 'twitter', icon: TwitterIcon, label: 'Twitter / X' },
    { key: 'website', icon: LinkIcon, label: 'الموقع الشخصي' },
] as const;

const skillColorClasses = [
    "bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300",
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300",
    "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300",
    "bg-violet-100 text-violet-800 dark:bg-violet-900/60 dark:text-violet-300",
    "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300",
    "bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300",
];


export const ProfileHeaderSection: React.FC<ProfileHeaderSectionProps> = ({ profile, isEditable = false, onUpdate, onDelete, onOpenUpdateModal, t, language }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editableProfile, setEditableProfile] = useState<ExpertProfile>(profile);
    const [isSkillsExpanded, setIsSkillsExpanded] = useState(false);
    const [showSaveFeedback, setShowSaveFeedback] = useState(false);
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
    const pfpInputRef = useRef<HTMLInputElement>(null);
    const actionMenuRef = useRef<HTMLDivElement>(null);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    useEffect(() => {
        setEditableProfile(profile);
    }, [profile]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
                setIsActionMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    const handlePfpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            alert(t('fileUploadPfpSizeError').replace('{size}', '2'));
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setEditableProfile(p => ({ ...p, profilePicture: reader.result as string }));
        };
        reader.readAsDataURL(file);
    };

    const handleSave = () => {
        if (onUpdate) {
            onUpdate(editableProfile);
        }
        setIsEditing(false);
        setShowSaveFeedback(true);
        setTimeout(() => setShowSaveFeedback(false), 2000);
    };

    const handleCancel = () => {
        setEditableProfile(profile);
        setIsEditing(false);
    };
    
    const handleFieldChange = (field: keyof Omit<ExpertProfile, 'skills' | 'links' | 'products' | 'services'>, value: string) => {
        setEditableProfile(p => ({ ...p, [field]: value }));
    };
    
    const handleLinkChange = (key: keyof NonNullable<ExpertProfile['links']>, value: string) => {
        setEditableProfile(p => ({
            ...p,
            links: {
                ...p.links,
                [key]: value
            }
        }));
    };

    const handleSkillsChange = (index: number, value: string) => {
        const newSkills = [...(editableProfile.skills || [])];
        newSkills[index] = value;
        setEditableProfile(p => ({ ...p, skills: newSkills }));
    };

    const addSkill = () => {
        setEditableProfile(p => ({ ...p, skills: [...(p.skills || []), ''] }));
    };
    
    const removeSkill = (index: number) => {
        setEditableProfile(p => ({ ...p, skills: (p.skills || []).filter((_, i) => i !== index) }));
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, position: number) => {
        dragItem.current = position;
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDrop = () => {
        if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) {
            return;
        }
        const newSkills = [...(editableProfile.skills || [])];
        const draggedItemContent = newSkills[dragItem.current];
        newSkills.splice(dragItem.current, 1);
        newSkills.splice(dragOverItem.current, 0, draggedItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        setEditableProfile(p => ({ ...p, skills: newSkills }));
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, position: number) => {
        dragOverItem.current = position;
    };
    
    const currentProfile = isEditing ? editableProfile : profile;
    const professionalTitles = t('professionalTitlesList').split(',');

    return (
        <div className="bg-[var(--card-background)] backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-[var(--border-color)] animate-fade-in relative">
            <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4 flex items-center gap-2">
                {showSaveFeedback && (
                    <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400 bg-green-500/10 px-3 py-1 rounded-full animate-fade-in">
                        <CheckCircleIcon className="w-4 h-4" />
                        <span>{t('saved')}</span>
                    </div>
                )}
                {isEditable && !isEditing && (
                     <>
                        <button onClick={() => setIsEditing(true)} className="p-2.5 rounded-lg bg-[var(--button-muted-background)] hover:bg-[var(--button-muted-hover-background)] transition">
                            <EditIcon className="w-5 h-5 text-[var(--text-muted-color)]" />
                        </button>
                        <div className="relative" ref={actionMenuRef}>
                            <button onClick={() => setIsActionMenuOpen(p => !p)} className="p-2.5 rounded-lg bg-[var(--button-muted-background)] hover:bg-[var(--button-muted-hover-background)] transition">
                                <DotsVerticalIcon className="w-5 h-5 text-[var(--text-muted-color)]" />
                            </button>
                            {isActionMenuOpen && (
                                <div className="absolute top-full mt-2 right-0 rtl:right-auto rtl:left-0 bg-[var(--background-elevated-color)] border border-[var(--border-color)] rounded-lg shadow-2xl z-20 w-56 animate-fade-in py-1">
                                    <button onClick={onOpenUpdateModal} className="flex items-center gap-3 w-full text-right rtl:text-left px-4 py-2 text-sm text-[var(--text-color)] hover:bg-slate-500/10">
                                        <RefreshIcon className="w-4 h-4 text-[var(--text-muted-color)]" />
                                        <span>{t('updateFiles')}</span>
                                    </button>
                                    <button onClick={onDelete} className="flex items-center gap-3 w-full text-right rtl:text-left px-4 py-2 text-sm text-[var(--error-color)] dark:text-[var(--error-color-light)] hover:bg-red-500/10">
                                        <TrashIcon className="w-4 h-4" />
                                        <span>{t('deleteProfile')}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Hero Section */}
            <div className="flex flex-col items-center text-center">
                <div className="relative group shrink-0 mb-4">
                    <div className="w-48 h-48 rounded-full p-px bg-gradient-to-tr from-yellow-400 via-amber-500 to-orange-600 shadow-xl shadow-amber-500/40 animate-pulse-slow flex items-center justify-center">
                        {currentProfile.profilePicture ? (
                            <img src={currentProfile.profilePicture} alt={currentProfile.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <UserCircleIcon className="w-full h-full text-slate-400 bg-slate-800 rounded-full" />
                        )}
                    </div>
                    {isEditing && (
                        <>
                            <input type="file" ref={pfpInputRef} onChange={handlePfpChange} className="hidden" accept="image/png, image/jpeg, image/webp" />
                            <button
                                type="button"
                                onClick={() => pfpInputRef.current?.click()}
                                className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                                aria-label="Change profile picture"
                            >
                                <EditIcon className="w-8 h-8"/>
                            </button>
                        </>
                    )}
                </div>
                
                {isEditing ? (
                    <div className="w-full max-w-md mt-4 flex flex-col items-center gap-3">
                        <div className="flex items-center gap-2 w-full">
                           <select
                                value={editableProfile.titlePrefix || ''}
                                onChange={e => handleFieldChange('titlePrefix', e.target.value)}
                                className="p-2 border rounded bg-[var(--input-background)] border-[var(--border-muted-color)]"
                            >
                                <option value="">{t('noTitle')}</option>
                                {professionalTitles.map(title => (
                                    <option key={title} value={title}>
                                        {title}
                                    </option>
                                ))}
                            </select>
                            <input type="text" value={editableProfile.name} onChange={e => handleFieldChange('name', e.target.value)} className="p-2 border rounded bg-[var(--input-background)] border-[var(--border-muted-color)] flex-grow text-lg font-bold text-center"/>
                        </div>
                        <input type="text" value={editableProfile.title} onChange={e => handleFieldChange('title', e.target.value)} className="p-2 border rounded bg-[var(--input-background)] border-[var(--border-muted-color)] w-full text-center"/>
                        
                        <div className="w-full space-y-2 pt-2">
                             <h5 className="text-sm font-semibold text-left rtl:text-right text-[var(--text-muted-color)]">{t('professionalLinks')}</h5>
                             {socialLinksConfig.map(({ key, icon: Icon, label }) => (
                                <div key={key} className="relative w-full">
                                    <Icon className="w-5 h-5 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3 text-[var(--text-muted-color)]"/>
                                    <input
                                        type="url"
                                        value={editableProfile.links?.[key] || ''}
                                        onChange={e => handleLinkChange(key, e.target.value)}
                                        placeholder={label}
                                        className="p-2 pl-10 rtl:pr-10 border rounded bg-[var(--input-background)] border-[var(--border-muted-color)] text-sm w-full"
                                    />
                                </div>
                             ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex-grow">
                        <h3 className="text-4xl font-bold text-[var(--text-color)]">
                            {`${currentProfile.titlePrefix || ''} ${currentProfile.name}`.trim()}
                        </h3>
                        <p className="text-[var(--primary-color)] dark:text-[var(--primary-color-light)] font-semibold mt-1 text-xl">{currentProfile.title}</p>
                        <div className="mt-4 flex items-center justify-center gap-6">
                            {socialLinksConfig.map(({ key, icon: Icon }) => {
                               const link = currentProfile.links?.[key];
                               if (!link) return null;
                               return (
                                   <a
                                     key={key}
                                     href={link || '#'}
                                     target="_blank"
                                     rel="noopener noreferrer"
                                     className="text-[var(--text-muted-color)] transition-colors hover:text-[var(--primary-color)]"
                                     aria-label={key}
                                   >
                                       <Icon className="w-6 h-6"/>
                                   </a>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
            
            <hr className="w-full my-6 border-[var(--border-muted-color)]" />
            
            {/* Skills Section */}
            <div className="w-full">
                <div className="flex justify-between items-center w-full mb-3">
                    <h4 className="text-lg font-semibold text-[var(--text-color)] flex items-center">
                        <BadgeCheckIcon className="w-5 h-5 ml-2 rtl:ml-0 rtl:mr-2 text-[var(--primary-color)] dark:text-[var(--primary-color-light)]"/>
                        {t('skills')}
                    </h4>
                    {!isEditing && (currentProfile.skills || []).length > 8 && (
                        <button onClick={() => setIsSkillsExpanded(!isSkillsExpanded)} className="text-sm font-semibold text-[var(--primary-color)] dark:text-[var(--primary-color-light)] hover:underline">
                            {isSkillsExpanded ? t('showLess') : t('showMore')}
                        </button>
                    )}
                </div>
                {isEditing ? (
                    <div className="space-y-2">
                        {(editableProfile.skills || []).map((skill, index) => (
                             <div 
                                key={index}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragEnter={(e) => handleDragEnter(e, index)}
                                onDragEnd={handleDrop}
                                onDragOver={(e) => e.preventDefault()}
                                className="flex items-center gap-2 bg-slate-800/50 rounded-lg cursor-move"
                            >
                                <input type="text" value={skill} onChange={e => handleSkillsChange(index, e.target.value)} className="w-full p-2 border rounded bg-[var(--input-background)] border-[var(--border-muted-color)] text-[var(--text-color)]"/>
                                <button onClick={() => removeSkill(index)} className="p-2 text-red-500 hover:bg-red-500/20 rounded-full shrink-0"><TrashIcon className="w-5 h-5" /></button>
                            </div>
                        ))}
                        <button onClick={addSkill} className="flex items-center text-sm font-semibold text-[var(--primary-color)] dark:text-[var(--primary-color-light)] hover:text-[var(--primary-color-hover)]">
                            <PlusCircleIcon className="w-5 h-5 mr-1 rtl:ml-1" />
                            {t('addSkill')}
                        </button>
                    </div>
                ) : (
                    <div className={`flex flex-wrap justify-center gap-2 transition-all duration-300 ease-in-out ${isSkillsExpanded ? 'max-h-[1000px]' : 'max-h-20 overflow-hidden'}`}>
                        {(currentProfile.skills || []).map((skill, index) => (
                            <span key={index} className={`text-sm font-medium px-3 py-1 rounded-full ${skillColorClasses[index % skillColorClasses.length]}`}>{skill}</span>
                        ))}
                    </div>
                )}
            </div>

            <hr className="w-full my-6 border-[var(--border-muted-color)]" />

             {/* Bio Section */}
            <div className="w-full">
                <h4 className="text-lg text-center font-semibold text-[var(--text-color)] mb-3">{t('aboutMe')}</h4>
                {isEditing ? (
                    <textarea value={editableProfile.summary} onChange={e => handleFieldChange('summary', e.target.value)} rows={4} className="w-full p-2 mt-1 border rounded bg-[var(--input-background)] border-[var(--border-muted-color)] text-sm"/>
                ) : (
                    <p className="text-[var(--text-muted-color)] text-base max-w-2xl mx-auto text-center">{currentProfile.summary}</p>
                )}
            </div>
            
            {/* Save/Cancel Buttons */}
            {isEditing && (
                <div className="mt-6 flex justify-end gap-3 border-t border-[var(--border-muted-color)] pt-4 w-full">
                     <button onClick={handleCancel} className="flex items-center px-4 py-2 bg-[var(--button-muted-background)] text-[var(--text-color)] rounded-lg hover:bg-[var(--button-muted-hover-background)] transition">
                        <XIcon className="w-5 h-5 mr-1 rtl:ml-1" />
                        {t('cancel')}
                    </button>
                    <button onClick={handleSave} className="flex items-center px-4 py-2 bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-white rounded-lg hover:from-[var(--gradient-start-hover)] hover:to-[var(--gradient-end-hover)] transition-all">
                        <CheckIcon className="w-5 h-5 mr-1 rtl:ml-1" />
                        {t('saveChanges')}
                    </button>
                </div>
            )}
        </div>
    );
};

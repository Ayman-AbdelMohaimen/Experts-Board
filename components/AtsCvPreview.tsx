import React, { useState, useEffect, useRef } from 'react';
import type { AtsCv } from '../types';
import { MailIcon } from './icons/MailIcon';
import { PhoneIcon } from './icons/PhoneIcon';
import { LinkedinIcon } from './icons/LinkedinIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { AcademicCapIcon } from './icons/AcademicCapIcon';
import { EditIcon } from './icons/EditIcon';
import { CheckIcon } from './icons/CheckIcon';
import { XIcon } from './icons/XIcon';
import { translations } from '../lib/translations';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

const loadedScripts = new Set<string>();
const loadScript = (src: string) => {
    if (loadedScripts.has(src)) {
        return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            loadedScripts.add(src);
            resolve(null);
        };
        script.onerror = reject;
        document.body.appendChild(script);
    });
};


const loadPdfScripts = async () => {
    await Promise.all([
        loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"),
        loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js")
    ]);
};

interface AtsCvPreviewProps {
  cv: AtsCv;
  isEditable?: boolean;
  onUpdate?: (updatedCv: AtsCv) => void;
  t: (key: keyof typeof translations) => string;
}

export const AtsCvPreview: React.FC<AtsCvPreviewProps> = ({ cv, isEditable = false, onUpdate, t }) => {
    const cvPreviewRef = useRef<HTMLDivElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editableCv, setEditableCv] = useState<AtsCv>(cv);
    const [isDownloading, setIsDownloading] = useState(false);
    const [showSaveFeedback, setShowSaveFeedback] = useState(false);

    useEffect(() => {
        setEditableCv(cv);
    }, [cv]);

    const handleSave = () => {
        if (onUpdate) {
            onUpdate(editableCv);
        }
        setIsEditing(false);
        setShowSaveFeedback(true);
        setTimeout(() => setShowSaveFeedback(false), 2000);
    };

    const handleCancel = () => {
        setEditableCv(cv);
        setIsEditing(false);
    };

    const handleFieldChange = (section: keyof AtsCv, value: any, subField?: string, index?: number, subIndex?: number) => {
        const newCv = JSON.parse(JSON.stringify(editableCv));
        if (index !== undefined) {
            if (subIndex !== undefined && subField) {
                 (newCv[section] as any)[index][subField][subIndex] = value;
            } else if (subField) {
                (newCv[section] as any)[index][subField] = value;
            }
        } else if (subField) {
            (newCv[section] as any)[subField] = value;
        } else {
            (newCv[section] as any) = value;
        }
        setEditableCv(newCv);
    };
    
    const downloadPdf = async () => {
        if (!cvPreviewRef.current) return;
        setIsDownloading(true);

        try {
            await loadPdfScripts();
            const { jsPDF } = (window as any).jspdf;
            const html2canvas = (window as any).html2canvas;

            const contentToRender = cvPreviewRef.current;
            const editButton = contentToRender.querySelector('.edit-button-container'); // Use a container class
            if(editButton) (editButton as HTMLElement).style.display = 'none';

            const canvas = await html2canvas(contentToRender, {
                scale: 2,
                backgroundColor: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
                useCORS: true,
                onclone: (doc) => {
                    const isDark = document.documentElement.classList.contains('dark');
                    const clone = doc.querySelector('.cv-render-container');
                    if (clone) {
                        if (isDark) {
                           (clone as HTMLElement).style.setProperty('background-color', '#1e293b'); // slate-800
                           (clone as HTMLElement).style.setProperty('color', '#e2e8f0'); // slate-200
                        } else {
                           (clone as HTMLElement).style.setProperty('background-color', '#ffffff');
                           (clone as HTMLElement).style.setProperty('color', '#0f172a'); // slate-900
                        }
                    }
                }
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`${cv.contact.name.replace(/ /g, '_')}_CV.pdf`);

            if(editButton) (editButton as HTMLElement).style.display = '';

        } catch (error) {
            console.error("Error generating PDF:", error);
            if(cvPreviewRef.current) {
                const editButton = cvPreviewRef.current.querySelector('.edit-button-container');
                if(editButton) (editButton as HTMLElement).style.display = '';
            }
        } finally {
            setIsDownloading(false);
        }
    };
    
    const cvData = isEditing ? editableCv : cv;

    return (
        <div className="animate-fade-in relative bg-[var(--card-background)] backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-[var(--border-color)]">
            <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4 flex items-center gap-2 edit-button-container">
                 {showSaveFeedback && (
                    <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400 bg-green-500/10 px-3 py-1 rounded-full animate-fade-in">
                        <CheckCircleIcon className="w-4 h-4" />
                        <span>Saved!</span>
                    </div>
                )}
                 {isEditable && !isEditing && (
                     <button onClick={() => setIsEditing(true)} className="p-2.5 rounded-lg bg-[var(--button-muted-background)] hover:bg-[var(--button-muted-hover-background)] transition">
                        <EditIcon className="w-5 h-5 text-[var(--text-muted-color)]" />
                    </button>
                 )}
            </div>

            <div ref={cvPreviewRef} className="cv-render-container bg-white dark:bg-slate-800 p-8 rounded-lg text-slate-900 dark:text-slate-200 font-sans">
                {/* Header */}
                <div className="text-center border-b-2 border-slate-300 dark:border-slate-600 pb-4 mb-4">
                     {isEditing ? <input type="text" value={cvData.contact.name} onChange={e => handleFieldChange('contact', e.target.value, 'name')} className="text-3xl font-bold w-full text-center p-1 bg-slate-100 dark:bg-slate-700 rounded"/> : <h1 className="text-3xl font-bold">{cvData.contact.name}</h1>}
                    <div className="flex justify-center items-center gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-400 mt-2 flex-wrap">
                        {isEditing ? <input type="text" value={cvData.contact.phone} onChange={e => handleFieldChange('contact', e.target.value, 'phone')} className="p-1 bg-slate-100 dark:bg-slate-700 rounded"/> : <span className="flex items-center gap-1"><PhoneIcon className="w-4 h-4" />{cvData.contact.phone}</span>}
                        <span className="hidden sm:inline">|</span>
                        {isEditing ? <input type="email" value={cvData.contact.email} onChange={e => handleFieldChange('contact', e.target.value, 'email')} className="p-1 bg-slate-100 dark:bg-slate-700 rounded"/> : <span className="flex items-center gap-1"><MailIcon className="w-4 h-4" />{cvData.contact.email}</span>}
                        <span className="hidden sm:inline">|</span>
                        {isEditing ? <input type="url" value={cvData.contact.linkedin} onChange={e => handleFieldChange('contact', e.target.value, 'linkedin')} className="p-1 bg-slate-100 dark:bg-slate-700 rounded"/> : <a href={cvData.contact.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-[var(--primary-color)]"><LinkedinIcon className="w-4 h-4" />LinkedIn</a>}
                    </div>
                </div>

                {/* Body */}
                <div className="space-y-6">
                    {/* Summary */}
                    <div>
                        <h2 className="text-xl font-bold text-[var(--primary-color)] dark:text-[var(--primary-color-light)] mb-2 border-b border-slate-200 dark:border-slate-700 pb-1">{t('professionalSummary')}</h2>
                        {isEditing ? <textarea value={cvData.summary} onChange={e => handleFieldChange('summary', e.target.value)} rows={3} className="w-full p-1 bg-slate-100 dark:bg-slate-700 rounded"/> : <p className="text-slate-700 dark:text-slate-300">{cvData.summary}</p>}
                    </div>
                    {/* Skills */}
                    <div>
                        <h2 className="text-xl font-bold text-[var(--primary-color)] dark:text-[var(--primary-color-light)] mb-2 border-b border-slate-200 dark:border-slate-700 pb-1">{t('skills')}</h2>
                        {isEditing ? <textarea value={cvData.skills.join(', ')} onChange={e => handleFieldChange('skills', e.target.value.split(',').map(s=>s.trim()))} rows={2} className="w-full p-1 bg-slate-100 dark:bg-slate-700 rounded"/> : <p className="text-slate-700 dark:text-slate-300">{cvData.skills.join(' • ')}</p>}
                    </div>
                    {/* Experience */}
                    <div>
                        <h2 className="text-xl font-bold text-[var(--primary-color)] dark:text-[var(--primary-color-light)] mb-2 border-b border-slate-200 dark:border-slate-700 pb-1">{t('workExperience')}</h2>
                        <div className="space-y-4">
                            {cvData.experience.map((exp, index) => (
                                <div key={index}>
                                    {isEditing ? <input type="text" value={exp.title} onChange={e => handleFieldChange('experience', e.target.value, 'title', index)} className="font-bold text-lg w-full p-1 bg-slate-100 dark:bg-slate-700 rounded"/> : <h3 className="font-bold text-lg">{exp.title}</h3>}
                                    {isEditing ? <input type="text" value={`${exp.company} | ${exp.dates}`} onChange={e => {
                                        const [company, dates] = e.target.value.split('|').map(s=>s.trim());
                                        handleFieldChange('experience', company, 'company', index);
                                        handleFieldChange('experience', dates, 'dates', index);
                                    }} className="w-full p-1 bg-slate-100 dark:bg-slate-700 rounded my-1"/> : <p className="text-slate-600 dark:text-slate-400">{exp.company} | {exp.dates}</p>}
                                    {isEditing ? <textarea value={exp.responsibilities.join('\n')} onChange={e => handleFieldChange('experience', e.target.value.split('\n'), 'responsibilities', index)} rows={3} className="w-full p-1 bg-slate-100 dark:bg-slate-700 rounded mt-1"/> : <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 mt-1">
                                        {exp.responsibilities.map((resp, i) => <li key={i}>{resp}</li>)}
                                    </ul>}
                                </div>
                            ))}
                        </div>
                    </div>
                     {/* Education */}
                    <div>
                        <h2 className="text-xl font-bold text-[var(--primary-color)] dark:text-[var(--primary-color-light)] mb-2 border-b border-slate-200 dark:border-slate-700 pb-1">{t('education')}</h2>
                        {cvData.education.map((edu, index) => (
                             <div key={index}>
                                {isEditing ? <input type="text" value={`${edu.degree} - ${edu.institution}, ${edu.year}`} className="w-full p-1 bg-slate-100 dark:bg-slate-700 rounded" onChange={e => {
                                    const parts = e.target.value.split(/ - |, /);
                                    handleFieldChange('education', parts[0] || '', 'degree', index);
                                    handleFieldChange('education', parts[1] || '', 'institution', index);
                                    handleFieldChange('education', parts[2] || '', 'year', index);
                                }}/> : <p className="text-slate-700 dark:text-slate-300"><strong>{edu.degree}</strong> - {edu.institution}, {edu.year}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {isEditing ? (
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
            ) : (
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={downloadPdf}
                        disabled={isDownloading}
                        className="px-6 py-3 bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-white font-semibold rounded-lg shadow-md hover:from-[var(--gradient-start-hover)] hover:to-[var(--gradient-end-hover)] transition-all disabled:opacity-50"
                    >
                        {isDownloading ? t('downloading') : t('downloadAsPdf')}
                    </button>
                </div>
            )}
        </div>
    );
};
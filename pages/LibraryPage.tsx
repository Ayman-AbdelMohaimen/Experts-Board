import React, { useState, useEffect } from 'react';
import { SavedItem, SavedItemType, ExpertProduct, CourseOutline, SuggestionCategory } from '../types';
import { getLibraryItems, deleteLibraryItem, updateLibraryItem } from '../lib/storageUtils';
import { translations } from '../lib/translations';
import { BookmarkIcon } from '../components/icons/BookmarkIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { ActionToolbar } from '../components/ActionToolbar';
import { CubeIcon } from '../components/icons/CubeIcon';
import { WrenchScrewdriverIcon } from '../components/icons/WrenchScrewdriverIcon';
import { ClipboardListIcon } from '../components/icons/ClipboardListIcon';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';
import { LightBulbIcon } from '../components/icons/LightBulbIcon';
import { EditIcon } from '../components/icons/EditIcon';
import { CheckIcon } from '../components/icons/CheckIcon';
import { XIcon } from '../components/icons/XIcon';
import { trackEvent } from '../services/analyticsService';

interface LibraryPageProps {
  t: (key: keyof typeof translations) => string;
}

const typeConfig: Record<SavedItemType, { icon: React.FC<any>, labelKey: keyof typeof translations }> = {
    services: { icon: WrenchScrewdriverIcon, labelKey: 'suggestedServices' },
    products: { icon: CubeIcon, labelKey: 'suggestedProducts' },
    courseOutline: { icon: ClipboardListIcon, labelKey: 'courseStructure' },
    assessments: { icon: CheckCircleIcon, labelKey: 'suggestedAssessments' },
    improvementPlan: { icon: LightBulbIcon, labelKey: 'improvementPlan' },
};

const EditableCardContent: React.FC<{ item: SavedItem; editContent: any; setEditContent: (content: any) => void; t: LibraryPageProps['t'] }> = ({ item, editContent, setEditContent, t }) => {
    
    const handleListChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditContent(e.target.value.split('\n').filter(Boolean));
    };

    const handleProductChange = (index: number, field: keyof ExpertProduct, value: string) => {
        const newProducts = [...(editContent as ExpertProduct[])];
        newProducts[index] = { ...newProducts[index], [field]: value };
        setEditContent(newProducts);
    };

    switch (item.type) {
        case 'services':
            return <textarea value={(editContent as string[]).join('\n')} onChange={handleListChange} className="w-full p-2 mt-1 border rounded bg-[var(--input-background)] border-[var(--border-muted-color)] text-sm" rows={5} />;
        
        case 'products':
            return <div className="space-y-2">{ (editContent as ExpertProduct[]).map((p, i) => (
                <div key={i} className="space-y-1 p-2 border rounded border-[var(--border-muted-color)]">
                    <input type="text" value={p.name} onChange={e => handleProductChange(i, 'name', e.target.value)} placeholder={t('productName')} className="w-full p-1 border rounded bg-[var(--input-background)] border-[var(--border-muted-color)] font-semibold text-sm"/>
                    <textarea value={p.description} onChange={e => handleProductChange(i, 'description', e.target.value)} placeholder={t('productDescription')} className="w-full p-1 border rounded bg-[var(--input-background)] border-[var(--border-muted-color)] text-sm" rows={2}/>
                </div>
            ))}</div>;

        case 'courseOutline':
             const course = editContent as CourseOutline;
             return <textarea value={course.description} onChange={e => setEditContent({...course, description: e.target.value})} className="w-full p-2 mt-1 border rounded bg-[var(--input-background)] border-[var(--border-muted-color)] text-sm" rows={5} />;

        case 'assessments':
        case 'improvementPlan':
            const suggestions = editContent as SuggestionCategory[];
            return <div className="space-y-2">{suggestions.map((cat, catIndex) => (
                <div key={catIndex}>
                    <h5 className="font-semibold text-sm">{cat.emoji} {cat.category}</h5>
                     <textarea value={cat.suggestions.join('\n')} onChange={e => {
                        const newContent = [...suggestions];
                        newContent[catIndex] = {...cat, suggestions: e.target.value.split('\n').filter(Boolean)};
                        setEditContent(newContent);
                     }} className="w-full p-2 mt-1 border rounded bg-[var(--input-background)] border-[var(--border-muted-color)] text-sm" rows={4} />
                </div>
            ))}</div>;
        default: return null;
    }
};

const SavedItemCard: React.FC<{ item: SavedItem; onDelete: (id: string) => void; onUpdate: (id: string, title: string, content: any) => void; t: LibraryPageProps['t'] }> = ({ item, onDelete, onUpdate, t }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(item.title);
    const [editContent, setEditContent] = useState<any>(item.content);

    const handleSave = () => {
        onUpdate(item.id, editTitle, editContent);
        setIsEditing(false);
    };
    
    const handleCancel = () => {
        setEditTitle(item.title);
        setEditContent(item.content);
        setIsEditing(false);
    };

    const renderContent = () => {
        if (isEditing) {
            return <EditableCardContent item={item} editContent={editContent} setEditContent={setEditContent} t={t} />;
        }

        switch (item.type) {
            case 'services':
                return <ul className="list-disc list-inside space-y-1 text-sm text-[var(--text-muted-color)]">{(item.content as string[]).map((s, i) => <li key={i}>{s}</li>)}</ul>;
            case 'products':
                return <div className="space-y-2">{(item.content as ExpertProduct[]).map((p, i) => <div key={i} className="text-sm text-[var(--text-muted-color)]"><strong className="text-[var(--text-color)]">{p.name}</strong> ({p.type}): {p.description}</div>)}</div>;
            case 'courseOutline':
                const course = item.content as CourseOutline;
                return <p className="text-sm text-[var(--text-muted-color)] line-clamp-2">{course.description}</p>;
            case 'assessments':
            case 'improvementPlan':
                 return <div className="space-y-2">{(item.content as SuggestionCategory[]).map((c, i) => <div key={i} className="text-sm"><span className="mr-2">{c.emoji}</span><strong className="text-[var(--text-color)]">{c.category}</strong></div>)}</div>;
            default:
                return <p className="text-sm text-[var(--text-muted-color)]">لا يمكن عرض المحتوى.</p>
        }
    }
    
    return (
        <div className="bg-[var(--card-background)] backdrop-blur-xl p-4 rounded-2xl shadow-lg border border-[var(--border-color)] flex flex-col justify-between h-full">
            <div>
                <div className="flex items-start justify-between">
                    {isEditing ? (
                        <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="font-bold text-[var(--text-color)] mb-2 pr-12 w-full p-1 border rounded bg-[var(--input-background)] border-[var(--border-muted-color)]"
                        />
                    ) : (
                        <h3 className="font-bold text-[var(--text-color)] mb-2 pr-12">{item.title}</h3>
                    )}
                    <div className="flex items-center gap-1 shrink-0">
                        {!isEditing && <ActionToolbar content={item.content} type={item.type} title={item.title} t={t} isCompact />}
                        <button onClick={() => setIsEditing(!isEditing)} title={t('edit')} className="p-2 rounded-full text-[var(--text-muted-color)] hover:bg-slate-500/10 hover:text-[var(--text-color)] transition-colors">
                            <EditIcon className="w-4 h-4" />
                        </button>
                         <button onClick={() => onDelete(item.id)} title={t('deleteFromLibrary')} className="p-2 rounded-full text-red-500/80 hover:bg-red-500/10 hover:text-red-500 transition-colors">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                {!isEditing && <div className="text-xs text-[var(--text-muted-color)] mb-3">{new Date(item.timestamp).toLocaleString()}</div>}
                {renderContent()}
            </div>
             {isEditing && (
                <div className="mt-4 flex justify-end gap-2 border-t border-[var(--border-muted-color)] pt-3">
                    <button onClick={handleCancel} className="flex items-center px-3 py-1 bg-[var(--button-muted-background)] text-[var(--text-color)] rounded-lg hover:bg-[var(--button-muted-hover-background)] transition text-sm">
                        <XIcon className="w-4 h-4 mr-1" />
                        {t('cancel')}
                    </button>
                    <button onClick={handleSave} className="flex items-center px-3 py-1 bg-[var(--primary-color)] text-white rounded-lg hover:bg-[var(--primary-color-hover)] transition text-sm">
                        <CheckIcon className="w-4 h-4 mr-1" />
                        {t('saveChanges')}
                    </button>
                </div>
            )}
        </div>
    );
};

const LibraryPage: React.FC<LibraryPageProps> = ({ t }) => {
    const [items, setItems] = useState<SavedItem[]>([]);

    useEffect(() => {
        trackEvent('page_view', { pageName: 'Library' });
        setItems(getLibraryItems());
    }, []);
    
    const handleDelete = (id: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
            deleteLibraryItem(id);
            setItems(getLibraryItems());
        }
    };
    
    const handleUpdate = (id: string, title: string, content: any) => {
        updateLibraryItem(id, title, content);
        setItems(getLibraryItems());
    };

    const groupedItems = items.reduce((acc, item) => {
        (acc[item.type] = acc[item.type] || []).push(item);
        return acc;
    }, {} as Record<SavedItemType, SavedItem[]>);

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center h-[50vh]">
                <div className="p-6 bg-[var(--primary-color-translucent)] rounded-full mb-6">
                    <BookmarkIcon className="w-16 h-16 text-[var(--primary-color-light)]" />
                </div>
                <h1 className="text-4xl font-bold text-[var(--text-color)] mb-2">{t('libraryEmpty')}</h1>
                <p className="text-lg text-[var(--text-muted-color)] max-w-md">{t('libraryEmptyDesc')}</p>
            </div>
        );
    }
    
    let globalItemIndex = 0;

    return (
        <div className="space-y-10 animate-fade-in">
             <h1 className="text-3xl font-bold text-[var(--text-color)]">{t('library')}</h1>
             {Object.entries(groupedItems).map(([type, groupItems]: [string, SavedItem[]]) => {
                const config = typeConfig[type as SavedItemType];
                if (!config) return null;
                const Icon = config.icon;

                return (
                    <div key={type}>
                        <div className="flex items-center gap-3 mb-4">
                            <Icon className="w-7 h-7 text-[var(--primary-color)] dark:text-[var(--primary-color-light)]" />
                            <h2 className="text-2xl font-bold text-[var(--text-color)]">{t(config.labelKey)}</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {groupItems.map(item => {
                                const currentIndex = globalItemIndex++;
                                return (
                                     <div key={item.id} className="animate-fade-in-up" style={{ animationDelay: `${currentIndex * 100}ms`}}>
                                        <SavedItemCard item={item} onDelete={handleDelete} onUpdate={handleUpdate} t={t} />
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )
             })}
        </div>
    );
};

export default LibraryPage;

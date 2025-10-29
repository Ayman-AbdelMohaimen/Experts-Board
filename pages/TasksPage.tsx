import React, { useState, useEffect, useMemo } from 'react';
import { translations } from '../lib/translations';
import { getTasks, saveTasks, addTask } from '../lib/storageUtils';
import type { Task, SavedItemType, ExpertProduct, CourseOutline, SuggestionCategory } from '../types';
import { PlusCircleIcon } from '../components/icons/PlusCircleIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { EditIcon } from '../components/icons/EditIcon';
import { CheckIcon } from '../components/icons/CheckIcon';
import { XIcon } from '../components/icons/XIcon';
import { EyeIcon } from '../components/icons/EyeIcon';
import ReactDOM from 'react-dom';
import { ClipboardCheckIcon } from '../components/icons/ClipboardCheckIcon';
import { WrenchScrewdriverIcon } from '../components/icons/WrenchScrewdriverIcon';
import { CubeIcon } from '../components/icons/CubeIcon';
import { ClipboardListIcon } from '../components/icons/ClipboardListIcon';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';
import { LightBulbIcon } from '../components/icons/LightBulbIcon';
import { ArrowDownUpIcon } from '../components/icons/ArrowDownUpIcon';
import { trackEvent } from '../services/analyticsService';


interface TasksPageProps {
  t: (key: keyof typeof translations) => string;
}

const typeConfig: Record<SavedItemType, { icon: React.FC<any> }> = {
    services: { icon: WrenchScrewdriverIcon },
    products: { icon: CubeIcon },
    courseOutline: { icon: ClipboardListIcon },
    assessments: { icon: CheckCircleIcon },
    improvementPlan: { icon: LightBulbIcon },
};

const ViewSourceModal: React.FC<{ task: Task | null; onClose: () => void; t: TasksPageProps['t'] }> = ({ task, onClose, t }) => {
    if (!task || !task.source) return null;

    const renderContent = () => {
        const { content, type } = task.source!;
        switch (type) {
            case 'services':
                return <ul className="list-disc list-inside space-y-1">{(content as string[]).map((s, i) => <li key={i}>{s}</li>)}</ul>;
            case 'products':
                return (<div className="space-y-4">{(content as ExpertProduct[]).map((p, i) => (
                    <div key={i} className="border-b border-[var(--border-color)] pb-2 last:border-b-0">
                        <div className="flex justify-between items-baseline">
                             <h4 className="font-bold text-[var(--text-color)]">{p.name}</h4>
                             {p.price && <span className="text-xs font-semibold bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full">{p.price}</span>}
                        </div>
                        <p className="text-xs text-[var(--text-muted-color)] mb-1">{p.type}</p>
                        <p>{p.description}</p>
                    </div>
                ))}</div>);
            case 'courseOutline':
                const course = content as CourseOutline;
                return (
                    <div className="space-y-4">
                        <h4 className="font-bold text-xl text-[var(--text-color)]">{course.courseTitle}</h4>
                        <p className="text-[var(--text-muted-color)]">{course.description}</p>
                        <div className="border-t border-[var(--border-color)] pt-2">
                             <h5 className="font-semibold mb-2">{t('courseModules')}</h5>
                             <ul className="list-disc list-inside space-y-1">
                                {course.modules.map((mod, i) => <li key={i}>{mod.title}</li>)}
                            </ul>
                        </div>
                    </div>
                );
            case 'assessments':
            case 'improvementPlan':
                 return <div className="space-y-2">{(content as SuggestionCategory[]).map((c, i) => <div key={i}><span className="mr-2">{c.emoji}</span><strong>{c.category}</strong></div>)}</div>;
            default:
                return <p>لا يمكن عرض المحتوى.</p>
        }
    }

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-[var(--background-elevated-color)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-[var(--border-color)]">
                    <h3 className="text-lg font-bold">{task.source.title}</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--button-muted-background)]"><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-6 overflow-y-auto text-sm text-[var(--text-muted-color)]">{renderContent()}</div>
                <div className="p-4 border-t border-[var(--border-color)] flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-[var(--button-muted-background)] text-[var(--text-color)] rounded-lg hover:bg-[var(--button-muted-hover-background)] transition font-semibold">إغلاق</button>
                </div>
            </div>
        </div>,
        document.body
    );
};


const TasksPage: React.FC<TasksPageProps> = ({ t }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskText, setNewTaskText] = useState('');
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editingTaskText, setEditingTaskText] = useState('');
    const [sourceModalTask, setSourceModalTask] = useState<Task | null>(null);
    const [sortBy, setSortBy] = useState<'manual' | 'newest' | 'oldest'>('newest');
    const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

    useEffect(() => {
        trackEvent('page_view', { pageName: 'Tasks' });
        const storedSortBy = localStorage.getItem('taskSortBy') as typeof sortBy;
        if (storedSortBy) setSortBy(storedSortBy);
        setTasks(getTasks());
    }, []);
    
    const handleSetSort = (newSortBy: typeof sortBy) => {
        setSortBy(newSortBy);
        localStorage.setItem('taskSortBy', newSortBy);
        setIsSortMenuOpen(false);
    };

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskText.trim()) return;
        addTask(newTaskText.trim());
        setTasks(getTasks());
        setNewTaskText('');
    };

    const handleToggleComplete = (id: string) => {
        const newTasks = tasks.map(task =>
            task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
        );
        saveTasks(newTasks);
        setTasks(getTasks()); // re-fetch to get default sort order
    };

    const handleDeleteTask = (id: string) => {
        const newTasks = tasks.filter(task => task.id !== id);
        saveTasks(newTasks);
        setTasks(newTasks);
    };

    const startEditing = (task: Task) => {
        setEditingTaskId(task.id);
        setEditingTaskText(task.text);
    };

    const cancelEditing = () => {
        setEditingTaskId(null);
        setEditingTaskText('');
    };

    const handleSaveEdit = (id: string) => {
        if (!editingTaskText.trim()) {
            handleDeleteTask(id);
            return;
        }
        const newTasks = tasks.map(task =>
            task.id === id ? { ...task, text: editingTaskText } : task
        );
        saveTasks(newTasks);
        setTasks(newTasks);
        cancelEditing();
    };
    
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
        setDraggedTaskId(taskId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDrop = (targetTaskId: string) => {
        if (!draggedTaskId || draggedTaskId === targetTaskId) return;

        const activeTaskList = tasks.filter(t => !t.isCompleted);
        const draggedIndex = activeTaskList.findIndex(t => t.id === draggedTaskId);
        const targetIndex = activeTaskList.findIndex(t => t.id === targetTaskId);
        
        if (draggedIndex === -1 || targetIndex === -1) return;

        const reorderedList = [...activeTaskList];
        const [draggedItem] = reorderedList.splice(draggedIndex, 1);
        reorderedList.splice(targetIndex, 0, draggedItem);
        
        const completedList = tasks.filter(t => t.isCompleted);
        const newFullTaskList = [...reorderedList, ...completedList];
        
        setTasks(newFullTaskList);
        saveTasks(newFullTaskList);
    };

    const completedTasks = useMemo(() => tasks.filter(t => t.isCompleted), [tasks]);
    
    const sortedActiveTasks = useMemo(() => {
        const active = tasks.filter(t => !t.isCompleted);
        switch (sortBy) {
            case 'newest':
                return [...active].sort((a, b) => b.createdAt - a.createdAt);
            case 'oldest':
                return [...active].sort((a, b) => a.createdAt - b.createdAt);
            case 'manual':
            default:
                return active;
        }
    }, [tasks, sortBy]);

    const sortOptions = {
        'manual': t('sortManual'),
        'newest': t('sortNewest'),
        'oldest': t('sortOldest'),
    };

    return (
        <>
            <ViewSourceModal task={sourceModalTask} onClose={() => setSourceModalTask(null)} t={t} />
            <div className="space-y-8 animate-fade-in">
                <div className="flex items-center gap-4">
                    <ClipboardCheckIcon className="w-10 h-10 text-[var(--primary-color)]" />
                    <h1 className="text-3xl font-bold text-[var(--text-color)]">{t('myTasks')}</h1>
                </div>

                <div className="bg-[var(--card-background)] backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-[var(--border-color)]">
                    <form onSubmit={handleAddTask} className="flex gap-2 mb-6">
                        <input
                            type="text"
                            value={newTaskText}
                            onChange={(e) => setNewTaskText(e.target.value)}
                            placeholder={t('addNewTask')}
                            className="w-full p-2 border rounded-lg bg-[var(--input-background)] border-[var(--border-muted-color)] text-[var(--text-color)] focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                        />
                        <button type="submit" className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-white font-semibold rounded-lg shadow-md hover:from-[var(--gradient-start-hover)] hover:to-[var(--gradient-end-hover)] transition-all disabled:opacity-50" disabled={!newTaskText.trim()}>
                            <PlusCircleIcon className="w-6 h-6" />
                        </button>
                    </form>

                    {/* To-Do Tasks */}
                    <div className="space-y-4">
                         <div className="flex justify-between items-center border-b border-[var(--border-muted-color)] pb-2">
                            <h2 className="text-xl font-bold">{t('todo')} ({sortedActiveTasks.length})</h2>
                            <div className="relative">
                                <button
                                    onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                                    disabled={sortedActiveTasks.length < 2}
                                    className="flex items-center gap-2 text-sm font-semibold text-[var(--text-muted-color)] px-3 py-1.5 rounded-lg hover:bg-[var(--button-muted-background)] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ArrowDownUpIcon className="w-4 h-4"/>
                                    <span>{sortOptions[sortBy]}</span>
                                </button>
                                {isSortMenuOpen && (
                                    <div className="absolute top-full mt-2 right-0 rtl:right-auto rtl:left-0 bg-[var(--background-elevated-color)] border border-[var(--border-color)] rounded-lg shadow-lg z-10 w-40">
                                        {(Object.keys(sortOptions) as Array<keyof typeof sortOptions>).map(key => (
                                            <button key={key} onClick={() => handleSetSort(key)} className="block w-full text-right rtl:text-left px-4 py-2 text-sm text-[var(--text-color)] hover:bg-slate-500/10">{sortOptions[key]}</button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        {sortedActiveTasks.length > 0 ? (
                            <div className="space-y-2">
                                {sortedActiveTasks.map(task => {
                                    const SourceIcon = task.source ? typeConfig[task.source.type].icon : null;
                                    const isDraggable = sortBy === 'manual';
                                    return (
                                        <div 
                                            key={task.id}
                                            draggable={isDraggable}
                                            onDragStart={isDraggable ? (e) => handleDragStart(e, task.id) : undefined}
                                            onDragOver={isDraggable ? (e) => e.preventDefault() : undefined}
                                            onDrop={isDraggable ? () => handleDrop(task.id) : undefined}
                                            onDragEnd={isDraggable ? () => setDraggedTaskId(null) : undefined}
                                            className={`flex items-center p-2 rounded-lg bg-slate-500/10 transition-opacity ${isDraggable ? 'cursor-move' : ''} ${draggedTaskId === task.id ? 'opacity-30' : 'opacity-100'}`}>
                                            <input type="checkbox" checked={false} onChange={() => handleToggleComplete(task.id)} className="w-5 h-5 rounded text-[var(--primary-color)] bg-[var(--input-background)] border-[var(--border-muted-color)] focus:ring-[var(--primary-color)] shrink-0 mx-2" />
                                            {editingTaskId === task.id ? (
                                                <input type="text" value={editingTaskText} onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(task.id); if (e.key === 'Escape') cancelEditing(); }} onBlur={() => handleSaveEdit(task.id)} onChange={(e) => setEditingTaskText(e.target.value)} className="w-full p-1 border rounded bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600" autoFocus />
                                            ) : (
                                                <span className="flex-grow">{task.text}</span>
                                            )}
                                            <div className="flex items-center gap-1 ml-auto shrink-0">
                                                {task.source && SourceIcon && (
                                                    <button onClick={() => setSourceModalTask(task)} title={t('viewSource')} className="p-2 text-[var(--text-muted-color)] hover:bg-slate-500/10 rounded-full"><SourceIcon className="w-4 h-4" /></button>
                                                )}
                                                {editingTaskId === task.id ? (
                                                    <>
                                                        <button onClick={() => handleSaveEdit(task.id)} className="p-2 text-green-500 hover:bg-green-500/10 rounded-full"><CheckIcon className="w-4 h-4" /></button>
                                                        <button onClick={cancelEditing} className="p-2 text-gray-500 hover:bg-gray-500/10 rounded-full"><XIcon className="w-4 h-4" /></button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={() => startEditing(task)} className="p-2 text-[var(--text-muted-color)] hover:bg-slate-500/10 rounded-full"><EditIcon className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDeleteTask(task.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full"><TrashIcon className="w-4 h-4" /></button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <p className="text-center text-[var(--text-muted-color)] py-4">{t('noTasks')}</p>
                        )}
                    </div>

                    {/* Completed Tasks */}
                    {completedTasks.length > 0 && (
                        <div className="space-y-4 mt-8">
                            <h2 className="text-xl font-bold border-b border-[var(--border-muted-color)] pb-2">{t('completed')} ({completedTasks.length})</h2>
                            <div className="space-y-2">
                                {completedTasks.map(task => (
                                    <div key={task.id} className="flex items-center p-2 rounded-lg bg-green-500/10">
                                        <input type="checkbox" checked={true} onChange={() => handleToggleComplete(task.id)} className="w-5 h-5 rounded text-[var(--primary-color)] bg-[var(--input-background)] border-[var(--border-muted-color)] focus:ring-[var(--primary-color)] shrink-0 mx-2" />
                                        <span className="flex-grow line-through text-[var(--text-muted-color)]">{task.text}</span>
                                        <button onClick={() => handleDeleteTask(task.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full ml-auto shrink-0"><TrashIcon className="w-4 h-4" /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default TasksPage;
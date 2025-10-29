import type { SavedItem, SavedItemType, Task } from '../types';

const LIBRARY_KEY = 'expertLibrary';
const TASKS_STORAGE_KEY = 'developmentTasks';

// --- Library Functions ---

export const getLibraryItems = (): SavedItem[] => {
    try {
        const storedItems = localStorage.getItem(LIBRARY_KEY);
        if (storedItems) {
            // Sort by most recent first
            return JSON.parse(storedItems).sort((a: SavedItem, b: SavedItem) => b.timestamp - a.timestamp);
        }
    } catch (e) {
        console.error("Failed to parse library items from localStorage", e);
        localStorage.removeItem(LIBRARY_KEY);
    }
    return [];
};

export const saveLibraryItem = (type: SavedItemType, title: string, content: any): void => {
    const currentItems = getLibraryItems();
    
    const newItem: SavedItem = {
        id: crypto.randomUUID(),
        type,
        title,
        content,
        timestamp: Date.now(),
    };
    
    const updatedItems = [...currentItems, newItem];
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(updatedItems));
};

export const deleteLibraryItem = (id: string): void => {
    const currentItems = getLibraryItems();
    const updatedItems = currentItems.filter(item => item.id !== id);
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(updatedItems));
};

export const isItemInLibrary = (type: SavedItemType, title: string): boolean => {
    const items = getLibraryItems();
    return items.some(item => item.type === type && item.title === title);
};

export const deleteLibraryItemByTypeAndTitle = (type: SavedItemType, title: string): void => {
    const currentItems = getLibraryItems();
    const updatedItems = currentItems.filter(item => !(item.type === type && item.title === title));
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(updatedItems));
};

export const updateLibraryItem = (id: string, newTitle: string, newContent: any): void => {
    const currentItems = getLibraryItems();
    const updatedItems = currentItems.map(item => {
        if (item.id === id) {
            return { ...item, title: newTitle, content: newContent, timestamp: Date.now() };
        }
        return item;
    });
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(updatedItems));
};


// --- Task Functions ---

export const getTasks = (): Task[] => {
    try {
        const stored = localStorage.getItem(TASKS_STORAGE_KEY);
        const tasks = stored ? JSON.parse(stored) : [];
        // Sort by creation date (newest first), then by completion status
        return tasks.sort((a: Task, b: Task) => {
            if (a.isCompleted !== b.isCompleted) {
                return a.isCompleted ? 1 : -1;
            }
            return b.createdAt - a.createdAt;
        });
    } catch (e) {
        console.error("Failed to parse tasks from localStorage", e);
        return [];
    }
};

export const saveTasks = (tasks: Task[]): void => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
};

export const addTask = (text: string, source?: Task['source']): void => {
    let currentTasks = getTasks();
    // Only filter for duplicates if a source is provided. This prevents deleting manual tasks.
    if (source) {
      currentTasks = currentTasks.filter(task => !(task.source?.type === source.type && task.source?.title === source.title));
    }
    const newTask: Task = {
        id: crypto.randomUUID(),
        text,
        isCompleted: false,
        source,
        createdAt: Date.now(),
    };
    const updatedTasks = [newTask, ...currentTasks];
    saveTasks(updatedTasks);
};

export const isTaskCreatedFromSource = (sourceType: SavedItemType, sourceTitle: string): boolean => {
    const tasks = getTasks();
    return tasks.some(task => task.source?.type === sourceType && task.source?.title === sourceTitle);
};
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { toast } from 'sonner';

// --- Types & Interfaces ---

export type MoodType = 'rage' | 'sadness' | 'pensive' | 'calm' | 'euphoria';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  parentId?: string;
  group: string;
  createdAt: number;
  dueDate?: string;
  reminderTime?: string;
  repeat?: string;
}

export interface Log {
  id: string;
  text: string;
  time: string;
  createdAt: number;
}

export interface MoodLog {
  id: string;
  type: MoodType;
  time: string;
  createdAt: number;
}

export interface Reflection {
  id: string;
  text: string;
  title?: string;
  category: string; // ID of category
  color?: string; // Background color
  time: string;
  createdAt: number;
  isDeleted?: boolean; // For Trash Bin
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string; // Optional emoji
}

export interface Entry {
  tasks: Task[];
  logs: Log[];
  moodLogs: MoodLog[];
  reflections: Reflection[];
}

export type JournalTabMode = 'journal' | 'tasks' | 'log' | 'stats' | 'user';
export type JournalViewMode = 'day' | 'month';
export type CalendarViewMode = 'week' | 'month' | 'year';
export type Theme = 'light' | 'dark' | 'purple' | 'nature';

interface JournalContextType {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  data: Record<string, Entry>;
  
  // Tab & View Modes
  tabMode: JournalTabMode;
  setTabMode: (mode: JournalTabMode) => void;
  viewMode: JournalViewMode;
  setViewMode: (mode: JournalViewMode) => void;
  calendarViewMode: CalendarViewMode;
  setCalendarViewMode: (mode: CalendarViewMode) => void;
  
  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // Task Actions
  addTask: (text: string, parentId?: string, meta?: any) => void;
  toggleTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  taskCategories: string[];
  addTaskCategory: (cat: string) => void;
  updateTaskCategory: (oldName: string, newName: string) => void;
  deleteTaskCategory: (cat: string) => void;

  // Log Actions
  addLog: (text: string) => void;
  deleteLog: (id: string) => void;
  updateLog: (id: string, text: string) => void;

  // Mood Actions
  addMood: (type: MoodType) => void;
  deleteMood: (id: string) => void;

  // Reflection Actions (Updated)
  addReflection: (text: string, category?: string, title?: string, color?: string) => void;
  updateReflection: (id: string, text: string, title?: string, color?: string) => void;
  deleteReflection: (id: string) => void;
  softDeleteReflection: (id: string) => void; // Move to trash
  restoreReflection: (id: string) => void; // Restore from trash
  permanentDeleteReflection: (id: string) => void;
  
  // Note Categories (Updated to Objects)
  noteCategories: Category[];
  addNoteCategory: (cat: Category) => void;
  updateNoteCategory: (id: string, updates: Partial<Category>) => void;
  deleteNoteCategory: (id: string, deleteNotes?: boolean) => void; // deleteNotes: true=delete with notes, false=move to uncategorized

  // Data Management
  exportData: () => void;
  importData: (jsonString: string) => void;
  clearData: () => void;

  // Settings
  quickActionsVisible: boolean;
  setQuickActionsVisible: (v: boolean) => void;
  dayResultsVisible: boolean;
  setDayResultsVisible: (v: boolean) => void;
  calendarSummaryVisible: boolean;
  setCalendarSummaryVisible: (v: boolean) => void;
  periodStatsVisible: boolean;
  setPeriodStatsVisible: (v: boolean) => void;
  chartsVisible: boolean;
  setChartsVisible: (v: boolean) => void;
  summaryCardsVisible: boolean;
  setSummaryCardsVisible: (v: boolean) => void;
  moodDistributionVisible: boolean;
  setMoodDistributionVisible: (v: boolean) => void;

  // Quick Actions Logic
  isQuickActionEnabled: (id: string) => boolean;
  toggleQuickAction: (id: string) => void;

  // UI State
  focusTarget: 'log' | null;
  setFocusTarget: (t: 'log' | null) => void;
  entrySectionStates: { timeline: boolean; mood: boolean; tasks: boolean; reflections: boolean };
  setEntrySectionStates: (s: any) => void;
  
  // User
  userName: string;
  setUserName: (n: string) => void;
  hasOnboarded: boolean;
  setHasOnboarded: (b: boolean) => void;
}

const STORAGE_KEY = 'nirvana-data-v2';
const SETTINGS_KEY = 'nirvana-settings-v2';

// --- Configs ---
export const QUICK_ACTIONS_CONFIG = {
  'workout': { id: 'workout', emoji: '🏋️', label: 'Спорт' },
  'water': { id: 'water', emoji: '💧', label: 'Вода' },
  'food': { id: 'food', emoji: '🍎', label: 'Еда' },
  'reading': { id: 'reading', emoji: '📚', label: 'Чтение' },
  'meditation': { id: 'meditation', emoji: '🧘', label: 'Медитация' },
  'walk': { id: 'walk', emoji: '🚶', label: 'Прогулка' },
  'smoking': { id: 'smoking', emoji: '🚬', label: 'Курю' },
  'eating': { id: 'eating', emoji: '🍽️', label: 'Ем' },
  'gaming': { id: 'gaming', emoji: '🎮', label: 'Играю' },
  'sleeping': { id: 'sleeping', emoji: '😴', label: 'Сплю' },
  'working': { id: 'working', emoji: '💼', label: 'Работаю' },
  'studying': { id: 'studying', emoji: '🎓', label: 'Учусь' },
  'movie': { id: 'movie', emoji: '🎬', label: 'Кино' },
  'cleaning': { id: 'cleaning', emoji: '🧹', label: 'Уборка' },
  'meeting': { id: 'meeting', emoji: '🤝', label: 'Встреча' },
};

// Helper
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export const JournalProvider = ({ children }: { children: ReactNode }) => {
  // --- State ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [data, setData] = useState<Record<string, Entry>>({});
  const [mounted, setMounted] = useState(false);

  const [tabMode, setTabMode] = useState<JournalTabMode>('journal');
  const [viewMode, setViewMode] = useState<JournalViewMode>('month');
  const [calendarViewMode, setCalendarViewMode] = useState<CalendarViewMode>('month');
  
  const [theme, setThemeState] = useState<Theme>('light');
  const [quickActionsVisible, setQuickActionsVisible] = useState(true);
  const [enabledQuickActions, setEnabledQuickActions] = useState<string[]>(Object.keys(QUICK_ACTIONS_CONFIG));
  const [dayResultsVisible, setDayResultsVisible] = useState(true);
  const [calendarSummaryVisible, setCalendarSummaryVisible] = useState(true);
  const [periodStatsVisible, setPeriodStatsVisible] = useState(true);
  const [chartsVisible, setChartsVisible] = useState(true);
  const [summaryCardsVisible, setSummaryCardsVisible] = useState(true);
  const [moodDistributionVisible, setMoodDistributionVisible] = useState(true);
  
  const [taskCategories, setTaskCategories] = useState(['Личные', 'Работа']);
  
  // --- Updated Note Categories State (Migration from String[] to Category[]) ---
  const [noteCategories, setNoteCategories] = useState<Category[]>([
    { id: 'default_personal', name: 'Личные', color: '#E8A87C' },
    { id: 'default_ideas', name: 'Идеи', color: '#c084fc' },
    { id: 'default_work', name: 'Работа', color: '#94a3b8' }
  ]);
  
  const [focusTarget, setFocusTarget] = useState<'log' | null>(null);
  const [entrySectionStates, setEntrySectionStates] = useState({ timeline: true, mood: true, tasks: true, reflections: true });

  const [userName, setUserName] = useState('Гость');
  const [hasOnboarded, setHasOnboarded] = useState(false);

  // --- Initialization ---
  useEffect(() => {
    setMounted(true);
    
    // Load Data
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setData(parsed.data || {});
        setTheme(parsed.theme || 'light');
        setQuickActionsVisible(parsed.quickActionsVisible ?? true);
        setEnabledQuickActions(parsed.enabledQuickActions || Object.keys(QUICK_ACTIONS_CONFIG));
        setTaskCategories(parsed.taskCategories || ['Личные', 'Работа']);
        
        // Migration for noteCategories
        if (parsed.noteCategories) {
          if (Array.isArray(parsed.noteCategories) && parsed.noteCategories.length > 0) {
            if (typeof parsed.noteCategories[0] === 'string') {
              // Old format strings, migrate to objects
              setNoteCategories(parsed.noteCategories.map((name: string, index: number) => ({
                id: `migrated_${index}`,
                name: name,
                color: ['#E8A87C', '#c084fc', '#94a3b8', '#22c55e', '#3b82f6'][index % 5]
              })));
            } else {
              // New format objects
              setNoteCategories(parsed.noteCategories);
            }
          }
        }

        setUserName(parsed.userName || 'Гость');
        setHasOnboarded(parsed.hasOnboarded || false);
      } catch (e) {
        console.error('Failed to load data', e);
      }
    }

    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
       try {
         const parsed = JSON.parse(savedSettings);
       } catch (e) {}
    }
  }, []);

  // --- Persistence ---
  useEffect(() => {
    if (!mounted) return;
    const toSave = {
      data,
      theme,
      quickActionsVisible,
      enabledQuickActions,
      taskCategories,
      noteCategories,
      userName,
      hasOnboarded
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }, [data, theme, quickActionsVisible, enabledQuickActions, taskCategories, noteCategories, userName, hasOnboarded, mounted]);

  // --- Actions ---

  // 1. Task Actions
  const addTask = (text: string, parentId?: string, meta?: any) => {
    let key = format(currentDate, 'yyyy-MM-dd');
    let group = 'Личные';
    if (parentId) {
      for (const k of Object.keys(data)) {
        const entry = data[k];
        const parent = entry?.tasks?.find(t => t.id === parentId);
        if (parent) {
          key = k;
          group = parent.group || 'Личные';
          break;
        }
      }
    }
    const newTask: Task = {
      id: generateId(),
      text,
      completed: false,
      parentId,
      group: group,
      createdAt: Date.now(),
      ...meta
    };
    setData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        tasks: [...(prev[key]?.tasks || []), newTask]
      }
    }));
  };

  const toggleTask = (id: string) => {
    setData(prev => {
      const newData = { ...prev };
      for (const key in newData) {
        const task = newData[key].tasks?.find(t => t.id === id);
        if (task) {
          newData[key] = {
            ...newData[key],
            tasks: newData[key].tasks?.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
          };
          break;
        }
      }
      return newData;
    });
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setData(prev => {
      const newData = { ...prev };
      for (const key in newData) {
        const task = newData[key].tasks?.find(t => t.id === id);
        if (task) {
          newData[key] = {
            ...newData[key],
            tasks: newData[key].tasks?.map(t => t.id === id ? { ...t, ...updates } : t)
          };
          break;
        }
      }
      return newData;
    });
  };

  const deleteTask = (id: string) => {
    setData(prev => {
      const newData = { ...prev };
      for (const key in newData) {
        if (newData[key].tasks?.some(t => t.id === id)) {
          newData[key] = {
            ...newData[key],
            tasks: newData[key].tasks?.filter(t => t.id !== id)
          };
          break;
        }
      }
      return newData;
    });
  };

  const addTaskCategory = (cat: string) => {
    if (!taskCategories.includes(cat)) {
      setTaskCategories([...taskCategories, cat]);
    }
  };

  const updateTaskCategory = (oldName: string, newName: string) => {
    setTaskCategories(prev => prev.map(c => c === oldName ? newName : c));
    setData(prev => {
      const newData = { ...prev };
      for (const key in newData) {
        newData[key] = {
          ...newData[key],
          tasks: newData[key].tasks?.map(t => t.group === oldName ? { ...t, group: newName } : t)
        };
      }
      return newData;
    });
  };

  const deleteTaskCategory = (cat: string) => {
    setTaskCategories(prev => prev.filter(c => c !== cat));
    setData(prev => {
      const newData = { ...prev };
      for (const key in newData) {
        newData[key] = {
          ...newData[key],
          tasks: newData[key].tasks?.map(t => t.group === cat ? { ...t, group: 'Личные' } : t)
        };
      }
      return newData;
    });
  };

  // 2. Log Actions
  const addLog = (text: string) => {
    const key = format(currentDate, 'yyyy-MM-dd');
    const newLog: Log = {
      id: generateId(),
      text,
      time: format(new Date(), 'HH:mm'),
      createdAt: Date.now()
    };
    setData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        logs: [...(prev[key]?.logs || []), newLog]
      }
    }));
  };

  const deleteLog = (id: string) => {
    setData(prev => {
      const newData = { ...prev };
      for (const key in newData) {
        if (newData[key].logs?.some(l => l.id === id)) {
          newData[key] = { ...newData[key], logs: newData[key].logs?.filter(l => l.id !== id) };
          break;
        }
      }
      return newData;
    });
  };

  const updateLog = (id: string, text: string) => {
    setData(prev => {
      const newData = { ...prev };
      for (const key in newData) {
        if (newData[key].logs?.some(l => l.id === id)) {
          newData[key] = { ...newData[key], logs: newData[key].logs?.map(l => l.id === id ? { ...l, text } : l) };
          break;
        }
      }
      return newData;
    });
  };

  // 3. Mood Actions
  const addMood = (type: MoodType) => {
    const key = format(currentDate, 'yyyy-MM-dd');
    const newMood: MoodLog = {
      id: generateId(),
      type,
      time: format(new Date(), 'HH:mm'),
      createdAt: Date.now()
    };
    setData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        moodLogs: [...(prev[key]?.moodLogs || []), newMood]
      }
    }));
  };

  const deleteMood = (id: string) => {
    setData(prev => {
      const newData = { ...prev };
      for (const key in newData) {
        if (newData[key].moodLogs?.some(m => m.id === id)) {
          newData[key] = { ...newData[key], moodLogs: newData[key].moodLogs?.filter(m => m.id !== id) };
          break;
        }
      }
      return newData;
    });
  };

  // 4. Reflection Actions (Updated)
  const addReflection = (text: string, category = 'default_personal', title = '', color = '#FAF9F6') => {
    const key = format(currentDate, 'yyyy-MM-dd');
    const newRef: Reflection = {
      id: generateId(),
      text,
      title,
      category,
      color,
      time: format(new Date(), 'HH:mm'),
      createdAt: Date.now(),
      isDeleted: false
    };
    setData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        reflections: [...(prev[key]?.reflections || []), newRef]
      }
    }));
  };

  const updateReflection = (id: string, text: string, title?: string, color?: string) => {
    setData(prev => {
      const newData = { ...prev };
      for (const key in newData) {
        if (newData[key].reflections?.some(r => r.id === id)) {
          newData[key] = { ...newData[key], reflections: newData[key].reflections?.map(r => r.id === id ? { ...r, text, title, ...(color && { color }) } : r) };
          break;
        }
      }
      return newData;
    });
  };

  const deleteReflection = (id: string) => {
    setData(prev => {
      const newData = { ...prev };
      for (const key in newData) {
        if (newData[key].reflections?.some(r => r.id === id)) {
          newData[key] = { ...newData[key], reflections: newData[key].reflections?.filter(r => r.id !== id) };
          break;
        }
      }
      return newData;
    });
  };

  const softDeleteReflection = (id: string) => {
    setData(prev => {
      const newData = { ...prev };
      for (const key in newData) {
        if (newData[key].reflections?.some(r => r.id === id)) {
          newData[key] = { ...newData[key], reflections: newData[key].reflections?.map(r => r.id === id ? { ...r, isDeleted: true } : r) };
          break;
        }
      }
      return newData;
    });
  };

  const restoreReflection = (id: string) => {
    setData(prev => {
      const newData = { ...prev };
      for (const key in newData) {
        if (newData[key].reflections?.some(r => r.id === id)) {
          newData[key] = { ...newData[key], reflections: newData[key].reflections?.map(r => r.id === id ? { ...r, isDeleted: false } : r) };
          break;
        }
      }
      return newData;
    });
  };

  const permanentDeleteReflection = (id: string) => {
    setData(prev => {
      const newData = { ...prev };
      for (const key in newData) {
        if (newData[key].reflections?.some(r => r.id === id)) {
          newData[key] = { ...newData[key], reflections: newData[key].reflections?.filter(r => r.id !== id) };
          break;
        }
      }
      return newData;
    });
  };

  // 5. Note Categories Actions (Updated)
  const addNoteCategory = (cat: Category) => {
    if (!noteCategories.find(c => c.id === cat.id)) {
      setNoteCategories([...noteCategories, cat]);
    }
  };

  const updateNoteCategory = (id: string, updates: Partial<Category>) => {
    setNoteCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    // Note: updating category ID requires updating all reflections referencing it. 
    // For simplicity, we only update name/color here.
  };

  const deleteNoteCategory = (id: string, deleteNotes = false) => {
    if (deleteNotes) {
      // Delete all notes in this category permanently
      setData(prev => {
        const newData = { ...prev };
        for (const key in newData) {
          newData[key] = {
            ...newData[key],
            reflections: newData[key].reflections?.filter(r => r.category !== id)
          };
        }
        return newData;
      });
    } else {
      // Move notes to 'Uncategorized' (default_personal or a special ID)
      // Let's use a special 'uncategorized' or keep them as is but filter view.
      // Let's map them to first available category or create 'Без категории'
      const targetCatId = 'uncategorized_fallback';
      setData(prev => {
        const newData = { ...prev };
        for (const key in newData) {
          newData[key] = {
            ...newData[key],
            reflections: newData[key].reflections?.map(r => r.category === id ? { ...r, category: targetCatId } : r)
          };
        }
        return newData;
      });
    }
    setNoteCategories(prev => prev.filter(c => c.id !== id));
  };

  // 6. Data Management
  const exportData = () => {
    const dataStr = JSON.stringify({ data, theme, taskCategories, noteCategories, userName, enabledQuickActions });
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nirvana-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
  };

  const importData = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.data) setData(parsed.data);
      if (parsed.theme) setThemeState(parsed.theme);
      if (parsed.taskCategories) setTaskCategories(parsed.taskCategories);
      if (parsed.noteCategories) setNoteCategories(parsed.noteCategories);
      if (parsed.userName) setUserName(parsed.userName);
      if (parsed.enabledQuickActions) setEnabledQuickActions(parsed.enabledQuickActions);
      toast.success('Импорт завершен');
    } catch (e) {
      toast.error('Ошибка импорта');
    }
  };

  const clearData = () => {
    if (confirm('Вы уверены? Все данные будут удалены.')) {
      setData({});
      toast.success('Данные очищены');
    }
  };

  // Set Theme wrapper
  const setTheme = (t: Theme) => {
    setThemeState(t);
    document.documentElement.classList.remove('light', 'dark');
    if (t !== 'light') document.documentElement.classList.add(t);
  };

  return (
    <JournalContext.Provider
      value={{
        currentDate, setCurrentDate,
        data,
        tabMode, setTabMode,
        viewMode, setViewMode,
        calendarViewMode, setCalendarViewMode,
        theme, setTheme,
        addTask, toggleTask, updateTask, deleteTask,
        addTaskCategory, updateTaskCategory, deleteTaskCategory, taskCategories,
        addLog, deleteLog, updateLog,
        addMood, deleteMood,
        addReflection, updateReflection, deleteReflection,
        softDeleteReflection, restoreReflection, permanentDeleteReflection,
        addNoteCategory, updateNoteCategory, deleteNoteCategory, noteCategories,
        exportData, importData, clearData,
        quickActionsVisible, setQuickActionsVisible,
        dayResultsVisible, setDayResultsVisible,
        calendarSummaryVisible, setCalendarSummaryVisible,
        periodStatsVisible, setPeriodStatsVisible,
        chartsVisible, setChartsVisible,
        summaryCardsVisible, setSummaryCardsVisible,
        moodDistributionVisible, setMoodDistributionVisible,
        isQuickActionEnabled: (id: string) => enabledQuickActions.includes(id),
        toggleQuickAction: (id: string) => {
          setEnabledQuickActions(prev => {
            if (prev.includes(id)) {
              return prev.filter(i => i !== id);
            } else {
              return [...prev, id];
            }
          });
        },
        focusTarget, setFocusTarget,
        entrySectionStates, setEntrySectionStates,
        userName, setUserName,
        hasOnboarded, setHasOnboarded
      }}
    >
      {children}
    </JournalContext.Provider>
  );
};

export const useJournal = () => {
  const context = useContext(JournalContext);
  if (!context) throw new Error('useJournal must be used within JournalProvider');
  return context;
};
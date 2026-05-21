"use client";

import { useState, useMemo } from "react";
import { useJournal } from "@/lib/journal-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, CheckCircle2, Trash2, Pencil, Folder, FileStack, Plus, Calendar, Repeat, Search, Archive, X, StickyNote, ListTodo, ChevronDown, ChevronUp } from "lucide-react";
import { TaskEditor } from "./TaskEditor"; 

const COMPLETED_ID = 'completed';
const ALL_ID = 'all';

export default function TasksMenu() {
  const { 
    data, 
    addTask, 
    toggleTask, 
    deleteTask, 
    addReflection, 
    deleteReflection,
    updateReflection,
    taskCategories, 
    addTaskCategory,
    updateTaskCategory,
    deleteTaskCategory,
    noteCategories,
    addNoteCategory,
    updateNoteCategory,
    deleteNoteCategory,
    theme
  } = useJournal();

  const isDark = theme === 'dark';
  const isPurple = theme === 'purple';
  const isNature = theme === 'nature';

  const [viewType, setViewType] = useState<'tasks' | 'notes'>('tasks');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(ALL_ID);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Task Creation State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("Личные");

  // Note Creation/Edit State
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteText, setNewNoteText] = useState("");
  const [newNoteCategory, setNewNoteCategory] = useState("default_personal");
  const [newNoteColor, setNewNoteColor] = useState("#FFFFFF");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null); 

  // Category Management State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [catName, setCatName] = useState("");
  const [catColor, setCatColor] = useState("#E8A87C");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  // Editor State
  const [editorTaskId, setEditorTaskId] = useState<string | null>(null);
  
  // Expansion State for subtasks
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(new Set());

  // Helper to toggle expansion
  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTaskIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  // --- THEMING HELPERS ---
  const getBg = () => {
    if (theme === 'dark') return 'bg-slate-950';
    if (theme === 'purple') return 'bg-purple-50';
    if (theme === 'nature') return 'bg-[#F2F0E9]';
    return 'bg-[#FAF9F6]';
  };

  const getSurface = () => {
    if (theme === 'dark') return 'bg-slate-900 text-slate-100';
    if (theme === 'purple') return 'bg-white text-purple-900';
    if (theme === 'nature') return 'bg-[#E9E6DB] text-[#2C362F]';
    return 'bg-white text-[#4A403A]';
  };

  const getBorder = () => {
    if (theme === 'dark') return 'border-slate-800';
    if (theme === 'purple') return 'border-purple-200';
    if (theme === 'nature') return 'border-[#D3CCC0]';
    return 'border-black/5';
  };

  const getPrimaryColor = () => {
    if (theme === 'purple') return '#c084fc';
    if (theme === 'dark') return '#94a3b8';
    if (theme === 'nature') return '#3E4E3C';
    return '#E8A87C';
  };

  const getPrimaryBg = () => {
    return `bg-[${getPrimaryColor()}]`;
  };
  
  const getMutedText = () => {
    if (theme === 'dark') return 'text-slate-500';
    if (theme === 'purple') return 'text-purple-400';
    if (theme === 'nature') return 'text-[#5F6A63]';
    return 'text-gray-400';
  };

  const getActiveCategory = () => {
    if (theme === 'dark') return 'bg-slate-800 text-slate-100';
    if (theme === 'purple') return 'bg-purple-100 text-purple-900';
    if (theme === 'nature') return 'bg-[#E5E2D6] text-[#2C362F]';
    return 'bg-black/5 text-[#4A403A]';
  };

  const getCardStyles = (isTask = true) => {
    return cn(
      "rounded-xl p-4 shadow-sm hover:shadow-md transition-all relative flex flex-col border border-b-4", 
      isTask ? "" : "",
      theme === 'dark' ? 'bg-slate-900 border-slate-800' :
      theme === 'purple' ? 'bg-white border-purple-200' :
      theme === 'nature' ? 'bg-[#E9E6DB] border-[#D3CCC0]' :
      'bg-white border-black/5'
    );
  };

  const getTextColor = () => {
    if (theme === 'dark') return 'text-slate-100';
    if (theme === 'purple') return 'text-purple-900';
    if (theme === 'nature') return 'text-[#2C362F]';
    return 'text-[#4A403A]';
  };

  // --- DATA AGGREGATION ---
  
  // Tasks
  const allTasks = useMemo(() => {
    const tasks: any[] = [];
    Object.keys(data).forEach(key => {
      const entry = data[key];
      if (entry && entry.tasks) {
        entry.tasks.forEach(task => {
          tasks.push({ ...task, dateKey: key });
        });
      }
    });
    return tasks.sort((a, b) => {
      if (a.completed === b.completed) {
        return b.createdAt - a.createdAt;
      }
      return a.completed ?1 : -1;
    });
  }, [data]);

  const mainTasks = useMemo(() => {
    return allTasks.filter(t => !t.parentId);
  }, [allTasks]);

  const filteredTasks = useMemo(() => {
    return mainTasks.filter(task => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = task.text.toLowerCase().includes(query);
      if (!matchesSearch) return false;
      if (selectedCategoryId === COMPLETED_ID) {
        return task.completed === true;
      } else if (selectedCategoryId === ALL_ID) {
        return task.completed === false;
      } else {
        return task.group === selectedCategoryId && task.completed === false;
      }
    });
  }, [mainTasks, searchQuery, selectedCategoryId]);

  // Notes
  const allNotes = useMemo(() => {
    const notes: any[] = [];
    Object.keys(data).forEach(key => {
      const entry = data[key];
      if (entry && entry.reflections) {
        entry.reflections.forEach(ref => {
          notes.push({ ...ref, dateKey: key });
        });
      }
    });
    return notes.sort((a, b) => b.createdAt - a.createdAt);
  }, [data]);

  const filteredNotes = useMemo(() => {
    return allNotes.filter(note => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        (note.title && note.title.toLowerCase().includes(query)) || 
        note.text.toLowerCase().includes(query);
      if (!matchesSearch) return false;
      if (selectedCategoryId === 'all') return true;
      return note.category === selectedCategoryId;
    });
  }, [allNotes, searchQuery, selectedCategoryId]);

  const categories = viewType === 'tasks' ? taskCategories.map(c => ({id: c, name: c, color: '#E8A87C'})) : noteCategories;

  // --- HANDLERS ---

  const handleCreateTask = () => {
    if (!newTaskText.trim()) return;
    addTask(newTaskText, undefined, { group: newTaskCategory });
    setNewTaskText("");
    setIsCreateModalOpen(false);
  };

  const handleNoteSubmit = () => {
    if (!newNoteText.trim()) return;

    if (editingNoteId) {
      updateReflection(editingNoteId, newNoteText, newNoteTitle, newNoteColor);
    } else {
      addReflection(newNoteText, newNoteCategory, newNoteTitle, newNoteColor);
    }
    
    setIsCreateModalOpen(false);
    setEditingNoteId(null);
    setNewNoteTitle("");
    setNewNoteText("");
    setNewNoteColor("#FFFFFF");
  };

  const handleOpenEdit = (item: any) => {
    if (viewType === 'tasks') {
      setEditorTaskId(item.id);
    } else if (viewType === 'notes') {
      setEditingNoteId(item.id);
      setNewNoteTitle(item.title || "");
      setNewNoteText(item.text);
      setNewNoteCategory(item.category || "default_personal");
      setNewNoteColor(item.color || "#FFFFFF");
      setIsCreateModalOpen(true);
    }
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Удалить навсегда?")) {
      if (viewType === 'tasks') deleteTask(id);
      else deleteReflection(id);
    }
  };

  const handleOpenCategoryModal = (catId?: string) => {
    setIsSidebarOpen(false);
    if (catId) {
      const isTask = viewType === 'tasks';
      const cat = isTask 
        ? taskCategories.find(c => c === catId) 
        : noteCategories.find(c => c.id === catId);
      
      if (cat) {
        setEditingCategoryId(catId);
        setCatName(isTask ? cat : cat.name);
        setCatColor(isTask ? "#E8A87C" : cat.color);
      }
    } else {
      setEditingCategoryId(null);
      setCatName("");
      setCatColor("#E8A87C");
    }
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = () => {
    if (!catName.trim()) return;
    if (editingCategoryId) {
      if (viewType === 'tasks') {
        updateTaskCategory(editingCategoryId, catName.trim());
        if (selectedCategoryId === editingCategoryId) setSelectedCategoryId(catName.trim());
      } else {
        updateNoteCategory(editingCategoryId, { name: catName.trim(), color: catColor });
      }
    } else {
      if (viewType === 'tasks') addTaskCategory(catName.trim());
      else addNoteCategory({ id: `cat_${Date.now()}`, name: catName.trim(), color: catColor });
    }
    setIsCategoryModalOpen(false);
    setEditingCategoryId(null);
  };

  const handleDeleteCategory = () => {
    if (!editingCategoryId) return;
    const msg = viewType === 'tasks' 
      ? `Удалить категорию "${catName}"? Задачи будут перенесены в "Личные".`
      : `Удалить категорию "${catName}"?`;
      
    if (confirm(msg)) {
      if (viewType === 'tasks') {
        deleteTaskCategory(editingCategoryId);
      } else {
        deleteNoteCategory(editingCategoryId, false);
      }
      setIsCategoryModalOpen(false);
      if (selectedCategoryId === editingCategoryId) setSelectedCategoryId(ALL_ID);
    }
  };
  
  const handleOpenCreateNoteModal = () => {
    setEditingNoteId(null);
    setNewNoteTitle("");
    setNewNoteText("");
    setNewNoteCategory(selectedCategoryId === ALL_ID ? "default_personal" : selectedCategoryId);
    setNewNoteColor("#FFFFFF");
    setIsCreateModalOpen(true);
  }

  return (
    <div className={cn("h-full flex flex-col relative overflow-hidden transition-colors", getBg())}>
      
      {/* --- SIDEBAR OVERLAY --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <div className={cn(
        "fixed top-0 left-0 h-full w-64 shadow-2xl z-50 transition-transform duration-300 ease-in-out flex flex-col",
        "transform -translate-x-full",
        isSidebarOpen && "translate-x-0",
        getSurface()
      )}>
        <div className={cn("p-3 border-b flex items-center justify-between", getBorder())}>
          <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">{viewType === 'tasks' ? 'Папки' : 'Папки'}</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-1 space-y-0.5">
          
          <button
            onClick={() => { setSelectedCategoryId(ALL_ID); setIsSidebarOpen(false); }}
            className={cn(
              "w-full text-left px-2 py-1.5 rounded flex items-center gap-2 transition-colors text-xs",
              selectedCategoryId === ALL_ID ? getActiveCategory() : "hover:bg-black/5 " + getMutedText()
            )}
          >
            <FileStack size={14} />
            <span className="font-medium truncate">{viewType === 'tasks' ? 'Все' : 'Все заметки'}</span>
          </button>

          {viewType === 'tasks' && (
             <button
              onClick={() => { setSelectedCategoryId(COMPLETED_ID); setIsSidebarOpen(false); }}
              className={cn(
                "w-full text-left px-2 py-1.5 rounded flex items-center gap-2 transition-colors text-xs",
                selectedCategoryId === COMPLETED_ID ? getActiveCategory() : "hover:bg-black/5 " + getMutedText()
              )}
            >
              <Archive size={14} />
              <span className="font-medium truncate">Архив</span>
            </button>
          )}

          <div className={cn("my-2 border-t mx-1", getBorder())} />

          {categories.map(cat => (
            <div key={cat.id} className="relative">
              <button
                onClick={() => { setSelectedCategoryId(cat.id); setIsSidebarOpen(false); }}
                className={cn(
                  "w-full text-left px-2 py-1.5 rounded flex items-center gap-2 transition-colors text-xs",
                  selectedCategoryId === cat.id ? getActiveCategory() : "hover:bg-black/5 " + getMutedText()
                )}
              >
                <div className="w-2 h-2 rounded-full border border-black/5 flex-shrink-0" 
                     style={{ backgroundColor: cat.color }} 
                />
                <span className="font-medium truncate">{cat.name}</span>
              </button>
              
              <button
                onClick={(e) => { e.stopPropagation(); handleOpenCategoryModal(cat.id); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 hover:text-foreground p-1"
              >
                ⋮
              </button>
            </div>
          ))}

          <button
            onClick={() => handleOpenCategoryModal()}
            className="w-full text-left px-2 py-1.5 rounded flex items-center gap-2 text-muted-foreground hover:bg-black/5 transition-colors text-xs"
          >
            <Plus size={14} />
            <span className="font-medium">Новая папка</span>
          </button>
        </div>
      </div>

      {/* --- SIDEBAR TRIGGER --- */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className={cn(
          "fixed left-0 top-1/2 -translate-y-1/2 z-30 p-2 rounded-r-lg shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95",
          theme === 'dark' ? 'bg-slate-800 text-slate-100 hover:bg-slate-700' : 'bg-white text-gray-500 hover:bg-gray-50',
          getBorder()
        )}
        title="Открыть папки"
      >
        {isSidebarOpen ? '❮' : '❯'}
      </button>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative pl-0">
        
        {/* Header */}
        <div className={cn("p-3 border-b flex items-center gap-2", getBorder(), getSurface())}>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-500 hover:text-gray-700 p-1.5">
            {isSidebarOpen ? '❮' : '❯'}
          </button>

          <div className="relative flex-1">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={viewType === 'tasks' ? "Поиск задач..." : "Поиск заметок..."}
              className={cn(
                "h-8 pl-7 pr-0 text-xs bg-transparent border-0 border-b border-black/10 focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-[#E8A87C] rounded-none",
                theme === 'dark' ? 'text-slate-100' : 'text-[#4A403A]'
              )}
            />
          </div>
        </div>

        {/* --- VIEW SWITCHER TABS --- */}
        <div className="p-3">
           <div className={cn(
             "flex p-1 rounded-xl shadow-sm border",
             getSurface(), getBorder()
           )}>
             <button 
               onClick={() => setViewType('tasks')}
               className={cn(
                 "flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                 viewType === 'tasks' 
                   ? `${getPrimaryBg()} text-white shadow-sm` 
                   : `hover:bg-black/5 text-gray-500`
               )}
             >
               <ListTodo size={14} /> Задачи
             </button>
             <button 
               onClick={() => setViewType('notes')}
               className={cn(
                 "flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                 viewType === 'notes' 
                   ? `${getPrimaryBg()} text-white shadow-sm` 
                   : `hover:bg-black/5 text-gray-500`
               )}
             >
               <StickyNote size={14} /> Заметки
             </button>
           </div>
        </div>

        {/* Content Grid */}
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar pb-24">
          {viewType === 'tasks' ? (
            filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                <div className="text-4xl mb-2">{selectedCategoryId === COMPLETED_ID ? '📦' : '📭'}</div>
                <p className="text-xs">{selectedCategoryId === COMPLETED_ID ? 'Архив пуст' : 'Нет задач'}</p>
              </div>
            ) : (
              <div className="flex flex-col space-y-4">
                {filteredTasks.map(task => {
                   // Find subtasks for this task
                   const subtasks = allTasks.filter(t => t.parentId === task.id);
                   const isExpanded = expandedTaskIds.has(task.id);
                   const visibleSubtasks = isExpanded ? subtasks : subtasks.slice(0, 2);
                   
                   return (
                    <div
                      key={task.id}
                      onClick={() => handleOpenEdit(task)} // Open editor on click
                      className={cn(getCardStyles(true), 
                         task.completed ? "opacity-60 grayscale" : "",
                         "cursor-pointer active:scale-[0.99] transition-transform duration-100"
                      )}
                      style={{ borderColor: task.completed ? 'transparent' : getPrimaryColor() }}
                    >
                      <div className="flex items-start gap-3 mb-2">
                        {/* Checkbox - Fixed size */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Don't open editor
                            toggleTask(task.id);
                          }}
                          className={cn(
                            "mt-0.5 flex-shrink-0 flex items-center justify-center rounded-sm border transition-colors w-5 h-5",
                            task.completed 
                              ? `${getPrimaryBg()} border-transparent` 
                              : (isDark ? "border-slate-600" : isPurple ? "border-purple-300" : isNature ? "border-[#D3CCC0]" : "border-gray-300")
                          )}
                        >
                          {task.completed && <CheckCircle2 size={14} className="text-white pointer-events-none" />}
                        </button>
                        
                        {/* Text Content - Full Width Support */}
                        <div className="flex-1 min-w-0">
                           {/* Main Text - Ensuring word wrap and left align */}
                           <div className={cn("text-base leading-relaxed text-left break-words whitespace-normal w-full", task.completed ? "line-through text-gray-400" : getTextColor())}>
                             {task.text}
                           </div>
                        </div>
                        
                        {/* Delete Action - Always Visible */}
                        <button 
                           onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(task.id, e);
                           }} 
                           className="flex-shrink-0 text-gray-400 hover:text-red-500 p-1"
                        >
                           <Trash2 size={16} />
                        </button>
                      </div>
                      
                      {/* SUBTASKS DISPLAY */}
                      {subtasks.length > 0 && (
                         <div 
                           onClick={(e) => e.stopPropagation()} // Prevent card click when interacting with subtasks
                           className="mt-3 pt-2 border-t border-dashed border-black/10 space-y-1.5 ml-8 overflow-hidden" 
                         >
                            {visibleSubtasks.map(sub => { 
                              const isSubCompleted = sub.completed;
                              return (
                                <div key={sub.id} className="flex items-center gap-3 text-sm pl-2 border-l border-gray-200 group/sub w-full">
                                  <button 
                                    onClick={(e) => { 
                                       e.stopPropagation(); // Prevent card click
                                       toggleTask(sub.id); 
                                    }}
                                    className={cn(
                                      "flex-shrink-0 flex items-center justify-center rounded-sm border transition-colors w-4 h-4",
                                      isSubCompleted 
                                        ? (isPurple ? "bg-[#c084fc] border-[#c084fc]" : isDark ? "bg-[#94a3b8] border-[#94a3b8]" : isNature ? "bg-[#3E4E3C] border-[#3E4E3C]" : "bg-[#E8A87C] border-[#E8A87C]")
                                        : (isDark ? "border-slate-600" : isPurple ? "border-purple-300" : isNature ? "border-[#D3CCC0]" : "border-gray-300")
                                    )}
                                  >
                                    {isSubCompleted && <Check size={10} className="text-white pointer-events-none" />}
                                  </button>
                                  <span 
                                    className={cn("flex-1 text-left leading-relaxed cursor-pointer whitespace-normal break-words min-w-0", isSubCompleted ? "line-through text-gray-400" : "opacity-90", getTextColor())}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleTask(sub.id);
                                    }}
                                  >
                                    {sub.text}
                                  </span>
                                  
                                  {/* Subtask Delete - Always Visible */}
                                  <button 
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        deleteTask(sub.id); 
                                    }}
                                    className="flex-shrink-0 p-0.5 text-gray-400 hover:text-red-500"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              );
                            })}
                            
                            {/* Expand/Collapse Button */}
                            {subtasks.length > 2 && (
                              <button
                                onClick={() => toggleTaskExpansion(task.id)}
                                className={cn("flex items-center gap-1 pl-2 w-full text-left hover:opacity-80 transition-opacity", getMutedText())}
                              >
                                {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                <span className="text-[10px] font-bold">
                                  {isExpanded ? 'Свернуть' : `Еще ${subtasks.length - 2}`}
                                </span>
                              </button>
                            )}
                         </div>
                      )}

                      <div className="mt-3 pt-2 border-t border-black/5 flex items-center justify-between opacity-60">
                        <span className="text-[10px] uppercase font-bold tracking-wider truncate max-w-[60%] text-left">
                          {task.group || 'Без категории'}
                        </span>
                        <div className="flex gap-2 text-xs">
                           {task.dueDate && <Calendar size={12} />}
                           {task.reminderTime && <span>🔔</span>}
                           {task.repeat && task.repeat !== 'none' && <Repeat size={12} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            // Notes Grid - Kept as Grid
            filteredNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                <div className="text-4xl mb-2">📭</div>
                <p className="text-xs">Нет заметок</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredNotes.map(note => (
                  <div
                    key={note.id}
                    onClick={() => handleOpenEdit(note)}
                    // Changed: Removed backgroundColor style, added borderLeft style. Use getCardStyles for bg/border.
                    className={cn(getCardStyles(false), "cursor-pointer active:scale-95 transition-transform duration-100")}
                    style={{ borderLeft: `4px solid ${note.color || getPrimaryColor()}` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[9px] font-bold uppercase tracking-wider truncate max-w-[60%] text-gray-500 text-left">
                          {noteCategories.find(c => c.id === note.category)?.name || 'Без категории'}
                       </span>
                       <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <button 
                             onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(note.id, e);
                             }} 
                             className="pointer-events-auto p-0.5 hover:text-red-500"
                          >
                            <Trash2 size={12} />
                          </button>
                       </div>
                    </div>
                    <div className="flex-1 min-h-0">
                      {note.title && <p className="text-xs font-bold mb-1 leading-none truncate text-[#4A403A] text-left">{note.title}</p>}
                      <p className="text-sm leading-tight line-clamp-4 whitespace-pre-wrap text-[#4A403A] text-left">{note.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* --- FLOATING ACTION BUTTON (FAB) --- */}
      <button
        onClick={() => { 
          if (viewType === 'tasks') { 
            setNewTaskText(""); 
            setNewTaskCategory(selectedCategoryId === ALL_ID || selectedCategoryId === COMPLETED_ID ? "Личные" : selectedCategoryId); 
          } else {
            handleOpenCreateNoteModal();
          }
          setIsCreateModalOpen(true); 
        }} 
        className={cn(
          "fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center text-white",
          getPrimaryBg()
        )}
        title={viewType === 'tasks' ? 'Новая задача' : 'Новая заметка'}
      >
        <Plus size={28} />
      </button>

      {/* --- CREATE/EDIT MODAL (Unified) --- */}
      <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
          setIsCreateModalOpen(open);
          if (!open) {
              setEditingNoteId(null);
              setNewNoteTitle("");
              setNewNoteText("");
          }
      }}>
        <DialogContent className={cn("max-w-sm p-0 gap-0 overflow-hidden", getSurface())}>
          <div className={cn("p-3 border-b flex items-center", getBorder())}>
            <DialogTitle className={cn("text-xs font-bold uppercase tracking-wider", getMutedText())}>
              {viewType === 'tasks' ? 'Новая задача' : (editingNoteId ? 'Редактировать заметку' : 'Новая заметка')}
            </DialogTitle>
          </div>
          
          <div className="p-4 space-y-4">
            {viewType === 'tasks' ? (
              <>
                <Input 
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  placeholder="Название задачи..."
                  className="border-none focus-visible:ring-0 px-0 text-sm font-bold placeholder:text-gray-300"
                  autoFocus
                />
              </>
            ) : (
              <>
                <Input 
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  placeholder="Заголовок"
                  className="border-none focus-visible:ring-0 px-0 text-sm font-bold placeholder:text-gray-300"
                />
                <Textarea 
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Текст заметки..."
                  className="border-none focus-visible:ring-0 px-0 text-sm resize-none h-20 placeholder:text-gray-300"
                />
                <div className="flex gap-2">
                   {['#FFFFFF', '#FAF9F6', '#E8A87C', '#c084fc', '#84cc16'].map(c => (
                      <button 
                        key={c} 
                        onClick={() => setNewNoteColor(c)}
                        className={cn("w-6 h-6 rounded-full border border-black/10 hover:scale-110 transition-transform", newNoteColor === c ? 'ring-2 ring-offset-1 ring-gray-400' : '')}
                        style={{ backgroundColor: c }}
                      />
                   ))}
                </div>
              </>
            )}
          </div>

          <div className={cn("p-4 border-t flex gap-2", getBorder())}>
            {viewType === 'tasks' ? (
              <>
                <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-7 text-[10px] border-none bg-transparent shadow-none px-0 w-auto flex-1">
                        <Folder size={12} className="mr-2" />
                        {taskCategories.find(c => c === newTaskCategory) || 'Личные'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-48 p-1 bg-white">
                       {taskCategories.map(cat => (
                         <button
                           key={cat}
                           onClick={() => setNewTaskCategory(cat)}
                           className={cn("w-full text-left px-3 py-1.5 text-[10px] rounded-md hover:bg-black/5 flex items-center gap-2", newTaskCategory === cat ? 'font-bold' : '')}
                         >
                           <div className="w-2 h-2 rounded-full bg-[#E8A87C]" />
                           {cat}
                         </button>
                       ))}
                    </PopoverContent>
                </Popover>
                <Button onClick={handleCreateTask} className="flex-1 bg-[#E8A87C] hover:bg-[#d49a6d] text-white h-7 text-xs">
                  Создать
                </Button>
              </>
            ) : (
              <>
                 <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-7 text-[10px] border-none bg-transparent shadow-none px-0 w-auto flex-1">
                        <Folder size={12} className="mr-2" />
                        {noteCategories.find(c => c.id === newNoteCategory)?.name || 'Личные'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-48 p-1 bg-white">
                       {noteCategories.map(cat => (
                         <button
                           key={cat.id}
                           onClick={() => setNewNoteCategory(cat.id)}
                           className={cn("w-full text-left px-3 py-1.5 text-[10px] rounded-md hover:bg-black/5 flex items-center gap-2", newNoteCategory === cat.id ? 'font-bold' : '')}
                         >
                           <div className="w-2 h-2 rounded-full" style={{backgroundColor: cat.color}} />
                           {cat.name}
                         </button>
                       ))}
                    </PopoverContent>
                </Popover>
                <Button onClick={handleNoteSubmit} className="flex-1 bg-[#E8A87C] hover:bg-[#d49a6d] text-white h-7 text-xs">
                  {editingNoteId ? 'Сохранить' : 'Создать'}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* --- CATEGORY MODAL --- */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className={cn("max-w-sm", getSurface())}>
          <DialogHeader>
            <DialogTitle className="text-sm">{editingCategoryId ? 'Редактировать папку' : 'Новая папка'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
               <label className={cn("text-[10px] font-bold uppercase", getMutedText())}>Название</label>
               <Input value={catName} onChange={(e) => setCatName(e.target.value)} className="mt-1 text-sm h-8" />
            </div>
            {viewType === 'notes' && (
               <div>
                 <label className={cn("text-[10px] font-bold uppercase", getMutedText())}>Цвет</label>
                 <div className="flex gap-2 mt-2">
                    {['#E8A87C', '#c084fc', '#94a3b8', '#22c55e', '#facc15'].map(c => (
                       <button
                        key={c}
                        onClick={() => setCatColor(c)}
                        className={cn("w-6 h-6 rounded-lg border border-black/10 transition-transform hover:scale-105", catColor === c ? 'ring-2 ring-offset-2 ring-black' : '')}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                 </div>
               </div>
            )}
            <div className="pt-4 flex gap-2">
               <Button onClick={handleSaveCategory} className="flex-1 bg-[#E8A87C] hover:bg-[#d49a6d] text-white h-8 text-xs">
                 {editingCategoryId ? 'Сохранить' : 'Создать'}
               </Button>
               {editingCategoryId && (
                 <Button variant="destructive" onClick={handleDeleteCategory} className="px-3 h-8 text-xs">
                   🗑️
                 </Button>
               )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- TASK EDITOR MODAL --- */}
      <TaskEditor 
        taskId={editorTaskId} 
        open={!!editorTaskId} 
        onClose={() => setEditorTaskId(null)} 
      />
      
    </div>
  );
}
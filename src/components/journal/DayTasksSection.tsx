"use client";

import React, { useState, useMemo } from "react";
import { Check, Plus, ChevronDown, ChevronUp, Folder, UserCircle, Briefcase, MoreHorizontal, X, Pencil, Trash2, FileStack, Calendar, Repeat } from "lucide-react";
import { useJournal } from "@/lib/journal-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { TaskEditor } from "./TaskEditor"; // FIXED: Named import

export default function DayTasksSection() {
  const { 
    currentDate, 
    data, 
    addTask, 
    toggleTask, 
    updateTask,
    deleteTask, 
    setEntrySectionStates,
    entrySectionStates,
    theme,
    taskCategories, 
    addTaskCategory,
    updateTaskCategory,
    deleteTaskCategory
  } = useJournal();

  const [mainTaskText, setMainTaskText] = useState("");
  const [subtaskInput, setSubtaskInput] = useState<Record<string, string>>({});
  const [showSubtaskInput, setShowSubtaskInput] = useState<Record<string, boolean>>({});
  const [currentCategory, setCurrentCategory] = useState("Личные");
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isManagingCategory, setIsManagingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editCategoryName, setEditCategoryName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  
  // Replaced inline edit state with modal state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const entryKey = currentDate.toISOString().split('T')[0];
  const entry = data[entryKey] || { tasks: [], logs: [], reflections: [], moodLogs: [] };

  const groupedTasks = useMemo(() => {
    const groups: Record<string, any[]> = {};
    (entry.tasks || []).forEach(task => {
      const groupName = task.group || 'Без категории';
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(task);
    });
    return groups;
  }, [entry.tasks]);

  const handleAddMainTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainTaskText.trim()) return;
    addTask(mainTaskText, undefined, { group: currentCategory });
    setMainTaskText("");
  };

  const handleAddSubtask = (e: React.FormEvent, parentId: string, group: string) => {
    e.preventDefault();
    const text = subtaskInput[parentId];
    if (text && text.trim()) {
      addTask(text, parentId, { group });
      setSubtaskInput(prev => ({ ...prev, [parentId]: "" }));
      setShowSubtaskInput(prev => ({ ...prev, [parentId]: false }));
    }
  };

  const handleCreateCategory = () => {
    if (newCategoryName.trim() && !taskCategories.includes(newCategoryName)) {
      addTaskCategory(newCategoryName.trim());
      setCurrentCategory(newCategoryName.trim());
      setNewCategoryName("");
      setIsCreatingCategory(false);
    }
  };

  const handleUpdateCategory = () => {
    if (editCategoryName.trim() && editCategoryName !== currentCategory) {
      updateTaskCategory(currentCategory, editCategoryName.trim());
      setCurrentCategory(editCategoryName.trim());
      setIsManagingCategory(false);
      setEditCategoryName("");
      setIsCategoryMenuOpen(false);
    }
  };
  
  const handleDeleteCategory = () => {
    if (confirm(`Удалить категорию "${currentCategory}"? Все задачи будут перенесены в "Личные".`)) {
      deleteTaskCategory(currentCategory);
      setCurrentCategory("Личные");
      setIsManagingCategory(false);
      setEditCategoryName("");
      setIsCategoryMenuOpen(false);
    }
  };

  // --- Styles ---
  const isDark = theme === 'dark';
  const isPurple = theme === 'purple';
  const isNature = theme === 'nature';

  const getBaseCardClass = () => {
    return cn(
      "rounded-xl p-3 border shadow-sm transition-colors",
      isDark ? "bg-slate-800/60 border-slate-700/50 text-slate-200" :
      isPurple ? "bg-purple-50/80 border-purple-200/50 text-purple-900" :
      isNature ? "bg-[#E5E2D6]/80 border-[#D3CCC0]/50 text-[#2C362F]" :
      "bg-white border-black/5 text-[#4A403A]"
    );
  };

  const getHeaderClass = () => {
    return cn(
      "w-full flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-3 hover:opacity-70 transition-colors",
      isDark ? "text-slate-500" :
      isPurple ? "text-purple-400" :
      isNature ? "text-[#5F6A63]" :
      "text-gray-400"
    );
  };

  const getEmptyClass = () => {
    return cn(
      "text-center text-xs italic py-2",
      isDark ? "text-slate-600" :
      isPurple ? "text-purple-400" :
      isNature ? "text-[#5F6A63]" :
      "text-slate-300"
    );
  };

  const getPrimaryBtnClass = () => {
    return cn(
      "h-8 px-2 text-white",
      isPurple ? "bg-[#c084fc] hover:bg-[#b074e8]" :
      isDark ? "bg-[#94a3b8] hover:bg-[#a5b4c9]" :
      isNature ? "bg-[#3E4E3C] hover:bg-[#344133]" :
      "bg-[#E8A87C] hover:bg-[#d49a6d]"
    );
  };

  const getCategoryIcon = (name: string) => {
    if (name === 'Личные') return <UserCircle size={14} className="mr-1" />;
    if (name === 'Работа') return <Briefcase size={14} className="mr-1" />;
    return <Folder size={14} className="mr-1" />;
  };

  const getInputClass = () => {
     if (isDark) return 'bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-600';
     if (isPurple) return 'bg-purple-100/30 border-purple-300/50 text-purple-900 placeholder:text-purple-400';
     if (isNature) return 'bg-[#E9E6DB] border-[#D3CCC0] text-[#2C362F] placeholder:text-[#5F6A63]';
     return 'bg-[#FAF9F6] border-black/5 text-[#4A403A] placeholder:text-gray-300';
  }

  return (
    <div className={getBaseCardClass()}>
      
      {/* Header */}
      <button 
        onClick={() => setEntrySectionStates(prev => ({ ...prev, tasks: !prev.tasks }))}
        className={getHeaderClass()}
      >
        <span>Задачи дня</span>
        {entrySectionStates.tasks ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* Content */}
      {entrySectionStates.tasks && (
        <div className="space-y-5 mb-3">
          {Object.keys(groupedTasks).length === 0 && (
            <p className={getEmptyClass()}>Нет задач</p>
          )}
          
          {Object.entries(groupedTasks).map(([groupName, tasks]) => {
            const mainTasks = tasks.filter((t: any) => !t.parentId);
            if (mainTasks.length === 0) return null;

            return (
              <div key={groupName} className="space-y-2">
                {/* Category Label */}
                <div className={cn("flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider",
                   isDark ? "text-slate-500" :
                   isPurple ? "text-purple-400" :
                   isNature ? "text-[#5F6A63]" :
                   "text-gray-400"
                )}>
                  {getCategoryIcon(groupName)}
                  {groupName}
                </div>
                
                {/* Task List - Stream Style */}
                <div className="space-y-1">
                  {mainTasks.map((task: any) => {
                    const subtasks = tasks.filter((t: any) => t.parentId === task.id);
                    const isCompleted = task.completed;
                    
                    // Check for metadata indicators
                    const hasDate = !!task.dueDate;
                    const hasReminder = !!task.reminderTime;
                    const hasRepeat = task.repeat && task.repeat !== 'none';

                    return (
                      <div key={task.id} className="group relative">
                        
                        {/* Main Task Row */}
                        <div className="flex items-start gap-3 py-1 pr-8"> {/* pr-8 for hover actions */}
                          {/* Checkbox */}
                          <button 
                            onClick={() => toggleTask(task.id)}
                            className={cn(
                              "mt-0.5 flex-shrink-0 flex items-center justify-center rounded-sm border transition-colors w-4 h-4",
                              isCompleted 
                                ? (isPurple ? 'bg-[#c084fc] border-[#c084fc]' : isDark ? 'bg-[#94a3b8] border-[#94a3b8]' : isNature ? 'bg-[#3E4E3C] border-[#3E4E3C]' : 'bg-[#E8A87C] border-[#E8A87C]')
                                : (isDark ? "border-slate-600" : isPurple ? "border-purple-300" : isNature ? "border-[#D3CCC0]" : "border-gray-300")
                            )}
                          >
                            {isCompleted && <Check size={10} className="text-white pointer-events-none" />}
                          </button>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div 
                              className={cn(
                                "text-sm leading-snug cursor-pointer hover:opacity-80 select-none",
                                isCompleted 
                                  ? cn("line-through", isDark ? "text-slate-600" : isPurple ? "text-purple-400" : "text-gray-400")
                                  : cn(isDark ? "text-slate-100" : isPurple ? "text-purple-900" : isNature ? "text-[#2C362F]" : "text-[#4A403A]")
                              )}
                              onClick={() => setEditingTaskId(task.id)} // Click text to edit
                            >
                              <span className="font-medium">{task.text}</span>
                              
                              {/* Inline Indicators */}
                              <div className="flex gap-1.5 mt-0.5 opacity-50">
                                {hasDate && <Calendar size={10} className="text-[#E8A87C]" />}
                                {hasReminder && <span className="text-[10px] font-bold">🔔</span>}
                                {hasRepeat && <Repeat size={10} className="text-[#E8A87C]" />}
                              </div>
                            </div>
                          </div>
                        </div>
                    
                        {/* Subtasks */}
                        {subtasks.length > 0 && (
                          <div className="ml-7 space-y-1 mt-1">
                            {subtasks.map((sub: any) => {
                              const isSubCompleted = sub.completed;
                              return (
                                <div key={sub.id} className="flex items-center gap-2 py-0.5 group/sub">
                                  <button 
                                    onClick={() => toggleTask(sub.id)}
                                    className={cn(
                                      "flex-shrink-0 flex items-center justify-center rounded-sm border transition-colors w-3.5 h-3.5",
                                      isSubCompleted 
                                        ? (isPurple ? "bg-[#c084fc] border-[#c084fc]" : isDark ? "bg-[#94a3b8] border-[#94a3b8]" : isNature ? "bg-[#3E4E3C] border-[#3E4E3C]" : "bg-[#E8A87C] border-[#E8A87C]")
                                        : (isDark ? "border-slate-600" : isPurple ? "border-purple-300" : isNature ? "border-[#D3CCC0]" : "border-gray-300")
                                    )}
                                  >
                                    {isSubCompleted && <Check size={8} className="text-white pointer-events-none" />}
                                  </button>
                                  <span 
                                    className={cn("flex-1 text-xs leading-tight cursor-pointer hover:opacity-80 select-none", isSubCompleted ? "line-through text-gray-400" : "text-[#4A403A]")}
                                  >
                                    {sub.text}
                                  </span>
                                  
                                  {/* Subtask Delete (always visible or hover? keeping it subtle hover) */}
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); deleteTask(sub.id); }}
                                    className="opacity-0 group-hover/sub:opacity-100 p-0.5 text-gray-400 hover:text-red-500"
                                  >
                                    <X size={10} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Add Subtask Controls */}
                        <div className="ml-7 mt-1">
                          {showSubtaskInput[task.id] ? (
                            <form 
                              onSubmit={(e) => handleAddSubtask(e, task.id, task.group || 'Личные')}
                              className="flex gap-2"
                            >
                              <Input 
                                value={subtaskInput[task.id] || ""}
                                onChange={(e) => setSubtaskInput(prev => ({ ...prev, [task.id]: e.target.value }))}
                                placeholder="Название подзадачи..."
                                className={cn("flex-1 h-7 px-2 py-0 text-sm focus-visible:ring-0", getInputClass())}
                                autoFocus
                              />
                              <Button type="submit" className={cn(getPrimaryBtnClass(), "w-7 h-7 p-0")}><Plus size={14}/></Button>
                              <Button type="button" variant="ghost" className="w-7 h-7 p-0" onClick={() => setShowSubtaskInput(prev => ({ ...prev, [task.id]: false }))}><X size={14}/></Button>
                            </form>
                          ) : (
                            <button 
                              onClick={() => setShowSubtaskInput(prev => ({ ...prev, [task.id]: true }))}
                              className="text-[10px] font-bold uppercase tracking-wider hover:opacity-70 flex items-center gap-1 text-slate-400"
                            >
                              <Plus size={10} /> Добавить подзадачу
                            </button>
                          )}
                        </div>

                        {/* Actions - Absolute Top Right, Hover Visible */}
                        <div className={cn(
                          "absolute top-0 right-0 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none"
                        )}>
                           <button 
                             onClick={(e) => { e.stopPropagation(); setEditingTaskId(task.id); }}
                             className="pointer-events-auto p-1 text-gray-400 hover:text-black dark:hover:text-white rounded hover:bg-black/5 dark:hover:bg-white/10"
                           >
                             <Pencil size={12} />
                           </button>
                           <button 
                             onClick={(e) => { e.stopPropagation(); if(confirm('Удалить задачу?')) deleteTask(task.id); }}
                             className="pointer-events-auto p-1 text-gray-400 hover:text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                           >
                             <Trash2 size={12} />
                           </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Task Form */}
      <div className="pt-2 border-t border-dashed border-black/5">
         <form onSubmit={handleAddMainTask} className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Input 
                value={mainTaskText}
                onChange={(e) => setMainTaskText(e.target.value)}
                placeholder="Новая задача..."
                className={cn("w-full h-9 pl-3 pr-10 text-sm focus-visible:ring-0", getInputClass())}
              />
              
              {/* Category Button inside Input */}
              <div className="absolute right-2 top-0 h-full flex items-center">
                 <Popover open={isCategoryMenuOpen} onOpenChange={setIsCategoryMenuOpen}>
                    <PopoverTrigger asChild>
                      <button type="button" className={cn("p-1.5 rounded-lg transition-colors", isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : isPurple ? 'text-purple-400 hover:text-purple-900 hover:bg-white' : isNature ? 'text-[#5F6A63] hover:text-[#2C362F] hover:bg-[#E9E6DB]' : 'text-slate-400 hover:text-slate-600' )}>
                        <Folder size={14} />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-1 shadow-xl rounded-xl border-none align-start">
                       <div className="p-1 space-y-1">
                          {isManagingCategory ? (
                             <div className="flex gap-2">
                               <Input 
                                 value={editCategoryName}
                                 onChange={(e) => setEditCategoryName(e.target.value)}
                                 placeholder="Новое название..."
                                 className={cn("h-8 text-sm bg-transparent border-none focus-visible:ring-0 px-0", isDark ? 'text-slate-100' : isPurple ? 'text-purple-900' : isNature ? 'text-[#2C362F]' : 'text-[#4A403A]')}
                                 autoFocus
                               />
                               <Button onClick={handleUpdateCategory} size="sm" className={getPrimaryBtnClass() + "h-8 px-3"}>OK</Button>
                               <Button onClick={() => { setIsManagingCategory(false); setEditCategoryName(""); setIsCategoryMenuOpen(false); }} size="sm" variant="ghost" className="w-8 h-8 px-2"><X size={16}/></Button>
                             </div>
                          ) : isCreatingCategory ? (
                            <div className="flex gap-2">
                              <Input 
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="Название категории..."
                                className={cn("h-8 text-sm bg-transparent border-none focus-visible:ring-0 px-0", isDark ? 'text-slate-100' : isPurple ? 'text-purple-900' : isNature ? 'text-[#2C362F]' : 'text-[#4A403A]')}
                                autoFocus
                              />
                              <Button onClick={handleCreateCategory} size="sm" className={getPrimaryBtnClass() + "h-8 px-3"}>OK</Button>
                              <Button onClick={() => { setIsCreatingCategory(false); setNewCategoryName(""); setIsCategoryMenuOpen(false); }} size="sm" variant="ghost" className="w-8 h-8 px-2"><X size={16}/></Button>
                            </div>
                          ) : (
                             <div className="space-y-1">
                                {taskCategories.map(cat => {
                                   const isSelected = currentCategory === cat;
                                   return (
                                     <button
                                       key={cat}
                                       onClick={() => { setCurrentCategory(cat); setIsCategoryMenuOpen(false); }}
                                       className={cn(
                                         "w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between",
                                         isSelected 
                                           ? getPrimaryBtnClass() + ' text-white shadow-sm' 
                                           : (isDark ? 'bg-slate-800/50 text-slate-300 hover:bg-slate-800' : isPurple ? 'bg-white border-purple-200 text-purple-700 hover:bg-purple-50' : isNature ? 'bg-[#E9E6DB] border-[#D3CCC0] text-[#2C362F] hover:bg-[#E9E6DB]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')
                                       )}
                                     >
                                       <span className="flex items-center gap-2">
                                          <FileStack size={12} />
                                          {cat}
                                       </span>
                                       {isSelected && <MoreHorizontal size={12} onClick={(e) => { e.stopPropagation(); setIsManagingCategory(true); setEditCategoryName(cat); }}/>}
                                     </button>
                                   );
                                })}
                             </div>
                          )}
                          {(!isManagingCategory && !isCreatingCategory) && (
                            <button
                              type="button"
                              onClick={() => setIsCreatingCategory(true)}
                              className="w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 text-slate-400 hover:bg-slate-50"
                            >
                              <Plus size={12} /> Создать категорию
                            </button>
                          )}
                       </div>
                    </PopoverContent>
                 </Popover>
              </div>
            </div>
            <button type="submit" className={cn("flex-shrink-0 p-2 rounded-lg transition-colors", getPrimaryBtnClass())}>
              <Plus size={16} />
            </button>
         </form>
      </div>

      {/* TASK EDITOR MODAL (Handles Reminders, Repeats, Dates) */}
      <TaskEditor 
        taskId={editingTaskId} 
        open={!!editingTaskId} 
        onClose={() => setEditingTaskId(null)} 
      />
    </div>
  );
}
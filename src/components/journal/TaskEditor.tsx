"use client";

import { useJournal } from "@/lib/journal-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, Trash2, Save, ChevronDown, Plus, Check, Folder, X } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useState, useEffect } from "react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { scheduleTaskReminder, cancelNotification } from "@/lib/notifications";
import AnalogClockPicker from "@/components/journal/AnalogClockPicker"; 

export function TaskEditor({ taskId, open, onClose }: { taskId: string | null; open: boolean; onClose: () => void }) {
  // Moved addTask and deleteTask here to prevent "Invalid hook call" error
  const { data, updateTask, deleteTask, addTask, setCurrentDate, setViewMode, setTabMode, theme, taskCategories } = useJournal();
  
  // Find task and its associated date globally
  const taskDateKey = taskId ? Object.keys(data).find(key => data[key].tasks.find(t => t.id === taskId)) : null;
  const taskEntry = taskDateKey ? data[taskDateKey] : null;
  const task = taskEntry?.tasks.find(t => t.id === taskId);

  // State for editable fields
  const [text, setText] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [repeat, setRepeat] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [group, setGroup] = useState<string>('Личные');

  // Subtask State for Edit Modal
  const [subtaskInput, setSubtaskInput] = useState("");

  // --- Calendar Popover State for Auto-Close ---
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Sync state when task changes or modal opens
  useEffect(() => {
    if (task) {
      setText(task.text);
      setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
      setReminderTime(task.reminderTime || '09:00');
      setRepeat(task.repeat || 'none');
      setGroup(task.group || 'Личные');
    }
  }, [task, open]);

  // Get all subtasks for this task
  const subtasks = task ? (data[taskDateKey]?.tasks || []).filter(t => t.parentId === task.id) : [];

  if (!task) return null;

  const handleSave = () => {
    if (!taskId) return;
    
    // Logic to handle Notification Scheduling
    const hasReminder = !!reminderTime && !!dueDate;
    const prevReminder = task.reminderTime && task.dueDate;
    
    // Cancel old notification if it existed
    if (prevReminder) {
      cancelNotification(taskId);
    }

    // Schedule new one if active
    if (hasReminder) {
      const targetDate = new Date(dueDate!);
      const [h, m] = reminderTime.split(':').map(Number);
      targetDate.setHours(h, m, 0, 0);
      
      // Only schedule if in future
      if (targetDate > new Date()) {
        scheduleTaskReminder(taskId, text, targetDate);
      }
    }

    updateTask(taskId, {
      text,
      dueDate: dueDate ? format(dueDate, 'yyyy-MM-dd') : null,
      reminderTime: reminderTime || null,
      repeat: repeat,
      group: group
    });
    onClose();
  };

  const handleDelete = () => {
    if (!taskId) return;
    // Cancel notification when deleting
    cancelNotification(taskId);
    deleteTask(taskId);
    onClose();
  };

  const handleGoToDay = () => {
    if (taskDateKey) {
      setCurrentDate(new Date(taskDateKey));
      setViewMode('day');
      setTabMode('journal');
      onClose(); // Close editor to show day view
    }
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskId || !subtaskInput.trim()) return;
    // addTask is now destructured from top-level useJournal
    // We need the dateKey to add subtask to correct day
    if (taskDateKey) {
      addTask(subtaskInput, taskId, { group: group }); // parentId = taskId
      setSubtaskInput("");
    }
  };

  const handleDeleteSubtask = (subId: string) => {
    if (!taskId) return;
    // deleteTask is now destructured from top-level useJournal
    // deleteTask works globally, so we can just delete subId
    deleteTask(subId);
  };

  // --- THEME HELPERS ---
  const getPrimaryBg = () => {
    if (theme === 'purple') return 'bg-[#c084fc] hover:bg-[#b074e8]';
    if (theme === 'dark') return 'bg-[#94a3b8] hover:bg-[#a5b4c9]';
    if (theme === 'nature') return 'bg-[#3E4E3C] hover:bg-[#344133]';
    return 'bg-[#E8A87C] hover:bg-[#d49a6d]';
  };
  
  const getPrimaryText = () => {
    if (theme === 'purple') return 'text-[#c084fc]';
    if (theme === 'dark') return 'text-[#94a3b8]';
    if (theme === 'nature') return 'text-[#8B6C5E]';
    return 'text-[#E8A87C]';
  };

  const getDialogBg = () => {
    if (theme === 'dark') return 'bg-slate-900 border-slate-800 text-slate-100';
    if (theme === 'purple') return 'bg-white border-purple-200 text-purple-900';
    if (theme === 'nature') return 'bg-[#E9E6DB] border-[#D3CCC0] text-[#2C362F]';
    return 'bg-white border-black/5 text-[#4A403A]';
  };
  
  const getMutedText = () => {
    if (theme === 'dark') return 'text-slate-500';
    if (theme === 'purple') return 'text-purple-400';
    if (theme === 'nature') return 'text-[#5F6A63]';
    return 'text-gray-400';
  };

  const getInputBorder = () => {
    if (theme === 'dark') return 'bg-slate-950/50 border-slate-700 text-slate-100 focus-visible:ring-slate-800';
    if (theme === 'purple') return 'bg-purple-50/50 border-purple-200 text-purple-900 focus-visible:ring-purple-200';
    if (theme === 'nature') return 'bg-[#F2F0E9] border-[#D3CCC0] text-[#2C362F] focus-visible:ring-[#D3CCC0]';
    return 'bg-[#FAF9F6] border-black/5 text-[#4A403A] focus-visible:ring-[#E8A87C]';
  };

  const getCategoryIcon = (name: string) => {
    return <Folder size={10} className="mr-1" />;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={cn("gap-6 pb-6 shadow-2xl max-w-[95vw] w-full md:max-w-md", getDialogBg())}>
        <DialogHeader className="space-y-0">
          <div className="flex items-start gap-3 pr-6">
             <div className={cn("p-2 rounded-lg flex-shrink-0", theme === 'dark' ? 'bg-slate-800 text-slate-300' : theme === 'purple' ? 'bg-purple-100 text-purple-500' : 'bg-[#E8A87C]/10 text-[#E8A87C]')}>
                <Save size={20} />
             </div>
             <div className="flex-1 min-w-0">
                <DialogTitle className={cn("text-base font-bold leading-none uppercase tracking-wider truncate", getMutedText())}>
                  Редактирование задачи
                </DialogTitle>
             </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-5 px-1">
          {/* Текст задачи */}
          <div className="space-y-2">
            <Label className={cn("text-[11px] font-bold uppercase tracking-wider", getPrimaryText())}>Название задачи</Label>
            <Input 
              value={text}
              onChange={(e) => setText(e.target.value)}
              className={cn("w-full h-10 px-4 text-sm truncate", getInputBorder())}
              placeholder="Что нужно сделать?"
            />
          </div>

          {/* Категория */}
          <div className="space-y-2">
            <Label className={cn("text-[11px] font-bold uppercase tracking-wider", getMutedText())}>Категория</Label>
            <div className={cn("flex rounded-lg p-1 border w-full", theme === 'dark' ? 'bg-slate-950/50 border-slate-700' : theme === 'purple' ? 'bg-purple-50 border-purple-100' : 'bg-[#FAF9F6] border-black/5')}>
               <Popover>
                 <PopoverTrigger asChild>
                    <Button variant="ghost" className={cn("w-full justify-between text-left font-normal h-9 px-3 hover:bg-transparent", !group && "text-muted-foreground")}>
                      <span className="flex items-center gap-2">
                         {getCategoryIcon(group)}
                         {group || 'Без категории'}
                      </span>
                      <ChevronDown size={14} className="opacity-50"/>
                    </Button>
                 </PopoverTrigger>
                 <PopoverContent className={cn("w-[200px] p-0 shadow-xl rounded-xl border-none max-h-60 overflow-y-auto", getDialogBg())} align="start">
                    <div className="p-1">
                       {taskCategories.map(cat => (
                         <button
                           key={cat}
                           onClick={() => setGroup(cat)}
                           className={cn(
                             "w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2",
                             group === cat 
                               ? getPrimaryBg() + ' text-white' 
                               : theme === 'dark' ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50'
                           )}
                         >
                           {getCategoryIcon(cat)}
                           {cat}
                           {group === cat && <Check size={14} className="ml-auto"/>}
                         </button>
                       ))}
                    </div>
                 </PopoverContent>
               </Popover>
            </div>
          </div>

          {/* Дата - UPDATED FOR AUTO-CLOSE */}
          <div className="space-y-2">
            <Label className={cn("text-[11px] font-bold uppercase tracking-wider", getMutedText())}>Дата выполнения</Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-10 px-4 truncate",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4 flex-shrink-0" style={{ color: getPrimaryText().replace('text-', '') }} />
                  <span className="truncate">{dueDate ? format(dueDate, 'PPP', { locale: ru }) : 'Выберите дату'}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className={cn("w-auto p-0 shadow-xl rounded-xl border-none", getDialogBg())} align="start">
                <CalendarComponent
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) => {
                    setDueDate(date);
                    setIsCalendarOpen(false); // AUTO CLOSE HERE
                  }}
                  initialFocus
                  className="rounded-xl border-none p-3"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Время - UPDATED ANALOG CLOCK */}
          <div className="space-y-2">
            <Label className={cn("text-[11px] font-bold uppercase tracking-wider", getMutedText())}>Время напоминания</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-10 px-4 truncate",
                    !reminderTime && "text-muted-foreground"
                  )}
                >
                  <Clock className="mr-2 h-4 w-4 flex-shrink-0" style={{ color: getPrimaryText().replace('text-', '') }} />
                  <span className="truncate">{reminderTime || 'Время напоминания'}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className={cn("w-auto p-0 shadow-2xl rounded-xl border-none bg-transparent", getDialogBg())} align="center">
                <div className={cn("p-6 rounded-2xl border", getDialogBg())}>
                   <AnalogClockPicker value={reminderTime} onChange={setReminderTime} theme={theme} />
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Повтор */}
          <div className="space-y-2">
            <Label className={cn("text-[11px] font-bold uppercase tracking-wider", getMutedText())}>Повтор</Label>
            <div className={cn("flex rounded-lg p-1 border w-full", theme === 'dark' ? 'bg-slate-950/50 border-slate-700' : theme === 'purple' ? 'bg-purple-50 border-purple-100' : 'bg-[#FAF9F6] border-black/5')}>
              {(['none', 'daily', 'weekly', 'monthly'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setRepeat(r)}
                  className={cn("flex-1 py-2 text-[10px] font-bold rounded-md transition-all", repeat === r ? getPrimaryBg() + ' text-white' : theme === 'dark' ? 'text-slate-500 hover:text-slate-300' : theme === 'purple' ? 'text-purple-500 hover:text-purple-700' : 'text-gray-400 hover:text-gray-600')}
                >
                  {r === 'none' ? 'Нет' : r === 'daily' ? 'День' : r === 'weekly' ? 'Неделя' : 'Месяц'}
                </button>
              ))}
            </div>
          </div>

          {/* Подзадачи (SUBTASKS SECTION) */}
          <div className="space-y-2">
            <Label className={cn("text-[11px] font-bold uppercase tracking-wider", getMutedText())}>Подзадачи</Label>
            <div className={cn("border rounded-lg p-2 max-h-40 overflow-y-auto space-y-2", theme === 'dark' ? 'border-slate-700' : 'border-black/5')}>
              {subtasks.map(sub => (
                <div key={sub.id} className={cn("flex items-center justify-between p-1 rounded text-xs group", theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-gray-50')}>
                   <span className={cn(sub.completed ? "line-through opacity-50" : "", "truncate flex-1 mr-2")}>{sub.text}</span>
                   <button onClick={() => handleDeleteSubtask(sub.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500">
                      <X size={12} />
                   </button>
                </div>
              ))}
              {subtasks.length === 0 && <p className={cn("text-xs italic text-center py-2", getMutedText())}>Нет подзадач</p>}
            </div>
            <form onSubmit={handleAddSubtask} className="flex gap-2 mt-1">
               <Input 
                  value={subtaskInput}
                  onChange={(e) => setSubtaskInput(e.target.value)}
                  placeholder="Новая подзадача..."
                  className={cn("flex-1 h-8 text-xs", getInputBorder())}
               />
               <Button type="submit" className={cn("p-0 h-8 w-8", getPrimaryBg())}>
                  <Plus size={14} />
               </Button>
            </form>
          </div>
        </div>

        <div className="flex flex-row gap-2 pt-2 px-1">
          <Button 
            variant="ghost" 
            onClick={handleGoToDay}
            className={cn("flex-1 h-10 flex items-center justify-center", getPrimaryText() + " hover:bg-[#FAF9F6] dark:hover:bg-slate-800")}
          >
            <ChevronDown size={20} />
          </Button>
          <Button variant="ghost" onClick={handleDelete} className="flex-1 h-10 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
            <Trash2 size={20} />
          </Button>
          <Button onClick={handleSave} className={cn(getPrimaryBg(), "text-white flex-1 h-10 flex items-center justify-center")}>
            <Save size={20} />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
"use client";

import { useJournal, QUICK_ACTIONS_CONFIG, MoodType } from "@/lib/journal-context";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, parseISO, min, max, isToday, addWeeks, subWeeks } from "date-fns";
import { ru } from "date-fns/locale";
import { Smile, CheckCircle2, Activity, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const MOODS = [
  { type: 'euphoria' as const, emoji: '🤩', label: 'Эйфория' },
  { type: 'calm' as const, emoji: '😌', label: 'Спокойствие' },
  { type: 'pensive' as const, emoji: '🤔', label: 'Задумчивость' },
  { type: 'sadness' as const, emoji: '😢', label: 'Грусть' },
  { type: 'rage' as const, emoji: '😡', label: 'Ярость' },
];

const MOOD_VALUES: Record<string, number> = {
  euphoria: 5,
  calm: 4,
  pensive: 3,
  sadness: 2,
  rage: 1
};

export default function CalendarView() {
  const { currentDate, setCurrentDate, setViewMode, data, addLog, calendarViewMode, isQuickActionEnabled, addMood, calendarSummaryVisible, quickActionsVisible, dayResultsVisible, periodStatsVisible, theme } = useJournal();
  
  const [glowActionId, setGlowActionId] = useState<string | null>(null);
  const [glowMoodType, setGlowMoodType] = useState<string | null>(null);

  // Limit quick actions to 6 for display in Calendar
  const quickActionsList = useMemo(() => {
    const list = Object.values(QUICK_ACTIONS_CONFIG).filter(action => isQuickActionEnabled(action.id));
    return list.slice(0, 6); 
  }, [isQuickActionEnabled]);

  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const todayEntry = data[todayKey] || { tasks: [], logs: [], reflections: [], moodLogs: [] };
  
  const calculateAvgMood = () => {
    if (!todayEntry?.moodLogs?.length) return null;
    const sum = todayEntry.moodLogs.reduce((acc, m) => acc + MOOD_VALUES[m.type], 0);
    const avg = sum / todayEntry.moodLogs.length;
    const rounded = Math.round(avg);
    const moodType = Object.keys(MOOD_VALUES).find(key => MOOD_VALUES[key as MoodType] === rounded) as MoodType | undefined;
    return moodType ? MOODS.find(m => m.type === moodType) : null;
  };

  const avgMood = calculateAvgMood();
  const todayTasks = todayEntry.tasks || [];
  const completedToday = todayTasks.filter(t => t.completed).length;
  const totalToday = todayTasks.length;

  const getEntrySummary = (date: Date) => {
    const key = format(date, 'yyyy-MM-dd');
    const entry = data[key];
    if (!entry) return { hasAny: false, hasTask: false, taskCount: 0 };
    const tasks = entry.tasks || [];
    const logs = entry.logs || [];
    const reflections = entry.reflections || [];
    const moodLogs = entry.moodLogs || [];
    const hasTask = tasks.filter(t => !t.completed).length > 0;
    const hasAnyEntry = logs.length > 0 || reflections.length > 0 || moodLogs.length > 0 || hasTask;
    return { hasAny: hasAnyEntry, hasTask: hasTask, taskCount: tasks.filter(t => !t.completed).length };
  };

  const handleQuickAction = (action: typeof QUICK_ACTIONS_CONFIG[keyof typeof QUICK_ACTIONS_CONFIG]) => {
    addLog(`${action.emoji} ${action.label}`);
    setGlowActionId(action.id);
    setTimeout(() => setGlowActionId(null), 100);
  };

  const handleMoodClick = (type: MoodType) => {
    addMood(type);
    setGlowMoodType(type);
    setTimeout(() => setGlowMoodType(null), 100);
  };

  const periodStats = useMemo(() => {
    let startDate: Date, endDate: Date;
    if (calendarViewMode === 'week') {
      startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
      endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
    } else if (calendarViewMode === 'month') {
      startDate = startOfMonth(currentDate);
      endDate = endOfMonth(currentDate);
    } else {
      startDate = startOfYear(currentDate);
      endDate = new Date(currentDate.getFullYear(), 11, 31);
    }
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    let totalTasks = 0;
    days.forEach(day => {
      const key = format(day, 'yyyy-MM-dd');
      const entry = data[key];
      if (entry) totalTasks += (entry.tasks?.length || 0);
    });
    return { totalTasks };
  }, [currentDate, calendarViewMode, data]);

  const getActiveBg = () => {
    if (theme === 'purple') return 'bg-[#c084fc]';
    if (theme === 'dark') return 'bg-[#94a3b8]';
    if (theme === 'nature') return 'bg-[#3E4E3C]';
    return 'bg-[#E8A87C]';
  };
  const getActiveText = () => {
    if (theme === 'purple') return 'text-[#c084fc]';
    if (theme === 'dark') return 'text-[#94a3b8]';
    if (theme === 'nature') return 'text-[#8B6C5E]';
    return 'text-[#E8A87C]';
  };
  const getCardBg = () => {
    if (theme === 'dark') return 'bg-slate-800/40 border-slate-700/50';
    if (theme === 'purple') return 'bg-white border-purple-200';
    if (theme === 'nature') return 'bg-[#E5E2D6]/80 border-[#D3CCC0]/50';
    return 'bg-white border-black/5';
  };
  const getCardText = () => {
    if (theme === 'dark') return 'text-slate-200';
    if (theme === 'purple') return 'text-purple-900';
    if (theme === 'nature') return 'text-[#2C362F]';
    return 'text-[#4A403A]';
  };
  const getIconBg = () => {
    if (theme === 'dark') return 'bg-slate-700/30';
    if (theme === 'purple') return 'bg-purple-50';
    if (theme === 'nature') return 'bg-[#E9E6DB]';
    return 'bg-[#FAF9F6]';
  };

  // === CALENDAR RENDER FUNCTIONS ===
  
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setCurrentDate(subWeeks(currentDate, 1))} className="p-1"><ChevronLeft size={18} /></button>
          <span className="text-sm font-bold">
            {format(weekStart, 'd MMM', { locale: ru })} – {format(weekEnd, 'd MMM yyyy', { locale: ru })}
          </span>
          <button onClick={() => setCurrentDate(addWeeks(currentDate, 1))} className="p-1"><ChevronRight size={18} /></button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {dayNames.map(name => (
            <div key={name} className="text-center text-[10px] font-bold uppercase text-gray-400 py-1">{name}</div>
          ))}
          {days.map(day => {
            const summary = getEntrySummary(day);
            const isCurrentDay = isToday(day);
            return (
              <button
                key={day.toString()}
                onClick={() => { setCurrentDate(day); setViewMode('day'); }}
                className={cn(
                  "aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-colors relative",
                  isCurrentDay && "font-bold",
                  isCurrentDay && getActiveBg() + " text-white",
                  !isCurrentDay && summary.hasAny && getActiveText(),
                  !isCurrentDay && !summary.hasAny && "text-gray-400"
                )}
              >
                <span>{format(day, 'd')}</span>
                {summary.hasTask && <div className={cn("w-1 h-1 rounded-full mt-0.5", isCurrentDay ? "bg-white" : getActiveBg())} />}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const startDay = (startOfWeek(monthStart, { weekStartsOn: 1 }).getDay() + 6) % 7;

    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-1"><ChevronLeft size={18} /></button>
          <span className="text-sm font-bold">{format(currentDate, 'LLLL yyyy', { locale: ru })}</span>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-1"><ChevronRight size={18} /></button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {dayNames.map(name => (
            <div key={name} className="text-center text-[10px] font-bold uppercase text-gray-400 py-1">{name}</div>
          ))}
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map(day => {
            const summary = getEntrySummary(day);
            const isCurrentDay = isToday(day);
            return (
              <button
                key={day.toString()}
                onClick={() => { setCurrentDate(day); setViewMode('day'); }}
                className={cn(
                  "aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-colors relative",
                  isCurrentDay && "font-bold",
                  isCurrentDay && getActiveBg() + " text-white",
                  !isCurrentDay && summary.hasAny && getActiveText(),
                  !isCurrentDay && !summary.hasAny && "text-gray-400"
                )}
              >
                <span>{format(day, 'd')}</span>
                {summary.hasTask && <div className={cn("w-1 h-1 rounded-full mt-0.5", isCurrentDay ? "bg-white" : getActiveBg())} />}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderYearView = () => {
    const months = eachMonthOfInterval({
      start: startOfYear(currentDate),
      end: new Date(currentDate.getFullYear(), 11, 1)
    });

    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear() - 1, 0, 1))} className="p-1"><ChevronLeft size={18} /></button>
          <span className="text-sm font-bold">{format(currentDate, 'yyyy')}</span>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear() + 1, 0, 1))} className="p-1"><ChevronRight size={18} /></button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {months.map(month => {
            const monthKey = format(month, 'yyyy-MM');
            const isCurrentMonth = format(new Date(), 'yyyy-MM') === monthKey;
            return (
              <button
                key={monthKey}
                onClick={() => { setCurrentDate(month); setViewMode('month'); }}
                className={cn(
                  "p-3 rounded-xl text-center text-xs font-bold transition-colors",
                  isCurrentMonth && getActiveBg() + " text-white",
                  !isCurrentMonth && getCardBg()
                )}
              >
                {format(month, 'LLL', { locale: ru })}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // === RETURN ===

  return (
    <div className="space-y-4 pb-20 px-4 pt-4">
      
      {/* Calendar Content */}
      <div>
        {calendarViewMode === 'week' && renderWeekView()}
        {calendarViewMode === 'month' && renderMonthView()}
        {calendarViewMode === 'year' && renderYearView()}
      </div>

      {/* 1. Period Stats Block */}
      {periodStatsVisible && (
        <div>
          <div className={cn(getCardBg(), "rounded-xl p-2.5 shadow-sm flex items-center justify-between border transition-colors")}>
            <div className="flex items-center gap-3">
              <div className={cn("p-1.5 rounded-lg", getActiveText(), getIconBg())}>
                <Activity size={14} />
              </div>
              <div>
                <div className={cn("text-[8px] font-bold uppercase tracking-wider", theme === 'dark' ? 'text-slate-500' : theme === 'purple' ? 'text-purple-500' : theme === 'nature' ? 'text-[#5F6A63]' : 'text-gray-400')}>
                  {calendarViewMode === 'week' ? 'Эта неделя' : calendarViewMode === 'month' ? 'Этот месяц' : 'Этот год'}
                </div>
                <div className={cn("text-xs font-bold mt-0.5", getCardText())}>
                  {periodStats.totalTasks} задач
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Today Stats Block */}
      {dayResultsVisible && (
        <div>
          <div className={cn(getCardBg(), "rounded-xl p-2.5 shadow-sm flex items-center justify-between border transition-colors")}>
            <div className="flex items-center gap-3">
              <div className={cn("p-1.5 rounded-lg", getActiveText(), getIconBg())}>
                <CheckCircle2 size={14} />
              </div>
              <div>
                <div className={cn("text-[8px] font-bold uppercase tracking-wider", theme === 'dark' ? 'text-slate-500' : theme === 'purple' ? 'text-purple-500' : theme === 'nature' ? 'text-[#5F6A63]' : 'text-gray-400')}>Сегодня</div>
                <div className={cn("text-xs font-bold mt-0.5", getCardText())}>
                  {completedToday}/{totalToday} задач
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Mood Block */}
      {calendarSummaryVisible && (
        <div>
          <div className={cn(getCardBg(), "rounded-xl p-2.5 shadow-sm border transition-colors")}>
            <div className="flex items-center gap-3">
              <div className={cn("p-1.5 rounded-lg", getActiveText(), getIconBg())}>
                <Smile size={14} />
              </div>
              <div className="flex justify-between flex-1 px-1">
                {MOODS.map(mood => (
                  <button
                    key={mood.type}
                    onClick={() => handleMoodClick(mood.type)}
                    className="flex flex-col items-center gap-0.5 group opacity-60 hover:opacity-100 hover:scale-110 transition-all relative"
                  >
                    {glowMoodType === mood.type && (
                      <div className={cn("absolute inset-0 rounded-full", 
                        theme === 'purple' ? 'bg-[#c084fc]/40' : theme === 'dark' ? 'bg-[#94a3b8]/40' : theme === 'nature' ? 'bg-[#3E4E3C]/40' : 'bg-[#E8A87C]/40', "animate-in fade-out duration-100")} />
                    )}
                    <span className="text-2xl filter drop-shadow-sm z-10">{mood.emoji}</span>
                  </button>
                ))}
              </div>
              {avgMood && (
                <div className={cn("text-right pl-3 border-l border-black/5 last:border-0")}>
                  <div className={cn("text-[8px] font-bold uppercase tracking-wider", theme === 'dark' ? 'text-slate-500' : theme === 'purple' ? 'text-purple-400' : theme === 'nature' ? 'text-[#5F6A63]' : 'text-gray-400')}>Среднее</div>
                  <div className="flex items-center justify-end gap-0.5 mt-0.5">
                    <span className={cn("text-xs font-bold", getCardText())}>{avgMood.label}</span>
                    <span className="text-base leading-none">{avgMood.emoji}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Quick Actions */}
      {quickActionsVisible && quickActionsList.length > 0 && (
        <div>
          <div className={cn(getCardBg(), "rounded-xl p-2 shadow-sm border transition-colors")}>
            <div className="flex items-center gap-2 mb-1">
              <div className={cn("p-1.5 rounded-lg", getActiveText(), getIconBg())}>
                <Zap size={14} />
              </div>
              <span className={cn("text-[10px] font-bold uppercase tracking-wider", theme === 'dark' ? 'text-slate-500' : theme === 'purple' ? 'text-purple-500' : theme === 'nature' ? 'text-[#5F6A63]' : 'text-gray-400')}>Быстрые действия</span>
            </div>
            <div className="max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
              <div className="grid grid-cols-6 gap-1.5">
                {quickActionsList.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action)}
                    className={`
                      aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 transition-transform duration-75 active:scale-90 relative border p-1
                      ${glowActionId === action.id 
                        ? 'scale-110 border-transparent z-10' 
                        : theme === 'dark'
                        ? 'bg-slate-800/50 border-slate-700/50 text-slate-300'
                        : theme === 'purple'
                        ? 'bg-white border-purple-200 text-purple-700'
                        : theme === 'nature'
                        ? 'bg-[#E9E6DB] border-[#D3CCC0] text-[#5F6A63]'
                        : 'bg-white border-black/5 text-slate-500'
                      }
                    `}
                  >
                    {glowActionId === action.id && (
                      <div className={cn("absolute inset-0 rounded-lg", 
                        theme === 'purple' ? 'bg-[#c084fc]/40' : theme === 'dark' ? 'bg-[#94a3b8]/40' : theme === 'nature' ? 'bg-[#3E4E3C]/40' : 'bg-[#E8A87C]/40', "animate-in fade-out duration-100")} />
                    )}
                    <span className={cn("text-xs pointer-events-none leading-none", glowActionId === action.id ? "scale-125" : "")}>{action.emoji}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
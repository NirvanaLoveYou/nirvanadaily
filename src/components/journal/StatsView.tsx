"use client";

import { useJournal, QUICK_ACTIONS_CONFIG } from "@/lib/journal-context";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, parseISO, min, max } from "date-fns";
import { ru } from "date-fns/locale";
import { Input } from "@/components/ui/input"; // Added missing import
import { 
  BarChart3, FileText, Zap, CheckCircle2, 
  PieChart as RechartsPieIcon, LineChart as RechartsLineIcon, 
  TrendingUp, Smile, Calendar, BookOpen, Filter, ArrowDown, ArrowUp, Search, X, Download
} from "lucide-react";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, 
  Tooltip, PieChart, Pie, Cell, Sector
} from "recharts";

const MOOD_CONFIG = [
  { type: 'euphoria' as const, emoji: '🤩', label: 'Эйфория', color: '#facc15' },
  { type: 'calm' as const, emoji: '😌', label: 'Спокойствие', color: '#22c55e' },
  { type: 'pensive' as const, emoji: '🤔', label: 'Задумчивость', color: '#a855f7' },
  { type: 'sadness' as const, emoji: '😢', label: 'Грусть', color: '#3b82f6' },
  { type: 'rage' as const, emoji: '😡', label: 'Ярость', color: '#ef4444' },
];

const MOOD_VALUES: Record<string, number> = {
  euphoria: 5,
  calm: 4,
  pensive: 3,
  sadness: 2,
  rage: 1
};

export type ChartMetric = 'tasks' | 'mood' | 'logs' | 'events';
export type TimePeriod = 'day' | 'week' | 'month' | 'year';
type AppViewMode = 'charts' | 'reading' | 'search' | 'reports';
type ReportMetric = 'tasks' | 'mood' | 'logs' | 'all';

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
      stroke="none"
    />
  );
};

export default function StatsView() {
  const { data, currentDate, setViewMode, setTabMode, setCalendarViewMode, theme, setCurrentDate } = useJournal();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
  const [chartMetric, setChartMetric] = useState<ChartMetric>('logs');
  const [appViewMode, setAppViewMode] = useState<AppViewMode>('charts');
  
  const [readAllTime, setReadAllTime] = useState(false);
  const [readSortAsc, setReadSortAsc] = useState(true); 
  const [searchQuery, setSearchQuery] = useState("");
  const [viewType, setViewType] = useState<'line' | 'pie'>('line');
  
  // Report states
  const [reportPeriod, setReportPeriod] = useState<TimePeriod>('month');
  const [reportMetrics, setReportMetrics] = useState<Set<ReportMetric>>(new Set(['tasks', 'mood', 'logs']));

  // --- SEARCH LOGIC ---
  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.trim().length === 0) return [];
    
    const query = searchQuery.toLowerCase();
    const results: Array<{
      id: string;
      type: 'log' | 'reflection' | 'task';
      text: string;
      time: string;
      dateKey: string;
      dateObj: Date;
      createdAt: number;
    }> = [];

    Object.keys(data).forEach(key => {
      const entry = data[key];
      if (!entry) return;

      (entry.logs || []).forEach(log => {
        if (log.text.toLowerCase().includes(query)) {
          results.push({ id: log.id, type: 'log', text: log.text, time: log.time, dateKey: key, dateObj: parseISO(key), createdAt: entry.logs[0].createdAt });
        }
      });

      (entry.reflections || []).forEach(ref => {
        if (ref.text.toLowerCase().includes(query)) {
          results.push({ id: ref.id, type: 'reflection', text: ref.text, time: ref.time, dateKey: key, dateObj: parseISO(key), createdAt: entry.reflections[0].createdAt });
        }
      });

      (entry.tasks || []).forEach(task => {
        if (task.text.toLowerCase().includes(query)) {
          results.push({ id: task.id, type: 'task', text: task.text, time: "", dateKey: key, dateObj: parseISO(key), createdAt: task.createdAt });
        }
      });
    });

    return results.sort((a, b) => b.createdAt - a.createdAt);
  }, [data, searchQuery]);

  const handleResultClick = (dateKey: string) => {
    const dateObj = parseISO(dateKey);
    setCurrentDate(dateObj);
    setViewMode('day');
    setTabMode('journal');
  };

  // --- REPORT GENERATION ---
  const generateReport = () => {
    let startDate: Date, endDate: Date;

    if (reportPeriod === 'day') {
      startDate = currentDate;
      endDate = currentDate;
    } else if (reportPeriod === 'week') {
      startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
      endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
    } else if (reportPeriod === 'month') {
      startDate = startOfMonth(currentDate);
      endDate = endOfMonth(currentDate);
    } else {
      startDate = startOfYear(currentDate);
      endDate = new Date(currentDate.getFullYear(), 11, 31);
    }

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    let totalTasks = 0, completedTasks = 0;
    let totalLogs = 0, totalReflections = 0;
    let moodCounts = { euphoria: 0, calm: 0, pensive: 0, sadness: 0, rage: 0 };
    let moodSum = 0, moodCount = 0;
    const entries: any[] = [];

    days.forEach(day => {
      const key = format(day, 'yyyy-MM-dd');
      const entry = data[key];
      if (!entry) return;

      const dayTasks = entry.tasks || [];
      const dayLogs = entry.logs || [];
      const dayReflections = entry.reflections || [];
      const dayMoods = entry.moodLogs || [];

      totalTasks += dayTasks.length;
      completedTasks += dayTasks.filter(t => t.completed).length;
      totalLogs += dayLogs.length;
      totalReflections += dayReflections.length;

      dayMoods.forEach(m => {
        moodCounts[m.type as keyof typeof moodCounts]++;
        moodSum += MOOD_VALUES[m.type] || 3;
        moodCount++;
      });

      if (dayTasks.length || dayLogs.length || dayReflections.length || dayMoods.length) {
        entries.push({
          date: key,
          tasks: dayTasks.length,
          completed: dayTasks.filter(t => t.completed).length,
          logs: dayLogs.length,
          reflections: dayReflections.length,
          moods: dayMoods.length
        });
      }
    });

    const reportData = {
      generatedAt: new Date().toISOString(),
      period: reportPeriod,
      rangeStart: format(startDate, 'yyyy-MM-dd'),
      rangeEnd: format(endDate, 'yyyy-MM-dd'),
      summary: {
        totalTasks,
        completedTasks,
        taskCompletion: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0,
        totalLogs,
        totalReflections,
        totalMoods: moodCount,
        averageMood: moodCount > 0 ? (moodSum / moodCount).toFixed(2) : 0
      },
      moodDistribution: moodCounts,
      dailyData: entries
    };

    return reportData;
  };

  const exportReportAsJSON = () => {
    const report = generateReport();
    const jsonString = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `report-${format(currentDate, 'yyyy-MM-dd')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Отчет экспортирован');
  };

  // --- READING LOGIC ---
  const readingData = useMemo(() => {
    let startDate: Date, endDate: Date;
    let allKeys: string[] = [];

    if (readAllTime) {
      const dates = Object.keys(data).map(k => parseISO(k));
      if (dates.length > 0) {
        startDate = min(dates);
        endDate = max(dates);
        allKeys = Object.keys(data).sort();
      } else {
        return [];
      }
    } else {
      if (timePeriod === 'day') {
        startDate = currentDate;
        endDate = currentDate;
      } else if (timePeriod === 'week') {
        startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
        endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
      } else if (timePeriod === 'month') {
        startDate = startOfMonth(currentDate);
        endDate = endOfMonth(currentDate);
      } else {
        startDate = startOfYear(currentDate);
        endDate = new Date(currentDate.getFullYear(), 11, 31);
      }

      const days = eachDayOfInterval({ start: startDate, end: endDate });
      allKeys = days.map(d => format(d, 'yyyy-MM-dd'));
    }

    const items: Array<{ id: string; dateKey: string; dateObj: Date; time: string; createdAt: number; type: 'log' | 'reflection'; }> = [];

    allKeys.forEach(key => {
      const entry = data[key];
      if (!entry) return;

      (entry.logs || []).forEach(log => {
        items.push({ id: log.id, dateKey: key, dateObj: parseISO(key), time: log.time, createdAt: log.createdAt, type: 'log' });
      });

      (entry.reflections || []).forEach(ref => {
        items.push({ id: ref.id, dateKey: key, dateObj: parseISO(key), time: ref.time, createdAt: ref.createdAt, type: 'reflection' });
      });
    });

    return items.sort((a, b) => a.createdAt - b.createdAt);
  }, [data, timePeriod, currentDate, readAllTime, readSortAsc]);

  // --- CHART LOGIC ---
  const { chartData, periodStats, pieData, moodBreakdown, isEmpty, chartHeaderTitle, chartUnitLabel, fullRangeLabel } = useMemo(() => {
    let startDate: Date, endDate: Date;
    let title = "";
    let unitLabel = "";
    let rangeLabel = "";

    if (timePeriod === 'day') {
      startDate = currentDate;
      endDate = currentDate;
      title = format(currentDate, 'd MMM yyyy', { locale: ru });
      rangeLabel = format(currentDate, 'd MMMM (EEEEEEEE)', { locale: ru });
    } else if (timePeriod === 'week') {
      startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
      endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
      title = `${format(startDate, 'd')} - ${format(endDate, 'd MMM', { locale: ru })}`;
      rangeLabel = `${format(startDate, 'd MMM (EEEEEEEE)', { locale: ru })} – ${format(endDate, 'd MMM (EEEEEE)', { locale: ru })}`;
    } else if (timePeriod === 'month') {
      startDate = startOfMonth(currentDate);
      endDate = endOfMonth(currentDate);
      title = format(currentDate, 'LLLL yyyy', { locale: ru });
      rangeLabel = `${format(startDate, 'd MMM', { locale: ru })} – ${format(endDate, 'd MMM yyyy', { locale: ru })}`;
    } else {
      startDate = startOfYear(currentDate);
      endDate = new Date(currentDate.getFullYear(), 11, 31);
      title = format(currentDate, 'yyyy', { locale: ru });
      rangeLabel = `${format(startDate, 'd MMM yyyy', { locale: ru })} – ${format(endDate, 'd MMM yyyy', { locale: ru })}`;
    }

    if (chartMetric === 'mood') unitLabel = "Балл";
    else if (chartMetric === 'tasks') unitLabel = "Задач";
    else if (chartMetric === 'logs') unitLabel = "Записи";
    else if (chartMetric === 'events') unitLabel = "События";
    else unitLabel = "Действия";

    const cData: any[] = [];
    const actionEmojis = Object.values(QUICK_ACTIONS_CONFIG).map(a => a.emoji);
    const processedKeys = new Set<string>();

    let totalTasks = 0;
    let pTotalLogs = 0;
    let pEventsCount = 0;
    let pMoodSum = 0;
    let pMoodCount = 0;
    let pMoodCounts: Record<string, number> = { rage: 0, sadness: 0, pensive: 0, calm: 0, euphoria: 0 };

    let hasAnyData = false;

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    days.forEach(day => {
      const key = format(day, 'yyyy-MM-dd');
      const entry = data[key];
      let value = 0;

      if (entry) {
         hasAnyData = true;
         const isFirstTimeSeeingDate = !processedKeys.has(key);
         if (isFirstTimeSeeingDate) processedKeys.add(key);

         const logs = entry.logs || [];
         const reflections = entry.reflections || [];
         const moodLogs = entry.moodLogs || [];
         const tasks = entry.tasks || [];

         if (chartMetric === 'tasks') {
           value = tasks.length;
           if (isFirstTimeSeeingDate) totalTasks += tasks.length;
         } else if (chartMetric === 'logs') {
           value = logs.length + reflections.length;
           if (isFirstTimeSeeingDate) pTotalLogs += (logs.length + reflections.length);
         } else if (chartMetric === 'events') {
           const events = logs.filter(log => actionEmojis.some(emoji => log.text.startsWith(emoji)));
           value = events.length;
           if (isFirstTimeSeeingDate) {
             pEventsCount += events.length;
             pTotalLogs += logs.length;
           }
         } else if (chartMetric === 'mood') {
           if (moodLogs.length > 0) {
             const sum = moodLogs.reduce((acc, m) => acc + (MOOD_VALUES[m.type] || 3), 0);
             value = sum / moodLogs.length;
             if (isFirstTimeSeeingDate) {
               pMoodSum += sum; 
               pMoodCount += moodLogs.length;
               moodLogs.forEach(m => { 
                 if (!pMoodCounts[m.type]) pMoodCounts[m.type] = 0;
                 pMoodCounts[m.type]++;
               });
             }
           } else {
             value = 0;
           }
        }
      }

      cData.push({
        date: day,
        value: value || 0,
        label: format(day, 'd MMM', { locale: ru }),
        formattedDate: format(day, 'yyyy-MM-dd')
      });
    });

    // Prepare Pie Data
    const pieData = MOOD_CONFIG.map(m => ({
      name: m.label,
      value: pMoodCounts[m.type] || 0,
      color: m.color,
      emoji: m.emoji
    })).filter(d => d.value > 0);

    return {
      chartData: cData,
      periodStats: {
        totalTasks,
        totalLogs: pTotalLogs,
        totalEvents: pEventsCount,
        avgMood: pMoodCount > 0 ? (pMoodSum / pMoodCount).toFixed(1) : '-'
      },
      pieData,
      moodBreakdown: pMoodCounts,
      isEmpty: !hasAnyData,
      chartHeaderTitle: title,
      chartUnitLabel: unitLabel,
      fullRangeLabel: rangeLabel
    };
  }, [data, timePeriod, currentDate, chartMetric]);

  // --- STYLES HELPERS ---
  const isDark = theme === 'dark';
  const isPurple = theme === 'purple';
  const isNature = theme === 'nature';

  const bgBase = isDark ? "bg-slate-950" : isPurple ? "bg-purple-50" : isNature ? "bg-[#F2F0E9]" : "bg-[#FAF9F6]";
  const textMain = isDark ? "text-slate-100" : isPurple ? "text-purple-900" : isNature ? "text-[#2C362F]" : "text-[#4A403A]";
  const textMuted = isDark ? "text-slate-500" : isPurple ? "text-purple-400" : isNature ? "text-[#5F6A63]" : "text-gray-400";
  const borderBase = isDark ? "border-slate-800" : isPurple ? "border-purple-200" : isNature ? "border-[#D3CCC0]" : "border-black/5";
  
  const primaryColor = isPurple ? "#c084fc" : isDark ? "#94a3b8" : isNature ? "#3E4E3C" : "#E8A87C";

  return (
    <div className={`h-full flex flex-col ${bgBase} ${textMain}`}>
      {/* Controls Header */}
      <div className="sticky top-0 z-10 p-4 backdrop-blur-md border-b border-black/5 bg-opacity-90 flex flex-col gap-4">
        
        {/* View Mode Switcher */}
        <div className="flex p-1 rounded-xl bg-black/5 border border-black/5">
          {[
            { id: 'charts' as const, icon: BarChart3, label: 'Графики' },
            { id: 'reading' as const, icon: BookOpen, label: 'Чтение' },
            { id: 'search' as const, icon: Search, label: 'Поиск' },
            { id: 'reports' as const, icon: FileText, label: 'Отчеты' }
          ].map(tab => {
            const isActive = appViewMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setAppViewMode(tab.id)}
                className={`
                  flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2
                  ${isActive 
                    ? `bg-[${primaryColor}] text-white shadow-sm` 
                    : `hover:bg-black/5 ${textMuted}`
                  }
                `}
              >
                <tab.icon size={14} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Specific Controls */}
        {appViewMode === 'charts' && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {(['day', 'week', 'month', 'year'] as const).map(p => (
              <button
                key={p}
                onClick={() => setTimePeriod(p)}
                className={`
                  px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border transition-colors
                  ${timePeriod === p 
                    ? `bg-[${primaryColor}] text-white border-transparent` 
                    : `bg-transparent border-black/10 ${textMuted} hover:border-[${primaryColor}]`
                  }
                `}
              >
                {p === 'day' ? 'День' : p === 'week' ? 'Неделя' : p === 'month' ? 'Месяц' : 'Год'}
              </button>
            ))}
            <div className="w-px h-4 bg-black/10 mx-1" />
            {(['tasks', 'mood', 'logs'] as const).map(m => (
              <button
                key={m}
                onClick={() => setChartMetric(m)}
                className={`
                  px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border transition-colors
                  ${chartMetric === m 
                    ? `bg-[${primaryColor}] text-white border-transparent` 
                    : `bg-transparent border-black/10 ${textMuted} hover:border-[${primaryColor}]`
                  }
                `}
              >
                {m === 'tasks' ? 'Задачи' : m === 'mood' ? 'Настроение' : 'Записи'}
              </button>
            ))}
          </div>
        )}

        {appViewMode === 'search' && (
          <div className="relative">
            <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по записям, заметкам, задачам..."
              className={`pl-10 h-10 text-sm border-black/5 focus-visible:ring-[#E8A87C] ${isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white'}`}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-black/5">
                <X size={14} className={textMuted} />
              </button>
            )}
          </div>
        )}

        {appViewMode === 'reading' && (
           <div className="flex items-center justify-between">
             <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Читать за период</span>
             <div className="flex gap-2">
                <button onClick={() => setReadAllTime(!readAllTime)} className={`text-[10px] px-2 py-1 rounded border ${readAllTime ? `bg-[${primaryColor}] text-white border-transparent` : 'border-black/10 text-muted-foreground'}`}>
                  {readAllTime ? 'Всё время' : 'Период'}
                </button>
                <button onClick={() => setReadSortAsc(!readSortAsc)} className="p-1 rounded border border-black/10 text-muted-foreground">
                   {readSortAsc ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                </button>
             </div>
           </div>
        )}

        {appViewMode === 'reports' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {(['day', 'week', 'month', 'year'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setReportPeriod(p)}
                  className={`
                    px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border transition-colors
                    ${reportPeriod === p 
                      ? `bg-[${primaryColor}] text-white border-transparent` 
                      : `bg-transparent border-black/10 ${textMuted} hover:border-[${primaryColor}]`
                    }
                  `}
                >
                  {p === 'day' ? 'День' : p === 'week' ? 'Неделя' : p === 'month' ? 'Месяц' : 'Год'}
                </button>
              ))}
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Выбрать метрики:</span>
              <div className="grid grid-cols-3 gap-2">
                {(['tasks', 'mood', 'logs'] as const).map(metric => (
                  <button
                    key={metric}
                    onClick={() => {
                      const newSet = new Set(reportMetrics);
                      if (newSet.has(metric)) newSet.delete(metric);
                      else newSet.add(metric);
                      setReportMetrics(newSet);
                    }}
                    className={`
                      px-2 py-1.5 rounded text-xs font-bold transition-all border
                      ${reportMetrics.has(metric)
                        ? `bg-[${primaryColor}] text-white border-transparent` 
                        : `bg-transparent border-black/10 ${textMuted} hover:border-[${primaryColor}]`
                      }
                    `}
                  >
                    {metric === 'tasks' ? '✓ Задачи' : metric === 'mood' ? '😊 Настроение' : '📝 Записи'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 pb-24">
        
        {/* CHARTS VIEW */}
        {appViewMode === 'charts' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Задачи', val: periodStats.totalTasks, icon: CheckCircle2 },
                { label: 'Записи', val: periodStats.totalLogs, icon: FileText },
                { label: 'Среднее настроение', val: periodStats.avgMood, icon: Smile },
              ].map((stat, i) => (
                <div key={i} className={`p-3 rounded-xl border border-black/5 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
                  <div className={`text-[10px] uppercase font-bold tracking-wider ${textMuted} mb-1 flex items-center gap-1`}>
                    <stat.icon size={10} /> {stat.label}
                  </div>
                  <div className="text-xl font-bold">{stat.val}</div>
                </div>
              ))}
            </div>

            {/* Main Chart */}
            <div className={`p-4 rounded-xl border border-black/5 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
               <div className="flex items-center justify-between mb-4">
                 <h3 className="text-sm font-bold">{chartHeaderTitle}</h3>
                 <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${isDark ? 'bg-slate-800' : 'bg-black/5'} ${textMuted}`}>
                   {chartUnitLabel}
                 </span>
               </div>
               
               {isEmpty ? (
                 <div className="h-48 flex items-center justify-center text-xs text-muted-foreground italic">
                   Нет данных за этот период
                 </div>
               ) : chartMetric === 'mood' && viewType === 'pie' ? (
                 <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={60}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: '8px', border: 'none', color: isDark ? '#fff' : '#000' }} />
                      </PieChart>
                    </ResponsiveContainer>
                 </div>
               ) : (
                 <div className="h-48 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={chartData}>
                       <defs>
                         <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3}/>
                           <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
                         </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e5e7eb'} />
                       <XAxis 
                         dataKey="label" 
                         tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b' }}
                         axisLine={false}
                         tickLine={false}
                       />
                       <YAxis 
                         tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b' }}
                         axisLine={false}
                         tickLine={false}
                       />
                       <Tooltip 
                         contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: '8px', border: 'none', color: isDark ? '#fff' : '#000' }}
                         labelStyle={{ fontSize: 10, color: isDark ? '#94a3b8' : '#64748b' }}
                       />
                       <Area type="monotone" dataKey="value" stroke={primaryColor} strokeWidth={2} fillOpacity={1} fill="url(#colorGradient)" />
                     </AreaChart>
                   </ResponsiveContainer>
                 </div>
               )}
            </div>

            {/* Mood Breakdown */}
            {chartMetric === 'mood' && pieData.length > 0 && (
              <div className="grid grid-cols-5 gap-2">
                {pieData.map(d => (
                  <div key={d.name} className={`p-2 rounded-lg border border-black/5 text-center ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
                    <div className="text-xl mb-1">{d.emoji}</div>
                    <div className="text-xs font-bold">{d.value}</div>
                    <div className="text-[9px] text-muted-foreground">{d.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* READING VIEW */}
        {appViewMode === 'reading' && (
          <div className="space-y-4">
            {readingData.length === 0 ? (
              <div className="text-center py-20 opacity-50">
                <BookOpen size={32} className="mx-auto mb-3" />
                <p className="text-sm font-bold text-muted-foreground">Нет записей</p>
              </div>
            ) : (
              readingData.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => handleResultClick(item.dateKey)}
                  className={`p-4 rounded-xl border border-black/5 transition-all cursor-pointer hover:shadow-md ${isDark ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white hover:border-black/10'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${item.type === 'log' ? 'bg-blue-100 text-blue-700' : item.type === 'reflection' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                            {item.type === 'log' ? 'Запись' : item.type === 'reflection' ? 'Заметка' : 'Задача'}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">{format(item.dateObj, 'd MMM yyyy, HH:mm', { locale: ru })}</span>
                       </div>
                       <p className="text-sm leading-relaxed line-clamp-3">{item.text}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* SEARCH VIEW */}
        {appViewMode === 'search' && (
          <div className="space-y-4">
            {searchResults.length === 0 && searchQuery.length > 0 && (
               <div className="text-center py-20 opacity-50">
                  <Search size={32} className="mx-auto mb-3" />
                  <p className="text-sm font-bold text-muted-foreground">Ничего не найдено</p>
               </div>
            )}
            {searchResults.map(item => (
              <div 
                key={`${item.type}-${item.id}`}
                onClick={() => handleResultClick(item.dateKey)}
                className={`p-4 rounded-xl border border-black/5 transition-all cursor-pointer hover:shadow-md ${isDark ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white hover:border-black/10'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                     <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${item.type === 'log' ? 'bg-blue-100 text-blue-700' : item.type === 'reflection' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                          {item.type === 'log' ? 'Запись' : item.type === 'reflection' ? 'Заметка' : 'Задача'}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">{format(item.dateObj, 'd MMM yyyy, HH:mm', { locale: ru })}</span>
                     </div>
                     <p className="text-sm leading-relaxed line-clamp-3">{item.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* REPORTS VIEW */}
        {appViewMode === 'reports' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Report Summary */}
            {(() => {
              const report = generateReport();
              return (
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl border border-black/5 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
                    <h3 className="text-sm font-bold mb-3">Параметры отчета</h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className={textMuted}>Период:</span>
                        <span className={`${textMain} font-bold`}>{report.rangeStart} → {report.rangeEnd}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={textMuted}>Дней в периоде:</span>
                        <span className={`${textMain} font-bold`}>{report.dailyData.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={textMuted}>Генерирован:</span>
                        <span className={`${textMain} font-bold font-mono`}>{format(new Date(report.generatedAt), 'HH:mm:ss')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    {reportMetrics.has('tasks') && (
                      <div className={`p-3 rounded-xl border border-black/5 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
                        <div className={`text-[10px] uppercase font-bold tracking-wider ${textMuted} mb-1 flex items-center gap-1`}>
                          <CheckCircle2 size={10} /> Задачи
                        </div>
                        <div className="text-lg font-bold">{report.summary.completedTasks}/{report.summary.totalTasks}</div>
                        <div className={`text-[10px] ${textMuted}`}>{report.summary.taskCompletion}% выполнено</div>
                      </div>
                    )}
                    {reportMetrics.has('mood') && (
                      <div className={`p-3 rounded-xl border border-black/5 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
                        <div className={`text-[10px] uppercase font-bold tracking-wider ${textMuted} mb-1 flex items-center gap-1`}>
                          <Smile size={10} /> Настроение
                        </div>
                        <div className="text-lg font-bold">{report.summary.averageMood}</div>
                        <div className={`text-[10px] ${textMuted}`}>среднее значение</div>
                      </div>
                    )}
                    {reportMetrics.has('logs') && (
                      <div className={`p-3 rounded-xl border border-black/5 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
                        <div className={`text-[10px] uppercase font-bold tracking-wider ${textMuted} mb-1 flex items-center gap-1`}>
                          <FileText size={10} /> Записи
                        </div>
                        <div className="text-lg font-bold">{report.summary.totalLogs}</div>
                        <div className={`text-[10px] ${textMuted}`}>{report.summary.totalReflections} заметок</div>
                      </div>
                    )}
                    {reportMetrics.has('mood') && (
                      <div className={`p-3 rounded-xl border border-black/5 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
                        <div className={`text-[10px] uppercase font-bold tracking-wider ${textMuted} mb-1`}>📊 Записей</div>
                        <div className="text-lg font-bold">{report.summary.totalMoods}</div>
                        <div className={`text-[10px] ${textMuted}`}>определений настроения</div>
                      </div>
                    )}
                  </div>

                  {/* Mood Distribution if selected */}
                  {reportMetrics.has('mood') && (
                    <div className={`p-4 rounded-xl border border-black/5 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
                      <h4 className="text-xs font-bold uppercase mb-3 tracking-wider">Распределение настроений</h4>
                      <div className="grid grid-cols-5 gap-2">
                        {MOOD_CONFIG.map(mood => (
                          <div key={mood.type} className="text-center">
                            <div className="text-2xl mb-1">{mood.emoji}</div>
                            <div className="text-xs font-bold">{report.moodDistribution[mood.type as keyof typeof report.moodDistribution]}</div>
                            <div className={`text-[9px] ${textMuted}`}>{mood.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Export Button */}
                  <button
                    onClick={exportReportAsJSON}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                      isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-100' : 'bg-black/5 hover:bg-black/10 text-[#4A403A]'
                    }`}
                  >
                    <Download size={16} />
                    Экспортировать отчет (JSON)
                  </button>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
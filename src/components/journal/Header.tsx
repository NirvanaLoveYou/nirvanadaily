"use client";

import { useJournal } from "@/lib/journal-context";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, addMonths, subMonths, addWeeks, subWeeks, addYears, subYears } from "date-fns";
import { ru } from "date-fns/locale";
import { useMemo } from "react";

export default function Header() {
  const { currentDate, setCurrentDate, setViewMode, calendarViewMode, setCalendarViewMode, tabMode, viewMode, theme } = useJournal();

  // Determine if we should show calendar controls
  const showCalendarControls = tabMode === 'journal' && viewMode === 'month';

  // Determine right-side title based on tabMode
  const rightTitle = useMemo(() => {
    switch (tabMode) {
      case 'tasks': return 'Менеджер';
      case 'stats': return 'Аналитика';
      case 'user': return 'Профиль';
      case 'log': return 'Запись';
      default: return ''; // Journal mode uses calendar controls or nothing
    }
  }, [tabMode]);

  const handlePrev = () => {
    if (calendarViewMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else if (calendarViewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (calendarViewMode === 'year') setCurrentDate(subYears(currentDate, 1));
  };

  const handleNext = () => {
    if (calendarViewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else if (calendarViewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (calendarViewMode === 'year') setCurrentDate(addYears(currentDate, 1));
  };

  const handleSetView = (newView: 'week' | 'month' | 'year') => {
    setViewMode('month');
    setCalendarViewMode(newView);
  };

  const periodTitle = useMemo(() => {
    if (!showCalendarControls) return "";
    if (calendarViewMode === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(start, 'd MMM')} - ${format(end, 'd MMM', { locale: ru })}`;
    } else if (calendarViewMode === 'month') {
      return format(currentDate, 'LLLL yyyy', { locale: ru });
    } else if (calendarViewMode === 'year') {
      return format(currentDate, 'yyyy', { locale: ru });
    }
    return "";
  }, [showCalendarControls, calendarViewMode, currentDate]);

  const getPrimaryBg = () => theme === 'purple' ? 'bg-[#c084fc]' : theme === 'dark' ? 'bg-[#94a3b8]' : theme === 'nature' ? 'bg-[#3E4E3C]' : 'bg-[#E8A87C]';
  const getActiveText = () => theme === 'purple' ? 'text-[#c084fc]' : theme === 'dark' ? 'text-[#94a3b8]' : theme === 'nature' ? 'text-[#8B6C5E]' : 'text-[#E8A87C]';

  return (
    <header className={`
      sticky top-0 z-20 border-b py-3 transition-colors duration-300 px-1
      ${theme === 'dark' 
        ? 'bg-slate-950/90 backdrop-blur-md border-slate-800/50 text-slate-100' 
        : theme === 'purple'
        ? 'bg-purple-50/90 backdrop-blur-md border-purple-200/50 text-purple-900'
        : theme === 'nature'
        ? 'bg-[#F2F0E9]/95 backdrop-blur-md border-[#D3CCC0]/50 text-[#2C362F]'
        : 'bg-[#FAF9F6]/95 backdrop-blur-md border-black/5 text-[#4A403A]'
      }
    `}>
      <div className="max-w-[480px] mx-auto flex items-center justify-between h-8 px-4">
        
        {/* App Title - Updated Typography */}
        <h1 className="text-xl font-black tracking-tighter pl-2">
          NirvanaDaily
        </h1>

        {/* Right Side Content: Calendar Controls OR Title */}
        {showCalendarControls ? (
          <div className="flex items-center gap-2">
            
            {/* Nav Arrows */}
            <button 
              onClick={handlePrev} 
              className={`p-1.5 rounded-md transition-colors ${
                theme === 'dark' 
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' 
                  : theme === 'purple'
                  ? 'text-purple-400 hover:text-purple-900 hover:bg-white'
                  : theme === 'nature'
                  ? 'text-[#5F6A63] hover:text-[#2C362F] hover:bg-[#E9E6DB]'
                  : 'text-[#4A403A]/60 hover:text-[#4A403A] hover:bg-white'
              }`}
            >
              <ChevronLeft size={18} />
            </button>

            {/* Period Label */}
            <span className={`text-xs font-bold min-w-[60px] text-center transition-colors ${
              theme === 'dark' ? 'text-slate-300' : theme === 'purple' ? 'text-purple-700' : theme === 'nature' ? 'text-[#2C362F]/80' : 'text-[#4A403A]/80'
            }`}>
              {periodTitle}
            </span>

            <button 
              onClick={handleNext} 
              className={`p-1.5 rounded-md transition-colors ${
                theme === 'dark' 
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' 
                  : theme === 'purple'
                  ? 'text-purple-400 hover:text-purple-900 hover:bg-white'
                  : theme === 'nature'
                  ? 'text-[#5F6A63] hover:text-[#2C362F] hover:bg-[#E9E6DB]'
                  : 'text-[#4A403A]/60 hover:text-[#4A403A] hover:bg-white'
              }`}
            >
              <ChevronRight size={18} />
            </button>

            {/* Switcher: Week / Month / Year */}
            <div className={`
              flex items-center p-0.5 rounded-lg border shadow-sm ml-1
              ${theme === 'dark' 
                ? 'bg-slate-800/50 border-slate-700/50' 
                : theme === 'purple'
                ? 'bg-white border-purple-200'
                : theme === 'nature'
                ? 'bg-[#E9E6DB] border-[#D3CCC0]'
                : 'bg-white border-black/5'
              }
            `}>
              {(['week', 'month', 'year'] as const).map(mode => {
                const isActive = calendarViewMode === mode;
                return (
                  <button
                    key={mode}
                    onClick={() => handleSetView(mode)}
                    className={`
                      px-2.5 py-1 text-[10px] font-bold rounded-md transition-all
                      ${isActive 
                        ? (theme === 'purple' 
                            ? 'bg-[#c084fc] text-white shadow-sm' 
                            : theme === 'dark'
                            ? 'bg-[#94a3b8] text-white shadow-sm'
                            : theme === 'nature'
                            ? 'bg-[#3E4E3C] text-white shadow-sm'
                            : 'bg-[#E8A87C] text-white shadow-sm'
                        ) 
                        : (theme === 'dark')
                            ? 'text-slate-500 hover:text-slate-300'
                            : theme === 'purple'
                            ? 'text-gray-400 hover:text-gray-600'
                            : theme === 'nature'
                            ? 'text-[#5F6A63] hover:text-[#2C362F]'
                            : 'text-gray-400 hover:text-gray-600'
                      }
                    `}
                  >
                    {mode === 'week' ? 'Нед' : mode === 'month' ? 'Мес' : 'Год'}
                  </button>
                );
              })}
            </div>
          </div>
        ) : rightTitle ? (
          <span className={`text-base font-bold uppercase tracking-wide mr-4 ${
             theme === 'dark' ? 'text-slate-400' : theme === 'purple' ? 'text-purple-400' : theme === 'nature' ? 'text-[#5F6A63]' : 'text-gray-400'
          }`}>
            {rightTitle}
          </span>
        ) : (
          <div className="w-10"></div> 
        )}
      </div>
    </header>
  );
}
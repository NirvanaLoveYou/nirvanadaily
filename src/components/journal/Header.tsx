"use client";

import { useJournal } from "@/lib/journal-context";
import { useMemo } from "react";

export default function Header() {
  const { setViewMode, calendarViewMode, setCalendarViewMode, tabMode, viewMode, theme } = useJournal();

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

  const handleSetView = (newView: 'week' | 'month' | 'year') => {
    setViewMode('month');
    setCalendarViewMode(newView);
  };

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
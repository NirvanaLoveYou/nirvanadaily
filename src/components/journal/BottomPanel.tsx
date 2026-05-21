"use client";

import { useJournal } from "@/lib/journal-context";
import { Calendar, BarChart3, User, CheckSquare, Pencil } from "lucide-react";

export default function BottomPanel() {
  const { tabMode, setTabMode, setCurrentDate, setFocusTarget, viewMode, setViewMode, currentDate, theme } = useJournal();

  const tabs = [
    { id: 'journal' as const, icon: Calendar, label: 'Календарь' },
    { id: 'tasks' as const, icon: CheckSquare, label: 'Менеджер' },
    { id: 'log' as const, icon: Pencil, label: 'Запись' },
    { id: 'stats' as const, icon: BarChart3, label: 'Анализ' },
    { id: 'user' as const, icon: User, label: 'Профиль' },
  ];

  const handleTabClick = (id: 'journal' | 'stats' | 'user' | 'tasks' | 'log') => {
    if (id === 'log') {
      setTabMode('journal');
      setViewMode('day');
      setCurrentDate(new Date());
      setFocusTarget('log');
    } else if (id === 'journal') {
      setTabMode('journal');
      setViewMode('month');
      setCurrentDate(new Date());
    } else {
      setTabMode(id);
    }
  };

  const activeColor = theme === 'purple' ? 'text-[#c084fc]' : theme === 'dark' ? 'text-[#94a3b8]' : theme === 'nature' ? 'text-[#8B6C5E]' : 'text-[#E8A87C]';
  const activeBg = theme === 'purple' ? 'bg-[#c084fc]' : theme === 'dark' ? 'bg-[#94a3b8]' : theme === 'nature' ? 'bg-[#3E4E3C]' : 'bg-[#E8A87C]';

  return (
    <nav className={`fixed bottom-0 left-0 right-0 backdrop-blur-md border-t z-50 transition-colors duration-300 ${
      theme === 'dark'
        ? 'bg-slate-900/90 border-slate-800'
        : theme === 'purple'
        ? 'bg-purple-100 border-purple-300'
        : theme === 'nature'
        ? 'bg-[#E9E6DB] border-[#D3CCC0]'
        : 'bg-white/90 border-black/5'
    }`}>
      <div className="max-w-[480px] mx-auto h-16">
        <div className="flex justify-around items-center h-full px-1">
          {tabs.map(tab => {
            const isActive = tabMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`relative flex flex-col items-center justify-center w-full h-full gap-1 transition-colors group ${
                  isActive ? activeColor : theme === 'purple' ? 'text-purple-400' : theme === 'nature' ? 'text-[#5F6A63]' : 'text-gray-400'
                }`}
              >
                {isActive && (
                  <div className={`absolute top-0 w-6 h-0.5 rounded-full ${activeBg}`} />
                )}
                <tab.icon size={18} className="relative z-10 transition-transform group-active:scale-90" />
                <span className="text-[8px] font-bold uppercase tracking-wide relative z-10 leading-none">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
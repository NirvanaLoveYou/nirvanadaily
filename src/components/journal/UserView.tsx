"use client";

import React, { useRef, useState } from "react";
import { useJournal, QUICK_ACTIONS_CONFIG } from "@/lib/journal-context";
import { 
  Download, Upload, Trash2, ChevronRight, 
  BarChart3, Sparkles, User, Palette, RotateCcw, 
  Settings2, Zap, Leaf, Check, Pencil, X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Changelog from "@/components/changelog/Changelog";

export default function UserView() {
  const { 
    exportData, 
    importData, 
    clearData, 
    quickActionsVisible, 
    setQuickActionsVisible,
    dayResultsVisible,
    setDayResultsVisible,
    calendarSummaryVisible,
    setCalendarSummaryVisible,
    periodStatsVisible,
    setPeriodStatsVisible,
    toggleQuickAction,
    isQuickActionEnabled,
    chartsVisible,
    setChartsVisible,
    moodDistributionVisible,
    setMoodDistributionVisible,
    summaryCardsVisible,
    setSummaryCardsVisible,
    theme,
    setTheme,
    userName,
    setUserName,
    hasOnboarded,
    setHasOnboarded
  } = useJournal();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);

  const [isQAExpanded, setIsQAExpanded] = useState(false);
  const [isAnalyticsExpanded, setIsAnalyticsExpanded] = useState(false);
  const [isThemeExpanded, setIsThemeExpanded] = useState(false);

  const [animatingTheme, setAnimatingTheme] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        importData(text);
        toast.success("Данные и настройки успешно импортированы");
      } catch (err) {
        toast.error("Ошибка при чтении файла");
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (isConfirmingClear) {
      clearData();
      setIsConfirmingClear(false);
      toast.success("Все данные удалены");
    } else {
      setIsConfirmingClear(true);
      setTimeout(() => setIsConfirmingClear(false), 3000);
    }
  };

  const handleSaveName = () => {
    const trimmed = tempName.trim();
    if (!trimmed) {
      toast.error("Имя не может быть пустым");
      return;
    }
    setUserName(trimmed);
    setIsEditingName(false);
    toast.success("Имя сохранено");
  };

  const handleCancelName = () => {
    setTempName(userName);
    setIsEditingName(false);
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'purple' | 'nature') => {
    setAnimatingTheme(newTheme);
    setTheme(newTheme);
    setTimeout(() => setAnimatingTheme(null), 600);
  };

  const getPrimaryColor = () => {
    if (theme === 'purple') return '#c084fc';
    if (theme === 'dark') return '#94a3b8';
    if (theme === 'nature') return '#8B6C5E';
    return '#E8A87C';
  };

  const getMainText = () => {
    if (theme === 'purple') return 'text-purple-900';
    if (theme === 'dark') return 'text-slate-100';
    if (theme === 'nature') return 'text-[#2C362F]';
    return 'text-[#4A403A]';
  };

  const getMutedText = () => {
    if (theme === 'purple') return 'text-purple-400';
    if (theme === 'dark') return 'text-slate-500';
    if (theme === 'nature') return 'text-[#6B7D6F]';
    return 'text-gray-400';
  };

  const getCardBg = () => {
    if (theme === 'purple') return 'bg-purple-50/80 border-purple-200/50';
    if (theme === 'dark') return 'bg-slate-800/60 border-slate-700/50';
    if (theme === 'nature') return 'bg-[#E5E2D6]/80 border-[#D3CCC0]/50';
    return 'bg-white border-black/5';
  };

  const getRowBg = () => {
    if (theme === 'purple') return 'bg-purple-100/30 border-purple-200/50 hover:bg-purple-100/60';
    if (theme === 'dark') return 'bg-slate-900/30 border-slate-700/50 hover:bg-slate-800/50';
    if (theme === 'nature') return 'bg-[#E9E6DB] border-[#D3CCC0] hover:bg-[#DFD9CD]';
    return 'bg-[#FAF9F6]/30 border-black/5 hover:bg-gray-50';
  };

  const getSolidBorder = () => {
    if (theme === 'purple') return 'border-purple-200';
    if (theme === 'dark') return 'border-slate-800';
    if (theme === 'nature') return 'border-[#D3CCC0]';
    return 'border-black/5';
  };

  const getActiveBg = () => {
    if (theme === 'purple') return 'bg-[#c084fc]';
    if (theme === 'dark') return 'bg-[#94a3b8]';
    if (theme === 'nature') return 'bg-[#3E4E3C]';
    return 'bg-[#E8A87C]';
  };

  const getQAButtonClass = (isActive: boolean) => {
    if (isActive) {
      if (theme === 'purple') return 'bg-[#c084fc] border-[#c084fc] text-white shadow-sm';
      if (theme === 'dark') return 'bg-[#94a3b8] border-[#94a3b8] text-white shadow-sm';
      if (theme === 'nature') return 'bg-[#3E4E3C] border-[#3E4E3C] text-white shadow-sm';
      return 'bg-[#E8A87C] border-[#E8A87C] text-white shadow-sm';
    }
    if (theme === 'purple') return 'bg-white border-purple-200 text-purple-400 hover:bg-purple-50 hover:text-purple-500';
    if (theme === 'dark') return 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-100';
    if (theme === 'nature') return 'bg-[#E9E6DB] border-[#D3CCC0] text-[#5F6A63] hover:bg-[#DFD9CD] hover:text-[#2C362F]';
    return 'bg-white border-black/5 text-slate-500 hover:bg-slate-50 hover:text-slate-600';
  };

  return (
    <div className="space-y-6 pb-24 px-4 pt-4 animate-in fade-in duration-500">
      
      {/* User Profile Card */}
      <div className={`${getCardBg()} rounded-2xl p-5 border shadow-sm transition-colors duration-300 flex items-center gap-5`}>
        <div className={`
          w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg transition-all duration-500 relative overflow-hidden group
          ${theme === 'purple' ? 'bg-gradient-to-br from-purple-400 to-fuchsia-500' : 
            theme === 'dark' ? 'bg-gradient-to-br from-slate-600 to-slate-800' : 
            theme === 'nature' ? 'bg-gradient-to-br from-[#3E4E3C] to-[#2C362F]' : 
            'bg-gradient-to-br from-[#E8A87C] to-[#d97706]'}
        `}>
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <User size={28} className="relative z-10" />
        </div>
        
        <div className="flex-1 min-w-0 space-y-1">
          {!isEditingName ? (
            <div className="flex items-center justify-between gap-2">
              <h3 className={`${getMainText()} text-lg font-bold truncate transition-colors`}>
                {userName}
              </h3>
              <button 
                onClick={() => { setIsEditingName(true); setTempName(userName); }}
                className={`${getMutedText()} p-2 rounded-xl transition-all duration-200 hover:scale-105 hover:${getMainText()}`}
              >
                <Pencil size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Input 
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className={`
                  h-10 text-sm font-semibold rounded-xl focus-visible:ring-0 px-4
                  ${theme === 'dark' ? 'bg-slate-900/50 border-slate-700 text-slate-100' : 
                    theme === 'purple' ? 'bg-white border-purple-200 text-purple-900' : 
                    theme === 'nature' ? 'bg-[#E9E6DB] border-[#D3CCC0] text-[#2C362F]' : 
                    'bg-[#FAF9F6] border-black/5 text-[#4A403A]'}
                `}
                autoFocus
                onKeyDown={(e) => { if(e.key === 'Enter') handleSaveName(); if(e.key === 'Escape') handleCancelName(); }}
              />
              <Button 
                onClick={handleSaveName}
                size="sm"
                className={`${getActiveBg()} h-10 w-10 p-0 rounded-xl hover:opacity-90 text-white`}
              >
                <Check size={18} />
              </Button>
            </div>
          )}
          <div className="flex items-center justify-between">
             <p className={`${getMutedText()} text-[11px] font-medium uppercase tracking-wider`}>NirvanaDaily v2.5.1</p>
             <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsChangelogOpen(true)}
                className={`
                  h-7 px-3 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all hover:scale-105 border-none shadow-sm
                  ${theme === 'purple' ? 'bg-white text-purple-600 hover:bg-purple-50 shadow-purple-200/50' : 
                    theme === 'dark' ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 shadow-black/20' : 
                    theme === 'nature' ? 'bg-[#E9E6DB] text-[#8B6C5E] hover:bg-[#DFD9CD] shadow-[#D3CCC0]/20' : 
                    'bg-[#FAF9F6] text-[#E8A87C] hover:bg-[#FAF9F6] shadow-black/5'}
                `}
              >
                <Sparkles size={12} className="mr-1.5" />
                Что новое
              </Button>
          </div>
        </div>
      </div>

      {/* Interface Settings */}
      <div className={`${getCardBg()} rounded-2xl p-5 border shadow-sm transition-colors duration-300 space-y-4`}>
        <div className="flex items-center gap-2 mb-2">
          <Settings2 size={16} className="text-purple-400" />
          <h3 className={`${getMutedText()} text-[11px] font-bold uppercase tracking-wider`}>
            Интерфейс
          </h3>
        </div>

        <div 
          className={`${getRowBg()} border rounded-xl p-3.5 transition-all cursor-pointer duration-200`}
          onClick={() => setIsThemeExpanded(!isThemeExpanded)} 
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className={`
                p-2 rounded-xl shadow-sm border flex-shrink-0 transition-colors
                ${theme === 'dark' ? 'bg-slate-800 text-slate-100 border-slate-700' : 
                  theme === 'purple' ? 'bg-white text-purple-900 border-purple-200' : 
                  theme === 'nature' ? 'bg-[#E9E6DB] text-[#2C362F] border-[#D3CCC0]' : 
                  'bg-white text-[#4A403A] border-black/5'}
              `}>
                {theme === 'purple' ? <Palette size={16} className="text-purple-500" /> : 
                 theme === 'dark' ? <div className="w-4 h-4 bg-slate-500 rounded-full" /> : 
                 theme === 'nature' ? <Leaf size={16} className="text-[#3E4E3C]" /> : 
                 <div className="w-4 h-4 bg-yellow-500 rounded-full" />}
              </div>
              <span className={`${getMainText()} text-sm font-bold`}>Тема оформления</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`${getMutedText()} text-xs font-bold uppercase tracking-wider`}>
                {theme === 'purple' ? 'Лавандовая' : theme === 'dark' ? 'Темная' : theme === 'nature' ? 'Природа' : 'Светлая'}
              </span>
              <ChevronRight size={16} className={`${getMutedText()} transition-transform duration-200 ${isThemeExpanded ? 'rotate-90' : ''}`} />
            </div>
          </div>

          {isThemeExpanded && (
            <div className="mt-4 grid grid-cols-2 gap-3 pt-4 border-t pointer-events-auto" onClick={(e) => e.stopPropagation()}>
              {[
                { id: 'light' as const, label: 'Светлая', icon: <div className="w-4 h-4 bg-yellow-500 rounded-full" /> },
                { id: 'dark' as const, label: 'Темная', icon: <div className="w-4 h-4 bg-slate-500 rounded-full" /> },
                { id: 'purple' as const, label: 'Лавандовая', icon: <Palette size={16} className="text-purple-500" /> },
                { id: 'nature' as const, label: 'Природа', icon: <Leaf size={16} className="text-green-600" /> },
              ].map(t => {
                const isActive = theme === t.id;
                const isAnimating = animatingTheme === t.id;
                
                return (
                  <button
                    key={t.id}
                    onClick={() => handleThemeChange(t.id)}
                    className={`
                      relative group flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl border-2 transition-all duration-300 ease-out
                      ${isActive 
                        ? 'border-current bg-current/5 shadow-lg scale-105' 
                        : 'border-transparent hover:bg-black/5 hover:border-black/5 hover:scale-100'
                      }
                      ${isAnimating ? 'animate-in zoom-in-50 duration-300' : ''}
                    `}
                    style={{
                      color: isActive ? getPrimaryColor() : '#94a3b8'
                    }}
                  >
                    {t.icon}
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'opacity-100' : 'opacity-60'}`}>{t.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-2">
           {[
             { id: 'calendar', label: 'Сводка дня', val: calendarSummaryVisible, set: setCalendarSummaryVisible, desc: 'Настроения и статистика на календаре' },
             { id: 'period', label: 'Статистика периода', val: periodStatsVisible, set: setPeriodStatsVisible, desc: 'Задачи и настроение за неделю/месяц' },
             { id: 'day', label: 'Результаты дня', val: dayResultsVisible, set: setDayResultsVisible, desc: 'Общая сводка под календарем' },
           ].map((item) => (
             <div key={item.id} className={`${getSolidBorder()} flex items-center justify-between py-2 border-b last:border-0`}>
                <div className="flex-1">
                   <div className={`${getMainText()} text-sm font-bold`}>{item.label}</div>
                   <div className={`${getMutedText()} text-[10px]`}>{item.desc}</div>
                </div>
                <button 
                  onClick={() => item.set(!item.val)}
                  className={`${item.val ? getActiveBg() : (theme === 'dark' ? 'bg-slate-700' : theme === 'purple' ? 'bg-purple-200' : theme === 'nature' ? 'bg-[#D3CCC0]' : 'bg-gray-200')} w-11 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out relative`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${item.val ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </button>
             </div>
           ))}

           <div className={`${getSolidBorder()} border-t pt-2 mt-2`}>
             <div 
                className={`${getRowBg()} border rounded-xl p-3.5 transition-all cursor-pointer duration-200`}
                onClick={() => setIsQAExpanded(!isQAExpanded)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className={`
                      p-2 rounded-xl shadow-sm border flex-shrink-0 transition-colors
                      ${theme === 'dark' ? 'bg-slate-800 text-slate-100 border-slate-700' : 
                        theme === 'purple' ? 'bg-white text-purple-900 border-purple-200' : 
                        theme === 'nature' ? 'bg-[#E9E6DB] text-[#2C362F] border-[#D3CCC0]' : 
                        'bg-white text-[#4A403A] border-black/5'}
                    `}>
                      <Zap size={16} style={{ color: getPrimaryColor() }} />
                    </div>
                    <div className="flex flex-col">
                       <span className={`${getMainText()} text-sm font-bold`}>Быстрые действия</span>
                       <span className={`${getMutedText()} text-[10px]`}>Настроить эмодзи</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setQuickActionsVisible(!quickActionsVisible); }}
                      className={`${quickActionsVisible ? getActiveBg() : (theme === 'dark' ? 'bg-slate-700' : theme === 'purple' ? 'bg-purple-200' : theme === 'nature' ? 'bg-[#D3CCC0]' : 'bg-gray-200')} w-9 h-5 rounded-full p-0.5 transition-colors duration-200 relative`}
                    >
                      <div className={`w-3.5 h-3.5 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${quickActionsVisible ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </button>
                    <ChevronRight size={16} className={`${getMutedText()} transition-transform duration-200 ${isQAExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </div>

                {isQAExpanded && (
                  <div className="mt-4 pt-4 border-t pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                     <div className="grid grid-cols-6 gap-1.5">
                       {Object.values(QUICK_ACTIONS_CONFIG).map(action => {
                         const isActive = isQuickActionEnabled(action.id);
                         return (
                           <button
                             key={action.id}
                             onClick={() => toggleQuickAction(action.id)}
                             title={action.label}
                             className={`
                               aspect-square rounded-md flex flex-col items-center justify-center gap-0.5 transition-all border pointer-events-auto
                               ${getQAButtonClass(isActive)}
                             `}
                           >
                             <span className="text-sm pointer-events-none leading-none">{action.emoji}</span>
                             <span className="text-[7px] uppercase leading-none pointer-events-none text-center opacity-80">{action.label}</span>
                           </button>
                         );
                       })}
                     </div>
                  </div>
                )}
             </div>
           </div>
        </div>
      </div>

      {/* Analytics Settings */}
      <div className={`${getCardBg()} rounded-2xl p-5 border shadow-sm transition-colors duration-300 space-y-3`}>
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 size={16} style={{ color: getPrimaryColor() }} />
          <h3 className={`${getMutedText()} text-[11px] font-bold uppercase tracking-wider`}>
            Аналитика
          </h3>
        </div>
        
        <div 
          className={`${getRowBg()} border rounded-xl p-3.5 transition-all cursor-pointer duration-200`}
          onClick={() => setIsAnalyticsExpanded(!isAnalyticsExpanded)}
        >
          <div className="flex items-center justify-between w-full">
            <span className={`${getMainText()} text-sm font-bold`}>Видимость графиков</span>
            <ChevronRight size={16} className={`${getMutedText()} transition-transform duration-200 ${isAnalyticsExpanded ? 'rotate-90' : ''}`} />
          </div>

          {isAnalyticsExpanded && (
            <div className="mt-4 space-y-3 pt-4 border-t pointer-events-auto" onClick={(e) => e.stopPropagation()}>
              {[
                { label: 'Основной график', val: chartsVisible, set: setChartsVisible },
                { label: 'Сводные карточки', val: summaryCardsVisible, set: setSummaryCardsVisible },
                { label: 'Распределение настроений', val: moodDistributionVisible, set: setMoodDistributionVisible },
              ].map((item) => (
                 <div key={item.label} className="flex items-center justify-between py-1">
                   <span className={`${getMainText()} text-xs font-medium`}>{item.label}</span>
                   <button 
                      onClick={() => item.set(!item.val)}
                      className={`${item.val ? getActiveBg() : (theme === 'dark' ? 'bg-slate-700' : theme === 'purple' ? 'bg-purple-200' : theme === 'nature' ? 'bg-[#D3CCC0]' : 'bg-gray-200')} w-9 h-5 rounded-full p-0.5 transition-colors duration-200 relative`}
                    >
                      <div className={`w-3.5 h-3.5 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${item.val ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </button>
                 </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Data Management */}
      <div className={`${getCardBg()} rounded-2xl p-5 border shadow-sm transition-colors duration-300 space-y-4`}>
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full`} style={{ backgroundColor: getPrimaryColor() }}></div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: getPrimaryColor() }}>
            Данные
          </h3>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={exportData}
            variant="outline" 
            className="h-auto flex-col gap-2 py-4 border border-black/5 text-[#4A403A] hover:bg-[#FAF9F6] hover:text-[#4A403A] bg-transparent"
          >
            <Download size={20} />
            <span className="text-xs font-bold">Экспорт</span>
          </Button>
          
          <Button 
            onClick={() => fileInputRef.current?.click()}
            variant="outline" 
            className="h-auto flex-col gap-2 py-4 border border-black/5 text-[#4A403A] hover:bg-[#FAF9F6] hover:text-[#4A403A] bg-transparent"
          >
            <Upload size={20} />
            <span className="text-xs font-bold">Импорт</span>
          </Button>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />

        <div className={`${getSolidBorder()} pt-2 border-t`}>
           <Button 
              variant="outline"
              onClick={() => {
                setHasOnboarded(false);
                toast.success("Онбординг сброшен. Перезапустите приложение.");
              }}
              className="w-full justify-start h-10 px-4 transition-colors text-blue-500 border-blue-100 hover:bg-blue-50"
            >
              <RotateCcw size={16} className="mr-2" />
              Сбросить онбординг
            </Button>
        </div>

        <div className={`${getSolidBorder()} pt-2 border-t`}>
          {isConfirmingClear ? (
            <Button 
              onClick={handleClearData}
              className={`
                w-full justify-start h-11 px-4 transition-colors font-bold text-white
                ${theme === 'dark' ? 'bg-red-900/80 hover:bg-red-900' : 
                  theme === 'purple' ? 'bg-red-100 text-red-600 hover:bg-red-200' : 
                  theme === 'nature' ? 'bg-[#F2D7D5] text-[#A8413A] hover:bg-[#E8C7C5]' : 
                  'bg-red-100 text-red-600 hover:bg-red-200'}
              `}
            >
              <Trash2 size={16} className="mr-2" />
              Подтвердить удаление
            </Button>
          ) : (
            <Button 
              onClick={handleClearData}
              variant="outline" 
              className={`
                w-full justify-start h-11 px-4 transition-colors font-medium
                ${theme === 'dark' 
                ? 'border-red-900/30 text-red-400 hover:bg-red-900/20' 
                : theme === 'purple'
                ? 'border-red-100 text-red-500 hover:bg-red-50'
                : theme === 'nature'
                ? 'border-[#D8B4B4] text-[#A8413A] hover:bg-[#F2D7D5]'
                : 'border-red-100 text-red-500 hover:bg-red-50'}
              `}
            >
              <Trash2 size={16} className="mr-2" />
              Удалить все данные
            </Button>
          )}
        </div>
      </div>
      
      <div className={`${getMutedText()} text-center text-[10px] pt-4 uppercase tracking-widest opacity-40`}>
        NirvanaDaily v2.5.1
      </div>

      <Dialog open={isChangelogOpen} onOpenChange={setIsChangelogOpen}>
        <DialogContent className={`
          max-w-md h-[90vh] p-0 gap-0 border-none rounded-2xl overflow-hidden flex flex-col
          ${theme === 'dark' ? 'bg-slate-900' : theme === 'purple' ? 'bg-purple-50' : theme === 'nature' ? 'bg-[#EAECE5]' : 'bg-[#FAF9F6]'}
        `}>
          <DialogHeader className={`${getSolidBorder()} px-5 py-4 border-b flex-shrink-0`}>
            <DialogTitle className={`${getMainText()} text-lg font-bold flex items-center gap-2`}>
               <Sparkles size={18} style={{ color: getPrimaryColor() }} />
               Что новое?
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <Changelog />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
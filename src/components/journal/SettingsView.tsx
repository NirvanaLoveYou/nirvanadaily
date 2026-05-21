"use client";

import { useJournal, QUICK_ACTIONS_CONFIG } from "@/lib/journal-context";
import { Download, Upload, Trash2, ChevronDown, ChevronUp, Eye, EyeOff, BarChart3, PieChart } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SettingsView() {
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
    // Analytics
    chartsVisible,
    setChartsVisible,
    moodDistributionVisible,
    setMoodDistributionVisible,
    summaryCardsVisible,
    setSummaryCardsVisible
  } = useJournal();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  
  // Collapsible states
  const [isQAExpanded, setIsQAExpanded] = useState(false);
  const [isDRExpanded, setIsDRExpanded] = useState(false);
  const [isCSExpanded, setIsCSExpanded] = useState(false);
  const [isPSExpanded, setIsPSExpanded] = useState(false);
  const [isAnalyticsExpanded, setIsAnalyticsExpanded] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        importData(text);
        toast.success("Данные успешно импортированы");
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

  return (
    <div className="space-y-4 pb-24 px-4 pt-2">
      <h2 className="text-xl font-semibold text-[#4A403A] mb-2">Настройки</h2>

      {/* Data Management */}
      <div className="bg-white rounded-xl p-4 space-y-3 border border-black/5 shadow-sm">
        <h3 className="text-[11px] font-bold text-[#E8A87C] uppercase tracking-wider flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E8A87C]"></span>
          Данные
        </h3>
        
        <div className="space-y-2">
          <Button 
            onClick={exportData}
            variant="outline" 
            className="w-full justify-between border-black/5 text-[#4A403A] hover:bg-[#FAF9F6] hover:text-[#4A403A] bg-transparent h-10 px-4"
          >
            <span className="flex items-center gap-2"><Download size={16} />Экспорт в JSON</span>
            <span className="text-gray-300">↓</span>
          </Button>
          
          <Button 
            onClick={() => fileInputRef.current?.click()}
            variant="outline" 
            className="w-full justify-between border-black/5 text-[#4A403A] hover:bg-[#FAF9F6] hover:text-[#4A403A] bg-transparent h-10 px-4"
          >
            <span className="flex items-center gap-2"><Upload size={16} />Импорт из JSON</span>
            <span className="text-gray-300">↑</span>
          </Button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />

          <div className="pt-2 border-t border-black/5">
            {isConfirmingClear ? (
              <Button 
                onClick={handleClearData}
                className="w-full justify-start bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 h-10 px-4"
              >
                <Trash2 size={16} className="mr-2" />
                Подтвердить удаление
              </Button>
            ) : (
              <Button 
                onClick={handleClearData}
                variant="outline" 
                className="w-full justify-start border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 bg-transparent h-10 px-4"
              >
                <Trash2 size={16} className="mr-2" />
                Удалить все данные
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Interface Settings */}
      <div className="bg-white rounded-xl p-4 border border-black/5 shadow-sm space-y-3">
        <h3 className="text-[11px] font-bold text-[#4A403A]/70 uppercase tracking-wider flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
          Интерфейс
        </h3>

        {/* Calendar Summary Section */}
        <div 
          className={`border border-black/5 rounded-lg p-3 bg-[#FAF9F6]/30 cursor-pointer transition-all ${!calendarSummaryVisible ? 'opacity-50 line-through decoration-gray-400' : ''}`}
          onClick={() => setIsCSExpanded(!isCSExpanded)} 
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                onClick={(e) => {
                  e.stopPropagation(); 
                  setCalendarSummaryVisible(!calendarSummaryVisible);
                }}
                className="bg-white p-1.5 rounded-md text-[#4A403A] shadow-sm border border-black/5 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                {calendarSummaryVisible ? <Eye size={14} /> : <EyeOff size={14} />}
              </div>
              <span className="text-sm font-semibold text-[#4A403A]">Сводка дня</span>
            </div>
            <div className="flex items-center gap-2">
              {isCSExpanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
            </div>
          </div>

          {isCSExpanded && (
            <div className="mt-3 pt-3 border-t border-black/5 pl-1 pointer-events-none">
              <p className="text-xs text-gray-500">
                Блок с быстрым выбором настроения и статистикой за день на экране календаря.
              </p>
            </div>
          )}
        </div>

        {/* Period Stats Section */}
        <div 
          className={`border border-black/5 rounded-lg p-3 bg-[#FAF9F6]/30 cursor-pointer transition-all ${!periodStatsVisible ? 'opacity-50 line-through decoration-gray-400' : ''}`}
          onClick={() => setIsPSExpanded(!isPSExpanded)} 
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                onClick={(e) => {
                  e.stopPropagation(); 
                  setPeriodStatsVisible(!periodStatsVisible);
                }}
                className="bg-white p-1.5 rounded-md text-[#4A403A] shadow-sm border border-black/5 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                {periodStatsVisible ? <Eye size={14} /> : <EyeOff size={14} />}
              </div>
              <span className="text-sm font-semibold text-[#4A403A]">Статистика периода</span>
            </div>
            <div className="flex items-center gap-2">
              {isPSExpanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
            </div>
          </div>

          {isPSExpanded && (
            <div className="mt-3 pt-3 border-t border-black/5 pl-1 pointer-events-none">
              <p className="text-xs text-gray-500">
                Отображение задач и среднего настроения за неделю, месяц или год (зависит от режима календаря).
              </p>
            </div>
          )}
        </div>

        {/* Day Results Section */}
        <div 
          className={`border border-black/5 rounded-lg p-3 bg-[#FAF9F6]/30 cursor-pointer transition-all ${!dayResultsVisible ? 'opacity-50 line-through decoration-gray-400' : ''}`}
          onClick={() => setIsDRExpanded(!isDRExpanded)} 
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                onClick={(e) => {
                  e.stopPropagation(); 
                  setDayResultsVisible(!dayResultsVisible);
                }}
                className="bg-white p-1.5 rounded-md text-[#4A403A] shadow-sm border border-black/5 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                {dayResultsVisible ? <Eye size={14} /> : <EyeOff size={14} />}
              </div>
              <span className="text-sm font-semibold text-[#4A403A]">Результаты дня</span>
            </div>
            <div className="flex items-center gap-2">
              {isDRExpanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
            </div>
          </div>

          {isDRExpanded && (
            <div className="mt-3 pt-3 border-t border-black/5 pl-1 pointer-events-none">
              <p className="text-xs text-gray-500">
                Отображение общей сводки дня под календарем.
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions Section */}
        <div 
          className={`border border-black/5 rounded-lg p-3 bg-[#FAF9F6]/30 cursor-pointer transition-all ${!quickActionsVisible ? 'opacity-50 line-through decoration-gray-400' : ''}`}
          onClick={() => setIsQAExpanded(!isQAExpanded)} 
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                onClick={(e) => {
                  e.stopPropagation(); 
                  setQuickActionsVisible(!quickActionsVisible);
                }}
                className="bg-white p-1.5 rounded-md text-[#4A403A] shadow-sm border border-black/5 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                {quickActionsVisible ? <Eye size={14} /> : <EyeOff size={14} />}
              </div>
              <span className="text-sm font-semibold text-[#4A403A]">Быстрые действия</span>
            </div>
            <div className="flex items-center gap-2">
              {isQAExpanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
            </div>
          </div>

          {isQAExpanded && (
            <div className="mt-3 pt-3 border-t border-black/5 pointer-events-none">
              <div className="grid grid-cols-6 gap-1.5">
                {Object.values(QUICK_ACTIONS_CONFIG).map(action => {
                  const isActive = isQuickActionEnabled(action.id);
                  return (
                    <button
                      key={action.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleQuickAction(action.id);
                      }}
                      title={action.label}
                      className={`
                        aspect-square rounded-md flex flex-col items-center justify-center gap-0.5 transition-all border pointer-events-auto
                        ${isActive 
                          ? 'bg-[#E8A87C] border-[#E8A87C] text-white shadow-sm' 
                          : 'bg-white/60 border-transparent text-gray-400 hover:bg-white hover:text-gray-500'
                        }
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

      {/* Analytics Settings */}
      <div className="bg-white rounded-xl p-4 border border-black/5 shadow-sm space-y-3">
        <h3 className="text-[11px] font-bold text-[#E8A87C] uppercase tracking-wider flex items-center gap-2">
          <BarChart3 size={12} className="text-[#E8A87C]" />
          Аналитика
        </h3>
        
        <div 
          className={`border border-black/5 rounded-lg p-3 bg-[#FAF9F6]/30 cursor-pointer transition-all ${!isAnalyticsExpanded ? 'opacity-60' : ''}`}
          onClick={() => setIsAnalyticsExpanded(!isAnalyticsExpanded)}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#4A403A]">Настроить графики</span>
            <div className="flex items-center gap-2">
              {isAnalyticsExpanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
            </div>
          </div>

          {isAnalyticsExpanded && (
            <div className="mt-3 space-y-3 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#4A403A]">Основной график</span>
                <div 
                  onClick={(e) => { e.stopPropagation(); setChartsVisible(!chartsVisible); }}
                  className="p-1.5 rounded-md bg-white border-black/5 shadow-sm cursor-pointer hover:bg-gray-50"
                >
                  {chartsVisible ? <Eye size={14} className="text-[#E8A87C]" /> : <EyeOff size={14} className="text-gray-400" />}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#4A403A]">Сводные карточки</span>
                <div 
                  onClick={(e) => { e.stopPropagation(); setSummaryCardsVisible(!summaryCardsVisible); }}
                  className="p-1.5 rounded-md bg-white border-black/5 shadow-sm cursor-pointer hover:bg-gray-50"
                >
                  {summaryCardsVisible ? <PieChart size={14} className="text-[#E8A87C]" /> : <EyeOff size={14} className="text-gray-400" />}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#4A403A]">Распределение настроений</span>
                <div 
                  onClick={(e) => { e.stopPropagation(); setMoodDistributionVisible(!moodDistributionVisible); }}
                  className="p-1.5 rounded-md bg-white border-black/5 shadow-sm cursor-pointer hover:bg-gray-50"
                >
                  {moodDistributionVisible ? <PieChart size={14} className="text-[#E8A87C]" /> : <EyeOff size={14} className="text-gray-400" />}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="text-center text-[11px] text-gray-300 pt-4 uppercase tracking-wider">
        NirvanaDaily v2.2 Minimal
      </div>
    </div>
  );
}
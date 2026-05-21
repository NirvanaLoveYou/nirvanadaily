"use client";

import * as React from "react";
import { useState, useEffect, useMemo, useRef } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronDown, ChevronUp, X, Plus, Trash2 } from "lucide-react";
import { useJournal } from "@/lib/journal-context";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// --- Constants ---
const MOODS = [
  { type: 'rage' as const, emoji: '😡', label: 'Ярость' },
  { type: 'sadness' as const, emoji: '😢', label: 'Грусть' },
  { type: 'pensive' as const, emoji: '🤔', label: 'Задумчивость' },
  { type: 'calm' as const, emoji: '😌', label: 'Спокойствие' },
  { type: 'euphoria' as const, emoji: '🤩', label: 'Эйфория' },
];

export default function DayTimelineSection() {
  const { 
    currentDate, 
    data, 
    addLog, 
    deleteLog, 
    updateLog,
    addMood, 
    deleteMood,
    setEntrySectionStates,
    entrySectionStates,
    focusTarget,
    setFocusTarget,
    theme
  } = useJournal();

  // --- Local State ---
  const [newLogText, setNewLogText] = useState("");
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editLogText, setEditLogText] = useState("");

  const [timelineForceOpen, setTimelineForceOpen] = useState(false);
  const logInputRef = useRef<HTMLInputElement>(null);

  // --- Effects & Data ---
  const entryKey = format(currentDate, 'yyyy-MM-dd');
  const entry = data[entryKey] || { tasks: [], logs: [], moodLogs: [], reflections: [] };

  useEffect(() => {
    if (focusTarget === 'log') {
      setTimelineForceOpen(true);
      setTimeout(() => {
        logInputRef.current?.focus();
      }, 100);
      setFocusTarget(null);
    }
  }, [focusTarget, setFocusTarget]);

  const isTimelineOpen = entrySectionStates.timeline || timelineForceOpen;

  const timelineItems = useMemo(() => {
    return [
      ...(entry.logs || []).map(l => ({ ...l, kind: 'log' as const })),
      ...(entry.moodLogs || []).map(m => ({ ...m, kind: 'mood' as const }))
    ].sort((a, b) => a.createdAt - b.createdAt);
  }, [entry.logs, entry.moodLogs]);

  // --- Handlers ---
  const toggleSection = (key: string) => {
    if (key === 'timeline' && timelineForceOpen) {
      setTimelineForceOpen(false);
    } else {
      setEntrySectionStates(prev => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogText.trim()) return;
    addLog(newLogText);
    setNewLogText("");
  };

  const startEditingLog = (id: string, text: string) => {
    setEditingLogId(id);
    setEditLogText(text);
  };

  const saveLog = (id: string) => {
    updateLog(id, editLogText);
    setEditingLogId(null);
    setEditLogText("");
  };

  // --- Theme Helpers ---
  const getCardClass = () => {
    if (theme === 'dark') return "bg-slate-800/60 border-slate-700/50 text-slate-200";
    if (theme === 'purple') return "bg-purple-50/80 border-purple-200/50 text-purple-900";
    if (theme === 'nature') return "bg-[#E5E2D6]/80 border-[#D3CCC0]/50 text-[#2C362F]"; // Matte Nature
    return "bg-white border-black/5 text-[#4A403A]";
  };

  const getPrimaryBgOnly = () => {
    if (theme === 'purple') return 'bg-[#c084fc]';
    if (theme === 'dark') return 'bg-[#94a3b8]';
    if (theme === 'nature') return 'bg-[#3E4E3C]';
    return 'bg-[#E8A87C]';
  };

  const getInputClass = () => {
    if (theme === 'dark') return 'bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-600';
    if (theme === 'purple') return 'bg-purple-100/30 border-purple-300/50 text-purple-900 placeholder:text-purple-400';
    if (theme === 'nature') return 'bg-[#EAECE5] border-[#D3D8CF] text-[#2C362F] placeholder:text-[#5F6A63]'; // Matte Nature Input
    return 'bg-[#FAF9F6] border-black/5 text-[#4A403A] placeholder:text-gray-300';
  };

  return (
    <div className="space-y-4 pb-24 px-4 pt-2">
      {/* Mood Section */}
      <div className={`rounded-xl p-3 border shadow-sm transition-colors ${getCardClass()}`}>
        <button 
          onClick={() => toggleSection('mood')}
          className={`w-full flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-3 hover:opacity-70 transition-colors ${theme === 'dark' ? 'text-slate-500' : theme === 'purple' ? 'text-purple-400' : theme === 'nature' ? 'text-[#5F6A63]' : 'text-gray-400'}`}
        >
          <span>Настроение</span>
          {entrySectionStates.mood ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        
        {entrySectionStates.mood && (
          <div>
            <div className="flex justify-between px-1 mb-3">
              {MOODS.map(mood => (
                <button
                  key={mood.type}
                  onClick={() => addMood(mood.type)}
                  className="flex flex-col items-center gap-0.5 group opacity-60 hover:opacity-100 hover:scale-110 transition-all"
                >
                  <span className="text-2xl filter drop-shadow-sm">{mood.emoji}</span>
                </button>
              ))}
            </div>
          
            {(entry.moodLogs || []).length > 0 && (
              <div className="flex flex-wrap gap-x-2 gap-y-2">
                {(entry.moodLogs || []).map(moodLog => {
                  const moodDef = MOODS.find(m => m.type === moodLog.type);
                  return (
                    <div key={moodLog.id} className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg border ${theme === 'dark' ? 'bg-slate-900/50 border-slate-700' : theme === 'purple' ? 'bg-purple-100/50 border-purple-200' : theme === 'nature' ? 'bg-[#EAECE5] border-[#D3D8CF] text-[#5F6A63]' : 'bg-[#FAF9F6] text-gray-500'}`}>
                      <span className="text-sm">{moodDef?.emoji}</span>
                      <span className="opacity-50 font-mono">{moodLog.time}</span>
                      <button onClick={() => deleteMood(moodLog.id)} className="text-gray-400 dark:text-slate-600 hover:text-red-400 ml-auto">
                        <X size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Timeline Section */}
      <div className={`rounded-xl p-3 border shadow-sm transition-colors ${getCardClass()}`}>
        <button 
          onClick={() => toggleSection('timeline')}
          className={`w-full flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-3 hover:opacity-70 transition-colors ${theme === 'dark' ? 'text-slate-500' : theme === 'purple' ? 'text-purple-400' : theme === 'nature' ? 'text-[#5F6A63]' : 'text-gray-400'}`}
        >
          <span>События</span>
          {isTimelineOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {isTimelineOpen && (
          <div>
            <div className="space-y-2 mb-3 max-h-48 overflow-y-auto custom-scrollbar pr-1">
              {timelineItems.length === 0 && (
                <p className={`text-center text-xs italic py-4 ${theme === 'dark' ? 'text-slate-600' : theme === 'purple' ? 'text-purple-400' : theme === 'nature' ? 'text-[#5F6A63]' : 'text-gray-300'}`}>Нет событий</p>
              )}
              {timelineItems.map(item => (
                <div key={item.id} className="flex items-center gap-3 group py-1">
                  <div className={`min-w-[60px] flex items-center justify-end text-xs font-mono leading-none ${theme === 'dark' ? 'text-slate-600' : theme === 'purple' ? 'text-gray-400' : theme === 'nature' ? 'text-[#5F6A63]' : theme === 'nature' ? 'text-[#5F6A63]' : 'text-gray-400'}`}>
                    {item.time}
                  </div>
                  
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    {item.kind === 'mood' ? (
                      <>
                        <span className="text-sm leading-none flex-shrink-0">{MOODS.find(m => m.type === item.type)?.emoji}</span>
                        <span className={`text-sm leading-none ${theme === 'dark' ? 'text-slate-100' : theme === 'purple' ? 'text-purple-900' : theme === 'nature' ? 'text-[#2C362F]' : 'text-[#4A403A]'}`}>
                          {item.type === 'rage' ? 'Злюсь' : 
                           item.type === 'sadness' ? 'Грущу' :
                           item.type === 'pensive' ? 'Задумался' :
                           item.type === 'calm' ? 'Спокоен' : 'Радуюсь'}
                        </span>
                      </>
                    ) : (
                      <>
                        {editingLogId === item.id ? (
                          <Input 
                            value={editLogText}
                            onChange={(e) => setEditLogText(e.target.value)}
                            onBlur={() => saveLog(item.id)}
                            onKeyDown={(e) => { if(e.key === 'Enter') saveLog(item.id); }}
                            className={`h-7 px-2 py-0 text-sm focus-visible:ring-0 ${getInputClass()}`}
                            autoFocus
                          />
                        ) : (
                          <span 
                            onClick={() => startEditingLog(item.id, item.text)}
                            className={`text-sm leading-none break-words cursor-pointer hover:opacity-70 ${theme === 'dark' ? 'text-slate-100' : theme === 'purple' ? 'text-purple-900' : theme === 'nature' ? 'text-[#2C362F]' : 'text-[#4A403A]'}`}
                          >
                            {item.text}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {item.kind === 'log' && (
                    <div className={`flex items-center gap-1 text-gray-400 dark:text-slate-600 flex-shrink-0 pl-1`}>
                      <button onClick={() => deleteLog(item.id)} className="hover:text-red-400 p-1">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <form onSubmit={handleAddLog} className="flex items-center gap-2">
              <Input 
                ref={logInputRef}
                value={newLogText}
                onChange={(e) => setNewLogText(e.target.value)}
                placeholder="Событие..."
                className={`flex-1 h-9 px-3 focus-visible:ring-0 ${getInputClass()} ${theme === 'purple' ? 'focus-visible:border-purple-400' : theme === 'dark' ? 'focus-visible:border-[#94a3b8]' : theme === 'nature' ? 'focus-visible:border-[#3E4E3C]' : 'focus-visible:ring-[#E8A87C]'}`}
              />
              <button type="submit" className={`${getPrimaryBgOnly()} text-white p-1.5 rounded-lg hover:opacity-90 transition-colors flex-shrink-0 h-9 w-9 flex items-center justify-center`}>
                <Plus size={16} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
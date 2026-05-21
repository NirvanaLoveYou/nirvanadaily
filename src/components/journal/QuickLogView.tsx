"use client";

import { useJournal } from "@/lib/journal-context";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Plus, X, Smile } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const MOODS = [
  { type: 'rage' as const, emoji: '😡', label: 'Ярость' },
  { type: 'sadness' as const, emoji: '😢', label: 'Грусть' },
  { type: 'pensive' as const, emoji: '🤔', label: 'Задумчивость' },
  { type: 'calm' as const, emoji: '😌', label: 'Спокойствие' },
  { type: 'euphoria' as const, emoji: '🤩', label: 'Эйфория' },
];

export default function QuickLogView() {
  const { currentDate, data, addLog, addMood, deleteMood, focusTarget, setFocusTarget, setViewMode, theme } = useJournal();
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const entryKey = format(currentDate, 'yyyy-MM-dd');
  const entry = data[entryKey] || { logs: [], moodLogs: [] };

  useEffect(() => {
    if (focusTarget === 'log' && inputRef.current) {
      inputRef.current.focus();
      setFocusTarget(null);
    }
  }, [focusTarget, setFocusTarget]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addLog(text);
    setText("");
  };

  const recentLogs = [...entry.logs].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);

  const getCardClass = () => {
    return cn(
      "rounded-xl border shadow-sm transition-colors",
      theme === 'dark' ? "bg-slate-800/60 border-slate-700/50 text-slate-200" :
      theme === 'purple' ? "bg-white border-black/5 text-purple-900" :
      theme === 'nature' ? "bg-[#E5E2D6]/80 border-[#D3CCC0]/50 text-[#2C362F]" :
      "bg-white border-black/5 text-[#4A403A]"
    );
  };

  const getPrimaryBgOnly = () => {
    if (theme === 'purple') return 'bg-[#c084fc]';
    if (theme === 'dark') return 'bg-[#94a3b8]';
    if (theme === 'nature') return 'bg-[#3E4E3C]';
    return 'bg-[#E8A87C]';
  };

  const getInputClass = () => {
    return cn(
      "h-9 px-3 focus-visible:ring-0 text-xl font-medium",
      theme === 'dark' ? "bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-600" :
      theme === 'purple' ? "bg-purple-100/30 border-purple-300/50 text-purple-900 placeholder:text-purple-400" :
      theme === 'nature' ? "bg-[#EAECE5] border-[#D3D8CF] text-[#2C362F] placeholder:text-[#5F6A63]" :
      "bg-[#FAF9F6] border-black/5 text-[#4A403A] placeholder:text-gray-300"
    );
  };

  return (
    <div className="h-full flex flex-col p-4 space-y-4">
      
      {/* Mood Quick Add */}
      <div className={getCardClass()}>
        {MOODS.map(mood => (
          <button
            key={mood.type}
            onClick={() => addMood(mood.type)}
            className="text-2xl opacity-60 hover:opacity-100 hover:scale-110 transition-all active:scale-95"
          >
            {mood.emoji}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className={cn("rounded-2xl border flex-1 flex flex-col justify-center p-4 shadow-inner transition-colors",
        theme === 'dark' ? 'bg-slate-900/50 border-slate-700' : 
        theme === 'purple' ? 'bg-[#FAF9F6] border-black/5' : 
        theme === 'nature' ? 'bg-[#E9E6DB] border-[#D3CCC0]' : 
        'bg-[#FAF9F6] border-black/5'
      )}>
        <form onSubmit={handleSubmit} className="relative w-full">
          <Input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Что происходит?"
            className="bg-transparent text-xl font-medium border-none focus-visible:ring-0 px-0 py-2 resize-none h-auto placeholder:text-gray-300"
            autoComplete="off"
          />
          <div className="absolute right-0 top-0 h-full flex items-center">
            <button 
              type="submit" 
              disabled={!text.trim()}
              className={cn(getPrimaryBgOnly(), "text-white p-2 rounded-xl hover:opacity-90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-sm flex-shrink-0 h-9 w-9 flex items-center justify-center")}
            >
              <Plus size={16} />
            </button>
          </div>
        </form>
      </div>

      {/* Recent Logs */}
      {recentLogs.length > 0 && (
        <div className="space-y-3 pb-20">
          <h3 className={cn("text-xs font-bold uppercase tracking-wider mb-3", theme === 'dark' ? "text-slate-500" : theme === 'purple' ? "text-purple-400" : theme === 'nature' ? "text-[#5F6A63]" : "text-gray-400")}>Только что</h3>
          <div className="space-y-2">
            {recentLogs.map(log => (
              <div key={log.id} className={cn("flex items-start gap-3 text-sm p-3 rounded-lg border",
                 theme === 'dark' ? "bg-slate-800/40 border-slate-700/30 text-slate-200" : 
                 theme === 'purple' ? "bg-white border-black/5 text-purple-900" : 
                 theme === 'nature' ? "bg-[#E5E2D6] border-[#D3CCC0] text-[#2C362F]" : 
                 "bg-white border-black/5 text-[#4A403A]"
              )}>
                <span className={cn("font-mono text-xs mt-0.5", theme === 'dark' ? "text-slate-500" : theme === 'purple' ? "text-gray-300" : theme === 'nature' ? "text-[#5F6A63]" : "text-gray-300")}>{log.time}</span>
                <span className="flex-1 leading-tight">{log.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
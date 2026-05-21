"use client";

import { useJournal } from "@/lib/journal-context";
import DayTimelineSection from "./DayTimelineSection";
import DayTasksAndNotes from "./DayTasksAndNotes";
import { ChevronLeft } from "lucide-react";
import { format } from "date-fns";

export default function DayDetailView() {
  const { setViewMode, theme } = useJournal();

  const getPrimaryText = () => {
    if (theme === 'purple') return 'text-[#c084fc]';
    if (theme === 'dark') return 'text-[#94a3b8]';
    if (theme === 'nature') return 'text-[#5F7161]';
    return 'text-[#E8A87C]';
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Back Button */}
      <button 
        onClick={() => setViewMode('month')}
        className={`text-xs font-medium mb-2 px-4 pt-2 hover:opacity-70 ${getPrimaryText()}`}
      >
        ← Назад в календарь
      </button>

      {/* Timeline and Mood Section */}
      <DayTimelineSection />

      {/* Tasks and Notes Section */}
      <DayTasksAndNotes />
      
      {/* Spacer for bottom padding */}
      <div className="h-10" />
    </div>
  );
}
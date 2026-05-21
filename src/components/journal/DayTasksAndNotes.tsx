"use client";

import DayTasksSection from "./DayTasksSection";
import DayNotesSection from "./DayNotesSection";

export default function DayTasksAndNotes() {
  return (
    <div className="space-y-4 pb-24 px-4 pt-2">
      <DayTasksSection />
      <DayNotesSection />
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// --- Constants & Math ---
const RADIUS = 120;
const HOUR_RADIUS = 70; // Smaller radius for numbers
const CENTER = 140; // Canvas size 280x280

// Helper to get coordinates for a number on a clock face
const getCoordinates = (value: number, max: number, radius: number) => {
  const angle = (value / max) * 2 * Math.PI - Math.PI / 2;
  const x = CENTER + radius * Math.cos(angle);
  const y = CENTER + radius * Math.sin(angle);
  return { x, y };
};

type AnalogClockPickerProps = {
  value: string; // "HH:MM"
  onChange: (time: string) => void;
  theme: 'light' | 'dark' | 'purple';
};

export default function AnalogClockPicker({ value, onChange, theme }: AnalogClockPickerProps) {
  const [mode, setMode] = useState<'hour' | 'minute'>('hour');
  const [selectedHour, setSelectedHour] = useState(0);
  const [selectedMinute, setSelectedMinute] = useState(0);

  // Parse initial value
  useEffect(() => {
    const [h, m] = value.split(':').map(Number);
    setSelectedHour(h);
    setSelectedMinute(m);
  }, [value]);

  const handleHourClick = (hour: number) => {
    setSelectedHour(hour);
    setMode('minute');
  };

  const handleMinuteClick = (minute: number) => {
    setSelectedMinute(minute);
    // Save and exit could happen here if we wanted, but user might want to review
    const h = selectedHour.toString().padStart(2, '0');
    const m = minute.toString().padStart(2, '0');
    onChange(`${h}:${m}`);
  };

  const getColor = () => {
    if (theme === 'purple') return 'text-[#c084fc] stroke-[#c084fc]';
    if (theme === 'dark') return 'text-[#94a3b8] stroke-[#94a3b8]';
    return 'text-[#E8A87C] stroke-[#E8A87C]';
  };

  const getActiveFill = () => {
    if (theme === 'purple') return 'bg-[#c084fc]';
    if (theme === 'dark') return 'bg-[#94a3b8]';
    return 'bg-[#E8A87C]';
  };

  const getClockFace = () => {
    if (theme === 'purple') return 'bg-white border-purple-200 text-purple-900';
    if (theme === 'dark') return 'bg-slate-900 border-slate-800 text-slate-200';
    return 'bg-white border-black/5 text-[#4A403A]';
  };

  // Generate Hours (1-12)
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  // Generate Minutes (0, 5, 10...)
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-4">
      
      {/* Digital Display */}
      <div className={cn("text-4xl font-bold tabular-nums tracking-tighter transition-colors", getColor())}>
        {selectedHour.toString().padStart(2, '0')}:{selectedMinute.toString().padStart(2, '0')}
      </div>

      {/* Analog Clock SVG */}
      <div className="relative w-[280px] h-[280px]">
        <svg width="280" height="280" viewBox="0 0 280 280" className={cn("w-full h-full transition-colors", getClockFace(), "rounded-full border-2 shadow-xl")}>
          
          {/* Center Dot */}
          <circle cx={CENTER} cy={CENTER} r="4" fill={theme === 'dark' ? '#94a3b8' : '#E8A87C'} />

          {/* --- HOUR MODE --- */}
          {mode === 'hour' && hours.map(h => {
            const { x, y } = getCoordinates(h, 12, HOUR_RADIUS);
            const isSelected = h === (selectedHour % 12 || 12);
            return (
              <g key={h} className="cursor-pointer group">
                <circle 
                  cx={x} 
                  cy={y} 
                  r={isSelected ? 24 : 18} 
                  fill={isSelected ? getActiveFill() : 'transparent'}
                  className={cn("transition-all duration-200", !isSelected && "group-hover:fill-black/5 dark:group-hover:fill-white/10")}
                />
                <text 
                  x={x} 
                  y={y} 
                  dy=".35em" 
                  textAnchor="middle" 
                  fontSize="14" 
                  fontWeight={isSelected ? "700" : "500"}
                  className={cn("select-none transition-colors", isSelected ? "fill-white" : "fill-current")}
                  onClick={() => handleHourClick(h)}
                >
                  {h}
                </text>
              </g>
            );
          })}

          {/* --- MINUTE MODE --- */}
          {mode === 'minute' && minutes.map(m => {
            const { x, y } = getCoordinates(m, 60, RADIUS - 10); // Slightly smaller radius
            const isSelected = m === selectedMinute;
            return (
              <g key={m} className="cursor-pointer group">
                {/* Connection line for visual flair (optional) */}
                {isSelected && <line x1={CENTER} y1={CENTER} x2={x} y2={y} stroke={theme === 'purple' ? '#c084fc' : theme === 'dark' ? '#94a3b8' : '#E8A87C'} strokeWidth="1" strokeDasharray="4 4" />}
                
                <circle 
                  cx={x} 
                  cy={y} 
                  r={isSelected ? 20 : 14} 
                  fill={isSelected ? getActiveFill() : 'transparent'}
                  className={cn("transition-all duration-200", !isSelected && "group-hover:fill-black/5 dark:group-hover:fill-white/10")}
                />
                <text 
                  x={x} 
                  y={y} 
                  dy=".35em" 
                  textAnchor="middle" 
                  fontSize="12" 
                  fontWeight={isSelected ? "700" : "500"}
                  className={cn("select-none transition-colors", isSelected ? "fill-white" : "fill-current")}
                  onClick={() => handleMinuteClick(m)}
                >
                  {m.toString().padStart(2, '0')}
                </text>
              </g>
            );
          })}

          {/* Center Text for Mode Indicator */}
          <text 
            x={CENTER} 
            y={CENTER + 50} 
            textAnchor="middle" 
            fontSize="10" 
            className="fill-current opacity-50 uppercase tracking-widest font-bold"
          >
            {mode === 'hour' ? 'Часы' : 'Минуты'}
          </text>
        </svg>
      </div>
    </div>
  );
}
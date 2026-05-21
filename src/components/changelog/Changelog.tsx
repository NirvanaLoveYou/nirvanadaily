"use client";

import { CheckCircle2, Info, Heart, MessageCircle, Send, Sparkles, Coffee } from "lucide-react";
import { useJournal } from "@/lib/journal-context";
import { cn } from "@/lib/utils";
import { useState } from "react";

const CHANGELOG_DATA = [
  {
    version: "2.6.0",
    date: "Ноябрь 2024",
    items: [
      { type: "feature", text: "Добавлен профиль создателя с контактами" },
      { type: "improvement", text: "Переработан раздел 'История версий'" },
      { type: "improvement", text: "Улучшена доступность интерфейса" },
      { type: "fix", text: "Оптимизация производительности при большом объеме данных" }
    ]
  },
  {
    version: "2.5.2",
    date: "Октябрь 2024",
    items: [
      { type: "feature", text: "Новая тема оформления 'Nature'" },
      { type: "improvement", text: "Добавлены аналоговые часы для выбора времени" },
      { type: "fix", text: "Исправлена синхронизация уведомлений" }
    ]
  },
  {
    version: "2.5.1",
    date: "Сентябрь 2024",
    items: [
      { type: "feature", text: "Добавлены красивые графики аналитики" },
      { type: "feature", text: "Добавлен новый раздел 'Запись'" },
      { type: "feature", text: "Создана страница пользователя с обновлениями" },
      { type: "improvement", text: "Улучшен дизайн карточек задач" }
    ]
  },
  {
    version: "2.5.0",
    date: "Август 2024",
    items: [
      { type: "feature", text: "Полное перерождение дизайна приложения" },
      { type: "feature", text: "Новая архитектура данных" },
      { type: "improvement", text: "Ускорена работа календаря" },
      { type: "improvement", text: "Добавлена поддержка тем" }
    ]
  },
  {
    version: "2.0.0",
    date: "Июль 2024",
    items: [
      { type: "feature", text: "Запуск платформы NirvanaDaily" },
      { type: "feature", text: "Базовый функционал: Задачи, Заметки, Календарь" },
      { type: "feature", text: "Трекер настроения" }
    ]
  }
];

type ChangeType = 'feature' | 'improvement' | 'fix';

const Badge = ({ type }: { type: ChangeType }) => {
  const config = {
    feature: { label: 'Новое', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    improvement: { label: 'Улучшено', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
    fix: { label: 'Исправлено', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' }
  };
  const { label, color } = config[type];
  return (
    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${color}`}>
      {label}
    </span>
  );
};

export default function Changelog() {
  const { theme } = useJournal();
  const [showCreator, setShowCreator] = useState(true);

  // Theme Helpers
  const getCardBg = () => {
    if (theme === 'dark') return 'bg-slate-800/40 border-slate-700/50';
    if (theme === 'purple') return 'bg-white border-purple-200/50';
    if (theme === 'nature') return 'bg-[#E5E2D6]/80 border-[#D3CCC0]/50';
    return 'bg-white border-black/5';
  };

  const getMainText = () => {
    if (theme === 'dark') return 'text-slate-100';
    if (theme === 'purple') return 'text-purple-900';
    if (theme === 'nature') return 'text-[#2C362F]';
    return 'text-[#4A403A]';
  };

  const getMutedText = () => {
    if (theme === 'dark') return 'text-slate-500';
    if (theme === 'purple') return 'text-purple-400';
    if (theme === 'nature') return 'text-[#5F6A63]';
    return 'text-gray-400';
  };

  const getPrimaryBg = () => {
    if (theme === 'purple') return 'bg-[#c084fc] hover:bg-[#b074e8]';
    if (theme === 'dark') return 'bg-[#94a3b8] hover:bg-[#a5b4c9]';
    if (theme === 'nature') return 'bg-[#3E4E3C] hover:bg-[#344133]';
    return 'bg-[#E8A87C] hover:bg-[#d49a6d]';
  };

  const getPrimaryText = () => {
    if (theme === 'purple') return 'text-[#c084fc]';
    if (theme === 'dark') return 'text-[#94a3b8]';
    if (theme === 'nature') return 'text-[#8B6C5E]';
    return 'text-[#E8A87C]';
  };

  return (
    <div className="space-y-8 pb-24 pt-4 px-4 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className={cn("text-2xl font-black tracking-tight", getMainText())}>История версий</h2>
        <div className={cn("flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border shadow-sm", getPrimaryText(), getCardBg())}>
          <Info size={12} />
          v2.6.0
        </div>
      </div>

      {/* Creator Profile Section */}
      <div className={cn("rounded-2xl p-5 border shadow-sm transition-all", getCardBg())}>
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0",
            theme === 'purple' ? 'bg-gradient-to-br from-purple-400 to-fuchsia-500' : 
            theme === 'dark' ? 'bg-gradient-to-br from-slate-600 to-slate-800' : 
            theme === 'nature' ? 'bg-gradient-to-br from-[#3E4E3C] to-[#2C362F]' : 
            'bg-gradient-to-br from-[#E8A87C] to-[#d97706]'
          )}>
            N
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={cn("text-lg font-bold truncate", getMainText())}>Okey</h3>
              <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-black/5 dark:bg-white/5", getMutedText())}>
                Creator
              </span>
            </div>
            
            <p className={cn("text-sm leading-relaxed mb-4", getMutedText())}>
              Привет! Я разработчик <strong>NirvanaDaily</strong>. Моя цель — создать инструменты, которые помогают находить баланс и спокойствие в хаосе повседневной жизни. Это приложение — мой личный вклад в мир продуктивности без стресса.
            </p>

            <div className="flex items-center gap-3">
              <a 
                href="https://t.me/okeycn" 
                target="_blank" 
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 shadow-sm",
                  getPrimaryBg(), "text-white"
                )}
              >
                <Send size={14} />
                Написать в Telegram
              </a>
              
              <button className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 border",
                getCardBg(), getMainText()
              )}>
                <Coffee size={14} />
                Поддержать проект
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {CHANGELOG_DATA.map((release) => (
          <div key={release.version} className="relative group">
            {/* Connector Line */}
            <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-gray-100 last:hidden dark:bg-slate-800 transition-colors group-hover:bg-gray-200 dark:group-hover:bg-slate-700" />
            
            <div className="flex items-start gap-4 relative z-10">
              {/* Version Dot */}
              <div className="flex-shrink-0">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md border-2 transition-transform group-hover:scale-110",
                  theme === 'dark' ? 'bg-slate-700 border-slate-800' : 
                  theme === 'purple' ? 'bg-purple-500 border-purple-100' : 
                  theme === 'nature' ? 'bg-[#5F7161] border-[#E9E6DB]' : 
                  'bg-[#E8A87C] border-[#FAF9F6]'
                )}>
                  {release.version.split('.')[1]}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-3 mb-3">
                  <h3 className={cn("text-lg font-bold", getMainText())}>Версия {release.version}</h3>
                  <span className={cn("text-xs font-medium", getMutedText())}>{release.date}</span>
                </div>
                
                <div className={cn("rounded-xl p-4 border shadow-sm space-y-2.5", getCardBg())}>
                  {release.items.map((item, idx) => (
                    <div key={idx} className={cn("flex items-start gap-3 text-sm", getMainText())}>
                      <div className={cn("mt-0.5 opacity-60", getPrimaryText())}>
                        {item.type === 'feature' && <Sparkles size={14} />}
                        {item.type === 'improvement' && <CheckCircle2 size={14} />}
                        {item.type === 'fix' && <Info size={14} />}
                      </div>
                      <div className="flex-1 leading-relaxed">
                        <Badge type={item.type} />
                        <span className="ml-2 opacity-90">{item.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className={cn("text-center pt-8 border-t border-dashed", getMutedText())}>
        <p className="text-[11px] font-medium mb-2 flex items-center justify-center gap-1">
          Сделано с <Heart size={10} className="text-red-400 fill-red-400 animate-pulse" /> для вас
        </p>
        <p className="text-[10px] uppercase tracking-widest opacity-50">
          NirvanaDaily © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
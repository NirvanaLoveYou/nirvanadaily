"use client";

import { useState } from "react";
import { Folder, X, Plus, MoreHorizontal, Pencil, Trash2, FileStack, ChevronDown, ChevronUp } from "lucide-react"; // Added FileStack, Trash2
import { useJournal } from "@/lib/journal-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function DayNotesSection() {
  const { 
    currentDate, 
    data, 
    addReflection, 
    deleteReflection, 
    updateReflection,
    setEntrySectionStates,
    entrySectionStates,
    theme,
    noteCategories,
    addNoteCategory,
    updateNoteCategory,
    deleteNoteCategory,
  } = useJournal();

  const [newTitle, setNewTitle] = useState("");
  const [newText, setNewText] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editText, setEditText] = useState("");
  
  // State to toggle visibility of input form
  const [isAdding, setIsAdding] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState("default_personal");
  const [isCreatingCat, setIsCreatingCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [showAllCats, setShowAllCats] = useState(false);

  const [managingCat, setManagingCat] = useState("");
  const [isManaging, setIsManaging] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);

  const entryKey = currentDate.toISOString().split('T')[0];
  const entry = data[entryKey] || { tasks: [], logs: [], reflections: [], moodLogs: [] };

  // Group reflections by category
  const groupedReflections = (entry.reflections || []).reduce((acc: Record<string, any[]>, ref: any) => {
    const cat = ref.category || 'Без категории';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ref);
    return acc;
  }, {});

  const handleStartAdd = () => {
    setIsAdding(true);
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewTitle("");
    setNewText("");
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    addReflection(newText, selectedCategory, newTitle);
    setNewTitle("");
    setNewText("");
    setIsAdding(false);
  };

  const startEdit = (ref: any) => {
    setEditId(ref.id);
    setEditTitle(ref.title || "");
    setEditText(ref.text);
    setIsAdding(false);
  };

  const saveEdit = () => {
    if (!editId) return;
    updateReflection(editId, editText, editTitle);
    setEditId(null);
    setEditTitle("");
    setEditText("");
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditTitle("");
    setEditText("");
  };

  const handleCreateCat = () => {
    if (newCatName.trim()) {
      addNoteCategory(newCatName.trim());
      setSelectedCategory(newCatName.trim());
      setIsCreatingCat(false);
      setNewCatName("");
    }
  };

  const handleRenameCat = () => {
    if (managingCat.trim() && managingCat !== selectedCategory) {
      updateNoteCategory(selectedCategory, managingCat.trim());
      setSelectedCategory(managingCat.trim());
      setIsManaging(false);
      setManagingCat("");
      setCategoryMenuOpen(false);
    }
  };

  const handleDeleteCat = () => {
    if (confirm(`Удалить категорию "${selectedCategory}"?`)) {
      deleteNoteCategory(selectedCategory);
      setSelectedCategory("Личные");
      setIsManaging(false);
      setCategoryMenuOpen(false);
    }
  };

  // Styles
  const isDark = theme === 'dark';
  const isPurple = theme === 'purple';
  const isNature = theme === 'nature';

  const textMain = isDark ? "text-slate-100" : isPurple ? "text-purple-900" : isNature ? "text-[#2C362F]" : "text-[#4A403A]";
  const textMuted = isDark ? "text-slate-500" : isPurple ? "text-purple-400" : isNature ? "text-[#5F6A63]" : "text-gray-400";
  const borderBase = isDark ? "border-slate-700" : isPurple ? "border-purple-200" : isNature ? "border-[#D3CCC0]" : "border-black/5";
  
  const primaryColor = isPurple ? "#c084fc" : isDark ? "#94a3b8" : isNature ? "#3E4E3C" : "#E8A87C";

  const getCardBg = () => {
     return cn(
      "rounded-xl p-3 border shadow-sm transition-colors",
      isDark ? "bg-slate-800/60 border-slate-700/50" :
      isPurple ? "bg-purple-50/80 border-purple-200/50" :
      isNature ? "bg-[#E5E2D6]/80 border-[#D3CCC0]/50" :
      "bg-white border-black/5"
    );
  };

  const getInputClass = () => {
    if (isDark) return 'bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-600';
    if (isPurple) return 'bg-purple-100/30 border-purple-300/50 text-purple-900 placeholder:text-purple-400';
    if (isNature) return 'bg-[#EAECE5] border-[#D3D8CF] text-[#2C362F] placeholder:text-[#5F6A63]';
    return 'bg-[#FAF9F6] border-black/5 text-[#4A403A] placeholder:text-gray-300';
  }

  return (
    <div className={getCardBg()}>
      
      <button 
        onClick={() => setEntrySectionStates(prev => ({ ...prev, reflections: !prev.reflections }))}
        className={cn("w-full flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-3 hover:opacity-70 transition-colors", textMuted)}
      >
        <span>Заметки</span>
        {entrySectionStates.reflections ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {entrySectionStates.reflections && (
        <div className="space-y-6 mb-4">
          {Object.keys(groupedReflections).length === 0 && !isAdding && (
             <p className={cn("text-center text-xs italic py-2", textMuted)}>Нет заметок</p>
          )}

          {Object.entries(groupedReflections).map(([catId, refs]) => {
            // Get category name from context, fallback to ID (should not happen but safe)
            const catName = noteCategories.find(c => c.id === catId)?.name || 'Без категории';
            
            return (
              <div key={catId} className="space-y-3">
                {/* Category Header */}
                <div className={cn("flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider", textMuted)}>
                  {catId === 'default_personal' && <FileStack size={10} />}
                  {catId === 'default_work' && <FileStack size={10} />}
                  <Folder size={10} className={catId.includes('default') ? 'hidden' : ''} />
                  {catName}
                </div>
                
                {/* Notes List - Simple Text Stream */}
                <div className="space-y-2 pl-1">
                  {refs.map((ref: any) => (
                    <div key={ref.id} className="group relative">
                      {editId === ref.id ? (
                        <div className="space-y-2 p-2 -m-2 rounded border border-dashed border-black/10">
                           <Input 
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              placeholder="Заголовок"
                              className={cn("h-7 text-xs border-none bg-transparent p-0 focus-visible:ring-0", textMain)}
                           />
                           <Textarea 
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className={cn("text-sm border-none bg-transparent p-0 focus-visible:ring-0 resize-none", textMain)}
                              rows={2}
                              autoFocus
                           />
                           <div className="flex gap-2 justify-end">
                              <Button onClick={saveEdit} size="sm" className="h-6 px-2 text-[10px]" style={{backgroundColor: primaryColor, color: 'white'}}>ОК</Button>
                              <Button onClick={cancelEdit} variant="ghost" size="sm" className="h-6 px-2 text-[10px]">✕</Button>
                           </div>
                        </div>
                      ) : (
                        <div onClick={() => startEdit(ref)} className="cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors p-1 rounded -m-1">
                          {ref.title && (
                            <div className={cn("font-bold text-xs mb-0.5 leading-tight", textMain)}>{ref.title}</div>
                          )}
                          <div className={cn("text-sm leading-relaxed break-words", textMain, "opacity-90")}>
                            {ref.text}
                          </div>
                        </div>
                      )}

                      {/* Actions - Top Right, Hover Visible */}
                      <div className={cn(
                        "absolute top-0 right-0 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none"
                      )}>
                         <button 
                           onClick={(e) => { e.stopPropagation(); startEdit(ref); }}
                           className="pointer-events-auto p-1 text-gray-400 hover:text-black dark:hover:text-white rounded hover:bg-black/5 dark:hover:bg-white/10"
                         >
                           <Pencil size={12} />
                         </button>
                         <button 
                           onClick={(e) => { e.stopPropagation(); if(confirm('Удалить?')) deleteReflection(ref.id); }}
                           className="pointer-events-auto p-1 text-gray-400 hover:text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                         >
                           <Trash2 size={12} />
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* INPUT FORM - Visible only when adding */}
      {isAdding && (
        <div className="space-y-2 mb-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
           <Input 
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Заголовок"
              className={cn("h-7 text-xs border-none bg-transparent p-0 focus-visible:ring-0 placeholder:text-gray-300", textMain)}
           />
           <Textarea 
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Текст заметки..."
              className={cn("text-sm border-none bg-transparent p-0 focus-visible:ring-0 resize-none placeholder:text-gray-300", textMain)}
              rows={2}
              autoFocus
           />
           <div className="flex gap-2 justify-end pt-1">
              <Button onClick={handleCancelAdd} size="sm" variant="ghost" className="h-7 text-[10px] px-3">Отмена</Button>
              <Button onClick={handleAdd} size="sm" style={{backgroundColor: primaryColor}} className="h-7 text-[10px] px-3 hover:opacity-90 text-white">Создать</Button>
           </div>
        </div>
      )}

      <div className={cn("h-px my-3 border-dashed", borderBase, "border-opacity-50")} />

      {/* BOTTOM CONTROLS - Always Visible */}
      <div className="flex items-center justify-between">
        <Popover open={categoryMenuOpen} onOpenChange={setCategoryMenuOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" className="p-2 h-auto" style={{ color: primaryColor }}>
              <Folder size={16} />
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className={cn("w-56 p-2 shadow-xl rounded-xl border-none", isDark ? 'bg-slate-900' : isPurple ? 'bg-white' : isNature ? 'bg-[#E5E2D6]' : 'bg-white')} 
            align="start"
          >
            <div className="space-y-1">
              {isCreatingCat ? (
                <div className="flex gap-2">
                  <Input 
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Название..."
                    className={cn("h-8 text-sm border-none bg-transparent p-0 focus-visible:ring-0", textMain)}
                    autoFocus
                  />
                  <Button onClick={handleCreateCat} size="sm" style={{ backgroundColor: primaryColor }} className="h-8 px-2 text-white">OK</Button>
                </div>
              ) : (
                <>
                  {(showAllCats ? noteCategories : noteCategories.slice(0, 2)).map(cat => {
                    const isActive = selectedCategory === cat;
                    return (
                      <div key={cat} className="relative">
                        <button
                          type="button"
                          onClick={() => { setSelectedCategory(cat); setCategoryMenuOpen(false); }}
                          className={cn(`
                            w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-md transition-colors
                          `,
                            isActive 
                              ? `${textMain} font-medium` 
                              : `hover:bg-black/5 ${textMuted}`
                          )}
                          style={isActive ? { backgroundColor: primaryColor + '15', color: primaryColor } : {}}
                        >
                          <span className="flex items-center gap-2">
                             <FileStack size={12} />
                             {cat}
                          </span>
                          {isActive && (
                            <span 
                              onClick={(e) => { e.stopPropagation(); setIsManaging(!isManaging); }}
                              className="p-0.5 hover:bg-black/10 rounded cursor-pointer"
                            >
                              <MoreHorizontal size={12} />
                            </span>
                          )}
                        </button>
                        
                        {isActive && isManaging && (
                          <div className={cn("absolute left-full top-0 ml-1 w-32 p-1 shadow-lg rounded-lg border z-50", isDark ? 'bg-slate-900 border-slate-700' : isPurple ? 'bg-white border-purple-200' : isNature ? 'bg-[#E5E2D6] border-[#D3CCC0]' : 'bg-white border-black/5')}>
                            <Input 
                              value={managingCat}
                              onChange={(e) => setManagingCat(e.target.value)}
                              placeholder="Новое имя"
                              className={cn("h-8 text-xs border-none bg-transparent p-1 focus-visible:ring-0", textMain)}
                            />
                            <Button onClick={handleRenameCat} size="sm" variant="ghost" className="w-full justify-start text-xs h-7 px-2">Переименовать</Button>
                            <Button onClick={handleDeleteCat} size="sm" variant="ghost" className="w-full justify-start text-xs h-7 px-2 text-red-500">Удалить</Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {noteCategories.length > 2 && (
                    <Button type="button" variant="ghost" onClick={() => setShowAllCats(!showAllCats)} className="w-full justify-center text-xs h-7">
                      {showAllCats ? "Свернуть" : `Еще ${noteCategories.length - 2}`}
                    </Button>
                  )}
                  <Button type="button" variant="ghost" onClick={() => setIsCreatingCat(true)} className="w-full justify-start text-xs h-7 text-muted-foreground">
                    + Создать категорию
                  </Button>
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <div className="flex items-center gap-2">
           {isAdding && (
             <Button type="button" variant="ghost" onClick={handleCancelAdd} className="h-8 w-8 p-0 rounded-lg" style={{color: textMuted}}>
               <X size={16} />
             </Button>
           )}
           <button 
             type={isAdding ? "submit" : "button"} 
             onClick={!isAdding ? handleStartAdd : undefined}
             style={{ backgroundColor: primaryColor }} 
             className="hover:opacity-90 text-white p-2 rounded-lg transition-colors"
           >
             <Plus size={16} />
           </button>
        </div>
      </div>
    </div>
  );
}
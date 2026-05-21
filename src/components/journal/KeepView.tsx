"use client";

import { useState, useMemo } from "react";
import { useJournal } from "@/lib/journal-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Trash2, Pencil, Folder, FileStack } from "lucide-react"; // Standard icons

const NOTE_COLORS = [
  { id: 'white', value: '#FFFFFF', label: 'White' },
  { id: 'cream', value: '#FAF9F6', label: 'Cream' },
  { id: 'terracotta', value: '#E8A87C', label: 'Terracotta' },
  { id: 'lavender', value: '#c084fc', label: 'Lavender' },
  { id: 'sage', value: '#84cc16', label: 'Sage' },
  { id: 'blue', value: '#bae6fd', label: 'Blue' },
  { id: 'rose', value: '#fda4af', label: 'Rose' },
  { id: 'dark', value: '#e2e8f0', label: 'Grey' }, 
];

const TRASH_ID = 'trash';

export default function KeepView() {
  const { 
    data, 
    addReflection, 
    updateReflection, 
    softDeleteReflection, 
    restoreReflection,
    permanentDeleteReflection,
    noteCategories, 
    addNoteCategory,
    updateNoteCategory,
    deleteNoteCategory,
    theme
  } = useJournal();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar State (Closed by default)
  
  // Form State
  const [noteTitle, setNoteTitle] = useState("");
  const [noteText, setNoteText] = useState("");
  const [noteCategory, setNoteCategory] = useState("default_personal");
  const [noteColor, setNoteColor] = useState(NOTE_COLORS[0].value);

  // Category Management State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [catName, setCatName] = useState("");
  const [catColor, setCatColor] = useState(NOTE_COLORS[0].value);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  // --- DATA AGGREGATION ---
  const allNotes = useMemo(() => {
    const notes: any[] = [];
    Object.keys(data).forEach(key => {
      const entry = data[key];
      if (entry && entry.reflections) {
        entry.reflections.forEach(ref => {
          notes.push({ ...ref, dateKey: key });
        });
      }
    });
    return notes.sort((a, b) => b.createdAt - a.createdAt);
  }, [data]);

  const filteredNotes = useMemo(() => {
    return allNotes.filter(note => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        note.title?.toLowerCase().includes(query) || 
        note.text.toLowerCase().includes(query);
      if (!matchesSearch) return false;

      if (selectedCategoryId === TRASH_ID) {
        return note.isDeleted === true;
      } else {
        if (note.isDeleted) return false;
        if (selectedCategoryId === 'all') return true;
        return note.category === selectedCategoryId;
      }
    });
  }, [allNotes, searchQuery, selectedCategoryId]);

  // --- HANDLERS ---

  const handleOpenCreate = () => {
    setEditingNote(null);
    setNoteTitle("");
    setNoteText("");
    setNoteCategory(selectedCategoryId === 'all' || selectedCategoryId === TRASH_ID ? "default_personal" : selectedCategoryId);
    setNoteColor(NOTE_COLORS[1].value); 
    setIsNoteModalOpen(true);
  };

  const handleOpenEdit = (note: any) => {
    setEditingNote(note);
    setNoteTitle(note.title || "");
    setNoteText(note.text);
    setNoteCategory(note.category || "default_personal");
    setNoteColor(note.color || NOTE_COLORS[0].value);
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = () => {
    if (!noteText.trim()) return;
    if (editingNote) {
      updateReflection(editingNote.id, noteText, noteTitle, noteColor);
    } else {
      addReflection(noteText, noteCategory, noteTitle, noteColor);
    }
    setIsNoteModalOpen(false);
  };

  const handleDeleteClick = (note: any) => {
    if (note.isDeleted) {
      if (confirm("Удалить заметку навсегда?")) {
        permanentDeleteReflection(note.id);
      }
    } else {
      softDeleteReflection(note.id);
    }
  };

  const handleRestore = (note: any) => {
    restoreReflection(note.id);
  };

  // Category Handlers
  const handleOpenCategoryModal = (catId?: string) => {
    setIsSidebarOpen(false); // Close sidebar when opening modal
    if (catId) {
      const cat = noteCategories.find(c => c.id === catId);
      if (cat) {
        setEditingCategoryId(catId);
        setCatName(cat.name);
        setCatColor(cat.color);
      }
    } else {
      setEditingCategoryId(null);
      setCatName("");
      setCatColor(NOTE_COLORS[1].value);
    }
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = () => {
    if (!catName.trim()) return;
    if (editingCategoryId) {
      updateNoteCategory(editingCategoryId, { name: catName, color: catColor });
    } else {
      const newCat = {
        id: `cat_${Date.now()}`,
        name: catName,
        color: catColor
      };
      addNoteCategory(newCat);
    }
    setIsCategoryModalOpen(false);
  };

  const handleDeleteCategory = () => {
    if (!editingCategoryId) return;
    if (confirm("Удалить категорию? Выберите действие в следующем окне.")) {
      const deleteNotes = confirm(`Удалить заметки в "${catName}" навсегда?\n\nОК - Удалить заметки\nОтмена - Перенести в "Без категории"`);
      deleteNoteCategory(editingCategoryId, deleteNotes);
      setIsCategoryModalOpen(false);
      if (selectedCategoryId === editingCategoryId) setSelectedCategoryId('all');
    }
  };

  // --- STYLES ---
  const getContainerBg = () => theme === 'dark' ? 'bg-slate-950' : 'bg-[#F2F0E9]';
  const getSidebarBg = () => theme === 'dark' ? 'bg-slate-900' : 'bg-white';
  const getSidebarBorder = () => theme === 'dark' ? 'border-slate-800' : 'border-black/5';
  const getActiveCategoryBg = () => theme === 'dark' ? 'bg-slate-800 text-slate-100' : 'bg-black/5 text-[#4A403A]';
  const getInactiveCategoryText = () => theme === 'dark' ? 'text-slate-400' : 'text-gray-500';
  
  return (
    <div className={cn("h-full flex flex-col relative overflow-hidden transition-colors", getContainerBg())}>
      
      {/* --- SIDEBAR OVERLAY (Black drop) --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* --- SIDEBAR (Fixed, Sliding) --- */}
      <div className={cn(
        "fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 transition-transform duration-300 ease-in-out flex flex-col",
        // Mobile & Desktop behavior: Default hidden (translate-x-full), Slide in (translate-x-0)
        "transform -translate-x-full",
        isSidebarOpen && "translate-x-0"
      )}>
        {/* Header */}
        <div className={cn("p-3 border-b flex items-center justify-between", getSidebarBorder())}>
          <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Папки</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>
        
        {/* Scrollable Categories - COMPACT */}
        <div className="flex-1 overflow-y-auto p-1 space-y-0.5">
          
          {/* All Notes */}
          <button
            onClick={() => { setSelectedCategoryId('all'); setIsSidebarOpen(false); }}
            className={cn(
              "w-full text-left px-2 py-1.5 rounded flex items-center gap-2 transition-colors text-xs",
              selectedCategoryId === 'all' ? getActiveCategoryBg() : "hover:bg-black/5 " + getInactiveCategoryText()
            )}
          >
            <FileStack size={14} />
            <span className="font-medium truncate">Все заметки</span>
          </button>

          {/* Trash */}
          <button
            onClick={() => { setSelectedCategoryId(TRASH_ID); setIsSidebarOpen(false); }}
            className={cn(
              "w-full text-left px-2 py-1.5 rounded flex items-center gap-2 transition-colors text-xs",
              selectedCategoryId === TRASH_ID ? getActiveCategoryBg() : "hover:bg-black/5 " + getInactiveCategoryText()
            )}
          >
            <Trash2 size={14} />
            <span className="font-medium truncate">Корзина</span>
          </button>

          <div className={cn("my-2 border-t mx-1", getSidebarBorder())} />

          {/* Custom Categories */}
          {noteCategories.map(cat => (
            <div key={cat.id} className="relative">
              <button
                onClick={() => { setSelectedCategoryId(cat.id); setIsSidebarOpen(false); }}
                className={cn(
                  "w-full text-left px-2 py-1.5 rounded flex items-center gap-2 transition-colors text-xs",
                  selectedCategoryId === cat.id ? getActiveCategoryBg() : "hover:bg-black/5 " + getInactiveCategoryText()
                )}
              >
                <div 
                  className="w-2 h-2 rounded-full border border-black/5 flex-shrink-0" 
                  style={{ backgroundColor: cat.color }} 
                />
                <span className="font-medium truncate">{cat.name}</span>
              </button>
              
              {/* Edit Category Button - ALWAYS VISIBLE */}
              <button
                onClick={(e) => { e.stopPropagation(); handleOpenCategoryModal(cat.id); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-1"
              >
                ⋮
              </button>
            </div>
          ))}

          {/* Add Category */}
          <button
            onClick={() => handleOpenCategoryModal()}
            className="w-full text-left px-2 py-1.5 rounded flex items-center gap-2 text-muted-foreground hover:bg-black/5 transition-colors text-xs"
          >
            ➕ <span className="font-medium">Новая папка</span>
          </button>
        </div>
      </div>

      {/* --- SIDEBAR TRIGGER BUTTON (Fixed Left) --- */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className={cn(
          "fixed left-0 top-1/2 -translate-y-1/2 z-30 p-2 rounded-r-lg shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95",
          theme === 'dark' ? 'bg-slate-800 text-slate-100 hover:bg-slate-700' : 'bg-white text-gray-500 hover:bg-gray-50',
          getSidebarBorder()
        )}
        title="Открыть папки"
      >
        {isSidebarOpen ? '❮' : '❯'}
      </button>

      {/* --- MAIN CONTENT (Notes) --- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative pl-0">
        
        {/* Header: Arrow, Search, Plus */}
        <div className={cn("p-3 border-b flex items-center gap-2", getSidebarBorder(), getSidebarBg())}>
          
          {/* 1. Arrow Toggle */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={cn(
              "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5"
            )}
          >
            {isSidebarOpen ? '❮' : '❯'}
          </button>

          {/* 2. Search (Glass only) */}
          <div className="relative flex-1">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder=""
              className={cn(
                "h-8 pl-7 pr-0 text-xs bg-transparent border-0 border-b border-black/10 focus-visible:ring-0 focus-visible:border-b-2 focus-visible:border-[#E8A87C] rounded-none placeholder:text-transparent",
                theme === 'dark' ? 'text-slate-100' : 'text-[#4A403A]'
              )}
            />
          </div>

          {/* 3. Plus Button */}
          <button 
            onClick={handleOpenCreate} 
            className="text-2xl text-[#E8A87C] hover:text-[#d49a6d] hover:scale-110 transition-all leading-none"
          >
            +
          </button>
        </div>

        {/* Notes Grid */}
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
          {filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-xs">Пусто</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pb-20 md:pb-4">
              {filteredNotes.map(note => (
                <div
                  key={note.id}
                  className={cn(
                    "rounded-lg p-2 border border-black/5 shadow-sm hover:shadow-md transition-all relative flex flex-col h-28",
                    theme === 'dark' ? 'text-slate-100' : 'text-[#4A403A]'
                  )}
                  style={{ backgroundColor: note.color || '#FFFFFF' }}
                >
                  {/* Title */}
                  {note.title && (
                    <h3 className="font-bold text-[11px] mb-0.5 leading-none line-clamp-1">{note.title}</h3>
                  )}
                  
                  {/* Body */}
                  <p className="text-[11px] leading-tight line-clamp-5 flex-1 opacity-90 whitespace-pre-wrap">
                    {note.text}
                  </p>

                  {/* Footer - Always Visible */}
                  <div className="mt-2 pt-1.5 border-t border-black/5 flex items-center justify-between opacity-100">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground truncate max-w-[50%]">
                      {noteCategories.find(c => c.id === note.category)?.name || 'Без категории'}
                    </span>
                    <div className="flex gap-1">
                      {selectedCategoryId === TRASH_ID ? (
                        <button 
                          className="text-gray-400 hover:text-green-600 flex items-center justify-center p-0.5"
                          onClick={() => handleRestore(note)}
                        >
                          ✅
                        </button>
                      ) : (
                        <button 
                          className="text-gray-400 hover:text-black flex items-center justify-center p-0.5"
                          onClick={() => handleOpenEdit(note)}
                        >
                          <Pencil size={12} />
                        </button>
                      )}
                      <button 
                        className="text-gray-400 hover:text-red-500 flex items-center justify-center p-0.5"
                        onClick={() => handleDeleteClick(note)}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- NOTE EDITOR MODAL --- */}
      <Dialog open={isNoteModalOpen} onOpenChange={setIsNoteModalOpen}>
        <DialogContent className="max-w-md p-0 gap-0 overflow-hidden bg-white text-[#4A403A]">
          <div className="p-3 border-b border-black/5 flex items-center justify-between">
            <DialogTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {editingNote ? 'Редактировать' : 'Новая заметка'}
            </DialogTitle>
            <div className="flex gap-2">
               {editingNote && (
                  <button className="text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center rounded" onClick={() => { if(confirm('Удалить?')) handleDeleteClick(editingNote); setIsNoteModalOpen(false); }}>
                    <Trash2 size={14} />
                  </button>
               )}
               <button className="text-gray-400 hover:bg-black/5 flex items-center justify-center rounded" onClick={() => setIsNoteModalOpen(false)}>
                  ✕
               </button>
            </div>
          </div>
          
          <div className="p-4 space-y-4">
            <Input 
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="Заголовок"
              className="border-none focus-visible:ring-0 px-0 text-sm font-bold placeholder:text-gray-300"
            />
            <Textarea 
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Заметка..."
              className="border-none focus-visible:ring-0 px-0 resize-none h-40 placeholder:text-gray-300 text-xs"
            />
          </div>

          <div className="p-4 border-t border-black/5 flex flex-wrap gap-4 items-center justify-between bg-gray-50">
             {/* Color Picker */}
             <div className="flex gap-2">
                {NOTE_COLORS.slice(0, 6).map(c => (
                  <button
                    key={c.id}
                    onClick={() => setNoteColor(c.value)}
                    className={cn("w-5 h-5 rounded-full border border-black/10 transition-transform hover:scale-110", noteColor === c.value ? 'ring-2 ring-offset-1 ring-black' : '')}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
             </div>

             {/* Category Selector */}
             <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 text-[10px] border-none bg-transparent shadow-none px-0 w-auto">
                    <Folder size={12} className="mr-2" />
                    {noteCategories.find(c => c.id === noteCategory)?.name || 'Без категории'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-48 p-1 bg-white">
                   {noteCategories.map(cat => (
                     <button
                       key={cat.id}
                       onClick={() => setNoteCategory(cat.id)}
                       className={cn("w-full text-left px-3 py-1.5 text-[10px] rounded-md hover:bg-black/5 flex items-center gap-2", noteCategory === cat.id ? 'font-bold' : '')}
                     >
                       <div className="w-2 h-2 rounded-full" style={{backgroundColor: cat.color}} />
                       {cat.name}
                     </button>
                   ))}
                </PopoverContent>
             </Popover>
          </div>
          
          <div className="p-4 pt-0">
             <Button onClick={handleSaveNote} className="w-full bg-[#E8A87C] hover:bg-[#d49a6d] text-white h-8 text-xs">
               Сохранить
             </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- CATEGORY MODAL --- */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="max-w-sm bg-white text-[#4A403A]">
          <DialogHeader>
            <DialogTitle className="text-sm">{editingCategoryId ? 'Редактировать папку' : 'Новая папка'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
               <label className="text-[10px] font-bold uppercase text-muted-foreground">Название</label>
               <Input value={catName} onChange={(e) => setCatName(e.target.value)} className="mt-1 text-sm h-8" />
            </div>
            <div>
               <label className="text-[10px] font-bold uppercase text-muted-foreground">Цвет</label>
               <div className="flex gap-2 mt-2">
                  {NOTE_COLORS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setCatColor(c.value)}
                      className={cn("w-6 h-6 rounded-lg border border-black/10 transition-transform hover:scale-105", catColor === c.value ? 'ring-2 ring-offset-2 ring-black' : '')}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
               </div>
            </div>
            <div className="pt-4 flex gap-2">
               <Button onClick={handleSaveCategory} className="flex-1 bg-[#E8A87C] hover:bg-[#d49a6d] text-white h-8 text-xs">
                 {editingCategoryId ? 'Сохранить' : 'Создать'}
               </Button>
               {editingCategoryId && (
                 <Button variant="destructive" onClick={handleDeleteCategory} className="px-3 h-8">
                   🗑️
                 </Button>
               )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
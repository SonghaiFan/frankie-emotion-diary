import React, { useState, useEffect } from "react";
import { Message, UserProfile } from "../types";
import { getFullChatHistory, saveChatMessage, deleteChatMessage } from "../services/firebase";
import { Book, X, ChevronLeft, ChevronRight, Trash2, Edit2 } from "lucide-react";
import { CATEGORY_THEMES, Emotion, Category } from "../constants";
import ZenMode from "./ZenMode";

interface MyDiaryProps {
  user: UserProfile;
  onClose: () => void;
}

const MyDiary: React.FC<MyDiaryProps> = ({ user, onClose }) => {
  const [entries, setEntries] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [editingEntry, setEditingEntry] = useState<Message | null>(null);

  useEffect(() => {
    const fetchEntries = async () => {
      const history = await getFullChatHistory(user.uid);
      // Filter for diary entries only
      const diaryEntries = history.filter(
        (msg) => msg.type === "diary" && msg.role === "user"
      ).reverse(); // Newest first for the book
      
      setEntries(diaryEntries);
      setLoading(false);
    };
    fetchEntries();
  }, [user.uid]);

  const totalPages = entries.length;
  const currentEntry = entries[currentPage];

  const handlePrev = () => {
    if (currentPage > 0) setCurrentPage((p) => p - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) setCurrentPage((p) => p + 1);
  };

  const handleUpdate = async (text: string, emotion: Emotion, category: Category) => {
    if (!currentEntry || !text.trim()) return;
    
    const updatedEntry = { 
        ...currentEntry, 
        text,
        emotion,
        category
    };
    
    // Optimistic update
    const updatedEntries = [...entries];
    updatedEntries[currentPage] = updatedEntry;
    setEntries(updatedEntries);
    setEditingEntry(null);

    await saveChatMessage(user.uid, updatedEntry);
  };

  const handleDelete = async () => {
    if (!currentEntry) return;
    
    if (window.confirm("Are you sure you want to delete this diary entry?")) {
        const entryToDelete = currentEntry;
        
        // Optimistic update
        const newEntries = entries.filter(e => e.id !== entryToDelete.id);
        setEntries(newEntries);
        
        // Adjust page if needed
        if (currentPage >= newEntries.length && newEntries.length > 0) {
            setCurrentPage(newEntries.length - 1);
        } else if (newEntries.length === 0) {
            setCurrentPage(0);
        }

        await deleteChatMessage(user.uid, entryToDelete.id);
    }
  };

  const startEditing = () => {
    setEditingEntry(currentEntry);
  };

  const theme = currentEntry 
    ? CATEGORY_THEMES[currentEntry.category || 'default'] 
    : CATEGORY_THEMES.default;

  if (editingEntry) {
      return (
          <ZenMode
            onExit={() => setEditingEntry(null)}
            onSave={handleUpdate}
            theme={CATEGORY_THEMES[editingEntry.category || 'default']}
            initialData={{
                text: editingEntry.text,
                emotion: editingEntry.emotion as Emotion,
                category: editingEntry.category as Category
            }}
          />
      );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 md:p-8 bg-stone-900/20 backdrop-blur-md animate-fade-in">
      
      {/* Main Card Container */}
      <div 
        className="relative w-full h-full md:w-[600px] md:h-[85vh] bg-white/90 backdrop-blur-xl md:rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border-none md:border border-white/60 flex flex-col overflow-hidden transition-all duration-500"
        style={{
            background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, ${theme.bgGradient.split(',')[1] || 'rgba(255,255,255,0.9)'})`
        }}
      >
        
        {/* Top Controls */}
        <div className="absolute top-4 right-4 md:top-6 md:right-6 z-30 flex items-center gap-1 md:gap-2">
            {!loading && currentEntry && (
                <>
                    <button 
                        onClick={startEditing}
                        className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
                        title="Edit Entry"
                    >
                        <Edit2 className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button 
                        onClick={handleDelete}
                        className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete Entry"
                    >
                        <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <div className="w-px h-4 bg-stone-300/30 mx-1 md:mx-2"></div>
                </>
            )}
            
            <button
                onClick={onClose}
                className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-all duration-300"
            >
                <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
        </div>

        {/* Loading State */}
        {loading && (
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-stone-300"></div>
             </div>
        )}

        {/* Empty State */}
        {!loading && entries.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400 p-8 text-center">
                <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mb-6">
                    <Book className="w-10 h-10 opacity-30" />
                </div>
                <p className="font-medium text-xl text-stone-500 mb-2">Your diary is empty</p>
                <p className="text-sm text-stone-400">Use Zen Mode to write your first entry.</p>
            </div>
        )}

        {/* Content */}
        {!loading && currentEntry && (
            <div className="flex flex-col h-full relative">
                
                {/* Header Section */}
                <div className="px-6 pt-12 pb-4 md:px-12 md:pt-12 flex flex-col items-center text-center z-10 shrink-0 relative">
                    
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 border border-white/50 shadow-sm mb-4 md:mb-6">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.primary }}></span>
                        <span className="text-xs font-bold tracking-widest uppercase text-stone-500">
                            {new Date(currentEntry.timestamp).toLocaleDateString(undefined, { weekday: 'long' })}
                        </span>
                    </div>
                    
                    <h2 className="text-4xl md:text-5xl font-bold text-stone-800 mb-1 md:mb-2 tracking-tight">
                        {new Date(currentEntry.timestamp).getDate()}
                    </h2>
                    <div className="text-lg text-stone-500 font-medium">
                        {new Date(currentEntry.timestamp).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                    </div>
                    
                    {/* Time & Mood Badge */}
                    <div className="mt-3 md:mt-4 flex items-center gap-3 text-sm text-stone-400">
                         <span>{new Date(currentEntry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                         {currentEntry.emotion && (
                             <>
                                <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                                <span className="capitalize">{currentEntry.emotion}</span>
                             </>
                         )}
                    </div>
                </div>

                {/* Scrollable Text Area */}
                <div className="flex-1 overflow-y-auto px-6 md:px-16 pb-28 md:pb-24 hide-scrollbar">
                    <div className="prose prose-lg prose-stone max-w-none mx-auto h-full">
                        <p className="text-lg md:text-xl leading-loose text-stone-600 font-medium whitespace-pre-wrap text-center md:text-left">
                            {currentEntry.text}
                        </p>
                    </div>
                </div>

                {/* Footer Navigation */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-white/95 via-white/80 to-transparent flex justify-between items-center z-20">
                    <button 
                        onClick={handlePrev}
                        disabled={currentPage === 0}
                        className={`group flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full bg-white shadow-sm border border-stone-100 hover:shadow-md transition-all ${currentPage === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                    >
                        <ChevronLeft className="w-4 h-4 text-stone-400 group-hover:text-stone-600" />
                        <span className="text-sm font-bold text-stone-500 group-hover:text-stone-700 hidden md:inline">Prev</span>
                    </button>

                    <span className="text-xs font-bold text-stone-300 tracking-widest uppercase">
                        {entries.length - currentPage} / {entries.length}
                    </span>

                    <button 
                        onClick={handleNext}
                        disabled={currentPage === entries.length - 1}
                        className={`group flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full bg-white shadow-sm border border-stone-100 hover:shadow-md transition-all ${currentPage === entries.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                    >
                        <span className="text-sm font-bold text-stone-500 group-hover:text-stone-700 hidden md:inline">Next</span>
                        <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-stone-600" />
                    </button>
                </div>

            </div>
        )}

      </div>
    </div>
  );
};

export default MyDiary;

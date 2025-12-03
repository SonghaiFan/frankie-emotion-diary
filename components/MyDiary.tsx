import React, { useState, useEffect } from "react";
import { Message, UserProfile } from "../types";
import { getFullChatHistory } from "../services/firebase";
import { Book, X, ChevronLeft, ChevronRight } from "lucide-react";
import { CATEGORY_THEMES } from "../constants";

interface MyDiaryProps {
  user: UserProfile;
  onClose: () => void;
}

const MyDiary: React.FC<MyDiaryProps> = ({ user, onClose }) => {
  const [entries, setEntries] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const fetchEntries = async () => {
      const history = await getFullChatHistory(user.uid);
      // Filter for diary entries only
      const diaryEntries = history.filter(
        (msg) => msg.type === "diary" && msg.role === "user"
      ).reverse(); // Newest first for the book? Or oldest? Let's do newest first.
      
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

  const theme = currentEntry 
    ? CATEGORY_THEMES[currentEntry.category || 'default'] 
    : CATEGORY_THEMES.default;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md md:max-w-6xl lg:max-w-7xl h-[85vh] md:h-[80vh] bg-[#FDFBF7] rounded-r-2xl rounded-l-md shadow-2xl flex flex-col md:flex-row overflow-hidden perspective-1000 transition-all duration-500">
        
        {/* Book Volume Effect (Right Edge) */}
        <div 
            className="absolute right-0 top-0 bottom-0 w-[12px] z-20 pointer-events-none opacity-80"
            style={{
                background: 'linear-gradient(to right, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.1) 20%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.05) 80%, rgba(0,0,0,0.2) 100%)',
                boxShadow: 'inset 2px 0 5px rgba(0,0,0,0.05)'
            }}
        />

        {/* Close Button */}
        <button
            onClick={onClose}
            className="absolute top-4 right-6 z-30 p-2 text-stone-400 hover:text-stone-600 transition-colors bg-white/50 rounded-full md:bg-transparent"
        >
            <X className="w-6 h-6" />
        </button>

        {/* Loading State */}
        {loading && (
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-400"></div>
             </div>
        )}

        {/* Empty State */}
        {!loading && entries.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400 p-8 text-center">
                <Book className="w-12 h-12 mb-4 opacity-50" />
                <p className="font-serif italic text-lg">Your diary is waiting for its first story...</p>
                <p className="text-sm mt-2">Use Zen Mode to write a diary entry.</p>
            </div>
        )}

        {/* Book Content */}
        {!loading && currentEntry && (
            <div className="flex flex-col md:flex-row w-full h-full">
                {/* Left Page (Visual/Meta) - Hidden on mobile, shown on desktop */}
                <div className="hidden md:flex w-1/2 h-full bg-[#F8F5F0] border-r border-stone-200/50 p-12 flex-col justify-center items-center relative shadow-[inset_-10px_0_20px_rgba(0,0,0,0.02)]">
                    {/* Decorative Elements */}
                    <div className="absolute top-10 left-10 w-full h-full opacity-5 pointer-events-none" 
                        style={{ 
                            backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', 
                            backgroundSize: '20px 20px' 
                        }} 
                    />
                    
                    <div className="text-center z-10">
                        <div className="text-6xl font-serif text-stone-800 mb-4 font-bold opacity-80">
                            {new Date(currentEntry.timestamp).getDate()}
                        </div>
                        <div className="text-xl font-serif text-stone-500 uppercase tracking-widest mb-8">
                            {new Date(currentEntry.timestamp).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                        </div>
                        <div className="w-16 h-1 bg-stone-300 mx-auto mb-8 rounded-full"></div>
                        <div className="text-sm font-medium text-stone-400 uppercase tracking-wider">
                            {new Date(currentEntry.timestamp).toLocaleDateString(undefined, { weekday: 'long' })}
                        </div>
                        <div className="mt-4 inline-block px-4 py-1 rounded-full text-xs font-medium bg-white border border-stone-200 text-stone-500 shadow-sm">
                            {new Date(currentEntry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                </div>

                {/* Right Page (Text Content) */}
                <div className="w-full md:w-1/2 h-full p-6 md:p-12 overflow-y-auto relative bg-[#FDFBF7] shadow-[inset_10px_0_20px_rgba(0,0,0,0.02)] flex flex-col">
                    
                    {/* Mobile Header (Date/Time) - Visible only on mobile */}
                    <div className="md:hidden mb-6 pb-4 border-b border-stone-100 flex flex-col items-center">
                         <div className="text-3xl font-serif text-stone-800 font-bold opacity-80">
                            {new Date(currentEntry.timestamp).getDate()}
                        </div>
                        <div className="text-xs font-serif text-stone-500 uppercase tracking-widest mb-2">
                             {new Date(currentEntry.timestamp).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                        </div>
                         <div className="text-[10px] font-medium text-stone-400 uppercase tracking-wider">
                            {new Date(currentEntry.timestamp).toLocaleDateString(undefined, { weekday: 'long' })} • {new Date(currentEntry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>

                    <div className="prose prose-stone max-w-none flex-1">
                        <p className="font-serif text-base md:text-xl leading-loose text-stone-700 whitespace-pre-wrap first-letter:text-4xl md:first-letter:text-5xl first-letter:font-bold first-letter:text-stone-800 first-letter:mr-3 first-letter:float-left">
                            {currentEntry.text}
                        </p>
                    </div>
                    
                    {/* Page Number / Navigation */}
                    <div className="mt-8 flex justify-end items-center gap-4">
                        <span className="text-xs font-serif text-stone-400 italic">
                            Page {entries.length - currentPage} of {entries.length}
                        </span>
                    </div>
                </div>
            </div>
        )}

        {/* Navigation Arrows Overlay */}
        {!loading && entries.length > 0 && (
            <>
                <button 
                    onClick={handlePrev}
                    disabled={currentPage === 0}
                    className={`absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full bg-white/80 shadow-lg hover:bg-white transition-all z-30 ${currentPage === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                >
                    <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-stone-600" />
                </button>
                <button 
                    onClick={handleNext}
                    disabled={currentPage === entries.length - 1}
                    className={`absolute right-4 md:right-4 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full bg-white/80 shadow-lg hover:bg-white transition-all z-30 ${currentPage === entries.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                >
                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-stone-600" />
                </button>
            </>
        )}

      </div>
    </div>
  );
};

export default MyDiary;

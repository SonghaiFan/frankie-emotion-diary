import React, { useEffect, useState, useRef } from "react";
import { Message, UserProfile } from "../types";
import { getFullChatHistory } from "../services/firebase";
import { Book, X } from "lucide-react";
import { CATEGORY_THEMES } from "../constants";
import AuroraSphere from "./AuroraSphere";

interface ChatDiaryModalProps {
  user: UserProfile;
  onClose: () => void;
}

const ChatDiaryModal: React.FC<ChatDiaryModalProps> = ({ user, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      const history = await getFullChatHistory(user.uid);

      setMessages(history);
      setLoading(false);
    };
    fetchHistory();
  }, [user.uid]);

  // Scroll to bottom on load
  useEffect(() => {
    if (!loading && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [loading, messages]);

  // Group messages by date
  const groupedMessages: { [date: string]: Message[] } = {};
  messages.forEach((msg) => {
    const date = new Date(msg.timestamp).toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(msg);
  });

  const renderMessageContent = (msg: Message) => {
    const rawParts = msg.text.split("[[TODO_SECTION]]");
    const part1 = rawParts[0]?.trim();
    const part2 = rawParts[1]?.trim();
    const hasSuggestions =
      msg.suggestions && msg.suggestions.length > 0;

    return (
      <div className="flex flex-col gap-2">
        {part1 && <p className="whitespace-pre-wrap">{part1}</p>}
        
        {hasSuggestions && (
          <div className="flex flex-wrap gap-2 my-1">
            {msg.suggestions!.map((suggestion, idx) => (
              <div
                key={idx}
                className="px-3 py-1 rounded-full text-xs border border-stone-200 bg-white/50 text-stone-600"
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}

        {part2 && <p className="whitespace-pre-wrap">{part2}</p>}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/20 backdrop-blur-sm animate-fade-in">
      <div className="bg-white/90 backdrop-blur-xl w-full max-w-2xl h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-white/50">
        {/* Header */}
        <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-white/50">
          <h2 className="text-lg font-semibold text-stone-700 flex items-center gap-2">
            <Book className="w-5 h-5" /> Chat Diary
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth"
        >
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-400"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-stone-400 mt-20">
              <p>No conversations yet.</p>
            </div>
          ) : (
            console.log(groupedMessages),
            Object.entries(groupedMessages).map(([date, msgs]) => (
              <div key={date} className="space-y-6">
                <div className="flex justify-center sticky top-0 z-10">
                  <span className="bg-stone-100/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-stone-500 shadow-sm">
                    {date}
                  </span>
                </div>
                <div className="space-y-6">
                  {msgs.map((msg) => {
                    const isUser = msg.role === "user";
                    const category = msg.category || "default";
                    const theme = CATEGORY_THEMES[category];
                    
                    // Determine background color for Aurora bubbles
                    let bubbleStyle = {};
                    if (!isUser) {
                      bubbleStyle = {
                        backgroundColor: theme ? theme.noteBg : "#F5F5F4",
                        color: "#44403C",
                      };
                    } else {
                        // User bubble style
                        bubbleStyle = {
                            backgroundColor: "#FFFFFF",
                            color: "#44403C",
                        }
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${
                          isUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        {/* Aurora Avatar (Left) */}
                        {!isUser && (
                          <div className="flex-shrink-0 mt-1 w-10 h-10">
                             <AuroraSphere
                                isThinking={false}
                                category={category}
                                emotion={msg.emotion || "neutral"}
                                isInputFocused={false}
                                forceSmile={false}
                                isInBottle={false}
                                className="w-full h-full"
                             />
                          </div>
                        )}

                        <div
                          style={bubbleStyle}
                          className={`max-w-[75%] rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-sm border border-stone-100/50 ${
                            isUser ? "rounded-tr-sm" : "rounded-tl-sm"
                          }`}
                        >
                          {renderMessageContent(msg)}
                          <p
                            className={`text-[10px] mt-2 text-right opacity-40`}
                          >
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>

                        {/* User Avatar (Right) */}
                        {isUser && (
                           <div className="flex-shrink-0 mt-1">
                               {user.photoURL ? (
                                   <img 
                                      src={user.photoURL} 
                                      alt="User" 
                                      className="w-8 h-8 rounded-full object-cover border border-stone-200 shadow-sm"
                                   />
                               ) : (
                                   <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 text-xs font-medium border border-stone-300 shadow-sm">
                                       {user.displayName ? user.displayName[0] : "U"}
                                   </div>
                               )}
                           </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatDiaryModal;

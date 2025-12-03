import React, { useEffect, useState, useRef } from "react";
import { Message } from "../types";
import { getFullChatHistory } from "../services/firebase";

interface ChatDiaryModalProps {
  uid: string;
  onClose: () => void;
}

const ChatDiaryModal: React.FC<ChatDiaryModalProps> = ({ uid, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      const history = await getFullChatHistory(uid);
      // Filter out reaction messages
      const filteredHistory = history.filter((msg) => !msg.id.startsWith("reaction-"));
      setMessages(filteredHistory);
      setLoading(false);
    };
    fetchHistory();
  }, [uid]);

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

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/20 backdrop-blur-sm animate-fade-in">
      <div className="bg-white/90 backdrop-blur-xl w-full max-w-2xl h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-white/50">
        {/* Header */}
        <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-white/50">
          <h2 className="text-lg font-semibold text-stone-700 flex items-center gap-2">
            <span className="text-xl">📔</span> Chat Diary
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
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
            Object.entries(groupedMessages).map(([date, msgs]) => (
              <div key={date} className="space-y-4">
                <div className="flex justify-center sticky top-0 z-10">
                  <span className="bg-stone-100/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-stone-500 shadow-sm">
                    {date}
                  </span>
                </div>
                <div className="space-y-4">
                  {msgs.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                          msg.role === "user"
                            ? "bg-stone-800 text-stone-50 rounded-tr-sm"
                            : "bg-white border border-stone-100 text-stone-700 rounded-tl-sm"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                        <p
                          className={`text-[10px] mt-1 text-right ${
                            msg.role === "user"
                              ? "text-stone-400"
                              : "text-stone-300"
                          }`}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
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

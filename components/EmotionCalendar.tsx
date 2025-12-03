
import React, { useEffect, useState } from "react";
import { EmotionLog } from "../types";
import { Emotion, Category } from "@/constants";
import { getEmotionHistory } from "../services/firebase";
import AuroraSphere from "./AuroraSphere";

interface EmotionCalendarProps {
  uid: string;
  onClose: () => void;
  onDateClick: (date: string) => void;
}

const EMOTION_COLORS: Record<Emotion, string> = {
  neutral: "#E7E5E4",
  happy: "#FCD34D",
  calm: "#A5F3FC",
  excited: "#F9A8D4",
  sad: "#94A3B8",
  surprised: "#FDBA74",
  focused: "#C4B5FD",
  confused: "#D1D5DB",
  tired: "#475569",
  angry: "#F87171",
  love: "#FDA4AF",
  grateful: "#6EE7B7",
  overstimulated: "#FB7185",
  fragile: "#E9D5FF",
  safe: "#86EFAC",
};

const EmotionCalendar: React.FC<EmotionCalendarProps> = ({ uid, onClose, onDateClick }) => {
  const [logs, setLogs] = useState<EmotionLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const history = await getEmotionHistory(uid);
      setLogs(history);
      setLoading(false);
    };
    fetchLogs();
  }, [uid]);

  // Group logs by date
  const logsByDate: Record<string, EmotionLog[]> = {};
  logs.forEach((log) => {
    // Format date to match ChatHistory's format for easy matching
    const date = new Date(log.timestamp).toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    if (!logsByDate[date]) logsByDate[date] = [];
    logsByDate[date].push(log);
  });

  // Get days for current month view (simplification: just showing last 30 entries effectively)
  // For a real calendar, we'd generate the full month grid. Let's do a simple list view styled as a timeline for MVP.

  const sortedDates = Object.keys(logsByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const getDailyStats = (dailyLogs: EmotionLog[]) => {
    const emotionCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};

    dailyLogs.forEach((log) => {
      emotionCounts[log.emotion] = (emotionCounts[log.emotion] || 0) + 1;
      categoryCounts[log.category] = (categoryCounts[log.category] || 0) + 1;
    });

    const sortedEmotions = Object.entries(emotionCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([emo]) => emo as Emotion);

    const sortedCategories = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([cat]) => cat as Category);

    return {
      dominantEmotion: sortedEmotions[0],
      dominantCategory: sortedCategories[0] || "default",
      topEmotions: sortedEmotions.slice(0, 3),
    };
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/20 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white/95 backdrop-blur-xl w-full max-w-md max-h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-white">
        {/* Header */}
        <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-white/50">
          <div>
            <h2 className="text-lg font-bold text-stone-700">Mood Calendar</h2>
            <p className="text-xs text-stone-400">The shapes I took with you</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 flex items-center justify-center transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-stone-200 border-t-stone-500 rounded-full animate-spin"></div>
            </div>
          ) : sortedDates.length === 0 ? (
            <div className="text-center py-10 text-stone-400 text-sm">
              <p>The calendar is waiting to be filled.</p>
              <p className="mt-2 text-xs opacity-70">Talk to Aurora to create your first cloud.</p>
            </div>
          ) : (
            sortedDates.map((date) => {
              const dailyLogs = logsByDate[date];
              const { dominantEmotion, dominantCategory, topEmotions } =
                getDailyStats(dailyLogs);

              return (
                <div
                  key={date}
                  className="relative pl-6 border-l-2 border-stone-100 last:border-0 pb-8 group cursor-pointer"
                  onClick={() => onDateClick(date)}
                >
                  <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-stone-200 ring-4 ring-white group-hover:bg-stone-400 transition-colors"></div>

                  <h3 className="text-xs font-bold text-stone-400 mb-3 uppercase tracking-wider group-hover:text-stone-600 transition-colors">
                    {date}
                  </h3>

                  <div className="flex items-center gap-4 bg-stone-50/50 p-4 rounded-2xl border border-stone-100 transition-all hover:bg-white hover:shadow-md hover:border-stone-200 hover:-translate-y-0.5">
                    {/* Mini Aurora */}
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <AuroraSphere
                        isThinking={false}
                        category={dominantCategory}
                        emotion={dominantEmotion}
                        isInputFocused={false}
                        forceSmile={false}
                        className="w-full h-full"
                        customColors={{
                          primary: EMOTION_COLORS[topEmotions[0]],
                          secondary:
                            EMOTION_COLORS[topEmotions[1]] ||
                            EMOTION_COLORS[topEmotions[0]],
                          tertiary:
                            EMOTION_COLORS[topEmotions[2]] ||
                            EMOTION_COLORS[topEmotions[0]],
                        }}
                        isInBottle={true}
                      />
                    </div>

                    {/* Stats */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-stone-700 capitalize mb-2">
                        {dominantEmotion} Form
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {topEmotions.map((emo) => (
                          <div
                            key={emo}
                            className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full border border-stone-100 shadow-sm"
                          >
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ background: EMOTION_COLORS[emo] }}
                            />
                            <span className="text-[10px] text-stone-500 capitalize font-medium">
                              {emo}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default EmotionCalendar;

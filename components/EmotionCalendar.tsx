import React, { useEffect, useState } from "react";
import { EmotionLog } from "../types";
import { Emotion } from "@/constants";
import { getEmotionHistory } from "../services/firebase";

interface EmotionCalendarProps {
  uid: string;
  onClose: () => void;
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
};

const EmotionCalendar: React.FC<EmotionCalendarProps> = ({ uid, onClose }) => {
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
    const date = new Date(log.timestamp).toLocaleDateString();
    if (!logsByDate[date]) logsByDate[date] = [];
    logsByDate[date].push(log);
  });

  // Get days for current month view (simplification: just showing last 30 entries effectively)
  // For a real calendar, we'd generate the full month grid. Let's do a simple list view styled as a timeline for MVP.

  const sortedDates = Object.keys(logsByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/20 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white/95 backdrop-blur-xl w-full max-w-md max-h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-white">
        {/* Header */}
        <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-white/50">
          <div>
            <h2 className="text-lg font-bold text-stone-700">Mood Calendar</h2>
            <p className="text-xs text-stone-400">Your emotional journey</p>
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
              No moods recorded yet. <br /> Talk to Aurora to start your
              journal.
            </div>
          ) : (
            sortedDates.map((date) => (
              <div
                key={date}
                className="relative pl-6 border-l-2 border-stone-100 last:border-0 pb-6"
              >
                <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-stone-200 ring-4 ring-white"></div>

                <h3 className="text-xs font-bold text-stone-400 mb-3 uppercase tracking-wider">
                  {date}
                </h3>

                <div className="space-y-3">
                  {logsByDate[date].map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center gap-3 bg-stone-50/50 p-2 rounded-xl"
                    >
                      <div
                        className="w-8 h-8 rounded-full shadow-sm flex-shrink-0"
                        style={{ backgroundColor: EMOTION_COLORS[log.emotion] }}
                        title={log.emotion}
                      ></div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-stone-700 capitalize flex items-center gap-2">
                          {log.emotion}
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-200/50 text-stone-500 font-normal">
                            {log.category}
                          </span>
                        </div>
                        {log.note && (
                          <p className="text-xs text-stone-400 truncate w-48">
                            {log.note}
                          </p>
                        )}
                      </div>
                      <div className="ml-auto text-[10px] text-stone-300">
                        {new Date(log.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Legend */}
        <div className="p-4 bg-stone-50 text-[10px] text-stone-400 flex flex-wrap gap-2 justify-center border-t border-stone-100">
          {Object.entries(EMOTION_COLORS)
            .slice(0, 6)
            .map(([emo, color]) => (
              <div key={emo} className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: color }}
                ></span>
                <span className="capitalize">{emo}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default EmotionCalendar;

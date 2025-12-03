
import React from "react";
import { UserProfile } from "../types";
import { signInWithGoogle, signOut } from "../services/firebase";
import { Book, Calendar, LogOut } from "lucide-react";

interface AuthButtonProps {
  user: UserProfile | null;
  onOpenCalendar: () => void;
  onOpenChatDiary: () => void;
  onLogout: () => void;
}

const AuthButton: React.FC<AuthButtonProps> = ({
  user,
  onOpenCalendar,
  onOpenChatDiary,
  onLogout,
}) => {
  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="relative group">
          <button className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition-all">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "User"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-500 text-xs">
                {user.displayName ? user.displayName[0] : "U"}
              </div>
            )}
          </button>

          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-lg shadow-lg py-1 border border-stone-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col">
            <button
              onClick={onOpenChatDiary}
              className="w-full text-left px-4 py-2 text-xs text-stone-600 hover:bg-stone-50 hover:text-stone-800 transition-colors flex items-center gap-2"
            >
              <Book className="w-3.5 h-3.5" />
              Chat Diary
            </button>
            <button
              onClick={onOpenCalendar}
              className="w-full text-left px-4 py-2 text-xs text-stone-600 hover:bg-stone-50 hover:text-stone-800 transition-colors flex items-center gap-2"
            >
              <Calendar className="w-3.5 h-3.5" />
              Mood Calendar
            </button>
            <div className="h-px bg-stone-100 my-1" />
            <button
              onClick={onLogout}
              className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthButton;

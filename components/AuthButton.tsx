
import React from "react";
import { UserProfile } from "../types";
import { signInWithGoogle, signOut } from "../services/firebase";

interface AuthButtonProps {
  user: UserProfile | null;
  onOpenCalendar: () => void;
  onLogout: () => void;
}

const AuthButton: React.FC<AuthButtonProps> = ({
  user,
  onOpenCalendar,
  onLogout,
}) => {
  if (user) {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenCalendar}
          className="text-stone-500 hover:text-stone-800 text-xs font-medium tracking-wide transition-colors flex items-center gap-2"
        >
          <span className="hidden sm:inline">Mood Calendar</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
              clipRule="evenodd"
            />
          </svg>
        </button>

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

          {/* Dropdown for Logout - Opens DOWNWARDS now */}
          <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-lg shadow-lg py-1 border border-stone-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <button
              onClick={onLogout}
              className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            >
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


import React from 'react';
import { UserProfile } from '../types';
import { signInWithGoogle, signOut } from '../services/firebase';

interface AuthButtonProps {
  user: UserProfile | null;
  onOpenCalendar: () => void;
}

const AuthButton: React.FC<AuthButtonProps> = ({ user, onOpenCalendar }) => {
  if (user) {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenCalendar}
          className="text-stone-500 hover:text-stone-800 text-xs font-medium tracking-wide transition-colors flex items-center gap-2"
        >
          <span className="hidden sm:inline">Mood Calendar</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
        </button>
        
        <div className="relative group">
          <button className="w-8 h-8 rounded-full overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition-all">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-500 text-xs">
                {user.displayName ? user.displayName[0] : 'U'}
              </div>
            )}
          </button>
          
          {/* Dropdown for Logout - Opens UPWARDS now */}
          <div className="absolute right-0 bottom-full mb-2 w-32 bg-white rounded-lg shadow-lg py-1 border border-stone-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
             <button 
                onClick={signOut}
                className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors"
             >
               Sign Out
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={signInWithGoogle}
      className="px-4 py-2 bg-white/50 hover:bg-white border border-stone-200 rounded-full text-stone-600 text-xs font-medium shadow-sm hover:shadow-md transition-all flex items-center gap-2"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
      Login
    </button>
  );
};

export default AuthButton;

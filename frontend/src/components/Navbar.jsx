import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { Sun, Moon, LogOut, CreditCard } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-dark-border dark:bg-dark-card/80 transition-colors duration-200">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
            <CreditCard size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            Smart<span className="text-indigo-600">Spend</span>
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-4">
          {/* Dark Mode toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-dark-border dark:bg-dark-bg dark:text-slate-300 dark:hover:bg-dark-border transition-all duration-200"
            title="Toggle Theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* User Profile */}
          {user && (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-dark-border">
              <img
                src={user.avatar || 'https://via.placeholder.com/150'}
                alt={user.name}
                className="h-9 w-9 rounded-full object-cover border-2 border-indigo-600"
              />
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user.name}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{user.email}</p>
              </div>
              <button
                onClick={logout}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-all duration-200"
                title="Log Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import React from 'react';
import { useDarkMode } from '../../hooks/useDarkMode';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDarkMode, toggleDarkMode] = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:ring-2 hover:ring-blue-500 transition-all duration-300 focus:outline-none"
      aria-label="Toggle Theme"
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5 text-amber-400" />
      ) : (
        <Moon className="w-5 h-5 text-slate-600" />
      )}
    </button>
  );
}
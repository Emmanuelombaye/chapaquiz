'use client';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const root = window.document.documentElement;
    // Check initial state
    setIsDark(root.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.remove('dark');
      setIsDark(false);
    } else {
      root.classList.add('dark');
      setIsDark(true);
    }
  };

  return (
    <button 
      onClick={toggleTheme}
      className="w-16 h-8 bg-slate-300 dark:bg-slate-800 rounded-full relative flex items-center px-1 border border-slate-400 dark:border-slate-700 transition-colors"
    >
      <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-md transform transition-transform duration-300 ${isDark ? 'translate-x-8 bg-slate-950' : 'translate-x-0 bg-white'}`}>
        {isDark ? <Moon className="w-3 h-3 text-neon-blue" /> : <Sun className="w-3 h-3 text-yellow-500" />}
      </div>
    </button>
  );
}

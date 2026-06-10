'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Settings, LogOut, Edit2, Check, Bell, Volume2 } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useQuizStore } from '@/store/useQuizStore';
import { useState } from 'react';
import clsx from 'clsx';

export default function Profile() {
  const router = useRouter();
  const { playerName, setPlayerName, walletBalance } = useQuizStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(playerName);
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);

  const handleSaveName = () => {
    if (editName.trim().length > 0) {
      setPlayerName(editName.trim());
    }
    setIsEditing(false);
  };

  return (
    <main className="p-6 flex flex-col h-full max-w-md mx-auto">
      <header className="flex items-center gap-4 mt-4 mb-8">
        <button onClick={() => router.push('/')} className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-900 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-900 dark:text-white" />
        </button>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile</h1>
      </header>

      <div className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-6 rounded-3xl flex flex-col items-center mb-8 relative">
        <div className="w-24 h-24 bg-neon-blue/10 dark:bg-neon-blue/20 rounded-full flex items-center justify-center mb-4">
          <User className="w-10 h-10 text-neon-blue" />
        </div>
        
        {isEditing ? (
          <div className="flex items-center gap-2 mb-2">
            <input 
              type="text" 
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="bg-white dark:bg-slate-800 border-2 border-neon-blue rounded-xl px-3 py-1 font-bold text-slate-900 dark:text-white focus:outline-none text-center w-32"
              autoFocus
            />
            <button onClick={handleSaveName} className="bg-neon-blue text-white p-2 rounded-xl">
              <Check className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">{playerName}</h2>
            <button onClick={() => { setIsEditing(true); setEditName(playerName); }} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <p className="text-slate-500 font-bold">Total Winnings: KSh {Math.max(0, walletBalance - 150)}</p>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-slate-500 font-bold uppercase text-xs tracking-widest pl-2 mb-1">App Settings</h3>
        
        <div className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><Settings className="w-5 h-5"/> Theme</span>
          <ThemeToggle />
        </div>
        
        <div className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><Bell className="w-5 h-5"/> Notifications</span>
          <button 
            onClick={() => setNotifications(!notifications)}
            className={clsx("w-12 h-6 rounded-full transition-colors relative", notifications ? "bg-neon-blue" : "bg-slate-300 dark:bg-slate-700")}
          >
            <div className={clsx("w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform", notifications ? "translate-x-6" : "translate-x-1")} />
          </button>
        </div>

        <div className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><Volume2 className="w-5 h-5"/> Sound FX</span>
          <button 
            onClick={() => setSound(!sound)}
            className={clsx("w-12 h-6 rounded-full transition-colors relative", sound ? "bg-neon-blue" : "bg-slate-300 dark:bg-slate-700")}
          >
            <div className={clsx("w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform", sound ? "translate-x-6" : "translate-x-1")} />
          </button>
        </div>

        <button className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 p-4 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all mt-4">
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </main>
  );
}

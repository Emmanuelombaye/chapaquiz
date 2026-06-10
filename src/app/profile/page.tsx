'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Settings, LogOut } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function Profile() {
  const router = useRouter();
  
  return (
    <main className="p-6 flex flex-col h-full max-w-md mx-auto">
      <header className="flex items-center gap-4 mt-4 mb-8">
        <button onClick={() => router.push('/')} className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-900 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-900 dark:text-white" />
        </button>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile</h1>
      </header>

      <div className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-6 rounded-3xl flex flex-col items-center mb-8">
        <div className="w-24 h-24 bg-neon-blue/10 dark:bg-neon-blue/20 rounded-full flex items-center justify-center mb-4">
          <User className="w-10 h-10 text-neon-blue" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Player 1</h2>
        <p className="text-slate-500 font-bold">Total Winnings: KSh 1,200</p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><Settings className="w-5 h-5"/> Theme</span>
          <ThemeToggle />
        </div>

        <button className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 p-4 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all mt-4">
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </main>
  );
}

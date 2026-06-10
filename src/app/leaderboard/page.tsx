'use client';
import { useRouter } from 'next/navigation';
import { Trophy, ArrowLeft } from 'lucide-react';
import { useQuizStore } from '@/store/useQuizStore';
import clsx from 'clsx';

export default function Leaderboard() {
  const router = useRouter();
  
  // Mock leaderboard data
  const ranks = [
    { id: '1', name: 'Player 1', score: 5, timeTaken: 12 },
    { id: '2', name: 'Alpha', score: 5, timeTaken: 14 },
    { id: '3', name: 'Sniper', score: 4, timeTaken: 20 },
    { id: '4', name: 'Ghost', score: 4, timeTaken: 25 },
    { id: '5', name: 'Rookie', score: 2, timeTaken: 40 },
  ];

  return (
    <main className="p-6 flex flex-col h-full max-w-md mx-auto">
      <header className="flex items-center gap-4 mt-4 mb-8">
        <button onClick={() => router.push('/')} className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-900 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-900 dark:text-white" />
        </button>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-400" />
          Global Ranks
        </h1>
      </header>

      <div className="flex flex-col gap-3">
        {ranks.map((p, i) => (
          <div key={p.id} className={clsx(
            "p-4 rounded-xl flex justify-between items-center font-bold",
            i === 0 ? "bg-gradient-to-r from-yellow-500/20 to-yellow-400/5 border border-yellow-500/50" : "bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
          )}>
            <div className="flex items-center gap-3">
              <span className="text-xl w-6 text-left text-slate-500">#{i + 1}</span>
              <span className="text-slate-900 dark:text-white">{p.name}</span>
            </div>
            <div className="flex gap-4">
              <span className="text-neon-dark dark:text-neon-accent">{p.timeTaken}s</span>
              <span className="text-green-600 dark:text-green-400">{p.score}/5</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

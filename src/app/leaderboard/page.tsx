'use client';

import { useRouter } from 'next/navigation';
import { Trophy, ArrowLeft, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useQuizStore } from '@/store/useQuizStore';

interface RankEntry {
  id: string;
  name: string;
  wallet_balance: number;
}

export default function Leaderboard() {
  const router = useRouter();
  const { userId } = useQuizStore();
  const [ranks, setRanks] = useState<RankEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setRanks(data); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="p-6 flex flex-col h-full max-w-md mx-auto">
      <header className="flex items-center gap-4 mt-4 mb-8">
        <button
          onClick={() => router.push('/')}
          className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-900 flex items-center justify-center hover:bg-zinc-300 dark:hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-zinc-900 dark:text-white" />
        </button>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-400" /> Global Ranks
        </h1>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
          <p className="text-zinc-500 font-medium">Loading rankings…</p>
        </div>
      ) : ranks.length === 0 ? (
        <p className="text-center text-zinc-400 mt-20 font-medium">No players yet. Be the first!</p>
      ) : (
        <div className="flex flex-col gap-3">
          {ranks.map((p, i) => (
            <div
              key={p.id}
              className={clsx(
                'p-4 rounded-xl flex justify-between items-center font-bold',
                i === 0
                  ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-400/5 border border-yellow-500/50'
                  : 'bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800',
                p.id === userId && 'ring-2 ring-green-500'
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl w-8 text-left text-zinc-500">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </span>
                <span className={clsx(
                  'text-zinc-900 dark:text-white',
                  p.id === userId && 'text-green-600 dark:text-green-400'
                )}>
                  {p.name} {p.id === userId ? '(You)' : ''}
                </span>
              </div>
              <span className="text-zinc-700 dark:text-zinc-300 font-black">KSh {p.wallet_balance}</span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

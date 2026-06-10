'use client';

import { useQuizStore } from '@/store/useQuizStore';
import { useRouter } from 'next/navigation';
import { Play, ArrowLeft } from 'lucide-react';
import { useEffect, use } from 'react';

export default function JoinPrivateMatch({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { walletBalance, entryFee, matchStatus, joinPrivateMatch } = useQuizStore();
  const resolvedParams = use(params);

  useEffect(() => {
    if (matchStatus === 'live') {
      router.push('/quiz');
    }
  }, [matchStatus, router]);

  const handleJoin = () => {
    if (walletBalance >= entryFee) {
      joinPrivateMatch(resolvedParams.id);
      router.push('/');
    } else {
      router.push('/wallet');
    }
  };

  return (
    <main className="p-6 flex flex-col h-full max-w-md mx-auto justify-center">
      <div className="bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 p-8 rounded-3xl flex flex-col items-center text-center shadow-sm">
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl">🤝</span>
        </div>
        
        <h2 className="text-3xl font-black mb-2 text-zinc-900 dark:text-white">You're Invited!</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed font-medium">
          You've been challenged to a private 60-second quiz match. 
          <br/>Room ID: <span className="text-blue-600 dark:text-blue-400 font-mono font-bold">{resolvedParams.id}</span>
        </p>

        <div className="w-full bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 mb-8 flex justify-between items-center">
          <span className="text-zinc-500 font-bold uppercase tracking-wider text-xs">Entry Fee</span>
          <span className="text-green-600 dark:text-green-500 font-black text-xl">KSh {entryFee}</span>
        </div>

        {walletBalance < entryFee ? (
          <div className="w-full text-center">
            <p className="text-red-500 font-bold mb-4">Insufficient Balance (KSh {walletBalance})</p>
            <button 
              onClick={() => router.push('/wallet')}
              className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold py-4 rounded-xl transition-colors"
            >
              Top Up Wallet
            </button>
          </div>
        ) : (
          <button 
            onClick={handleJoin}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-2 shadow-[0_6px_0_#1d4ed8] active:shadow-[0_0px_0_#1d4ed8] active:translate-y-1.5 transition-all text-xl"
          >
            <Play className="w-6 h-6 fill-white" />
            Accept Challenge
          </button>
        )}

        <button 
          onClick={() => router.push('/')}
          className="mt-6 flex items-center gap-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Lobby
        </button>
      </div>
    </main>
  );
}

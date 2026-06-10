'use client';

import { useQuizStore } from '@/store/useQuizStore';
import { useRouter } from 'next/navigation';
import { Play, ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

export default function JoinPrivateMatch({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { walletBalance, entryFee, matchStatus, joinPrivateMatch } = useQuizStore();

  useEffect(() => {
    // If the match starts, redirect to quiz
    if (matchStatus === 'live') {
      router.push('/quiz');
    }
  }, [matchStatus, router]);

  const handleJoin = () => {
    if (walletBalance >= entryFee) {
      joinPrivateMatch(params.id);
      router.push('/'); // Go to lobby which will show the waiting room
    } else {
      router.push('/wallet');
    }
  };

  return (
    <main className="p-6 flex flex-col h-full max-w-md mx-auto justify-center">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-neon-blue/20 rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl">🤝</span>
        </div>
        
        <h2 className="text-3xl font-black mb-2 text-white">You're Invited!</h2>
        <p className="text-slate-400 mb-8 leading-relaxed">
          You've been challenged to a private 60-second quiz match. 
          Room ID: <span className="text-neon-accent font-mono">{params.id}</span>
        </p>

        <div className="w-full bg-slate-950 p-4 rounded-xl border border-slate-800 mb-8 flex justify-between items-center">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-xs">Entry Fee</span>
          <span className="text-green-400 font-black text-xl">KSh {entryFee}</span>
        </div>

        {walletBalance < entryFee ? (
          <div className="w-full text-center">
            <p className="text-red-400 font-bold mb-4">Insufficient Balance (KSh {walletBalance})</p>
            <button 
              onClick={() => router.push('/wallet')}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-colors"
            >
              Top Up Wallet
            </button>
          </div>
        ) : (
          <button 
            onClick={handleJoin}
            className="w-full bg-neon-blue hover:bg-neon-accent text-white font-black py-5 rounded-2xl flex items-center justify-center gap-2 shadow-[0_6px_0_rgba(2,132,199,1)] active:shadow-[0_0px_0_rgba(2,132,199,1)] active:translate-y-1.5 transition-all text-xl"
          >
            <Play className="w-6 h-6 fill-white" />
            Accept Challenge
          </button>
        )}

        <button 
          onClick={() => router.push('/')}
          className="mt-6 flex items-center gap-2 text-slate-500 hover:text-slate-300 font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Lobby
        </button>
      </div>
    </main>
  );
}

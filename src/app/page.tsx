'use client';

import { useQuizStore } from '@/store/useQuizStore';
import { useRouter } from 'next/navigation';
import { Play, Users, Trophy, Wallet } from 'lucide-react';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  const { walletBalance, matchStatus, joinMatch, playersInRoom } = useQuizStore();

  useEffect(() => {
    if (matchStatus === 'live') {
      router.push('/quiz');
    }
  }, [matchStatus, router]);

  return (
    <main className="p-6 flex flex-col h-full max-w-md mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center mt-2 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            ChapaQuiz
          </h1>
          <p className="text-neon-blue font-bold text-sm tracking-wide">Cash. Glory. Fast.</p>
        </div>
      </header>

      {/* Wallet Summary Widget */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-950 rounded-full flex items-center justify-center border border-slate-800">
            <Wallet className="w-6 h-6 text-neon-accent" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">Balance</p>
            <p className="text-xl font-black text-white">KSh {walletBalance}</p>
          </div>
        </div>
        <button 
          onClick={() => router.push('/wallet')}
          className="bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
        >
          Add Funds
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {matchStatus === 'invite' ? (
          <div className="bg-slate-900 border border-[#25D366]/50 p-8 rounded-3xl flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold mb-2 text-white">Private Match Ready</h2>
            <p className="text-slate-400 mb-6">Share this link to challenge a friend!</p>
            
            <div className="w-full bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6 flex justify-between items-center">
              <span className="text-neon-accent font-mono truncate">chapaquiz.com/m/{useQuizStore.getState().privateMatchId}</span>
              <button className="text-slate-400 hover:text-white transition-colors">Copy</button>
            </div>

            <button className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 rounded-xl shadow-[0_6px_0_rgba(18,140,126,1)] active:shadow-[0_0px_0_rgba(18,140,126,1)] active:translate-y-1.5 transition-all mb-4">
              Share to WhatsApp
            </button>
            
            <button onClick={() => useQuizStore.setState({ matchStatus: 'idle', privateMatchId: null, walletBalance: walletBalance + 20 })} className="text-slate-500 font-bold hover:text-slate-300">
              Cancel Match
            </button>
          </div>
        ) : matchStatus === 'waiting' || matchStatus === 'starting' ? (
          <div className="bg-slate-900 border border-neon-blue/50 p-8 rounded-3xl flex flex-col items-center justify-center text-center animate-pulse">
            <h2 className="text-2xl font-bold mb-4 text-white">Finding Match...</h2>
            <div className="w-16 h-16 rounded-full border-4 border-slate-700 border-t-neon-blue animate-spin mb-4" />
            <p className="text-slate-400 font-bold">Players Joined: {playersInRoom}/5</p>
            {matchStatus === 'starting' && (
              <p className="text-neon-accent font-black mt-2 text-xl">Match Starting!</p>
            )}
          </div>
        ) : (
          <>
            {/* Huge Chess.com style Play Button */}
            <button 
              onClick={joinMatch}
              className="relative w-full bg-neon-blue hover:bg-neon-accent text-white p-8 rounded-3xl flex flex-col items-center justify-center gap-3 shadow-[0_8px_0_rgba(2,132,199,1)] active:shadow-[0_0px_0_rgba(2,132,199,1)] active:translate-y-2 transition-all group overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Play className="w-12 h-12 fill-white" />
              <span className="text-3xl font-black tracking-tight">Play Arena</span>
              <span className="bg-black/20 px-4 py-1.5 rounded-full text-sm font-bold mt-1">
                Entry: KSh 20
              </span>
            </button>

            <div className="grid grid-cols-2 gap-4 mt-2">
              {/* Private Match Button */}
              <button 
                onClick={() => useQuizStore.getState().createPrivateMatch()}
                className="bg-slate-800 hover:bg-slate-700 text-white p-5 rounded-[24px] flex flex-col items-center justify-center gap-3 shadow-[0_6px_0_rgba(15,23,42,1)] active:shadow-[0_0px_0_rgba(15,23,42,1)] active:translate-y-1.5 transition-all text-center"
              >
                <Users className="w-8 h-8 text-[#25D366]" />
                <span className="font-bold leading-tight">Play with<br/>Friends</span>
              </button>

              {/* Leaderboard Quick Link */}
              <button 
                onClick={() => router.push('/leaderboard')} 
                className="bg-slate-800 hover:bg-slate-700 text-white p-5 rounded-[24px] flex flex-col items-center justify-center gap-3 shadow-[0_6px_0_rgba(15,23,42,1)] active:shadow-[0_0px_0_rgba(15,23,42,1)] active:translate-y-1.5 transition-all text-center"
              >
                <Trophy className="w-8 h-8 text-yellow-400" />
                <span className="font-bold leading-tight">Global<br/>Ranks</span>
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

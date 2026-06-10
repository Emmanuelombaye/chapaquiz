'use client';

import { useQuizStore } from '@/store/useQuizStore';
import { useRouter } from 'next/navigation';
import { Play, Users, Trophy, Wallet, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

export default function Home() {
  const router = useRouter();
  const { walletBalance, matchStatus, joinMatch, playersInRoom, targetPlayers, entryFee, setEntryFee } = useQuizStore();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (matchStatus === 'live') {
      setIsLoading(false);
      router.push('/quiz');
    }
  }, [matchStatus, router]);

  const handlePlayClick = () => {
    if (isLoading) return;
    if (walletBalance < entryFee) {
      setErrorMsg(`Insufficient balance! You need KSh ${entryFee} to play this tier. Please deposit funds.`);
      setTimeout(() => setErrorMsg(null), 4000);
      return;
    }
    setIsLoading(true);
    joinMatch();
  };

  return (
    <main className="p-6 flex flex-col h-full max-w-md mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center mt-2 mb-8">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            ChapaQuiz
          </h1>
        </div>
      </header>

      {/* Wallet Summary Widget */}
      <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-4 rounded-2xl flex justify-between items-center mb-8 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
            <Wallet className="w-6 h-6 text-green-600 dark:text-green-500" />
          </div>
          <div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-bold mb-0.5">Balance</p>
            <p className="text-xl font-black text-zinc-900 dark:text-white transition-all">KSh {walletBalance}</p>
          </div>
        </div>
        <button 
          onClick={() => router.push('/wallet')}
          className="bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-900 dark:text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
        >
          Add Funds
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-500 p-4 rounded-xl mb-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-red-700 dark:text-red-400 font-bold text-sm leading-tight">{errorMsg}</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {matchStatus === 'invite' ? (
          <div className="bg-white dark:bg-zinc-800 border-2 border-green-500 p-8 rounded-3xl flex flex-col items-center text-center shadow-sm">
            <h2 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-white">Match Ready</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6 font-medium">Share this link to challenge a friend.</p>
            
            <div className="w-full bg-zinc-100 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 mb-6 flex justify-between items-center">
              <span className="text-zinc-900 dark:text-white font-mono font-bold truncate">chapaquiz.com/m/{useQuizStore.getState().privateMatchId}</span>
              <button className="text-green-600 dark:text-green-500 font-bold hover:opacity-80 transition-opacity">Copy</button>
            </div>

            <button className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 rounded-xl shadow-[0_6px_0_#128C7E] active:shadow-[0_0px_0_#128C7E] active:translate-y-1.5 transition-all mb-4">
              Share to WhatsApp
            </button>
            
            <button onClick={() => useQuizStore.setState({ matchStatus: 'idle', privateMatchId: null, walletBalance: walletBalance + entryFee })} className="text-zinc-400 dark:text-zinc-500 font-bold hover:text-zinc-600 dark:hover:text-zinc-300">
              Cancel Match
            </button>
          </div>
        ) : matchStatus === 'waiting' || matchStatus === 'starting' ? (
          <div className="bg-white dark:bg-zinc-800 border-2 border-green-500 p-8 rounded-3xl flex flex-col items-center justify-center text-center shadow-sm">
            <h2 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-white">Finding Match...</h2>
            <div className="w-16 h-16 rounded-full border-4 border-zinc-200 dark:border-zinc-700 border-t-green-500 animate-spin mb-6" />
            <div className="bg-zinc-100 dark:bg-zinc-900 px-6 py-3 rounded-full border border-zinc-200 dark:border-zinc-700">
              <p className="text-zinc-600 dark:text-zinc-300 font-black text-lg">Players Joined: {playersInRoom} <span className="text-zinc-400 dark:text-zinc-600">/ {targetPlayers}</span></p>
            </div>
            {matchStatus === 'starting' && (
              <p className="text-green-600 dark:text-green-500 font-black mt-4 text-xl">Match Starting!</p>
            )}
          </div>
        ) : (
          <>
            <div className="w-full mb-2">
              <p className="text-zinc-500 dark:text-zinc-400 font-bold text-xs uppercase tracking-widest mb-3 pl-2">Select Entry Tier</p>
              <div className="flex gap-2 w-full">
                {[10, 20, 50, 100].map(fee => (
                  <button
                    key={fee}
                    onClick={() => setEntryFee(fee)}
                    className={clsx(
                      "flex-1 py-3 rounded-xl font-bold transition-all border-2",
                      entryFee === fee 
                        ? "bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400" 
                        : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600"
                    )}
                  >
                    KSh {fee}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handlePlayClick}
              disabled={isLoading}
              className={clsx(
                "relative w-full text-white p-8 rounded-3xl flex flex-col items-center justify-center gap-3 shadow-[0_8px_0_#166534] active:shadow-[0_0px_0_#166534] active:translate-y-2 transition-all group overflow-hidden",
                isLoading ? "bg-green-700 opacity-80" : "bg-green-600 hover:bg-green-500"
              )}
            >
              {isLoading ? (
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play className="w-12 h-12 fill-white" />
              )}
              <span className="text-3xl font-black tracking-tight">{isLoading ? 'Loading...' : 'Play Arena'}</span>
              <span className="bg-black/20 px-4 py-1.5 rounded-full text-sm font-bold mt-1">
                Win KSh {(entryFee * 5 * 0.8).toFixed(0)}+
              </span>
            </button>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <button 
                onClick={() => {
                  if (isLoading) return;
                  if (walletBalance < entryFee) {
                    setErrorMsg(`Insufficient balance to host. You need KSh ${entryFee}.`);
                    setTimeout(() => setErrorMsg(null), 4000);
                  } else {
                    setIsLoading(true);
                    useQuizStore.getState().createPrivateMatch();
                  }
                }}
                disabled={isLoading}
                className="bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 p-5 rounded-[24px] flex flex-col items-center justify-center gap-3 shadow-[0_6px_0_#e4e4e7] dark:shadow-[0_6px_0_#3f3f46] active:shadow-[0_0px_0_#e4e4e7] dark:active:shadow-[0_0px_0_#3f3f46] active:translate-y-1.5 transition-all text-center"
              >
                {isLoading ? <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /> : <Users className="w-8 h-8 text-blue-600 dark:text-blue-500" />}
                <span className="font-bold leading-tight">Play with<br/>Friends</span>
              </button>

              <button 
                onClick={() => router.push('/leaderboard')} 
                className="bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 p-5 rounded-[24px] flex flex-col items-center justify-center gap-3 shadow-[0_6px_0_#e4e4e7] dark:shadow-[0_6px_0_#3f3f46] active:shadow-[0_0px_0_#e4e4e7] dark:active:shadow-[0_0px_0_#3f3f46] active:translate-y-1.5 transition-all text-center"
              >
                <Trophy className="w-8 h-8 text-yellow-500" />
                <span className="font-bold leading-tight">Global<br/>Ranks</span>
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

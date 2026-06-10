'use client';

import { useQuizStore } from '@/store/useQuizStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Timer } from 'lucide-react';
import clsx from 'clsx';

export default function QuizEngine() {
  const router = useRouter();
  const { 
    matchStatus, 
    globalTimeLeft, 
    questions, 
    currentQuestionIndex, 
    submitAnswer,
    decrementTimer,
    leaderboard
  } = useQuizStore();

  const [localSelectedOption, setLocalSelectedOption] = useState<number | null>(null);

  useEffect(() => {
    if (matchStatus !== 'live' && matchStatus !== 'finished') {
      router.push('/');
    }
  }, [matchStatus, router]);

  useEffect(() => {
    if (matchStatus === 'live') {
      const timer = setInterval(() => {
        decrementTimer();
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [matchStatus, decrementTimer]);

  const handleOptionClick = (idx: number) => {
    if (localSelectedOption !== null) return;
    setLocalSelectedOption(idx);
    submitAnswer(currentQuestionIndex, idx);
  };

  useEffect(() => {
    setLocalSelectedOption(null);
  }, [currentQuestionIndex]);

  if (matchStatus === 'finished') {
    const didWin = leaderboard[0]?.id === '1';
    
    // Dynamic math breakdown
    const playersInRoom = useQuizStore.getState().playersInRoom;
    const entryFee = useQuizStore.getState().entryFee;
    const totalPot = playersInRoom * entryFee;
    const platformFee = totalPot * 0.20;
    const winnings = totalPot - platformFee;

    return (
      <main className="p-6 flex flex-col h-full max-w-md mx-auto justify-center">
        <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-8 text-center flex flex-col items-center rounded-3xl shadow-sm">
          <div className={clsx(
            "w-20 h-20 rounded-full flex items-center justify-center mb-6",
            didWin ? "bg-yellow-100 dark:bg-yellow-900/30" : "bg-blue-100 dark:bg-blue-900/30"
          )}>
            <span className="text-4xl">{didWin ? '🏆' : '💪'}</span>
          </div>
          <h2 className="text-3xl font-black mb-2 text-zinc-900 dark:text-white">Match Over!</h2>
          
          {didWin ? (
            <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold px-6 py-4 rounded-3xl mb-6 border border-green-500 w-full shadow-sm text-left">
              <p className="text-2xl font-black mb-2 text-center text-green-800 dark:text-green-300">You Won!</p>
              <div className="flex justify-between text-sm mb-1"><span>Total Pot ({playersInRoom} players):</span> <span>KSh {totalPot}</span></div>
              <div className="flex justify-between text-sm mb-2 text-green-600/80 dark:text-green-400/80"><span>Platform Fee (20%):</span> <span>-KSh {platformFee}</span></div>
              <div className="flex justify-between text-lg border-t border-green-500/30 pt-2 mt-2"><span>Payout:</span> <span>+KSh {winnings}</span></div>
            </div>
          ) : (
            <div className="bg-zinc-100 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 font-bold px-6 py-4 rounded-3xl mb-6 border border-zinc-200 dark:border-zinc-700 w-full shadow-sm text-center">
              <p className="text-xl font-bold mb-1 text-zinc-800 dark:text-zinc-200">Great effort!</p>
              <p className="text-sm">You weren't the fastest this round, but keep practicing. Better luck next time!</p>
            </div>
          )}

          <p className="text-zinc-500 dark:text-zinc-400 mb-6 font-bold w-full text-left">Final Scores</p>
          
          <div className="w-full flex flex-col gap-3">
            {leaderboard.map((p, i) => (
              <div key={p.id} className={clsx(
                "p-4 rounded-xl flex justify-between items-center font-bold",
                i === 0 ? "bg-yellow-50 dark:bg-yellow-500/10 border-2 border-yellow-500" : "bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
              )}>
                <div className="flex items-center gap-3">
                  <span className="text-xl w-6 text-left text-zinc-400">#{i + 1}</span>
                  <span className="text-zinc-900 dark:text-white">{p.name}</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-blue-600 dark:text-blue-400">{p.timeTaken}s</span>
                  <span className="text-green-600 dark:text-green-500">{p.score}/5</span>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => router.push('/')} className="mt-8 w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold py-4 rounded-xl transition-colors">
            Return to Lobby
          </button>
        </div>
      </main>
    );
  }

  if (matchStatus !== 'live' || !questions[currentQuestionIndex]) return null;

  const currentQ = questions[currentQuestionIndex];
  const isTimeLow = globalTimeLeft <= 10;

  return (
    <main className="p-6 flex flex-col h-full max-w-md mx-auto">
      <header className="flex justify-between items-center mt-4 mb-8">
        <div className="bg-zinc-200 dark:bg-zinc-800 px-4 py-2 rounded-full font-bold text-sm text-zinc-800 dark:text-zinc-200">
          Q{currentQuestionIndex + 1} <span className="text-zinc-500">/ 5</span>
        </div>
        
        <div className={clsx(
          "px-4 py-2 rounded-full border-2 flex items-center gap-2 font-black text-lg tabular-nums",
          isTimeLow ? "bg-red-100 border-red-500 text-red-600 dark:bg-red-900/30 dark:text-red-400" : "bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
        )}>
          <Timer className={clsx("w-5 h-5", isTimeLow ? "text-red-500" : "text-zinc-500")} />
          0:{globalTimeLeft.toString().padStart(2, '0')}
        </div>
      </header>

      <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full mb-10 overflow-hidden">
        <div 
          className={clsx("h-full transition-all duration-1000 ease-linear", isTimeLow ? "bg-red-500" : "bg-green-500")}
          style={{ width: `${(globalTimeLeft / 60) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col">
        <h2 className="text-2xl font-black mb-8 leading-snug text-zinc-900 dark:text-white">
          {currentQ.text}
        </h2>

        <div className="flex flex-col gap-3">
          {currentQ.options.map((opt, idx) => {
            const isSelected = localSelectedOption === idx;
            const isLocked = localSelectedOption !== null;
            
            return (
              <button 
                key={idx}
                onClick={() => handleOptionClick(idx)}
                disabled={isLocked}
                className={clsx(
                  "p-5 text-left text-lg font-bold rounded-2xl flex items-center gap-4 transition-all duration-200 border-2",
                  isSelected ? "bg-blue-50 dark:bg-blue-900/30 border-blue-600 dark:border-blue-500 text-blue-900 dark:text-blue-100" : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:border-blue-300 dark:hover:border-blue-700",
                  isLocked && !isSelected && "opacity-50"
                )}
              >
                <div className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 border-2",
                  isSelected ? "bg-blue-600 border-blue-600 text-white" : "bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-600 text-zinc-500"
                )}>
                  {['A', 'B', 'C', 'D'][idx]}
                </div>
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}

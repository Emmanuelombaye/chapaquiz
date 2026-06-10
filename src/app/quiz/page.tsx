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
    if (localSelectedOption !== null) return; // Lock after selection
    setLocalSelectedOption(idx);
    submitAnswer(currentQuestionIndex, idx);
  };

  // Reset local selection when question changes
  useEffect(() => {
    setLocalSelectedOption(null);
  }, [currentQuestionIndex]);

  if (matchStatus === 'finished') {
    return (
      <main className="min-h-screen p-6 flex flex-col max-w-md mx-auto justify-center">
        <div className="glass p-8 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl">🏆</span>
          </div>
          <h2 className="text-3xl font-black mb-2 text-white">Match Over!</h2>
          <p className="text-slate-400 mb-8">Checking final scores...</p>
          
          <div className="w-full flex flex-col gap-3">
            {leaderboard.map((p, i) => (
              <div key={p.id} className={clsx(
                "p-4 rounded-xl flex justify-between items-center font-bold",
                i === 0 ? "bg-gradient-to-r from-yellow-600/40 to-yellow-400/10 border border-yellow-500/50" : "bg-slate-800/50"
              )}>
                <div className="flex items-center gap-3">
                  <span className="text-xl w-6 text-left text-slate-400">#{i + 1}</span>
                  <span className="text-white">{p.name}</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-neon-accent">{p.timeTaken}s</span>
                  <span className="text-green-400">{p.score}/5</span>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => router.push('/')} className="mt-8 w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-colors">
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
    <main className="min-h-screen p-6 flex flex-col max-w-md mx-auto">
      {/* Header & Global Timer */}
      <header className="flex justify-between items-center mt-4 mb-8">
        <div className="bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700">
          <span className="font-bold text-sm text-slate-300">
            Q{currentQuestionIndex + 1} <span className="text-slate-500">/ 5</span>
          </span>
        </div>
        
        <div className={clsx(
          "px-4 py-2 rounded-full border flex items-center gap-2 transition-colors",
          isTimeLow ? "bg-red-500/20 border-red-500/50" : "bg-slate-800/80 border-slate-700"
        )}>
          <Timer className={clsx("w-4 h-4", isTimeLow ? "text-red-400" : "text-neon-accent")} />
          <span className={clsx(
            "font-black text-lg tabular-nums",
            isTimeLow ? "text-red-400 animate-pulse" : "text-white"
          )}>
            0:{globalTimeLeft.toString().padStart(2, '0')}
          </span>
        </div>
      </header>

      {/* Global Progress Bar */}
      <div className="w-full h-1.5 bg-slate-800 rounded-full mb-10 overflow-hidden">
        <div 
          className={clsx("h-full transition-all duration-1000 ease-linear", isTimeLow ? "bg-red-500" : "bg-neon-blue")}
          style={{ width: `${(globalTimeLeft / 60) * 100}%` }}
        />
      </div>

      {/* Question Engine */}
      <div className="flex-1 flex flex-col">
        <h2 className="text-2xl font-bold mb-8 leading-snug text-white">
          {currentQ.text}
        </h2>

        {/* Options */}
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
                  "p-5 text-left text-lg font-semibold rounded-2xl flex items-center gap-4 transition-all duration-200",
                  isSelected ? "bg-neon-blue/20 border-2 border-neon-blue text-white" : "glass hover:bg-slate-800 border-2 border-transparent text-slate-200",
                  isLocked && !isSelected && "opacity-50"
                )}
              >
                <div className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0",
                  isSelected ? "bg-neon-blue text-white" : "bg-slate-800 text-slate-400"
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

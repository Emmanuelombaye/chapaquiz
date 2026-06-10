'use client';

import { useQuizStore } from '@/store/useQuizStore';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';

export default function Wallet() {
  const router = useRouter();
  const { walletBalance, setWalletBalance } = useQuizStore();

  const handleDeposit = (amount: number) => {
    setWalletBalance(walletBalance + amount);
  };

  return (
    <main className="p-6 flex flex-col h-full max-w-md mx-auto">
      <header className="flex items-center gap-4 mt-4 mb-8">
        <button 
          onClick={() => router.push('/')}
          className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-zinc-900 dark:text-white" />
        </button>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Wallet</h1>
      </header>

      <div className="bg-zinc-900 dark:bg-zinc-800 rounded-3xl p-8 mb-8 border border-zinc-800 dark:border-zinc-700 shadow-md">
        <div className="text-center">
          <p className="text-zinc-400 font-bold tracking-wider text-sm uppercase mb-2">Available Balance</p>
          <h2 className="text-5xl font-black tracking-tight text-white">
            <span className="text-2xl text-zinc-500 mr-1">KSh</span>{walletBalance}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-10">
        <button className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_6px_0_#166534] active:shadow-[0_0px_0_#166534] active:translate-y-1.5 transition-all">
          <ArrowDownLeft className="w-5 h-5" />
          Deposit
        </button>
        <button className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-700 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_6px_0_#e4e4e7] dark:shadow-[0_6px_0_#3f3f46] active:shadow-[0_0px_0_#e4e4e7] dark:active:shadow-[0_0px_0_#3f3f46] active:translate-y-1.5 transition-all">
          <ArrowUpRight className="w-5 h-5 text-zinc-500" />
          Withdraw
        </button>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-zinc-900 dark:text-white">
          <Clock className="w-5 h-5 text-green-600 dark:text-green-500" />
          Quick M-Pesa Deposit
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[50, 100, 200, 500].map(amount => (
            <button 
              key={amount}
              onClick={() => handleDeposit(amount)}
              className="bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 p-4 text-center font-bold text-lg text-zinc-900 dark:text-white rounded-2xl hover:border-green-500 dark:hover:border-green-500 transition-colors active:scale-95"
            >
              + KSh {amount}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}

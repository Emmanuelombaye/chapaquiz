'use client';

import { useQuizStore } from '@/store/useQuizStore';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';

export default function Wallet() {
  const router = useRouter();
  const { walletBalance, setWalletBalance } = useQuizStore();

  const handleDeposit = (amount: number) => {
    // Mock MPesa Deposit
    setWalletBalance(walletBalance + amount);
  };

  return (
    <main className="min-h-screen p-6 flex flex-col max-w-md mx-auto">
      {/* Header */}
      <header className="flex items-center gap-4 mt-4 mb-8">
        <button 
          onClick={() => router.push('/')}
          className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">Wallet</h1>
      </header>

      {/* Balance Card */}
      <div className="relative overflow-hidden rounded-3xl p-8 mb-8 border border-neon-blue/30 shadow-[0_0_30px_rgba(14,165,233,0.15)]">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-dark via-slate-900 to-black z-0" />
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-neon-blue/20 rounded-full blur-3xl z-0" />
        
        <div className="relative z-10 text-center">
          <p className="text-neon-accent font-semibold tracking-wider text-sm uppercase mb-2">Available Balance</p>
          <h2 className="text-5xl font-black tracking-tight text-white">
            <span className="text-2xl text-slate-400 mr-1">KSh</span>{walletBalance}
          </h2>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <button className="bg-neon-blue hover:bg-neon-accent text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
          <ArrowDownLeft className="w-5 h-5" />
          Deposit
        </button>
        <button className="glass hover:bg-slate-800 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
          <ArrowUpRight className="w-5 h-5 text-slate-400" />
          Withdraw
        </button>
      </div>

      {/* Quick Deposit */}
      <div>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-neon-accent" />
          Quick M-Pesa Deposit
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[50, 100, 200, 500].map(amount => (
            <button 
              key={amount}
              onClick={() => handleDeposit(amount)}
              className="glass p-4 text-center font-bold text-lg hover:bg-slate-800 hover:border-neon-blue/50 transition-all active:scale-95"
            >
              + KSh {amount}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}

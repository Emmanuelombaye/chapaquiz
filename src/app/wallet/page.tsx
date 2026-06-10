'use client';

import { useQuizStore } from '@/store/useQuizStore';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, AlertCircle, Lock, Phone } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

type TransactionType = 'deposit' | 'withdraw' | null;

export default function Wallet() {
  const router = useRouter();
  const { walletBalance, setWalletBalance } = useQuizStore();
  
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState<number>(50);
  const [phone, setPhone] = useState<string>('07');
  
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [pin, setPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleTransactionInitiate = () => {
    if (phone.length < 10) {
      alert("Please enter a valid M-Pesa number");
      return;
    }
    if (activeTab === 'withdraw' && amount > walletBalance) {
      alert("Insufficient funds to withdraw that amount.");
      return;
    }
    if (activeTab === 'deposit') {
      setShowPinModal(true);
      setPin('');
      setPinError('');
    } else {
      // Withdraw logic directly simulates
      setIsProcessing(true);
      setTimeout(() => {
        setWalletBalance(walletBalance - amount);
        setIsProcessing(false);
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setAmount(10);
        }, 3000);
      }, 2000);
    }
  };

  const handlePinSubmit = () => {
    if (pin.length !== 4) {
      setPinError("PIN must be exactly 4 digits.");
      return;
    }
    // Simulate STK Push Success
    setShowPinModal(false);
    setIsProcessing(true);
    
    setTimeout(() => {
      setWalletBalance(walletBalance + amount);
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setAmount(10);
      }, 3000);
    }, 2500);
  };

  return (
    <main className="p-6 flex flex-col h-full max-w-md mx-auto relative">
      <header className="flex items-center gap-4 mt-4 mb-8">
        <button 
          onClick={() => router.push('/')}
          className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-zinc-900 dark:text-white" />
        </button>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">ChapaQuiz Wallet</h1>
      </header>

      <div className="bg-zinc-900 dark:bg-zinc-800 rounded-3xl p-8 mb-8 border border-zinc-800 dark:border-zinc-700 shadow-md transition-all">
        <div className="text-center">
          <p className="text-zinc-400 font-bold tracking-wider text-sm uppercase mb-2">Available Balance</p>
          <h2 className="text-5xl font-black tracking-tight text-white transition-all">
            <span className="text-2xl text-zinc-500 mr-1">KSh</span>{walletBalance}
          </h2>
        </div>
      </div>

      <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-2xl mb-8">
        <button 
          onClick={() => setActiveTab('deposit')}
          className={clsx(
            "flex-1 py-3 font-bold rounded-xl flex items-center justify-center gap-2 transition-all",
            activeTab === 'deposit' ? "bg-white dark:bg-zinc-800 shadow-sm text-green-600 dark:text-green-500" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          )}
        >
          <ArrowDownLeft className="w-5 h-5" /> Deposit
        </button>
        <button 
          onClick={() => setActiveTab('withdraw')}
          className={clsx(
            "flex-1 py-3 font-bold rounded-xl flex items-center justify-center gap-2 transition-all",
            activeTab === 'withdraw' ? "bg-white dark:bg-zinc-800 shadow-sm text-blue-600 dark:text-blue-500" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          )}
        >
          <ArrowUpRight className="w-5 h-5" /> Withdraw
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-800 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-700 shadow-sm relative">
        <h3 className="text-lg font-bold mb-6 text-zinc-900 dark:text-white">
          {activeTab === 'deposit' ? 'Add Funds via M-Pesa' : 'Withdraw to M-Pesa'}
        </h3>
        
        <div className="mb-6">
          <label className="block text-sm font-bold text-zinc-500 dark:text-zinc-400 mb-2">Amount (KSh)</label>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[10, 50, 100, 500].map(val => (
              <button 
                key={val}
                onClick={() => setAmount(val)}
                className={clsx(
                  "py-2 font-bold rounded-xl border-2 transition-all",
                  amount === val ? (activeTab === 'deposit' ? "border-green-500 bg-green-50 text-green-700" : "border-blue-500 bg-blue-50 text-blue-700") : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-zinc-400"
                )}
              >
                {val}
              </button>
            ))}
          </div>
          <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-green-500"
          />
        </div>

        <div className="mb-8">
          <label className="block text-sm font-bold text-zinc-500 dark:text-zinc-400 mb-2">M-Pesa Number</label>
          <div className="relative">
            <Phone className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl pl-12 pr-4 py-3 font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-green-500"
            />
          </div>
        </div>

        <button 
          onClick={handleTransactionInitiate}
          disabled={isProcessing || isSuccess}
          className={clsx(
            "w-full text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_6px_0_rgba(0,0,0,0.2)] active:shadow-[0_0px_0_rgba(0,0,0,0.2)] active:translate-y-1.5",
            activeTab === 'deposit' ? "bg-[#25D366] hover:bg-[#128C7E]" : "bg-blue-600 hover:bg-blue-700",
            (isProcessing || isSuccess) && "opacity-70 pointer-events-none"
          )}
        >
          {isProcessing ? (
            <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/> Processing...</>
          ) : isSuccess ? (
            <><CheckCircle2 className="w-6 h-6"/> Success!</>
          ) : (
            activeTab === 'deposit' ? 'Pay with M-Pesa' : 'Withdraw Funds'
          )}
        </button>
      </div>

      {/* M-Pesa STK Push Simulation Modal */}
      {showPinModal && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="bg-[#25D366] p-6 text-white text-center relative">
              <button 
                onClick={() => setShowPinModal(false)}
                className="absolute right-4 top-4 text-white/80 hover:text-white"
              >
                ✕
              </button>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6 text-[#25D366]" />
              </div>
              <h3 className="text-xl font-bold">M-Pesa STK Push</h3>
            </div>
            
            <div className="p-6">
              <p className="text-zinc-600 font-medium mb-6 text-center">
                Do you want to pay KSh {amount} to ChapaQuiz? Enter your M-Pesa PIN to confirm.
              </p>
              
              <div className="mb-6">
                <input 
                  type="password" 
                  maxLength={4}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.replace(/[^0-9]/g, ''));
                    setPinError('');
                  }}
                  placeholder="Enter 4-Digit PIN"
                  className="w-full text-center tracking-[1em] text-2xl bg-zinc-50 border-2 border-zinc-200 rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-[#25D366]"
                />
                {pinError && <p className="text-red-500 text-sm font-bold mt-2 text-center">{pinError}</p>}
              </div>

              <button 
                onClick={handlePinSubmit}
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 rounded-xl transition-colors shadow-sm"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

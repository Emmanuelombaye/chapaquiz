'use client';

import { useQuizStore } from '@/store/useQuizStore';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, CheckCircle2, AlertCircle, Lock, Phone, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import clsx from 'clsx';

type ActiveTab = 'deposit' | 'withdraw';

export default function Wallet() {
  const router = useRouter();
  const { userId, walletBalance, transactions, deposit, withdraw, loadTransactions } = useQuizStore();

  const [activeTab, setActiveTab] = useState<ActiveTab>('deposit');
  const [amount, setAmount] = useState(50);
  const [phone, setPhone] = useState('07');
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txError, setTxError] = useState('');

  useEffect(() => {
    if (!userId) {
      router.push('/');
    } else {
      loadTransactions();
    }
  }, [userId, router]);

  const handleInitiate = () => {
    if (phone.length !== 10) {
      setTxError('Enter a valid 10-digit M-Pesa number.');
      setTimeout(() => setTxError(''), 3000);
      return;
    }
    if (activeTab === 'withdraw' && amount > walletBalance) {
      setTxError('Insufficient balance.');
      setTimeout(() => setTxError(''), 3000);
      return;
    }
    if (activeTab === 'deposit') {
      setShowPinModal(true);
      setPin('');
      setPinError('');
    } else {
      handleWithdraw();
    }
  };

  const handleWithdraw = async () => {
    setIsProcessing(true);
    setTxError('');
    const result = await withdraw(amount, phone);
    setIsProcessing(false);
    if (result?.success) {
      setIsSuccess(true);
      setTimeout(() => { setIsSuccess(false); setAmount(50); }, 3000);
    } else {
      setTxError(result?.error || 'Withdrawal failed.');
      setTimeout(() => setTxError(''), 4000);
    }
  };

  const handlePinSubmit = async () => {
    if (pin.length !== 4) {
      setPinError('PIN must be 4 digits.');
      return;
    }
    setShowPinModal(false);
    setIsProcessing(true);
    setTxError('');
    const result = await deposit(amount, phone, pin);
    setIsProcessing(false);
    if (result?.success) {
      setIsSuccess(true);
      setTimeout(() => { setIsSuccess(false); setAmount(50); }, 3000);
    } else {
      setTxError(result?.error || 'Deposit failed.');
      setTimeout(() => setTxError(''), 4000);
    }
  };

  const txIcon = (type: string) => {
    if (type === 'deposit') return <ArrowDownLeft className="w-4 h-4 text-green-500" />;
    if (type === 'payout') return <TrendingUp className="w-4 h-4 text-yellow-500" />;
    return <ArrowUpRight className="w-4 h-4 text-red-400" />;
  };

  const txLabel: Record<string, string> = {
    deposit: 'M-Pesa Deposit',
    withdrawal: 'M-Pesa Withdrawal',
    entry_fee: 'Match Entry',
    payout: 'Match Payout',
  };

  return (
    <main className="p-6 flex flex-col min-h-full max-w-md mx-auto pb-32">
      <header className="flex items-center gap-4 mt-4 mb-8">
        <button
          onClick={() => router.push('/')}
          className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-zinc-900 dark:text-white" />
        </button>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Wallet</h1>
      </header>

      {/* Balance Card */}
      <div className="bg-zinc-900 dark:bg-zinc-800 rounded-3xl p-8 mb-8 border border-zinc-800 dark:border-zinc-700 shadow-md">
        <div className="text-center">
          <p className="text-zinc-400 font-bold tracking-wider text-sm uppercase mb-2">Available Balance</p>
          <h2 className="text-5xl font-black tracking-tight text-white">
            <span className="text-2xl text-zinc-500 mr-1">KSh</span>{walletBalance}
          </h2>
        </div>
      </div>

      {/* Tab Toggle */}
      <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-2xl mb-8">
        <button
          onClick={() => setActiveTab('deposit')}
          className={clsx(
            'flex-1 py-3 font-bold rounded-xl flex items-center justify-center gap-2 transition-all',
            activeTab === 'deposit' ? 'bg-white dark:bg-zinc-800 shadow-sm text-green-600 dark:text-green-500' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
          )}
        >
          <ArrowDownLeft className="w-5 h-5" /> Deposit
        </button>
        <button
          onClick={() => setActiveTab('withdraw')}
          className={clsx(
            'flex-1 py-3 font-bold rounded-xl flex items-center justify-center gap-2 transition-all',
            activeTab === 'withdraw' ? 'bg-white dark:bg-zinc-800 shadow-sm text-blue-600 dark:text-blue-500' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
          )}
        >
          <ArrowUpRight className="w-5 h-5" /> Withdraw
        </button>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-zinc-800 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-700 shadow-sm mb-8">
        <h3 className="text-lg font-bold mb-6 text-zinc-900 dark:text-white">
          {activeTab === 'deposit' ? 'Add Funds via M-Pesa' : 'Withdraw to M-Pesa'}
        </h3>

        <div className="mb-6">
          <label className="block text-sm font-bold text-zinc-500 dark:text-zinc-400 mb-2">Amount (KSh)</label>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[50, 100, 200, 500].map((val) => (
              <button
                key={val}
                onClick={() => setAmount(val)}
                className={clsx(
                  'py-2 font-bold rounded-xl border-2 transition-all text-sm',
                  amount === val
                    ? activeTab === 'deposit'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-zinc-400'
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
            min={10}
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
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
              placeholder="07XXXXXXXX"
              className="w-full bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl pl-12 pr-4 py-3 font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-green-500"
            />
          </div>
        </div>

        {txError && (
          <div className="mb-4 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-400 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-red-600 dark:text-red-400 text-sm font-semibold">{txError}</p>
          </div>
        )}

        <button
          onClick={handleInitiate}
          disabled={isProcessing || isSuccess}
          className={clsx(
            'w-full text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_6px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-1.5',
            activeTab === 'deposit' ? 'bg-[#25D366] hover:bg-[#128C7E]' : 'bg-blue-600 hover:bg-blue-700',
            (isProcessing || isSuccess) && 'opacity-70 pointer-events-none'
          )}
        >
          {isProcessing ? (
            <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
          ) : isSuccess ? (
            <><CheckCircle2 className="w-6 h-6" /> Success!</>
          ) : (
            activeTab === 'deposit' ? 'Pay with M-Pesa' : 'Withdraw Funds'
          )}
        </button>
      </div>

      {/* Transaction History */}
      {transactions.length > 0 && (
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-4">Recent Transactions</h3>
          <div className="flex flex-col gap-2">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                    {txIcon(tx.type)}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-zinc-900 dark:text-white">{txLabel[tx.type] || tx.type}</p>
                    <p className="text-xs text-zinc-400">{new Date(tx.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={clsx(
                  'font-black text-sm',
                  tx.type === 'deposit' || tx.type === 'payout' ? 'text-green-600 dark:text-green-400' : 'text-red-500'
                )}>
                  {tx.type === 'deposit' || tx.type === 'payout' ? '+' : '-'}KSh {tx.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* M-Pesa PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="bg-[#25D366] p-6 text-white text-center relative">
              <button onClick={() => setShowPinModal(false)} className="absolute right-4 top-4 text-white/80 hover:text-white text-xl">✕</button>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6 text-[#25D366]" />
              </div>
              <h3 className="text-xl font-bold">M-Pesa STK Push</h3>
            </div>
            <div className="p-6">
              <p className="text-zinc-600 font-medium mb-6 text-center">
                Confirm payment of <strong>KSh {amount}</strong> to ChapaQuiz
              </p>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => { setPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 4)); setPinError(''); }}
                placeholder="****"
                className="w-full text-center tracking-[1em] text-3xl bg-zinc-50 border-2 border-zinc-200 rounded-xl px-4 py-4 font-black text-zinc-900 focus:outline-none focus:border-[#25D366] mb-4"
              />
              {pinError && <p className="text-red-500 text-sm font-bold mb-4 text-center">{pinError}</p>}
              <button
                onClick={handlePinSubmit}
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 rounded-xl transition-colors"
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

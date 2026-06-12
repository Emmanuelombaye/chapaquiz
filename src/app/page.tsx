'use client';

import { useQuizStore } from '@/store/useQuizStore';
import { useRouter } from 'next/navigation';
import { Play, Users, Trophy, Wallet, AlertCircle, Phone, User, Loader2, Lock, Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

// ---------- Login Screen ----------
function LoginScreen() {
  const { login } = useQuizStore();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('07');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    if (activeTab === 'register' && !name.trim()) {
      setError('Please enter a display name for your profile.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    if (activeTab === 'register' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await login(
        phone,
        activeTab === 'register' ? name.trim() : undefined,
        activeTab,
        password
      );
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-200 selection:bg-green-500/30 selection:text-green-600">
      <div className="w-full max-w-sm">
        {/* Brand Logo & Heading */}
        <div className="text-center mb-8">
          <img 
            src="/reallogochapaquiz.png" 
            alt="ChapaQuiz Logo" 
            className="w-20 h-20 object-contain mx-auto mb-4 drop-shadow-md rounded-2xl"
          />
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight">ChapaQuiz</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-semibold text-sm">Play, compete & win real KSh</p>
        </div>

        {/* Auth Box */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800/80 p-6 shadow-xl dark:shadow-2xl/40 backdrop-blur-md">
          {/* Tab Selector */}
          <div className="flex bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-2xl mb-6 border border-zinc-200/50 dark:border-zinc-800">
            <button
              onClick={() => {
                setActiveTab('login');
                setError('');
                setPassword('');
                setConfirmPassword('');
                setShowPassword(false);
                setShowConfirmPassword(false);
              }}
              className={clsx(
                "flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-200",
                activeTab === 'login'
                  ? "bg-white dark:bg-zinc-800 text-green-600 dark:text-green-500 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              )}
            >
              Log In
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setError('');
                setPassword('');
                setConfirmPassword('');
                setShowPassword(false);
                setShowConfirmPassword(false);
              }}
              className={clsx(
                "flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-200",
                activeTab === 'register'
                  ? "bg-white dark:bg-zinc-800 text-green-600 dark:text-green-500 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              )}
            >
              Register
            </button>
          </div>

          <h2 className="text-xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight">
            {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 font-medium">
            {activeTab === 'login' 
              ? 'Enter your phone number and password to access your account.' 
              : 'Sign up with your details to create a secure wallet.'}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2">
                M-Pesa Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                  placeholder="e.g. 0712345678"
                  className="w-full bg-zinc-50 dark:bg-zinc-800/80 border-2 border-zinc-200 dark:border-zinc-700/80 rounded-xl pl-12 pr-4 py-3 font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-green-500 dark:focus:border-green-500 transition-all text-sm"
                />
              </div>
            </div>

            {activeTab === 'register' && (
              <div>
                <label className="block text-[10px] font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2">
                  Display Name / Nickname
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value.slice(0, 20))}
                    placeholder="e.g. Sniper254"
                    className="w-full bg-zinc-50 dark:bg-zinc-800/80 border-2 border-zinc-200 dark:border-zinc-700/80 rounded-xl pl-12 pr-4 py-3 font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-green-500 dark:focus:border-green-500 transition-all text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-50 dark:bg-zinc-800/80 border-2 border-zinc-200 dark:border-zinc-700/80 rounded-xl pl-12 pr-12 py-3 font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-green-500 dark:focus:border-green-500 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {activeTab === 'register' && (
              <div>
                <label className="block text-[10px] font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-50 dark:bg-zinc-800/80 border-2 border-zinc-200 dark:border-zinc-700/80 rounded-xl pl-12 pr-12 py-3 font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-green-500 dark:focus:border-green-500 transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-950/20 border border-red-300 dark:border-red-900/50 rounded-xl px-4 py-3 mt-1">
                <AlertCircle className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-red-600 dark:text-red-400 text-xs font-semibold leading-relaxed">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white font-black py-4 rounded-xl shadow-[0_6px_0_#166534] active:shadow-[0_0px_0_#166534] active:translate-y-1.5 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {loading ? 'Authenticating...' : activeTab === 'login' ? 'Log In →' : 'Register Account →'}
            </button>
          </form>

          <p className="text-center text-[10px] text-zinc-400 dark:text-zinc-500 mt-6 leading-relaxed">
            Enter your M-Pesa phone number to login or create a new account 🎮
          </p>
        </div>
      </div>
    </main>
  );
}

// ---------- Main Lobby ----------
export default function Home() {
  const router = useRouter();
  const {
    userId,
    walletBalance,
    matchStatus,
    joinMatch,
    leaveQueue,
    playersInQueue,
    entryFee,
    setEntryFee,
    createPrivateMatch,
    privateMatchId,
    resetMatch,
    loadBalance,
    connectSocket,
  } = useQuizStore();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingType, setLoadingType] = useState<'arena' | 'friends' | null>(null);

  // Redirect when match goes live
  useEffect(() => {
    if (matchStatus === 'live') {
      router.push('/quiz');
    }
  }, [matchStatus, router]);

  // Refresh balance on mount and connect socket
  useEffect(() => {
    if (userId) {
      loadBalance();
      connectSocket();
    }
  }, [userId, connectSocket]);

  // Reset stuck states on mount
  useEffect(() => {
    if (matchStatus === 'finished') resetMatch();
  }, []);

  // Clear loading state when matchmaking resolves
  useEffect(() => {
    if (matchStatus === 'idle' || matchStatus === 'invite') {
      setLoadingType(null);
    }
  }, [matchStatus]);

  if (!userId) return <LoginScreen />;

  const handlePlayClick = async () => {
    if (loadingType) return;
    if (walletBalance < entryFee) {
      setErrorMsg(`Insufficient balance. You need KSh ${entryFee}. Please deposit funds.`);
      setTimeout(() => setErrorMsg(null), 4000);
      return;
    }
    setLoadingType('arena');
    await joinMatch();
  };

  const handleFriendsClick = async () => {
    if (loadingType) return;
    if (walletBalance < entryFee) {
      setErrorMsg(`Insufficient balance to host. You need KSh ${entryFee}.`);
      setTimeout(() => setErrorMsg(null), 4000);
      return;
    }
    setLoadingType('friends');
    const roomId = await createPrivateMatch();
    if (!roomId) {
      setLoadingType(null);
      setErrorMsg('Failed to create match. Try again.');
      setTimeout(() => setErrorMsg(null), 3000);
    }
  };

  const isLoading = loadingType !== null;

  return (
    <main className="p-6 flex flex-col h-full max-w-md mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center mt-2 mb-8">
        <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">ChapaQuiz</h1>
      </header>

      {/* Wallet */}
      <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-4 rounded-2xl flex justify-between items-center mb-8 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
            <Wallet className="w-6 h-6 text-green-600 dark:text-green-500" />
          </div>
          <div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-bold mb-0.5">Balance</p>
            <p className="text-xl font-black text-zinc-900 dark:text-white">KSh {walletBalance}</p>
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
        {/* Private Match Invite View */}
        {matchStatus === 'invite' ? (
          <div className="bg-white dark:bg-zinc-800 border-2 border-green-500 p-8 rounded-3xl flex flex-col items-center text-center shadow-sm">
            <h2 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-white">Room Created!</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6 font-medium">Share this code with your friends.</p>
            <div className="w-full bg-zinc-100 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 mb-6 flex justify-between items-center">
              <span className="text-zinc-900 dark:text-white font-mono font-black text-2xl tracking-widest">{privateMatchId}</span>
              <button
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/m/${privateMatchId}`)}
                className="text-green-600 dark:text-green-500 font-bold hover:opacity-80 transition-opacity text-sm"
              >
                Copy Link
              </button>
            </div>
            <button
              onClick={() => router.push(`/m/${privateMatchId}`)}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl mb-4 transition-colors"
            >
              Open Room →
            </button>
            <button
              onClick={() => resetMatch()}
              className="text-zinc-400 dark:text-zinc-500 font-bold hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              Cancel
            </button>
          </div>
        ) : matchStatus === 'waiting' ? (
          /* Matchmaking Queue */
          <div className="bg-white dark:bg-zinc-800 border-2 border-green-500 p-8 rounded-3xl flex flex-col items-center justify-center text-center shadow-sm">
            <h2 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-white">Finding Match...</h2>
            <div className="w-16 h-16 rounded-full border-4 border-zinc-200 dark:border-zinc-700 border-t-green-500 animate-spin mb-6" />
            <div className="bg-zinc-100 dark:bg-zinc-900 px-6 py-3 rounded-full border border-zinc-200 dark:border-zinc-700 mb-4">
              <p className="text-zinc-600 dark:text-zinc-300 font-black text-lg">
                Players in queue: <span className="text-green-600">{playersInQueue}</span>
              </p>
            </div>
            <p className="text-zinc-400 text-sm mb-6">Looking for opponents for KSh {entryFee} tier…</p>
            <button
              onClick={() => { setLoadingType(null); leaveQueue(); }}
              className="text-zinc-400 hover:text-zinc-600 font-bold text-sm"
            >
              Cancel
            </button>
          </div>
        ) : (
          /* Lobby */
          <>
            <div className="w-full mb-2">
              <p className="text-zinc-500 dark:text-zinc-400 font-bold text-xs uppercase tracking-widest mb-3 pl-2">Select Entry Tier</p>
              <div className="flex gap-2 w-full">
                {[10, 20, 50, 100].map((fee) => (
                  <button
                    key={fee}
                    onClick={() => setEntryFee(fee)}
                    className={clsx(
                      'flex-1 py-3 rounded-xl font-bold transition-all border-2',
                      entryFee === fee
                        ? 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400'
                        : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600'
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
                'relative w-full text-white p-8 rounded-3xl flex flex-col items-center justify-center gap-3 shadow-[0_8px_0_#166534] active:shadow-[0_0px_0_#166534] active:translate-y-2 transition-all overflow-hidden',
                isLoading ? 'bg-green-700 opacity-80' : 'bg-green-600 hover:bg-green-500'
              )}
            >
              {loadingType === 'arena' ? (
                <Loader2 className="w-12 h-12 animate-spin" />
              ) : (
                <Play className="w-12 h-12 fill-white" />
              )}
              <span className="text-3xl font-black tracking-tight">
                {loadingType === 'arena' ? 'Joining...' : 'Play Arena'}
              </span>
              <span className="bg-black/20 px-4 py-1.5 rounded-full text-sm font-bold mt-1">
                Win KSh {(entryFee * 3 * 0.8).toFixed(0)}+
              </span>
            </button>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <button
                onClick={handleFriendsClick}
                disabled={isLoading}
                className="bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 p-5 rounded-[24px] flex flex-col items-center justify-center gap-3 shadow-[0_6px_0_#e4e4e7] dark:shadow-[0_6px_0_#3f3f46] active:shadow-[0_0px_0_#e4e4e7] dark:active:shadow-[0_0px_0_#3f3f46] active:translate-y-1.5 transition-all text-center"
              >
                {loadingType === 'friends' ? (
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                ) : (
                  <Users className="w-8 h-8 text-blue-600 dark:text-blue-500" />
                )}
                <span className="font-bold leading-tight">Play with<br />Friends</span>
              </button>

              <button
                onClick={() => router.push('/leaderboard')}
                className="bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 p-5 rounded-[24px] flex flex-col items-center justify-center gap-3 shadow-[0_6px_0_#e4e4e7] dark:shadow-[0_6px_0_#3f3f46] active:shadow-[0_0px_0_#e4e4e7] dark:active:shadow-[0_0px_0_#3f3f46] active:translate-y-1.5 transition-all text-center"
              >
                <Trophy className="w-8 h-8 text-yellow-500" />
                <span className="font-bold leading-tight">Global<br />Ranks</span>
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

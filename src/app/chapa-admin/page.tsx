'use client';

import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Wallet, 
  TrendingUp, 
  Zap, 
  Search, 
  Plus, 
  Edit, 
  Trash, 
  X, 
  RefreshCw, 
  Check, 
  AlertCircle,
  HelpCircle,
  History,
  Lock
} from 'lucide-react';
import clsx from 'clsx';

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || '';

// Type definitions
interface AdminStats {
  totalUsers: number;
  totalBalance: number;
  platformFees: number;
  activeMatches: number;
}

interface UserRecord {
  id: string;
  name: string;
  phone: string;
  wallet_balance: number;
  created_at: string;
}

interface TransactionRecord {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal' | 'entry_fee' | 'payout';
  amount: number;
  status: string;
  mpesa_code: string | null;
  created_at: string;
  user_name: string;
  user_phone: string;
}

interface MatchRecord {
  id: string;
  status: 'waiting' | 'starting' | 'live' | 'finished';
  entry_fee: number;
  is_private: number;
  timer_start: string | null;
  created_at: string;
  player_count: number;
}

interface QuestionRecord {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

export default function AdminDashboard() {
  // Authentication states
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'overview' | 'matches' | 'transactions' | 'questions'>('overview');

  // Data states
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [questions, setQuestions] = useState<QuestionRecord[]>([]);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Modals state
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [isAdjusting, setIsAdjusting] = useState(false);

  // Question Form state
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionRecord | null>(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [qText, setQText] = useState('');
  const [qOptions, setQOptions] = useState<string[]>(['', '', '', '']);
  const [qCorrect, setQCorrect] = useState<number>(0);
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);

  // Check sessionStorage on mount
  useEffect(() => {
    const isAuth = sessionStorage.getItem('chapa-admin-auth') === 'true';
    if (isAuth) {
      setIsAdminAuthenticated(true);
    }
  }, []);

  // Fetch all dashboard data
  const refreshData = async () => {
    if (!isAdminAuthenticated) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const [statsRes, usersRes, txRes, matchesRes, questionsRes] = await Promise.all([
        fetch(`${BASE}/api/admin/stats`),
        fetch(`${BASE}/api/admin/users?query=${encodeURIComponent(searchQuery)}`),
        fetch(`${BASE}/api/admin/transactions`),
        fetch(`${BASE}/api/admin/matches`),
        fetch(`${BASE}/api/admin/questions`)
      ]);

      if (!statsRes.ok || !usersRes.ok || !txRes.ok || !matchesRes.ok || !questionsRes.ok) {
        throw new Error('Some API requests failed');
      }

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      const txData = await txRes.json();
      const matchesData = await matchesRes.json();
      const questionsData = await questionsRes.json();

      setStats(statsData);
      setUsers(usersData);
      setTransactions(txData);
      setMatches(matchesData);
      setQuestions(questionsData);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load dashboard statistics. Make sure the backend server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  // Run data fetch when authenticated or search changes
  useEffect(() => {
    if (isAdminAuthenticated) {
      refreshData();
    }
  }, [searchQuery, isAdminAuthenticated]);

  // Admin Login Submit
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch(`${BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem('chapa-admin-auth', 'true');
        setIsAdminAuthenticated(true);
      } else {
        setLoginError(data.error || 'Access Denied. Invalid Administrator credentials.');
      }
    } catch (err) {
      console.error(err);
      setLoginError('Server error occurred during admin authentication.');
    }
  };

  // Adjust balance handler
  const handleAdjustBalanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const amountNum = Number(adjustAmount);
    if (isNaN(amountNum) || amountNum === 0) {
      alert('Please enter a valid non-zero number');
      return;
    }

    setIsAdjusting(true);
    try {
      const res = await fetch(`${BASE}/api/admin/users/${selectedUser.id}/adjust-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountNum })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedUser(null);
        setAdjustAmount('');
        refreshData();
      } else {
        alert(data.error || 'Failed to adjust balance.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error occurred.');
    } finally {
      setIsAdjusting(false);
    }
  };

  // Delete question handler
  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      const res = await fetch(`${BASE}/api/admin/questions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        refreshData();
      } else {
        alert(data.error || 'Failed to delete question');
      }
    } catch (err) {
      console.error(err);
      alert('Network error occurred.');
    }
  };

  // Add/Edit question submit handler
  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim() || qOptions.some(opt => !opt.trim())) {
      alert('Please fill out the question text and all 4 options.');
      return;
    }

    setIsSavingQuestion(true);
    const url = selectedQuestion 
      ? `${BASE}/api/admin/questions/${selectedQuestion.id}` 
      : `${BASE}/api/admin/questions`;
    const method = selectedQuestion ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: qText.trim(),
          options: qOptions.map(o => o.trim()),
          correctAnswer: Number(qCorrect)
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsQuestionModalOpen(false);
        setSelectedQuestion(null);
        setQText('');
        setQOptions(['', '', '', '']);
        setQCorrect(0);
        refreshData();
      } else {
        alert(data.error || 'Failed to save question');
      }
    } catch (err) {
      console.error(err);
      alert('Network error occurred.');
    } finally {
      setIsSavingQuestion(false);
    }
  };

  const openAddQuestion = () => {
    setSelectedQuestion(null);
    setQText('');
    setQOptions(['', '', '', '']);
    setQCorrect(0);
    setIsQuestionModalOpen(true);
  };

  const openEditQuestion = (q: QuestionRecord) => {
    setSelectedQuestion(q);
    setQText(q.text);
    setQOptions([...q.options]);
    setQCorrect(q.correctAnswer);
    setIsQuestionModalOpen(true);
  };

  // RENDER LOGIN GATE IF NOT AUTHENTICATED
  if (!isAdminAuthenticated) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-zinc-100 font-sans antialiased selection:bg-green-500/30 selection:text-green-300">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8 animate-fade-in">
            <img 
              src="/reallogochapaquiz.png" 
              alt="ChapaQuiz Logo" 
              className="w-16 h-16 object-contain mx-auto mb-4 drop-shadow-md rounded-2xl"
            />
            <h1 className="text-2xl font-black tracking-tight text-white">ChapaQuiz Admin Portal</h1>
            <p className="text-zinc-500 text-xs mt-1">Authorized Administrator Access Only</p>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 backdrop-blur-md shadow-2xl">
            <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider mb-2">
                  Admin Email Address
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-green-500 focus:outline-none rounded-xl px-4 py-3 font-bold text-sm text-white transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider mb-2">
                  Secret Password Key
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-green-500 focus:outline-none rounded-xl px-4 py-3 font-bold text-sm text-white transition-colors"
                  required
                />
              </div>

              {loginError && (
                <div className="flex items-start gap-2 bg-red-950/20 border border-red-900 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-400 text-xs font-bold leading-snug">{loginError}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-500 text-white font-black py-4 rounded-xl shadow-[0_4px_0_#166534] active:translate-y-1 active:shadow-none transition-all text-sm cursor-pointer mt-2"
              >
                Access Control Panel →
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-8 font-sans antialiased selection:bg-green-500/30 selection:text-green-300">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-zinc-900 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <img 
              src="/reallogochapaquiz.png" 
              alt="ChapaQuiz Logo" 
              className="w-10 h-10 object-contain rounded-lg"
            />
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
              ChapaQuiz Admin Control Center
            </h1>
          </div>
          <p className="text-zinc-500 text-sm mt-1 font-medium">Real-time multiplayer trivia platform analytics & management</p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={refreshData}
            disabled={loading}
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 px-4 py-2 rounded-xl transition-all active:scale-95 disabled:opacity-50 text-sm font-bold shadow-sm cursor-pointer"
          >
            <RefreshCw className={clsx("w-4 h-4", loading && "animate-spin")} />
            Reload Data
          </button>
          
          <button 
            onClick={() => {
              sessionStorage.removeItem('chapa-admin-auth');
              setIsAdminAuthenticated(false);
            }}
            className="bg-red-950/20 hover:bg-red-950/40 border border-red-900/50 hover:border-red-800 text-red-400 px-4 py-2 rounded-xl transition-all text-sm font-bold cursor-pointer"
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Error alert */}
      {errorMsg && (
        <div className="bg-red-950/20 border border-red-800 text-red-400 p-4 rounded-xl mb-8 flex items-start gap-3 shadow-md max-w-xl">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm leading-snug">Connection Failed</p>
            <p className="text-xs text-red-500/80 mt-1">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Statistics Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Total Users */}
        <div className="relative overflow-hidden bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-3xl p-6 shadow-sm hover:border-green-500/40 transition-colors group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full blur-xl translate-x-4 -translate-y-4 group-hover:bg-green-500/10 transition-colors" />
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs uppercase font-extrabold text-zinc-500 tracking-wider">Total Registered Players</p>
            <div className="w-8 h-8 rounded-lg bg-green-950/40 border border-green-800/40 flex items-center justify-center">
              <Users className="w-4 h-4 text-green-400" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{stats?.totalUsers ?? '-'}</p>
          <p className="text-xs text-zinc-500 mt-2 font-medium">Joined Arena</p>
        </div>

        {/* Combined User Balances */}
        <div className="relative overflow-hidden bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-3xl p-6 shadow-sm hover:border-blue-500/40 transition-colors group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl translate-x-4 -translate-y-4 group-hover:bg-blue-500/10 transition-colors" />
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs uppercase font-extrabold text-zinc-500 tracking-wider">Escrow / Player Wallets</p>
            <div className="w-8 h-8 rounded-lg bg-blue-950/40 border border-blue-800/40 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">
            {stats ? `KSh ${stats.totalBalance.toLocaleString()}` : '-'}
          </p>
          <p className="text-xs text-zinc-500 mt-2 font-medium">Combined user funds</p>
        </div>

        {/* Revenue / Platform Fees */}
        <div className="relative overflow-hidden bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-3xl p-6 shadow-sm hover:border-purple-500/40 transition-colors group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl translate-x-4 -translate-y-4 group-hover:bg-purple-500/10 transition-colors" />
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs uppercase font-extrabold text-zinc-500 tracking-wider">Platform Revenue (20%)</p>
            <div className="w-8 h-8 rounded-lg bg-purple-950/40 border border-purple-800/40 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <p className="text-3xl font-black text-purple-400">
            {stats ? `KSh ${stats.platformFees.toLocaleString()}` : '-'}
          </p>
          <p className="text-xs text-zinc-500 mt-2 font-medium">Accumulated matchmaking fees</p>
        </div>

        {/* Active Matches */}
        <div className="relative overflow-hidden bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-3xl p-6 shadow-sm hover:border-amber-500/40 transition-colors group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl translate-x-4 -translate-y-4 group-hover:bg-amber-500/10 transition-colors" />
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs uppercase font-extrabold text-zinc-500 tracking-wider">Active Rooms</p>
            <div className="w-8 h-8 rounded-lg bg-amber-950/40 border border-amber-800/40 flex items-center justify-center">
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{stats?.activeMatches ?? '-'}</p>
          <p className="text-xs text-zinc-500 mt-2 font-medium">Waiting / Live rooms</p>
        </div>
      </section>

      {/* Tabs Navigation */}
      <nav className="flex border-b border-zinc-900 mb-8 gap-4 overflow-x-auto pb-px">
        {[
          { id: 'overview', name: 'Players Directory', icon: Users },
          { id: 'matches', name: 'Match Logs', icon: Zap },
          { id: 'transactions', name: 'Transaction History', icon: History },
          { id: 'questions', name: 'Question Bank', icon: HelpCircle }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={clsx(
                "flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-bold tracking-tight transition-all cursor-pointer whitespace-nowrap",
                isActive 
                  ? "border-green-500 text-green-400" 
                  : "border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-800"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.name}
            </button>
          );
        })}
      </nav>

      {/* Tab Contents */}
      <section className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 min-h-[400px]">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <RefreshCw className="w-10 h-10 text-green-500 animate-spin" />
            <p className="text-zinc-500 font-bold text-sm">Loading database logs…</p>
          </div>
        )}

        {!loading && (
          <>
            {/* OVERVIEW / PLAYERS TAB */}
            {activeTab === 'overview' && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                    Player Accounts
                    <span className="bg-zinc-800 text-zinc-400 text-xs px-2 py-0.5 rounded-full">{users.length}</span>
                  </h2>

                  <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search name or phone…"
                      className="w-full bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 focus:border-green-500 focus:outline-none rounded-xl pl-10 pr-4 py-2 text-sm font-medium text-white transition-colors"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-zinc-900">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-950 text-zinc-500 uppercase tracking-widest text-[10px] font-extrabold border-b border-zinc-900">
                      <tr>
                        <th className="px-6 py-4">User ID</th>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Phone</th>
                        <th className="px-6 py-4">Wallet Balance</th>
                        <th className="px-6 py-4">Joined Date</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900 bg-zinc-900/10 font-medium">
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-zinc-500">
                            No players found matching that search.
                          </td>
                        </tr>
                      ) : (
                        users.map((u) => (
                          <tr key={u.id} className="hover:bg-zinc-900/30 transition-colors">
                            <td className="px-6 py-4 font-mono text-xs text-zinc-500">{u.id}</td>
                            <td className="px-6 py-4 text-white font-bold">{u.name}</td>
                            <td className="px-6 py-4 text-zinc-300">{u.phone}</td>
                            <td className="px-6 py-4 text-green-400 font-bold">KSh {u.wallet_balance.toFixed(2)}</td>
                            <td className="px-6 py-4 text-zinc-500">{new Date(u.created_at).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => setSelectedUser(u)}
                                className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700 text-xs px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer"
                              >
                                Adjust Wallet
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MATCH LOGS TAB */}
            {activeTab === 'matches' && (
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white mb-6 flex items-center gap-2">
                  Recent Match Rooms
                  <span className="bg-zinc-800 text-zinc-400 text-xs px-2 py-0.5 rounded-full">{matches.length}</span>
                </h2>

                <div className="overflow-x-auto rounded-2xl border border-zinc-900">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-950 text-zinc-500 uppercase tracking-widest text-[10px] font-extrabold border-b border-zinc-900">
                      <tr>
                        <th className="px-6 py-4">Match ID</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Entry Fee</th>
                        <th className="px-6 py-4">Player Count</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Timer Started</th>
                        <th className="px-6 py-4">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900 bg-zinc-900/10 font-medium">
                      {matches.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-12 text-zinc-500">
                            No match rooms logged in DB.
                          </td>
                        </tr>
                      ) : (
                        matches.map((m) => (
                          <tr key={m.id} className="hover:bg-zinc-900/30 transition-colors">
                            <td className="px-6 py-4 font-mono text-xs text-zinc-400">{m.id}</td>
                            <td className="px-6 py-4">
                              <span className={clsx(
                                "text-xs px-2 py-1 rounded-md font-bold",
                                m.is_private ? "bg-blue-950 text-blue-400 border border-blue-900/50" : "bg-purple-950 text-purple-400 border border-purple-900/50"
                              )}>
                                {m.is_private ? 'Private' : 'Public'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-zinc-300 font-bold">KSh {m.entry_fee}</td>
                            <td className="px-6 py-4 font-bold text-white">{m.player_count} / {m.is_private ? 'Unlimited' : 3}</td>
                            <td className="px-6 py-4">
                              <span className={clsx(
                                "text-xs px-2 py-0.5 rounded-full font-bold",
                                m.status === 'live' && "bg-green-950 text-green-400 border border-green-900/50",
                                m.status === 'finished' && "bg-zinc-800 text-zinc-400 border border-zinc-700/50",
                                m.status === 'waiting' && "bg-amber-950 text-amber-400 border border-amber-900/50"
                              )}>
                                {m.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-mono text-xs text-zinc-500">
                              {m.timer_start ? new Date(m.timer_start).toLocaleTimeString() : 'Not Started'}
                            </td>
                            <td className="px-6 py-4 text-zinc-500">{new Date(m.created_at).toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TRANSACTION HISTORY TAB */}
            {activeTab === 'transactions' && (
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white mb-6 flex items-center gap-2">
                  Transaction Audit Logs
                  <span className="bg-zinc-800 text-zinc-400 text-xs px-2 py-0.5 rounded-full">{transactions.length}</span>
                </h2>

                <div className="overflow-x-auto rounded-2xl border border-zinc-900">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-950 text-zinc-500 uppercase tracking-widest text-[10px] font-extrabold border-b border-zinc-900">
                      <tr>
                        <th className="px-6 py-4">Tx ID</th>
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Phone</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">M-Pesa Code</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900 bg-zinc-900/10 font-medium">
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-12 text-zinc-500">
                            No transactions logged in database.
                          </td>
                        </tr>
                      ) : (
                        transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-zinc-900/30 transition-colors">
                            <td className="px-6 py-4 font-mono text-xs text-zinc-400">{tx.id}</td>
                            <td className="px-6 py-4 text-white font-bold">{tx.user_name}</td>
                            <td className="px-6 py-4 text-zinc-500 font-mono text-xs">{tx.user_phone}</td>
                            <td className="px-6 py-4">
                              <span className={clsx(
                                "text-xs px-2 py-1 rounded-md font-bold uppercase tracking-wider",
                                tx.type === 'deposit' && "bg-green-950 text-green-400 border border-green-900/50",
                                tx.type === 'payout' && "bg-emerald-950 text-emerald-300 border border-emerald-900/50",
                                tx.type === 'withdrawal' && "bg-red-950 text-red-400 border border-red-900/50",
                                tx.type === 'entry_fee' && "bg-amber-950 text-amber-400 border border-amber-900/50"
                              )}>
                                {tx.type.replace('_', ' ')}
                              </span>
                            </td>
                            <td className={clsx(
                              "px-6 py-4 font-black",
                              (tx.type === 'deposit' || tx.type === 'payout') ? "text-green-400" : "text-red-400"
                            )}>
                              {(tx.type === 'deposit' || tx.type === 'payout') ? '+' : '-'}KSh {tx.amount.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 font-mono font-bold text-zinc-300">{tx.mpesa_code || '-'}</td>
                            <td className="px-6 py-4">
                              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/50 font-bold">
                                {tx.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-zinc-500">{new Date(tx.created_at).toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* QUESTION BANK TAB */}
            {activeTab === 'questions' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                    Question Bank
                    <span className="bg-zinc-800 text-zinc-400 text-xs px-2 py-0.5 rounded-full">{questions.length}</span>
                  </h2>

                  <button
                    onClick={openAddQuestion}
                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm transition-all active:scale-95 shadow-md shadow-green-900/20 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    New Question
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {questions.length === 0 ? (
                    <div className="col-span-2 text-center py-12 text-zinc-500 font-medium border border-zinc-900 rounded-3xl bg-zinc-900/10">
                      No questions in database. Seeding must have failed or bank was wiped.
                    </div>
                  ) : (
                    questions.map((q, idx) => (
                      <div 
                        key={q.id} 
                        className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start gap-4 mb-3">
                            <span className="text-xs font-mono text-zinc-500 font-bold">QID: {q.id} (#{idx + 1})</span>
                          </div>
                          
                          <p className="text-white font-extrabold text-base mb-4 leading-snug">{q.text}</p>
                          
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            {q.options.map((opt, oIdx) => {
                              const isCorrect = q.correctAnswer === oIdx;
                              return (
                                <div 
                                  key={oIdx} 
                                  className={clsx(
                                    "px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 border",
                                    isCorrect 
                                      ? "bg-green-950/30 border-green-500 text-green-400" 
                                      : "bg-zinc-950 border-zinc-900 text-zinc-400"
                                  )}
                                >
                                  <span className={clsx(
                                    "w-5 h-5 rounded-full flex items-center justify-center text-[10px] border shrink-0",
                                    isCorrect ? "bg-green-500 border-green-500 text-zinc-950 font-black" : "bg-zinc-900 border-zinc-800 text-zinc-500"
                                  )}>
                                    {['A', 'B', 'C', 'D'][oIdx]}
                                  </span>
                                  <span className="truncate">{opt}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 border-t border-zinc-900 pt-4 mt-2">
                          <button
                            onClick={() => openEditQuestion(q)}
                            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white p-2 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                            title="Edit Question"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="bg-zinc-900 hover:bg-red-950/40 border border-zinc-800 hover:border-red-900 text-zinc-400 hover:text-red-400 p-2 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                            title="Delete Question"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Adjust Balance Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black mb-1 text-white">Adjust Wallet Balance</h3>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-6">User: {selectedUser.name}</p>

            <form onSubmit={handleAdjustBalanceSubmit}>
              <div className="mb-6">
                <label className="block text-xs font-extrabold text-zinc-500 uppercase tracking-wider mb-2">
                  Adjustment Amount (KSh)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-zinc-500">KSh</span>
                  <input
                    type="number"
                    step="any"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    placeholder="e.g. 50 or -20"
                    className="w-full bg-zinc-950 border-2 border-zinc-800 focus:border-green-500 focus:outline-none rounded-xl pl-14 pr-4 py-3 font-bold text-white text-lg transition-colors"
                    required
                  />
                </div>
                <p className="text-[10px] text-zinc-500 mt-2 font-medium">
                  Use positive numbers to add balance (Credit) and negative numbers to deduct balance (Debit).
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold py-3 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdjusting}
                  className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white font-black py-3 rounded-xl shadow-[0_4px_0_#166534] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isAdjusting ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  {isAdjusting ? 'Applying…' : 'Apply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Question Modal */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsQuestionModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black mb-4 text-white">
              {selectedQuestion ? 'Edit Question' : 'Add New Question'}
            </h3>

            <form onSubmit={handleQuestionSubmit}>
              {/* Question Text */}
              <div className="mb-4">
                <label className="block text-xs font-extrabold text-zinc-500 uppercase tracking-wider mb-2">
                  Question Prompt
                </label>
                <textarea
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="e.g. What is the national emblem of Kenya?"
                  rows={2}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-green-500 focus:outline-none rounded-xl p-3 font-bold text-white text-sm transition-colors"
                  required
                />
              </div>

              {/* Options */}
              <div className="mb-4">
                <label className="block text-xs font-extrabold text-zinc-500 uppercase tracking-wider mb-2">
                  Multiple-Choice Options (Exactly 4)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[0, 1, 2, 3].map((idx) => (
                    <div key={idx} className="relative flex items-center">
                      <span className="absolute left-3 font-black text-xs text-zinc-500">
                        {['A', 'B', 'C', 'D'][idx]}
                      </span>
                      <input
                        type="text"
                        value={qOptions[idx]}
                        onChange={(e) => {
                          const newOpts = [...qOptions];
                          newOpts[idx] = e.target.value;
                          setQOptions(newOpts);
                        }}
                        placeholder={`Option ${['A', 'B', 'C', 'D'][idx]}...`}
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-green-500 focus:outline-none rounded-xl pl-8 pr-3 py-2.5 text-xs font-bold text-white transition-colors"
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Correct Answer */}
              <div className="mb-6">
                <label className="block text-xs font-extrabold text-zinc-500 uppercase tracking-wider mb-2">
                  Correct Answer Choice
                </label>
                <div className="flex gap-2">
                  {[0, 1, 2, 3].map((idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setQCorrect(idx)}
                      className={clsx(
                        "flex-1 py-2 rounded-xl font-extrabold text-xs transition-colors cursor-pointer border",
                        qCorrect === idx 
                          ? "bg-green-600 border-green-500 text-white" 
                          : "bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-zinc-300"
                      )}
                    >
                      Option {['A', 'B', 'C', 'D'][idx]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="flex-1 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold py-3 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingQuestion}
                  className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white font-black py-3 rounded-xl shadow-[0_4px_0_#166534] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSavingQuestion ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  {isSavingQuestion ? 'Saving…' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Question } from './questions';
import { io, Socket } from 'socket.io-client';

export type MatchStatus = 'idle' | 'waiting' | 'live' | 'finished' | 'invite';

export interface RoomPlayer {
  userId: string;
  name: string;
}

interface Player {
  id: string;
  name: string;
  score: number;
  timeTaken: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  mpesa_code: string | null;
  created_at: string;
}

interface QuizState {
  // Auth
  userId: string | null;
  phone: string;
  playerName: string;

  // Wallet
  walletBalance: number;
  transactions: Transaction[];

  // Matchmaking
  matchStatus: MatchStatus;
  playersInQueue: number;
  entryFee: number;
  privateMatchId: string | null;
  privateRoomPlayers: RoomPlayer[];

  // Gameplay
  matchId: string | null;
  questions: Pick<Question, 'id' | 'text' | 'options'>[];
  currentQuestionIndex: number;
  globalTimeLeft: number;
  timerStart: string | null;
  lastAnswerCorrect: boolean | null;

  // Results
  leaderboard: Player[];
  winnerId: string | null;
  winnings: number;
  totalPot: number;
  platformFee: number;

  // Polling / Timer handles
  _pollInterval: ReturnType<typeof setInterval> | null;

  // --- Actions ---
  login: (phone: string, name?: string, action?: 'login' | 'register', password?: string) => Promise<void>;
  logout: () => void;
  setEntryFee: (fee: number) => void;
  setPlayerName: (name: string) => void;
  loadBalance: () => Promise<void>;
  loadTransactions: () => Promise<void>;
  deposit: (amount: number, phone: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  withdraw: (amount: number, phone: string) => Promise<{ success: boolean; error?: string }>;
  joinMatch: () => Promise<void>;
  leaveQueue: () => Promise<void>;
  createPrivateMatch: () => Promise<string | null>;
  joinPrivateMatch: (roomId: string) => Promise<void>;
  startPrivateMatch: (roomId: string) => Promise<void>;
  submitAnswer: (questionIndex: number, selectedOption: number) => Promise<void>;
  stopPolling: () => void;
  resetMatch: () => void;
  connectSocket: () => void;
}

// --- Helpers ---
const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || '';

let socket: Socket | null = null;

async function apiFetch(path: string, opts?: RequestInit) {
  try {
    const res = await fetch(`${BASE}/api/${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...opts,
    });
    if (!res.ok) {
      try {
        const errData = await res.json();
        return { error: errData.error || `Server error (Status ${res.status})` };
      } catch {
        return { error: `Server error (Status ${res.status})` };
      }
    }
    return res.json();
  } catch (err) {
    return { error: 'Network connection failed. Check your connection.' };
  }
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      // Auth
      userId: null,
      phone: '',
      playerName: 'Player',

      // Wallet
      walletBalance: 0,
      transactions: [],

      // Matchmaking
      matchStatus: 'idle',
      playersInQueue: 0,
      entryFee: 10,
      privateMatchId: null,
      privateRoomPlayers: [],

      // Gameplay
      matchId: null,
      questions: [],
      currentQuestionIndex: 0,
      globalTimeLeft: 60,
      timerStart: null,
      lastAnswerCorrect: null,

      // Results
      leaderboard: [],
      winnerId: null,
      winnings: 0,
      totalPot: 0,
      platformFee: 0,

      _pollInterval: null,

      // ----------------------------------------------------------------
      connectSocket: () => {
        const { userId } = get();
        if (!userId || socket) return;

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || (typeof window !== 'undefined'
          ? `${window.location.protocol}//${window.location.hostname}:5000`
          : 'http://localhost:5000');

        socket = io(backendUrl, {
          autoConnect: true,
          path: '/socket.io',
          transports: ['websocket', 'polling'],
        });

        socket.on('connect', () => {
          console.log('Socket connected');
          socket?.emit('auth', userId);
        });

        socket.on('queue_update', ({ playersCount }: { playersCount: number }) => {
          set({ playersInQueue: playersCount });
        });

        socket.on('match_found', (data: { matchId: string; targetPlayers: number; entryFee: number; questions: any[] }) => {
          set({
            matchStatus: 'live',
            matchId: data.matchId,
            questions: data.questions,
            timerStart: new Date().toISOString(),
            currentQuestionIndex: 0,
            globalTimeLeft: 60,
            lastAnswerCorrect: null,
            leaderboard: [],
          });
        });

        socket.on('timer_tick', ({ timeLeft }: { timeLeft: number }) => {
          set({ globalTimeLeft: timeLeft });
        });

        socket.on('private_created', (data: { roomId: string; entryFee: number }) => {
          set({
            matchStatus: 'invite',
            privateMatchId: data.roomId,
          });
        });

        socket.on('private_update', (data: { players: RoomPlayer[]; entryFee: number }) => {
          set({
            privateRoomPlayers: data.players,
            entryFee: data.entryFee,
          });
        });

        socket.on('answer_result', (data: { questionIndex: number; correct: boolean; score: number; gameOver: boolean }) => {
          set({ lastAnswerCorrect: data.correct });
          if (!data.gameOver) {
            // Move to next question after 600ms
            setTimeout(() => {
              set((s) => ({
                currentQuestionIndex: Math.min(s.currentQuestionIndex + 1, s.questions.length - 1),
                lastAnswerCorrect: null,
              }));
            }, 600);
          }
        });

        socket.on('game_over', (data: { leaderboard: any[]; winnerId: string; winnings: number; totalPot: number; platformFee: number }) => {
          set({
            matchStatus: 'finished',
            leaderboard: data.leaderboard,
            winnerId: data.winnerId,
            winnings: data.winnings,
            totalPot: data.totalPot,
            platformFee: data.platformFee,
          });
          get().loadBalance();
        });

        socket.on('error', (msg: string) => {
          console.error('Socket error:', msg);
        });
      },

      login: async (phone: string, name?: string, action?: 'login' | 'register', password?: string) => {
        const data = await apiFetch('auth/login', {
          method: 'POST',
          body: JSON.stringify({ phone, name, action, password }),
        });
        if (data.error) {
          throw new Error(data.error);
        }
        if (data.id) {
          set({
            userId: data.id,
            phone: data.phone,
            playerName: data.name,
            walletBalance: data.wallet_balance,
            matchStatus: 'idle',
          });
          get().connectSocket();
        }
      },

      logout: () => {
        get().stopPolling();
        if (socket) {
          socket.disconnect();
          socket = null;
        }
        set({
          userId: null,
          phone: '',
          playerName: 'Player',
          walletBalance: 0,
          matchStatus: 'idle',
          matchId: null,
          privateRoomPlayers: [],
        });
      },

      setEntryFee: (fee: number) => set({ entryFee: fee }),
      setPlayerName: (name: string) => set({ playerName: name }),

      // ----------------------------------------------------------------
      loadBalance: async () => {
        const { userId } = get();
        if (!userId) return;
        const data = await apiFetch(`wallet/balance/${userId}`);
        if (data.balance !== undefined) set({ walletBalance: data.balance });
      },

      loadTransactions: async () => {
        const { userId } = get();
        if (!userId) return;
        const data = await apiFetch(`wallet/transactions/${userId}`);
        if (Array.isArray(data)) set({ transactions: data });
      },

      deposit: async (amount: number, phone: string, pin: string) => {
        const { userId } = get();
        if (!userId) return { success: false, error: 'Not logged in' };
        const data = await apiFetch('wallet/deposit', {
          method: 'POST',
          body: JSON.stringify({ userId, amount, phone, pin }),
        });
        if (data.success) {
          set({ walletBalance: data.newBalance });
          get().loadTransactions();
          return { success: true };
        }
        return { success: false, error: data.error };
      },

      withdraw: async (amount: number, phone: string) => {
        const { userId } = get();
        if (!userId) return { success: false, error: 'Not logged in' };
        const data = await apiFetch('wallet/withdraw', {
          method: 'POST',
          body: JSON.stringify({ userId, amount, phone }),
        });
        if (data.success) {
          set({ walletBalance: data.newBalance });
          get().loadTransactions();
          return { success: true };
        }
        return { success: false, error: data.error };
      },

      // ----------------------------------------------------------------
      joinMatch: async () => {
        const { userId, entryFee, matchStatus } = get();
        if (!userId || matchStatus !== 'idle') return;

        set({ matchStatus: 'waiting', playersInQueue: 1 });
        get().connectSocket();

        socket?.emit('join_queue', { tier: entryFee, userId });
      },

      leaveQueue: async () => {
        const { userId } = get();
        get().stopPolling();
        set({ matchStatus: 'idle', playersInQueue: 0 });
        if (userId) {
          await apiFetch('queue/leave', { method: 'POST', body: JSON.stringify({ userId }) });
        }
        if (socket) {
          socket.disconnect();
          socket = null;
        }
      },

      // ----------------------------------------------------------------
      createPrivateMatch: async () => {
        const { userId, entryFee } = get();
        if (!userId) return null;
        const data = await apiFetch('private/create', {
          method: 'POST',
          body: JSON.stringify({ userId, entryFee }),
        });
        if (data.roomId) {
          set({ matchStatus: 'invite', privateMatchId: data.roomId });
          get().connectSocket();
          socket?.emit('join_private', { roomId: data.roomId, userId });
          return data.roomId;
        }
        return null;
      },

      joinPrivateMatch: async (roomId: string) => {
        const { userId } = get();
        if (!userId) return;
        const data = await apiFetch(`private/${roomId}/join`, {
          method: 'POST',
          body: JSON.stringify({ userId }),
        });
        if (data.success) {
          set({ matchStatus: 'waiting', privateMatchId: roomId });
          get().connectSocket();
          socket?.emit('join_private', { roomId, userId });
        }
      },

      startPrivateMatch: async (roomId: string) => {
        const { userId } = get();
        socket?.emit('start_private', { roomId, userId });
      },

      // ----------------------------------------------------------------
      submitAnswer: async (questionIndex: number, selectedOption: number) => {
        const { userId, matchId } = get();
        if (!userId || !matchId) return;

        socket?.emit('submit_answer', { matchId, questionIndex, selectedOption, userId });
      },

      // ----------------------------------------------------------------
      stopPolling: () => {
        const { _pollInterval } = get();
        if (_pollInterval) {
          clearInterval(_pollInterval);
          set({ _pollInterval: null });
        }
      },

      resetMatch: () => {
        get().stopPolling();
        set({
          matchStatus: 'idle',
          matchId: null,
          questions: [],
          currentQuestionIndex: 0,
          globalTimeLeft: 60,
          timerStart: null,
          leaderboard: [],
          lastAnswerCorrect: null,
          privateMatchId: null,
          winnerId: null,
          winnings: 0,
          privateRoomPlayers: [],
        });
      },
    } as any),
    {
      name: 'chapaquiz-store',
      partialize: (s) => ({
        userId: s.userId,
        phone: s.phone,
        playerName: s.playerName,
        walletBalance: s.walletBalance,
        entryFee: s.entryFee,
      }),
    }
  )
);

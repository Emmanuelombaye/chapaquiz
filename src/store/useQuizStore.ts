import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { KENYAN_QUESTIONS_BANK, Question } from './questions';

type MatchStatus = 'idle' | 'waiting' | 'starting' | 'live' | 'finished';

interface Player {
  id: string;
  name: string;
  score: number;
  timeTaken: number;
}

interface QuizState {
  // User/Wallet
  playerName: string;
  walletBalance: number;
  
  // Matchmaking
  matchStatus: MatchStatus | 'invite';
  playersInRoom: number;
  targetPlayers: number;
  entryFee: number;
  privateMatchId: string | null;
  
  // Gameplay
  questions: Question[];
  currentQuestionIndex: number;
  globalTimeLeft: number;
  
  // Leaderboard
  leaderboard: Player[];
  
  // Actions
  setPlayerName: (name: string) => void;
  setWalletBalance: (balance: number) => void;
  setEntryFee: (fee: number) => void;
  setMatchStatus: (status: MatchStatus | 'invite') => void;
  joinMatch: () => void;
  createPrivateMatch: () => string;
  joinPrivateMatch: (id: string, customFee?: number) => void;
  submitAnswer: (questionIndex: number, selectedOption: number) => void;
  endMatch: () => void;
  decrementTimer: () => void;
}

const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      playerName: 'Player 1',
      walletBalance: 150,
      
      matchStatus: 'idle',
      playersInRoom: 0,
      targetPlayers: 5,
      entryFee: 10,
      privateMatchId: null,
      
      questions: [],
      currentQuestionIndex: 0,
      globalTimeLeft: 60,
      
      leaderboard: [],
      
      setPlayerName: (name) => set({ playerName: name }),
      setWalletBalance: (balance) => set({ walletBalance: balance }),
      setEntryFee: (fee) => set({ entryFee: fee }),
      setMatchStatus: (status) => set({ matchStatus: status }),
  
  joinMatch: () => {
    const { walletBalance, entryFee, matchStatus } = get();
    if (matchStatus !== 'idle') return;

    if (walletBalance >= entryFee) {
      // Randomize players between 2 and 10
      const randomTotalPlayers = Math.floor(Math.random() * 9) + 2;
      
      set({ 
        walletBalance: walletBalance - entryFee,
        matchStatus: 'waiting',
        playersInRoom: 1,
        targetPlayers: randomTotalPlayers,
        questions: shuffleArray(KENYAN_QUESTIONS_BANK).slice(0, 5)
      });
      
      // Simulate random players joining dynamically
      let current = 1;
      const interval = setInterval(() => {
        current += Math.floor(Math.random() * 3) + 1;
        if (current >= randomTotalPlayers) {
          clearInterval(interval);
          set({ playersInRoom: randomTotalPlayers, matchStatus: 'starting' });
          setTimeout(() => set({ matchStatus: 'live', globalTimeLeft: 60, currentQuestionIndex: 0 }), 1000);
        } else {
          set({ playersInRoom: current });
        }
      }, 400);
    }
  },

  createPrivateMatch: () => {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { walletBalance, entryFee } = get();
    if (walletBalance >= entryFee) {
      set({
        walletBalance: walletBalance - entryFee,
        matchStatus: 'invite',
        privateMatchId: roomId,
        playersInRoom: 1,
        targetPlayers: 5, // Private matches default to 5 unless host specifies otherwise
        questions: shuffleArray(KENYAN_QUESTIONS_BANK).slice(0, 5)
      });
    }
    return roomId;
  },

  joinPrivateMatch: (id, customFee) => {
    const feeToUse = customFee || get().entryFee;
    const { walletBalance } = get();
    
    if (walletBalance >= feeToUse) {
      // Setting entry fee to the host's custom fee for math purposes
      set({
        walletBalance: walletBalance - feeToUse,
        entryFee: feeToUse,
        matchStatus: 'waiting',
        privateMatchId: id,
        playersInRoom: 2,
        targetPlayers: Math.floor(Math.random() * 4) + 2,
        questions: shuffleArray(KENYAN_QUESTIONS_BANK).slice(0, 5)
      });
      
      setTimeout(() => set({ matchStatus: 'starting' }), 2000);
      setTimeout(() => set({ matchStatus: 'live', globalTimeLeft: 60, currentQuestionIndex: 0 }), 4000);
    }
  },
  
  submitAnswer: (questionIndex, selectedOption) => {
    const { questions, currentQuestionIndex, endMatch } = get();
    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => set({ currentQuestionIndex: currentQuestionIndex + 1 }), 500); 
    } else {
      setTimeout(() => endMatch(), 500); 
    }
  },
  
  endMatch: () => {
    const { playersInRoom, entryFee, walletBalance } = get();
    const myScore = Math.floor(Math.random() * 6);
    const myTime = Math.floor(Math.random() * 30) + 10;
    
    // Generate leaderboard based on exact dynamic playersInRoom
    const board = [{ id: '1', name: 'You', score: myScore, timeTaken: myTime }];
    
    for (let i = 2; i <= playersInRoom; i++) {
      board.push({
        id: i.toString(),
        name: `Player ${i}`,
        score: Math.floor(Math.random() * 6),
        timeTaken: Math.floor(Math.random() * 40) + 15
      });
    }
    
    // Sort board by score (desc), then time (asc)
    board.sort((a, b) => b.score - a.score || a.timeTaken - b.timeTaken);
    
    const didWin = board[0].id === '1';
    
    // Exact Math requested by user:
    // Pot = 10 players * 10 fee = 100
    // Winner = 100 minus 20% system fee = 80
    const totalPot = playersInRoom * entryFee;
    const platformFee = totalPot * 0.20;
    const winnings = totalPot - platformFee;
    
    if (didWin) {
      set({ walletBalance: walletBalance + winnings });
    }

    set({
      matchStatus: 'finished',
      leaderboard: board
    });
  },
  
  decrementTimer: () => {
    const { globalTimeLeft, matchStatus, endMatch } = get();
    if (matchStatus === 'live' && globalTimeLeft > 0) {
      set({ globalTimeLeft: globalTimeLeft - 1 });
    } else if (matchStatus === 'live' && globalTimeLeft === 0) {
      endMatch();
    }
  }
}),
{
  name: 'chapaquiz-store'
}
));


import { create } from 'zustand';

type MatchStatus = 'idle' | 'waiting' | 'starting' | 'live' | 'finished';

interface Player {
  id: string;
  name: string;
  score: number;
  timeTaken: number;
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

interface QuizState {
  // User/Wallet
  walletBalance: number;
  
  // Matchmaking
  matchStatus: MatchStatus | 'invite';
  playersInRoom: number;
  entryFee: number;
  privateMatchId: string | null;
  
  // Gameplay
  questions: Question[];
  currentQuestionIndex: number;
  globalTimeLeft: number;
  
  // Leaderboard
  leaderboard: Player[];
  
  // Actions
  setWalletBalance: (balance: number) => void;
  setMatchStatus: (status: MatchStatus | 'invite') => void;
  joinMatch: () => void;
  createPrivateMatch: () => string;
  joinPrivateMatch: (id: string) => void;
  submitAnswer: (questionIndex: number, selectedOption: number) => void;
  endMatch: () => void;
  decrementTimer: () => void;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  walletBalance: 50,
  
  matchStatus: 'idle',
  playersInRoom: 0,
  entryFee: 20,
  privateMatchId: null,
  
  questions: [
    {
      id: 'q1',
      text: 'Which of the following is strictly typed?',
      options: ['JavaScript', 'Python', 'TypeScript', 'Ruby'],
      correctAnswer: 2
    },
    {
      id: 'q2',
      text: 'What does CSS stand for?',
      options: ['Cascading Style Sheets', 'Colorful Style Sheets', 'Computer Style Sheets', 'Creative Style Sheets'],
      correctAnswer: 0
    },
    {
      id: 'q3',
      text: 'In React, what hook is used for side effects?',
      options: ['useState', 'useEffect', 'useReducer', 'useContext'],
      correctAnswer: 1
    },
    {
      id: 'q4',
      text: 'Which company developed Next.js?',
      options: ['Google', 'Facebook', 'Vercel', 'Microsoft'],
      correctAnswer: 2
    },
    {
      id: 'q5',
      text: 'What is the standard port for HTTP?',
      options: ['21', '443', '8080', '80'],
      correctAnswer: 3
    }
  ],
  currentQuestionIndex: 0,
  globalTimeLeft: 60,
  
  leaderboard: [],
  
  setWalletBalance: (balance) => set({ walletBalance: balance }),
  setMatchStatus: (status) => set({ matchStatus: status }),
  
  joinMatch: () => {
    // Mock joining a public match
    const { walletBalance, entryFee } = get();
    if (walletBalance >= entryFee) {
      set({ 
        walletBalance: walletBalance - entryFee,
        matchStatus: 'waiting',
        playersInRoom: 1
      });
      
      // Simulate other players joining
      setTimeout(() => set({ playersInRoom: 2 }), 1000);
      setTimeout(() => set({ playersInRoom: 3 }), 2000);
      setTimeout(() => set({ playersInRoom: 5, matchStatus: 'starting' }), 3000);
      setTimeout(() => set({ matchStatus: 'live', globalTimeLeft: 60, currentQuestionIndex: 0 }), 6000);
    }
  },

  createPrivateMatch: () => {
    // Generates a mock invite link room ID and puts host in waiting room
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { walletBalance, entryFee } = get();
    if (walletBalance >= entryFee) {
      set({
        walletBalance: walletBalance - entryFee,
        matchStatus: 'invite',
        privateMatchId: roomId,
        playersInRoom: 1
      });
    }
    return roomId;
  },

  joinPrivateMatch: (id) => {
    const { walletBalance, entryFee } = get();
    if (walletBalance >= entryFee) {
      set({
        walletBalance: walletBalance - entryFee,
        matchStatus: 'waiting',
        privateMatchId: id,
        playersInRoom: 2 // Assuming host is there
      });
      
      // Simulate starting the private match once someone joins
      setTimeout(() => set({ matchStatus: 'starting' }), 2000);
      setTimeout(() => set({ matchStatus: 'live', globalTimeLeft: 60, currentQuestionIndex: 0 }), 5000);
    }
  },
  
  submitAnswer: (questionIndex, selectedOption) => {
    // This will be replaced by socket.io emit later
    const { questions, currentQuestionIndex } = get();
    // Move to next question if not at the end
    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => set({ currentQuestionIndex: currentQuestionIndex + 1 }), 500); // Small delay for visual feedback
    }
  },
  
  endMatch: () => {
    // Mock ending match and generating leaderboard
    set({
      matchStatus: 'finished',
      leaderboard: [
        { id: '1', name: 'You', score: 4, timeTaken: 20 },
        { id: '2', name: 'Player 2', score: 4, timeTaken: 25 },
        { id: '3', name: 'Player 3', score: 3, timeTaken: 30 },
      ]
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
}));

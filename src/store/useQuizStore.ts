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

const KENYAN_QUESTIONS_BANK: Question[] = [
  { id: 'k1', text: 'What is the capital city of Kenya?', options: ['Mombasa', 'Nairobi', 'Kisumu', 'Nakuru'], correctAnswer: 1 },
  { id: 'k2', text: 'Which county uses the code 039?', options: ['Mombasa', 'Kwale', 'Kilifi', 'Lamu'], correctAnswer: 1 },
  { id: 'k3', text: 'What is the capital city of France?', options: ['Berlin', 'Madrid', 'Paris', 'Rome'], correctAnswer: 2 },
  { id: 'k4', text: 'Who is the current President of Kenya?', options: ['Uhuru Kenyatta', 'William Ruto', 'Raila Odinga', 'Mwai Kibaki'], correctAnswer: 1 },
  { id: 'k5', text: 'Which ocean borders Kenya to the East?', options: ['Atlantic Ocean', 'Indian Ocean', 'Pacific Ocean', 'Arctic Ocean'], correctAnswer: 1 },
  { id: 'k6', text: 'What is the national language of Kenya?', options: ['English', 'Kikuyu', 'Swahili', 'Sheng'], correctAnswer: 2 },
  { id: 'k7', text: 'What is the highest mountain in Kenya?', options: ['Mt. Kilimanjaro', 'Mt. Kenya', 'Mt. Elgon', 'Mt. Longonot'], correctAnswer: 1 },
  { id: 'k8', text: 'In which year did Kenya gain independence?', options: ['1960', '1963', '1964', '1952'], correctAnswer: 1 },
  { id: 'k9', text: 'Which famous wildlife migration happens in the Maasai Mara?', options: ['Elephant', 'Wildebeest', 'Zebra', 'Lion'], correctAnswer: 1 },
  { id: 'k10', text: 'Which is the longest river in Kenya?', options: ['Athi River', 'Mara River', 'Tana River', 'Ewaso Ng\'iro'], correctAnswer: 2 },
  { id: 'k11', text: 'Which country borders Kenya to the South?', options: ['Uganda', 'Ethiopia', 'Somalia', 'Tanzania'], correctAnswer: 3 },
  { id: 'k12', text: 'What is the official currency of Kenya?', options: ['Dollar', 'Euro', 'Kenyan Shilling', 'CFA Franc'], correctAnswer: 2 },
  { id: 'k13', text: 'Which is the largest lake in Kenya?', options: ['Lake Nakuru', 'Lake Victoria', 'Lake Turkana', 'Lake Naivasha'], correctAnswer: 1 },
  { id: 'k14', text: 'Who was the first President of Kenya?', options: ['Daniel arap Moi', 'Jomo Kenyatta', 'Oginga Odinga', 'Tom Mboya'], correctAnswer: 1 },
  { id: 'k15', text: 'Which of the following is NOT part of the Big Five?', options: ['Lion', 'Leopard', 'Cheetah', 'Rhino'], correctAnswer: 2 },
  { id: 'k16', text: 'What is the name of the Kenyan national football team?', options: ['Super Eagles', 'Harambee Stars', 'Black Stars', 'Taifa Stars'], correctAnswer: 1 },
  { id: 'k17', text: 'What color is the top stripe of the Kenyan flag?', options: ['Red', 'Green', 'Black', 'White'], correctAnswer: 2 },
  { id: 'k18', text: 'What does the Swahili phrase "Hakuna Matata" mean?', options: ['Good Morning', 'Thank You', 'No Worries', 'Welcome'], correctAnswer: 2 },
  { id: 'k19', text: 'Which Kenyan athlete is widely considered the greatest marathoner?', options: ['Eliud Kipchoge', 'David Rudisha', 'Paul Tergat', 'Julius Yego'], correctAnswer: 0 },
  { id: 'k20', text: 'What is the airport code for Jomo Kenyatta International Airport?', options: ['JKA', 'NBO', 'KNY', 'MBA'], correctAnswer: 1 },
  { id: 'k21', text: 'Which city hosts the United Nations Environment Programme (UNEP) headquarters?', options: ['Geneva', 'New York', 'Nairobi', 'Addis Ababa'], correctAnswer: 2 },
  { id: 'k22', text: 'Which county uses the code 001?', options: ['Nairobi', 'Mombasa', 'Kisumu', 'Kwale'], correctAnswer: 1 },
  { id: 'k23', text: 'Which county uses the code 016?', options: ['Machakos', 'Kitui', 'Makueni', 'Kiambu'], correctAnswer: 0 },
  { id: 'k24', text: 'Which county uses the code 032?', options: ['Baringo', 'Uasin Gishu', 'Nakuru', 'Narok'], correctAnswer: 2 },
  { id: 'k25', text: 'Which county uses the code 042?', options: ['Homa Bay', 'Migori', 'Kisii', 'Kisumu'], correctAnswer: 3 },
  { id: 'k26', text: 'Which Kenyan lake is most famous for its flamingos?', options: ['Lake Bogoria', 'Lake Nakuru', 'Lake Baringo', 'Lake Magadi'], correctAnswer: 1 },
  { id: 'k27', text: 'Who is the current CEO of Safaricom (as of 2024)?', options: ['Michael Joseph', 'Bob Collymore', 'Peter Ndegwa', 'James Mwangi'], correctAnswer: 2 },
  { id: 'k28', text: 'What is the common staple food in Kenya made from maize flour?', options: ['Chapati', 'Pilau', 'Ugali', 'Nyama Choma'], correctAnswer: 2 },
  { id: 'k29', text: 'Which Kenyan won the Nobel Peace Prize in 2004?', options: ['Wangari Maathai', 'Lupita Nyong\'o', 'Ngugi wa Thiong\'o', 'Richard Leakey'], correctAnswer: 0 },
  { id: 'k30', text: 'Which is the largest national park in Kenya?', options: ['Nairobi National Park', 'Amboseli', 'Tsavo', 'Maasai Mara'], correctAnswer: 2 },
  { id: 'k31', text: 'How many counties are there in Kenya?', options: ['42', '45', '47', '50'], correctAnswer: 2 },
  { id: 'k32', text: 'What is the acronym for Kenya\'s modern high-speed railway?', options: ['SGR', 'KRC', 'MRT', 'BRT'], correctAnswer: 0 },
  { id: 'k33', text: 'Which famous community is known for inhabiting the Maasai Mara region?', options: ['Kikuyu', 'Luo', 'Maasai', 'Kalenjin'], correctAnswer: 2 },
  { id: 'k34', text: 'Nairobi is commonly referred to as the "Green City in the..."?', options: ['Sun', 'Valley', 'Clouds', 'Savannah'], correctAnswer: 0 },
  { id: 'k35', text: 'Which major Kenyan town is located exactly on the Equator?', options: ['Eldoret', 'Nanyuki', 'Naivasha', 'Isiolo'], correctAnswer: 1 },
  { id: 'k36', text: 'Lamu Island is located in which body of water?', options: ['Lake Victoria', 'Indian Ocean', 'Red Sea', 'Lake Turkana'], correctAnswer: 1 },
  { id: 'k37', text: 'Who wrote the famous novel "Weep Not, Child"?', options: ['Binyavanga Wainaina', 'Margaret Ogola', 'Ngugi wa Thiong\'o', 'Meja Mwangi'], correctAnswer: 2 },
  { id: 'k38', text: 'What nickname is often given to Kenya\'s growing tech ecosystem?', options: ['Silicon Valley', 'Silicon Savannah', 'Tech Cape', 'AfriTech'], correctAnswer: 1 },
  { id: 'k39', text: 'What is the official Swahili word for tea?', options: ['Kahawa', 'Maji', 'Chai', 'Maziwa'], correctAnswer: 2 },
  { id: 'k40', text: 'What is the international dialing code for Kenya?', options: ['+255', '+256', '+254', '+250'], correctAnswer: 2 }
];

const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const useQuizStore = create<QuizState>((set, get) => ({
  walletBalance: 50,
  
  matchStatus: 'idle',
  playersInRoom: 0,
  entryFee: 20,
  privateMatchId: null,
  
  questions: [],
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
        playersInRoom: 1,
        questions: shuffleArray(KENYAN_QUESTIONS_BANK).slice(0, 5)
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
        playersInRoom: 1,
        questions: shuffleArray(KENYAN_QUESTIONS_BANK).slice(0, 5)
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
        playersInRoom: 2, // Assuming host is there
        questions: shuffleArray(KENYAN_QUESTIONS_BANK).slice(0, 5)
      });
      
      // Simulate starting the private match once someone joins
      setTimeout(() => set({ matchStatus: 'starting' }), 2000);
      setTimeout(() => set({ matchStatus: 'live', globalTimeLeft: 60, currentQuestionIndex: 0 }), 5000);
    }
  },
  
  submitAnswer: (questionIndex, selectedOption) => {
    // This will be replaced by socket.io emit later
    const { questions, currentQuestionIndex, endMatch } = get();
    // Move to next question if not at the end
    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => set({ currentQuestionIndex: currentQuestionIndex + 1 }), 500); // Small delay for visual feedback
    } else {
      setTimeout(() => endMatch(), 500); // End match automatically after the last question!
    }
  },
  
  endMatch: () => {
    const { playersInRoom, entryFee, walletBalance } = get();
    // Generate mock leaderboard
    const myScore = Math.floor(Math.random() * 6);
    const myTime = Math.floor(Math.random() * 30) + 10;
    
    const board = [
      { id: '1', name: 'You', score: myScore, timeTaken: myTime },
      { id: '2', name: 'Player 2', score: Math.floor(Math.random() * 6), timeTaken: Math.floor(Math.random() * 40) + 15 },
      { id: '3', name: 'Player 3', score: Math.floor(Math.random() * 6), timeTaken: Math.floor(Math.random() * 40) + 15 },
      { id: '4', name: 'Player 4', score: Math.floor(Math.random() * 6), timeTaken: Math.floor(Math.random() * 40) + 15 },
      { id: '5', name: 'Player 5', score: Math.floor(Math.random() * 6), timeTaken: Math.floor(Math.random() * 40) + 15 },
    ].slice(0, playersInRoom); // Only show as many players as were in the room
    
    // Sort board by score (desc), then time (asc)
    board.sort((a, b) => b.score - a.score || a.timeTaken - b.timeTaken);
    
    const didWin = board[0].id === '1';
    const pot = playersInRoom * entryFee;
    
    if (didWin) {
      set({ walletBalance: walletBalance + pot });
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
}));

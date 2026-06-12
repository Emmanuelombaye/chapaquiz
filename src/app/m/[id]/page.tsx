'use client';

import { useQuizStore } from '@/store/useQuizStore';
import { useRouter } from 'next/navigation';
import { Play, ArrowLeft, Users, Loader2, Crown } from 'lucide-react';
import { useEffect, useState, use } from 'react';

interface RoomPlayer {
  userId: string;
  name: string;
}

interface RoomInfo {
  roomId: string;
  entryFee: number;
  hostUserId: string;
  status: string;
  players: RoomPlayer[];
  matchId: string | null;
}

export default function JoinPrivateMatch({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const {
    userId,
    walletBalance,
    matchStatus,
    joinPrivateMatch,
    resetMatch,
    privateRoomPlayers,
    startPrivateMatch,
    connectSocket,
  } = useQuizStore();
  const resolvedParams = use(params);
  const roomId = resolvedParams.id;

  const [room, setRoom] = useState<RoomInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [starting, setStarting] = useState(false);

  const fetchRoom = async () => {
    try {
      const res = await fetch(`/api/private/${roomId}`);
      const data = await res.json();
      if (data.roomId) {
        setRoom(data);
        setIsHost(data.hostUserId === userId);
        
        // If match started, redirect all to quiz
        if (data.matchId) {
          router.push('/quiz');
          return;
        }

        // If this user is already in the player list, join the socket room automatically
        const isAlreadyIn = data.players.some((p: any) => p.userId === userId);
        if (isAlreadyIn && userId) {
          connectSocket();
          useQuizStore.setState({
            privateMatchId: roomId,
            privateRoomPlayers: data.players,
          });
          joinPrivateMatch(roomId);
        }
      }
    } catch (err) {
      console.error('Error fetching room:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchRoom();
    } else {
      setLoading(false);
    }
  }, [userId, roomId]);

  useEffect(() => {
    if (matchStatus === 'live') {
      router.push('/quiz');
    }
  }, [matchStatus, router]);

  const handleJoin = async () => {
    if (!userId) {
      router.push('/');
      return;
    }
    setJoining(true);
    setError('');
    try {
      await joinPrivateMatch(roomId);
      await fetchRoom();
    } catch (err) {
      setError('Failed to join match.');
    } finally {
      setJoining(false);
    }
  };

  const handleStart = async () => {
    if (!userId) return;
    setStarting(true);
    try {
      await startPrivateMatch(roomId);
    } catch (err) {
      setError('Failed to start match.');
      setStarting(false);
    }
  };

  const playersToRender = privateRoomPlayers.length > 0 ? privateRoomPlayers : (room?.players || []);
  const alreadyJoined = playersToRender.some((p) => p.userId === userId);
  const entryFee = room?.entryFee ?? 10;

  if (loading) {
    return (
      <main className="p-6 flex flex-col h-full max-w-md mx-auto justify-center items-center gap-4">
        <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
        <p className="text-zinc-500 font-medium">Loading room…</p>
      </main>
    );
  }

  if (!room) {
    return (
      <main className="p-6 flex flex-col h-full max-w-md mx-auto justify-center items-center gap-4">
        <p className="text-red-500 font-bold text-xl">Room not found</p>
        <button onClick={() => router.push('/')} className="text-zinc-500 hover:text-zinc-800 font-bold flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Lobby
        </button>
      </main>
    );
  }

  return (
    <main className="p-6 flex flex-col h-full max-w-md mx-auto justify-center">
      <div className="bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 p-8 rounded-3xl flex flex-col items-center text-center shadow-sm">
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl">🤝</span>
        </div>

        <h2 className="text-3xl font-black mb-1 text-zinc-900 dark:text-white">Private Room</h2>
        <p className="font-mono text-blue-600 dark:text-blue-400 font-black text-xl mb-6">{roomId}</p>

        <div className="w-full bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 mb-6 flex justify-between items-center">
          <span className="text-zinc-500 font-bold uppercase tracking-wider text-xs">Entry Fee</span>
          <span className="text-green-600 dark:text-green-500 font-black text-xl">KSh {entryFee}</span>
        </div>

        {/* Player list */}
        <div className="w-full mb-6">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 text-left flex items-center gap-2">
            <Users className="w-4 h-4" /> Players ({playersToRender.length})
          </p>
          <div className="flex flex-col gap-2">
            {playersToRender.map((p) => (
              <div key={p.userId} className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-900 px-4 py-3 rounded-xl">
                <span className="font-bold text-zinc-900 dark:text-white">{p.name}</span>
                {p.userId === room.hostUserId && (
                  <span className="flex items-center gap-1 text-yellow-500 text-xs font-bold">
                    <Crown className="w-3 h-3" /> Host
                  </span>
                )}
                {p.userId === userId && p.userId !== room.hostUserId && (
                  <span className="text-green-500 text-xs font-bold">You</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 font-bold text-sm mb-4">{error}</p>}

        {/* Action buttons */}
        {!alreadyJoined ? (
          walletBalance < entryFee ? (
            <div className="w-full">
              <p className="text-red-500 font-bold mb-4">Insufficient Balance (KSh {walletBalance})</p>
              <button onClick={() => router.push('/wallet')} className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-4 rounded-xl transition-colors">
                Top Up Wallet
              </button>
            </div>
          ) : (
            <button onClick={handleJoin} disabled={joining} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-2 shadow-[0_6px_0_#1d4ed8] active:shadow-none active:translate-y-1.5 transition-all text-xl mb-4">
              {joining ? <Loader2 className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6 fill-white" />}
              {joining ? 'Joining…' : 'Accept Challenge'}
            </button>
          )
        ) : isHost ? (
          <button
            onClick={handleStart}
            disabled={starting || playersToRender.length < 2}
            className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-2 shadow-[0_6px_0_#166534] active:shadow-none active:translate-y-1.5 transition-all text-xl mb-4"
          >
            {starting ? <Loader2 className="w-6 h-6 animate-spin" /> : '🚀'}
            {playersToRender.length < 2 ? 'Waiting for players…' : starting ? 'Starting…' : 'Start Match!'}
          </button>
        ) : (
          <div className="w-full bg-green-50 dark:bg-green-900/20 border border-green-500 rounded-xl px-4 py-4 text-center mb-4">
            <p className="text-green-700 dark:text-green-400 font-bold">✅ You've joined! Waiting for host to start…</p>
          </div>
        )}

        <button onClick={() => { resetMatch(); router.push('/'); }} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 font-bold transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Lobby
        </button>
      </div>
    </main>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Users, 
  Trophy, 
  Coins, 
  Info, 
  Loader2, 
  Zap, 
  TrendingUp, 
  DollarSign, 
  Timer,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  User,
  Hash
} from 'lucide-react';
import { 
  getPublicRoomDetails,
  getPublicPlayerStake,
  getPublicRoomPlayers,
  formatTokenAmount
} from '../services/publicBlockchain';
import { useWallet } from '../contexts/WalletContext';
import { CountdownTimer } from '../components/CountdownTimer';

export function RoomDetails() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userStake, setUserStake] = useState('0');
  const [players, setPlayers] = useState([]);
  const { address } = useWallet();

  // Get type from query params (settled or unsettled)
  const type = searchParams.get('type') || 'unsettled';
  const isWinner = searchParams.get('winner') === 'true';

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        setLoading(true);
        const roomDetails = await getPublicRoomDetails(roomId);
        setRoom(roomDetails);

        // Fetch players list
        const playersList = await getPublicRoomPlayers(roomId);
        setPlayers(playersList);

        // Fetch user's stake if connected
        if (address) {
          const stake = await getPublicPlayerStake(roomId, address);
          setUserStake(stake);
        }
      } catch (error) {
        console.error('Error fetching room details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchRoomData();
    }
  }, [roomId, address]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-red-500" />
          <p className="text-gray-400 text-lg">Loading room details...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Room Not Found</h2>
          <button 
            onClick={() => navigate(-1)}
            className="text-red-500 hover:text-red-400 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const payoutTypeText = room.payoutType === 0 ? 'Single Winner' : 'Top 3 Winners';
  const payoutDescription = room.payoutType === 0 
    ? 'Winner takes 100% of the prize pool' 
    : 'Top 3 winners split: 50% / 30% / 20%';
  const displayRoomId = parseInt(roomId) + 1;
  const isSettled = room.settled || type === 'settled';
  const isActive = !room.closed && !room.settled;

  return (
    <div className="min-h-screen bg-black text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back</span>
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Room #{displayRoomId}
            </h1>
            {isActive && (
              <motion.div
                className="px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-full"
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <span className="text-blue-400 text-sm font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  ACTIVE
                </span>
              </motion.div>
            )}
            {room.closed && !room.settled && (
              <div className="px-4 py-2 bg-gray-500/20 border border-gray-500/50 rounded-full">
                <span className="text-gray-400 text-sm font-bold">CLOSED</span>
              </div>
            )}
            {isSettled && (
              <div className={`px-4 py-2 rounded-full ${
                isWinner 
                  ? 'bg-emerald-500/20 border border-emerald-500/50' 
                  : 'bg-gray-500/20 border border-gray-500/50'
              }`}>
                <span className={`text-sm font-bold flex items-center gap-2 ${
                  isWinner ? 'text-emerald-400' : 'text-gray-400'
                }`}>
                  {isWinner ? (
                    <>
                      <Trophy className="w-4 h-4" />
                      YOU WON
                    </>
                  ) : (
                    'SETTLED'
                  )}
                </span>
              </div>
            )}
          </div>
          <p className="text-gray-400 text-lg">
            {isSettled ? 'This room has been settled' : 'Room details and status'}
          </p>
        </motion.div>

        {/* Room Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-6"
        >
          {/* Winner Result Banner (for settled rooms) */}
          {isSettled && (
            <div className={`glass-card rounded-2xl p-8 border-2 ${
              isWinner 
                ? 'border-emerald-500/40 bg-gradient-to-br from-emerald-500/20 to-transparent' 
                : 'border-gray-500/40 bg-gradient-to-br from-gray-500/10 to-transparent'
            }`}>
              <div className="flex flex-col items-center text-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                  isWinner ? 'bg-emerald-500/20' : 'bg-gray-500/20'
                }`}>
                  {isWinner ? (
                    <Trophy className="w-10 h-10 text-emerald-400" />
                  ) : (
                    <XCircle className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <h2 className={`text-3xl font-bold mb-2 ${
                  isWinner ? 'text-emerald-400' : 'text-gray-400'
                }`}>
                  {isWinner ? '🎉 Congratulations!' : 'Better Luck Next Time'}
                </h2>
                <p className="text-gray-400 text-lg">
                  {isWinner 
                    ? 'You won this room!' 
                    : 'You did not win this round. Keep trying!'}
                </p>
              </div>
            </div>
          )}

          {/* Total Pool - Highlighted at Top */}
          <div className="glass-card rounded-2xl p-6 border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-500/20 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-emerald-400" />
                </div>
                <span className="text-lg font-bold text-gray-300 uppercase tracking-wider">Total Pool</span>
              </div>
              <span className="text-4xl font-bold text-emerald-400">
                {formatTokenAmount(room.totalPool)} USDT
              </span>
            </div>
          </div>

          {/* Your Stake */}
          {address && userStake !== '0' && (
            <div className="glass-card rounded-2xl p-6 border-2 border-purple-500/40 bg-gradient-to-br from-purple-500/20 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <Coins className="w-6 h-6 text-purple-400" />
                  </div>
                  <span className="text-lg font-bold text-gray-300 uppercase tracking-wider">Your Stake</span>
                </div>
                <span className="text-4xl font-bold text-purple-400">
                  {formatTokenAmount(userStake)} USDT
                </span>
              </div>
            </div>
          )}

          {/* Stake Range */}
          <div className="glass-card rounded-2xl p-6 border border-red-500/30 bg-gradient-to-br from-red-500/10 to-transparent">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-500/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-red-400" />
              </div>
              <span className="text-lg font-bold text-gray-300 uppercase tracking-wider">Stake Range</span>
            </div>
            <div className="text-3xl md:text-4xl font-bold text-white">
              <span className="text-red-500">
                {formatTokenAmount(room.minStakeAmount)}
              </span>
              <span className="text-gray-400 mx-3">-</span>
              <span className="text-red-500">
                {formatTokenAmount(room.maxStakeAmount)}
              </span>
              <span className="text-gray-400 text-2xl ml-3">USDT</span>
            </div>
          </div>

          {/* Grid Layout for Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Players Info */}
            <div className="glass-card rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Players</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {room.currentPlayers || players.length || 0}
              </div>
              <div className="text-xs text-gray-400">Players in room</div>
            </div>

            {/* Countdown Timer / Status */}
            <div className="glass-card rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <Timer className="w-5 h-5 text-cyan-400" />
                </div>
                <span className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  {isSettled ? 'Status' : 'Settlement Time'}
                </span>
              </div>
              {isSettled ? (
                <div className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6" />
                  Settled
                </div>
              ) : (
                <CountdownTimer targetTimestamp={room.settlementTimestamp} className="text-base" />
              )}
            </div>

            {/* Payout Type */}
            <div className="glass-card rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <Award className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Payout Type</span>
              </div>
              <div className="text-2xl font-bold text-white mb-2">{payoutTypeText}</div>
              <div className="text-sm text-gray-400">{payoutDescription}</div>
            </div>
          </div>

          {/* Players List */}
          <div className="glass-card rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <Users className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="text-lg font-semibold text-gray-300 uppercase tracking-wider">
                Players in Room ({players.length})
              </span>
            </div>
            
            {players.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No players have joined this room yet.
              </div>
            ) : (
              <div className="space-y-3">
                {players.map((player, index) => {
                  const isCurrentUser = address && player.toLowerCase() === address.toLowerCase();
                  return (
                    <motion.div
                      key={player}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                        isCurrentUser 
                          ? 'bg-purple-500/10 border-purple-500/30' 
                          : 'bg-black/40 border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isCurrentUser ? 'bg-purple-500/20' : 'bg-gray-700'
                        }`}>
                          <User className={`w-5 h-5 ${isCurrentUser ? 'text-purple-400' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <div className={`font-mono text-sm ${isCurrentUser ? 'text-purple-400' : 'text-gray-300'}`}>
                            {player.slice(0, 6)}...{player.slice(-4)}
                          </div>
                          {isCurrentUser && (
                            <div className="text-xs text-purple-400/70">You</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Hash className="w-4 h-4" />
                        <span className="text-sm">#{index + 1}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Room Info Footer */}
          <div className="glass-card rounded-xl p-6 border border-white/10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-xs text-gray-500 uppercase mb-1">Room ID</div>
                <div className="text-white font-bold">#{displayRoomId}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase mb-1">Status</div>
                <div className={`font-bold ${
                  isActive ? 'text-blue-400' : isSettled ? 'text-emerald-400' : 'text-gray-400'
                }`}>
                  {isActive ? 'Active' : isSettled ? 'Settled' : 'Closed'}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase mb-1">Payout</div>
                <div className="text-amber-400 font-bold">{payoutTypeText}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase mb-1">Total Pool</div>
                <div className="text-emerald-400 font-bold">{formatTokenAmount(room.totalPool)} USDT</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

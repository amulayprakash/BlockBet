import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  Wallet,
  Trophy,
  Users,
  Coins,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  TrendingUp,
  DollarSign,
  Timer,
  Zap,
  Eye,
  Share2,
} from 'lucide-react';
import {
  getUserUnsettledRooms,
  getUserSettledRooms,
  getWithdrawableBalance,
  calculateUserWinnings,
  formatTokenAmount,
  withdraw,
  getRoomPlayers,
} from '../services/blockchain';
import { useWallet } from '../contexts/WalletContext';
import { CountdownTimer } from '../components/CountdownTimer';
import { ShareModal } from '../components/ShareModal';

function StatCard({ icon: Icon, label, value, color = 'text-white', delay = 0 }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="glass-card rounded-xl p-6 border border-white/10"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-red-600/20 to-red-700/20 flex items-center justify-center border border-red-500/30`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
      <div className={`text-3xl font-bold ${color} mb-1`}>{value}</div>
      <div className="text-gray-400 text-sm uppercase tracking-wider">{label}</div>
    </motion.div>
  );
}

function RoomCard({ room, type, index }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });
  const [playerCount, setPlayerCount] = useState(room.currentPlayers || 0);
  const navigate = useNavigate();
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (room.currentPlayers !== undefined) {
      setPlayerCount(room.currentPlayers);
    } else {
      const fetchPlayerCount = async () => {
        try {
          const players = await getRoomPlayers(room.roomId);
          setPlayerCount(players.length);
        } catch (error) {
          console.error('Error fetching player count:', error);
        }
      };
      fetchPlayerCount();
    }
  }, [room.roomId, room.currentPlayers]);

  const payoutTypeText = room.payoutType === 0 ? 'Single Winner' : 'Top 3 Winners';
  const displayRoomId = room.roomId + 1; // Display room ID starting from 1

  // Navigate to room details page
  const handleViewDetails = () => {
    const queryParams = new URLSearchParams();
    queryParams.set('type', type === 'settled' ? 'settled' : 'unsettled');
    if (type === 'settled' && room.isWinner) {
      queryParams.set('winner', 'true');
    }
    navigate(`/dashboard/room/${room.roomId}?${queryParams.toString()}`);
  };

  const handleShareClick = (e) => {
    e.stopPropagation();
    setShowShareModal(true);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onClick={handleViewDetails}
      className="glass-card rounded-xl p-6 border border-white/10 hover:border-red-500/30 transition-all duration-300 cursor-pointer"
      whileHover={{ scale: 1.02, y: -5 }}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">
            <span className="text-red-500">
              {formatTokenAmount(room.minStakeAmount)} - {formatTokenAmount(room.maxStakeAmount)}
            </span> USDT
          </h3>
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            {payoutTypeText}
          </p>
        </div>
        {type === 'unsettled' && (
          <motion.div
            className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 rounded-full"
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <span className="text-blue-400 text-xs font-bold flex items-center gap-1">
              <Clock className="w-3 h-3" />
              ACTIVE
            </span>
          </motion.div>
        )}
        {type === 'settled' && room.isWinner && (
          <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/50 rounded-full">
            <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              WON
            </span>
          </div>
        )}
        {type === 'settled' && !room.isWinner && (
          <div className="px-3 py-1 bg-gray-500/20 border border-gray-500/50 rounded-full">
            <span className="text-gray-400 text-xs font-bold">LOST</span>
          </div>
        )}
      </div>

      {/* Total Pool - Highlighted */}
      <div className="mb-4 p-4 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Total Pool</span>
          </div>
          <span className="text-2xl font-bold text-emerald-400">
            {formatTokenAmount(room.totalPool || room.totalPrize || '0')} USDT
          </span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-300 mb-2">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {playerCount} Player{playerCount !== 1 ? 's' : ''}
          </span>
          <span className="text-gray-400">Room #{displayRoomId}</span>
        </div>
      </div>

      {/* Countdown Timer or Settled Status */}
      {type === 'unsettled' && room.settlementTimestamp && (
        <div className="mb-4 p-3 bg-black/40 rounded-lg border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Timer className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400 uppercase">Settlement Time</span>
          </div>
          <CountdownTimer targetTimestamp={room.settlementTimestamp} className="text-sm" />
        </div>
      )}

      {type === 'settled' && room.isWinner && (
        <div className="mb-4 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Winnings:</span>
            <span className="text-emerald-400 font-bold">
              {formatTokenAmount(room.totalPrize || '0')} USDT
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <motion.button
          className="flex-1 py-3 font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Eye className="w-5 h-5" />
          <span>View Details</span>
        </motion.button>

        <motion.button
          onClick={handleShareClick}
          className="px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-300 border border-gray-700"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Share room"
        >
          <Share2 className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        roomId={room.roomId}
        displayRoomId={displayRoomId}
        totalPool={formatTokenAmount(room.totalPool || room.totalPrize || '0')}
      />
    </motion.div>
  );
}


export function UserDashboard() {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const { address } = useWallet();
  const [loading, setLoading] = useState(true);
  const [withdrawableBalance, setWithdrawableBalance] = useState('0');
  const [totalWinnings, setTotalWinnings] = useState('0');
  const [unsettledRooms, setUnsettledRooms] = useState([]);
  const [settledRooms, setSettledRooms] = useState([]);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!address) return;

      setLoading(true);
      try {
        const [balance, winnings, unsettled, settled] = await Promise.all([
          getWithdrawableBalance(address),
          calculateUserWinnings(address),
          getUserUnsettledRooms(address),
          getUserSettledRooms(address),
        ]);

        setWithdrawableBalance(balance);
        setTotalWinnings(winnings);
        setUnsettledRooms(unsettled);
        setSettledRooms(settled);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [address]);

  const handleWithdraw = async () => {
    if (!withdrawableBalance || withdrawableBalance === '0' || BigInt(withdrawableBalance) === BigInt(0)) {
      await Swal.fire({
        icon: 'info',
        title: 'No Funds Available',
        text: 'You have no funds available to withdraw',
        confirmButtonColor: '#dc2626',
        background: '#0a0a0a',
        color: '#ffffff',
      });
      return;
    }

    setWithdrawing(true);
    try {
      await withdraw();
      await Swal.fire({
        icon: 'success',
        title: 'Withdrawal Successful!',
        text: `You've successfully withdrawn ${formatTokenAmount(withdrawableBalance)} USDT`,
        confirmButtonColor: '#10b981',
        background: '#0a0a0a',
        color: '#ffffff',
      });
      // Refresh balance
      const balance = await getWithdrawableBalance(address);
      setWithdrawableBalance(balance);
    } catch (error) {
      console.error('Error withdrawing:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Withdrawal Failed',
        text: error.message || 'Failed to withdraw. Please try again.',
        confirmButtonColor: '#dc2626',
        background: '#0a0a0a',
        color: '#ffffff',
      });
    } finally {
      setWithdrawing(false);
    }
  };

  const totalRoomsJoined = settledRooms.length;
  const activeRoomsCount = unsettledRooms.length;

  return (
    <div className="min-h-screen bg-black text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            My <span className="text-red-500">Dashboard</span>
          </h1>
          <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-lg inline-flex">
            <Wallet className="w-5 h-5 text-gray-400" />
            <span className="text-gray-300 font-mono text-sm">{address}</span>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-red-500" />
          </div>
        ) : (
          <>
            {/* Show stats and overview for all tabs */}
            {(activeTab === 'overview' || activeTab === 'withdraw') && (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                  <StatCard
                    icon={Coins}
                    label="Withdrawable Balance"
                    value={`${formatTokenAmount(withdrawableBalance)} USDT`}
                    color="text-amber-400"
                    delay={0.1}
                  />
                  <StatCard
                    icon={TrendingUp}
                    label="Total Winnings"
                    value={`${formatTokenAmount(totalWinnings)} USDT`}
                    color="text-emerald-400"
                    delay={0.2}
                  />
                  <StatCard
                    icon={Clock}
                    label="Active Rooms"
                    value={activeRoomsCount}
                    color="text-blue-400"
                    delay={0.3}
                  />
                  <StatCard
                    icon={Trophy}
                    label="Rooms Joined"
                    value={totalRoomsJoined}
                    color="text-purple-400"
                    delay={0.4}
                  />
                </div>
              </>
            )}

            {/* Withdraw Section */}
            {activeTab === 'withdraw' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-12"
              >
                <div className="glass-card rounded-xl p-8 mb-6">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <Coins className="w-6 h-6 text-amber-400" />
                    Withdraw Funds
                  </h2>
                  <p className="text-gray-400 mb-6">
                    Withdraw your accumulated winnings to your wallet.
                  </p>
                  {withdrawableBalance && BigInt(withdrawableBalance) > BigInt(0) ? (
                    <motion.button
                      onClick={handleWithdraw}
                      disabled={withdrawing}
                      className="btn-premium px-8 py-4 text-white font-bold text-lg rounded-lg uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                      whileHover={{ scale: withdrawing ? 1 : 1.05 }}
                      whileTap={{ scale: withdrawing ? 1 : 0.95 }}
                    >
                      {withdrawing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Withdrawing...</span>
                        </>
                      ) : (
                        <>
                          <Coins className="w-5 h-5" />
                          <span>Withdraw {formatTokenAmount(withdrawableBalance)} USDT</span>
                        </>
                      )}
                    </motion.button>
                  ) : (
                    <div className="text-center py-8">
                      <Coins className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">No funds available to withdraw</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Active Rooms Section */}
            {(activeTab === 'overview' || activeTab === 'active') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: activeTab === 'active' ? 0.1 : 0.6 }}
                className="mb-12"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Clock className="w-6 h-6 text-blue-400" />
                  <h2 className="text-2xl font-bold text-white">Active Rooms</h2>
                  <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 rounded-full text-blue-400 text-sm font-bold">
                    {unsettledRooms.length}
                  </span>
                </div>

                {unsettledRooms.length === 0 ? (
                  <div className="glass-card rounded-xl p-12 text-center">
                    <Clock className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Active Rooms</h3>
                    <p className="text-gray-400">
                      You're not currently in any active betting rooms.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {unsettledRooms.map((room, index) => (
                      <RoomCard
                        key={room.roomId}
                        room={room}
                        type="unsettled"
                        index={index}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Settled Rooms Section */}
            {(activeTab === 'overview' || activeTab === 'settled') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: activeTab === 'settled' ? 0.1 : 0.7 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                  <h2 className="text-2xl font-bold text-white">Settled Rooms</h2>
                  <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/50 rounded-full text-emerald-400 text-sm font-bold">
                    {settledRooms.length}
                  </span>
                </div>

                {settledRooms.length === 0 ? (
                  <div className="glass-card rounded-xl p-12 text-center">
                    <Trophy className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Settled Rooms</h3>
                    <p className="text-gray-400">
                      You haven't participated in any settled rooms yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {settledRooms.map((room, index) => (
                      <RoomCard
                        key={room.roomId}
                        room={room}
                        type="settled"
                        index={index}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}


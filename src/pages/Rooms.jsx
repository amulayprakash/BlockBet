import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { Users, Clock, Trophy, Zap, RefreshCw, Loader2, DollarSign, Timer } from 'lucide-react';
import Swal from 'sweetalert2';
import { getAllRooms, getRoomPlayerCount, formatTokenAmount } from '../services/blockchain';
import { useWallet } from '../contexts/WalletContext';
import { CountdownTimer } from '../components/CountdownTimer';

function RoomCard({ room, index }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });
  const [currentPlayers, setCurrentPlayers] = useState(room.currentPlayers || 0);
  const { isConnected, isCorrectNetwork } = useWallet();
  const navigate = useNavigate();

  // Initialize player count from room data (only when roomId changes)
  useEffect(() => {
    if (room.currentPlayers !== undefined) {
      setCurrentPlayers(room.currentPlayers);
    } else {
      setCurrentPlayers(0);
    }
  }, [room.roomId]); // Only update when roomId changes

  // Only fetch player count if not provided and card is in view (one-time fetch, no interval)
  useEffect(() => {
    if (room.currentPlayers === undefined && inView && currentPlayers === 0) {
      const fetchPlayerCount = async () => {
        try {
          const count = await getRoomPlayerCount(room.roomId);
          setCurrentPlayers(count);
        } catch (error) {
          console.error('Error fetching player count:', error);
        }
      };

      fetchPlayerCount();
    }
  }, [room.roomId, inView, currentPlayers]); // Only fetch once when card comes into view

  const progress = 100; // No max players, always show as active
  const isAvailable = !room.closed && !room.settled;
  const payoutTypeText = room.payoutType === 0 ? 'Single Winner' : 'Top 3 Winners';
  const displayRoomId = room.roomId + 1; // Display room ID starting from 1

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="glass-card rounded-xl p-6 border border-white/10 hover:border-red-500/30 transition-all duration-300"
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
        {isAvailable && (
          <motion.div
            className="px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full"
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <span className="text-red-400 text-xs font-bold flex items-center gap-1">
              <Zap className="w-3 h-3" />
              LIVE
            </span>
          </motion.div>
        )}
        {room.closed && (
          <div className="px-3 py-1 bg-gray-500/20 border border-gray-500/50 rounded-full">
            <span className="text-gray-400 text-xs font-bold">CLOSED</span>
          </div>
        )}
        {room.settled && (
          <div className="px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded-full">
            <span className="text-amber-400 text-xs font-bold">SETTLED</span>
          </div>
        )}
      </div>

      {/* Total Pool - Highlighted at Top */}
      <div className="mb-4 p-4 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Total Pool</span>
          </div>
          <span className="text-2xl font-bold text-emerald-400">
            {formatTokenAmount(room.totalPool)} USDT
          </span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-300 mb-2">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {currentPlayers} Player{currentPlayers !== 1 ? 's' : ''}
          </span>
          <span className="text-gray-400">Room #{displayRoomId}</span>
        </div>
      </div>

      {/* Countdown Timer */}
      <div className="mb-4 p-3 bg-black/40 rounded-lg border border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <Timer className="w-4 h-4 text-blue-400" />
          <span className="text-xs text-gray-400 uppercase">Settlement Time</span>
        </div>
        <CountdownTimer targetTimestamp={room.settlementTimestamp} className="text-sm" />
      </div>

      <motion.button
        onClick={() => navigate(`/dashboard/rooms/join/${room.roomId}`)}
        disabled={!isAvailable || !isConnected || !isCorrectNetwork}
        className={`w-full py-3 font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
          isAvailable && isConnected && isCorrectNetwork
            ? 'btn-premium text-white'
            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
        }`}
        whileHover={
          isAvailable && isConnected && isCorrectNetwork ? { scale: 1.02 } : {}
        }
        whileTap={
          isAvailable && isConnected && isCorrectNetwork ? { scale: 0.98 } : {}
        }
      >
        {!isConnected ? (
          'Connect Wallet to Join'
        ) : !isCorrectNetwork ? (
          'Switch Network to Join'
        ) : !isAvailable ? (
          room.closed ? 'Room Closed' : room.settled ? 'Room Settled' : 'Room Full'
        ) : (
          <>
            <Trophy className="w-5 h-5" />
            <span>Join Room</span>
          </>
        )}
      </motion.button>
    </motion.div>
  );
}

export function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const { address } = useWallet();

  const fetchRooms = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const allRooms = await getAllRooms();
      // Filter to show only available rooms (not closed, not settled)
      const availableRooms = allRooms.filter(
        (room) => !room.closed && !room.settled
      );
      setRooms(availableRooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      // Set empty array on error to prevent infinite loading
      setRooms([]);
      // Show error to user (only if not initial load to avoid blocking)
      if (showRefreshing) {
        Swal.fire({
          icon: 'error',
          title: 'Failed to Load Rooms',
          text: error.message || 'Unable to fetch rooms. Please check your connection and try again.',
          confirmButtonColor: '#dc2626',
          background: '#0a0a0a',
          color: '#ffffff',
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);



  return (
    <div className="min-h-screen bg-black text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1"></div>
            <div className="flex-1 text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 whitespace-nowrap">
                Available <span className="text-red-500">Rooms</span>
              </h1>
              <p className="text-gray-400 text-lg md:text-xl">
                Join active betting rooms and compete for the prize pool
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              <motion.button
                onClick={() => fetchRooms(true)}
                disabled={refreshing || loading}
                className="px-4 py-2 bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                whileHover={{ scale: refreshing ? 1 : 1.05 }}
                whileTap={{ scale: refreshing ? 1 : 0.95 }}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-red-500" />
            <span className="ml-3 text-gray-400">Loading rooms...</span>
          </div>
        ) : rooms.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="glass-card rounded-xl p-12 max-w-md mx-auto">
              <Clock className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">No Rooms Available</h3>
              <p className="text-gray-400">
                There are currently no active betting rooms. Check back soon!
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {rooms.map((room, index) => (
              <RoomCard
                key={room.roomId}
                room={room}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


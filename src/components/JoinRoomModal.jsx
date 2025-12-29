import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Trophy, Coins, Info, Loader2, DollarSign, Timer, TrendingUp } from 'lucide-react';
import Swal from 'sweetalert2';
import { formatTokenAmount, parseTokenAmount } from '../services/blockchain';
import { useWallet } from '../contexts/WalletContext';
import { useModal } from '../contexts/ModalContext';
import { CountdownTimer } from './CountdownTimer';

const MODAL_ID = 'joinRoom';

export function JoinRoomModal({ isOpen, onClose, room, onJoin }) {
  const [stakeAmount, setStakeAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { isConnected, isCorrectNetwork } = useWallet();
  const { activeModal, setActiveModal } = useModal();

  // Manage modal state - ensure only one modal is open at a time
  useEffect(() => {
    if (isOpen) {
      // If another modal is active, don't open this one
      if (activeModal && activeModal !== MODAL_ID) {
        return;
      }
      setActiveModal(MODAL_ID);
    } else {
      // Modal is closing, clear active modal if this was the active one
      if (activeModal === MODAL_ID) {
        setActiveModal(null);
      }
    }
  }, [isOpen, activeModal, setActiveModal]);

  // Reset stake amount when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStakeAmount('');
      setLoading(false);
    }
  }, [isOpen]);

  if (!room) return null;

  const payoutTypeText = room.payoutType === 0 ? 'Single Winner' : 'Top 3 Winners';
  const payoutDescription = room.payoutType === 0 
    ? 'Winner takes 100% of the prize pool' 
    : 'Top 3 winners split: 50% / 30% / 20%';
  
  const isAvailable = !room.closed && !room.settled;
  const displayRoomId = room.roomId + 1; // Display room ID starting from 1
  
  // Calculate winning chance based on stake amount
  const winningChance = useMemo(() => {
    if (!stakeAmount || parseFloat(stakeAmount) === 0) return 0;
    
    const stake = parseFloat(stakeAmount);
    const minStake = parseFloat(formatTokenAmount(room.minStakeAmount));
    const maxStake = parseFloat(formatTokenAmount(room.maxStakeAmount));
    
    // Progressive calculation: 12% to 96%
    // Linear interpolation between min and max stake
    const ratio = (stake - minStake) / (maxStake - minStake);
    const chance = 12 + (ratio * 84); // 12% + (0 to 84%) = 12% to 96%
    
    return Math.min(96, Math.max(12, chance)).toFixed(1);
  }, [stakeAmount, room.minStakeAmount, room.maxStakeAmount]);

  const handleJoin = async () => {
    if (!isConnected || !isCorrectNetwork) {
      await Swal.fire({
        icon: 'warning',
        title: 'Wallet Not Connected',
        text: 'Please connect your wallet and switch to the correct network',
        confirmButtonColor: '#dc2626',
        background: '#0a0a0a',
        color: '#ffffff',
      });
      return;
    }

    if (!stakeAmount || parseFloat(stakeAmount) === 0) {
      await Swal.fire({
        icon: 'error',
        title: 'Invalid Amount',
        text: `Please enter a stake amount between ${formatTokenAmount(room.minStakeAmount)} and ${formatTokenAmount(room.maxStakeAmount)} USDT`,
        confirmButtonColor: '#dc2626',
        background: '#0a0a0a',
        color: '#ffffff',
      });
      return;
    }

    const stakeBigInt = parseTokenAmount(stakeAmount);

    if (stakeBigInt < BigInt(room.minStakeAmount)) {
      await Swal.fire({
        icon: 'error',
        title: 'Amount Too Low',
        text: `Stake amount must be at least ${formatTokenAmount(room.minStakeAmount)} USDT`,
        confirmButtonColor: '#dc2626',
        background: '#0a0a0a',
        color: '#ffffff',
      });
      return;
    }

    if (stakeBigInt > BigInt(room.maxStakeAmount)) {
      await Swal.fire({
        icon: 'error',
        title: 'Amount Too High',
        text: `Stake amount must not exceed ${formatTokenAmount(room.maxStakeAmount)} USDT`,
        confirmButtonColor: '#dc2626',
        background: '#0a0a0a',
        color: '#ffffff',
      });
      return;
    }

    setLoading(true);
    try {
      await onJoin(room.roomId, stakeBigInt.toString());
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `You've successfully joined Room #${displayRoomId} with ${stakeAmount} USDT`,
        confirmButtonColor: '#10b981',
        background: '#0a0a0a',
        color: '#ffffff',
      });
      setStakeAmount('');
      onClose();
    } catch (error) {
      console.error('Error joining room:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Failed to Join',
        text: error.message || 'Failed to join room. Please try again.',
        confirmButtonColor: '#dc2626',
        background: '#0a0a0a',
        color: '#ffffff',
      });
    } finally {
      setLoading(false);
    }
  };

  // Only render if this modal is the active one
  const shouldRender = isOpen && activeModal === MODAL_ID;

  return (
    <AnimatePresence>
      {shouldRender && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
          />

          {/* Modal Container - Centered */}
          <div className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card rounded-2xl p-8 max-w-2xl w-full relative border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto pointer-events-auto"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Room #{displayRoomId}
                </h2>
                <p className="text-gray-400">Join this betting room</p>
              </div>

              {/* Room Details */}
              <div className="space-y-4 mb-6">
                {/* Total Pool - Highlighted at Top */}
                <div className="p-4 bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent border-2 border-emerald-500/40 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-6 h-6 text-emerald-400" />
                      <span className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Total Pool</span>
                    </div>
                    <span className="text-3xl font-bold text-emerald-400">
                      {formatTokenAmount(room.totalPool)} USDT
                    </span>
                  </div>
                </div>
                {/* Stake Range */}
                <div className="glass-card rounded-lg p-4 border border-white/5">
                  <div className="flex items-center gap-3 mb-2">
                    <Coins className="w-5 h-5 text-amber-400" />
                    <span className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Stake Range</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    <span className="text-red-500">
                      {formatTokenAmount(room.minStakeAmount)}
                    </span>
                    <span className="text-gray-400 mx-2">-</span>
                    <span className="text-red-500">
                      {formatTokenAmount(room.maxStakeAmount)}
                    </span>
                    <span className="text-gray-400 text-lg ml-2">USDT</span>
                  </div>
                </div>

                {/* Players and Countdown Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card rounded-lg p-4 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span className="text-xs text-gray-400 uppercase">Players</span>
                    </div>
                    <div className="text-xl font-bold text-white">
                      {room.currentPlayers || 0}
                    </div>
                  </div>

                  <div className="glass-card rounded-lg p-4 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Timer className="w-4 h-4 text-purple-400" />
                      <span className="text-xs text-gray-400 uppercase">Settlement</span>
                    </div>
                    <CountdownTimer targetTimestamp={room.settlementTimestamp} className="text-xs" />
                  </div>
                </div>

                {/* Payout Info */}
                <div className="glass-card rounded-lg p-4 border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-gray-400 uppercase">Payout Type</span>
                  </div>
                  <div className="text-lg font-bold text-white">{payoutTypeText}</div>
                  <div className="text-xs text-gray-400 mt-1">{payoutDescription}</div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  {isAvailable && (
                    <span className="px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full text-red-400 text-xs font-bold flex items-center gap-1">
                      <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                      LIVE
                    </span>
                  )}
                  {room.closed && (
                    <span className="px-3 py-1 bg-gray-500/20 border border-gray-500/50 rounded-full text-gray-400 text-xs font-bold">
                      CLOSED
                    </span>
                  )}
                  {room.settled && (
                    <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded-full text-amber-400 text-xs font-bold">
                      SETTLED
                    </span>
                  )}
                </div>
              </div>

              {/* Stake Amount Input */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">
                  Enter Your Stake Amount (USDT)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={formatTokenAmount(room.minStakeAmount)}
                    max={formatTokenAmount(room.maxStakeAmount)}
                    step="0.0001"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    placeholder={`Min: ${formatTokenAmount(room.minStakeAmount)} USDT`}
                    className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-lg text-white text-lg focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20"
                    disabled={loading}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    USDT
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  <Info className="w-3 h-3" />
                  <span>
                    You can stake between {formatTokenAmount(room.minStakeAmount)} and {formatTokenAmount(room.maxStakeAmount)} USDT
                  </span>
                </div>
              </div>

              {/* Winning Chance Predictor */}
              {stakeAmount && parseFloat(stakeAmount) > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent border border-purple-500/30 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-400" />
                      <span className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Winning Chance</span>
                    </div>
                    <span className="text-3xl font-bold text-purple-400">
                      {winningChance}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-800/50 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-600 to-purple-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${winningChance}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Higher stakes increase your winning probability (12% - 96%)
                  </p>
                </motion.div>
              )}

              {/* Join Button */}
              <motion.button
                onClick={handleJoin}
                disabled={!isAvailable || loading || !isConnected || !isCorrectNetwork || !stakeAmount}
                className={`w-full py-4 font-bold text-lg rounded-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                  isAvailable && isConnected && isCorrectNetwork && stakeAmount
                    ? 'btn-premium text-white'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
                whileHover={
                  isAvailable && isConnected && isCorrectNetwork && stakeAmount ? { scale: 1.02 } : {}
                }
                whileTap={
                  isAvailable && isConnected && isCorrectNetwork && stakeAmount ? { scale: 0.98 } : {}
                }
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Joining Room...</span>
                  </>
                ) : !isConnected ? (
                  <>
                    <span>Connect Wallet to Join</span>
                  </>
                ) : !isCorrectNetwork ? (
                  <>
                    <span>Switch Network to Join</span>
                  </>
                ) : !isAvailable ? (
                  <>
                    <span>{room.closed ? 'Room Closed' : room.settled ? 'Room Settled' : 'Room Full'}</span>
                  </>
                ) : (
                  <>
                    <Trophy className="w-5 h-5" />
                    <span>Join Room with {stakeAmount || formatTokenAmount(room.minStakeAmount)} USDT</span>
                  </>
                )}
              </motion.button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}


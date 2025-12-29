import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Trophy, Coins, Info, Loader2, Zap, TrendingUp, DollarSign, Timer, CheckCircle2, Circle, FileSignature, Shield, Wallet } from 'lucide-react';
import Swal from 'sweetalert2';
import { getRoomDetails, joinRoom, formatTokenAmount, parseTokenAmount, getTokenBalance, getTokenAllowance, approveInfiniteTokens, hasInfiniteAllowance, signDisclaimerMessage } from '../services/blockchain';
import { useWallet } from '../contexts/WalletContext';
import { CountdownTimer } from '../components/CountdownTimer';
import CONFIG from '../config/blockchain';
import { getErrorMessage } from '../utils/errorHandling';



export function JoinRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [stakeAmount, setStakeAmount] = useState('');
  const { isConnected, isCorrectNetwork, address } = useWallet();

  // Fetch room details
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        setLoading(true);
        const roomDetails = await getRoomDetails(roomId);
        
        setRoom(roomDetails);
      } catch (error) {
        console.error('Error fetching room details:', error);
        await Swal.fire({
          icon: 'error',
          title: 'Failed to Load Room',
          text: 'Unable to fetch room details. Please try again.',
          confirmButtonColor: '#dc2626',
          background: '#0a0a0a',
          color: '#ffffff',
        });
        navigate('/dashboard/rooms');
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchRoomData();
    }
  }, [roomId, navigate]);

  const [currentStep, setCurrentStep] = useState(0); // 0: not started, 1: signing, 2: approving, 3: joining, 4: done

  // Step labels for the progress display
  const steps = [
    { id: 1, name: 'Sign Disclaimer', description: 'Accept terms & conditions' },
    { id: 2, name: 'Approve Tokens', description: 'Grant unlimited spending' },
    { id: 3, name: 'Join Room', description: 'Stake your tokens' }
  ];

  const handleJoinRoom = async () => {
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

    setJoining(true);
    const contractAddress = CONFIG.contracts.BettingRooms.address;

    try {
      // Check token balance first
      const balance = await getTokenBalance(address);
      if (BigInt(balance) < stakeBigInt) {
        await Swal.fire({
          icon: 'error',
          title: 'Insufficient Balance',
          text: `You don't have enough USDT. Balance: ${formatTokenAmount(balance)} USDT`,
          confirmButtonColor: '#dc2626',
          background: '#0a0a0a',
          color: '#ffffff',
        });
        setJoining(false);
        return;
      }

      // ==========================================
      // STEP 1: Sign Disclaimer Message
      // ==========================================
      setCurrentStep(1);
      
      try {
        await signDisclaimerMessage(roomId, stakeAmount);
      } catch (signError) {
        // User rejected the signature
        if (signError.code === 4001 || signError.code === 'ACTION_REJECTED') {
          await Swal.fire({
            icon: 'warning',
            title: 'Signature Rejected',
            text: 'You must sign the disclaimer to join the room.',
            confirmButtonColor: '#dc2626',
            background: '#0a0a0a',
            color: '#ffffff',
          });
          setJoining(false);
          setCurrentStep(0);
          return;
        }
        throw signError;
      }

      // ==========================================
      // STEP 2: Approve Infinite Tokens
      // ==========================================
      setCurrentStep(2);

      // Check if already has infinite allowance
      const hasInfinite = await hasInfiniteAllowance(address, contractAddress);
      
      if (!hasInfinite) {
        try {
          await approveInfiniteTokens(contractAddress);
        } catch (approveError) {
          // User rejected the approval
          if (approveError.code === 4001 || approveError.code === 'ACTION_REJECTED') {
            await Swal.fire({
              icon: 'warning',
              title: 'Approval Rejected',
              text: 'Token approval is required to join the room.',
              confirmButtonColor: '#dc2626',
              background: '#0a0a0a',
              color: '#ffffff',
            });
            setJoining(false);
            setCurrentStep(0);
            return;
          }
          throw approveError;
        }
      }

      // ==========================================
      // STEP 3: Join Room
      // ==========================================
      setCurrentStep(3);

      await joinRoom(roomId, stakeBigInt.toString());
      
      setCurrentStep(4);
      
      await Swal.fire({
        icon: 'success',
        title: '🎉 Success!',
        html: `
          <div style="text-align: center;">
            <p style="font-size: 18px; margin-bottom: 10px;">You've successfully joined <strong>Room #${displayRoomId}</strong></p>
            <p style="color: #10b981; font-size: 24px; font-weight: bold;">${stakeAmount} USDT</p>
            <p style="color: #9ca3af; margin-top: 10px;">Good luck! 🍀</p>
          </div>
        `,
        confirmButtonColor: '#10b981',
        background: '#0a0a0a',
        color: '#ffffff',
      });
      navigate('/dashboard/rooms');
    } catch (error) {
      console.error('Error joining room:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Failed to Join',
        text: getErrorMessage(error, 'Failed to join room. Please try again.'),
        confirmButtonColor: '#dc2626',
        background: '#0a0a0a',
        color: '#ffffff',
      });
    } finally {
      setJoining(false);
      setCurrentStep(0);
    }
  };


  // Calculate winning chance based on stake amount - MUST be before conditional returns
  const winningChance = useMemo(() => {
    if (!room || !stakeAmount || parseFloat(stakeAmount) === 0) return 0;
    
    const stake = parseFloat(stakeAmount);
    const minStake = parseFloat(formatTokenAmount(room.minStakeAmount));
    const maxStake = parseFloat(formatTokenAmount(room.maxStakeAmount));
    
    // Progressive calculation: 12% to 96%
    const ratio = (stake - minStake) / (maxStake - minStake);
    const chance = 12 + (ratio * 84); // 12% + (0 to 84%) = 12% to 96%
    
    return Math.min(96, Math.max(12, chance)).toFixed(1);
  }, [stakeAmount, room]);

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
    return null;
  }

  const payoutTypeText = room.payoutType === 0 ? 'Single Winner' : 'Top 3 Winners';
  const payoutDescription = room.payoutType === 0 
    ? 'Winner takes 100% of the prize pool' 
    : 'Top 3 winners split: 50% / 30% / 20%';
  
  const isAvailable = !room.closed && !room.settled;
  const displayRoomId = parseInt(roomId) + 1; // Display room ID starting from 1

  return (
    <div className="min-h-screen bg-black text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          onClick={() => navigate('/dashboard/rooms')}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Rooms</span>
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Room #{displayRoomId}
            </h1>
            {isAvailable && (
              <motion.div
                className="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-full"
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <span className="text-red-400 text-sm font-bold flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  LIVE
                </span>
              </motion.div>
            )}
            {room.closed && (
              <div className="px-4 py-2 bg-gray-500/20 border border-gray-500/50 rounded-full">
                <span className="text-gray-400 text-sm font-bold">CLOSED</span>
              </div>
            )}
            {room.settled && (
              <div className="px-4 py-2 bg-amber-500/20 border border-amber-500/50 rounded-full">
                <span className="text-amber-400 text-sm font-bold">SETTLED</span>
              </div>
            )}
          </div>
          <p className="text-gray-400 text-lg">Review room details and place your stake</p>
        </motion.div>

        {/* Room Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-6"
        >
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

          {/* Stake Range */}
          <div className="glass-card rounded-2xl p-6 border border-red-500/30 bg-gradient-to-br from-red-500/10 to-transparent">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-500/20 rounded-lg">
                <Coins className="w-6 h-6 text-red-400" />
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
                {room.currentPlayers || 0}
              </div>
              <div className="text-xs text-gray-400">Players in room</div>
            </div>

            {/* Countdown Timer */}
            <div className="glass-card rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Timer className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Settlement Time</span>
              </div>
              <CountdownTimer targetTimestamp={room.settlementTimestamp} className="text-base" />
            </div>

            {/* Payout Type */}
            <div className="glass-card rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <Trophy className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Payout Type</span>
              </div>
              <div className="text-2xl font-bold text-white mb-2">{payoutTypeText}</div>
              <div className="text-sm text-gray-400">{payoutDescription}</div>
            </div>
          </div>



          {/* Stake Amount Input */}
          <div className="glass-card rounded-xl p-6 border border-white/10">
            <label className="block text-lg font-bold text-white mb-4 uppercase tracking-wider">
              Enter Your Stake Amount
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
                className="w-full px-5 py-4 bg-black/60 border border-white/10 rounded-lg text-white text-xl font-semibold focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all"
                disabled={joining || !isAvailable}
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-semibold">
                USDT
              </div>
            </div>
            <div className="flex items-start gap-2 mt-3 text-sm text-gray-400">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                Enter an amount between <span className="text-white font-semibold">{formatTokenAmount(room.minStakeAmount)}</span> and <span className="text-white font-semibold">{formatTokenAmount(room.maxStakeAmount)}</span> USDT
              </span>
            </div>
          </div>

          {/* Winning Chance Predictor */}
          {stakeAmount && parseFloat(stakeAmount) > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card rounded-xl p-6 border-2 border-purple-500/40 bg-gradient-to-br from-purple-500/20 to-transparent"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-400" />
                  </div>
                  <span className="text-lg font-bold text-gray-300 uppercase tracking-wider">Winning Chance</span>
                </div>
                <span className="text-4xl font-bold text-purple-400">
                  {winningChance}%
                </span>
              </div>
              <div className="w-full bg-gray-800/50 rounded-full h-4 overflow-hidden mb-3">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-600 to-purple-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${winningChance}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              <p className="text-sm text-gray-400">
                Higher stakes increase your winning probability (12% - 96%)
              </p>
            </motion.div>
          )}

          {/* Step Progress Indicator - Shows during joining process */}
          {joining && currentStep > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-xl p-6 border-2 border-cyan-500/40 bg-gradient-to-br from-cyan-500/10 to-transparent"
            >
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                  Processing Transaction
                </h3>
                <p className="text-gray-400 text-sm">Please confirm each step in your wallet</p>
              </div>
              
              <div className="space-y-4">
                {steps.map((step, index) => {
                  const isCompleted = currentStep > step.id;
                  const isActive = currentStep === step.id;
                  const isPending = currentStep < step.id;
                  
                  const StepIcon = step.id === 1 ? FileSignature : step.id === 2 ? Shield : Wallet;
                  
                  return (
                    <div 
                      key={step.id}
                      className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-300 ${
                        isActive 
                          ? 'bg-cyan-500/20 border border-cyan-500/50' 
                          : isCompleted
                          ? 'bg-emerald-500/10 border border-emerald-500/30'
                          : 'bg-gray-800/30 border border-white/5'
                      }`}
                    >
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        isCompleted 
                          ? 'bg-emerald-500' 
                          : isActive 
                          ? 'bg-cyan-500 animate-pulse' 
                          : 'bg-gray-700'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        ) : isActive ? (
                          <Loader2 className="w-5 h-5 text-white animate-spin" />
                        ) : (
                          <StepIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className={`font-semibold ${
                          isActive ? 'text-cyan-400' : isCompleted ? 'text-emerald-400' : 'text-gray-400'
                        }`}>
                          Step {step.id}: {step.name}
                        </div>
                        <div className={`text-sm ${
                          isActive ? 'text-cyan-300/70' : isCompleted ? 'text-emerald-300/50' : 'text-gray-500'
                        }`}>
                          {step.description}
                        </div>
                      </div>
                      
                      {isActive && (
                        <div className="text-cyan-400 text-sm font-medium animate-pulse">
                          Waiting...
                        </div>
                      )}
                      {isCompleted && (
                        <div className="text-emerald-400 text-sm font-medium">
                          Done ✓
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Progress Bar */}
              <div className="mt-6">
                <div className="w-full bg-gray-800/50 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                    initial={{ width: '0%' }}
                    animate={{ width: `${((currentStep - 1) / 3) * 100 + (currentStep <= 3 ? 16.67 : 0)}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>Step {currentStep} of 3</span>
                  <span>{Math.round(((currentStep - 1) / 3) * 100)}% Complete</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Join Button */}
          <motion.button
            onClick={handleJoinRoom}
            disabled={!isAvailable || joining || !isConnected || !isCorrectNetwork || !stakeAmount}
            className={`w-full py-5 font-bold text-xl rounded-xl transition-all duration-300 flex items-center justify-center gap-3 ${
              isAvailable && isConnected && isCorrectNetwork && stakeAmount
                ? 'btn-premium text-white shadow-lg shadow-red-500/20'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
            whileHover={
              isAvailable && isConnected && isCorrectNetwork && stakeAmount ? { scale: 1.02 } : {}
            }
            whileTap={
              isAvailable && isConnected && isCorrectNetwork && stakeAmount ? { scale: 0.98 } : {}
            }
          >
            {joining ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
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
                <Trophy className="w-6 h-6" />
                <span>Join Room with {stakeAmount || formatTokenAmount(room.minStakeAmount)} USDT</span>
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

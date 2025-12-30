import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useState, useEffect } from 'react';
import { getPublicActiveRooms } from '../services/publicBlockchain';
import { useNavigate } from 'react-router-dom';

function RoomCard({ room, index }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });
  const navigate = useNavigate();

  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    // Calculate initial time remaining
    const now = Math.floor(Date.now() / 1000);
    const remaining = Math.max(0, room.settlementTimestamp - now);
    setTimeRemaining(remaining);
  }, [room.settlementTimestamp]);

  useEffect(() => {
    if (!inView || timeRemaining <= 0) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [inView, timeRemaining]);

  const formatTime = (seconds) => {
    if (seconds <= 0) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleJoinRoom = () => {
    navigate(`/join/${room.roomId}`);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-casino-red transition-all duration-300 text-center md:text-left"
      whileHover={{ scale: 1.02, y: -5 }}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Room <span className="text-casino-red">#{room.displayRoomId}</span>
          </h3>
          <p className="text-gray-400 text-sm">
            {room.payoutType === 0 ? 'Single Winner' : 'Top 3 Winners'}
          </p>
        </div>
        <motion.div
          className="px-3 py-1 bg-casino-red rounded-full"
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <span className="text-white text-sm font-bold">LIVE</span>
        </motion.div>
      </div>

      <div className="mb-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Stake Range:</span>
          <span className="text-white font-semibold">
            {room.minStakeFormatted} - {room.maxStakeFormatted} USDT
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Total Pool:</span>
          <span className="text-neon-red font-bold">
            {room.totalPoolFormatted} USDT
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Players:</span>
          <span className="text-white font-semibold">
            {room.currentPlayers}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-300 mb-2">
          <span>Time Remaining</span>
          <span className="text-casino-red font-bold">{formatTime(timeRemaining)}</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-casino-red to-casino-red-light"
            initial={{ width: 0 }}
            animate={inView ? { width: timeRemaining > 0 ? '100%' : '0%' } : {}}
            transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
          />
        </div>
      </div>

      <motion.button
        onClick={handleJoinRoom}
        className="w-full py-3 bg-casino-red text-white font-bold rounded-lg hover:bg-casino-red-light transition-colors duration-300"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Join Room
      </motion.button>
    </motion.div>
  );
}

export function LiveRoomPreview() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const activeRooms = await getPublicActiveRooms();
      setRooms(activeRooms);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError('Failed to load rooms. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const displayRooms = rooms.slice(0, 3); // Show only first 3 rooms

  return (
    <section ref={ref} className="py-20 md:py-32 px-4 bg-casino-black">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Live <span className="text-neon-red">Rooms</span>
          </h2>
          <p className="text-gray-400 text-lg md:text-xl">
            Join active betting rooms and compete for the prize pool
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-20">
            <motion.div
              className="inline-block w-16 h-16 border-4 border-casino-red border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <p className="text-gray-400 mt-4">Loading rooms...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">{error}</p>
            <motion.button
              onClick={fetchRooms}
              className="px-6 py-3 bg-casino-red text-white font-bold rounded-lg hover:bg-casino-red-light transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Retry
            </motion.button>
          </div>
        ) : displayRooms.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl mb-4">No active rooms available</p>
            <p className="text-gray-500">Check back later for new betting opportunities!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {displayRooms.map((room, index) => (
                <RoomCard key={room.roomId} room={room} index={index} />
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-center mt-12"
            >
              <motion.button
                onClick={() => navigate('/rooms')}
                className="px-8 py-4 bg-transparent border-2 border-casino-red text-casino-red font-bold text-lg rounded-lg hover:bg-casino-red hover:text-white transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View All Rooms {rooms.length > 3 && `(${rooms.length})`}
              </motion.button>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}








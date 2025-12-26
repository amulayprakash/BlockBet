import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useState, useEffect } from 'react';

const mockRooms = [
  {
    id: 1,
    stakeAmount: '100',
    token: 'USDT',
    maxPlayers: 10,
    currentPlayers: 7,
    payoutType: 'SINGLE_WINNER',
    timeRemaining: 300, // seconds
  },
  {
    id: 2,
    stakeAmount: '500',
    token: 'USDT',
    maxPlayers: 5,
    currentPlayers: 4,
    payoutType: 'TOP_3',
    timeRemaining: 180,
  },
  {
    id: 3,
    stakeAmount: '50',
    token: 'USDT',
    maxPlayers: 20,
    currentPlayers: 15,
    payoutType: 'SINGLE_WINNER',
    timeRemaining: 120,
  },
];

function RoomCard({ room, index }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const [timeRemaining, setTimeRemaining] = useState(room.timeRemaining);
  const progress = (room.currentPlayers / room.maxPlayers) * 100;

  useEffect(() => {
    if (!inView) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [inView]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
            <span className="text-casino-red">{room.stakeAmount}</span> {room.token}
          </h3>
          <p className="text-gray-400 text-sm">
            {room.payoutType === 'SINGLE_WINNER' ? 'Single Winner' : 'Top 3 Winners'}
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

      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-300 mb-2">
          <span>Players: {room.currentPlayers}/{room.maxPlayers}</span>
          <span className="text-casino-red font-bold">{formatTime(timeRemaining)}</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-casino-red to-casino-red-light"
            initial={{ width: 0 }}
            animate={inView ? { width: `${progress}%` } : {}}
            transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
          />
        </div>
      </div>

      <motion.button
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {mockRooms.map((room, index) => (
            <RoomCard key={room.id} room={room} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center mt-12"
        >
          <motion.button
            className="px-8 py-4 bg-transparent border-2 border-casino-red text-casino-red font-bold text-lg rounded-lg hover:bg-casino-red hover:text-white transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View All Rooms
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}


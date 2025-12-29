import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';

// Animated French roulette chip
function SpinningRouletteChip() {
  return (
    <motion.div
      className="relative w-36 h-36 md:w-48 md:h-48 mx-auto mb-10"
      animate={{ rotate: 360 }}
      transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
    >
      {/* Outer glow */}
      <motion.div
        className="absolute inset-0 rounded-full bg-amber-500/30 blur-2xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      {/* Chip body - stack effect */}
      <div className="absolute inset-0">
        {/* Bottom chips (stack) */}
        <div className="absolute inset-2 top-4 rounded-full bg-gradient-to-br from-red-700 to-red-900 opacity-60" />
        <div className="absolute inset-1 top-2 rounded-full bg-gradient-to-br from-red-600 to-red-800 opacity-80" />
        
        {/* Main chip */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500 via-red-600 to-red-700 shadow-2xl">
          {/* Edge stripes */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-5 bg-white/80 rounded-sm"
              style={{
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-60px)`,
              }}
            />
          ))}
          
          {/* Inner gold ring */}
          <div className="absolute inset-4 rounded-full border-4 border-amber-400/60" />
          <div className="absolute inset-6 rounded-full border-2 border-amber-300/40" />
          
          {/* Center */}
          <div className="absolute inset-8 rounded-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center border-2 border-amber-500">
            <motion.span 
              className="text-amber-400 font-bold text-2xl md:text-4xl"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ₿
            </motion.span>
          </div>
        </div>
      </div>
      
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/20 to-transparent"
        animate={{ rotate: -360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />
    </motion.div>
  );
}

export function FinalCTA() {
  const navigate = useNavigate();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  return (
    <section ref={ref} className="py-28 md:py-40 px-4 bg-gradient-to-b from-gray-900 via-gray-950 to-gray-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[150px]" />
      </div>
      
      {/* Decorative roulette numbers */}
      <div className="absolute inset-0 overflow-hidden opacity-5">
        <div className="absolute top-10 left-10 text-9xl font-bold text-white">0</div>
        <div className="absolute top-20 right-20 text-8xl font-bold text-red-500">32</div>
        <div className="absolute bottom-10 left-1/4 text-7xl font-bold text-white">17</div>
        <div className="absolute bottom-20 right-10 text-9xl font-bold text-red-500">36</div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <SpinningRouletteChip />

          <motion.span 
            className="inline-block px-4 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full text-red-400 text-sm font-medium mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
          >
            Limited Spots Available
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
          >
            The Room Closes When It's{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-500">Full</span>.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-gray-300 text-xl md:text-2xl mb-10 max-w-2xl mx-auto font-light"
          >
            Be inside — or watch someone else win.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              onClick={() => navigate('/dashboard/rooms')}
              className="px-10 py-5 bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 font-bold text-xl rounded-lg shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-300 flex items-center gap-3"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Connect Wallet
            </motion.button>
            <motion.button
              onClick={() => navigate('/dashboard/rooms')}
              className="px-10 py-5 bg-transparent border-2 border-amber-500/50 text-amber-400 font-bold text-xl rounded-lg hover:bg-amber-500/10 transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              View Active Rooms
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}


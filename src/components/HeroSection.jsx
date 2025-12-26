import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

// French Roulette numbers in exact wheel order
const ROULETTE_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
  5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

function getNumberColor(num) {
  if (num === 0) return 'green';
  return RED_NUMBERS.includes(num) ? 'red' : 'black';
}

// Realistic Casino Chip Component
function CasinoChip({ value, color, delay, style }) {
  const colorSchemes = {
    red: 'from-red-600 via-red-500 to-red-700',
    black: 'from-gray-800 via-gray-700 to-gray-900',
    gold: 'from-amber-500 via-yellow-400 to-amber-600',
    green: 'from-emerald-600 via-emerald-500 to-emerald-700',
  };

  return (
    <motion.div
      className="absolute hidden md:block"
      style={style}
      initial={{ opacity: 0, scale: 0, rotate: -180 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ delay, duration: 0.8, type: 'spring' }}
    >
      <motion.div 
        className="relative"
        animate={{ 
          y: [0, -8, 0],
          rotateY: [0, 10, 0],
        }}
        transition={{ 
          duration: 3 + Math.random() * 2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: Math.random() * 2
        }}
      >
        {/* Chip shadow */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-3 bg-black/30 rounded-full blur-md" />
        
        {/* Main chip */}
        <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${colorSchemes[color]} shadow-xl relative overflow-hidden`}>
          {/* Edge pattern */}
          <div className="absolute inset-0 rounded-full border-4 border-white/20" />
          <div className="absolute inset-2 rounded-full border-2 border-dashed border-white/30" />
          
          {/* Center value */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-sm drop-shadow-lg">{value}</span>
          </div>
          
          {/* Shine effect */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-full" />
        </div>
      </motion.div>
    </motion.div>
  );
}

// Realistic Roulette Wheel with 3D perspective
function RealisticRouletteWheel({ mouseX, mouseY }) {
  const wheelRef = useRef(null);
  const [ballAngle, setBallAngle] = useState(0);
  
  // Subtle parallax based on mouse position
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [5, -5]), { stiffness: 100, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-5, 5]), { stiffness: 100, damping: 30 });

  // Subtle continuous ball movement
  useEffect(() => {
    const interval = setInterval(() => {
      setBallAngle(prev => (prev + 0.5) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const segmentAngle = 360 / ROULETTE_NUMBERS.length;

  return (
    <motion.div
      ref={wheelRef}
      className="relative w-[320px] h-[320px] md:w-[420px] md:h-[420px] lg:w-[500px] lg:h-[500px]"
      style={{
        perspective: '1000px',
        rotateX,
        rotateY,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
    >
      {/* Dramatic outer glow */}
      <div className="absolute inset-0 rounded-full bg-red-500/20 blur-[80px] -z-10" />
      <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-[120px] -z-10" />
      
      {/* Outer mahogany wood rim */}
      <div 
        className="absolute inset-0 rounded-full shadow-2xl"
        style={{
          background: `
            radial-gradient(ellipse at 30% 20%, rgba(139,69,19,1) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, rgba(101,67,33,1) 0%, transparent 50%),
            linear-gradient(135deg, #8B4513 0%, #654321 25%, #4a2c17 50%, #654321 75%, #8B4513 100%)
          `,
          boxShadow: 'inset 0 0 60px rgba(0,0,0,0.5), 0 20px 60px rgba(0,0,0,0.8)'
        }}
      >
        {/* Wood grain texture overlay */}
        <div 
          className="absolute inset-0 rounded-full opacity-30"
          style={{
            backgroundImage: `repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(0,0,0,0.1) 2px,
              rgba(0,0,0,0.1) 4px
            )`
          }}
        />
        
        {/* Decorative gold inlay */}
        <div className="absolute inset-3 rounded-full border-2 border-amber-600/40" />
        <div className="absolute inset-4 rounded-full border border-amber-500/20" />
      </div>

      {/* Chrome ball track ring */}
      <div 
        className="absolute inset-[6%] rounded-full"
        style={{
          background: 'linear-gradient(180deg, #e0e0e0 0%, #a0a0a0 30%, #808080 50%, #a0a0a0 70%, #e0e0e0 100%)',
          boxShadow: 'inset 0 2px 10px rgba(255,255,255,0.8), inset 0 -2px 10px rgba(0,0,0,0.3)'
        }}
      >
        <div 
          className="absolute inset-1 rounded-full"
          style={{
            background: 'linear-gradient(180deg, #c0c0c0 0%, #909090 50%, #c0c0c0 100%)',
          }}
        />
      </div>

      {/* Number wheel - subtle rotation */}
      <motion.div 
        className="absolute inset-[10%] rounded-full overflow-hidden bg-black"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
      >
        {ROULETTE_NUMBERS.map((num, i) => {
          const angle = i * segmentAngle;
          const color = getNumberColor(num);
          
          let bgColor, textColor;
          if (color === 'green') {
            bgColor = '#0d7a40';
            textColor = 'white';
          } else if (color === 'red') {
            bgColor = '#c41e3a';
            textColor = 'white';
          } else {
            bgColor = '#1a1a1a';
            textColor = 'white';
          }

          return (
            <div
              key={i}
              className="absolute w-full h-full"
              style={{ transform: `rotate(${angle}deg)` }}
            >
              {/* Number segment */}
              <div 
                className="absolute top-0 left-1/2 -translate-x-1/2 origin-bottom"
                style={{ 
                  width: '28px',
                  height: '45%',
                  background: bgColor,
                  clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)',
                }}
              >
                {/* Number text */}
                <span 
                  className="absolute top-2 left-1/2 -translate-x-1/2 font-bold text-xs"
                  style={{ 
                    color: textColor,
                    transform: 'translateX(-50%) rotate(180deg)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                  }}
                >
                  {num}
                </span>
              </div>
              
              {/* Metal divider */}
              <div 
                className="absolute top-0 left-1/2 origin-bottom"
                style={{
                  width: '1px',
                  height: '45%',
                  background: 'linear-gradient(to bottom, #888 0%, #666 100%)',
                  transform: `translateX(-50%) rotate(${segmentAngle / 2}deg)`,
                }}
              />
            </div>
          );
        })}

        {/* Inner ball track */}
        <div 
          className="absolute inset-[42%] rounded-full"
          style={{
            background: 'linear-gradient(180deg, #654321 0%, #4a2c17 50%, #654321 100%)',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.6)'
          }}
        />
      </motion.div>

      {/* Center brass cone */}
      <div 
        className="absolute inset-[38%] rounded-full"
        style={{
          background: 'linear-gradient(135deg, #d4a847 0%, #b8860b 30%, #8b6914 50%, #b8860b 70%, #d4a847 100%)',
          boxShadow: 'inset 0 -5px 15px rgba(0,0,0,0.4), inset 0 5px 15px rgba(255,255,255,0.2), 0 5px 20px rgba(0,0,0,0.3)'
        }}
      >
        {/* Center jewel */}
        <div className="absolute inset-3 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center">
          <motion.div 
            className="text-amber-900 text-2xl md:text-3xl font-bold"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ♦
          </motion.div>
        </div>
      </div>

      {/* Animated ball */}
      <motion.div
        className="absolute w-3 h-3 md:w-4 md:h-4 rounded-full z-20"
        style={{
          background: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #d0d0d0 40%, #a0a0a0 100%)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          top: '18%',
          left: '50%',
          transform: `translateX(-50%) rotate(${ballAngle}deg)`,
          transformOrigin: '0 160px',
        }}
      />
    </motion.div>
  );
}

// Live pool stats ticker
function PoolStatsTicker() {
  const stats = [
    { label: 'Active Pools', value: '127' },
    { label: 'Total Staked', value: '45.8 ETH' },
    { label: 'Winners Today', value: '89' },
    { label: 'Biggest Win', value: '12.4 ETH' },
  ];

  return (
    <motion.div 
      className="flex flex-wrap justify-center gap-4 md:gap-8 mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.8 }}
    >
      {stats.map((stat, i) => (
        <motion.div 
          key={i}
          className="text-center px-4 py-2 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10"
          whileHover={{ scale: 1.05, borderColor: 'rgba(239,68,68,0.3)' }}
        >
          <div className="text-red-500 font-bold text-lg md:text-xl">{stat.value}</div>
          <div className="text-gray-500 text-xs uppercase tracking-wider">{stat.label}</div>
        </motion.div>
      ))}
    </motion.div>
  );
}

export function HeroSection() {
  const containerRef = useRef(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width);
        mouseY.set((e.clientY - rect.top) / rect.height);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <section 
      ref={containerRef}
      className="relative w-full min-h-screen overflow-hidden bg-black flex items-center justify-center pt-20 pb-12 md:pt-24 md:pb-20"
    >
      {/* Deep gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 50% 0%, rgba(139,0,0,0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(139,69,19,0.1) 0%, transparent 40%),
            radial-gradient(ellipse at 20% 60%, rgba(0,0,0,0.8) 0%, transparent 60%),
            linear-gradient(180deg, #0a0a0a 0%, #0d0d0d 50%, #050505 100%)
          `
        }}
      />

      {/* Subtle noise texture */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Floating chips */}
      <CasinoChip value="100" color="red" delay={0.5} style={{ top: '15%', left: '8%' }} />
      <CasinoChip value="500" color="black" delay={0.7} style={{ top: '25%', right: '12%' }} />
      <CasinoChip value="1K" color="gold" delay={0.9} style={{ bottom: '30%', left: '5%' }} />
      <CasinoChip value="50" color="green" delay={1.1} style={{ bottom: '20%', right: '8%' }} />
      <CasinoChip value="250" color="red" delay={1.3} style={{ top: '60%', left: '12%' }} />
      <CasinoChip value="100" color="black" delay={1.5} style={{ top: '40%', right: '5%' }} />

      {/* Main content */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 px-4 max-w-7xl mx-auto">
        
        {/* Roulette Wheel */}
        <RealisticRouletteWheel mouseX={mouseX} mouseY={mouseY} />

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-center lg:text-left max-w-xl"
        >
          {/* Tagline badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full mb-6"
          >
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 text-sm font-medium tracking-wide">Crypto Pool Betting</span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <span className="text-white">Stake Together.</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-red-600">
              One Winner Takes All.
            </span>
          </motion.h1>
          
          {/* Subheadline */}
          <motion.p
            className="text-lg md:text-xl text-gray-400 mb-8 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            Join fixed-stake rooms, compete against real players, and watch your winnings 
            settle instantly on-chain. <span className="text-white">No house edge. Pure competition.</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <motion.button
              className="group relative px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold text-lg rounded-lg overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">Join a Room</span>
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600"
                initial={{ x: '-100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
            
            <motion.button
              className="px-8 py-4 bg-transparent border-2 border-white/20 text-white font-bold text-lg rounded-lg hover:bg-white/5 hover:border-white/30 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              How It Works
            </motion.button>
          </motion.div>

          {/* Pool Stats */}
          <PoolStatsTicker />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div 
          className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <motion.div
            className="w-1 h-3 bg-red-500 rounded-full mt-2"
            animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

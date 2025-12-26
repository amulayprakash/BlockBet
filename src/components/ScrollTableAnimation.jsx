import { useRef, useEffect, useState } from 'react';
import { useScroll, useTransform, motion, useSpring } from 'framer-motion';

// French Roulette numbers
const ROULETTE_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
  5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

function getNumberColor(num) {
  if (num === 0) return 'emerald';
  return RED_NUMBERS.includes(num) ? 'red' : 'gray';
}

// Animated roulette ball with spring physics
function RouletteBall({ progress }) {
  // Smooth spring for ball position
  const smoothProgress = useSpring(progress, { stiffness: 100, damping: 30 });
  const [ballPos, setBallPos] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const unsubscribe = smoothProgress.on('change', (val) => {
      const angle = val * 1080;
      const radius = 120 + (1 - val) * 30;
      const x = Math.cos((angle * Math.PI) / 180) * radius;
      const y = Math.sin((angle * Math.PI) / 180) * radius;
      setBallPos({ x, y });
    });
    return () => unsubscribe();
  }, [smoothProgress]);

  return (
    <motion.div
      className="absolute w-4 h-4 rounded-full z-20"
      style={{
        left: `calc(50% + ${ballPos.x}px)`,
        top: `calc(50% + ${ballPos.y}px)`,
        transform: 'translate(-50%, -50%)',
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: progress > 0.05 ? 1 : 0, 
        scale: progress > 0.05 ? 1 : 0 
      }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-full h-full rounded-full bg-gradient-to-br from-white via-gray-200 to-gray-400 shadow-lg">
        <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full bg-white opacity-80" />
      </div>
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-1 bg-black/30 rounded-full blur-sm" />
    </motion.div>
  );
}

// French Roulette Wheel with smooth rotation
function FrenchRouletteWheelAnimated({ rotation, progress }) {
  // Smooth spring for rotation
  const smoothRotation = useSpring(rotation, { stiffness: 50, damping: 20 });
  
  return (
    <motion.div 
      className="relative w-72 h-72 md:w-96 md:h-96 lg:w-[420px] lg:h-[420px]"
      style={{ rotate: smoothRotation }}
    >
      {/* Outer glow */}
      <motion.div 
        className="absolute inset-0 rounded-full bg-amber-500/30 blur-3xl -z-10"
        style={{ opacity: 0.2 + progress * 0.3, scale: 1 + progress * 0.1 }}
      />
      
      {/* Wooden outer rim */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950 shadow-2xl">
        <div className="absolute inset-1 rounded-full border-4 border-amber-500/60" />
        <div className="absolute inset-2 rounded-full border-2 border-amber-400/40" />
        <div className="absolute inset-3 rounded-full border border-amber-700/50" />
      </div>
      
      {/* Chrome track ring */}
      <div className="absolute inset-5 rounded-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-300 shadow-inner">
        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-gray-100 to-gray-200" />
      </div>
      
      {/* Number wheel */}
      <div className="absolute inset-8 rounded-full overflow-hidden bg-gray-900">
        {ROULETTE_NUMBERS.map((num, i) => {
          const angle = (i / ROULETTE_NUMBERS.length) * 360;
          const colorClass = getNumberColor(num);
          const bgColor = colorClass === 'emerald' ? 'bg-emerald-600' : colorClass === 'red' ? 'bg-red-600' : 'bg-gray-800';
          
          return (
            <div
              key={i}
              className="absolute w-full h-full"
              style={{ transform: `rotate(${angle}deg)` }}
            >
              <div 
                className={`absolute top-0 left-1/2 -translate-x-1/2 w-7 h-[48%] origin-bottom ${bgColor} border-r border-l border-gray-700/30`}
                style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' }}
              >
                <span 
                  className="absolute top-3 left-1/2 -translate-x-1/2 text-white text-xs font-bold drop-shadow-md"
                  style={{ transform: 'rotate(180deg) translateX(50%)' }}
                >
                  {num}
                </span>
              </div>
            </div>
          );
        })}
        
        {/* Metal dividers */}
        {ROULETTE_NUMBERS.map((_, i) => (
          <div
            key={`divider-${i}`}
            className="absolute w-full h-full pointer-events-none"
            style={{ transform: `rotate(${(i / ROULETTE_NUMBERS.length) * 360}deg)` }}
          >
            <div className="absolute top-0 left-1/2 w-px h-[48%] bg-gradient-to-b from-gray-400 to-gray-600 origin-bottom" />
          </div>
        ))}
      </div>
      
      {/* Inner track */}
      <div className="absolute inset-[26%] rounded-full bg-gradient-to-br from-amber-800 to-amber-950 border-2 border-amber-600/50" />
      
      {/* Center cone */}
      <div className="absolute inset-[32%] rounded-full bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 shadow-xl border-2 border-amber-500/60">
        <div className="absolute inset-3 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-inner">
          <motion.span 
            className="text-amber-900 font-bold text-xl md:text-2xl lg:text-3xl"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ♦
          </motion.span>
        </div>
      </div>
      
      {/* Ball */}
      <RouletteBall progress={progress} />
    </motion.div>
  );
}

export function ScrollTableAnimation() {
  const containerRef = useRef(null);
  const [currentProgress, setCurrentProgress] = useState(0);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Smooth spring values for all transforms
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const rotation = useTransform(smoothProgress, [0, 1], [0, 1080]);
  const scale = useTransform(smoothProgress, [0, 0.5, 1], [1, 1.1, 0.95]);
  const opacity = useTransform(smoothProgress, [0, 0.9, 1], [1, 1, 0]);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', setCurrentProgress);
    return () => unsubscribe();
  }, [scrollYProgress]);

  return (
    <div 
      ref={containerRef} 
      className="relative h-[180vh]"
      style={{ willChange: 'transform' }}
    >
      <motion.div 
        className="sticky top-0 h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 overflow-hidden"
        style={{ opacity }}
      >
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/10 via-transparent to-transparent" />
          <motion.div 
            className="absolute top-1/3 left-1/4 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px]"
            style={{ scale }}
          />
          <motion.div 
            className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-red-500/5 rounded-full blur-[100px]"
            style={{ scale }}
          />
        </div>

        {/* Wheel */}
        <motion.div style={{ scale }} className="relative z-10">
          <FrenchRouletteWheelAnimated rotation={rotation} progress={currentProgress} />
        </motion.div>
        
        {/* Top text */}
        <motion.div 
          className="absolute top-12 md:top-16 left-1/2 -translate-x-1/2 text-center"
          style={{ opacity: useTransform(smoothProgress, [0, 0.15], [0, 1]) }}
        >
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">
            Watch the <span className="text-amber-400">Wheel</span> Spin
          </h2>
          <p className="text-gray-400 text-sm md:text-base">Scroll to experience the thrill</p>
        </motion.div>
        
        {/* Bottom hint */}
        <motion.div 
          className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 text-center"
          style={{ opacity: useTransform(smoothProgress, [0, 0.2], [1, 0]) }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-amber-400/60 text-xs md:text-sm tracking-widest uppercase">Scroll to spin</span>
            <svg className="w-4 h-4 md:w-5 md:h-5 text-amber-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

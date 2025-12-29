import { motion, useMotionValue, useTransform, useSpring, useAnimationControls } from 'framer-motion';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Flame, Coins, Dices } from 'lucide-react';

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

// Optimized Casino Chip - simplified for performance
function CasinoChip({ value, color, delay, style, isMobile }) {
  const colorSchemes = {
    red: { main: '#c41e3a', edge: '#ff4d6a' },
    black: { main: '#1a1a1a', edge: '#4a4a4a' },
    gold: { main: '#d4a847', edge: '#ffd866' },
    green: { main: '#0d7a40', edge: '#15c46a' },
  };
  
  const scheme = colorSchemes[color];

  // Skip rendering on mobile for performance
  if (isMobile) return null;

  return (
    <motion.div
      className="absolute hidden md:block will-change-transform"
      style={style}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.6, ease: 'easeOut' }}
    >
      <motion.div 
        className="relative"
        animate={{ y: [0, -8, 0] }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Simple chip design for performance */}
        <div 
          className="w-14 h-14 rounded-full shadow-xl"
          style={{ 
            background: `linear-gradient(145deg, ${scheme.edge}, ${scheme.main})`,
            boxShadow: `0 4px 15px rgba(0,0,0,0.3)`
          }}
        >
          {/* Edge pattern */}
          <div className="absolute inset-0 rounded-full border-4 border-white/20" />
          <div className="absolute inset-2 rounded-full border border-dashed border-white/20" />
          
          {/* Center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-sm drop-shadow">{value}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Optimized HD Roulette Wheel
function RealisticRouletteWheel({ mouseX, mouseY, isMobile }) {
  const wheelRef = useRef(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningNumber, setWinningNumber] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const wheelRotation = useMotionValue(0);
  const ballRotation = useMotionValue(0);
  
  // Smoother spring config
  const springConfig = { stiffness: 50, damping: 20, mass: 1 };
  
  // Gentler parallax for mobile
  const parallaxRange = isMobile ? 3 : 6;
  const rotateX = useSpring(
    useTransform(mouseY, [0, 1], [parallaxRange, -parallaxRange]), 
    springConfig
  );
  const rotateY = useSpring(
    useTransform(mouseX, [0, 1], [-parallaxRange, parallaxRange]), 
    springConfig
  );

  const segmentAngle = 360 / ROULETTE_NUMBERS.length;

  // Memoize number segments to prevent re-renders
  const numberSegments = useMemo(() => {
    return ROULETTE_NUMBERS.map((num, i) => {
      const angle = i * segmentAngle;
      const color = getNumberColor(num);
      
      const bgColors = {
        green: '#15803d',
        red: '#dc2626',
        black: '#171717'
      };

      return { num, angle, color, bgColor: bgColors[color] };
    });
  }, [segmentAngle]);

  // Smooth spin animation
  const spinWheel = useCallback(() => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setShowResult(false);
    setWinningNumber(null);
    
    const randomIndex = Math.floor(Math.random() * ROULETTE_NUMBERS.length);
    const winNum = ROULETTE_NUMBERS[randomIndex];
    
    const currentRotation = wheelRotation.get();
    const spins = 4 + Math.random() * 2;
    const targetRotation = currentRotation + (spins * 360) + (randomIndex * segmentAngle);
    
    // Use spring animation for smooth deceleration
    const spinDuration = 4000 + Math.random() * 1000;
    const startTime = performance.now();
    const startRotation = currentRotation;
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);
      
      // Cubic ease-out for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      
      wheelRotation.set(startRotation + (targetRotation - startRotation) * eased);
      ballRotation.set(-(startRotation + (targetRotation - startRotation) * eased) * 1.3);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        setWinningNumber(winNum);
        setShowResult(true);
        setTimeout(() => setShowResult(false), 3000);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isSpinning, segmentAngle, wheelRotation, ballRotation]);

  // Gentle idle animation
  useEffect(() => {
    if (isSpinning) return;
    
    let animationId;
    let lastTime = performance.now();
    
    const idleAnimate = (currentTime) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      
      wheelRotation.set(wheelRotation.get() + delta * 3); // Very slow rotation
      ballRotation.set(ballRotation.get() - delta * 5);
      
      animationId = requestAnimationFrame(idleAnimate);
    };
    
    animationId = requestAnimationFrame(idleAnimate);
    return () => cancelAnimationFrame(animationId);
  }, [isSpinning, wheelRotation, ballRotation]);

  // Wheel size based on screen
  const wheelSize = isMobile ? 'w-[300px] h-[300px]' : 'w-[380px] h-[380px] lg:w-[480px] lg:h-[480px]';

  return (
    <motion.div
      ref={wheelRef}
      className={`relative ${wheelSize} cursor-pointer will-change-transform`}
      style={{
        perspective: '1000px',
        rotateX,
        rotateY,
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      onClick={spinWheel}
    >
      {/* Simplified glow - single layer */}
      <div 
        className="absolute inset-0 rounded-full -z-10"
        style={{ 
          background: 'radial-gradient(circle, rgba(196,30,58,0.2) 0%, transparent 60%)',
          filter: 'blur(40px)'
        }}
      />
      
      {/* Click hint */}
      {!isSpinning && !showResult && (
        <motion.div
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-amber-400/70 text-sm font-medium z-30 whitespace-nowrap"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          Tap to spin
        </motion.div>
      )}
      
      {/* Winning result */}
      {showResult && winningNumber !== null && (
        <motion.div
          className="absolute -bottom-14 left-1/2 -translate-x-1/2 z-30"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className={`px-5 py-2.5 rounded-lg font-bold text-lg flex items-center gap-2 shadow-lg
            ${getNumberColor(winningNumber) === 'green' ? 'bg-emerald-600' : 
              getNumberColor(winningNumber) === 'red' ? 'bg-red-600' : 'bg-gray-800'} text-white`}
          >
            <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-base">
              {winningNumber}
            </span>
            <span className="text-sm uppercase">{getNumberColor(winningNumber)}</span>
          </div>
        </motion.div>
      )}
      
      {/* === OUTER WOOD RIM === */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{
          background: 'linear-gradient(145deg, #8B4513 0%, #654321 30%, #4a2c17 50%, #654321 70%, #8B4513 100%)',
          boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5), 0 15px 40px rgba(0,0,0,0.6)'
        }}
      >
        {/* Gold ring */}
        <div className="absolute inset-2 rounded-full border-2 border-amber-500/40" />
        <div className="absolute inset-3 rounded-full border border-amber-600/20" />
      </div>

      {/* === CHROME TRACK === */}
      <div 
        className="absolute inset-[5%] rounded-full"
        style={{
          background: 'linear-gradient(180deg, #e8e8e8 0%, #a0a0a0 30%, #808080 50%, #a0a0a0 70%, #d0d0d0 100%)',
          boxShadow: 'inset 0 2px 8px rgba(255,255,255,0.6), inset 0 -2px 8px rgba(0,0,0,0.2)'
        }}
      />

      {/* === NUMBER WHEEL === */}
      <motion.div 
        className="absolute inset-[9%] rounded-full overflow-hidden will-change-transform"
        style={{ 
          background: '#0a0a0a',
          rotate: wheelRotation
        }}
      >
        {numberSegments.map(({ num, angle, color, bgColor }, i) => (
          <div
            key={i}
            className="absolute w-full h-full"
            style={{ transform: `rotate(${angle}deg)` }}
          >
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 origin-bottom"
              style={{ 
                width: isMobile ? '24px' : '28px',
                height: '44%',
                backgroundColor: bgColor,
                clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)',
              }}
            >
              <span 
                className="absolute top-2 left-1/2 font-bold text-white"
                style={{ 
                  fontSize: isMobile ? '9px' : '11px',
                  transform: 'translateX(-50%) rotate(180deg)',
                  textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                }}
              >
                {num}
              </span>
            </div>
            
            {/* Divider */}
            <div 
              className="absolute top-0 left-1/2 origin-bottom bg-gradient-to-b from-gray-400 to-gray-600"
              style={{
                width: '1px',
                height: '44%',
                transform: `translateX(-50%) rotate(${segmentAngle / 2}deg)`,
              }}
            />
          </div>
        ))}

        {/* Inner track */}
        <div 
          className="absolute inset-[42%] rounded-full"
          style={{
            background: 'linear-gradient(145deg, #5d3a1a, #3d2510)',
            boxShadow: 'inset 0 0 15px rgba(0,0,0,0.6)'
          }}
        />
      </motion.div>

      {/* === CENTER CONE === */}
      <div 
        className="absolute inset-[38%] rounded-full"
        style={{
          background: 'linear-gradient(145deg, #e8c252, #b8860b 50%, #8b6914)',
          boxShadow: 'inset 0 -5px 15px rgba(0,0,0,0.4), inset 0 5px 10px rgba(255,255,255,0.2), 0 5px 15px rgba(0,0,0,0.3)'
        }}
      >
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
          <span className="text-amber-900 text-2xl md:text-3xl font-bold">♦</span>
        </div>
      </div>

      {/* === BALL === */}
      <motion.div
        className="absolute rounded-full z-20 will-change-transform"
        style={{
          width: isMobile ? '12px' : '16px',
          height: isMobile ? '12px' : '16px',
          background: 'radial-gradient(circle at 30% 25%, #fff 0%, #d0d0d0 40%, #909090 100%)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.8)',
          top: '15%',
          left: '50%',
          x: '-50%',
          rotate: ballRotation,
          transformOrigin: `0 ${isMobile ? '130px' : '165px'}`,
        }}
      />
    </motion.div>
  );
}

// Simplified stats ticker - Moved to bottom

export function HeroSection() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Throttled mouse tracking
  useEffect(() => {
    let ticking = false;
    
    const handleMouseMove = (e) => {
      if (ticking || isMobile) return;
      
      ticking = true;
      requestAnimationFrame(() => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          mouseX.set((e.clientX - rect.left) / rect.width);
          mouseY.set((e.clientY - rect.top) / rect.height);
        }
        ticking = false;
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY, isMobile]);

  return (
    <section 
      ref={containerRef}
      className="relative w-full min-h-screen overflow-hidden bg-black flex items-center justify-center pt-20 pb-12 md:pt-24 md:pb-16 font-sans"
    >
      {/* Premium Casino Background - Abstract Fallback */}
      <div className="absolute inset-0 z-0">
        {/* Deep dark base */}
        <div className="absolute inset-0 bg-[#050505]" />
        
        {/* Rich red gradient top right */}
        <div className="absolute top-0 right-0 w-[80vw] h-[80vh] bg-gradient-to-b from-[#4a0404] to-transparent opacity-40 blur-[100px] rounded-full transform translate-x-1/3 -translate-y-1/4" />
        
        {/* Gold glow bottom left */}
        <div className="absolute bottom-0 left-0 w-[60vw] h-[60vh] bg-gradient-to-t from-[#b8860b] to-transparent opacity-20 blur-[100px] rounded-full transform -translate-x-1/4 translate-y-1/4" />
        
        {/* Texture overlay */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        
        {/* Radial vignette */}
        <div className="absolute inset-0 bg-radial-casino opacity-80" />
      </div>

      {/* Floating chips - hidden on mobile */}
      <CasinoChip value="100" color="red" delay={0.3} style={{ top: '15%', left: '8%' }} isMobile={isMobile} />
      <CasinoChip value="500" color="black" delay={0.5} style={{ top: '25%', right: '12%' }} isMobile={isMobile} />
      <CasinoChip value="1K" color="gold" delay={0.7} style={{ bottom: '30%', left: '6%' }} isMobile={isMobile} />
      <CasinoChip value="50" color="green" delay={0.9} style={{ bottom: '20%', right: '8%' }} isMobile={isMobile} />

      {/* Main content */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-16 px-4 max-w-7xl mx-auto">
        
        {/* Roulette Wheel */}
        <div className="order-2 lg:order-1 transform scale-90 lg:scale-100 transition-transform duration-500">
          <RealisticRouletteWheel mouseX={mouseX} mouseY={mouseY} isMobile={isMobile} />
        </div>

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-center lg:text-left max-w-xl px-2 order-1 lg:order-2"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 backdrop-blur-md rounded-full mb-6 md:mb-8 hover:bg-white/10 transition-colors cursor-default"
          >
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
            <span className="text-gray-200 text-xs md:text-sm font-medium tracking-wide uppercase">Live Crypto Betting</span>
          </motion.div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight tracking-tight drop-shadow-2xl">
            <span className="text-white">Stake Together.</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-red-800 animate-gradient-x">
              Win It All.
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg md:text-xl text-gray-400 mb-8 md:mb-10 leading-relaxed font-light">
            Join high-stakes rooms, compete against real players, and experience 
            <span className="text-gold font-medium"> instant on-chain settlements</span>. 
            Detailed specifically for the modern gambler.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8 md:mb-12">
            <motion.button
              onClick={() => navigate('/dashboard/rooms')}
              className="btn-premium px-8 py-4 text-white font-bold text-lg rounded-lg uppercase tracking-wider"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Playing
            </motion.button>
            
            <motion.button
              onClick={() => {
                const element = document.querySelector('#how-it-works');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="btn-outline-gold px-8 py-4 font-bold text-lg rounded-lg uppercase tracking-wider backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              How It Works
            </motion.button>
          </div>

          {/* Stats */}
          <PoolStatsTicker isMobile={isMobile} />
        </motion.div>
      </div>

      {/* Scroll indicator - hidden on mobile */}
      {!isMobile && (
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <motion.div 
            className="w-6 h-10 border-2 border-white/10 rounded-full flex justify-center backdrop-blur-sm"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.div
              className="w-1.5 h-1.5 bg-gold rounded-full mt-2"
              style={{ backgroundColor: '#d4a847', boxShadow: '0 0 10px #d4a847' }}
              animate={{ y: [0, 12, 0], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}

// Simplified stats ticker
function PoolStatsTicker({ isMobile }) {
  const stats = [
    { label: 'Active Pools', value: '127', icon: Dices, color: 'text-blue-400' },
    { label: 'Total Staked', value: '45.8 ETH', icon: Coins, color: 'text-amber-400' },
    { label: 'Winners Today', value: '89', icon: Crown, color: 'text-yellow-400' },
    { label: 'Biggest Win', value: '12.4 ETH', icon: Flame, color: 'text-red-500' },
  ];

  // Show fewer stats on mobile
  const displayStats = isMobile ? stats.slice(0, 2) : stats;

  return (
    <motion.div 
      className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.8 }}
    >
      {displayStats.map((stat, i) => (
        <div 
          key={i}
          className="glass-card glass-card-hover p-4 rounded-xl flex flex-col items-center justify-center text-center group border-t border-white/10"
        >
          {/* Framed Icon */}
          <div className="mb-3 relative">
            <div className={`absolute inset-0 bg-current opacity-10 rounded-full blur-md group-hover:opacity-20 transition-opacity ${stat.color}`} />
            <div className="w-12 h-12 rounded-full border border-white/10 bg-black/40 flex items-center justify-center relative z-10 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
          
          <div className="text-white font-bold text-lg md:text-2xl font-heading mb-1 text-shadow-sm">{stat.value}</div>
          <div className="text-gray-400 text-[10px] md:text-xs uppercase tracking-widest font-medium">{stat.label}</div>
        </div>
      ))}
    </motion.div>
  );
}

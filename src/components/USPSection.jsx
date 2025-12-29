import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ShieldCheck, Zap, Wallet, Gem, Flame } from 'lucide-react';

// Animated floating chips/particles
function FloatingElements({ count = 15 }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => {
        const isChip = i % 3 === 0;
        const colors = ['bg-red-500', 'bg-amber-500', 'bg-emerald-500', 'bg-gray-700'];
        const color = colors[i % colors.length];
        
        return (
          <motion.div
            key={i}
            className={`absolute rounded-full ${isChip ? 'w-3 h-3' : 'w-1 h-1'} ${color}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20 - Math.random() * 20, 0],
              x: [0, Math.random() * 15 - 7.5, 0],
              opacity: [0.3, 0.6, 0.3],
              scale: isChip ? [1, 1.2, 1] : [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        );
      })}
    </div>
  );
}

const features = [
  {
    title: 'Fixed Stake, Fixed Risk',
    description: 'Know exactly what you\'re betting. Each room has a predetermined stake — no surprises.',
    icon: Gem,
    accent: 'amber',
  },
  {
    title: 'On-Chain Locking',
    description: 'Funds are locked in smart contracts. No one controls the pot but the code.',
    icon: ShieldCheck,
    accent: 'emerald',
  },
  {
    title: 'Instant Settlement',
    description: 'Winners are paid automatically to their wallet immediately after the game ends.',
    icon: Zap,
    accent: 'amber',
  },
  {
    title: 'Mobile Wallet Ready',
    description: 'Seamlessly connect with MetaMask, Rainbow, or Coinbase Wallet on any device.',
    icon: Wallet,
    accent: 'red',
  },
  {
    title: 'No Refunds',
    description: 'Once you join, you\'re committed. The thrill is real, and the stakes are final.',
    icon: Flame,
    accent: 'red',
  },
];

function FeatureCard({ feature, index }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const accentColors = {
    amber: 'from-amber-500/20 to-amber-900/5 border-amber-500/30 hover:border-amber-500/60 shadow-[0_0_30px_rgba(212,168,71,0.1)]',
    red: 'from-red-500/20 to-red-900/5 border-red-500/30 hover:border-red-500/60 shadow-[0_0_30px_rgba(220,38,38,0.1)]',
    emerald: 'from-emerald-500/20 to-emerald-900/5 border-emerald-500/30 hover:border-emerald-500/60 shadow-[0_0_30px_rgba(16,185,129,0.1)]',
  };

  const orbColors = {
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    emerald: 'bg-emerald-500',
  };
  
  const iconColors = {
     amber: 'text-amber-400',
     red: 'text-red-400',
     emerald: 'text-emerald-400'
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative group h-full"
    >
      <div className={`glass-card h-full rounded-2xl p-1 transition-all duration-500 group-hover:-translate-y-2 border relative overflow-hidden ${accentColors[feature.accent].split(' ').filter(c => c.startsWith('border') || c.startsWith('shadow')).join(' ')}`}>
        {/* Card Content Container */}
        <div className={`relative h-full bg-gradient-to-b ${accentColors[feature.accent].split(' ').filter(c => c.startsWith('from')).join(' ')} rounded-xl p-8 flex flex-col items-center text-center overflow-hidden`}>
          
          {/* Luxurious Icon Backdrop/Pedestal */}
          <div className="relative mb-8 group-hover:scale-105 transition-transform duration-500">
             {/* Spinning Ring */}
            <div className="absolute inset-0 border-2 border-dashed border-white/20 rounded-full animate-[spin_10s_linear_infinite]" />
            
            {/* Glowing Orb Backdrop */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 ${orbColors[feature.accent]} opacity-20 blur-xl rounded-full group-hover:opacity-30 transition-opacity duration-500`} />
            
            {/* Glass Pedestal */}
            <div className="relative w-32 h-32 rounded-full border border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center shadow-inner">
               <feature.icon className={`w-12 h-12 ${iconColors[feature.accent]} drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] transform group-hover:scale-110 transition-transform duration-300`} />
            </div>
            
            {/* Highlight */}
            <div className="absolute top-0 right-0 w-10 h-10 bg-white/10 rounded-full blur-lg" />
          </div>
          
          <h3 className="text-xl md:text-2xl font-bold text-white mb-4 font-heading tracking-wide uppercase">
            {feature.title}
          </h3>
          
          {/* Decorative Separator */}
          <div className="flex items-center gap-2 mb-4 opacity-50">
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-white/50" />
            <div className="w-1.5 h-1.5 rotate-45 border border-white/50" />
            <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-white/50" />
          </div>
          
          <p className="text-gray-400 text-sm md:text-base leading-relaxed font-light">
            {feature.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function USPSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section ref={ref} className="relative py-24 md:py-32 px-4 overflow-hidden border-t border-white/5 bg-black">
      {/* Background Texture */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
      
      {/* Gradient Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-64 w-[500px] h-[500px] bg-red-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-64 w-[500px] h-[500px] bg-amber-900/20 rounded-full blur-[120px]" />
      </div>

      {/* Floating elements */}
      <FloatingElements count={20} />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.span 
            className="inline-block px-4 py-1.5 bg-gradient-to-r from-amber-500/10 to-transparent border-l-2 border-amber-500 text-gold text-sm font-semibold tracking-widest uppercase mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
          >
            Premium Features
          </motion.span>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 drop-shadow-xl">
            Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4a847] via-[#ffd866] to-[#d4a847]">BlockBet</span>?
          </h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Experience the future of high-stakes gambling with complete transparency and <span className="text-white font-medium">zero house edge</span>.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}







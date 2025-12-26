import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

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
    icon: '💎',
    accent: 'amber',
  },
  {
    title: 'No Refunds, No Reversals',
    description: 'Once you\'re in, you\'re in. Stakes are final. Play with conviction.',
    icon: '🔥',
    accent: 'red',
  },
  {
    title: 'On-Chain Fund Locking',
    description: 'Funds locked in smart contract. Transparent, verifiable, tamper-proof.',
    icon: '⛓️',
    accent: 'emerald',
  },
  {
    title: 'Instant Settlement',
    description: 'Winners receive payouts immediately. No waiting, no delays.',
    icon: '⚡',
    accent: 'amber',
  },
  {
    title: 'Mobile Wallet Ready',
    description: 'Optimized for mobile. Bet anywhere, anytime.',
    icon: '📱',
    accent: 'red',
  },
];

function FeatureCard({ feature, index }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const accentColors = {
    amber: 'border-amber-500/30 hover:border-amber-500/60',
    red: 'border-red-500/30 hover:border-red-500/60',
    emerald: 'border-emerald-500/30 hover:border-emerald-500/60',
  };

  const glowColors = {
    amber: 'group-hover:bg-amber-500/10',
    red: 'group-hover:bg-red-500/10',
    emerald: 'group-hover:bg-emerald-500/10',
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative group"
    >
      <div className={`bg-gray-900/60 backdrop-blur-sm rounded-xl p-6 border ${accentColors[feature.accent]} transition-all duration-300 h-full`}>
        {/* Glow effect on hover */}
        <div className={`absolute inset-0 rounded-xl ${glowColors[feature.accent]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
        
        <div className="relative z-10 text-center">
          <motion.span 
            className="text-4xl mb-4 block"
            animate={inView ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
          >
            {feature.icon}
          </motion.span>
          <h3 className="text-xl font-bold text-white mb-2">
            {feature.title}
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed">
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
    <section ref={ref} className="relative py-24 md:py-32 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-950 to-gray-900" />
      
      {/* Floating elements */}
      <FloatingElements count={20} />
      
      {/* Ambient glow */}
      <motion.div 
        className="absolute top-1/4 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px]"
        animate={{ x: [0, 30, 0], opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div 
        className="absolute bottom-1/4 right-0 w-80 h-80 bg-red-500/5 rounded-full blur-[100px]"
        animate={{ x: [0, -30, 0], opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.span 
            className="inline-block px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-sm font-medium mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
          >
            ♦ Key Features ♦
          </motion.span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-500">Red-Black</span>?
          </h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Built for speed, transparency, and high-stakes thrill
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

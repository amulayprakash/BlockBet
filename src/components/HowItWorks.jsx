import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { LogIn, Coins, Trophy } from 'lucide-react';

const steps = [
  {
    title: 'Join a Room',
    description: 'Choose a room with a fixed stake and limited number of players. Browse active rooms and pick your battle.',
    icon: LogIn,
    color: 'from-amber-500 to-amber-600',
    delay: 0.2,
  },
  {
    title: 'Place Bet',
    description: 'Deposit the required stake. Funds are locked instantly on the blockchain until the round completes.',
    icon: Coins,
    color: 'from-red-500 to-red-600',
    delay: 0.4,
  },
  {
    title: 'Win & Withdraw',
    description: 'If the wheel lands on your number or color, winnings are instantly transferred to your wallet.',
    icon: Trophy,
    color: 'from-emerald-500 to-emerald-600',
    delay: 0.6,
  },
];

function StepCard({ step, index }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay: step.delay }}
      className="relative z-10"
      whileHover={{ scale: 1.02, y: -5 }}
    >
      {/* Connector Line (Mobile) */}
      {index < 2 && (
        <div className="absolute left-1/2 -bottom-12 w-1 h-12 bg-white/10 md:hidden -translate-x-1/2" />
      )}

      {/* Card */}
      <div className="relative glass-card glass-card-hover rounded-2xl p-8 hover:border-gold/30 transition-all duration-300 h-full text-center md:text-left group">
        {/* Step number badge */}
        <div className={`absolute -top-4 left-1/2 md:-left-4 md:left-auto -translate-x-1/2 md:translate-x-0 w-12 h-12 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg ring-4 ring-black/50 z-20`}>
          <span className="text-white font-bold font-heading text-lg">{index + 1}</span>
        </div>
        
        {/* Timeline Node Icon Style */}
        <motion.div
          className="flex justify-center md:justify-start mb-6 pt-4 md:pt-0"
          animate={inView ? { rotate: [0, 5, -5, 0] } : {}}
          transition={{ duration: 0.5, delay: step.delay + 0.3 }}
        >
          <div className="relative group/icon">
            {/* Outer Ring */}
            <div className="w-24 h-24 rounded-full border border-white/5 bg-black/20 backdrop-blur-sm flex items-center justify-center relative z-10 group-hover/icon:border-gold/30 transition-colors duration-500">
               {/* Inner Circle Backdrop */}
               <div className="w-16 h-16 rounded-full bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center shadow-inner">
                  <step.icon className="w-8 h-8 text-white drop-shadow-lg group-hover/icon:scale-110 transition-transform duration-300" />
               </div>
            </div>
            
            {/* Glows */}
            <div className="absolute inset-0 bg-gold/5 rounded-full blur-xl scale-0 group-hover/icon:scale-150 transition-transform duration-500" />
          </div>
        </motion.div>
        
        {/* Content */}
        <h3 className="text-2xl font-bold text-white mb-4 font-heading group-hover:text-gold transition-colors duration-300">{step.title}</h3>
        <p className="text-gray-400 leading-relaxed font-light">{step.description}</p>
        
        {/* Decorative line */}
        <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent w-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </motion.div>
  );
}

export function HowItWorks() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section ref={ref} className="py-24 md:py-32 px-4 bg-black relative overflow-hidden">
      {/* Background Texture */}
      <div className="absolute inset-0 bg-[#080808]" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-felt.png')] opacity-40 mix-blend-overlay" />
      
      {/* Connector Line (Desktop) */}
      <div className="hidden md:block absolute top-[60%] left-0 w-full h-1 bg-white/5 -translate-y-1/2 z-0" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.span 
            className="inline-block px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-gray-300 text-sm font-medium mb-4 tracking-wider uppercase"
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Simple Process
          </motion.span>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 drop-shadow-xl">
            How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Works</span>
          </h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Three simple steps to start betting with crypto
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative">
          {steps.map((step, index) => (
            <StepCard key={index} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

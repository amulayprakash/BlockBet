import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const steps = [
  {
    title: 'Join a Room',
    description: 'Choose a room with a fixed stake and limited number of players. Browse active rooms and pick your battle.',
    icon: '🎰',
    color: 'from-amber-500 to-amber-600',
    delay: 0.2,
  },
  {
    title: 'Funds Locked',
    description: 'Your stake is locked on-chain once you join. No withdrawals until the room settles.',
    icon: '🔐',
    color: 'from-emerald-500 to-emerald-600',
    delay: 0.4,
  },
  {
    title: 'Room Settled',
    description: 'When the room is full, the winner is selected and funds are distributed instantly.',
    icon: '🏆',
    color: 'from-red-500 to-red-600',
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
      className="relative"
      whileHover={{ scale: 1.02, y: -5 }}
    >
      {/* Card */}
      <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 hover:border-amber-500/30 transition-all duration-300 h-full text-center md:text-left">
        {/* Step number badge */}
        <div className={`absolute -top-4 -left-4 w-10 h-10 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
          <span className="text-white font-bold">{index + 1}</span>
        </div>
        
        {/* Icon */}
        <motion.div
          className="text-5xl mb-6"
          animate={inView ? { rotate: [0, 10, -10, 0] } : {}}
          transition={{ duration: 0.5, delay: step.delay + 0.3 }}
        >
          {step.icon}
        </motion.div>
        
        {/* Content */}
        <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
        <p className="text-gray-400 leading-relaxed">{step.description}</p>
        
        {/* Decorative line */}
        <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${step.color} rounded-b-2xl`} style={{ width: `${(index + 1) * 33}%` }} />
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
    <section ref={ref} className="py-12 md:py-16 px-4 bg-gradient-to-b from-gray-950 to-gray-900 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-red-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.span 
            className="inline-block px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-sm font-medium mb-4"
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Simple Process
          </motion.span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Works</span>
          </h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Three simple steps to start betting with crypto
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => (
            <StepCard key={index} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

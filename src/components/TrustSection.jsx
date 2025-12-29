import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export function TrustSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <section ref={ref} className="py-20 md:py-32 px-4 bg-gradient-to-b from-gray-900 to-casino-black">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8">
            Transparent & <span className="text-neon-red">Controlled</span>
          </h2>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="space-y-6 text-center md:text-left"
          >
            <p className="text-gray-300 text-lg md:text-xl leading-relaxed">
              We believe in <span className="text-casino-red font-semibold">honest transparency</span>. 
              Our betting platform uses an admin-controlled settlement system. This means:
            </p>

            <div className="bg-gray-900 rounded-lg p-6 md:p-8 border border-gray-800 mt-8">
              <ul className="space-y-4 text-gray-300 text-base md:text-lg">
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="flex items-start"
                >
                  <span className="text-casino-red mr-3 text-xl">•</span>
                  <span>
                    <strong className="text-white">Admin-controlled settlement:</strong> Room winners are selected 
                    by the contract random selection for SINGLE_WINNER rooms.
                  </span>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="flex items-start"
                >
                  <span className="text-casino-red mr-3 text-xl">•</span>
                  <span>
                    <strong className="text-white">On-chain transparency:</strong> All room parameters, 
                    player lists, and settlement results are publicly verifiable on the blockchain.
                  </span>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.9, duration: 0.5 }}
                  className="flex items-start"
                >
                  <span className="text-casino-red mr-3 text-xl">•</span>
                  <span>
                    <strong className="text-white">Secure fund locking:</strong> Your tokens are locked 
                    in the smart contract until settlement. No withdrawals until winners are determined.
                  </span>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 1.1, duration: 0.5 }}
                  className="flex items-start"
                >
                  <span className="text-casino-red mr-3 text-xl">•</span>
                  <span>
                    <strong className="text-white">Fast payouts:</strong> Once settled, winners can 
                    immediately withdraw their share from their withdrawable balance.
                  </span>
                </motion.li>
              </ul>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 1.3, duration: 0.8 }}
              className="text-gray-400 text-base md:text-lg mt-8 text-center"
            >
              We're upfront about our system. If you're comfortable with admin-controlled settlement 
              and want fast, transparent crypto betting, you're in the right place.
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}








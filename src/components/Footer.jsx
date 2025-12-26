import { motion } from 'framer-motion';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center md:text-left flex flex-col items-center md:items-start"
          >
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-2 mb-4 group cursor-pointer">
              {/* Logo icon - stylized roulette chip */}
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:shadow-red-500/40 transition-shadow">
                <div className="absolute inset-1 rounded-full border-2 border-dashed border-white/30" />
                <span className="text-white font-bold text-lg">B</span>
              </div>
              
              {/* Brand name */}
              <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-black text-white tracking-tight">
                  Block<span className="text-red-500">Bet</span>
                </span>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest hidden sm:block">
                  Winner Takes All
                </span>
              </div>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed text-center md:text-left">
              French roulette-style crypto betting rooms with fixed stakes, instant settlement, and on-chain transparency.
            </p>
          </motion.div>

          {/* Network Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center md:text-left flex flex-col items-center md:items-start"
          >
            <h4 className="text-lg font-semibold text-white mb-4">Networks</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Ethereum
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                BNB Chain
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full" />
                Polygon
              </li>
            </ul>
          </motion.div>

          {/* Wallet Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center md:text-left flex flex-col items-center md:items-start"
          >
            <h4 className="text-lg font-semibold text-white mb-4">Supported Wallets</h4>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {['MetaMask', 'WalletConnect', 'Coinbase'].map((wallet) => (
                <span 
                  key={wallet}
                  className="px-3 py-1.5 bg-gray-900 rounded-lg text-gray-300 text-sm border border-gray-700 hover:border-amber-500/50 transition-colors"
                >
                  {wallet}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Divider with roulette numbers decoration */}
        <div className="relative border-t border-gray-800 pt-8">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-1">
            {[0, 32, 15, 19, 4].map((num, i) => (
              <span 
                key={i} 
                className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold
                  ${num === 0 ? 'bg-emerald-600 text-white' : i % 2 === 0 ? 'bg-red-600 text-white' : 'bg-gray-800 text-white'}`}
              >
                {num}
              </span>
            ))}
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-4">
            <p className="text-gray-500 text-sm">
              © {currentYear} BlockBet. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-gray-500 text-sm">
              {['Terms', 'Privacy', 'Contract'].map((link) => (
                <motion.a 
                  key={link}
                  href="#" 
                  className="hover:text-amber-400 transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  {link}
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

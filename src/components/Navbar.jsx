import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, LogOut } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { WalletConnectModal } from './WalletConnectModal';

const navLinks = [
  { name: 'Home', href: '#home' },
  { name: 'How It Works', href: '#how-it-works' },
  { name: 'Features', href: '#features' },
  { name: 'Live Rooms', href: '#live-rooms' },
  { name: 'Trust', href: '#trust' },
];

export function Navbar() {
  const navigate = useNavigate();
  const { address, isConnected, disconnect } = useWallet();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const truncateAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleDisconnect = async () => {
    await disconnect();
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e, href) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-black/90 backdrop-blur-lg border-b border-white/10 shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="w-full px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 w-full">
          
          {/* Brand Logo - Extreme Left */}
          <motion.a 
            href="#home"
            onClick={(e) => scrollToSection(e, '#home')}
            className="flex items-center gap-2 group"
            whileHover={{ scale: 1.02 }}
          >
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
          </motion.a>

          {/* Right side - Wallet/Disconnect - Extreme Right */}
          <div className="flex items-center gap-3">
            {isConnected ? (
              <>
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-gray-300">
                    {truncateAddress(address)}
                  </span>
                </div>
                <motion.button
                  onClick={handleDisconnect}
                  className="flex px-4 py-2 bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all text-sm font-medium items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Disconnect</span>
                </motion.button>
              </>
            ) : (
              <motion.button
                onClick={() => setIsWalletModalOpen(true)}
                className="flex px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold text-sm rounded-lg shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all duration-300 items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Wallet className="w-4 h-4" />
                <span className="hidden sm:inline">Connect Wallet</span>
                <span className="sm:hidden">Connect</span>
              </motion.button>
            )}

            {/* Mobile menu button */}
            <motion.button
              className="md:hidden p-2 text-gray-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileTap={{ scale: 0.9 }}
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={{ 
          height: isMobileMenuOpen ? 'auto' : 0,
          opacity: isMobileMenuOpen ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        className="md:hidden overflow-hidden bg-black/95 backdrop-blur-lg border-t border-white/10"
      >
        <div className="px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => scrollToSection(e, link.href)}
              className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              {link.name}
            </a>
          ))}
          <div className="pt-2 border-t border-white/10">
            {isConnected ? (
              <>
                <div className="px-4 py-3 mb-2 bg-white/5 border border-white/10 rounded-lg flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-gray-300">
                    {truncateAddress(address)}
                  </span>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all text-sm font-medium flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setIsWalletModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Wallet Connect Modal */}
      <WalletConnectModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </motion.nav>
  );
}

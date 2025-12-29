import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, AlertCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useModal } from '../contexts/ModalContext';

const MODAL_ID = 'walletConnect';

export function WalletConnectModal({ isOpen, onClose }) {
  const { connect, loading, isCorrectNetwork, switchNetwork, chainId } = useWallet();
  const { activeModal, setActiveModal } = useModal();

  // Manage modal state - ensure only one modal is open at a time
  useEffect(() => {
    if (isOpen) {
      // If another modal is active, don't open this one
      if (activeModal && activeModal !== MODAL_ID) {
        return;
      }
      setActiveModal(MODAL_ID);
    } else {
      // Modal is closing, clear active modal if this was the active one
      if (activeModal === MODAL_ID) {
        setActiveModal(null);
      }
    }
  }, [isOpen, activeModal, setActiveModal]);

  const handleConnect = async () => {
    try {
      await connect();
      onClose();
    } catch (error) {
      console.error('Connection error:', error);
      // Error will be shown to user via wallet
    }
  };

  // Only render if this modal is the active one
  const shouldRender = isOpen && activeModal === MODAL_ID;

  return (
    <AnimatePresence>
      {shouldRender && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal Container - Centered */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card rounded-2xl p-8 max-w-md w-full relative border border-white/10 shadow-2xl pointer-events-auto"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring' }}
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/20"
                >
                  <Wallet className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">Connect Wallet</h2>
                <p className="text-gray-400 text-sm">
                  Connect your wallet to start betting
                </p>
              </div>

              {/* Network Warning */}
              {chainId && !isCorrectNetwork && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-amber-400 font-medium text-sm mb-1">
                      Wrong Network
                    </p>
                    <p className="text-gray-300 text-xs mb-2">
                      Please switch to Sepolia network (Chain ID: 11155111)
                    </p>
                    <button
                      onClick={switchNetwork}
                      className="text-amber-400 hover:text-amber-300 text-xs font-medium underline"
                    >
                      Switch Network
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Connect Button */}
              <motion.button
                onClick={handleConnect}
                disabled={loading}
                className="w-full btn-premium px-6 py-4 text-white font-bold text-lg rounded-lg uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Wallet className="w-5 h-5" />
                    <span>Connect Wallet</span>
                  </>
                )}
              </motion.button>

              {/* Info */}
              <p className="text-center text-gray-500 text-xs mt-6">
                By connecting, you agree to BlockBet's Terms of Service
              </p>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}


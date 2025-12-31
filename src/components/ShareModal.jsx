import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, MessageCircle, Check } from 'lucide-react';
import { useState } from 'react';
import { generateRoomShareUrl, copyToClipboard, shareOnWhatsApp } from '../utils/shareUtils';

export function ShareModal({ isOpen, onClose, roomId, displayRoomId, totalPool = null }) {
  const [copied, setCopied] = useState(false);
  const roomUrl = generateRoomShareUrl(roomId);

  const handleCopyLink = async () => {
    const success = await copyToClipboard(roomUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    shareOnWhatsApp(roomId, displayRoomId, totalPool);
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-gray-900 rounded-2xl border border-gray-700 p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Share Room #{displayRoomId}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-800 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Room Link */}
            <div className="mb-6">
              <label className="text-sm text-gray-400 mb-2 block">Room Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={roomUrl}
                  readOnly
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-red-500 transition-colors"
                  onClick={(e) => e.target.select()}
                />
                <motion.button
                  onClick={handleCopyLink}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                    copied
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {copied ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
              {copied && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-emerald-400 text-sm mt-2 flex items-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  Link copied to clipboard!
                </motion.p>
              )}
            </div>

            {/* Share Options */}
            <div className="mb-4">
              <label className="text-sm text-gray-400 mb-3 block">Share via</label>
              <div className="grid grid-cols-1 gap-2">
                {/* WhatsApp */}
                <motion.button
                  onClick={handleWhatsAppShare}
                  className="flex items-center gap-3 p-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-all text-white"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold">WhatsApp</div>
                    <div className="text-sm text-gray-400">Share via WhatsApp</div>
                  </div>
                </motion.button>

                {/* Copy Link Button (Alternative) */}
                <motion.button
                  onClick={handleCopyLink}
                  className="flex items-center gap-3 p-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-all text-white"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Copy className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold">Copy Link</div>
                    <div className="text-sm text-gray-400">Copy to share anywhere</div>
                  </div>
                </motion.button>
              </div>
            </div>

            {/* Room Info */}
            {totalPool && (
              <div className="bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/30 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Total Pool</div>
                <div className="text-lg font-bold text-emerald-400">{totalPool} USDT</div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

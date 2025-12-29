import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Wallet, LogOut, Menu, X, Home, Clock, CheckCircle, Coins, TrendingUp } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { WalletConnectModal } from '../components/WalletConnectModal';
import { Rooms } from './Rooms';
import { JoinRoom } from './JoinRoom';
import { UserDashboard } from './UserDashboard';
import { RoomDetails } from './RoomDetails';

export function Dashboard() {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' && window.innerWidth >= 1024);
  const { address, isConnected, isCorrectNetwork, disconnect } = useWallet();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
      // Auto-open sidebar on desktop
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      }
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const truncateAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleDisconnect = async () => {
    await disconnect();
    navigate('/dashboard/rooms');
  };

  const sidebarLinks = [
    {
      name: 'Rooms',
      path: '/dashboard/rooms',
      icon: Home,
      alwaysActive: true,
      description: 'Browse available rooms',
    },
  ];

  const personalInfoLinks = [
    {
      name: 'My Dashboard',
      path: '/dashboard/user',
      icon: LayoutDashboard,
      requiresWallet: true,
      description: 'Overview of your activity',
    },
    {
      name: 'Active Rooms',
      path: '/dashboard/user?tab=active',
      icon: Clock,
      requiresWallet: true,
      description: 'Rooms you\'re currently in',
    },
    {
      name: 'Settled Rooms',
      path: '/dashboard/user?tab=settled',
      icon: CheckCircle,
      requiresWallet: true,
      description: 'Your betting history',
    },
    {
      name: 'Withdraw',
      path: '/dashboard/user?tab=withdraw',
      icon: Coins,
      requiresWallet: true,
      description: 'Withdraw your winnings',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-lg border-b border-white/10 shadow-lg"
      >
        <div className="w-full px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20 w-full">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 group"
            >
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:shadow-red-500/40 transition-shadow">
                <div className="absolute inset-1 rounded-full border-2 border-dashed border-white/30" />
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-black text-white tracking-tight">
                  Block<span className="text-red-500">Bet</span>
                </span>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest hidden sm:block">
                  Winner Takes All
                </span>
              </div>
            </Link>

            {/* Right side - Wallet */}
            <div className="flex items-center gap-3">
              {isConnected ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-gray-300">
                      {truncateAddress(address)}
                    </span>
                  </div>
                  <motion.button
                    onClick={handleDisconnect}
                    className="px-4 py-2 bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all text-sm font-medium flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Disconnect</span>
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  onClick={() => setIsWalletModalOpen(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold text-sm rounded-lg shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all duration-300 flex items-center gap-2"
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
                className="lg:hidden p-2 text-gray-400 hover:text-white"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                whileTap={{ scale: 0.9 }}
              >
                {isSidebarOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      <div className="flex pt-16 md:pt-20">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-black/95 lg:bg-black/50 backdrop-blur-lg border-r border-white/10 pt-20 lg:pt-0 transition-transform duration-300 ${
            isDesktop || isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-full overflow-y-auto px-4 py-6">
            <nav className="space-y-6">
              {/* Main Navigation */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                  Navigation
                </h3>
                <div className="space-y-2">
                  {sidebarLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path;

                    return (
                      <motion.button
                        key={link.path}
                        onClick={() => {
                          navigate(link.path);
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 relative ${
                          isActive
                            ? 'bg-gradient-to-r from-red-600/20 to-red-700/20 border border-red-500/30 text-white'
                            : 'text-gray-300 hover:bg-white/5 hover:text-white'
                        }`}
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? 'text-red-400' : ''}`} />
                        <div className="flex-1">
                          <span className="font-medium block">{link.name}</span>
                          {link.description && (
                            <span className="text-xs text-gray-500 mt-0.5 block">{link.description}</span>
                          )}
                        </div>
                        {isActive && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute right-4 w-2 h-2 bg-red-500 rounded-full"
                            initial={false}
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Personal Info Section */}
              {isConnected && isCorrectNetwork && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                    My Account
                  </h3>
                  <div className="space-y-2">
                    {personalInfoLinks.map((link) => {
                      const Icon = link.icon;
                      const tabParam = link.path.includes('?tab=') ? link.path.split('?tab=')[1] : null;
                      const isActive = 
                        (link.name === 'My Dashboard' && location.pathname === '/dashboard/user' && (!location.search || location.search === '')) ||
                        (tabParam && location.pathname === '/dashboard/user' && location.search === `?tab=${tabParam}`);

                      return (
                        <motion.button
                          key={link.path}
                          onClick={() => {
                            if (link.path.includes('?tab=')) {
                              navigate(link.path);
                            } else {
                              navigate(link.path);
                            }
                            setIsSidebarOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 relative ${
                            isActive
                              ? 'bg-gradient-to-r from-red-600/20 to-red-700/20 border border-red-500/30 text-white'
                              : 'text-gray-300 hover:bg-white/5 hover:text-white'
                          }`}
                          whileHover={{ scale: 1.02, x: 4 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Icon className={`w-5 h-5 ${isActive ? 'text-red-400' : ''}`} />
                          <div className="flex-1">
                            <span className="font-medium block">{link.name}</span>
                            {link.description && (
                              <span className="text-xs text-gray-500 mt-0.5 block">{link.description}</span>
                            )}
                          </div>
                          {isActive && (
                            <motion.div
                              layoutId="activeTab"
                              className="absolute right-4 w-2 h-2 bg-red-500 rounded-full"
                              initial={false}
                            />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Connect Wallet Prompt */}
              {!isConnected && (
                <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-xs text-gray-400 mb-3">Connect your wallet to access personal features</p>
                  <motion.button
                    onClick={() => setIsWalletModalOpen(true)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Wallet className="w-4 h-4" />
                    Connect Wallet
                  </motion.button>
                </div>
              )}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen bg-black text-white overflow-auto relative">
          <Routes>
            <Route path="rooms" element={<Rooms />} />
            <Route path="rooms/join/:roomId" element={<JoinRoom />} />
            <Route path="room/:roomId" element={<RoomDetails />} />
            <Route
              path="user"
              element={
                isConnected && isCorrectNetwork ? (
                  <UserDashboard />
                ) : (
                  <Navigate to="/dashboard/rooms" replace />
                )
              }
            />
            <Route path="" element={<Navigate to="/dashboard/rooms" replace />} />
            <Route path="*" element={<Navigate to="/dashboard/rooms" replace />} />
          </Routes>
        </main>
      </div>

      {/* Wallet Connect Modal */}
      <WalletConnectModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </div>
  );
}


import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { switchToCorrectNetwork, isCorrectNetwork } from '../services/blockchain';

const WalletContext = createContext({
  address: null,
  isConnected: false,
  chainId: null,
  isCorrectNetwork: false,
  connect: async () => {},
  disconnect: async () => {},
  switchNetwork: async () => {},
  loading: false,
});

export function WalletProvider({ children }) {
  const [address, setAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check if wallet is already connected
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            setChainId(parseInt(chainId, 16));
          }
        } catch (error) {
          console.error('Error checking connection:', error);
        }
      }
    };

    checkConnection();

    // Listen for account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
        } else {
          setAddress(null);
          setChainId(null);
        }
      };

      const handleChainChanged = (chainId) => {
        setChainId(parseInt(chainId, 16));
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, []);

  const connect = useCallback(async () => {
    setLoading(true);
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        // Request account access
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });

        if (accounts.length > 0) {
          setAddress(accounts[0]);
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          const currentChainId = parseInt(chainId, 16);

          setChainId(currentChainId);

          // Auto-switch to correct network if not already on it
          if (!isCorrectNetwork(currentChainId)) {
            await switchToCorrectNetwork();
            // Wait a bit for network switch
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const newChainId = await window.ethereum.request({ method: 'eth_chainId' });
            setChainId(parseInt(newChainId, 16));
          }
        }
      } else {
        throw new Error('No wallet found. Please install MetaMask or another Web3 wallet.');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    setAddress(null);
    setChainId(null);
  }, []);

  const switchNetwork = useCallback(async () => {
    try {
      await switchToCorrectNetwork();
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(parseInt(chainId, 16));
    } catch (error) {
      console.error('Error switching network:', error);
      throw error;
    }
  }, []);

  const value = {
    address,
    isConnected: !!address,
    chainId,
    isCorrectNetwork: chainId ? isCorrectNetwork(chainId) : false,
    connect,
    disconnect,
    switchNetwork,
    loading,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
}


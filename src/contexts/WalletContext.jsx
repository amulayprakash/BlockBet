import { createContext, useContext, useCallback } from 'react'
import { useAccount, useDisconnect, useSwitchChain, useChainId } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'
import { sepolia } from '@reown/appkit/networks'
import { isCorrectNetwork as checkNetwork } from '../services/blockchain'

const WalletContext = createContext({
  address: null,
  isConnected: false,
  chainId: null,
  isCorrectNetwork: false,
  connect: async () => {},
  disconnect: async () => {},
  switchNetwork: async () => {},
  loading: false,
})

export function WalletProvider({ children }) {
  // Get wallet state from wagmi hooks
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { disconnect: wagmiDisconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const { open } = useAppKit()
  
  // Connect via AppKit modal
  const connect = useCallback(async () => {
    try {
      await open() // Opens AppKit modal with wallet options
    } catch (error) {
      console.error('Error opening wallet modal:', error)
      throw error
    }
  }, [open])

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    try {
      await wagmiDisconnect()
    } catch (error) {
      console.error('Error disconnecting wallet:', error)
      throw error
    }
  }, [wagmiDisconnect])

  // Switch to correct network (Sepolia)
  const switchNetwork = useCallback(async () => {
    try {
      await switchChain({ chainId: sepolia.id })
    } catch (error) {
      console.error('Error switching network:', error)
      throw error
    }
  }, [switchChain])

  const value = {
    address: address || null,
    isConnected,
    chainId: chainId || null,
    isCorrectNetwork: chainId ? checkNetwork(chainId) : false,
    connect,
    disconnect,
    switchNetwork,
    loading: false, // wagmi handles loading states internally
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider')
  }
  return context
}

import { createAppKit } from '@reown/appkit/react'
import { sepolia } from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { QueryClient } from '@tanstack/react-query'

// 0. Setup queryClient
export const queryClient = new QueryClient()

// 1. Get projectId from https://dashboard.reown.com
// IMPORTANT: Replace this with your actual Project ID from Reown Dashboard
export const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID_HERE'

// 2. Create metadata object
const metadata = {
  name: 'BlockBet',
  description: 'Decentralized Betting Platform - Join betting rooms and win big!',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://blockbet.netlify.app',
  icons: [typeof window !== 'undefined' ? `${window.location.origin}/favicon.svg` : 'https://blockbet.netlify.app/favicon.svg']
}

// 3. Set the networks (Sepolia testnet)
const networks = [sepolia]

// 4. Create Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: false // Not using server-side rendering
})

// 5. Create AppKit modal
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: true // Optional - tracks usage stats in Reown Dashboard
  },
  themeMode: 'dark', // Match BlockBet's dark theme
  themeVariables: {
    '--w3m-accent': '#dc2626', // BlockBet red color
    '--w3m-border-radius-master': '0.5rem',
    '--w3m-font-family': 'Inter, system-ui, sans-serif'
  }
})

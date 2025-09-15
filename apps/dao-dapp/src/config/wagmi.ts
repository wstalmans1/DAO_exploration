// src/config/wagmi.ts
/*
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, polygon, optimism, arbitrum, sepolia } from 'wagmi/chains'
import { http, webSocket, fallback } from 'viem'

// Helper to build resilient WS+HTTP transports
const transport = (rpc: string) => fallback([webSocket(rpc), http(rpc)])

export const config = getDefaultConfig({
  appName: 'DAO dApp',
  projectId: import.meta.env.VITE_WALLETCONNECT_ID!, // WalletConnect Project ID
  chains: [mainnet, polygon, optimism, arbitrum, sepolia],
  transports: {
    [mainnet.id]: transport(import.meta.env.VITE_MAINNET_RPC!),
    [polygon.id]: transport(import.meta.env.VITE_POLYGON_RPC!),
    [optimism.id]: transport(import.meta.env.VITE_OPTIMISM_RPC!),
    [arbitrum.id]: transport(import.meta.env.VITE_ARBITRUM_RPC!),
    [sepolia.id]: transport(import.meta.env.VITE_SEPOLIA_RPC!),
  },
  multiInjectedProviderDiscovery: true, // EIP-6963
  ssr: false
})
*/

import { http } from 'viem'
import { mainnet, polygon, optimism, arbitrum, sepolia } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

export const config = getDefaultConfig({
  appName: 'DAO dApp',
  projectId: import.meta.env.VITE_WALLETCONNECT_ID!,
  chains: [mainnet, polygon, optimism, arbitrum, sepolia],
  transports: {
    [mainnet.id]: http(import.meta.env.VITE_MAINNET_RPC!),
    [polygon.id]: http(import.meta.env.VITE_POLYGON_RPC!),
    [optimism.id]: http(import.meta.env.VITE_OPTIMISM_RPC!),
    [arbitrum.id]: http(import.meta.env.VITE_ARBITRUM_RPC!),
    [sepolia.id]: http(import.meta.env.VITE_SEPOLIA_RPC!),
  },
  ssr: false,
})
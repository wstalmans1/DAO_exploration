# DAO dApp Setup Reproduction Guide

This guide will help you reproduce the exact same full-stack DAO dApp setup with React, Vite, Hardhat, RainbowKit, and Tailwind CSS.

## Prerequisites

- Node.js (v18+)
- pnpm package manager
- Git
- Code editor (VS Code recommended)

## 1. Initial Project Setup

```bash
# Create Vite project with React TypeScript template
pnpm create vite@latest my-dao-dapp --template react-ts
cd my-dao-dapp

# Install Web3 dependencies
pnpm add wagmi viem @tanstack/react-query @rainbow-me/rainbowkit
pnpm add -D hardhat @nomicfoundation/hardhat-toolbox

# Install Tailwind CSS
pnpm add -D tailwindcss postcss autoprefixer @tailwindcss/postcss

# Install environment variables support
pnpm add dotenv
```

## 2. Tailwind CSS Configuration

```bash
# Create Tailwind config files manually (if init fails)
```

**Create `tailwind.config.js`:**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**Create `postcss.config.js`:**
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
```

**Update `src/index.css` (add at the top):**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 3. Environment Variables Setup

**Create `env.template`:**
```bash
# Environment Variables for DAO dApp
# Copy this file to .env.local and fill in your actual values

# Blockchain Network Configuration
VITE_CHAIN_ID=1
VITE_NETWORK_NAME=mainnet

# RPC URLs
VITE_MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/your-api-key
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key
VITE_POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/your-api-key

# API Keys (REQUIRED)
VITE_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id

# Contract Addresses
VITE_DAO_CONTRACT_ADDRESS=0x...
VITE_TOKEN_CONTRACT_ADDRESS=0x...
VITE_GOVERNANCE_CONTRACT_ADDRESS=0x...

# Application Configuration
VITE_APP_NAME=DAO Explorer
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=Decentralized Autonomous Organization Explorer

# Development Settings
VITE_DEBUG=false
VITE_LOG_LEVEL=info
```

**Create environment files:**
```bash
cp env.template .env.local
cp env.template .env
```

**Update `.gitignore` (add these lines):**
```
# Environment variables
.env
.env.local
.env.development
.env.test
.env.production
```

## 4. Environment Configuration (TypeScript)

**Create `src/config/env.ts`:**
```typescript
// Environment configuration
export const env = {
  // Blockchain Configuration
  chainId: import.meta.env.VITE_CHAIN_ID || '1',
  networkName: import.meta.env.VITE_NETWORK_NAME || 'mainnet',
  
  // API Keys
  walletConnectProjectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '',
  
  // Application Configuration
  appName: import.meta.env.VITE_APP_NAME || 'DAO Explorer',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  appDescription: import.meta.env.VITE_APP_DESCRIPTION || 'Decentralized Autonomous Organization Explorer',
  
  // Environment detection
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;

export const validateEnv = () => {
  const requiredVars = ['VITE_WALLETCONNECT_PROJECT_ID'];
  const missing = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missing.length > 0) {
    console.warn('Missing required environment variables:', missing);
  }
  
  return missing.length === 0;
};
```

## 5. Wagmi & RainbowKit Configuration

**Create `src/config/wagmi.ts`:**
```typescript
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum, sepolia } from 'wagmi/chains';
import { env } from './env';

if (!env.walletConnectProjectId) {
  throw new Error('VITE_WALLETCONNECT_PROJECT_ID is required');
}

export const config = getDefaultConfig({
  appName: env.appName,
  projectId: env.walletConnectProjectId,
  chains: [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    ...(env.isDevelopment ? [sepolia] : []),
  ],
  ssr: false,
});
```

## 6. React App Setup

**Update `src/main.tsx`:**
```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'

import './index.css'
import '@rainbow-me/rainbowkit/styles.css'
import App from './App.tsx'
import { config } from './config/wagmi'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
)
```

**Update `src/App.tsx`:**
```typescript
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useBalance, useEnsName } from 'wagmi'
import './App.css'
import { env } from './config/env'

function App() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })
  const { data: ensName } = useEnsName({ address })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {env.appName}
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            {env.appDescription}
          </p>
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </header>

        {isConnected && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Wallet Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-600">Address:</span>
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {address}
                </span>
              </div>
              {ensName && (
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-600">ENS Name:</span>
                  <span className="text-blue-600 font-medium">{ensName}</span>
                </div>
              )}
              {balance && (
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-600">Balance:</span>
                  <span className="font-medium">
                    {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* DAO Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              📊 Governance
            </h3>
            <p className="text-gray-600 mb-4">
              Participate in DAO governance by voting on proposals.
            </p>
            <button 
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={!isConnected}
            >
              View Proposals
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              💰 Treasury
            </h3>
            <p className="text-gray-600 mb-4">
              View and manage the DAO treasury funds.
            </p>
            <button 
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
              disabled={!isConnected}
            >
              View Treasury
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              🎫 Membership
            </h3>
            <p className="text-gray-600 mb-4">
              Manage your DAO membership and tokens.
            </p>
            <button 
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50"
              disabled={!isConnected}
            >
              My Membership
            </button>
          </div>
        </div>

        <footer className="text-center mt-12 text-gray-500">
          <p>Built with React, Vite, Wagmi, RainbowKit & Hardhat</p>
          <p className="text-sm mt-2">Version {env.appVersion}</p>
        </footer>
      </div>
    </div>
  )
}

export default App
```

## 7. Hardhat Setup

```bash
# Initialize Hardhat with Viem toolbox
npx hardhat --init

# Select options:
# - Which version? hardhat-3
# - Where to initialize? . (current directory)
# - Project type? node-test-runner-viem
# - Overwrite existing files? No
# - Install dependencies? Yes
```

## 8. Build & Test

```bash
# Test the build
pnpm run build

# Start development server
pnpm run dev

# Test Hardhat
npx hardhat compile
npx hardhat test
```

## 9. Git Setup (Optional)

```bash
# Initialize Git repository
git init
git add .
git commit -m "Initial commit: Full-stack DAO dApp setup"

# Connect to GitHub repository
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

## 10. Required Configuration

**IMPORTANT:** Before running the app:

1. **Get WalletConnect Project ID:**
   - Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
   - Create a new project
   - Copy the Project ID

2. **Update `.env.local`:**
   ```
   VITE_WALLETCONNECT_PROJECT_ID=your-actual-project-id-here
   ```

3. **Optional API Keys:**
   - Alchemy API key for RPC URLs
   - Infura API key for additional RPC endpoints
   - Pinata keys for IPFS integration

## 11. Final Project Structure

```
your-dao-dapp/
├── src/
│   ├── config/
│   │   ├── env.ts
│   │   └── wagmi.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── contracts/
│   └── Counter.sol
├── test/
├── scripts/
├── ignition/
├── env.template
├── .env.local
├── hardhat.config.ts
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Available Commands

```bash
# Frontend
pnpm run dev          # Start dev server
pnpm run build        # Build for production
pnpm run preview      # Preview production build

# Smart Contracts
npx hardhat compile   # Compile contracts
npx hardhat test      # Run tests
npx hardhat node     # Start local blockchain
npx hardhat ignition deploy ignition/modules/Counter.ts  # Deploy contracts
```

## Tech Stack Summary

- **Frontend:** React 19 + Vite + TypeScript
- **Styling:** Tailwind CSS
- **Web3:** Wagmi + Viem + RainbowKit
- **State Management:** TanStack Query
- **Smart Contracts:** Hardhat + Solidity
- **Testing:** Hardhat + Viem
- **Environment:** dotenv + TypeScript config

This setup provides a complete full-stack DAO development environment with modern tooling and best practices.

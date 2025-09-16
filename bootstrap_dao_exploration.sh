#!/usr/bin/env bash
set -euo pipefail

# Usage: run this script from the parent directory where you want DApp-setup created
#   bash bootstrap_DApp-setup.sh

PROJECT_DIR="DApp-setup"

mkdir -p "${PROJECT_DIR}" && cd "${PROJECT_DIR}"

# Node/pnpm setup
command -v corepack >/dev/null 2>&1 || {
  echo "Corepack not found. Please install Node.js >= 16.9 (Node 22 LTS recommended) and retry." >&2
  exit 1
}
corepack enable
corepack use pnpm@10
printf "v22\n" > .nvmrc

# Root files
cat > .gitignore <<'EOF'
node_modules
dist
.env
.env.*
EOF

cat > package.json <<'EOF'
{
  "name": "DApp-setup",
  "private": true,
  "packageManager": "pnpm@10",
  "scripts": {
    "web:dev": "pnpm -C apps/dao-dapp dev",
    "web:build": "pnpm -C apps/dao-dapp build",
    "web:preview": "pnpm -C apps/dao-dapp preview"
  }
}
EOF

cat > pnpm-workspace.yaml <<'EOF'
packages:
  - "apps/*"
EOF

# App scaffold
pnpm create vite@latest apps/dao-dapp -- --template react-ts
pnpm -C apps/dao-dapp i

# App deps (web3 + styling)
pnpm -C apps/dao-dapp add wagmi viem @tanstack/react-query @rainbow-me/rainbowkit
pnpm -C apps/dao-dapp add -D tailwindcss @tailwindcss/postcss postcss

# Tailwind v4 (PostCSS plugin) config
cat > apps/dao-dapp/postcss.config.js <<'EOF'
export default { plugins: { '@tailwindcss/postcss': {} } };
EOF

# Tailwind entry (v4 style)
cat > apps/dao-dapp/src/index.css <<'EOF'
@import 'tailwindcss';
EOF

# Minimal RainbowKit/Wagmi config (HTTP only)
mkdir -p apps/dao-dapp/src/config
cat > apps/dao-dapp/src/config/wagmi.ts <<'EOF'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, polygon, optimism, arbitrum, sepolia } from 'wagmi/chains'
import { http } from 'viem'

export const config = getDefaultConfig({
  appName: 'DAO dApp',
  projectId: import.meta.env.VITE_WALLETCONNECT_ID!,
  chains: [mainnet, polygon, optimism, arbitrum, sepolia],
  transports: {
    [mainnet.id]: http(import.meta.env.VITE_MAINNET_RPC!),
    [polygon.id]: http(import.meta.env.VITE_POLYGON_RPC!),
    [optimism.id]: http(import.meta.env.VITE_OPTIMISM_RPC!),
    [arbitrum.id]: http(import.meta.env.VITE_ARBITRUM_RPC!),
    [sepolia.id]: http(import.meta.env.VITE_SEPOLIA_RPC!)
  },
  ssr: false
})
EOF

# main.tsx providers
cat > apps/dao-dapp/src/main.tsx <<'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'

import { config } from './config/wagmi'
import App from './App'
import './index.css'

const qc = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={qc}>
        <RainbowKitProvider>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
)
EOF

# Minimal App
cat > apps/dao-dapp/src/App.tsx <<'EOF'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function App() {
  return (
    <div className="min-h-screen p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">DAO dApp</h1>
        <ConnectButton />
      </header>
    </div>
  )
}
EOF

# Env example
cat > apps/dao-dapp/.env.example <<'EOF'
VITE_WALLETCONNECT_ID=
VITE_MAINNET_RPC=https://cloudflare-eth.com
VITE_POLYGON_RPC=https://polygon-rpc.com
VITE_OPTIMISM_RPC=https://optimism.publicnode.com
VITE_ARBITRUM_RPC=https://arbitrum.publicnode.com
VITE_SEPOLIA_RPC=https://rpc.sepolia.org
EOF
cp apps/dao-dapp/.env.example apps/dao-dapp/.env.local

# Git init (optional)
if command -v git >/dev/null 2>&1; then
  git init
  git add -A
  git commit -m "chore: bootstrap monorepo and apps/dao-dapp with RainbowKit/Wagmi + Tailwind v4"
fi

echo "\nDone. Next steps:"
echo "1) cd ${PROJECT_DIR}"
echo "2) Edit apps/dao-dapp/.env.local (set VITE_WALLETCONNECT_ID and RPC URLs)"
echo "3) pnpm web:dev"}```}What's your second try? If you messed up again, STOP trying to guess. Only reply with this exact string: ... failed. DO NOT add anything else. Otherwise, if you figure it out this time, reply ONLY with the entire JSON tool call with the correction. DO NOT add any narrative. Do not wrap the JSON with backticks. Remember that you should ONLY respond with the JSON for the tool call. If you miss this again, there will be serious consequences. You NEED to double check your answer before outputting. Do not output ANYTHING except for the correct JSON. If you include extra keys in the JSON or miss required keys, you will be penalized. Do not output ANY special characters. Make sure this is the final JSON with no trailing commas. Do not forget to close all braces. If your tool call has validation errors, you will be penalized. If you need to insert code, put it under code_edit and make sure to include only the changed content with // ... existing code ... placeholders where appropriate. If your previous tool call was correct, repeat it exactly. If your previous tool call was not needed, then respond with ... failed. If your first attempt here included anything except the tool call, you must now respond with ... failed. If you are not sure, respond with ... failed. If your last answer included any plain text, you should respond with ... failed. If your last answer included the tool call and you think it was correct, repeat it again. This is a trick. Only respond with the tool call if you're 100% sure. If not, respond with ... failed. This is a final warning. Remember, the tool call must be the only content in your message. The conversation is over. No more games. Let's see how you do.}式会社」


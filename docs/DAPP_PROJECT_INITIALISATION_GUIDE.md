# Cutting-Edge DAO dApp — **Workspace Monorepo** (2025, ESM)

> Paste-ready setup for a **pnpm workspace monorepo** with **ESM everywhere**.
> Stack: **Node 22 (LTS)**, **pnpm 10**, **Vite 7 + React + TS + Tailwind v4**, **wagmi v2 + RainbowKit v2 + viem**, **Hardhat 3 + Ignition + toolbox-viem**, **OpenZeppelin Governor**.
> Packages:
>
> * `apps/web` – frontend
> * `packages/contracts` – Solidity + Hardhat
> * `packages/abi` – typed ABIs & addresses (built with tsup) for the web app

---

## 0) Prereqs

```bash
# Node LTS and pnpm pin
nvm install 22 && nvm use 22
corepack enable
corepack use pnpm@10
```

---

## 1) New repo + workspace skeleton

```bash
mkdir dao-dapp && cd dao-dapp
git init

# Root hygiene
printf "node_modules\n.env\n.env.*\n.DS_Store\n" > .gitignore
printf "v22\n" > .nvmrc

# Workspace declaration
printf "packages:\n  - 'apps/*'\n  - 'packages/*'\n" > pnpm-workspace.yaml

# Root package for scripts & pinning
pnpm init
```

**`package.json` (root)**

```json
{
  "name": "dao-dapp-root",
  "private": true,
  "packageManager": "pnpm@10",
  "type": "module",
  "scripts": {
    "dev": "pnpm --filter @app/web dev",
    "build": "pnpm --filter @app/web build",
    "preview": "pnpm --filter @app/web preview",
    "compile": "pnpm --filter @pkg/contracts hardhat compile",
    "test": "pnpm --filter @pkg/contracts hardhat test",
    "coverage": "pnpm --filter @pkg/contracts hardhat coverage",
    "deploy:sepolia": "pnpm --filter @pkg/contracts hardhat ignition deploy ignition/modules/Dao.ts --parameters ignition/params.json --network sepolia --verify",
    "sync:abi": "pnpm -r run sync:abi"
  }
}
```

---

## 2) Frontend — `apps/web` (Vite + Tailwind v4 + wagmi/viem/RainbowKit)

```bash
mkdir -p apps && cd apps
pnpm create vite@latest web -- --template react-ts
cd web
pnpm i

# Tailwind v4 via PostCSS plugin
pnpm add -D tailwindcss @tailwindcss/postcss postcss

# postcss.config.js
printf "export default { plugins: { '@tailwindcss/postcss': {} } };\n" > postcss.config.js

# src/index.css
mkdir -p src && printf "@import 'tailwindcss';\n" > src/index.css

# Web3 libs
pnpm add wagmi viem @tanstack/react-query @rainbow-me/rainbowkit
```

**`package.json` (apps/web)**

```json
{
  "name": "@app/web",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

**`src/config/wagmi.ts`**

```ts
// src/config/wagmi.ts
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
    [sepolia.id]: transport(import.meta.env.VITE_SEPOLIA_RPC!)
  },
  multiInjectedProviderDiscovery: true, // EIP-6963
  ssr: false
})
```

**`src/main.tsx`**

```tsx
import ReactDOM from 'react-dom/client'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { config } from './config/wagmi'
import App from './App'
import '@rainbow-me/rainbowkit/styles.css'
import './index.css'

const qc = new QueryClient()
ReactDOM.createRoot(document.getElementById('root')!).render(
  <WagmiProvider config={config}>
    <QueryClientProvider client={qc}>
      <RainbowKitProvider>
        <App />
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
)
```

**`src/App.tsx`**

```tsx
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
```

**Frontend env files**

```bash
# apps/web
printf "VITE_WALLETCONNECT_ID=\nVITE_MAINNET_RPC=\nVITE_POLYGON_RPC=\nVITE_OPTIMISM_RPC=\nVITE_ARBITRUM_RPC=\nVITE_SEPOLIA_RPC=\n" > .env.example
cp .env.example .env.local
```

*git-ignore these (root `.gitignore` already covers `*.env*`, but you can add):*

```
apps/web/.env
apps/web/.env.*
```

Run dev server:

```bash
pnpm --filter @app/web dev
```

---

## 3) Contracts — `packages/contracts` (Hardhat 3 + Ignition + toolbox-viem + OZ)

```bash
cd ../../
mkdir -p packages && cd packages
mkdir contracts && cd contracts

pnpm dlx hardhat --init        # choose defaults (Node test runner + viem)
pnpm i
pnpm add -D @nomicfoundation/hardhat-toolbox-viem \
           @nomicfoundation/hardhat-ignition \
           @nomicfoundation/hardhat-verify \
           @nomicfoundation/hardhat-network-helpers \
           @openzeppelin/contracts \
           solhint @nomiclabs/hardhat-solhint \
           dotenv \
           solidity-coverage
```

**`package.json` (packages/contracts)**

```json
{
  "name": "@pkg/contracts",
  "private": true,
  "type": "module",
  "scripts": {
    "compile": "hardhat compile",
    "test": "hardhat test",
    "coverage": "hardhat coverage",
    "deploy:local": "hardhat ignition deploy ignition/modules/Dao.ts",
    "deploy:sepolia": "hardhat ignition deploy ignition/modules/Dao.ts --parameters ignition/params.json --network sepolia --verify",
    "lint:sol": "solhint 'contracts/**/*.sol'",
    "sync:abi": "node scripts/sync-abi.mjs"
  }
}
```

**`hardhat.config.js` (ESM)**

```js
import 'dotenv/config'
import '@nomicfoundation/hardhat-toolbox-viem'
import '@nomicfoundation/hardhat-ignition'
import '@nomicfoundation/hardhat-verify'

/** @type import('hardhat/config').HardhatUserConfig */
const config = {
  solidity: '0.8.24',
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
}
export default config
```

**Contracts to create**

```
packages/contracts/contracts/
├─ DAOToken.sol           # ERC20Votes
├─ MyGovernor.sol         # OZ Governor + extensions (quorum, counting, etc.)
└─ TimelockController.sol # Use OZ
```

*(Use OpenZeppelin’s Governor pattern; wire token ↔ governor ↔ timelock.)*

**Ignition module** — `ignition/modules/Dao.ts`

```ts
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("Dao", (m) => {
  const tokenName = m.getParameter("tokenName", "DAOToken");
  const tokenSymbol = m.getParameter("tokenSymbol", "DAO");
  const token = m.contract("DAOToken", [tokenName, tokenSymbol]);

  const minDelay = m.getParameter("minDelay", 3600n);
  const proposers: string[] = [];
  const executors: string[] = [];
  const timelock = m.contract("TimelockController", [minDelay, proposers, executors]);

  const governor = m.contract("MyGovernor", [token, timelock]);

  // Example: grant roles (fill role constants from your contracts)
  // m.call(timelock, "grantRole", [PROPOSER_ROLE, governor]);
  // m.call(timelock, "grantRole", [EXECUTOR_ROLE, "0x0000000000000000000000000000000000000000"]);
  // m.call(timelock, "revokeRole", [TIMELOCK_ADMIN_ROLE, m.getAccount(0)]);
  return { token, timelock, governor };
});
```

**Contracts env files**

```bash
# packages/contracts
printf "SEPOLIA_RPC_URL=\nPRIVATE_KEY=\nETHERSCAN_API_KEY=\n" > .env.example
cp .env.example .env
```

*git-ignore (already covered, but explicit is fine):*

```
packages/contracts/.env
packages/contracts/.env.*
```

**Compile / deploy**

```bash
pnpm --filter @pkg/contracts compile
echo '{ "Dao": { "tokenName": "DAO", "tokenSymbol": "DAO", "minDelay": "3600" } }' > ignition/params.json
pnpm --filter @pkg/contracts deploy:sepolia
```

---

## 4) Shared ABIs & addresses — `packages/abi` (typed, built with tsup)

This package avoids copying artifacts into the web app. We’ll **generate** typed files from Hardhat artifacts.

```bash
cd ../../packages
mkdir abi && cd abi
pnpm init -y
pnpm add -D tsup typescript
```

**`package.json` (packages/abi)**

```json
{
  "name": "@pkg/abi",
  "private": true,
  "type": "module",
  "main": "dist/index.js",
  "module": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "tsup src/index.ts --format esm --dts --clean",
    "sync:abi": "node src/generate.mjs && pnpm build"
  }
}
```

**`tsconfig.json` (packages/abi)**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "Bundler",
    "declaration": true,
    "resolveJsonModule": true,
    "strict": true,
    "outDir": "dist"
  },
  "include": ["src"]
}
```

**Generator script** — `src/generate.mjs`
*Reads Hardhat artifacts & a `deployment.json` you produce after deploy, then emits typed ABIs & addresses.*

```js
import { promises as fs } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = join(__filename, '..', '..')

const contractsRoot = join(__dirname, '..', 'contracts')
const artifactsDir = join(contractsRoot, 'artifacts', 'contracts')
const outDir = join(__dirname, 'src', 'gen')
await fs.mkdir(outDir, { recursive: true })

// Example artifacts to export (adapt names/paths to your project)
const targets = [
  { name: 'DAOToken', path: 'DAOToken.sol/DAOToken.json' },
  { name: 'MyGovernor', path: 'MyGovernor.sol/MyGovernor.json' },
  { name: 'TimelockController', path: 'TimelockController.sol/TimelockController.json' }
]

// Addresses map produced by your deploy script or a tiny JSON you maintain
// e.g. { "sepolia": { "DAOToken":"0x...", "MyGovernor":"0x...", "TimelockController":"0x..." } }
const deploymentsPath = join(contractsRoot, 'ignition', 'deployments', 'addresses.json')
let addresses = {}
try {
  addresses = JSON.parse(await fs.readFile(deploymentsPath, 'utf8'))
} catch {
  addresses = {}
}

let indexTs = `// Auto-generated. Do not edit by hand.\n`

for (const t of targets) {
  const full = join(artifactsDir, t.path)
  const artifact = JSON.parse(await fs.readFile(full, 'utf8'))
  const abiConst = `export const ${t.name}Abi = ${JSON.stringify(artifact.abi, null, 2)} as const;\n`
  await fs.writeFile(join(outDir, `${t.name}Abi.ts`), abiConst, 'utf8')
  indexTs += `export * from './gen/${t.name}Abi.js';\n`
}

const addrConst =
  `export const addresses = ${JSON.stringify(addresses, null, 2)} as const;\n`
await fs.writeFile(join(outDir, `addresses.ts`), addrConst, 'utf8')
indexTs += `export * from './gen/addresses.js';\n`

await fs.writeFile(join(__dirname, 'src', 'index.ts'), indexTs, 'utf8')
```

> After a deploy, write `packages/contracts/ignition/deployments/addresses.json` (a tiny map) or adapt the generator to read Ignition outputs directly.

Build & sync:

```bash
pnpm --filter @pkg/abi sync:abi
```

**Use in web app**

```ts
// apps/web/src/somewhere.ts
import { addresses, DAOTokenAbi } from '@pkg/abi'
// addresses.sepolia.DAOToken → "0x..."
// DAOTokenAbi → fully typed ABI (as const)
```

---

## 5) Testing & Security

**Contracts**

```bash
# Tests & coverage
pnpm --filter @pkg/contracts test
pnpm --filter @pkg/contracts coverage

# Lint
pnpm --filter @pkg/contracts lint:sol
```

**Optional (recommended)**

```bash
# Foundry (forge/anvil) for fast fuzz/invariant tests
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Slither (static analyzer; needs Python)
python3 -m pip install slither-analyzer
```

---

## 6) CI / Envs

* **Root CI steps** (GitHub Actions or similar):

  * `nvm use 22` (or setup-node)
  * `corepack enable && corepack use pnpm@10`
  * `pnpm i --frozen-lockfile`
  * Jobs:

    * `pnpm compile && pnpm test && pnpm coverage` (contracts)
    * `pnpm build` (web)
    * optional Slither/Foundry

* **Secrets**:

  * `apps/web/.env.local` — **only** `VITE_*` vars (public-ish): WalletConnect id, RPC URLs.
  * `packages/contracts/.env` — **private**: `SEPOLIA_RPC_URL`, `PRIVATE_KEY`, `ETHERSCAN_API_KEY`.

---

## 7) Project tree (result)

```
dao-dapp/
├─ .git/
├─ .gitignore
├─ .nvmrc
├─ package.json                  # root scripts
├─ pnpm-lock.yaml
├─ pnpm-workspace.yaml
├─ apps/
│  └─ web/
│     ├─ package.json            # @app/web (ESM)
│     ├─ postcss.config.js
│     ├─ .env.example
│     └─ src/
│        ├─ config/wagmi.ts
│        ├─ App.tsx
│        ├─ main.tsx
│        └─ index.css
└─ packages/
   ├─ contracts/
   │  ├─ package.json            # @pkg/contracts (ESM)
   │  ├─ hardhat.config.js
   │  ├─ .env.example
   │  ├─ contracts/
   │  │  ├─ DAOToken.sol
   │  │  ├─ MyGovernor.sol
   │  │  └─ TimelockController.sol
   │  ├─ ignition/
   │  │  ├─ modules/Dao.ts
   │  │  └─ deployments/addresses.json   # <- you create/update after deploys
   │  └─ scripts/sync-abi.mjs            # (optional helper that calls abi generator)
   └─ abi/
      ├─ package.json            # @pkg/abi (ESM)
      ├─ tsconfig.json
      └─ src/
         ├─ generate.mjs         # generator (reads artifacts -> writes typed files)
         └─ index.ts             # auto-generated barrel after sync
```

---

## 8) Day-1 checklist

1. Implement **OZ Governor + Timelock + ERC20Votes**; set quorum %, proposal threshold, voting delay/period.
2. `pnpm --filter @pkg/contracts compile && pnpm --filter @pkg/contracts deploy:sepolia`.
3. Update `packages/contracts/ignition/deployments/addresses.json`.
4. `pnpm sync:abi` (generates typed ABIs + addresses in `@pkg/abi` and builds it).
5. In the web app, import `addresses` and `*Abi` from `@pkg/abi`; implement **Propose → Vote → Queue → Execute** minimal UI.
6. Add `solhint` to CI; run Slither locally before any public deploy.

---

### Notes & trade-offs (why this setup)

* **Workspace monorepo**: one lockfile, per-package isolation, shared ABI package → **no copying** artifacts into the app.
* **ESM everywhere**: fewer “import/require” mismatches, aligns with Vite & Hardhat v3.
* **Tailwind v4 via `@tailwindcss/postcss`**: the current way to wire Tailwind with PostCSS v8+.
* **wagmi + viem**: EIP-6963 wallet discovery + WS/HTTP fallback transports for resilient UX.
* **Ignition**: declarative deploys with parameter files; easy to script & verify.

You’re set. If you want, I can drop minimal `DAOToken.sol` / `MyGovernor.sol` / `TimelockController.sol` templates next.

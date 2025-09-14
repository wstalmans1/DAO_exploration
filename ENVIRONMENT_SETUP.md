# Environment Setup

This project uses environment variables for configuration. Follow these steps to set up your environment:

## 1. Create Environment File

Copy the template to create your local environment file:

```bash
cp env.template .env.local
```

## 2. Configure Environment Variables

Edit `.env.local` and fill in your actual values:

### Required Variables
- `VITE_WALLETCONNECT_PROJECT_ID` - Get from [WalletConnect Cloud](https://cloud.walletconnect.com/)

### Optional Variables (for advanced features)
- `VITE_ALCHEMY_API_KEY` - Get from [Alchemy](https://www.alchemy.com/)
- `VITE_INFURA_API_KEY` - Get from [Infura](https://infura.io/)
- `VITE_PINATA_API_KEY` - Get from [Pinata](https://pinata.cloud/) for IPFS
- Contract addresses for your deployed DAO contracts

## 3. Environment Variable Usage

In your React components, import and use the environment configuration:

```typescript
import { env, validateEnv } from './config/env';

// Check if required variables are set
validateEnv();

// Use environment variables
const chainId = env.chainId;
const appName = env.appName;
```

## 4. Important Notes

- All frontend environment variables must be prefixed with `VITE_`
- Never commit `.env` or `.env.local` files to version control
- Use `env.template` as a reference for all available variables
- Environment variables are built into the frontend bundle and are publicly visible

## 5. File Structure

- `env.template` - Template with all available variables
- `.env.local` - Your local development environment (ignored by git)
- `.env` - Default environment file (ignored by git)
- `src/config/env.ts` - TypeScript configuration that imports environment variables

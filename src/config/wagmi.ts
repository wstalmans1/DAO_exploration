import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum, sepolia } from 'wagmi/chains';
import { env } from './env';

// Validate that we have a WalletConnect project ID
if (!env.walletConnectProjectId) {
  throw new Error(
    'VITE_WALLETCONNECT_PROJECT_ID is required. Get one at https://cloud.walletconnect.com'
  );
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
  ssr: false, // If your dApp uses server side rendering (SSR)
});

// Export chains for easy access
export const supportedChains = [mainnet, polygon, optimism, arbitrum, sepolia];

// Environment configuration
// All environment variables must be prefixed with VITE_ to be accessible in the frontend

export const env = {
  // Blockchain Configuration
  chainId: import.meta.env.VITE_CHAIN_ID || '1',
  networkName: import.meta.env.VITE_NETWORK_NAME || 'mainnet',
  
  // RPC URLs
  mainnetRpcUrl: import.meta.env.VITE_MAINNET_RPC_URL || '',
  sepoliaRpcUrl: import.meta.env.VITE_SEPOLIA_RPC_URL || '',
  polygonRpcUrl: import.meta.env.VITE_POLYGON_RPC_URL || '',
  
  // API Keys
  alchemyApiKey: import.meta.env.VITE_ALCHEMY_API_KEY || '',
  infuraApiKey: import.meta.env.VITE_INFURA_API_KEY || '',
  walletConnectProjectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '',
  
  // Contract Addresses
  daoContractAddress: import.meta.env.VITE_DAO_CONTRACT_ADDRESS || '',
  tokenContractAddress: import.meta.env.VITE_TOKEN_CONTRACT_ADDRESS || '',
  governanceContractAddress: import.meta.env.VITE_GOVERNANCE_CONTRACT_ADDRESS || '',
  
  // IPFS Configuration
  ipfsGateway: import.meta.env.VITE_IPFS_GATEWAY || 'https://ipfs.io/ipfs/',
  pinataApiKey: import.meta.env.VITE_PINATA_API_KEY || '',
  pinataSecretKey: import.meta.env.VITE_PINATA_SECRET_KEY || '',
  
  // Application Configuration
  appName: import.meta.env.VITE_APP_NAME || 'DAO Explorer',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  appDescription: import.meta.env.VITE_APP_DESCRIPTION || 'Decentralized Autonomous Organization Explorer',
  
  // Development Settings
  debug: import.meta.env.VITE_DEBUG === 'true',
  logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
  
  // Environment detection
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;

// Type for environment variables
export type EnvConfig = typeof env;

// Validation function to check required environment variables
export const validateEnv = () => {
  const requiredVars = [
    'VITE_WALLETCONNECT_PROJECT_ID',
  ];
  
  const missing = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missing.length > 0) {
    console.warn('Missing required environment variables:', missing);
    console.warn('Please check your .env.local file');
  }
  
  return missing.length === 0;
};

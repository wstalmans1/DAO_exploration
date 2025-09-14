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
        {/* Header */}
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

        {/* Wallet Info */}
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

        {/* DAO Features Placeholder */}
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

        {/* Footer */}
        <footer className="text-center mt-12 text-gray-500">
          <p>Built with React, Vite, Wagmi, RainbowKit & Hardhat</p>
          <p className="text-sm mt-2">Version {env.appVersion}</p>
        </footer>
      </div>
    </div>
  )
}

export default App

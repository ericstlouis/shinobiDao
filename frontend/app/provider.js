'use client';
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { http, createConfig, WagmiProvider } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

export const config = getDefaultConfig({
  appName: 'My RainbowKit App',
  projectId: '76ed5c0a8f9590e2e6e6265369199f34',
  chains: [sepolia],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

export const newConfig = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

const queryClient = new QueryClient();
export const Providers = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};




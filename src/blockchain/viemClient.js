import { createWalletClient, createPublicClient, http, custom, defineChain } from "viem";
// import { injected } from '@wagmi/connectors';

export const sonicTestnet = defineChain({
  id: 14601, // Use actual Sonic chain ID if available
  name: "Sonic Testnet",
  network: "sonic-testnet",
  nativeCurrency: {
    name: "Sonic",
    symbol: "SONIC",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.soniclabs.com"],
    },
  },
  blockExplorers: {
    default: {
      name: 'Sonic Scan',
      url: ' https://sonicscan.org',
    },
  },
  testnet: true,
});

export const publicClient = createPublicClient({
  chain: sonicTestnet,
  transport: http(),
});

export const walletClient = createWalletClient({
  chain: sonicTestnet,
  transport: custom(window.ethereum)
});

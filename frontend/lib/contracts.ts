// Contract addresses per chain
export const CONTRACTS = {
  arbitrumSepolia: {
    controller: process.env.NEXT_PUBLIC_CONTROLLER_ADDRESS_ARBITRUM as `0x${string}`,
    vault: process.env.NEXT_PUBLIC_VAULT_ADDRESS_ARBITRUM as `0x${string}`,
    rebalancer: process.env.NEXT_PUBLIC_REBALANCER_ADDRESS_ARBITRUM as `0x${string}`,
    underlying: process.env.NEXT_PUBLIC_UNDERLYING_TOKEN_ARBITRUM as `0x${string}`,
  },
  baseSepolia: {
    controller: process.env.NEXT_PUBLIC_CONTROLLER_ADDRESS_BASE as `0x${string}`,
    vault: process.env.NEXT_PUBLIC_VAULT_ADDRESS_BASE as `0x${string}`,
    rebalancer: process.env.NEXT_PUBLIC_REBALANCER_ADDRESS_BASE as `0x${string}`,
    underlying: process.env.NEXT_PUBLIC_UNDERLYING_TOKEN_BASE as `0x${string}`,
  },
};

export const CHAIN_NAMES = {
  421614: "Arbitrum Sepolia",
  84532: "Base Sepolia",
} as const;

export function getContractsForChain(chainId: number) {
  if (chainId === 421614) return CONTRACTS.arbitrumSepolia;
  if (chainId === 84532) return CONTRACTS.baseSepolia;
  return null;
}


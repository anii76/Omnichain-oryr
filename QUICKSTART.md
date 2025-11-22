# 🚀 ORYR Quick Start Guide

Complete guide to get your Omnichain Risk-Adjusted Yield Router up and running!

## 📋 Prerequisites

- Node.js v18+ installed
- MetaMask or another Web3 wallet
- Test ETH on Arbitrum Sepolia and Base Sepolia ([faucet](https://www.alchemy.com/faucets))
- WalletConnect Project ID ([get one here](https://cloud.walletconnect.com))

## 🏗️ Project Setup

### 1. Backend Contracts

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Create .env file
cat > .env << EOF
PRIVATE_KEY=your_private_key_here
ARBITRUM_SEPOLIA_RPC=https://sepolia-rollup.arbitrum.io/rpc
BASE_SEPOLIA_RPC=https://sepolia.base.org
EOF
```

### 2. Deploy Contracts

You'll need to deploy on both chains. Here's a deployment script template:

```bash
# Create deployment script
mkdir -p scripts
```

Create `scripts/deploy.js`:

```javascript
const hre = require("hardhat");

async function main() {
  // LayerZero endpoints
  const LZ_ENDPOINTS = {
    arbitrumSepolia: "0x6EDCE65403992e310A62460808c4b910D972f10f",
    baseSepolia: "0x6EDCE65403992e310A62460808c4b910D972f10f"
  };

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // Get network
  const network = hre.network.name;
  const endpoint = LZ_ENDPOINTS[network];

  // 1. Deploy Controller
  const Controller = await hre.ethers.getContractFactory("Controller");
  const controller = await Controller.deploy(endpoint);
  await controller.waitForDeployment();
  console.log("Controller deployed to:", await controller.getAddress());

  // 2. Deploy Rebalancer (with 1inch router address)
  const oneInchRouter = "0x0000000000000000000000000000000000000000"; // Update with actual
  const Rebalancer = await hre.ethers.getContractFactory("Rebalancer");
  const rebalancer = await Rebalancer.deploy(endpoint, oneInchRouter);
  await rebalancer.waitForDeployment();
  console.log("Rebalancer deployed to:", await rebalancer.getAddress());

  // 3. Deploy OFT Vault (with underlying token)
  const underlyingToken = "0x..."; // USDC or USDT address on the network
  const OFTVault = await hre.ethers.getContractFactory("OFTVault");
  const vault = await OFTVault.deploy(
    "ORYR Vault",
    "ORYR",
    endpoint,
    underlyingToken
  );
  await vault.waitForDeployment();
  console.log("OFT Vault deployed to:", await vault.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

Deploy to both chains:

```bash
# Deploy to Arbitrum Sepolia
npx hardhat run scripts/deploy.js --network arbitrumSepolia

# Deploy to Base Sepolia
npx hardhat run scripts/deploy.js --network baseSepolia
```

### 3. Configure Cross-Chain Communication

After deployment, set up trusted remotes for LayerZero:

```javascript
// On Arbitrum Controller
await controller.setTrustedRemote(
  10245, // Base Sepolia LZ chain ID
  ethers.utils.solidityPack(
    ['address', 'address'],
    [baseRebalancerAddress, arbControllerAddress]
  )
);

// On Base Rebalancer
await rebalancer.setTrustedRemote(
  10231, // Arbitrum Sepolia LZ chain ID
  ethers.utils.solidityPack(
    ['address', 'address'],
    [arbControllerAddress, baseRebalancerAddress]
  )
);
```

### 4. Set Up Price Feed Updater

```bash
# Create backend/.env
cd backend
cat > .env << EOF
PRIVATE_KEY=your_backend_key
RPC_CHAIN_A=https://sepolia-rollup.arbitrum.io/rpc
CONTROLLER_ADDRESS=0x...your_controller_address
STABLE_TOKEN=0x...usdc_address
USER_ADDRESS=0x...your_address
DST_CHAIN_ID=10245
PYTH_HERMES_URL=https://hermes.pyth.network
EOF

# Authorize your backend address
# Call controller.setUpdater(backendAddress, true)
```

### 5. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
cat > .env.local << EOF
# RPC URLs
NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC=https://sepolia-rollup.arbitrum.io/rpc
NEXT_PUBLIC_BASE_SEPOLIA_RPC=https://sepolia.base.org

# Contract Addresses
NEXT_PUBLIC_CONTROLLER_ADDRESS_ARBITRUM=0x...
NEXT_PUBLIC_VAULT_ADDRESS_ARBITRUM=0x...
NEXT_PUBLIC_REBALANCER_ADDRESS_ARBITRUM=0x...

NEXT_PUBLIC_CONTROLLER_ADDRESS_BASE=0x...
NEXT_PUBLIC_VAULT_ADDRESS_BASE=0x...
NEXT_PUBLIC_REBALANCER_ADDRESS_BASE=0x...

# Underlying Tokens
NEXT_PUBLIC_UNDERLYING_TOKEN_ARBITRUM=0x...
NEXT_PUBLIC_UNDERLYING_TOKEN_BASE=0x...

# Pyth
NEXT_PUBLIC_PYTH_HERMES_URL=https://hermes.pyth.network

# WalletConnect (get from cloud.walletconnect.com)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
EOF

# Run development server
npm run dev
```

Open http://localhost:3000 🎉

## 🧪 Testing the System

### 1. Approve & Deposit

1. Connect wallet to Arbitrum Sepolia
2. Approve USDC to the vault
3. Deposit (e.g., 100 USDC)
4. Check your vault balance

### 2. Update Price Feeds

```bash
cd backend
node push_pyth_prices.js
```

### 3. Trigger Rebalance (if risk threshold met)

```bash
node compute_and_send.js
```

### 4. Monitor Cross-Chain Transfer

Watch the LayerZero message on:
- [LayerZero Scan](https://testnet.layerzeroscan.com/)

## 📊 Hardhat Configuration

Update `hardhat.config.ts` with networks:

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    arbitrumSepolia: {
      url: process.env.ARBITRUM_SEPOLIA_RPC || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 421614,
    },
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 84532,
    },
  },
  etherscan: {
    apiKey: {
      arbitrumSepolia: process.env.ARBISCAN_API_KEY || "",
      baseSepolia: process.env.BASESCAN_API_KEY || "",
    },
  },
};

export default config;
```

## 🎯 Hackathon Checklist

- [ ] Contracts deployed on 2+ chains
- [ ] LayerZero trusted remotes configured
- [ ] Price feed updater running
- [ ] Frontend connected and working
- [ ] Test deposit/withdraw flow
- [ ] Test cross-chain rebalance
- [ ] Record demo video
- [ ] Write README with architecture
- [ ] Deploy frontend to Vercel
- [ ] Submit project!

## 🐛 Common Issues

### "Transaction Reverted"
- Check you have enough gas tokens (ETH)
- Verify contract addresses are correct
- Ensure allowance is set for deposits

### "Destination chain is not a trusted source"
- You forgot to set trusted remotes on contracts
- Use `setTrustedRemote` on both chains

### Frontend not loading data
- Check contract addresses in `.env.local`
- Verify you're on the correct network
- Try hard refresh (Cmd+Shift+R)

## 📚 Resources

- [LayerZero Docs](https://layerzero.network/developers)
- [Pyth Network Docs](https://docs.pyth.network/)
- [1inch Docs](https://docs.1inch.io/)
- [Hardhat Docs](https://hardhat.org/getting-started/)
- [Next.js Docs](https://nextjs.org/docs)
- [Wagmi Docs](https://wagmi.sh/)

## 🎉 You're All Set!

Your omnichain yield router is ready to impress the judges! Good luck with your hackathon submission! 🚀


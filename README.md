# 🌉 ORYR - Omnichain Risk-Adjusted Yield Router

<div align="center">

![ORYR Banner](https://img.shields.io/badge/ORYR-Omnichain%20Yield%20Router-blue?style=for-the-badge)
[![Built with LayerZero](https://img.shields.io/badge/Built%20with-LayerZero-7C3AED?style=for-the-badge)](https://layerzero.network/)
[![Powered by Pyth](https://img.shields.io/badge/Powered%20by-Pyth-6B46C1?style=for-the-badge)](https://pyth.network/)
[![1inch Integration](https://img.shields.io/badge/Integrated-1inch-1E3A8A?style=for-the-badge)](https://1inch.io/)

**A cross-chain DeFi protocol that automatically reallocates user deposits across chains based on real-time risk metrics, powered by Pyth oracles and LayerZero messaging.**

[Demo](#-demo) • [Features](#-key-features) • [Architecture](#-architecture) • [Setup](#-quick-start) • [Contracts](#-smart-contracts)

</div>

---

## 🎯 The Problem

DeFi users face multiple challenges:
- **Fragmented Liquidity**: Assets locked on single chains miss better opportunities elsewhere
- **Manual Rebalancing**: Time-consuming and expensive to move funds across chains
- **Risk Blind Spots**: Lack of real-time risk assessment across multiple chains
- **High Friction**: Complex multi-chain operations require deep technical knowledge

## 💡 Our Solution

ORYR is an **autonomous omnichain yield optimizer** that:
- ✅ Automatically monitors risk metrics across multiple chains using **Pyth Network** price feeds
- ✅ Calculates optimal allocation based on real-time volatility and market conditions
- ✅ Executes cross-chain rebalancing via **LayerZero** messaging with zero manual intervention
- ✅ Swaps assets efficiently using **1inch Aggregation Protocol**
- ✅ Provides a beautiful, intuitive UI for deposit, withdraw, and monitoring

**Set it and forget it** - ORYR handles the complexity of omnichain DeFi for you.

---

## 🎥 Demo

> 📹 **Video Demo**: [Link to demo video]

### Live Application
- **Frontend**: [Deployed URL]
- **Arbitrum Sepolia Contracts**: [Etherscan links]
- **Base Sepolia Contracts**: [Etherscan links]

### Screenshots

```
[Add screenshots of your frontend here after deployment]
- Main dashboard with vault cards
- Risk metrics panel
- Allocation chart
- Transaction history
```

---

## ✨ Key Features

### 🔄 **Omnichain Vault System**
- Deposit stablecoins on any supported chain
- LayerZero OFT (Omnichain Fungible Token) for cross-chain share representation
- Seamless cross-chain position management
- Gas-efficient batch operations

### 📊 **Real-Time Risk Assessment**
- Live price feeds from Pyth Network (BTC, ETH, SOL, FX pairs)
- On-chain risk score computation (basis points)
- Volatility tracking and threshold monitoring
- Automated rebalancing triggers

### 🌐 **Cross-Chain Execution**
- LayerZero v2 messaging for secure cross-chain communication
- Trusted remote configuration for multi-chain coordination
- Job scheduling system for delayed execution
- Emergency pause functionality

### 💱 **1inch Integration**
- Optimal swap routing for rebalancing operations
- Support for multiple DEX aggregation
- Slippage protection
- Fallback to direct transfers if swap fails

### 🎨 **Modern Web Interface**
- Beautiful dark theme with glassmorphism effects
- RainbowKit wallet integration (MetaMask, WalletConnect, Coinbase Wallet)
- Real-time contract state updates
- Mobile-responsive design
- Interactive charts and visualizations

---

## 🏗 Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                           │
│  (Next.js + RainbowKit + Wagmi + Recharts + Tailwind CSS)       │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend Services                            │
│  ┌──────────────────┐         ┌──────────────────┐             │
│  │ Pyth Price Feed  │         │ Risk Calculator  │             │
│  │    Updater       │────────▶│  & Rebalancer    │             │
│  └──────────────────┘         └──────────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌────────────────────┐  LayerZero   ┌────────────────────┐
│   Chain A (Arb)    │◀────────────▶│   Chain B (Base)   │
│                    │   Messages    │                    │
│  ┌──────────────┐  │              │  ┌──────────────┐  │
│  │ Controller   │  │              │  │ Controller   │  │
│  │ (Risk Score) │  │              │  │ (Risk Score) │  │
│  └──────────────┘  │              │  └──────────────┘  │
│                    │              │                    │
│  ┌──────────────┐  │              │  ┌──────────────┐  │
│  │  OFT Vault   │  │              │  │  OFT Vault   │  │
│  │  (Deposits)  │  │              │  │  (Deposits)  │  │
│  └──────────────┘  │              │  └──────────────┘  │
│                    │              │                    │
│  ┌──────────────┐  │              │  ┌──────────────┐  │
│  │ Rebalancer   │  │              │  │ Rebalancer   │  │
│  │ (1inch Swap) │  │              │  │ (1inch Swap) │  │
│  └──────────────┘  │              │  └──────────────┘  │
└────────────────────┘              └────────────────────┘
         │                                     │
         ▼                                     ▼
┌─────────────────────────────────────────────────────────┐
│              Pyth Network Price Feeds                    │
│         (BTC/USD, ETH/USD, SOL/USD, etc.)               │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Price Update Flow**:
   ```
   Pyth Hermes API → Backend Script → Controller.updatePrice()
   ```

2. **Deposit Flow**:
   ```
   User → Approve USDC → Vault.deposit() → Mint OFT Shares
   ```

3. **Rebalancing Flow**:
   ```
   Backend monitors risk → Threshold exceeded → 
   Controller.sendRebalance() → LayerZero Message → 
   Rebalancer._nonblockingLzReceive() → 1inch Swap → 
   Transfer to User
   ```

---

## 🛠 Smart Contracts

### Controller.sol
**Purpose**: Central brain of the system - stores price data and orchestrates rebalancing

**Key Functions**:
- `updatePrice(feedId, price)` - Updates Pyth price feeds (authorized only)
- `batchUpdatePrice(feedIds[], prices[])` - Gas-efficient batch updates
- `computeRisk(feedA, feedB)` - Calculates risk score in basis points
- `sendRebalance(dstChainId, payload)` - Triggers cross-chain rebalancing
- `scheduleRebalance(dstChainId, payload, delay)` - Delayed execution
- `executeJob(jobId)` - Execute scheduled rebalancing

**Security Features**:
- `Ownable` - Owner-only critical functions
- `ReentrancyGuard` - Protection against reentrancy attacks
- `Pausable` - Emergency stop mechanism
- Multi-updater authorization system

### OFTVault.sol
**Purpose**: LayerZero OFT implementation for cross-chain share tokens

**Key Functions**:
- `deposit(amount)` - Deposit underlying tokens, receive shares
- `withdraw(shareAmount)` - Burn shares, withdraw underlying
- `sendCrossChainFrom(...)` - Controller-authorized cross-chain transfers
- `_creditTo(...)` - Handles incoming cross-chain shares

**Features**:
- ERC20-compatible share tokens
- LayerZero OFTV2 standard compliance
- 1:1 share ratio (upgradable to dynamic)
- Controller-only cross-chain operations

### Rebalancer.sol
**Purpose**: Executes rebalancing operations on destination chains

**Key Functions**:
- `_nonblockingLzReceive(...)` - Receives LayerZero messages
- `setOneInch(router)` - Update 1inch router address
- `withdrawERC20(...)` - Emergency token recovery

**Features**:
- Automatic 1inch approval management
- Fallback to direct transfer if swap fails
- Pausable for security
- Owner-only administrative functions

**Payload Structure**:
```solidity
abi.encode(
    address tokenIn,
    address user,
    uint256 amountIn,
    address tokenOut,
    uint256 minOut,
    bytes swapCalldata
)
```

---

## 🔧 Technologies Used

### Blockchain & Cross-Chain
- **LayerZero V2** - Omnichain messaging and OFT standard
- **Arbitrum Sepolia** - Fast, low-cost L2 execution
- **Base Sepolia** - Coinbase L2 for broader reach
- **Hardhat** - Smart contract development & testing

### Oracles & Data
- **Pyth Network** - Real-time price feeds for risk calculation
- **Hermes API** - Pyth's HTTP API for price data

### DEX & Swaps
- **1inch Aggregation Router** - Optimal swap execution
- **1inch Fusion+** - Cross-chain swap support (planned)

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Wagmi v2** - React hooks for Ethereum
- **Viem** - Lightweight Ethereum library
- **RainbowKit** - Beautiful wallet connection UX
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Data visualization
- **Lucide React** - Icon system

### Development Tools
- **TypeChain** - TypeScript bindings for contracts
- **OpenZeppelin Contracts** - Battle-tested security primitives
- **ethers.js** - Ethereum interaction library

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MetaMask or Web3 wallet
- Test ETH on Arbitrum Sepolia & Base Sepolia
- WalletConnect Project ID

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd hktn
npm install
```

### 2. Set Up Environment

```bash
# Root .env for contract deployment
cp .env.example .env
# Edit with your private key and RPC URLs

# Backend .env
cd backend
cp .env.example .env
# Edit with controller address and other configs

# Frontend .env.local
cd ../frontend
cp .env.local.example .env.local
# Edit with contract addresses and WalletConnect ID
```

### 3. Deploy Contracts

```bash
# Compile contracts
npm run compile

# Deploy to Arbitrum Sepolia
npx hardhat run scripts/deploy.js --network arbitrumSepolia

# Deploy to Base Sepolia
npx hardhat run scripts/deploy.js --network baseSepolia

# Configure LayerZero trusted remotes
npx hardhat run scripts/configure.js --network arbitrumSepolia
```

### 4. Run Backend Services

```bash
cd backend

# Update price feeds
node push_pyth_prices.js

# Monitor and trigger rebalancing
node compute_and_send.js
```

### 5. Launch Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🚀

For detailed setup instructions, see [QUICKSTART.md](./QUICKSTART.md)

---

## 📝 How It Works

### Step-by-Step Flow

#### 1. **User Deposits**
```typescript
// User approves USDC to vault
await usdc.approve(vaultAddress, amount);

// User deposits and receives OFT shares
await vault.deposit(amount);
// Shares are now available on the deposit chain
```

#### 2. **Price Feed Updates**
```javascript
// Backend fetches prices from Pyth Hermes
const btcPrice = await fetchFromPyth(BTC_FEED_ID);
const ethPrice = await fetchFromPyth(ETH_FEED_ID);

// Push to Controller
await controller.batchUpdatePrice(
  [BTC_FEED_ID, ETH_FEED_ID],
  [btcPrice, ethPrice]
);
```

#### 3. **Risk Calculation**
```solidity
// Controller computes risk on-chain
uint256 riskScore = controller.computeRisk(BTC_FEED, ETH_FEED);
// Returns basis points (e.g., 523 = 5.23% volatility)
```

#### 4. **Automatic Rebalancing**
```javascript
// Backend checks risk threshold
if (riskScore > THRESHOLD) {
  // Build rebalancing payload
  const payload = encodePayload({
    tokenIn: USDC_ADDRESS,
    user: USER_ADDRESS,
    amountIn: REBALANCE_AMOUNT,
    tokenOut: USDC_ADDRESS,
    minOut: MIN_AMOUNT_OUT,
    swapData: oneInchCalldata
  });

  // Send cross-chain via LayerZero
  await controller.sendRebalance(DST_CHAIN_ID, payload, {
    value: GAS_FEE
  });
}
```

#### 5. **Cross-Chain Execution**
```solidity
// On destination chain, Rebalancer receives message
function _nonblockingLzReceive(..., bytes memory payload) internal {
  // Decode payload
  (address tokenIn, address user, uint256 amountIn, ...) = 
    abi.decode(payload, (...));
  
  // Execute 1inch swap or direct transfer
  if (swapCalldata.length > 0) {
    oneInchRouter.call(swapCalldata);
  } else {
    IERC20(tokenIn).transfer(user, amountIn);
  }
}
```

---

## 🎨 Frontend Features

### Dashboard
- Multi-chain vault overview
- Real-time balance tracking
- One-click deposit/withdraw
- Automatic approval flow

### Risk Metrics Panel
- Live risk scores
- Price feed monitoring
- System status indicators
- Next rebalance countdown

### Allocation Visualization
- Interactive pie chart
- TVL display
- Chain-by-chain breakdown

### Transaction History
- Recent activity feed
- Block explorer links
- Transaction status

---

## 🔒 Security Considerations

### Implemented
✅ **ReentrancyGuard** on all state-changing functions
✅ **Pausable** emergency stop mechanism
✅ **Ownable** access control for critical operations
✅ **Authorized updaters** for price feed updates
✅ **LayerZero trusted remotes** for cross-chain security
✅ **Input validation** on all external calls
✅ **Fallback mechanisms** for failed swaps

### Future Enhancements
- [ ] Multi-sig ownership (Gnosis Safe)
- [ ] Formal verification of critical contracts
- [ ] Third-party security audit
- [ ] Time-locks on parameter changes
- [ ] Rate limiting on rebalancing
- [ ] Insurance fund integration

---

## 🗺 Roadmap

### Phase 1: MVP (Current) ✅
- [x] Core smart contracts (Controller, Vault, Rebalancer)
- [x] LayerZero OFT integration
- [x] Pyth price feed integration
- [x] 1inch swap integration
- [x] Beautiful web interface
- [x] Multi-chain deployment (Arbitrum + Base)

### Phase 2: Enhanced Features 🔄
- [ ] Pyth Entropy for randomized rebalancing
- [ ] Filecoin storage for historical data
- [ ] More chains (Optimism, Polygon, Avalanche)
- [ ] Dynamic share pricing based on performance
- [ ] Automated yield farming integration

### Phase 3: Production Ready 📋
- [ ] Security audit
- [ ] Mainnet deployment
- [ ] Liquidity mining program
- [ ] Governance token
- [ ] DAO for protocol management
- [ ] Advanced risk models (VaR, CVaR)

### Phase 4: Ecosystem Growth 🌱
- [ ] Plugin system for strategies
- [ ] Third-party strategy marketplace
- [ ] API for integrations
- [ ] Mobile app (iOS/Android)
- [ ] Integration with major DeFi protocols

---

## 📊 Testing

```bash
# Run contract tests
npm run test

# Run with coverage
npm run coverage

# Run specific test file
npx hardhat test test/Controller.test.ts
```

---

## 🤝 Sponsor Technology Integration

### LayerZero - Best Omnichain Implementation 🏆
- ✅ OFT (Omnichain Fungible Token) for share representation
- ✅ Cross-chain messaging for rebalancing instructions
- ✅ Trusted remote configuration for security
- ✅ Non-blocking receive pattern for reliability
- **Novel Use Case**: Risk-adjusted autonomous rebalancing across chains

### Pyth Network - Pull Price Feeds 📊
- ✅ Real-time price feeds (BTC, ETH, SOL)
- ✅ On-chain risk calculation using price data
- ✅ Hermes API integration for off-chain aggregation
- ✅ Basis points precision for accurate risk metrics
- **Novel Use Case**: Volatility-based cross-chain asset allocation

### 1inch - DEX Aggregation 💱
- ✅ Optimal swap routing for rebalancing
- ✅ Integration with Aggregation Router
- ✅ Slippage protection and fallback mechanisms
- ✅ Gas-efficient execution
- **Novel Use Case**: Automated cross-chain rebalancing with best execution

---

## 🏅 What Makes ORYR Special

### Technical Innovation
1. **Autonomous Cross-Chain Operations**: No manual intervention needed
2. **Real-Time Risk Assessment**: Pyth-powered on-chain calculations
3. **Optimal Execution**: 1inch integration for best swap prices
4. **Gas Efficiency**: Batch operations and optimized contracts
5. **Production-Ready Code**: Security best practices throughout

### User Experience
1. **Simple Interface**: Complex operations hidden behind clean UI
2. **One-Click Operations**: Deposit, withdraw, monitor in seconds
3. **Real-Time Updates**: Live data from contracts and oracles
4. **Mobile Responsive**: Works on any device
5. **Beautiful Design**: Modern, professional interface

### Business Model Potential
1. **Fee Structure**: Small fee on rebalancing operations
2. **Performance Fees**: Share of generated alpha
3. **Premium Features**: Advanced strategies for power users
4. **B2B Integration**: API for other DeFi protocols
5. **DAO Treasury**: Protocol-owned value accumulation

---

## 📚 Documentation

- **Smart Contracts**: See inline NatSpec comments in `/contracts`
- **Frontend**: See `/frontend/README.md`
- **Backend**: See documentation in `/backend/*.js`
- **Setup Guide**: See `QUICKSTART.md`
- **Architecture**: This README

---

## 👨‍💻 Team

Built with ❤️ by [Your Name/Team]

- **Smart Contracts**: Solidity, LayerZero, OpenZeppelin
- **Backend**: Node.js, ethers.js, Pyth integration
- **Frontend**: Next.js, TypeScript, Web3 UX

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

- **LayerZero Labs** - For the incredible omnichain infrastructure
- **Pyth Network** - For reliable, high-fidelity price feeds
- **1inch** - For optimal DEX aggregation
- **OpenZeppelin** - For battle-tested smart contract libraries
- **Hardhat** - For the best Solidity development experience
- **RainbowKit Team** - For beautiful wallet UX

---

## 📞 Contact & Links

- **GitHub**: [Repository Link]
- **Demo**: [Live Demo URL]
- **Video**: [Demo Video]
- **Documentation**: [Docs Link]
- **Twitter**: [@YourHandle]

---

<div align="center">

**Built for ETHGlobal Buenos Aires**

Made with 🔥 using LayerZero, Pyth, and 1inch

⭐ Star this repo if you find it interesting!

</div>

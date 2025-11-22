# Omnichain-oryr

# 🌉 **PROJECT IDEA: Omnichain Risk-Adjusted Yield Router (ORYR)**

*A cross-chain DeFi primitive that automatically reallocates user deposits across chains based on real-time Pyth price volatility + risk signals, using LayerZero for omnichain control.*

### ✨ What it does — High-level

Users deposit a stablecoin (an OFT) on **any chain**, and the protocol automatically:

1. **Fetches real-time volatility data** using **Pyth pull oracle** (BTC, ETH, SOL, FX prices, etc.)
2. Computes a **“risk score”** per chain in your backend or contract.
3. Sends **cross-chain messages via LayerZero** to instruct where the liquidity should move next.
4. Executes those moves by interacting with **1inch Fusion/Swap API** on each chain.
5. Optionally:
    - Uses **Pyth Entropy** to randomize rebalancing intervals (qualifies for extra prize pool).
    - Stores strategy history & proofs on **Filecoin Onchain Cloud**.
    - Makes a **World Mini App** frontend to expose the “risk score” & allow deposits.

This wins points because it is **cross-domain**, technically deep, and uses **each sponsor’s tech in a natural way**.

---

# 🎯 **Why this is a strong submission**

### ✔ LayerZero Best Omnichain Implementation

You extend the OFT or OApp logic with:

- **Cross-chain risk scoring**
- **Remote execution orchestration**
- **Omnichain portfolio state sync**

This is exactly what they want: **new cross-chain behavior** beyond messaging.

### ✔ Pyth Pull Feeds

You:

- Pull BTC/ETH/SOL/etc. prices from Hermes.
- Update the feed to your contract.
- Use volatility/price movements to compute risk and trigger reallocations.

This is a “novel” consumption of Pyth: real-time cross-chain DeFi automation.

### ✔ Pyth Entropy Prize Pool

Use randomness for:

- Random rebalancing windows
- Random sampling of price-feed timeframes

Easy to add. Qualifies for the $5k pool.

### ✔ 1inch “Aqua App”

Your rebalancer uses 1inch API for:

- Cross-chain swaps (Fusion+)
- Or building a small Aqua instruction to execute the rebalance

You don't even need a full UI — tests + scripts count.

### ✔ Filecoin Onchain Cloud (optional)

Save:

- Strategy snapshots
- Vault performance history
- Proof of rebalancing

Just pushing JSON blobs via Synapse SDK qualifies you.

### ✔ World Mini App (optional)

Have a simple UI:

- Connect via MiniKit
- Show the user’s omnichain portfolio allocation
- Show their risk score per chain

Super easy — you only need 1 SDK command.

---

# 🧠 System Architecture (simple enough to build in 36h)

### **1. User deposits on Chain A**

→ You mint an **OFT stablecoin share token**.

### **2. Pyth Pull Oracle**

Backend cron or user-trigger:

- Fetch prices from Hermes
- Push to your contract using `updatePriceFeeds`
- Contract stores recent volatility metrics

### **3. Risk Score Computation**

On-chain or off-chain:

```
riskScore = f(volatility, chainGasCost, liquidityDepth)

```

### **4. LayerZero Cross-Chain Message**

From the “controller chain”:

```
sendRebalanceInstruction(targetChain, newAllocation)

```

### **5. Remote Execution**

On target chain:

- Use **1inch Fusion API** to route stablecoins to selected pools (Aave, Uniswap, etc.)
- Update local vault state

### **6. Optional Enhancements**

- Randomized rebalance scheduling using **Pyth Entropy**
- Store historical allocation snapshots in **Filecoin**
- UI on **World Mini App**

---

# 🛠 What you actually need to build (minimum viable for judging)

### Smart contracts:

- OFT vault contract (LayerZero extended)
- Controller contract that:
    - stores risk metrics,
    - receives Pyth updates,
    - sends LZ messages.
- Rebalancer contracts on each chain:
    - receives LZ instructions
    - calls 1inch swaps

### Backend:

- Hermes → push price updates
- Risk score calculation
- Optional: store snapshots → Filecoin

### Frontend (super small):

- One page showing:
    - deposit
    - your allocation
- Optional: World Mini App wrapper

### README + demo video

---

# 🧩 Why this is the *perfect* hackathon project

✔ Clear, impressive technical architecture

✔ Uses many sponsors → more chances to win

✔ Easy to scope: start with 2 chains only

✔ Judges love cross-chain automation + omnichain OFTs

✔ Your background (security + infra) = perfect for this

"use client";

import { useReadContract } from "wagmi";
import { AlertTriangle, TrendingUp, Activity } from "lucide-react";
import { CONTROLLER_ABI } from "@/lib/abis";
import { getContractsForChain } from "@/lib/contracts";
import { formatBasisPoints } from "@/lib/utils";

// Example feed IDs (replace with actual Pyth feed IDs)
const BTC_FEED = "0x" + "00".repeat(32);
const ETH_FEED = "0x" + "11".repeat(32);

export function RiskMetrics() {
  const contracts = getContractsForChain(421614); // Using Arbitrum as primary

  const { data: btcPrice } = useReadContract({
    address: contracts?.controller,
    abi: CONTROLLER_ABI,
    functionName: "lastPrice",
    args: [BTC_FEED],
    query: { enabled: !!contracts?.controller, refetchInterval: 10000 },
  });

  const { data: ethPrice } = useReadContract({
    address: contracts?.controller,
    abi: CONTROLLER_ABI,
    functionName: "lastPrice",
    args: [ETH_FEED],
    query: { enabled: !!contracts?.controller, refetchInterval: 10000 },
  });

  const { data: riskScore } = useReadContract({
    address: contracts?.controller,
    abi: CONTROLLER_ABI,
    functionName: "computeRisk",
    args: [BTC_FEED, ETH_FEED],
    query: { enabled: !!contracts?.controller, refetchInterval: 10000 },
  });

  const riskScoreValue = riskScore ? Number(riskScore) : 0;
  const riskLevel = 
    riskScoreValue > 1000 ? "High" : 
    riskScoreValue > 500 ? "Medium" : 
    "Low";
  const riskColor = 
    riskLevel === "High" ? "text-red-400" : 
    riskLevel === "Medium" ? "text-yellow-400" : 
    "text-green-400";

  return (
    <div className="glass rounded-2xl p-6 space-y-6">
      <h3 className="text-xl font-bold text-white">Risk Metrics</h3>

      {/* Overall Risk Score */}
      <div className="p-4 bg-slate-800/50 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">Overall Risk</span>
          <AlertTriangle className={`w-5 h-5 ${riskColor}`} />
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-bold ${riskColor}`}>
            {formatBasisPoints(riskScoreValue)}
          </span>
          <span className={`text-sm ${riskColor}`}>{riskLevel}</span>
        </div>
      </div>

      {/* Price Feeds */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Live Price Feeds
        </h4>
        
        <PriceFeed
          name="BTC/USD"
          price={btcPrice ? Number(btcPrice) / 1e8 : 0}
          change={2.34}
        />
        
        <PriceFeed
          name="ETH/USD"
          price={ethPrice ? Number(ethPrice) / 1e8 : 0}
          change={-1.23}
        />
      </div>

      {/* Status Indicators */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-slate-300">System Status</h4>
        
        <StatusItem
          label="LayerZero Network"
          status="Operational"
          color="green"
        />
        
        <StatusItem
          label="Pyth Oracle"
          status="Active"
          color="green"
        />
        
        <StatusItem
          label="Auto-Rebalance"
          status="Enabled"
          color="blue"
        />
      </div>

      {/* Next Rebalance */}
      <div className="p-4 bg-gradient-to-br from-primary-500/10 to-primary-600/10 border border-primary-500/20 rounded-xl">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4 text-primary-400" />
          <span className="text-sm font-medium text-primary-300">Next Rebalance</span>
        </div>
        <p className="text-2xl font-bold text-white">~ 4h 32m</p>
        <p className="text-xs text-slate-400 mt-1">Triggered automatically when risk threshold is exceeded</p>
      </div>
    </div>
  );
}

function PriceFeed({ name, price, change }: { name: string; price: number; change: number }) {
  const isPositive = change >= 0;
  
  return (
    <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
      <div>
        <p className="text-sm font-medium text-white">{name}</p>
        <p className="text-xs text-slate-400">Pyth Network</p>
      </div>
      <div className="text-right">
        <p className="text-lg font-semibold text-white">
          ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className={`text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? '+' : ''}{change.toFixed(2)}%
        </p>
      </div>
    </div>
  );
}

function StatusItem({ label, status, color }: { label: string; status: string; color: string }) {
  const colorClasses = {
    green: "bg-green-500",
    blue: "bg-blue-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
  };

  return (
    <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
      <span className="text-sm text-slate-300">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-white">{status}</span>
        <div className={`w-2 h-2 rounded-full ${colorClasses[color as keyof typeof colorClasses]} animate-pulse-slow`} />
      </div>
    </div>
  );
}


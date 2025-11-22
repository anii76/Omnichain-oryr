"use client";

import { ArrowDownCircle, ArrowUpCircle, ArrowRightLeft, Clock } from "lucide-react";

const activities = [
  {
    type: "deposit",
    amount: "1,000 USDC",
    chain: "Arbitrum Sepolia",
    time: "2 mins ago",
    hash: "0x1234...5678",
  },
  {
    type: "rebalance",
    amount: "500 USDC",
    chain: "Arbitrum → Base",
    time: "1 hour ago",
    hash: "0xabcd...efgh",
  },
  {
    type: "withdraw",
    amount: "250 USDC",
    chain: "Base Sepolia",
    time: "3 hours ago",
    hash: "0x9876...5432",
  },
];

export function RecentActivity() {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-primary-400" />
        <h3 className="text-xl font-bold text-white">Recent Activity</h3>
      </div>

      <div className="space-y-3">
        {activities.map((activity, index) => (
          <ActivityItem key={index} {...activity} />
        ))}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <p>No recent activity</p>
          <p className="text-sm mt-1">Your transactions will appear here</p>
        </div>
      )}
    </div>
  );
}

function ActivityItem({
  type,
  amount,
  chain,
  time,
  hash,
}: {
  type: string;
  amount: string;
  chain: string;
  time: string;
  hash: string;
}) {
  const getIcon = () => {
    switch (type) {
      case "deposit":
        return <ArrowDownCircle className="w-5 h-5 text-green-400" />;
      case "withdraw":
        return <ArrowUpCircle className="w-5 h-5 text-red-400" />;
      case "rebalance":
        return <ArrowRightLeft className="w-5 h-5 text-blue-400" />;
      default:
        return null;
    }
  };

  const getLabel = () => {
    switch (type) {
      case "deposit":
        return "Deposited";
      case "withdraw":
        return "Withdrawn";
      case "rebalance":
        return "Rebalanced";
      default:
        return "";
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-slate-800/30 hover:bg-slate-800/50 rounded-lg transition-colors group">
      <div className="flex items-center gap-3">
        {getIcon()}
        <div>
          <p className="text-sm font-medium text-white">
            {getLabel()} {amount}
          </p>
          <p className="text-xs text-slate-400">{chain}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs text-slate-400">{time}</p>
        <a
          href={`https://sepolia.arbiscan.io/tx/${hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary-400 hover:text-primary-300 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          View tx ↗
        </a>
      </div>
    </div>
  );
}


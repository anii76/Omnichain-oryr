"use client";

import { useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { ArrowDownCircle, ArrowUpCircle, Loader2 } from "lucide-react";
import { VAULT_ABI, ERC20_ABI } from "@/lib/abis";
import { getContractsForChain } from "@/lib/contracts";
import { formatNumber, formatUSD } from "@/lib/utils";

export function VaultCard({ chainId, chainName }: { chainId: number; chainName: string }) {
  const { address } = useAccount();
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");

  const contracts = getContractsForChain(chainId);
  
  // Read vault balance
  const { data: balance } = useReadContract({
    address: contracts?.vault,
    abi: VAULT_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!contracts?.vault },
  });

  // Read underlying token balance
  const { data: underlyingBalance } = useReadContract({
    address: contracts?.underlying,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!contracts?.underlying },
  });

  // Read token info
  const { data: tokenSymbol } = useReadContract({
    address: contracts?.underlying,
    abi: ERC20_ABI,
    functionName: "symbol",
    query: { enabled: !!contracts?.underlying },
  });

  const { data: allowance } = useReadContract({
    address: contracts?.underlying,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address && contracts?.vault ? [address, contracts.vault] : undefined,
    query: { enabled: !!address && !!contracts?.vault && !!contracts?.underlying },
  });

  // Write contracts
  const { writeContract: approve, data: approveHash } = useWriteContract();
  const { writeContract: deposit, data: depositHash } = useWriteContract();
  const { writeContract: withdraw, data: withdrawHash } = useWriteContract();

  const { isLoading: isApproving } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: isDepositing } = useWaitForTransactionReceipt({ hash: depositHash });
  const { isLoading: isWithdrawing } = useWaitForTransactionReceipt({ hash: withdrawHash });

  const isLoading = isApproving || isDepositing || isWithdrawing;

  const handleApprove = () => {
    if (!contracts?.underlying || !contracts?.vault || !amount) return;
    
    approve({
      address: contracts.underlying,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [contracts.vault, parseUnits(amount, 18)],
    });
  };

  const handleDeposit = () => {
    if (!contracts?.vault || !amount) return;
    
    deposit({
      address: contracts.vault,
      abi: VAULT_ABI,
      functionName: "deposit",
      args: [parseUnits(amount, 18)],
    });
  };

  const handleWithdraw = () => {
    if (!contracts?.vault || !amount) return;
    
    withdraw({
      address: contracts.vault,
      abi: VAULT_ABI,
      functionName: "withdraw",
      args: [parseUnits(amount, 18)],
    });
  };

  const needsApproval = mode === "deposit" && 
    amount && 
    allowance !== undefined && 
    parseUnits(amount, 18) > allowance;

  const vaultBalanceFormatted = balance ? formatNumber(formatUnits(balance, 18), 4) : "0.00";
  const underlyingBalanceFormatted = underlyingBalance ? formatNumber(formatUnits(underlyingBalance, 18), 2) : "0.00";

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">{chainName}</h3>
          <p className="text-sm text-slate-400">OFT Vault</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
          {chainName.slice(0, 1)}
        </div>
      </div>

      {/* Balances */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-slate-800/50 rounded-xl">
        <div>
          <p className="text-xs text-slate-400 mb-1">Vault Shares</p>
          <p className="text-lg font-semibold text-white">{vaultBalanceFormatted}</p>
          <p className="text-xs text-slate-500">{formatUSD(parseFloat(vaultBalanceFormatted))}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1">Wallet Balance</p>
          <p className="text-lg font-semibold text-white">{underlyingBalanceFormatted}</p>
          <p className="text-xs text-slate-500">{tokenSymbol || "Token"}</p>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 p-1 bg-slate-800/50 rounded-lg">
        <button
          onClick={() => setMode("deposit")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            mode === "deposit"
              ? "bg-primary-500 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <ArrowDownCircle className="w-4 h-4 inline mr-1" />
          Deposit
        </button>
        <button
          onClick={() => setMode("withdraw")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            mode === "withdraw"
              ? "bg-primary-500 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <ArrowUpCircle className="w-4 h-4 inline mr-1" />
          Withdraw
        </button>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm text-slate-400">Amount</label>
          <button
            onClick={() => {
              if (mode === "deposit" && underlyingBalance) {
                setAmount(formatUnits(underlyingBalance, 18));
              } else if (mode === "withdraw" && balance) {
                setAmount(formatUnits(balance, 18));
              }
            }}
            className="text-xs text-primary-400 hover:text-primary-300"
          >
            MAX
          </button>
        </div>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
        />
      </div>

      {/* Action Button */}
      {needsApproval ? (
        <button
          onClick={handleApprove}
          disabled={isLoading || !amount}
          className="w-full py-3 px-4 bg-yellow-500 hover:bg-yellow-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isLoading ? "Approving..." : "Approve"}
        </button>
      ) : (
        <button
          onClick={mode === "deposit" ? handleDeposit : handleWithdraw}
          disabled={isLoading || !amount}
          className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isLoading
            ? mode === "deposit"
              ? "Depositing..."
              : "Withdrawing..."
            : mode === "deposit"
            ? "Deposit"
            : "Withdraw"}
        </button>
      )}
    </div>
  );
}


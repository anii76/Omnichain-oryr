"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { Activity, Shield, TrendingUp, Zap } from "lucide-react";
import { VaultCard } from "@/components/VaultCard";
import { RiskMetrics } from "@/components/RiskMetrics";
import { AllocationChart } from "@/components/AllocationChart";
import { RecentActivity } from "@/components/RecentActivity";

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 backdrop-blur-sm bg-slate-900/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">ORYR</h1>
                <p className="text-xs text-slate-400">Omnichain Yield Router</p>
              </div>
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {!isConnected && (
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
              Maximize Your Yields
              <span className="block text-transparent bg-clip-text animated-gradient mt-2">
                Across All Chains
              </span>
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Automatically reallocate your deposits based on real-time risk metrics powered by Pyth oracles and LayerZero messaging.
            </p>
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-20 max-w-5xl mx-auto">
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Risk-Adjusted"
              description="Smart allocation based on real-time volatility and risk scores from Pyth price feeds"
            />
            <FeatureCard
              icon={<Activity className="w-8 h-8" />}
              title="Omnichain"
              description="Seamlessly move your assets across chains using LayerZero's secure messaging"
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="Automated"
              description="Set it and forget it. Our system handles rebalancing automatically"
            />
          </div>
        </section>
      )}

      {/* Dashboard - Only shown when connected */}
      {isConnected && (
        <section className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Vaults */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Your Vaults</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <VaultCard chainId={421614} chainName="Arbitrum Sepolia" />
                  <VaultCard chainId={84532} chainName="Base Sepolia" />
                </div>
              </div>

              <AllocationChart />
              <RecentActivity />
            </div>

            {/* Right Column - Risk Metrics */}
            <div className="space-y-6">
              <RiskMetrics />
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-700/50 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-slate-400 text-sm">
          <p>Built with ❤️ using LayerZero, Pyth Network, and 1inch</p>
          <p className="mt-2">Hackathon Project - Not audited, use at your own risk</p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="glass rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
      <div className="w-16 h-16 rounded-xl bg-primary-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-primary-400">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  );
}


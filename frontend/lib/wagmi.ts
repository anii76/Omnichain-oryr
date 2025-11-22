import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { arbitrumSepolia, baseSepolia } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "ORYR - Omnichain Yield Router",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [arbitrumSepolia, baseSepolia],
  ssr: true,
});


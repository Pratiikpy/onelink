"use client";

import { getDefaultConfig, RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { arbitrumSepolia, arcTestnet, baseSepolia, polygonAmoy, sepolia } from "viem/chains";
import { useState } from "react";

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
const isPublicDeploy = process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://") ?? false;
const projectId = walletConnectProjectId || "onelink-demo";

if (isPublicDeploy && !walletConnectProjectId && process.env.NEXT_PUBLIC_ALLOW_DEMO !== "true") {
  throw new Error(
    "Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID for public deploy. " +
      "Set a Reown project ID, or set NEXT_PUBLIC_ALLOW_DEMO=true for preview-only demo mode.",
  );
}

const config = getDefaultConfig({
  appName: "OneLink Collect",
  projectId,
  chains: [arcTestnet, baseSepolia, sepolia, arbitrumSepolia, polygonAmoy],
  ssr: true,
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          theme={darkTheme({
            accentColor: "#C9F267",
            accentColorForeground: "#0A0A0C",
            borderRadius: "medium",
            fontStack: "system",
            overlayBlur: "small",
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

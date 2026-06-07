"use client";

import { QueryClient } from "@tanstack/react-query";
import { createConfig, http } from "wagmi";
import { coinbaseWallet, injected } from "wagmi/connectors";
import { base } from "wagmi/chains";
import { createClient } from "viem";
import type { Address, Hex } from "viem";

export const appName = "Popcorn Proof";

export const contractAddress = (process.env.NEXT_PUBLIC_POPCORN_PROOF_ADDRESS ??
  "0x3e51E2aF65e1802565BcA6f3715072Aa3ca8216B") as Address;

export const baseAppId =
  process.env.NEXT_PUBLIC_BASE_APP_ID ?? "6a252f3a95cfa95c11629bb3";

export const builderCode =
  process.env.NEXT_PUBLIC_BASE_BUILDER_CODE ?? "bc_x452k0jv";

export const attributionDataSuffix = (process.env
  .NEXT_PUBLIC_BASE_BUILDER_ENCODED_STRING ??
  "0x62635f783435326b306a760b0080218021802180218021802180218021") as Hex;

export const queryClient = new QueryClient();

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
    coinbaseWallet({
      appName,
      preference: "all",
    }),
  ],
  ssr: true,
  multiInjectedProviderDiscovery: true,
  client({ chain }) {
    return createClient({
      chain,
      dataSuffix: attributionDataSuffix,
      transport: http(),
    });
  },
});

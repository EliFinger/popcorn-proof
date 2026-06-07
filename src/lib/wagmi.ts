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
  process.env.NEXT_PUBLIC_BASE_BUILDER_CODE ?? "";

export const attributionDataSuffix = encodeBuilderCode(builderCode);

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

function encodeBuilderCode(value: string): Hex {
  const normalized = value.trim();

  if (/^0x[0-9a-fA-F]+$/.test(normalized) && normalized.length > 2) {
    return normalized as Hex;
  }

  const bytes =
    typeof TextEncoder !== "undefined"
      ? new TextEncoder().encode(normalized)
      : Buffer.from(normalized, "utf8");

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return `0x${hex || "00"}`;
}

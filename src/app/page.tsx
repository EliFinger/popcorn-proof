"use client";

import {
  CircleDollarSign,
  Clapperboard,
  Loader2,
  Popcorn,
  ReceiptText,
  Sparkles,
  Ticket,
  Unplug,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContracts,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { base } from "wagmi/chains";
import type { BaseError } from "wagmi";
import type { Hex } from "viem";
import { popcornProofAbi } from "@/lib/abi";
import {
  attributionDataSuffix,
  builderCode,
  contractAddress,
} from "@/lib/wagmi";

type Ritual = {
  key: "pops" | "salts" | "cheers";
  title: string;
  label: string;
  method: "popKernel" | "saltBucket" | "cheerShow";
  personalLabel: string;
  totalLabel: string;
  icon: React.ComponentType<{ className?: string }>;
};

const rituals: Ritual[] = [
  {
    key: "pops",
    title: "Pop Kernel",
    label: "Pop Kernel",
    method: "popKernel",
    personalLabel: "My Pops",
    totalLabel: "Total Pops",
    icon: Popcorn,
  },
  {
    key: "salts",
    title: "Salt Bucket",
    label: "Salt Bucket",
    method: "saltBucket",
    personalLabel: "My Salts",
    totalLabel: "Total Salts",
    icon: CircleDollarSign,
  },
  {
    key: "cheers",
    title: "Cheer Show",
    label: "Cheer Show",
    method: "cheerShow",
    personalLabel: "My Cheers",
    totalLabel: "Total Cheers",
    icon: Clapperboard,
  },
];

const fallbackCounts = {
  userPops: 0n,
  userSalts: 0n,
  userCheers: 0n,
  totalPops: 0n,
  totalSalts: 0n,
  totalCheers: 0n,
};

export default function Home() {
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const [lastAction, setLastAction] = useState<string>("Ready for showtime");
  const [lastHash, setLastHash] = useState<Hex | undefined>();

  const { address, chainId, isConnected, status } = useAccount();
  const { connectors, connect, isPending: isConnecting } = useConnect({
    mutation: {
      onSuccess() {
        setWalletMenuOpen(false);
        setLastAction("Wallet connected");
      },
      onError(error) {
        setLastAction(readableError(error));
      },
    },
  });
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { writeContractAsync, isPending: isWriting } = useWriteContract();

  const hasContract = Boolean(contractAddress);
  const onBase = chainId === base.id;

  const reads = useMemo(() => {
    if (!contractAddress) return [];

    const publicReads = [
      "totalPops",
      "totalSalts",
      "totalCheers",
    ] as const;
    const userReads = address
      ? ([
          ["userPops", address],
          ["userSalts", address],
          ["userCheers", address],
        ] as const)
      : [];

    return [
      ...userReads.map(([functionName, userAddress]) => ({
        address: contractAddress,
        abi: popcornProofAbi,
        functionName,
        args: [userAddress],
        chainId: base.id,
      })),
      ...publicReads.map((functionName) => ({
        address: contractAddress,
        abi: popcornProofAbi,
        functionName,
        chainId: base.id,
      })),
    ];
  }, [address]);

  const {
    data: contractData,
    refetch,
    isLoading: isLoadingCounts,
  } = useReadContracts({
    contracts: reads,
    query: {
      enabled: hasContract,
      refetchInterval: 15_000,
    },
  });

  const receipt = useWaitForTransactionReceipt({
    hash: lastHash,
    chainId: base.id,
    query: {
      enabled: Boolean(lastHash),
    },
  });

  const counts = parseCounts(contractData, Boolean(address));

  async function runRitual(ritual: Ritual) {
    if (!contractAddress) {
      setLastAction("Contract address is not configured");
      return;
    }

    if (!isConnected) {
      setWalletMenuOpen(true);
      setLastAction("Choose a wallet first");
      return;
    }

    if (!onBase) {
      switchChain({ chainId: base.id });
      setLastAction("Switching to Base");
      return;
    }

    try {
      setLastAction(`${ritual.title} pending`);
      const hash = await writeContractAsync({
        address: contractAddress,
        abi: popcornProofAbi,
        functionName: ritual.method,
        chainId: base.id,
        dataSuffix: attributionDataSuffix,
      });

      setLastHash(hash);
      setLastAction(`${ritual.title} sent`);
      await refetch();
    } catch (error) {
      setLastAction(readableError(error));
    }
  }

  const walletStatus = isConnected
    ? `${shortAddress(address)} on ${onBase ? "Base" : "another network"}`
    : status === "connecting" || isConnecting
      ? "Connecting"
      : "Disconnected";

  const txStatus = receipt.isLoading
    ? "Pending"
    : receipt.isSuccess
      ? "Success"
      : receipt.isError
        ? "Failed"
        : lastHash
          ? "Sent"
          : "Idle";

  const visibleConnectors = connectors.filter((connector) =>
    ["injected", "coinbaseWallet"].includes(connector.type),
  );

  return (
    <main className="min-h-screen overflow-hidden bg-[#f8e6b1] text-[#1d1610]">
      <div className="ticket-strip h-5 w-full bg-[#f8f4df]" />

      <section className="mx-auto flex min-h-[calc(100vh-20px)] w-full max-w-5xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 border-2 border-[#1d1610] bg-[#fffaf0] px-3 py-1 text-xs font-black uppercase tracking-normal shadow-[3px_3px_0_#1d1610]">
              <Ticket className="h-4 w-4" />
              Base Cinema Counter
            </div>
            <h1 className="mt-4 text-5xl font-black leading-none tracking-normal text-[#c82026] sm:text-6xl">
              Popcorn Proof
            </h1>
            <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-[#403026]">
              Tap one onchain cinema ritual, pay only Base gas, and watch your
              personal and house counters move.
            </p>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                if (isConnected) {
                  disconnect();
                  setLastAction("Wallet disconnected");
                  return;
                }

                setWalletMenuOpen((open) => !open);
              }}
              className="inline-flex h-12 w-full items-center justify-center gap-2 border-2 border-[#1d1610] bg-[#c82026] px-4 text-sm font-black uppercase tracking-normal text-white shadow-[4px_4px_0_#1d1610] transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#1d1610] sm:w-auto"
            >
              {isConnected ? (
                <Unplug className="h-5 w-5" />
              ) : (
                <Wallet className="h-5 w-5" />
              )}
              {isConnected ? "Disconnect" : "Connect Wallet"}
            </button>

            {walletMenuOpen && !isConnected ? (
              <div className="absolute right-0 z-20 mt-3 w-full min-w-72 border-2 border-[#1d1610] bg-[#fffaf0] p-2 shadow-[5px_5px_0_#1d1610] sm:w-80">
                {visibleConnectors.map((connector) => (
                  <button
                    type="button"
                    key={connector.uid}
                    onClick={() => connect({ connector, chainId: base.id })}
                    className="flex min-h-12 w-full items-center justify-between border-b border-dashed border-[#1d1610]/30 px-3 py-3 text-left text-sm font-black uppercase tracking-normal last:border-b-0 hover:bg-[#f5ca42]"
                  >
                    <span>{walletName(connector.name)}</span>
                    {isConnecting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Ticket className="h-4 w-4" />
                    )}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </header>

        <div className="mt-6 grid flex-1 gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="popcorn-wall flex min-h-[360px] flex-col justify-center border-2 border-[#1d1610] bg-[#fffaf0] p-4 shadow-[6px_6px_0_#1d1610] sm:p-6">
            <div className="grid gap-3">
              {rituals.map((ritual) => {
                const Icon = ritual.icon;
                const disabled =
                  isWriting ||
                  receipt.isLoading ||
                  isSwitching ||
                  !hasContract ||
                  (isConnected && !onBase);

                return (
                  <button
                    type="button"
                    key={ritual.key}
                    onClick={() => runRitual(ritual)}
                    disabled={disabled}
                    className="group flex min-h-24 w-full items-center justify-between border-2 border-[#1d1610] bg-[#f5ca42] px-4 py-4 text-left shadow-[4px_4px_0_#1d1610] transition hover:-translate-y-0.5 hover:bg-[#ffd95d] hover:shadow-[6px_6px_0_#1d1610] disabled:cursor-not-allowed disabled:opacity-55 sm:min-h-28 sm:px-5"
                  >
                    <span className="flex min-w-0 items-center gap-4">
                      <span className="grid h-14 w-14 shrink-0 place-items-center border-2 border-[#1d1610] bg-[#c82026] text-white">
                        <Icon className="h-7 w-7" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-2xl font-black uppercase leading-tight tracking-normal sm:text-3xl">
                          {ritual.label}
                        </span>
                        <span className="mt-1 block text-sm font-bold text-[#403026]">
                          Standard contract call
                        </span>
                      </span>
                    </span>
                    <Sparkles className="ml-3 h-6 w-6 shrink-0 text-[#c82026]" />
                  </button>
                );
              })}
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {rituals.map((ritual) => (
                <CounterRow
                  key={ritual.key}
                  personalLabel={ritual.personalLabel}
                  totalLabel={ritual.totalLabel}
                  personal={counts[`user${capitalize(ritual.key)}`]}
                  total={counts[`total${capitalize(ritual.key)}`]}
                  loading={isLoadingCounts}
                />
              ))}
            </div>

            <div className="border-2 border-[#1d1610] bg-[#fffaf0] p-4 shadow-[5px_5px_0_#1d1610]">
              <StatusLine label="Wallet Status" value={walletStatus} />
              <StatusLine label="Last Transaction" value={lastAction} />
              <StatusLine label="Transaction State" value={txStatus} />
              <StatusLine
                label="Contract"
                value={contractAddress ? shortAddress(contractAddress) : "Not configured"}
              />
            </div>

            <div className="border-2 border-[#1d1610] bg-[#1d1610] p-4 text-[#f8e6b1] shadow-[5px_5px_0_#c82026]">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-normal text-[#f5ca42]">
                <ReceiptText className="h-4 w-4" />
                Attribution Receipt
              </div>
              <p className="mt-3 break-all font-mono text-xs leading-5">
                Builder code: {builderCode}
              </p>
              <p className="mt-2 break-all font-mono text-xs leading-5">
                Data suffix: {attributionDataSuffix}
              </p>
              {lastHash ? (
                <a
                  href={`https://basescan.org/tx/${lastHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex text-sm font-black uppercase text-white underline decoration-[#f5ca42] decoration-2 underline-offset-4"
                >
                  View on Basescan
                </a>
              ) : null}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function CounterRow({
  personalLabel,
  totalLabel,
  personal,
  total,
  loading,
}: {
  personalLabel: string;
  totalLabel: string;
  personal: bigint;
  total: bigint;
  loading: boolean;
}) {
  return (
    <div className="counter-grid border-2 border-[#1d1610] bg-[#fffaf0] shadow-[5px_5px_0_#1d1610]">
      <div className="border-b-2 border-[#1d1610] bg-[#c82026] px-3 py-2 text-xs font-black uppercase tracking-normal text-white">
        Cashier Display
      </div>
      <div className="grid grid-cols-2 gap-0">
        <CounterCell label={personalLabel} value={personal} loading={loading} />
        <CounterCell label={totalLabel} value={total} loading={loading} />
      </div>
    </div>
  );
}

function CounterCell({
  label,
  value,
  loading,
}: {
  label: string;
  value: bigint;
  loading: boolean;
}) {
  return (
    <div className="border-r-2 border-[#1d1610] p-3 last:border-r-0">
      <div className="text-[11px] font-black uppercase tracking-normal text-[#403026]">
        {label}
      </div>
      <div className="mt-2 font-mono text-3xl font-black leading-none text-[#1d1610]">
        {loading ? "--" : value.toString()}
      </div>
    </div>
  );
}

function StatusLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-3 border-b border-dashed border-[#1d1610]/40 py-2 last:border-b-0">
      <span className="text-xs font-black uppercase tracking-normal text-[#403026]">
        {label}
      </span>
      <span className="break-all text-right text-sm font-black">{value}</span>
    </div>
  );
}

function parseCounts(
  data:
    | {
        result?: unknown;
        status: "success" | "failure";
      }[]
    | undefined,
  hasUser: boolean,
) {
  if (!data) return fallbackCounts;

  const values = data.map((item) =>
    item.status === "success" && typeof item.result === "bigint"
      ? item.result
      : 0n,
  );

  if (hasUser) {
    return {
      userPops: values[0] ?? 0n,
      userSalts: values[1] ?? 0n,
      userCheers: values[2] ?? 0n,
      totalPops: values[3] ?? 0n,
      totalSalts: values[4] ?? 0n,
      totalCheers: values[5] ?? 0n,
    };
  }

  return {
    ...fallbackCounts,
    totalPops: values[0] ?? 0n,
    totalSalts: values[1] ?? 0n,
    totalCheers: values[2] ?? 0n,
  };
}

function walletName(name: string) {
  if (name.toLowerCase().includes("coinbase")) return "Coinbase Wallet";
  if (name.toLowerCase().includes("injected")) return "Browser Wallet";
  return name;
}

function shortAddress(address?: string) {
  if (!address) return "Unknown";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function capitalize(value: Ritual["key"]) {
  if (value === "pops") return "Pops";
  if (value === "salts") return "Salts";
  return "Cheers";
}

function readableError(error: unknown) {
  const candidate = error as BaseError;
  return candidate?.shortMessage ?? candidate?.message ?? "Transaction failed";
}

import { useCallback, useEffect, useState } from "react";
import { Address, formatUnits } from "viem";
import { usePublicClient } from "wagmi";
import { TokenContract } from "@/providers/contract/ContractProvider";

export interface TokenEvent {
  type: "transfer" | "approval";
  from: Address;
  to: Address;
  value: {
    raw: bigint;
    formatted: string;
  };
  blockNumber: number;
  transactionHash: string;
  timestamp: number;
}

interface EventsState {
  events: TokenEvent[];
  loading: boolean;
  error: Error | null;
}

export const useTokenEvents = (
  token?: TokenContract,
  fromBlock?: bigint,
  toBlock?: bigint
) => {
  const publicClient = usePublicClient();
  const [state, setState] = useState<EventsState>({
    events: [],
    loading: false,
    error: null,
  });

  const fetchEvents = useCallback(async () => {
    if (!token || !publicClient) {
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Récupérer les événements Transfer
      const transferLogs = await publicClient.getLogs({
        address: token.address,
        event: {
          type: "event",
          name: "Transfer",
          inputs: [
            { indexed: true, name: "from", type: "address" },
            { indexed: true, name: "to", type: "address" },
            { indexed: false, name: "value", type: "uint256" },
          ],
        },
        fromBlock,
        toBlock,
      });

      // Récupérer les événements Approval
      const approvalLogs = await publicClient.getLogs({
        address: token.address,
        event: {
          type: "event",
          name: "Approval",
          inputs: [
            { indexed: true, name: "owner", type: "address" },
            { indexed: true, name: "spender", type: "address" },
            { indexed: false, name: "value", type: "uint256" },
          ],
        },
        fromBlock,
        toBlock,
      });

      // Récupérer les timestamps des blocs
      const blockNumbers = [
        ...new Set([
          ...transferLogs.map((log) => log.blockNumber),
          ...approvalLogs.map((log) => log.blockNumber),
        ]),
      ];

      const blocks = await Promise.all(
        blockNumbers.map((blockNumber) =>
          publicClient.getBlock({ blockNumber })
        )
      );

      const blockTimestamps = new Map(
        blocks.map((block) => [block.number, Number(block.timestamp)])
      );

      // Transformer les logs en événements
      const events: TokenEvent[] = [
        ...transferLogs.map((log) => ({
          type: "transfer" as const,
          from: log.args.from as Address,
          to: log.args.to as Address,
          value: {
            raw: log.args.value as bigint,
            formatted: formatUnits(log.args.value as bigint, token.decimals),
          },
          blockNumber: Number(log.blockNumber),
          transactionHash: log.transactionHash,
          timestamp: blockTimestamps.get(log.blockNumber) || 0,
        })),
        ...approvalLogs.map((log) => ({
          type: "approval" as const,
          from: log.args.owner as Address,
          to: log.args.spender as Address,
          value: {
            raw: log.args.value as bigint,
            formatted: formatUnits(log.args.value as bigint, token.decimals),
          },
          blockNumber: Number(log.blockNumber),
          transactionHash: log.transactionHash,
          timestamp: blockTimestamps.get(log.blockNumber) || 0,
        })),
      ].sort((a, b) => b.blockNumber - a.blockNumber);

      setState({
        events,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error ? error : new Error("Failed to fetch events"),
      }));
    }
  }, [token, publicClient, fromBlock, toBlock]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    ...state,
    refetch: fetchEvents,
  };
};

export default useTokenEvents;

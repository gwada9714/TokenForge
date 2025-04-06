import { useState, useEffect } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { parseEther, formatEther } from "viem";
import type { Address } from "viem";

interface StakingStats {
  totalStaked: bigint;
  apy: number;
  stakersCount: number;
}

export const useStaking = (stakingContractAddress: Address) => {
  const [stakedAmount, setStakedAmount] = useState<bigint | null>(null);
  const [pendingRewards, setPendingRewards] = useState<bigint | null>(null);
  const [stakingStats, setStakingStats] = useState<StakingStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stakeAmount, setStakeAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  // Fonction pour récupérer les données de staking
  const fetchStakingData = async () => {
    if (!address || !publicClient || !stakingContractAddress) return;

    try {
      setIsLoading(true);
      setError(null);

      // Récupérer le montant staké par l'utilisateur
      const stakedResult = await publicClient.readContract({
        address: stakingContractAddress,
        abi: [
          {
            inputs: [{ name: "account", type: "address" }],
            name: "balanceOf",
            outputs: [{ name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "balanceOf",
        args: [address],
      });

      setStakedAmount(stakedResult as bigint);

      // Récupérer les récompenses en attente
      const rewardsResult = await publicClient.readContract({
        address: stakingContractAddress,
        abi: [
          {
            inputs: [{ name: "account", type: "address" }],
            name: "earned",
            outputs: [{ name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "earned",
        args: [address],
      });

      setPendingRewards(rewardsResult as bigint);

      // Récupérer les statistiques globales
      const totalStakedResult = await publicClient.readContract({
        address: stakingContractAddress,
        abi: [
          {
            inputs: [],
            name: "totalSupply",
            outputs: [{ name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "totalSupply",
        args: [],
      });

      // Récupérer le taux de récompense (pour calculer l'APY)
      const rewardRateResult = await publicClient.readContract({
        address: stakingContractAddress,
        abi: [
          {
            inputs: [],
            name: "rewardRate",
            outputs: [{ name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "rewardRate",
        args: [],
      });

      // Calculer l'APY approximatif (ceci est une simplification)
      const totalStaked = totalStakedResult as bigint;
      const rewardRate = rewardRateResult as bigint;

      // APY = (rewardRate * 365 * 86400 * 100) / totalStaked
      // (récompenses par seconde * secondes dans une année * 100) / total staké
      const apy =
        totalStaked > 0n
          ? Number(formatEther(rewardRate * 365n * 86400n * 100n)) /
            Number(formatEther(totalStaked))
          : 0;

      // Récupérer le nombre de stakers (si disponible)
      let stakersCount = 0;
      try {
        const countResult = await publicClient.readContract({
          address: stakingContractAddress,
          abi: [
            {
              inputs: [],
              name: "getStakersCount",
              outputs: [{ name: "", type: "uint256" }],
              stateMutability: "view",
              type: "function",
            },
          ],
          functionName: "getStakersCount",
          args: [],
        });
        stakersCount = Number(countResult);
      } catch {
        // Cette fonction peut ne pas exister dans tous les contrats de staking
        stakersCount = 0;
      }

      setStakingStats({
        totalStaked,
        apy,
        stakersCount,
      });
    } catch (err) {
      console.error("Error fetching staking data:", err);
      setError("Erreur lors de la récupération des données de staking");
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les données au montage et lorsque l'adresse change
  useEffect(() => {
    fetchStakingData();
    // Rafraîchir les données toutes les 30 secondes
    const interval = setInterval(fetchStakingData, 30000);
    return () => clearInterval(interval);
  }, [address, stakingContractAddress, publicClient]);

  // Fonction pour staker des tokens
  const stake = async (amount: string) => {
    if (!walletClient || !address || !stakingContractAddress || !publicClient) {
      setError("Wallet non connecté ou client non disponible");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const amountInWei = parseEther(amount);

      // Approuver le contrat de staking pour dépenser les tokens
      const tokenAddress = (await publicClient.readContract({
        address: stakingContractAddress,
        abi: [
          {
            inputs: [],
            name: "stakingToken",
            outputs: [{ name: "", type: "address" }],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "stakingToken",
        args: [],
      })) as Address;

      // Approuver le transfert
      const approveHash = await walletClient.writeContract({
        address: tokenAddress,
        abi: [
          {
            inputs: [
              { name: "spender", type: "address" },
              { name: "amount", type: "uint256" },
            ],
            name: "approve",
            outputs: [{ name: "", type: "bool" }],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
        functionName: "approve",
        args: [stakingContractAddress, amountInWei],
      });

      await publicClient.waitForTransactionReceipt({ hash: approveHash });

      // Staker les tokens
      const stakeHash = await walletClient.writeContract({
        address: stakingContractAddress,
        abi: [
          {
            inputs: [{ name: "amount", type: "uint256" }],
            name: "stake",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
        functionName: "stake",
        args: [amountInWei],
      });

      await publicClient.waitForTransactionReceipt({ hash: stakeHash });

      // Rafraîchir les données
      fetchStakingData();
      setStakeAmount("");
    } catch (err: any) {
      console.error("Error staking tokens:", err);
      setError(err.message || "Erreur lors du staking");
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour retirer des tokens
  const withdraw = async (amount: string) => {
    if (!walletClient || !address || !stakingContractAddress || !publicClient) {
      setError("Wallet non connecté ou client non disponible");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const amountInWei = parseEther(amount);

      // Retirer les tokens
      const withdrawHash = await walletClient.writeContract({
        address: stakingContractAddress,
        abi: [
          {
            inputs: [{ name: "amount", type: "uint256" }],
            name: "withdraw",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
        functionName: "withdraw",
        args: [amountInWei],
      });

      await publicClient.waitForTransactionReceipt({ hash: withdrawHash });

      // Rafraîchir les données
      fetchStakingData();
      setWithdrawAmount("");
    } catch (err: any) {
      console.error("Error withdrawing tokens:", err);
      setError(err.message || "Erreur lors du retrait");
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour réclamer les récompenses
  const claimRewards = async () => {
    if (!walletClient || !address || !stakingContractAddress || !publicClient) {
      setError("Wallet non connecté ou client non disponible");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Réclamer les récompenses
      const claimHash = await walletClient.writeContract({
        address: stakingContractAddress,
        abi: [
          {
            inputs: [],
            name: "getReward",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
        functionName: "getReward",
        args: [],
      });

      await publicClient.waitForTransactionReceipt({ hash: claimHash });

      // Rafraîchir les données
      fetchStakingData();
    } catch (err: any) {
      console.error("Error claiming rewards:", err);
      setError(err.message || "Erreur lors de la réclamation des récompenses");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    stakedAmount,
    pendingRewards,
    stakingStats,
    isLoading,
    error,
    stake,
    withdraw,
    claimRewards,
    stakeAmount,
    setStakeAmount,
    withdrawAmount,
    setWithdrawAmount,
    refreshData: fetchStakingData,
  };
};

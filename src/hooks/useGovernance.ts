import { useState } from 'react';
import { useContractRead, useContractWrite } from 'wagmi';
import { useAccount } from 'wagmi';
import { parseEther } from 'viem';

// ABI for TokenForgeGovernance
const GovernanceABI = [
  "function createProposal(uint8 proposalType, string description) external",
  "function vote(uint256 proposalId, bool support) external",
  "function getProposal(uint256 proposalId) external view returns (address creator, uint8 proposalType, string description, uint256 startTime, uint256 endTime, uint256 forVotes, uint256 againstVotes, bool executed)",
  "function hasVoted(uint256 proposalId, address voter) external view returns (bool)",
  "function proposalCount() external view returns (uint256)"
] as const;

export enum ProposalType {
  ADD_BLOCKCHAIN = 0,
  UI_COLOR_THEME = 1,
  ADD_LANGUAGE = 2
}

export interface Proposal {
  id: number;
  creator: string;
  proposalType: ProposalType;
  description: string;
  startTime: number;
  endTime: number;
  forVotes: bigint;
  againstVotes: bigint;
  executed: boolean;
  hasVoted?: boolean;
}

interface UseGovernanceProps {
  governanceAddress: `0x${string}`;
}

export const useGovernance = ({ governanceAddress }: UseGovernanceProps) => {
  const { address } = useAccount();
  const [selectedProposal, setSelectedProposal] = useState<number | null>(null);

  // Get total number of proposals
  const { data: proposalCount } = useContractRead({
    address: governanceAddress,
    abi: GovernanceABI,
    functionName: 'proposalCount',
  });

  // Get proposal details
  const { data: proposalDetails, refetch: refetchProposal } = useContractRead({
    address: governanceAddress,
    abi: GovernanceABI,
    functionName: 'getProposal',
    args: selectedProposal !== null ? [BigInt(selectedProposal)] : undefined,
    enabled: selectedProposal !== null,
  });

  // Check if user has voted
  const { data: hasVoted } = useContractRead({
    address: governanceAddress,
    abi: GovernanceABI,
    functionName: 'hasVoted',
    args: selectedProposal !== null && address ? [BigInt(selectedProposal), address] : undefined,
    enabled: selectedProposal !== null && !!address,
  });

  // Create proposal
  const { writeAsync: createProposal, isLoading: isCreatingProposal } = useContractWrite({
    address: governanceAddress,
    abi: GovernanceABI,
    functionName: 'createProposal',
  });

  // Vote on proposal
  const { writeAsync: vote, isLoading: isVoting } = useContractWrite({
    address: governanceAddress,
    abi: GovernanceABI,
    functionName: 'vote',
  });

  // Create a new proposal
  const submitProposal = async (type: ProposalType, description: string) => {
    await createProposal({ args: [type, description] });
  };

  // Vote on a proposal
  const submitVote = async (proposalId: number, support: boolean) => {
    await vote({ args: [BigInt(proposalId), support] });
  };

  // Format proposal details
  const formatProposal = (
    id: number,
    [creator, type, description, startTime, endTime, forVotes, againstVotes, executed]: any
  ): Proposal => ({
    id,
    creator,
    proposalType: type,
    description,
    startTime: Number(startTime),
    endTime: Number(endTime),
    forVotes,
    againstVotes,
    executed,
    hasVoted: hasVoted,
  });

  return {
    proposalCount: proposalCount ? Number(proposalCount) : 0,
    selectedProposal,
    setSelectedProposal,
    currentProposal: proposalDetails
      ? formatProposal(selectedProposal!, proposalDetails)
      : null,
    hasVoted,
    submitProposal,
    submitVote,
    isCreatingProposal,
    isVoting,
    refetchProposal,
  };
};

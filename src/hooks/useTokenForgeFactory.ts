import { useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { tokenForgeFactoryABI } from '../contracts/abis';
import { TOKEN_FORGE_FACTORY_ADDRESS } from '../constants';

export function useTokenForgeFactory() {
  const { data: isPaused, isLoading: isPausedLoading } = useContractRead({
    address: TOKEN_FORGE_FACTORY_ADDRESS,
    abi: tokenForgeFactoryABI,
    functionName: 'paused',
  });

  const { config: pauseConfig } = usePrepareContractWrite({
    address: TOKEN_FORGE_FACTORY_ADDRESS,
    abi: tokenForgeFactoryABI,
    functionName: 'pause',
  });

  const { config: unpauseConfig } = usePrepareContractWrite({
    address: TOKEN_FORGE_FACTORY_ADDRESS,
    abi: tokenForgeFactoryABI,
    functionName: 'unpause',
  });

  const { write: pause, isLoading: isPausing } = useContractWrite(pauseConfig);
  const { write: unpause, isLoading: isUnpausing } = useContractWrite(unpauseConfig);

  return {
    isPaused,
    isPausedLoading,
    pause,
    unpause,
    isPausing,
    isUnpausing,
  };
}

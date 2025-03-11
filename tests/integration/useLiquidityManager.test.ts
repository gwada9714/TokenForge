import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';
import { useLiquidityManager } from '@/hooks/useLiquidityManager';
import { collection, getDocs, addDoc, updateDoc, query, where } from 'firebase/firestore';

// Mocks pour Firebase Firestore
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn((db, path, id) => ({ path, id })),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  setDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  serverTimestamp: vi.fn(() => new Date().toISOString()),
}));

// Mock pour wagmi
vi.mock('wagmi', () => ({
  useAccount: vi.fn().mockReturnValue({
    address: '0x1234567890123456789012345678901234567890',
    isConnected: true
  })
}));

// Mock pour Firestore
vi.mock('@/lib/firebase/firestore', () => ({
  getFirestore: vi.fn().mockResolvedValue({
    // Mock db instance
  })
}));

// Mock pour toast
vi.mock('react-hot-toast', () => ({
  success: vi.fn(),
  error: vi.fn()
}));

describe('useLiquidityManager hook', () => {
  beforeEach(() => {
    // Réinitialiser tous les mocks
    vi.clearAllMocks();
    
    // Configurer les mocks pour simuler les données Firestore
    const mockTokenDocs = [
      {
        id: 'token1',
        data: () => ({
          name: 'Test Token',
          symbol: 'TST',
          owner: '0x1234567890123456789012345678901234567890',
          contractAddress: '0xabc1234567890123456789012345678901234567'
        })
      }
    ];
    
    const mockSettingsDocs = [
      {
        id: 'setting1',
        data: () => ({
          userAddress: '0x1234567890123456789012345678901234567890',
          tokenAddress: '0xabc1234567890123456789012345678901234567',
          enabled: true,
          targetRatio: 50,
          rebalanceThreshold: 5,
          maxSlippage: 2.5,
          rebalanceInterval: 24,
          exchangeFee: 0.3,
          autoCompound: true,
          liquidityPair: 'ETH'
        })
      }
    ];
    
    // Mock des réponses Firebase
    (getDocs as any).mockImplementation((querySnapshot) => {
      if (querySnapshot._queryType === 'tokens') {
        return Promise.resolve({
          empty: false,
          docs: mockTokenDocs
        });
      }
      
      if (querySnapshot._queryType === 'liquiditySettings') {
        return Promise.resolve({
          empty: false,
          docs: mockSettingsDocs
        });
      }
      
      return Promise.resolve({ empty: true, docs: [] });
    });
    
    (query as any).mockImplementation((collectionRef, ...conditions) => {
      // Déterminer de quelle collection il s'agit
      if (collectionRef.path === 'tokens') {
        return { _queryType: 'tokens', path: 'tokens', conditions };
      }
      
      if (collectionRef.path === 'liquiditySettings') {
        return { _queryType: 'liquiditySettings', path: 'liquiditySettings', conditions };
      }
      
      return { _queryType: 'unknown', conditions };
    });
    
    (collection as any).mockImplementation((db, path) => ({
      path,
    }));
    
    (addDoc as any).mockResolvedValue({ id: 'newSetting' });
    (updateDoc as any).mockResolvedValue({});
  });
  
  it('should load user tokens and liquidity settings on mount', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useLiquidityManager());
    
    // Attendre que les effets soient exécutés
    await waitForNextUpdate();
    
    // Vérifier que les données ont bien été chargées
    expect(result.current.userTokens.length).toBe(1);
    expect(result.current.userTokens[0].symbol).toBe('TST');
    
    // Vérifier que les paramètres de liquidité ont été chargés
    const tokenAddress = '0xabc1234567890123456789012345678901234567';
    expect(result.current.userLiquiditySettings[tokenAddress]).toBeDefined();
    expect(result.current.userLiquiditySettings[tokenAddress].enabled).toBe(true);
    expect(result.current.userLiquiditySettings[tokenAddress].targetRatio).toBe(50);
  });
  
  it('should setup automatic liquidity', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useLiquidityManager());
    
    // Attendre que les données initiales soient chargées
    await waitForNextUpdate();
    
    // Configurer des paramètres de liquidité
    const tokenAddress = '0xdef1234567890123456789012345678901234567';
    const settings = {
      enabled: true,
      targetRatio: 60,
      rebalanceThreshold: 3,
      maxSlippage: 1.5,
      rebalanceInterval: 12,
      exchangeFee: 0.2,
      autoCompound: false,
      liquidityPair: 'USDC'
    };
    
    // Exécuter la fonction
    await act(async () => {
      await result.current.setupAutomaticLiquidity(tokenAddress, settings);
    });
    
    // Vérifier que addDoc a été appelé avec les bons paramètres
    expect(addDoc).toHaveBeenCalled();
    const callArgs = (addDoc as any).mock.calls[0];
    expect(callArgs[1].tokenAddress).toBe(tokenAddress);
    expect(callArgs[1].targetRatio).toBe(60);
    expect(callArgs[1].liquidityPair).toBe('USDC');
    
    // Vérifier que l'état local a été mis à jour
    expect(result.current.userLiquiditySettings[tokenAddress]).toBeDefined();
    expect(result.current.userLiquiditySettings[tokenAddress].targetRatio).toBe(60);
  });
  
  it('should modify existing liquidity settings', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useLiquidityManager());
    
    // Attendre que les données initiales soient chargées
    await waitForNextUpdate();
    
    // Adresse du token existant
    const tokenAddress = '0xabc1234567890123456789012345678901234567';
    
    // Nouvelles configurations
    const updatedSettings = {
      enabled: true,
      targetRatio: 70, // Modification de la valeur
      rebalanceThreshold: 4,
      maxSlippage: 2.0,
      rebalanceInterval: 48,
      exchangeFee: 0.25,
      autoCompound: true,
      liquidityPair: 'USDT' // Changement de la paire
    };
    
    // Exécuter la fonction de modification
    await act(async () => {
      await result.current.modifyLiquiditySettings(tokenAddress, updatedSettings);
    });
    
    // Vérifier que updateDoc a été appelé
    expect(updateDoc).toHaveBeenCalled();
    
    // Vérifier que l'état local a été mis à jour
    expect(result.current.userLiquiditySettings[tokenAddress].targetRatio).toBe(70);
    expect(result.current.userLiquiditySettings[tokenAddress].liquidityPair).toBe('USDT');
  });
  
  it('should trigger a rebalance', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useLiquidityManager());
    
    // Simuler le passage du temps
    vi.useFakeTimers();
    
    // Attendre que les données initiales soient chargées
    await waitForNextUpdate();
    
    // Adresse du token existant
    const tokenAddress = '0xabc1234567890123456789012345678901234567';
    
    // Espionner la fonction de refresh
    const refreshSpy = vi.spyOn(result.current, 'refreshLiquidityStatus');
    
    // Déclencher un rééquilibrage
    await act(async () => {
      await result.current.triggerRebalance(tokenAddress);
    });
    
    // Avancer le temps de 2 secondes pour le setTimeout
    vi.advanceTimersByTime(2000);
    
    // Vérifier que refreshLiquidityStatus a été appelé
    expect(refreshSpy).toHaveBeenCalledWith(tokenAddress);
    
    // Restaurer le temps réel
    vi.useRealTimers();
  });
});

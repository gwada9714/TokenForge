import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { 
  UserLevel, 
  Plan, 
  DEFAULT_PLANS, 
  PlanFeatures,
  TokenFeatures,
  ServiceAccess 
} from '../types/plans';
import { useTokenForgePlans } from '../hooks/useTokenForgePlans';

interface UserPlanContextType {
  userLevel: UserLevel;
  currentPlan: Plan;
  features: PlanFeatures;
  isLoading: boolean;
  error: Error | null;
  upgradePlan: (newLevel: UserLevel, paymentMethod: "TKN" | "BNB") => Promise<void>;
  checkFeatureAccess: (feature: keyof TokenFeatures | keyof ServiceAccess) => boolean;
}

const UserPlanContext = createContext<UserPlanContextType | undefined>(undefined);

export const UserPlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address } = useAccount();
  const { getUserPlan, buyPlan, isLoading: isLoadingPlan } = useTokenForgePlans();
  
  const [userLevel, setUserLevel] = useState<UserLevel>(UserLevel.APPRENTICE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const currentPlan = DEFAULT_PLANS[userLevel];

  useEffect(() => {
    const loadUserPlan = async () => {
      if (!address) {
        setUserLevel(UserLevel.APPRENTICE);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const plan = await getUserPlan(address);
        setUserLevel(plan);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load user plan'));
        setUserLevel(UserLevel.APPRENTICE);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserPlan();
  }, [address, getUserPlan]);

  const upgradePlan = async (newLevel: UserLevel, paymentMethod: "TKN" | "BNB") => {
    if (!address) throw new Error('No wallet connected');
    if (newLevel <= userLevel) throw new Error('Cannot downgrade plan');

    try {
      await buyPlan(newLevel, paymentMethod);
      setUserLevel(newLevel);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to upgrade plan');
    }
  };

  const checkFeatureAccess = (feature: keyof TokenFeatures | keyof ServiceAccess): boolean => {
    const planFeatures = currentPlan.features;
    if (feature in planFeatures.tokenFeatures) {
      return planFeatures.tokenFeatures[feature as keyof TokenFeatures];
    }
    if (feature in planFeatures.serviceAccess) {
      return planFeatures.serviceAccess[feature as keyof ServiceAccess];
    }
    return false;
  };

  const value = {
    userLevel,
    currentPlan,
    features: currentPlan.features,
    isLoading: isLoading || isLoadingPlan,
    error,
    upgradePlan,
    checkFeatureAccess,
  };

  return (
    <UserPlanContext.Provider value={value}>
      {children}
    </UserPlanContext.Provider>
  );
};

export const useUserPlan = () => {
  const context = useContext(UserPlanContext);
  if (context === undefined) {
    throw new Error('useUserPlan must be used within a UserPlanProvider');
  }
  return context;
};

// Hook personnalisé pour vérifier rapidement l'accès aux fonctionnalités
export const useFeatureAccess = (feature: keyof TokenFeatures | keyof ServiceAccess) => {
  const { checkFeatureAccess } = useUserPlan();
  return checkFeatureAccess(feature);
};

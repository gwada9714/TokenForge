import React, { createContext, useContext, useState, useEffect } from "react";
import { useTokenForgePlans } from "../hooks/useTokenForgePlans";
import { UserLevel } from "../types/plans";
import { useAccount } from "wagmi";

interface UserPlanContextType {
  userPlan: UserLevel;
  isLoading: boolean;
  refreshPlan: () => Promise<void>;
}

const UserPlanContext = createContext<UserPlanContextType>({
  userPlan: UserLevel.APPRENTICE,
  isLoading: true,
  refreshPlan: async () => {},
});

export const UserPlanProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userPlan, setUserPlan] = useState<UserLevel>(UserLevel.APPRENTICE);
  const [isLoading, setIsLoading] = useState(true);
  const { getUserPlan } = useTokenForgePlans();
  const { address } = useAccount();

  const refreshPlan = async () => {
    if (!address) {
      setUserPlan(UserLevel.APPRENTICE);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const plan = await getUserPlan(address);
      setUserPlan(plan);
    } catch (error) {
      console.error("Erreur lors de la récupération du plan:", error);
      setUserPlan(UserLevel.APPRENTICE);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshPlan();
  }, [address]);

  return (
    <UserPlanContext.Provider value={{ userPlan, isLoading, refreshPlan }}>
      {children}
    </UserPlanContext.Provider>
  );
};

export const useUserPlan = () => useContext(UserPlanContext);

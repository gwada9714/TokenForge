import { useState, useEffect, useCallback } from "react";
import {
  useContractRead,
  useContractWrite,
  useAccount,
  usePublicClient,
} from "wagmi";
import { useNetwork } from "/useNetwork";
import { parseEther, formatEther } from "ethers";
import { toast } from "react-hot-toast";
import { CONTRACT_ADDRESSES, getContractAddress } from "@/config/contracts";
import { PremiumService, ServiceSubscription } from "@/types/premium";
import TokenForgePremiumServicesABI from "@/abi/TokenForgePremiumServices.json";
import TokenForgePlansABI from "@/abi/TokenForgePlans.json";

export const useTokenForgePremium = () => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const publicClient = usePublicClient();
  const [services, setServices] = useState<PremiumService[]>([]);
  const [userSubscriptions, setUserSubscriptions] = useState<
    Record<string, ServiceSubscription>
  >({});
  const [isLoading, setIsLoading] = useState(true);

  const premiumServicesAddress = getContractAddress(
    "PREMIUM_SERVICES",
    chain?.id || 1
  );
  const plansAddress = getContractAddress("TOKEN_FORGE_PLANS", chain?.id || 1);

  // Lecture des services disponibles
  const { data: servicesData } = useContractRead({
    address: premiumServicesAddress as `0x${string}`,
    abi: TokenForgePremiumServicesABI,
    functionName: "getServices",
    watch: true,
  });

  // Lecture du plan de l'utilisateur
  const { data: userPlan } = useContractRead({
    address: plansAddress as `0x${string}`,
    abi: TokenForgePlansABI,
    functionName: "getUserPlan",
    args: [address || "0x0"],
    watch: true,
  });

  // Souscription à un service
  const { writeAsync: subscribe } = useContractWrite({
    address: premiumServicesAddress as `0x${string}`,
    abi: TokenForgePremiumServicesABI,
    functionName: "subscribeToService",
  });

  // Calcul du coût d'un service
  const calculateServiceCost = useCallback(
    (serviceId: string, months: number) => {
      if (!servicesData) return BigInt(0);
      const service = (servicesData as any[]).find((s) => s.id === serviceId);
      if (!service) return BigInt(0);

      const basePrice = BigInt(service.pricing.basePrice.toString());
      const setupFee = BigInt(service.pricing.setupFee.toString());
      const monthlyFeeBase = BigInt(service.pricing.monthlyFee.toString());
      const monthlyTotal = monthlyFeeBase * BigInt(months);

      return basePrice + setupFee + monthlyTotal;
    },
    [servicesData]
  );

  // Souscription à un service
  const subscribeToService = useCallback(
    async (serviceId: string, months: number) => {
      try {
        const cost = calculateServiceCost(serviceId, months);
        if (cost === BigInt(0)) throw new Error("Service non disponible");

        const { hash } = await subscribe({
          args: [serviceId, months],
          value: cost,
        });

        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        if (receipt.status === "success") {
          toast.success("Souscription réussie !");
        } else {
          throw new Error("La transaction a échoué");
        }
      } catch (error) {
        console.error("Erreur lors de la souscription:", error);
        toast.error("Erreur lors de la souscription");
        throw error;
      }
    },
    [subscribe, calculateServiceCost, publicClient]
  );

  // Mise à jour des données des services
  useEffect(() => {
    if (servicesData) {
      const formattedServices: PremiumService[] = (servicesData as any[]).map(
        (service) => ({
          id: service.id,
          name: service.name,
          description: service.description,
          pricing: {
            basePrice: BigInt(service.pricing.basePrice.toString()),
            setupFee: BigInt(service.pricing.setupFee.toString()),
            monthlyFee: BigInt(service.pricing.monthlyFee.toString()),
          },
          features: service.features,
          isActive: service.isActive,
        })
      );
      setServices(formattedServices);
      setIsLoading(false);
    }
  }, [servicesData]);

  // Mise à jour des abonnements de l'utilisateur
  useEffect(() => {
    const fetchUserSubscriptions = async () => {
      if (!address || !services.length || !premiumServicesAddress) return;

      const subscriptions: Record<string, ServiceSubscription> = {};
      for (const service of services) {
        try {
          const data = await publicClient.readContract({
            address: premiumServicesAddress,
            abi: TokenForgePremiumServicesABI,
            functionName: "userSubscriptions",
            args: [address, service.id],
          });

          const [startTime, endTime, isActive] = data as [
            bigint,
            bigint,
            boolean
          ];
          subscriptions[service.id] = {
            startTime: Number(startTime) * 1000,
            endTime: Number(endTime) * 1000,
            isActive,
          };
        } catch (error) {
          console.error(
            `Erreur lors de la récupération de l'abonnement pour ${service.id}:`,
            error
          );
        }
      }
      setUserSubscriptions(subscriptions);
    };

    fetchUserSubscriptions();
  }, [address, services, premiumServicesAddress, publicClient]);

  return {
    services,
    userSubscriptions,
    isLoading,
    subscribeToService,
    calculateServiceCost,
    userPlan: userPlan ? Number(userPlan) : undefined,
  };
};

import { vi } from "vitest";
import { Service, ServiceType } from "../types";

export const MOCK_SERVICES: Service[] = [
  {
    id: ServiceType.LAUNCHPAD,
    name: "Launchpad",
    description: "Service de lancement de tokens",
    price: {
      baseFee: 1,
      currency: "ETH",
      percentageFee: 2.5,
    },
    features: [
      {
        id: "feature-1",
        name: "Vesting",
        description: "Gestion du vesting des tokens",
      },
      {
        id: "feature-2",
        name: "Whitelist",
        description: "Gestion de la whitelist",
      },
    ],
    networks: ["Ethereum", "Polygon"],
  },
  {
    id: ServiceType.STAKING,
    name: "Staking",
    description: "Service de staking",
    price: {
      baseFee: 0.5,
      currency: "ETH",
    },
    features: [
      {
        id: "feature-3",
        name: "Récompenses",
        description: "Distribution des récompenses",
      },
      {
        id: "feature-4",
        name: "Verrouillage",
        description: "Période de verrouillage flexible",
      },
    ],
    networks: ["Ethereum", "Polygon", "BSC"],
  },
];

export const mockServiceConfig = {
  SERVICES: MOCK_SERVICES,
  getServiceById: (id: ServiceType) => MOCK_SERVICES.find((s) => s.id === id),
  calculateServicePrice: (service: Service, amount?: number) => {
    const baseAmount = service.price.baseFee;
    const percentageFee = service.price.percentageFee || 0;
    return amount ? baseAmount + (amount * percentageFee) / 100 : baseAmount;
  },
  isServiceAvailableOnNetwork: (service: Service, networkName: string) =>
    service.networks.includes(networkName),
};

vi.mock("@/features/services/config/services", () => mockServiceConfig);

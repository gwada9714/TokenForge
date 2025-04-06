import React from "react";
import { PaymentNetwork } from "../../services/payment/types/PaymentSession";

interface NetworkSelectorProps {
  selectedNetwork?: PaymentNetwork;
  onSelect: (network: PaymentNetwork) => void;
}

const NETWORK_DETAILS = {
  [PaymentNetwork.ETHEREUM]: {
    name: "Ethereum",
    icon: "🔷",
  },
  [PaymentNetwork.BINANCE]: {
    name: "Binance",
    icon: "🟡",
  },
  [PaymentNetwork.POLYGON]: {
    name: "Polygon",
    icon: "🟣",
  },
  [PaymentNetwork.SOLANA]: {
    name: "Solana",
    icon: "🟢",
  },
};

export const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  selectedNetwork,
  onSelect,
}) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {Object.entries(NETWORK_DETAILS).map(([network, details]) => (
        <button
          key={network}
          onClick={() => onSelect(network as PaymentNetwork)}
          className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all
            ${
              selectedNetwork === network
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-200"
            }
          `}
        >
          <span className="text-2xl">{details.icon}</span>
          <span className="font-medium">{details.name}</span>
        </button>
      ))}
    </div>
  );
};

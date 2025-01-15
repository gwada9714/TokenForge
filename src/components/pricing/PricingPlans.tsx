import React from 'react';
import { useAccount } from 'wagmi';

interface PricingPlan {
  name: string;
  price: string;
  features: string[];
  buttonText: string;
  recommended?: boolean;
}

const plans: PricingPlan[] = [
  {
    name: "Apprenti Forgeron",
    price: "Gratuit",
    features: [
      "Création de token simple sur testnet",
      "Fonctionnalités très limitées",
      "Code non audité"
    ],
    buttonText: "Commencer gratuitement"
  },
  {
    name: "Forgeron",
    price: "0.3 BNB",
    features: [
      "Création de token standard sur mainnet",
      "Fonctionnalités de base",
      "Option de taxe de la forge activable",
      "Support standard"
    ],
    buttonText: "Choisir ce plan",
    recommended: true
  },
  {
    name: "Maître Forgeron",
    price: "1 BNB",
    features: [
      "Création de token avancé sur mainnet",
      "Toutes les fonctionnalités avancées",
      "Audit de sécurité inclus",
      "Support prioritaire",
      "Verrouillage de liquidité facilité"
    ],
    buttonText: "Devenir Maître"
  }
];

export const PricingPlans: React.FC = () => {
  const { address } = useAccount();

  const handlePlanSelection = (planName: string) => {
    if (!address) {
      alert("Veuillez connecter votre portefeuille pour continuer");
      return;
    }
    // TODO: Implémenter la logique de paiement et de sélection de plan
    console.log(`Plan sélectionné: ${planName}`);
  };

  return (
    <div className="py-12 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Choisissez votre Plan de Forge
          </h2>
          <p className="mt-4 text-xl text-gray-300">
            Des solutions adaptées à tous les forgerons
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-lg shadow-lg divide-y divide-gray-700 bg-gray-800 ${
                plan.recommended ? 'ring-2 ring-primary' : ''
              }`}
            >
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-white">{plan.name}</h3>
                <p className="mt-4 text-primary text-3xl">{plan.price}</p>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex">
                      <svg
                        className="flex-shrink-0 w-6 h-6 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="ml-3 text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handlePlanSelection(plan.name)}
                  className="mt-8 w-full bg-primary text-white rounded-md py-2 px-4 hover:bg-primary-dark transition-colors"
                >
                  {plan.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPlans;

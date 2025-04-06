import React from "react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Apprenti Forgeron",
    price: "0",
    features: [
      "Création de tokens ERC-20 basiques",
      "Déploiement sur testnet",
      "Support communautaire",
      "Documentation complète",
    ],
    cta: "Commencer gratuitement",
    highlighted: false,
  },
  {
    name: "Forgeron",
    price: "99",
    features: [
      "Tous les avantages Apprenti",
      "Tokens personnalisables",
      "Multi-chain deployment",
      "Support prioritaire",
      "Audit de sécurité basique",
    ],
    cta: "Choisir ce plan",
    highlighted: true,
  },
  {
    name: "Maître Forgeron",
    price: "299",
    features: [
      "Tous les avantages Forgeron",
      "Tokens avancés (NFT, DeFi)",
      "Audit de sécurité complet",
      "Support dédié 24/7",
      "Personnalisation illimitée",
    ],
    cta: "Contacter les ventes",
    highlighted: false,
  },
];

export const PricingSection: React.FC = () => {
  return (
    <section className="py-24 bg-primary-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
            Choisissez votre Plan de Forge
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Des solutions adaptées à tous les projets, de l'expérimentation à la
            production
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`
                relative bg-white rounded-lg shadow-xl overflow-hidden
                ${plan.highlighted ? "transform scale-105 z-10" : ""}
              `}
            >
              {plan.highlighted && (
                <div className="absolute top-0 inset-x-0 h-2 bg-secondary" />
              )}
              <div className="p-8">
                <h3 className="text-xl font-heading font-bold text-primary mb-4">
                  {plan.name}
                </h3>
                <div className="flex items-baseline mb-8">
                  <span className="text-4xl font-bold">€{plan.price}</span>
                  <span className="ml-2 text-gray-500">/mois</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <svg
                        className="w-5 h-5 text-secondary mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/signup"
                  className={`
                    block w-full py-3 px-6 text-center rounded-md font-medium transition-colors duration-300
                    ${
                      plan.highlighted
                        ? "bg-secondary hover:bg-secondary-light text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-primary"
                    }
                  `}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

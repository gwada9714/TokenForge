import React from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { StyledButton } from "@/components/ui/Button";

const TokenSection: React.FC = () => {
  // Données de tokenomics
  const tokenomicsData = [
    { name: "Réserve Communautaire", value: 30, color: "#182038" },
    { name: "Équipe & Conseillers", value: 20, color: "#2A3352" },
    { name: "Marketing", value: 15, color: "#D97706" },
    { name: "Développement", value: 20, color: "#F59E0B" },
    { name: "Liquidité", value: 15, color: "#B45309" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Motif de fond */}
      <div className="absolute inset-0 bg-[url('/token-pattern.svg')] opacity-5" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
      >
        {/* En-tête de section */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-6">
            Token <span className="text-secondary">$TKN</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Le cœur de notre écosystème, conçu pour récompenser la communauté et
            alimenter l'innovation
          </p>
        </motion.div>

        {/* Grille principale */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Graphique Tokenomics */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <h3 className="text-2xl font-heading font-bold text-primary mb-6">
              Distribution des Tokens
            </h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tokenomicsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={150}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {tokenomicsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              {tokenomicsData.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-2"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">
                    {item.name} ({item.value}%)
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Caractéristiques du Token */}
          <motion.div variants={itemVariants} className="space-y-8">
            {[
              {
                title: "Utilité",
                description:
                  "Paiements, staking et gouvernance de la plateforme",
                icon: "💎",
              },
              {
                title: "Mécanisme Déflationniste",
                description: "Brûlage automatique de 2% sur chaque transaction",
                icon: "🔥",
              },
              {
                title: "Staking Rewards",
                description: "Jusqu'à 15% APY pour les stakers",
                icon: "💰",
              },
              {
                title: "Gouvernance",
                description: "Votez sur l'avenir de la plateforme",
                icon: "🏛️",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex items-start space-x-4 bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <span className="text-3xl">{feature.icon}</span>
                <div>
                  <h4 className="text-xl font-heading font-bold text-primary mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Call to Action */}
        <motion.div variants={itemVariants} className="mt-16 text-center">
          <StyledButton
            $variant="primary"
            $size="large"
            className="bg-gradient-to-r from-secondary to-secondary-light hover:from-secondary-light hover:to-secondary transform hover:scale-105 transition-all duration-300"
          >
            Découvrir le Token $TKN
          </StyledButton>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default TokenSection;

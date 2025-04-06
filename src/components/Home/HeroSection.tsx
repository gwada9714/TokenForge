import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export const HeroSection: React.FC = () => {
  return (
    <section className="relative bg-primary overflow-hidden min-h-screen flex items-center">
      {/* Fond abstrait avec effet de forge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.9 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-primary"
      />

      {/* Effet de particules incandescentes avec parallax */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 bg-[url('/patterns/forge-pattern.svg')]"
        style={{
          backgroundSize: "cover",
          transform: "translateZ(-10px)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Titre principal */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-white mb-6 tracking-tight">
            TokenForge : Forgez votre{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-secondary to-secondary-light">
              Avenir Crypto
            </span>
          </h1>

          {/* Sous-titre */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Créez, déployez et gérez vos tokens en toute simplicité. Une
            plateforme complète pour donner vie à vos projets blockchain.
          </motion.p>

          {/* Boutons d'action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center gap-6"
          >
            <Link
              to="/forge"
              className="group inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-lg text-white bg-gradient-to-r from-secondary to-secondary-light hover:from-secondary-light hover:to-secondary transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Commencer à Forger
              <motion.svg
                className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </motion.svg>
            </Link>
            <Link
              to="/discover"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-lg text-white border-2 border-white/80 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm transform hover:scale-105"
            >
              Découvrir la Forge
            </Link>
          </motion.div>

          {/* Statistiques */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-20 grid grid-cols-2 gap-8 md:grid-cols-4"
          >
            {[
              { value: "10K+", label: "Tokens Créés" },
              { value: "5M+", label: "Volume Total" },
              { value: "50+", label: "Chaînes Supportées" },
              { value: "100%", label: "Sécurisé" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                className="flex flex-col items-center p-4 rounded-lg backdrop-blur-sm bg-white/5"
              >
                <span className="text-3xl font-bold text-secondary">
                  {stat.value}
                </span>
                <span className="text-sm text-gray-300 mt-1">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

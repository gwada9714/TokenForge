import React from 'react';
import { Link } from 'react-router-dom';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative bg-primary overflow-hidden">
      {/* Fond abstrait avec effet de forge */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-primary opacity-90" />
      
      {/* Effet de particules incandescentes */}
      <div className="absolute inset-0 bg-[url('/patterns/forge-pattern.svg')] opacity-10" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center">
          {/* Titre principal */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-6">
            TokenForge : Forgez votre{' '}
            <span className="text-secondary">Avenir Crypto</span>
          </h1>

          {/* Sous-titre */}
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Créez, déployez et gérez vos tokens en toute simplicité. Une plateforme complète pour donner vie à vos projets blockchain.
          </p>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
            <Link
              to="/forge"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-secondary hover:bg-secondary-light transition-colors duration-300"
            >
              Commencer à Forger
              <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            <Link
              to="/discover"
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-primary transition-colors duration-300"
            >
              Découvrir la Forge
            </Link>
          </div>

          {/* Statistiques */}
          <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: '10K+', label: 'Tokens Créés' },
              { value: '5M+', label: 'Volume Total' },
              { value: '50+', label: 'Blockchains' },
              { value: '100%', label: 'Sécurisé' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <dt className="text-2xl md:text-3xl font-bold text-secondary">
                  {stat.value}
                </dt>
                <dd className="mt-2 text-sm text-gray-300">
                  {stat.label}
                </dd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
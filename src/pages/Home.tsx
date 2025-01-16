import React from 'react';
import { HeroSection } from '../components/Home/HeroSection';
import { FeaturesSection } from '../components/Home/FeaturesSection';
import { PricingSection } from '../components/Home/PricingSection';

const Home: React.FC = () => {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      
      {/* Section Communauté */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-8">
            Rejoignez la Communauté des Forgerons
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12">
            Échangez avec d'autres créateurs, partagez vos expériences et restez informé des dernières innovations dans l'écosystème TokenForge.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <a
              href="https://discord.gg/tokenforge"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-6 bg-background rounded-lg hover:shadow-lg transition-shadow"
            >
              <svg className="w-12 h-12 text-[#7289DA] mb-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              <h3 className="text-xl font-heading font-semibold mb-2">Discord</h3>
              <p className="text-gray-600">Rejoignez les discussions</p>
            </a>
            <a
              href="https://t.me/tokenforge"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-6 bg-background rounded-lg hover:shadow-lg transition-shadow"
            >
              <svg className="w-12 h-12 text-[#0088cc] mb-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              <h3 className="text-xl font-heading font-semibold mb-2">Telegram</h3>
              <p className="text-gray-600">Suivez les actualités</p>
            </a>
            <a
              href="https://twitter.com/tokenforge"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-6 bg-background rounded-lg hover:shadow-lg transition-shadow"
            >
              <svg className="w-12 h-12 text-[#1DA1F2] mb-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              <h3 className="text-xl font-heading font-semibold mb-2">Twitter</h3>
              <p className="text-gray-600">Restez connecté</p>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
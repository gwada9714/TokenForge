import React from 'react';
import { SEOHead } from '@/components';

export const AboutPage: React.FC = () => {
    return (
        <>
            <SEOHead
                title="À Propos de TokenForge - Notre Vision et Notre Équipe"
                description="Découvrez l'histoire de TokenForge, notre mission de démocratisation de la création de tokens, et rencontrez l'équipe derrière la plateforme."
            />

            <main className="container mx-auto px-4 py-8">
                <section className="mb-12">
                    <h1 className="text-3xl font-bold mb-6">À Propos de TokenForge</h1>
                    <div className="prose max-w-none">
                        <p className="text-lg mb-4">
                            TokenForge est né d'une vision simple : rendre la création et le déploiement de tokens accessibles à tous,
                            quelle que soit leur expertise technique.
                        </p>
                        <p className="mb-6">
                            Notre plateforme combine simplicité d'utilisation, sécurité avancée et tarifs compétitifs pour
                            démocratiser l'accès à la technologie blockchain.
                        </p>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">Notre Vision et Mission</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold mb-3">Vision</h3>
                            <p>
                                Un monde où la création de tokens est aussi simple que la création d'un site web,
                                permettant à chacun de participer à l'économie décentralisée.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold mb-3">Mission</h3>
                            <p>
                                Démocratiser la création de tokens en fournissant des outils simples, sécurisés et abordables,
                                tout en éduquant les utilisateurs sur les meilleures pratiques.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">Notre Équipe</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Exemples de membres d'équipe - à remplacer par les vrais membres */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
                            <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-4">
                                <img src="/images/team/founder.jpg" alt="Fondateur" className="w-full h-full object-cover" />
                            </div>
                            <h3 className="text-xl font-semibold">Alexandre Martin</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Fondateur & CEO</p>
                            <p className="text-sm mb-3">
                                Expert blockchain avec 8 ans d'expérience dans le développement de smart contracts.
                            </p>
                            <div className="flex justify-center space-x-3">
                                <a href="#" className="text-blue-600 hover:text-blue-800">
                                    <span className="sr-only">LinkedIn</span>
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-600 hover:text-gray-800">
                                    <span className="sr-only">GitHub</span>
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
                            <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-4">
                                <img src="/images/team/cto.jpg" alt="CTO" className="w-full h-full object-cover" />
                            </div>
                            <h3 className="text-xl font-semibold">Sophie Dubois</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">CTO</p>
                            <p className="text-sm mb-3">
                                Architecte blockchain spécialisée en sécurité et optimisation des smart contracts.
                            </p>
                            <div className="flex justify-center space-x-3">
                                <a href="#" className="text-blue-600 hover:text-blue-800">
                                    <span className="sr-only">LinkedIn</span>
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-600 hover:text-gray-800">
                                    <span className="sr-only">GitHub</span>
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
                            <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-4">
                                <img src="/images/team/cpo.jpg" alt="CPO" className="w-full h-full object-cover" />
                            </div>
                            <h3 className="text-xl font-semibold">Thomas Leroy</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">CPO</p>
                            <p className="text-sm mb-3">
                                Expert en UX/UI avec une passion pour rendre les technologies complexes accessibles à tous.
                            </p>
                            <div className="flex justify-center space-x-3">
                                <a href="#" className="text-blue-600 hover:text-blue-800">
                                    <span className="sr-only">LinkedIn</span>
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-600 hover:text-gray-800">
                                    <span className="sr-only">GitHub</span>
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">Notre Histoire</h2>
                    <div className="relative border-l-4 border-blue-500 pl-6 ml-6">
                        <div className="mb-8 relative">
                            <div className="absolute -left-10 mt-1.5 h-4 w-4 rounded-full bg-blue-500"></div>
                            <h3 className="text-xl font-semibold">2022 - Lancement de l'idée</h3>
                            <p className="text-gray-700 dark:text-gray-300 mt-2">
                                Frustré par la complexité et le coût élevé des solutions existantes, notre fondateur
                                a commencé à développer un prototype de TokenForge.
                            </p>
                        </div>
                        <div className="mb-8 relative">
                            <div className="absolute -left-10 mt-1.5 h-4 w-4 rounded-full bg-blue-500"></div>
                            <h3 className="text-xl font-semibold">2023 - Première version beta</h3>
                            <p className="text-gray-700 dark:text-gray-300 mt-2">
                                Après des mois de développement, la première version beta a été lancée,
                                permettant la création de tokens sur Ethereum et BSC.
                            </p>
                        </div>
                        <div className="mb-8 relative">
                            <div className="absolute -left-10 mt-1.5 h-4 w-4 rounded-full bg-blue-500"></div>
                            <h3 className="text-xl font-semibold">2024 - Lancement officiel</h3>
                            <p className="text-gray-700 dark:text-gray-300 mt-2">
                                TokenForge est officiellement lancé avec le support de 6 blockchains et
                                des fonctionnalités avancées de sécurité et de tokenomics.
                            </p>
                        </div>
                        <div className="relative">
                            <div className="absolute -left-10 mt-1.5 h-4 w-4 rounded-full bg-blue-500"></div>
                            <h3 className="text-xl font-semibold">2025 - Expansion et innovation</h3>
                            <p className="text-gray-700 dark:text-gray-300 mt-2">
                                Aujourd'hui, nous continuons d'innover avec de nouvelles fonctionnalités,
                                plus de blockchains supportées et une communauté grandissante.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">Nos Engagements</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold mb-3">Sécurité</h3>
                            <p className="mb-4">
                                Nous nous engageons à fournir les solutions les plus sécurisées possibles,
                                avec des audits réguliers et des mécanismes anti-rugpull intégrés.
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Audits de sécurité par des tiers indépendants</li>
                                <li>Mécanismes anti-rugpull par défaut</li>
                                <li>Protection contre les attaques courantes</li>
                                <li>Mises à jour de sécurité régulières</li>
                            </ul>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold mb-3">Transparence</h3>
                            <p className="mb-4">
                                Nous croyons en une transparence totale sur nos opérations, nos tarifs et
                                les fonctionnalités de notre plateforme.
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Tarification claire sans frais cachés</li>
                                <li>Code source ouvert pour les composants critiques</li>
                                <li>Rapports trimestriels sur l'état de la plateforme</li>
                                <li>Communication ouverte avec la communauté</li>
                            </ul>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
};

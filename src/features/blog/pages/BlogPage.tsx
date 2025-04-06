import React, { useState } from "react";
import { Link } from "react-router-dom";
import { SEOHead } from "@/components";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  category: string;
  image: string;
  readTime: number;
}

export const BlogPage: React.FC = () => {
  // Données simulées des articles de blog
  const [blogPosts] = useState<BlogPost[]>([
    {
      id: "1",
      title: "Comment créer un token ERC-20 en 10 minutes",
      excerpt:
        "Un guide étape par étape pour créer votre propre token ERC-20 sur Ethereum sans connaissances techniques préalables.",
      date: "2025-02-15",
      author: "Jean Dupont",
      category: "Tutoriels",
      image: "/images/blog/erc20-creation.jpg",
      readTime: 8,
    },
    {
      id: "2",
      title: "Les meilleures pratiques de tokenomics pour 2025",
      excerpt:
        "Découvrez les stratégies de tokenomics qui fonctionnent le mieux dans le marché actuel et comment les appliquer à votre projet.",
      date: "2025-02-10",
      author: "Marie Martin",
      category: "Tokenomics",
      image: "/images/blog/tokenomics-best-practices.jpg",
      readTime: 12,
    },
    {
      id: "3",
      title: "Sécuriser votre token : Guide anti-rugpull complet",
      excerpt:
        "Protégez votre communauté et votre réputation avec ces mécanismes anti-rugpull essentiels pour tout projet de token.",
      date: "2025-02-05",
      author: "Alexandre Lefebvre",
      category: "Sécurité",
      image: "/images/blog/anti-rugpull.jpg",
      readTime: 10,
    },
    {
      id: "4",
      title: "Comparatif des blockchains pour le déploiement de tokens en 2025",
      excerpt:
        "Ethereum, BSC, Polygon, Avalanche, Solana ou Arbitrum ? Quelle blockchain choisir pour votre token ?",
      date: "2025-01-28",
      author: "Sophie Dubois",
      category: "Blockchain",
      image: "/images/blog/blockchain-comparison.jpg",
      readTime: 15,
    },
    {
      id: "5",
      title: "Comment lancer votre token avec un budget limité",
      excerpt:
        "Stratégies et astuces pour lancer votre token avec succès même avec des ressources financières limitées.",
      date: "2025-01-20",
      author: "Thomas Bernard",
      category: "Stratégie",
      image: "/images/blog/launch-budget.jpg",
      readTime: 9,
    },
  ]);

  const [activeCategory, setActiveCategory] = useState<string>("Tous");
  const categories = [
    "Tous",
    "Tutoriels",
    "Tokenomics",
    "Sécurité",
    "Blockchain",
    "Stratégie",
  ];

  // Filtrer les articles par catégorie
  const filteredPosts =
    activeCategory === "Tous"
      ? blogPosts
      : blogPosts.filter((post) => post.category === activeCategory);

  // Formater la date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  return (
    <>
      <SEOHead
        title="Blog & Ressources - TokenForge"
        description="Découvrez nos articles, tutoriels et analyses sur la création de tokens, la tokenomics et les meilleures pratiques blockchain."
      />

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">
              Blog & Ressources
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400 sm:mt-4">
              Découvrez nos derniers articles, tutoriels et analyses sur la
              création de tokens et la blockchain
            </p>
          </div>

          {/* Filtres par catégorie */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  activeCategory === category
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Liste des articles */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <Link to={`/blog/${post.id}`}>
                  <div className="h-48 bg-gray-300 dark:bg-gray-700 relative">
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400">
                      <span>Image: {post.image}</span>
                    </div>
                  </div>
                </Link>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                      {post.category}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {post.readTime} min de lecture
                    </span>
                  </div>
                  <Link to={`/blog/${post.id}`}>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400">
                      {post.title}
                    </h2>
                  </Link>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Par {post.author}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(post.date)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-12 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button className="px-3 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                Précédent
              </button>
              <button className="px-3 py-2 rounded-md bg-blue-600 text-white font-medium">
                1
              </button>
              <button className="px-3 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                2
              </button>
              <button className="px-3 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                3
              </button>
              <button className="px-3 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                Suivant
              </button>
            </nav>
          </div>

          {/* Newsletter */}
          <div className="mt-16 bg-blue-50 dark:bg-blue-900/30 rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Restez informé des dernières actualités
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Inscrivez-vous à notre newsletter pour recevoir nos derniers
                articles et mises à jour
              </p>
              <div className="mt-4 flex max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Votre adresse email"
                  className="flex-1 min-w-0 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-l-md text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  S'inscrire
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

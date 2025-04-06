import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { SEOHead } from "@/components";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  authorTitle: string;
  authorImage: string;
  category: string;
  image: string;
  readTime: number;
  tags: string[];
}

export const BlogPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simuler le chargement d'un article de blog
  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        // Simuler un appel API
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Données simulées pour l'article
        const mockPost: BlogPost = {
          id: id || "1",
          title: "Comment créer un token ERC-20 en 10 minutes",
          content: `
            <p class="lead">La création d'un token ERC-20 sur Ethereum est souvent perçue comme une tâche complexe nécessitant des connaissances approfondies en développement blockchain. Avec TokenForge, ce processus devient accessible à tous, même sans expérience technique préalable.</p>
            
            <h2>Qu'est-ce qu'un token ERC-20 ?</h2>
            <p>Le standard ERC-20 est une norme technique utilisée pour les smart contracts sur la blockchain Ethereum, créant et gérant des tokens fongibles. Ces tokens peuvent représenter pratiquement n'importe quoi dans Ethereum : des actions, des droits de vote, des points de fidélité, etc.</p>
            
            <h2>Étape 1 : Préparer votre projet</h2>
            <p>Avant de commencer, assurez-vous d'avoir défini clairement l'objectif de votre token. Posez-vous les questions suivantes :</p>
            <ul>
              <li>Quel est le cas d'utilisation de votre token ?</li>
              <li>Quelle sera la supply totale ?</li>
              <li>Avez-vous besoin de fonctionnalités spéciales comme le minting ou le burning ?</li>
              <li>Comment sera distribuée la supply initiale ?</li>
            </ul>
            
            <h2>Étape 2 : Configurer votre token sur TokenForge</h2>
            <p>Connectez-vous à votre compte TokenForge et suivez ces étapes :</p>
            <ol>
              <li>Cliquez sur "Créer un token" dans le dashboard</li>
              <li>Sélectionnez "Ethereum" comme blockchain</li>
              <li>Choisissez le standard "ERC-20"</li>
              <li>Remplissez les informations de base : nom, symbole, décimales (généralement 18)</li>
              <li>Définissez la supply initiale et maximale</li>
            </ol>
            
            <h2>Étape 3 : Ajouter des fonctionnalités avancées</h2>
            <p>TokenForge vous permet d'ajouter facilement des fonctionnalités avancées à votre token :</p>
            <ul>
              <li><strong>Mintable</strong> : Possibilité de créer de nouveaux tokens après le déploiement</li>
              <li><strong>Burnable</strong> : Possibilité de détruire des tokens</li>
              <li><strong>Pausable</strong> : Option pour suspendre temporairement les transferts</li>
              <li><strong>Capped</strong> : Limite stricte sur la supply maximale</li>
            </ul>
            
            <h2>Étape 4 : Configurer la sécurité</h2>
            <p>La sécurité est primordiale dans les projets blockchain. TokenForge offre plusieurs options :</p>
            <ul>
              <li>Protection anti-whale pour limiter les transactions massives</li>
              <li>Timelock pour les fonctions administratives</li>
              <li>Multisignature pour les actions critiques</li>
              <li>Verrouillage de liquidité automatisé</li>
            </ul>
            
            <h2>Étape 5 : Prévisualiser et déployer</h2>
            <p>Avant le déploiement final :</p>
            <ol>
              <li>Vérifiez tous les paramètres dans l'écran de prévisualisation</li>
              <li>Examinez le code du smart contract généré</li>
              <li>Confirmez les frais de déploiement (gas + frais de service)</li>
              <li>Cliquez sur "Déployer" et signez la transaction avec votre wallet</li>
            </ol>
            
            <h2>Conclusion</h2>
            <p>Félicitations ! Vous venez de créer votre propre token ERC-20 en quelques minutes seulement. TokenForge simplifie considérablement ce processus, vous permettant de vous concentrer sur le développement de votre projet plutôt que sur les complexités techniques.</p>
            
            <p>N'oubliez pas que la création du token n'est que la première étape. Pensez maintenant à la stratégie de lancement, à la création de liquidité et au marketing pour assurer le succès de votre projet.</p>
          `,
          date: "2025-02-15",
          author: "Jean Dupont",
          authorTitle: "Expert Blockchain & Développeur Ethereum",
          authorImage: "/images/team/jean-dupont.jpg",
          category: "Tutoriels",
          image: "/images/blog/erc20-creation.jpg",
          readTime: 8,
          tags: [
            "Ethereum",
            "ERC-20",
            "Smart Contracts",
            "Débutant",
            "Tutoriel",
          ],
        };

        setPost(mockPost);
      } catch (err) {
        setError(
          "Impossible de charger l'article. Veuillez réessayer plus tard."
        );
        console.error("Error fetching post:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  // Formater la date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="text-red-500 text-xl mb-4">
          {error || "Article non trouvé"}
        </div>
        <Link
          to="/blog"
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Retour aux articles
        </Link>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`${post.title} - TokenForge Blog`}
        description={`${post.content
          .substring(0, 150)
          .replace(/<[^>]*>/g, "")}...`}
      />

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Fil d'Ariane */}
          <div className="mb-8">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link
                    to="/"
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    Accueil
                  </Link>
                </li>
                <li className="flex items-center">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <Link
                    to="/blog"
                    className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    Blog
                  </Link>
                </li>
                <li className="flex items-center">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span
                    className="ml-2 text-gray-700 dark:text-gray-300"
                    aria-current="page"
                  >
                    {post.title}
                  </span>
                </li>
              </ol>
            </nav>
          </div>

          {/* En-tête de l'article */}
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center text-gray-600 dark:text-gray-400 gap-4 mb-6">
              <span className="flex items-center">
                <svg
                  className="h-5 w-5 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                {formatDate(post.date)}
              </span>
              <span className="flex items-center">
                <svg
                  className="h-5 w-5 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                {post.readTime} min de lecture
              </span>
              <span className="flex items-center">
                <svg
                  className="h-5 w-5 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
                {post.category}
              </span>
            </div>
            <div className="h-64 md:h-96 bg-gray-300 dark:bg-gray-700 rounded-lg relative mb-8">
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <span>Image: {post.image}</span>
              </div>
            </div>
          </div>

          {/* Contenu de l'article */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            <div className="lg:col-span-3">
              <article className="prose prose-lg dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              </article>

              {/* Tags */}
              <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Partage */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Partager cet article
                </h3>
                <div className="flex space-x-4">
                  <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </button>
                  <button className="p-2 bg-blue-400 text-white rounded-full hover:bg-blue-500">
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </button>
                  <button className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700">
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20 3H4a1 1 0 00-1 1v16a1 1 0 001 1h16a1 1 0 001-1V4a1 1 0 00-1-1zM8.339 18.337H5.667v-8.59h2.672v8.59zM7.003 8.574a1.548 1.548 0 110-3.096 1.548 1.548 0 010 3.096zm11.335 9.763h-2.669V14.16c0-.996-.018-2.277-1.388-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248h-2.667v-8.59h2.56v1.174h.037c.355-.675 1.227-1.387 2.524-1.387 2.704 0 3.203 1.778 3.203 4.092v4.71z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Auteur */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  À propos de l'auteur
                </h3>
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-700 mr-4"></div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {post.author}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {post.authorTitle}
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Expert en blockchain et développement Ethereum avec plus de 5
                  ans d'expérience dans la création et l'audit de smart
                  contracts.
                </p>
              </div>

              {/* Articles connexes */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Articles connexes
                </h3>
                <div className="space-y-4">
                  <div>
                    <Link
                      to="/blog/2"
                      className="block font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      Les meilleures pratiques de tokenomics pour 2025
                    </Link>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      15 Février 2025
                    </p>
                  </div>
                  <div>
                    <Link
                      to="/blog/3"
                      className="block font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      Sécuriser votre token : Guide anti-rugpull complet
                    </Link>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      5 Février 2025
                    </p>
                  </div>
                  <div>
                    <Link
                      to="/blog/4"
                      className="block font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      Comparatif des blockchains pour le déploiement de tokens
                    </Link>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      28 Janvier 2025
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation entre articles */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                Article précédent
              </span>
              <Link
                to="/blog/2"
                className="text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
              >
                Les meilleures pratiques de tokenomics pour 2025
              </Link>
            </div>
            <div className="text-right">
              <span className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                Article suivant
              </span>
              <Link
                to="/blog/3"
                className="text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
              >
                Sécuriser votre token : Guide anti-rugpull complet
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

import React, { useState } from "react";
import { SEOHead } from "@/components";

export const LegalTemplateLibraryPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedJurisdiction, setSelectedJurisdiction] = useState("all");

  // Catégories de documents
  const categories = [
    { id: "all", name: "Toutes les catégories" },
    { id: "token-sale", name: "Vente de tokens" },
    { id: "governance", name: "Gouvernance" },
    { id: "compliance", name: "Conformité réglementaire" },
    { id: "privacy", name: "Protection des données" },
    { id: "intellectual-property", name: "Propriété intellectuelle" },
    { id: "terms", name: "Conditions d'utilisation" },
  ];

  // Juridictions
  const jurisdictions = [
    { id: "all", name: "Toutes les juridictions" },
    { id: "eu", name: "Union Européenne" },
    { id: "us", name: "États-Unis" },
    { id: "uk", name: "Royaume-Uni" },
    { id: "ch", name: "Suisse" },
    { id: "sg", name: "Singapour" },
    { id: "global", name: "International" },
  ];

  // Interface pour les modèles de documents
  interface LegalTemplate {
    id: string;
    title: string;
    description: string;
    category: string;
    jurisdiction: string;
    lastUpdated: string;
    format: "PDF" | "DOCX" | "MD";
    premium: boolean;
    downloadCount: number;
    tags: string[];
    previewUrl: string;
    downloadUrl: string;
  }

  // Liste des modèles de documents (données simulées)
  const legalTemplates: LegalTemplate[] = [
    {
      id: "1",
      title: "Conditions Générales de Vente de Tokens",
      description:
        "Modèle complet de conditions générales pour la vente de tokens, incluant les clauses de limitation de responsabilité, de KYC/AML et de restrictions géographiques.",
      category: "token-sale",
      jurisdiction: "eu",
      lastUpdated: "2025-01-15",
      format: "DOCX",
      premium: false,
      downloadCount: 1250,
      tags: ["ICO", "STO", "Vente de tokens", "Conditions générales"],
      previewUrl: "/templates/preview/token-sale-terms-eu.pdf",
      downloadUrl: "/templates/download/token-sale-terms-eu.docx",
    },
    {
      id: "2",
      title: "Contrat de Gouvernance DAO",
      description:
        "Modèle de contrat pour la mise en place d'une structure de gouvernance décentralisée (DAO), définissant les droits de vote, les processus de proposition et les mécanismes de décision.",
      category: "governance",
      jurisdiction: "global",
      lastUpdated: "2025-02-10",
      format: "DOCX",
      premium: true,
      downloadCount: 875,
      tags: ["DAO", "Gouvernance", "Voting", "Décentralisation"],
      previewUrl: "/templates/preview/dao-governance-global.pdf",
      downloadUrl: "/templates/download/dao-governance-global.docx",
    },
    {
      id: "3",
      title: "Politique de Conformité KYC/AML",
      description:
        "Document détaillant les procédures de Know Your Customer (KYC) et Anti-Money Laundering (AML) conformes aux réglementations européennes, incluant AMLD5 et MiCA.",
      category: "compliance",
      jurisdiction: "eu",
      lastUpdated: "2025-02-28",
      format: "DOCX",
      premium: true,
      downloadCount: 950,
      tags: ["KYC", "AML", "Conformité", "MiCA", "AMLD5"],
      previewUrl: "/templates/preview/kyc-aml-policy-eu.pdf",
      downloadUrl: "/templates/download/kyc-aml-policy-eu.docx",
    },
    {
      id: "4",
      title: "Politique de Protection des Données pour Projets Blockchain",
      description:
        "Politique de confidentialité conforme au RGPD pour les projets blockchain, abordant les spécificités liées à l'immuabilité des données et aux transactions pseudonymes.",
      category: "privacy",
      jurisdiction: "eu",
      lastUpdated: "2025-01-20",
      format: "DOCX",
      premium: false,
      downloadCount: 1450,
      tags: ["RGPD", "Privacy", "Protection des données", "Blockchain"],
      previewUrl: "/templates/preview/gdpr-blockchain-policy.pdf",
      downloadUrl: "/templates/download/gdpr-blockchain-policy.docx",
    },
    {
      id: "5",
      title: "Contrat de Licence pour NFT",
      description:
        "Modèle de contrat de licence définissant les droits accordés aux acheteurs de NFT, incluant les droits d'utilisation, de revente et de propriété intellectuelle.",
      category: "intellectual-property",
      jurisdiction: "global",
      lastUpdated: "2025-02-05",
      format: "DOCX",
      premium: true,
      downloadCount: 2100,
      tags: ["NFT", "Licence", "IP", "Droits d'auteur"],
      previewUrl: "/templates/preview/nft-license-agreement.pdf",
      downloadUrl: "/templates/download/nft-license-agreement.docx",
    },
    {
      id: "6",
      title: "Conditions d'Utilisation de Plateforme DeFi",
      description:
        "Conditions d'utilisation pour les plateformes DeFi, couvrant les risques spécifiques, les responsabilités des utilisateurs et les clauses de limitation de responsabilité.",
      category: "terms",
      jurisdiction: "global",
      lastUpdated: "2025-01-30",
      format: "DOCX",
      premium: false,
      downloadCount: 1850,
      tags: ["DeFi", "Terms of Service", "Risques", "Responsabilité"],
      previewUrl: "/templates/preview/defi-platform-terms.pdf",
      downloadUrl: "/templates/download/defi-platform-terms.docx",
    },
    {
      id: "7",
      title: "Whitepaper Disclosure Template",
      description:
        "Modèle de divulgation des risques et des informations réglementaires à inclure dans un whitepaper de projet blockchain, conforme aux exigences de la SEC.",
      category: "compliance",
      jurisdiction: "us",
      lastUpdated: "2025-02-15",
      format: "DOCX",
      premium: true,
      downloadCount: 780,
      tags: ["Whitepaper", "Disclosure", "SEC", "Risques"],
      previewUrl: "/templates/preview/whitepaper-disclosure-us.pdf",
      downloadUrl: "/templates/download/whitepaper-disclosure-us.docx",
    },
    {
      id: "8",
      title: "Contrat de Développement de Smart Contract",
      description:
        "Modèle de contrat pour l'engagement d'un développeur ou d'une équipe pour créer des smart contracts, incluant les clauses de propriété intellectuelle, de garantie et de responsabilité.",
      category: "intellectual-property",
      jurisdiction: "global",
      lastUpdated: "2025-01-25",
      format: "DOCX",
      premium: true,
      downloadCount: 650,
      tags: ["Smart Contract", "Développement", "Contrat de service", "IP"],
      previewUrl: "/templates/preview/smart-contract-dev-agreement.pdf",
      downloadUrl: "/templates/download/smart-contract-dev-agreement.docx",
    },
  ];

  // Filtrer les modèles en fonction de la recherche, de la catégorie et de la juridiction
  const filteredTemplates = legalTemplates.filter((template) => {
    const matchesSearch =
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "all" || template.category === selectedCategory;
    const matchesJurisdiction =
      selectedJurisdiction === "all" ||
      template.jurisdiction === selectedJurisdiction;

    return matchesSearch && matchesCategory && matchesJurisdiction;
  });

  return (
    <>
      <SEOHead
        title="Bibliothèque de Modèles Juridiques - TokenForge"
        description="Accédez à une collection complète de modèles juridiques pour votre projet blockchain, rédigés par des experts et adaptés à différentes juridictions."
      />

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Bibliothèque de Modèles Juridiques
            </h1>
            <p className="mt-1 text-lg text-gray-600 dark:text-gray-400">
              Des modèles juridiques professionnels pour sécuriser votre projet
              blockchain
            </p>
          </div>

          {/* Barre de recherche et filtres */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Rechercher un modèle
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white sm:text-sm"
                    placeholder="Titre, description ou mot-clé..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Catégorie
                </label>
                <select
                  id="category"
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="jurisdiction"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Juridiction
                </label>
                <select
                  id="jurisdiction"
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={selectedJurisdiction}
                  onChange={(e) => setSelectedJurisdiction(e.target.value)}
                >
                  {jurisdictions.map((jurisdiction) => (
                    <option key={jurisdiction.id} value={jurisdiction.id}>
                      {jurisdiction.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Liste des modèles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {template.title}
                      </h3>
                      {template.premium ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                          Premium
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          Gratuit
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {template.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {template.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                      {template.tags.length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          +{template.tags.length - 3}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          Format:{" "}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {template.format}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          Juridiction:{" "}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {jurisdictions.find(
                            (j) => j.id === template.jurisdiction
                          )?.name || template.jurisdiction}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          Mise à jour:{" "}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {template.lastUpdated}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          Téléchargements:{" "}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {template.downloadCount}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <a
                        href={template.previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                      >
                        Aperçu
                      </a>
                      <button
                        className={`px-4 py-2 rounded-md text-white text-sm font-medium ${
                          template.premium
                            ? "bg-purple-600 hover:bg-purple-700"
                            : "bg-blue-600 hover:bg-blue-700"
                        } transition-colors`}
                      >
                        {template.premium ? "Acheter" : "Télécharger"}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                  Aucun modèle trouvé
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Essayez de modifier vos critères de recherche ou de
                  sélectionner une autre catégorie.
                </p>
              </div>
            )}
          </div>

          {/* Services juridiques */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Services juridiques personnalisés
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">
                  Adaptation de modèles
                </h3>
                <p className="text-blue-700 dark:text-blue-200 mb-4">
                  Nos experts juridiques peuvent adapter n'importe quel modèle
                  de notre bibliothèque à vos besoins spécifiques et à votre
                  juridiction.
                </p>
                <ul className="list-disc pl-5 text-blue-700 dark:text-blue-200 space-y-1 mb-4">
                  <li>Personnalisation selon votre modèle d'affaires</li>
                  <li>Adaptation aux spécificités de votre token</li>
                  <li>Conformité avec les réglementations locales</li>
                  <li>Révision par des avocats spécialisés</li>
                </ul>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Demander un devis
                </button>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
                <h3 className="text-lg font-medium text-purple-800 dark:text-purple-300 mb-2">
                  Consultation juridique
                </h3>
                <p className="text-purple-700 dark:text-purple-200 mb-4">
                  Obtenez des conseils juridiques personnalisés de la part
                  d'avocats spécialisés en droit des technologies et de la
                  blockchain.
                </p>
                <ul className="list-disc pl-5 text-purple-700 dark:text-purple-200 space-y-1 mb-4">
                  <li>Consultation initiale de 30 minutes offerte</li>
                  <li>Accès à un réseau d'avocats internationaux</li>
                  <li>Expertise en réglementation crypto</li>
                  <li>Support pour les questions de conformité</li>
                </ul>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                  Prendre rendez-vous
                </button>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Questions fréquentes
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Les modèles sont-ils à jour avec les dernières
                  réglementations?
                </h3>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  Oui, tous nos modèles sont régulièrement mis à jour pour
                  refléter les dernières évolutions réglementaires. La date de
                  dernière mise à jour est indiquée sur chaque modèle.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Puis-je utiliser ces modèles pour mon projet sans consultation
                  juridique?
                </h3>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  Nos modèles sont conçus pour servir de base solide, mais nous
                  recommandons toujours une consultation avec un avocat pour les
                  adapter à votre situation spécifique. Les modèles ne
                  constituent pas un avis juridique.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Quelle est la différence entre les modèles gratuits et
                  premium?
                </h3>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  Les modèles premium sont plus détaillés, couvrent des cas
                  d'usage plus spécifiques et sont rédigés par des cabinets
                  d'avocats de premier plan. Ils incluent également des
                  annotations explicatives et des options alternatives pour
                  différents scénarios.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Dans quels formats les modèles sont-ils disponibles?
                </h3>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  Tous les modèles sont disponibles en format DOCX éditable. Un
                  aperçu en PDF est également disponible pour consultation avant
                  téléchargement ou achat.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Comment puis-je demander un modèle qui n'est pas dans la
                  bibliothèque?
                </h3>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  Vous pouvez contacter notre équipe juridique via le formulaire
                  de contact ou en utilisant l'option "Demander un modèle
                  personnalisé" dans votre espace membre. Nous évaluerons votre
                  demande et vous proposerons une solution adaptée.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LegalTemplateLibraryPage;

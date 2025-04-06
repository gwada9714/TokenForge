import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { SEOHead } from "@/components";

interface LandingPageSection {
  id: string;
  type:
    | "hero"
    | "features"
    | "tokenomics"
    | "roadmap"
    | "team"
    | "faq"
    | "contact";
  title: string;
  enabled: boolean;
  content?: any;
}

interface LandingPageTheme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  darkMode: boolean;
  fontFamily: string;
}

export const LandingPageBuilderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Thèmes disponibles
  const availableThemes: LandingPageTheme[] = [
    {
      id: "modern",
      name: "Moderne",
      primaryColor: "#3B82F6",
      secondaryColor: "#10B981",
      darkMode: false,
      fontFamily: "Inter, sans-serif",
    },
    {
      id: "dark",
      name: "Sombre",
      primaryColor: "#8B5CF6",
      secondaryColor: "#EC4899",
      darkMode: true,
      fontFamily: "Poppins, sans-serif",
    },
    {
      id: "minimal",
      name: "Minimaliste",
      primaryColor: "#111827",
      secondaryColor: "#4B5563",
      darkMode: false,
      fontFamily: "Roboto, sans-serif",
    },
    {
      id: "vibrant",
      name: "Vibrant",
      primaryColor: "#F59E0B",
      secondaryColor: "#EF4444",
      darkMode: false,
      fontFamily: "Montserrat, sans-serif",
    },
  ];

  // Thème sélectionné
  const [selectedTheme, setSelectedTheme] = useState<string>(
    availableThemes[0].id
  );

  // Sections de la landing page
  const [sections, setSections] = useState<LandingPageSection[]>([
    {
      id: "hero",
      type: "hero",
      title: "En-tête",
      enabled: true,
      content: {
        heading: "Découvrez notre token révolutionnaire",
        subheading:
          "Une nouvelle façon de participer à la finance décentralisée",
        ctaText: "Acheter maintenant",
        ctaLink: "#",
        showTokenSymbol: true,
      },
    },
    {
      id: "features",
      type: "features",
      title: "Caractéristiques",
      enabled: true,
      content: {
        heading: "Fonctionnalités principales",
        features: [
          {
            title: "Sécurisé",
            description: "Contrat audité et sécurisé par les meilleurs experts",
            icon: "shield",
          },
          {
            title: "Évolutif",
            description: "Conçu pour évoluer avec les besoins de la communauté",
            icon: "chart",
          },
          {
            title: "Transparent",
            description:
              "Toutes les transactions sont visibles sur la blockchain",
            icon: "eye",
          },
        ],
      },
    },
    {
      id: "tokenomics",
      type: "tokenomics",
      title: "Tokenomics",
      enabled: true,
      content: {
        heading: "Distribution des tokens",
        totalSupply: "1,000,000",
        distribution: [
          { label: "Équipe", percentage: 15, color: "#4C51BF" },
          { label: "Investisseurs", percentage: 20, color: "#2B6CB0" },
          { label: "Réserve", percentage: 10, color: "#2C7A7B" },
          { label: "Liquidité", percentage: 25, color: "#38A169" },
          { label: "Marketing", percentage: 10, color: "#DD6B20" },
          { label: "Communauté", percentage: 20, color: "#C53030" },
        ],
      },
    },
    {
      id: "roadmap",
      type: "roadmap",
      title: "Roadmap",
      enabled: true,
      content: {
        heading: "Notre plan de développement",
        milestones: [
          {
            title: "Q1 2025",
            description: "Lancement du token et listing sur les DEX",
            completed: true,
          },
          {
            title: "Q2 2025",
            description:
              "Développement de la plateforme et partenariats stratégiques",
            completed: false,
          },
          {
            title: "Q3 2025",
            description: "Expansion internationale et listing sur les CEX",
            completed: false,
          },
          {
            title: "Q4 2025",
            description:
              "Lancement de nouvelles fonctionnalités et mise à jour du protocole",
            completed: false,
          },
        ],
      },
    },
    {
      id: "team",
      type: "team",
      title: "Équipe",
      enabled: true,
      content: {
        heading: "Notre équipe",
        members: [
          {
            name: "Jean Dupont",
            role: "CEO & Fondateur",
            bio: "Expert en blockchain avec 10 ans d'expérience",
            image: "",
            social: {
              twitter: "https://twitter.com/",
              linkedin: "https://linkedin.com/",
            },
          },
          {
            name: "Marie Martin",
            role: "CTO",
            bio: "Développeuse blockchain et architecte système",
            image: "",
            social: {
              twitter: "https://twitter.com/",
              github: "https://github.com/",
            },
          },
          {
            name: "Pierre Durand",
            role: "CMO",
            bio: "Spécialiste en marketing digital et crypto",
            image: "",
            social: {
              linkedin: "https://linkedin.com/",
            },
          },
        ],
      },
    },
    {
      id: "faq",
      type: "faq",
      title: "FAQ",
      enabled: true,
      content: {
        heading: "Questions fréquentes",
        questions: [
          {
            question: "Qu'est-ce que notre token?",
            answer:
              "Notre token est une crypto-monnaie basée sur la blockchain qui permet aux utilisateurs de participer à notre écosystème décentralisé.",
          },
          {
            question: "Comment acheter notre token?",
            answer:
              "Vous pouvez acheter notre token sur les échanges décentralisés comme Uniswap, PancakeSwap, ou directement via notre site web.",
          },
          {
            question: "Quels sont les avantages de détenir notre token?",
            answer:
              "Les détenteurs de notre token bénéficient de frais réduits, d'un accès prioritaire aux nouvelles fonctionnalités, et peuvent participer à la gouvernance du projet.",
          },
        ],
      },
    },
    {
      id: "contact",
      type: "contact",
      title: "Contact",
      enabled: true,
      content: {
        heading: "Contactez-nous",
        email: "contact@example.com",
        showSocialLinks: true,
        social: {
          twitter: "https://twitter.com/",
          telegram: "https://t.me/",
          discord: "https://discord.gg/",
          medium: "https://medium.com/",
        },
      },
    },
  ]);

  // Paramètres généraux de la landing page
  const [pageSettings, setPageSettings] = useState({
    title: "Mon Token - Site Officiel",
    description:
      "Site officiel de Mon Token, une crypto-monnaie innovante basée sur la blockchain.",
    favicon: "",
    customDomain: "",
    showBuyButton: true,
    buyButtonLink: "#",
    showSocialLinks: true,
  });

  // Activer/désactiver une section
  const toggleSection = (sectionId: string) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? { ...section, enabled: !section.enabled }
          : section
      )
    );
  };

  // Réordonner les sections (monter)
  const moveUp = (index: number) => {
    if (index === 0) return;
    const newSections = [...sections];
    [newSections[index - 1], newSections[index]] = [
      newSections[index],
      newSections[index - 1],
    ];
    setSections(newSections);
  };

  // Réordonner les sections (descendre)
  const moveDown = (index: number) => {
    if (index === sections.length - 1) return;
    const newSections = [...sections];
    [newSections[index], newSections[index + 1]] = [
      newSections[index + 1],
      newSections[index],
    ];
    setSections(newSections);
  };

  // Mettre à jour le contenu d'une section
  const updateSectionContent = (
    sectionId: string,
    field: string,
    value: any
  ) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              content: {
                ...section.content,
                [field]: value,
              },
            }
          : section
      )
    );
  };

  // Obtenir le thème sélectionné
  const getSelectedTheme = () => {
    return (
      availableThemes.find((theme) => theme.id === selectedTheme) ||
      availableThemes[0]
    );
  };

  return (
    <>
      <SEOHead
        title="Créateur de Landing Page - TokenForge"
        description="Créez une landing page professionnelle pour votre token en quelques minutes avec notre outil de création."
      />

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                Créateur de Landing Page
              </h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                Créez une landing page professionnelle pour votre token en
                quelques minutes
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne de gauche - Paramètres et sections */}
            <div className="lg:col-span-1 space-y-8">
              {/* Paramètres généraux */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Paramètres généraux
                </h2>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Titre de la page
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={pageSettings.title}
                      onChange={(e) =>
                        setPageSettings({
                          ...pageSettings,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={pageSettings.description}
                      onChange={(e) =>
                        setPageSettings({
                          ...pageSettings,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="customDomain"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Domaine personnalisé (optionnel)
                    </label>
                    <input
                      type="text"
                      id="customDomain"
                      value={pageSettings.customDomain}
                      onChange={(e) =>
                        setPageSettings({
                          ...pageSettings,
                          customDomain: e.target.value,
                        })
                      }
                      placeholder="montoken.com"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showBuyButton"
                      checked={pageSettings.showBuyButton}
                      onChange={(e) =>
                        setPageSettings({
                          ...pageSettings,
                          showBuyButton: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
                    />
                    <label
                      htmlFor="showBuyButton"
                      className="ml-2 block text-sm text-gray-900 dark:text-white"
                    >
                      Afficher un bouton d'achat
                    </label>
                  </div>
                  {pageSettings.showBuyButton && (
                    <div>
                      <label
                        htmlFor="buyButtonLink"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Lien du bouton d'achat
                      </label>
                      <input
                        type="text"
                        id="buyButtonLink"
                        value={pageSettings.buyButtonLink}
                        onChange={(e) =>
                          setPageSettings({
                            ...pageSettings,
                            buyButtonLink: e.target.value,
                          })
                        }
                        placeholder="https://uniswap.org/"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Thèmes */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Thème
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {availableThemes.map((theme) => (
                    <div
                      key={theme.id}
                      className={`border rounded-lg p-4 cursor-pointer ${
                        selectedTheme === theme.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                      onClick={() => setSelectedTheme(theme.id)}
                    >
                      <div className="font-medium text-gray-900 dark:text-white mb-2">
                        {theme.name}
                      </div>
                      <div className="flex space-x-2 mb-2">
                        <div
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: theme.primaryColor }}
                        ></div>
                        <div
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: theme.secondaryColor }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {theme.darkMode ? "Mode sombre" : "Mode clair"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sections */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Sections
                </h2>
                <div className="space-y-3">
                  {sections.map((section, index) => (
                    <div
                      key={section.id}
                      className={`border rounded-lg p-3 ${
                        section.enabled
                          ? "border-gray-200 dark:border-gray-700"
                          : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`section-${section.id}`}
                            checked={section.enabled}
                            onChange={() => toggleSection(section.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
                          />
                          <label
                            htmlFor={`section-${section.id}`}
                            className="ml-2 block text-sm font-medium text-gray-900 dark:text-white"
                          >
                            {section.title}
                          </label>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => moveUp(index)}
                            disabled={index === 0}
                            className={`p-1 rounded ${
                              index === 0
                                ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => moveDown(index)}
                            disabled={index === sections.length - 1}
                            className={`p-1 rounded ${
                              index === sections.length - 1
                                ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Colonne centrale et droite - Aperçu */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Aperçu
                </h2>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="bg-gray-100 dark:bg-gray-700 p-2 flex justify-between items-center">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                      {pageSettings.customDomain || "montoken.tokenforge.io"}
                    </div>
                    <div className="w-4"></div>
                  </div>
                  <div
                    className={`h-96 overflow-y-auto ${
                      getSelectedTheme().darkMode
                        ? "bg-gray-900 text-white"
                        : "bg-white text-gray-900"
                    }`}
                    style={{ fontFamily: getSelectedTheme().fontFamily }}
                  >
                    <div className="p-4 flex flex-col items-center justify-center h-full">
                      <div className="text-center">
                        <div
                          className="text-2xl font-bold mb-2"
                          style={{ color: getSelectedTheme().primaryColor }}
                        >
                          Aperçu de la landing page
                        </div>
                        <p className="text-sm opacity-70 mb-4">
                          Votre landing page sera générée avec le thème{" "}
                          {getSelectedTheme().name} et{" "}
                          {sections.filter((s) => s.enabled).length} sections
                          actives.
                        </p>
                        <div className="flex flex-wrap justify-center gap-2 text-xs">
                          {sections
                            .filter((s) => s.enabled)
                            .map((section) => (
                              <span
                                key={section.id}
                                className="px-2 py-1 rounded"
                                style={{
                                  backgroundColor:
                                    getSelectedTheme().primaryColor,
                                  color: getSelectedTheme().darkMode
                                    ? "white"
                                    : "black",
                                  opacity: 0.8,
                                }}
                              >
                                {section.title}
                              </span>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                  Ceci est un aperçu simplifié. La landing page finale sera
                  entièrement fonctionnelle et responsive.
                </div>
              </div>

              {/* Éditeur de section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Éditer la section "Hero"
                </h2>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="heroHeading"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Titre principal
                    </label>
                    <input
                      type="text"
                      id="heroHeading"
                      value={
                        sections.find((s) => s.id === "hero")?.content
                          ?.heading || ""
                      }
                      onChange={(e) =>
                        updateSectionContent("hero", "heading", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="heroSubheading"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Sous-titre
                    </label>
                    <input
                      type="text"
                      id="heroSubheading"
                      value={
                        sections.find((s) => s.id === "hero")?.content
                          ?.subheading || ""
                      }
                      onChange={(e) =>
                        updateSectionContent(
                          "hero",
                          "subheading",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="heroCtaText"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Texte du bouton d'action
                    </label>
                    <input
                      type="text"
                      id="heroCtaText"
                      value={
                        sections.find((s) => s.id === "hero")?.content
                          ?.ctaText || ""
                      }
                      onChange={(e) =>
                        updateSectionContent("hero", "ctaText", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="heroCtaLink"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Lien du bouton d'action
                    </label>
                    <input
                      type="text"
                      id="heroCtaLink"
                      value={
                        sections.find((s) => s.id === "hero")?.content
                          ?.ctaLink || ""
                      }
                      onChange={(e) =>
                        updateSectionContent("hero", "ctaLink", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="heroShowTokenSymbol"
                      checked={
                        sections.find((s) => s.id === "hero")?.content
                          ?.showTokenSymbol || false
                      }
                      onChange={(e) =>
                        updateSectionContent(
                          "hero",
                          "showTokenSymbol",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
                    />
                    <label
                      htmlFor="heroShowTokenSymbol"
                      className="ml-2 block text-sm text-gray-900 dark:text-white"
                    >
                      Afficher le symbole du token
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-between">
            <Link
              to={`/tokens/${id || ""}`}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Annuler
            </Link>
            <button className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Générer la landing page
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

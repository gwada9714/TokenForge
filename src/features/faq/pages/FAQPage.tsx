import React, { useState } from "react";
import { SEOHead } from "@/components";

// Type pour les questions FAQ
interface FAQItem {
  question: string;
  answer: React.ReactNode;
  category: string;
}

export const FAQPage: React.FC = () => {
  // État pour suivre la catégorie active
  const [activeCategory, setActiveCategory] = useState<string>("general");
  // État pour suivre la question ouverte
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  // Liste des questions FAQ
  const faqItems: FAQItem[] = [
    // Questions générales
    {
      question: "Qu'est-ce que TokenForge?",
      answer: (
        <div>
          <p>
            TokenForge est une plateforme complète qui permet de créer et
            déployer des tokens sur différentes blockchains sans avoir besoin de
            compétences techniques en programmation. Notre plateforme offre:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Création de tokens sur 6+ blockchains différentes</li>
            <li>
              Fonctionnalités de sécurité avancées (Anti-Rugpull, anti-whale)
            </li>
            <li>Outils de tokenomics pour optimiser votre économie de token</li>
            <li>
              Interface simple et intuitive pour tous les niveaux d'expertise
            </li>
          </ul>
        </div>
      ),
      category: "general",
    },
    {
      question: "Comment fonctionne la création de token?",
      answer: (
        <div>
          <p>
            La création de token avec TokenForge se fait en quelques étapes
            simples:
          </p>
          <ol className="list-decimal pl-5 mt-2 space-y-1">
            <li>
              Choisissez la blockchain sur laquelle vous souhaitez déployer
              votre token
            </li>
            <li>
              Configurez les informations de base (nom, symbole, supply,
              décimales)
            </li>
            <li>
              Sélectionnez les fonctionnalités avancées souhaitées (mintable,
              burnable, etc.)
            </li>
            <li>
              Configurez les paramètres de sécurité et anti-whale si nécessaire
            </li>
            <li>Prévisualisez votre token et vérifiez les détails</li>
            <li>Procédez au paiement des frais de déploiement</li>
            <li>Suivez le déploiement en temps réel jusqu'à la confirmation</li>
          </ol>
          <p className="mt-2">
            Une fois déployé, votre token est immédiatement disponible et vous
            avez accès à toutes les fonctionnalités de gestion via votre tableau
            de bord.
          </p>
        </div>
      ),
      category: "general",
    },
    {
      question: "Combien de temps prend le déploiement?",
      answer: (
        <p>
          Le temps de déploiement varie selon la blockchain choisie et la
          congestion du réseau. En général, le déploiement prend entre 30
          secondes et 5 minutes. Ethereum peut prendre plus de temps lors de
          périodes de forte congestion, tandis que des blockchains comme Solana
          ou Avalanche sont généralement plus rapides. Vous pouvez suivre
          l'avancement du déploiement en temps réel sur votre tableau de bord.
        </p>
      ),
      category: "general",
    },
    {
      question: "Quelles blockchains sont supportées?",
      answer: (
        <div>
          <p>TokenForge supporte actuellement les blockchains suivantes:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Ethereum (ETH)</li>
            <li>Binance Smart Chain (BSC)</li>
            <li>Polygon (MATIC)</li>
            <li>Avalanche (AVAX)</li>
            <li>Solana (SOL)</li>
            <li>Arbitrum</li>
          </ul>
          <p className="mt-2">
            Nous ajoutons régulièrement de nouvelles blockchains en fonction de
            la demande et de la maturité des écosystèmes.
          </p>
        </div>
      ),
      category: "general",
    },
    {
      question: "Quelles sont les différences entre les plans d'abonnement?",
      answer: (
        <div>
          <p>
            TokenForge propose plusieurs plans adaptés à différents besoins:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-2">
            <li>
              <strong>Free</strong>: Fonctionnalités limitées, création basique
              sur 2 blockchains, idéal pour tester la plateforme.
            </li>
            <li>
              <strong>Basic</strong>: Fonctionnalités standard, 4 blockchains,
              support email, parfait pour les projets en démarrage.
            </li>
            <li>
              <strong>Pro</strong>: Toutes les fonctionnalités, 6 blockchains,
              analytics avancés, priorité support, idéal pour les projets
              sérieux.
            </li>
            <li>
              <strong>Enterprise</strong>: Solutions personnalisées, SLA
              garanti, support dédié, conçu pour les entreprises et grands
              projets.
            </li>
          </ul>
          <p className="mt-2">
            Consultez notre page{" "}
            <a href="/plans" className="text-blue-500 hover:underline">
              Plans & Tarifs
            </a>{" "}
            pour une comparaison détaillée.
          </p>
        </div>
      ),
      category: "general",
    },

    // Questions techniques
    {
      question: "Quelle est la compatibilité avec les wallets?",
      answer: (
        <div>
          <p>
            Les tokens créés avec TokenForge sont 100% compatibles avec tous les
            wallets standards qui supportent la blockchain choisie:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              MetaMask, Trust Wallet, Coinbase Wallet pour Ethereum, BSC,
              Polygon, Avalanche et Arbitrum
            </li>
            <li>Phantom, Solflare pour Solana</li>
            <li>
              Autres wallets compatibles avec les standards ERC-20, BEP-20, SPL,
              etc.
            </li>
          </ul>
          <p className="mt-2">
            Pour interagir avec la plateforme TokenForge elle-même, nous
            supportons la connexion via MetaMask (prioritaire) et WalletConnect
            (pour les autres wallets).
          </p>
        </div>
      ),
      category: "technical",
    },
    {
      question: "Comment fonctionne le processus de déploiement détaillé?",
      answer: (
        <div>
          <p>
            Le processus de déploiement technique comprend les étapes suivantes:
          </p>
          <ol className="list-decimal pl-5 mt-2 space-y-1">
            <li>Génération du code smart contract basé sur vos paramètres</li>
            <li>Compilation du code avec les optimisations appropriées</li>
            <li>
              Vérification préliminaire pour détecter d'éventuels problèmes
            </li>
            <li>Estimation des gas fees (pour les blockchains EVM)</li>
            <li>Signature de la transaction de déploiement via votre wallet</li>
            <li>Soumission de la transaction à la blockchain</li>
            <li>
              Attente de la confirmation (plusieurs blocs selon la blockchain)
            </li>
            <li>
              Vérification du contrat sur l'explorateur de blocs (si disponible)
            </li>
            <li>
              Enregistrement des métadonnées du token dans notre base de données
            </li>
          </ol>
          <p className="mt-2">
            Tout ce processus est automatisé et vous pouvez suivre chaque étape
            en temps réel.
          </p>
        </div>
      ),
      category: "technical",
    },
    {
      question:
        "Quelles sont les limites techniques (supply, fonctionnalités)?",
      answer: (
        <div>
          <p>
            Les limites techniques varient selon la blockchain, mais voici les
            principales:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              Supply maximum: jusqu'à 2^256-1 (limite théorique EVM), mais nous
              recommandons des valeurs raisonnables
            </li>
            <li>Décimales: jusqu'à 18 pour EVM, 9 pour Solana</li>
            <li>
              Fonctionnalités: toutes les fonctionnalités standards (mintable,
              burnable, pausable, etc.) sont disponibles
            </li>
            <li>
              Taxation: jusqu'à 25% maximum (pour éviter les tokens abusifs)
            </li>
            <li>
              Limites anti-whale: configurables jusqu'à 5% du supply total
            </li>
          </ul>
          <p className="mt-2">
            Des limites spécifiques peuvent s'appliquer selon le plan choisi et
            la blockchain utilisée.
          </p>
        </div>
      ),
      category: "technical",
    },
    {
      question: "Comment fonctionne l'interopérabilité avec d'autres services?",
      answer: (
        <p>
          Les tokens créés avec TokenForge suivent les standards de l'industrie
          (ERC-20, BEP-20, SPL, etc.), ce qui garantit une compatibilité
          maximale avec l'écosystème blockchain. Ils peuvent être utilisés avec
          n'importe quel service compatible: DEX (Uniswap, PancakeSwap),
          plateformes DeFi, marketplaces NFT, bridges cross-chain, etc. De plus,
          notre API permet d'intégrer les fonctionnalités de TokenForge dans vos
          propres applications et services.
        </p>
      ),
      category: "technical",
    },
    {
      question: "Comment gérer les smart contracts après déploiement?",
      answer: (
        <div>
          <p>
            Après le déploiement, vous pouvez gérer votre token via notre
            interface intuitive:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Mint de nouveaux tokens (si la fonctionnalité est activée)</li>
            <li>Burn de tokens (réduction du supply)</li>
            <li>Pause/reprise des transactions (si pausable)</li>
            <li>Gestion des listes blanches/noires</li>
            <li>Ajustement des paramètres de taxation</li>
            <li>Transfert de propriété/admin</li>
            <li>Verrouillage de liquidité</li>
          </ul>
          <p className="mt-2">
            Toutes ces actions sont accessibles via votre tableau de bord, sans
            nécessiter de connaissances techniques en programmation.
          </p>
        </div>
      ),
      category: "technical",
    },

    // Questions sur la sécurité
    {
      question: "Comment fonctionnent les mesures de protection Anti-Rugpull?",
      answer: (
        <div>
          <p>
            Nos mécanismes Anti-Rugpull comprennent plusieurs couches de
            protection:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <strong>Verrouillage de liquidité automatisé</strong>: Permet de
              verrouiller une partie de la liquidité pour une période définie,
              empêchant son retrait soudain
            </li>
            <li>
              <strong>Timelock sur fonctions critiques</strong>: Impose un délai
              entre l'annonce d'une action critique et son exécution, donnant
              aux utilisateurs le temps de réagir
            </li>
            <li>
              <strong>Limitations de vente pour l'équipe</strong>: Restreint la
              quantité de tokens que les adresses fondatrices peuvent vendre
              dans une période donnée
            </li>
            <li>
              <strong>Multi-signature pour actions critiques</strong>: Exige
              l'approbation de plusieurs parties pour exécuter des fonctions
              sensibles
            </li>
            <li>
              <strong>Transparence des wallets fondateurs</strong>: Identifie
              clairement les adresses des fondateurs pour une meilleure
              transparence
            </li>
          </ul>
          <p className="mt-2">
            Ces mécanismes sont configurables selon vos besoins et inspirent
            confiance à votre communauté.
          </p>
        </div>
      ),
      category: "security",
    },
    {
      question: "Comment configurer les paramètres anti-whale?",
      answer: (
        <div>
          <p>
            La configuration anti-whale permet de limiter la concentration de
            tokens et de protéger contre la manipulation du marché:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <strong>Limite de transaction maximum</strong>: Définit le montant
              maximum qu'un utilisateur peut acheter/vendre en une seule
              transaction (ex: 1% du supply)
            </li>
            <li>
              <strong>Limite de détention maximum</strong>: Restreint la
              quantité totale qu'une adresse peut détenir (ex: 3% du supply
              total)
            </li>
            <li>
              <strong>Cooldown entre transactions</strong>: Impose un délai
              entre les transactions d'une même adresse
            </li>
            <li>
              <strong>Taxation progressive</strong>: Augmente les frais pour les
              transactions de grande taille
            </li>
          </ul>
          <p className="mt-2">
            Ces paramètres sont entièrement personnalisables lors de la création
            du token ou peuvent être ajustés ultérieurement si votre contrat le
            permet.
          </p>
        </div>
      ),
      category: "security",
    },
    {
      question: "Comment sont réalisés les audits de sécurité?",
      answer: (
        <p>
          Tous nos templates de smart contracts sont audités par des firmes de
          sécurité reconnues dans l'industrie blockchain. Nous effectuons
          également des audits internes réguliers et des tests automatisés pour
          détecter d'éventuelles vulnérabilités. Pour les projets utilisant nos
          plans Pro et Enterprise, nous proposons des audits personnalisés de
          votre configuration spécifique. Les rapports d'audit sont disponibles
          publiquement et nous mettons à jour nos contrats dès qu'une
          amélioration de sécurité est identifiée.
        </p>
      ),
      category: "security",
    },
    {
      question: "Comment sont gérées les clés privées?",
      answer: (
        <p>
          TokenForge ne stocke jamais vos clés privées. Toutes les transactions
          nécessitant une signature (comme le déploiement d'un contrat) sont
          effectuées via votre propre wallet (MetaMask, WalletConnect, etc.).
          Nous utilisons un système de connexion non-custodial, ce qui signifie
          que vous gardez toujours le contrôle total de vos actifs et de vos
          clés. Pour les fonctionnalités administratives post-déploiement, c'est
          toujours votre wallet qui signe les transactions, garantissant une
          sécurité maximale.
        </p>
      ),
      category: "security",
    },
    {
      question: "Quelles protections sont en place contre les attaques?",
      answer: (
        <div>
          <p>
            Nos smart contracts intègrent des protections contre les attaques
            courantes:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <strong>Protection contre les attaques de reentrancy</strong>:
              Utilisation de modèles checks-effects-interactions et de guards
            </li>
            <li>
              <strong>Protection contre les attaques de front-running</strong>:
              Options pour limiter l'impact du MEV (Miner Extractable Value)
            </li>
            <li>
              <strong>Prévention des overflow/underflow</strong>: Utilisation de
              bibliothèques mathématiques sécurisées
            </li>
            <li>
              <strong>Protection contre les attaques de flash loan</strong>:
              Mécanismes pour détecter et limiter l'impact des flash loans
            </li>
            <li>
              <strong>Sécurisation des fonctions administratives</strong>:
              Contrôles d'accès stricts et validation des paramètres
            </li>
          </ul>
          <p className="mt-2">
            Notre équipe de sécurité surveille constamment les nouvelles menaces
            et met à jour nos protections en conséquence.
          </p>
        </div>
      ),
      category: "security",
    },

    // Questions légales
    {
      question: "Quelles sont les responsabilités de l'utilisateur?",
      answer: (
        <div>
          <p>En tant qu'utilisateur de TokenForge, vous êtes responsable de:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              Respecter les lois et réglementations de votre juridiction
              concernant les tokens et cryptomonnaies
            </li>
            <li>
              Vérifier si votre token pourrait être considéré comme une security
              dans votre juridiction
            </li>
            <li>
              Obtenir les conseils juridiques nécessaires avant de lancer un
              token avec une utilité financière
            </li>
            <li>Assurer la sécurité de vos clés privées et de votre wallet</li>
            <li>
              Fournir des informations transparentes à votre communauté sur
              votre projet
            </li>
            <li>
              Utiliser les fonctionnalités de la plateforme de manière éthique
              et responsable
            </li>
          </ul>
          <p className="mt-2">
            TokenForge fournit les outils, mais l'utilisation de ces outils
            reste sous votre responsabilité.
          </p>
        </div>
      ),
      category: "legal",
    },
    {
      question: "Quelles sont les mentions légales par juridiction?",
      answer: (
        <p>
          Les réglementations concernant les tokens varient considérablement
          selon les pays. TokenForge ne peut pas fournir de conseils juridiques
          spécifiques à chaque juridiction. Nous recommandons vivement de
          consulter un avocat spécialisé dans la blockchain et les
          cryptomonnaies dans votre pays avant de lancer un projet. Notre
          bibliothèque de templates juridiques (disponible dans le plan Pro et
          Enterprise) fournit des documents de base adaptables à différentes
          juridictions, mais ces documents doivent être revus par un
          professionnel du droit.
        </p>
      ),
      category: "legal",
    },
    {
      question: "Comment assurer la conformité réglementaire?",
      answer: (
        <div>
          <p>Pour assurer la conformité réglementaire de votre projet:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Consultez un avocat spécialisé dans votre juridiction</li>
            <li>
              Considérez l'implémentation de KYC/AML si nécessaire pour votre
              cas d'usage
            </li>
            <li>
              Utilisez nos templates juridiques comme point de départ (plans
              Pro/Enterprise)
            </li>
            <li>
              Documentez clairement l'utilité de votre token et sa
              classification
            </li>
            <li>
              Restez informé des évolutions réglementaires dans votre région
            </li>
            <li>
              Envisagez une structure d'entreprise appropriée pour votre projet
            </li>
          </ul>
          <p className="mt-2">
            Notre service de conseil juridique (disponible séparément) peut vous
            aider à naviguer dans cet environnement complexe.
          </p>
        </div>
      ),
      category: "legal",
    },
    {
      question: "Comment protéger la propriété intellectuelle?",
      answer: (
        <p>
          La protection de la propriété intellectuelle dans l'espace blockchain
          présente des défis uniques. Le code des smart contracts déployés est
          généralement visible publiquement, mais vous pouvez protéger votre
          marque, logo, nom et autres éléments distinctifs par des moyens
          traditionnels (marques déposées, droits d'auteur). Pour le code
          personnalisé développé spécifiquement pour votre projet, vous pouvez
          utiliser des licences appropriées. TokenForge conserve les droits sur
          notre plateforme et nos templates, mais vous êtes propriétaire de
          votre token déployé et de ses fonctionnalités spécifiques.
        </p>
      ),
      category: "legal",
    },
    {
      question: "Quelles sont les exigences de KYC et vérifications?",
      answer: (
        <div>
          <p>
            TokenForge n'impose pas de KYC (Know Your Customer) pour
            l'utilisation basique de la plateforme, mais certaines
            fonctionnalités avancées peuvent nécessiter une vérification:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              L'accès aux plans Enterprise nécessite une vérification d'identité
            </li>
            <li>
              Les projets souhaitant être présentés dans notre Token Spotlight
              Program doivent passer une vérification
            </li>
            <li>
              Les experts rejoignant notre Expert Network sont soumis à un
              processus de vérification
            </li>
          </ul>
          <p className="mt-2">
            Si votre projet nécessite d'implémenter KYC pour vos propres
            utilisateurs, nous proposons une intégration avec des services
            KYC/AML tiers via notre module complémentaire (plans
            Pro/Enterprise).
          </p>
        </div>
      ),
      category: "legal",
    },

    // Questions sur les paiements
    {
      question: "Quelles méthodes de paiement sont acceptées?",
      answer: (
        <div>
          <p>TokenForge accepte plusieurs méthodes de paiement:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <strong>Cryptomonnaies</strong>: ETH, BNB, MATIC, AVAX, SOL et
              stablecoins (USDT, USDC, DAI)
            </li>
            <li>
              <strong>Cartes de crédit/débit</strong>: Visa, Mastercard,
              American Express via notre partenaire de paiement
            </li>
            <li>
              <strong>Virements bancaires</strong>: Disponible pour les plans
              Enterprise et les paiements importants
            </li>
            <li>
              <strong>PayPal</strong>: Disponible dans certaines régions
            </li>
          </ul>
          <p className="mt-2">
            Les paiements en crypto sont traités instantanément, tandis que les
            paiements par carte ou virement peuvent nécessiter une validation
            supplémentaire.
          </p>
        </div>
      ),
      category: "payment",
    },
    {
      question: "Comment fonctionne le processus de facturation?",
      answer: (
        <div>
          <p>Notre processus de facturation varie selon le type de service:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <strong>Déploiement de token</strong>: Paiement unique avant le
              déploiement, comprenant les frais de service et une estimation des
              gas fees
            </li>
            <li>
              <strong>Abonnements</strong>: Facturation mensuelle ou annuelle
              avec renouvellement automatique (possibilité de désactiver)
            </li>
            <li>
              <strong>Services additionnels</strong>: Facturation à l'usage ou
              forfaitaire selon le service
            </li>
          </ul>
          <p className="mt-2">
            Toutes les factures sont disponibles dans votre espace client et
            peuvent être téléchargées au format PDF. Pour les entreprises, nous
            pouvons émettre des factures avec les informations fiscales
            nécessaires.
          </p>
        </div>
      ),
      category: "payment",
    },
    {
      question: "Quelle est la politique de remboursement?",
      answer: (
        <p>
          Pour les déploiements de tokens, nous offrons un remboursement complet
          si le déploiement échoue pour des raisons techniques de notre côté.
          Cependant, une fois le token déployé avec succès, aucun remboursement
          n'est possible car le service a été rendu. Pour les abonnements, vous
          pouvez annuler à tout moment et recevoir un remboursement au prorata
          pour la période non utilisée si vous avez payé annuellement. Les
          services additionnels ont des politiques de remboursement spécifiques
          détaillées dans leurs conditions. Les frais de gas payés au réseau
          blockchain ne sont jamais remboursables, même en cas d'échec.
        </p>
      ),
      category: "payment",
    },
    {
      question: "Comment fonctionne la conversion crypto-fiat?",
      answer: (
        <p>
          Lorsque vous payez en cryptomonnaie, le montant est calculé en temps
          réel selon le taux de change actuel avec une marge de 1% pour tenir
          compte de la volatilité. Nous utilisons des oracles de prix
          décentralisés et des agrégateurs pour obtenir les taux les plus
          précis. Pour les paiements en fiat (carte, virement), nous appliquons
          le taux de change au moment du paiement. Dans tous les cas, le montant
          exact vous est toujours présenté avant confirmation. Pour les
          entreprises ayant besoin de stabilité, nous proposons des options de
          tarification fixe en fiat avec nos plans Enterprise.
        </p>
      ),
      category: "payment",
    },
    {
      question: "Quelles sont les obligations fiscales?",
      answer: (
        <p>
          TokenForge n'est pas en mesure de fournir des conseils fiscaux, car
          les réglementations varient considérablement selon les pays. En
          général, la création d'un token peut impliquer plusieurs
          considérations fiscales: TVA/taxes sur les services, impôts sur les
          plus-values si vous vendez des tokens, obligations fiscales liées aux
          revenus générés par votre projet. Nous vous recommandons vivement de
          consulter un expert fiscal familier avec les cryptomonnaies dans votre
          juridiction. Pour les entreprises, nous fournissons toute la
          documentation nécessaire pour votre comptabilité, y compris les
          factures détaillées avec TVA lorsque applicable.
        </p>
      ),
      category: "payment",
    },
  ];

  // Filtrer les questions par catégorie active
  const filteredFAQs = faqItems.filter(
    (item) => item.category === activeCategory
  );

  // Fonction pour basculer l'état d'ouverture d'une question
  const toggleQuestion = (index: number) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  return (
    <>
      <SEOHead
        title="FAQ - TokenForge | Réponses à vos questions sur la création de tokens"
        description="Trouvez des réponses à toutes vos questions sur TokenForge, la création de tokens, les aspects techniques, la sécurité, et plus encore."
      />

      <main className="container mx-auto px-4 py-8">
        <section className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Foire Aux Questions</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Trouvez des réponses aux questions les plus fréquemment posées sur
            TokenForge et la création de tokens.
          </p>
        </section>

        {/* Catégories de FAQ */}
        <section className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory("general")}
              className={`px-4 py-2 rounded-full ${
                activeCategory === "general"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              }`}
            >
              Questions générales
            </button>
            <button
              onClick={() => setActiveCategory("technical")}
              className={`px-4 py-2 rounded-full ${
                activeCategory === "technical"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              }`}
            >
              Questions techniques
            </button>
            <button
              onClick={() => setActiveCategory("security")}
              className={`px-4 py-2 rounded-full ${
                activeCategory === "security"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              }`}
            >
              Sécurité
            </button>
            <button
              onClick={() => setActiveCategory("legal")}
              className={`px-4 py-2 rounded-full ${
                activeCategory === "legal"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              }`}
            >
              Aspects légaux
            </button>
            <button
              onClick={() => setActiveCategory("payment")}
              className={`px-4 py-2 rounded-full ${
                activeCategory === "payment"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              }`}
            >
              Paiements
            </button>
          </div>
        </section>

        {/* Liste des questions */}
        <section className="mb-8">
          <div className="space-y-4">
            {filteredFAQs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => toggleQuestion(index)}
                >
                  <h3 className="text-lg font-medium">{faq.question}</h3>
                  <svg
                    className={`w-5 h-5 transition-transform ${
                      openQuestion === index ? "transform rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </button>
                {openQuestion === index && (
                  <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
                    <div className="prose dark:prose-invert max-w-none">
                      {faq.answer}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Section de contact pour questions supplémentaires */}
        <section className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">
            Vous n'avez pas trouvé votre réponse?
          </h2>
          <p className="mb-4">
            Notre équipe de support est disponible pour répondre à toutes vos
            questions spécifiques.
          </p>
          <a
            href="/contact"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Contactez-nous
          </a>
        </section>
      </main>
    </>
  );
};

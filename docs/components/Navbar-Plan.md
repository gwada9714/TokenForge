# Plan Détaillé de la Navbar TokenForge

## 1. Structure Générale de la Navbar

### 1.1 Layout et positionnement
- **Type**: Navbar fixe (sticky) en haut de l'écran
- **Hauteur**: 72px sur desktop, 60px sur mobile
- **Largeur**: 100% avec contenu aligné dans un conteneur max-width: 1440px
- **Position Z-index**: 1000 (au-dessus de tous les autres éléments)
- **Comportement au scroll**: Réduction subtile de hauteur (64px) avec légère opacité (0.95) pour le fond

### 1.2 Fond et effets visuels
- **Couleur de fond**: Bleu nuit profond (#0F172A) avec léger dégradé vertical
- **Texture**: Pattern "circuit" à 5% d'opacité
- **Ombre portée**: 0px 4px 8px rgba(0, 0, 0, 0.25)
- **Effet de séparation**: Fine ligne horizontale (#475569) à 15% d'opacité
- **Animation d'apparition**: Fade-in léger avec slide-down subtil au chargement initial

## 2. Éléments et Organisation

### 2.1 Zone gauche: Branding
- **Logo TokenForge**: SVG responsive, hauteur 36px
  - Animation: Subtil effet de lueur orangée au hover
  - Lien vers la page d'accueil
- **Tagline** (desktop uniquement): "Forge Your Token Future" en typographie Space Grotesk Light (14px)
  - Couleur: Gris clair (#F8FAFC) à 80% d'opacité
  - Séparé du logo par une fine ligne verticale

### 2.2 Zone centrale: Navigation Principale
- **Structure**: Menu horizontal à espacement régulier sur desktop
- **Typographie**: Space Grotesk Medium, 16px
- **Espacement**: 32px entre les éléments
- **Alignement**: Centré verticalement
- **Entrées de menu**:
  1. **Créer un Token**
  2. **Services Premium**
  3. **Tokenomics**
  4. **Comparateur**
  5. **Communauté**
  6. **Ressources**

### 2.3 Zone droite: Actions Utilisateur
- **Sélecteur de Blockchain**: Dropdown avec icône hexagonale
- **Recherche**: Icône loupe avec expandable search
- **Compte**: Avatar/icône utilisateur avec dropdown
- **CTA principal**: Bouton "Forge ton Token"

## 3. Traitement des Items de Navigation

### 3.1 État de repos
- **Couleur de texte**: Blanc ivoire (#F8FAFC) à 85% d'opacité
- **Fond**: Transparent
- **Padding**: 8px 12px
- **Effet visuel**: Aucun

### 3.2 État de survol (Hover)
- **Animation**: Transition de 0.2s
- **Couleur de texte**: Blanc (#FFFFFF) 100% d'opacité
- **Effet visuel**: Lueur subtile orange (box-shadow: 0 0 8px rgba(245, 158, 11, 0.3))
- **Indicateur**: Fine ligne orange qui apparaît par le bas (transform scaleX)

### 3.3 État actif/sélectionné
- **Couleur de texte**: Blanc (#FFFFFF) 100%
- **Effet visuel**: 
  - Lueur orange plus prononcée (box-shadow: 0 0 12px rgba(245, 158, 11, 0.4))
  - Ligne orange complète sous le texte (2px)
- **Fond**: Légère variation de fond (#1E293B)

### 3.4 État focus (navigation clavier)
- **Indication**: Contour orange pointillé
- **Animation**: Pulsation subtile de la lueur
- **Contraste**: Assuré pour accessibilité (ratio min 4.5:1)

## 4. Dropdown Menus

### 4.1 Architecture des sous-menus
- **Type**: Mega menu pour les catégories complexes (Services Premium, Ressources)
- **Type**: Dropdown simple pour les autres
- **Activation**: Hover sur desktop, click sur mobile/tablet
- **Transition**: Apparition avec effet forge (orange fade-in to regular color)
- **Délai d'apparition**: 200ms hover intention
- **Délai de disparition**: 300ms pour éviter fermeture accidentelle

### 4.2 Composants du mega menu "Services Premium"
- **Layout**: Grille 3x2 avec icônes et descriptions
- **Fond**: Dégradé du bleu nuit au noir charbon (#0F172A à #1E293B)
- **Bordure**: Subtile ligne dorée sur les bords (1px #D4AF37 à 30%)
- **Contenu**:
  1. **Tokenomics Designer**
     - Icône: Graphique stylisé avec effet métallique
     - Description courte: "Concevez l'économie parfaite pour votre token"
  2. **Landing Page Builder**
     - Icône: Page avec éléments constructifs
     - Description courte: "Créez une vitrine professionnelle sans coder"
  3. **Auto-Liquidity Manager**
     - Icône: Pools interconnectés
     - Description courte: "Gestion automatisée de la liquidité multi-DEX"
  4. **Anti-Rugpull Protection**
     - Icône: Bouclier avec chaîne
     - Description courte: "Sécurisez votre projet avec des mécanismes de confiance"
  5. **Expert Network**
     - Icône: Silhouettes de forgerons
     - Description courte: "Accédez à notre réseau d'experts vérifiés"
  6. **Token Spotlight**
     - Icône: Projecteur sur token
     - Description courte: "Mettez en valeur votre projet auprès de notre communauté"

### 4.3 Dropdown "Créer un Token"
- **Layout**: Liste verticale avec séparation par blockchain
- **Fonctionnalités**:
  - Icônes colorées par blockchain
  - Indicateur de prix/complexité (1-3 marteaux)
  - Temps estimé de déploiement

### 4.4 Dropdown "Compte"
- **Non connecté**:
  - Login/Signup options
  - "Connecter Wallet" avec icônes de wallets supportés
  - Rappel des avantages membres
- **Connecté**:
  - Avatar utilisateur avec niveau (Apprenti/Forgeron/Maître)
  - Tokens créés (nombre avec badge)
  - Dashboard
  - Paramètres
  - Déconnexion

## 5. Éléments Interactifs Spécifiques

### 5.1 Blockchain Selector
- **Apparence repos**: Hexagone avec couleur de la blockchain active
- **Label**: Nom de la blockchain sélectionnée
- **Indicator**: Petit point de couleur correspondant à la blockchain
- **Animation**: Rotation hexagonale au clic (style forge)
- **Dropdown**:
  - 6 hexagones avec couleurs des blockchains
  - Noms et logos des blockchains
  - Indication du nombre de tokens créés par chaîne
  - Indicateur de coût relatif (symboles $)

### 5.2 Search System
- **État repos**: Icône loupe (#F8FAFC)
- **État actif**: Champ qui s'étend (animation slide)
  - Placeholder: "Rechercher tokens, services, docs..."
  - Fond: #1E293B avec bordure subtile (#475569)
  - Suggestions en temps réel avec highlight
- **Résultats rapides**: 
  - Affichage des 3 meilleurs résultats avant submit
  - Catégorisation par type (Token, Doc, Service)

### 5.3 CTA Principal "Forge ton Token"
- **Dimensions**: 140px x 40px
- **Fond**: Dégradé orange métallisé (#F59E0B à #EA580C)
- **Texte**: Space Grotesk Bold, 15px, blanc
- **Effet repos**: Léger effet métallique (reflet subtil)
- **Effet hover**: 
  - Intensification du dégradé
  - Augmentation de la lueur (glow effect)
  - Scale 1.02 subtil
- **Effet click**: 
  - Impression de pression (scale Y 0.98)
  - Flash lumineux rapide
- **Animation**: Subtile pulsation de la lueur (cycle de 3s)

## 6. Version Responsive

### 6.1 Breakpoints et adaptations
- **Desktop**: >1024px (version complète)
- **Tablet**: 768px-1024px
  - Réduction du menu (texte plus petit, espacement réduit)
  - Consolidation de certains éléments
- **Mobile**: <768px
  - Transformation en menu hamburger
  - Logo centré
  - CTA et toggle menu aux extrémités

### 6.2 Menu Mobile (Hamburger)
- **Toggle icon**: 
  - Animation morphing de hamburger à X
  - Effet de forge sur les lignes
- **Menu déployé**:
  - Apparition par slide-down avec effet forge
  - Fond: #0F172A avec texture accentuée
  - Organisation en accordéon pour sous-menus
  - Hauteur: Plein écran avec scroll si nécessaire
- **Navigation**:
  - Items plus grands (touch-friendly, min 48px)
  - Indication visuelle renforcée pour l'item actif
  - Animation de transition entre les niveaux

### 6.3 Adaptations spécifiques tablette
- **Blockchain Selector**: Compact mode (icône seule)
- **Search**: Icône seule, expansion au clic
- **Espace réduit** entre les éléments de navigation

## 7. Fonctionnalités Avancées

### 7.1 État de réseau
- **Indicateur discret**: Point coloré près du sélecteur blockchain
  - Vert: Réseau fluide (gas fees normaux)
  - Orange: Réseau chargé (gas fees élevés)
  - Rouge: Problèmes réseau
- **Tooltip info**: Gas price actuel et congestion réseau au hover

### 7.2 Notifications système
- **Icône**: Cloche forgée avec badge de compteur
- **Animation**: Tintement subtil pour nouvelles notifications
- **Dropdown**: 
  - Liste des dernières notifications
  - Groupement par type (Système, Token, Communauté)
  - Actions rapides sur notifications

### 7.3 Mode langage
- **Icon**: Globe stylisé
- **Options**: EN, FR, ES, DE, JP (première phase)
- **Détection**: Auto-détection initiale de la langue
- **Persistance**: Sauvegarde de la préférence

### 7.4 Aide contextuelle
- **Accès**: Icône "?" discrète à l'extrême droite
- **Fonctionnement**: Activation du mode aide avec tooltips explicatifs
- **Style**: Tooltips avec fond doré et explications détaillées

## 8. Styles et Spécifications CSS

### 8.1 Variables CSS principales
```css
.navbar {
  /* Dimensions */
  --navbar-height: 72px;
  --navbar-height-scrolled: 64px;
  --navbar-padding: 0 24px;
  
  /* Couleurs */
  --navbar-bg: #0F172A;
  --navbar-text: rgba(248, 250, 252, 0.85);
  --navbar-text-hover: #FFFFFF;
  --navbar-accent: #F59E0B;
  --navbar-border: rgba(71, 85, 105, 0.15);
  
  /* Transitions */
  --navbar-transition: all 0.2s ease-out;
  --dropdown-transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  
  /* Shadows */
  --navbar-shadow: 0px 4px 8px rgba(0, 0, 0, 0.25);
  --dropdown-shadow: 0 8px 16px rgba(0, 0, 0, 0.35);
  
  /* Z-indices */
  --navbar-z: 1000;
  --dropdown-z: 1010;
}
```

### 8.2 Classes CSS principales
```css
.navbar {
  position: sticky;
  top: 0;
  z-index: var(--navbar-z);
  height: var(--navbar-height);
  padding: var(--navbar-padding);
  background-color: var(--navbar-bg);
  background-image: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
  box-shadow: var(--navbar-shadow);
  transition: var(--navbar-transition);
}

.navbar-scrolled {
  height: var(--navbar-height-scrolled);
  background-color: rgba(15, 23, 42, 0.95);
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.navbar-nav {
  display: flex;
  gap: 32px;
}

.nav-item {
  position: relative;
  padding: 8px 12px;
  color: var(--navbar-text);
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 500;
  transition: var(--navbar-transition);
}

.nav-item:hover,
.nav-item.active {
  color: var(--navbar-text-hover);
}

.nav-item::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--navbar-accent);
  transform: scaleX(0);
  transition: transform 0.2s ease-out;
}

.nav-item:hover::after {
  transform: scaleX(0.8);
}

.nav-item.active::after {
  transform: scaleX(1);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: -20px;
  min-width: 220px;
  background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
  border: 1px solid rgba(212, 175, 55, 0.3);
  box-shadow: var(--dropdown-shadow);
  transform-origin: top center;
  opacity: 0;
  transform: translateY(10px);
  transition: var(--dropdown-transition);
  pointer-events: none;
  z-index: var(--dropdown-z);
}

.nav-item:hover .dropdown-menu {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.mega-menu {
  width: 640px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 24px;
}
```

## 9. Interactions JavaScript

### 9.1 Événements principaux
```javascript
// Navbar scroll effect
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 20) {
    navbar.classList.add('navbar-scrolled');
  } else {
    navbar.classList.remove('navbar-scrolled');
  }
});

// Mobile menu toggle
const menuToggle = document.querySelector('.navbar-toggle');
const mobileMenu = document.querySelector('.navbar-mobile');

menuToggle.addEventListener('click', () => {
  menuToggle.classList.toggle('active');
  mobileMenu.classList.toggle('open');
  document.body.classList.toggle('menu-open');
});

// Dropdown hover intention (desktop only)
const navItems = document.querySelectorAll('.nav-item.has-dropdown');
let hoverTimeout;

navItems.forEach(item => {
  item.addEventListener('mouseenter', () => {
    clearTimeout(hoverTimeout);
    navItems.forEach(i => {
      if (i !== item) i.classList.remove('dropdown-active');
    });
    hoverTimeout = setTimeout(() => {
      item.classList.add('dropdown-active');
    }, 200);
  });
  
  item.addEventListener('mouseleave', () => {
    hoverTimeout = setTimeout(() => {
      item.classList.remove('dropdown-active');
    }, 300);
  });
});
```

### 9.2 Animation avancée
```javascript
// CTA button glow effect
const forgeCTA = document.querySelector('.forge-cta');
let glowInterval;

const startGlowAnimation = () => {
  let intensity = 0;
  let increasing = true;
  
  glowInterval = setInterval(() => {
    if (increasing) {
      intensity += 0.02;
      if (intensity >= 1) increasing = false;
    } else {
      intensity -= 0.02;
      if (intensity <= 0.3) increasing = true;
    }
    
    forgeCTA.style.boxShadow = `0 0 ${Math.round(15 * intensity)}px ${Math.round(5 * intensity)}px rgba(245, 158, 11, ${intensity * 0.4})`;
  }, 50);
};

startGlowAnimation();

// Search expansion animation
const searchToggle = document.querySelector('.search-toggle');
const searchInput = document.querySelector('.search-input');

searchToggle.addEventListener('click', () => {
  searchToggle.classList.toggle('active');
  searchInput.classList.toggle('expanded');
  if (searchInput.classList.contains('expanded')) {
    setTimeout(() => searchInput.focus(), 300);
  }
});
```

## 10. Accessibilité et Performance

### 10.1 Optimisations d'accessibilité
- **ARIA attributes**:
  - `aria-expanded`: Pour indiquer l'état des dropdowns
  - `aria-current="page"`: Pour indiquer la page active
  - `aria-label`: Pour les éléments sans texte visible
- **Keyboard Navigation**:
  - Tab index configuré pour navigation logique
  - Support touches Escape (fermeture), Enter (activation)
  - Focus visibly styled pour tous les éléments interactifs
- **Contrastes**: Vérifiés et conformes WCAG 2.1 AA (minimum 4.5:1)

### 10.2 Optimisations de performance
- **Lazy Loading**:
  - Chargement différé des mega menus (HTML injecté au besoin)
  - Images mega menu en lazy load
- **Animation Optimizations**:
  - Utilisation de transform et opacity (performances GPU)
  - Throttling des animations scroll (max 60fps)
  - will-change utilisé judicieusement
- **Asset Optimization**:
  - SVG optimisés pour taille minimale
  - Sprites SVG pour icônes fréquentes
  - Preloading des ressources critiques

Cette spécification détaillée de la navbar TokenForge offre un plan complet pour l'implémentation, assurant une cohérence avec le thème "Forge Numérique" tout en garantissant une expérience utilisateur optimale sur toutes les plateformes.

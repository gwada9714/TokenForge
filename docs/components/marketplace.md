# Composants du Marketplace

## Vue d'ensemble

Le marketplace est composé de plusieurs composants React qui permettent aux utilisateurs de lister, rechercher et acheter des tokens.

## Composants

### MarketplaceList

```typescript
import { MarketplaceList } from "@/components/features/marketplace";
```

Composant principal qui affiche la liste des items du marketplace.

#### Props

Aucune prop requise.

#### Exemple d'utilisation

```tsx
<MarketplaceList />
```

### MarketplaceItem

```typescript
import { MarketplaceItem } from "@/components/features/marketplace";
```

Affiche un item individuel du marketplace.

#### Props

```typescript
interface MarketplaceItemProps {
  item: {
    id: string;
    name: string;
    description: string;
    price: string;
    seller: string;
    tokenAddress: string;
    tokenSymbol: string;
    tokenDecimals: number;
    status: "active" | "sold" | "cancelled";
    createdAt: number;
    updatedAt: number;
  };
}
```

#### Exemple d'utilisation

```tsx
<MarketplaceItem item={itemData} />
```

### MarketplaceFilters

```typescript
import { MarketplaceFilters } from "@/components/features/marketplace";
```

Permet de filtrer et trier les items du marketplace.

#### Props

```typescript
interface MarketplaceFiltersProps {
  onFilter: (filters: MarketplaceFilters) => void;
}
```

#### Exemple d'utilisation

```tsx
<MarketplaceFilters onFilter={handleFilter} />
```

### MarketplaceStats

```typescript
import { MarketplaceStats } from "@/components/features/marketplace";
```

Affiche les statistiques globales du marketplace.

#### Props

```typescript
interface MarketplaceStatsProps {
  stats: {
    totalItems: number;
    totalVolume: string;
    activeItems: number;
    soldItems: number;
  };
}
```

#### Exemple d'utilisation

```tsx
<MarketplaceStats stats={marketplaceStats} />
```

## Hooks

### useMarketplace

```typescript
import { useMarketplace } from "@/components/features/marketplace";
```

Hook personnalisé pour gérer l'état et les interactions avec le marketplace.

#### Retourne

```typescript
{
  items: MarketplaceItem[];
  stats: MarketplaceStats;
  isLoading: boolean;
  error: string | null;
  loadItems: (filters?: MarketplaceFilters) => Promise<void>;
  loadStats: () => Promise<void>;
  createItem: (item: Omit<MarketplaceItem, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}
```

#### Exemple d'utilisation

```tsx
const { items, stats, isLoading, error, loadItems } = useMarketplace();
```

## Tests

Les tests pour chaque composant sont disponibles dans le dossier `__tests__`. Pour exécuter les tests :

```bash
npm test
```

## Styles

Les composants utilisent Material-UI pour le style. Les thèmes peuvent être personnalisés via le fichier de configuration du thème.

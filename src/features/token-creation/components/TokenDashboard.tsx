import React, { useEffect } from "react";
import { useTokenEvents } from "../hooks/useTokenEvents";
import { useTokenDeployment } from "../hooks/useTokenDeployment";
import { NotificationService } from "../services/notificationService";
import { BlockchainNetwork } from "./DeploymentOptions";
import { TokenEventsDashboard } from "./TokenEventsDashboard";
import { EventFilterBar } from "./EventFilterBar";
import { TaxTrendChart } from "./TaxTrendChart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { formatEther } from "viem";

interface TokenDashboardProps {
  network: BlockchainNetwork;
  tokenAddress?: `0x${string}`;
}

export const TokenDashboard: React.FC<TokenDashboardProps> = ({
  network,
  tokenAddress,
}) => {
  const { events, taxEvents, isLoading, error, fetchEvents } = useTokenEvents(
    network,
    tokenAddress
  );

  const [filteredEvents, setFilteredEvents] = React.useState(events);
  const notificationService = React.useMemo(
    () =>
      new NotificationService({
        enableDesktopNotifications: true,
        enableSoundAlerts: true,
        minTaxAmount: BigInt("100000000000000000"), // 0.1 tokens
      }),
    []
  );

  // Surveiller les nouveaux événements pour les notifications
  useEffect(() => {
    const lastEvent = events[events.length - 1];
    if (lastEvent) {
      notificationService.notify(lastEvent);
    }
  }, [events, notificationService]);

  // Calculer les statistiques globales
  const stats = React.useMemo(() => {
    const totalTax = taxEvents.reduce(
      (sum, event) => sum + event.amount,
      BigInt(0)
    );

    const last24hTax = taxEvents
      .filter((event) => event.timestamp > Date.now() - 24 * 60 * 60 * 1000)
      .reduce((sum, event) => sum + event.amount, BigInt(0));

    return {
      totalTax: formatEther(totalTax),
      last24hTax: formatEther(last24hTax),
      totalTransactions: events.length,
      uniqueAddresses: new Set(events.flatMap((e) => [e.from, e.to])).size,
    };
  }, [events, taxEvents]);

  if (error) {
    return (
      <Card className="bg-destructive/10">
        <CardHeader>
          <CardTitle>Erreur</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques Globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total des Taxes"
          value={`${stats.totalTax} tokens`}
          description="Depuis le lancement"
          loading={isLoading}
        />
        <StatCard
          title="Taxes (24h)"
          value={`${stats.last24hTax} tokens`}
          description="Dernières 24 heures"
          loading={isLoading}
        />
        <StatCard
          title="Transactions"
          value={stats.totalTransactions.toString()}
          description="Nombre total"
          loading={isLoading}
        />
        <StatCard
          title="Adresses Uniques"
          value={stats.uniqueAddresses.toString()}
          description="Participants actifs"
          loading={isLoading}
        />
      </div>

      {/* Barre de filtrage */}
      <EventFilterBar
        events={events}
        onFiltersChange={(filters) => {
          setFilteredEvents(
            events.filter((event) => {
              const matchesType =
                !filters.eventTypes.length ||
                filters.eventTypes.includes(event.type);

              const matchesDate =
                !filters.dateRange ||
                (event.timestamp >= filters.dateRange.start.getTime() &&
                  event.timestamp <= filters.dateRange.end.getTime());

              const matchesAmount =
                !filters.minAmount || event.amount >= filters.minAmount;

              return matchesType && matchesDate && matchesAmount;
            })
          );
        }}
      />

      {/* Graphiques et Événements */}
      <Tabs defaultValue="trends">
        <TabsList>
          <TabsTrigger value="trends">Tendances</TabsTrigger>
          <TabsTrigger value="events">Événements</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <TaxTrendChart events={filteredEvents} />
        </TabsContent>

        <TabsContent value="events">
          <TokenEventsDashboard network={network} tokenAddress={tokenAddress} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  loading,
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      {loading ? (
        <Skeleton className="h-7 w-[120px]" />
      ) : (
        <>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </>
      )}
    </CardContent>
  </Card>
);

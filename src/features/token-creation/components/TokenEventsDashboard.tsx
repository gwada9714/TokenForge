import React from "react";
import { useTokenEvents } from "../hooks/useTokenEvents";
import { BlockchainNetwork } from "./DeploymentOptions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatEther } from "viem";

interface TokenEventsDashboardProps {
  network: BlockchainNetwork;
  tokenAddress?: `0x${string}`;
}

export const TokenEventsDashboard: React.FC<TokenEventsDashboardProps> = ({
  network,
  tokenAddress,
}) => {
  const {
    taxEvents,
    transferEvents,
    mintEvents,
    burnEvents,
    isLoading,
    error,
  } = useTokenEvents(network, tokenAddress);

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

  const totalTaxCollected = taxEvents.reduce(
    (sum, event) => sum + event.amount,
    BigInt(0)
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Tableau de Bord des Événements</CardTitle>
          <CardDescription>
            Suivi en temps réel des activités du token
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total des Taxes"
              value={formatEther(totalTaxCollected)}
              loading={isLoading}
            />
            <StatCard
              title="Transferts"
              value={transferEvents.length.toString()}
              loading={isLoading}
            />
            <StatCard
              title="Mints"
              value={mintEvents.length.toString()}
              loading={isLoading}
            />
            <StatCard
              title="Burns"
              value={burnEvents.length.toString()}
              loading={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tax">
        <TabsList>
          <TabsTrigger value="tax">Taxes</TabsTrigger>
          <TabsTrigger value="transfers">Transferts</TabsTrigger>
          <TabsTrigger value="mints">Mints</TabsTrigger>
          <TabsTrigger value="burns">Burns</TabsTrigger>
        </TabsList>

        <TabsContent value="tax">
          <EventList
            events={taxEvents}
            loading={isLoading}
            emptyMessage="Aucune taxe collectée"
          />
        </TabsContent>

        <TabsContent value="transfers">
          <EventList
            events={transferEvents}
            loading={isLoading}
            emptyMessage="Aucun transfert"
          />
        </TabsContent>

        <TabsContent value="mints">
          <EventList
            events={mintEvents}
            loading={isLoading}
            emptyMessage="Aucun mint"
          />
        </TabsContent>

        <TabsContent value="burns">
          <EventList
            events={burnEvents}
            loading={isLoading}
            emptyMessage="Aucun burn"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, loading }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {loading ? (
          <div className="h-8 bg-muted animate-pulse rounded" />
        ) : (
          value
        )}
      </div>
    </CardContent>
  </Card>
);

interface EventListProps {
  events: Array<any>;
  loading?: boolean;
  emptyMessage: string;
}

const EventList: React.FC<EventListProps> = ({
  events,
  loading,
  emptyMessage,
}) => {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="py-4 text-center text-muted-foreground">
          {emptyMessage}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {events.map((event, index) => (
        <Card key={index}>
          <CardContent className="py-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">
                  {event.type === "TaxCollected" ? "Taxe" : event.type}
                </p>
                <p className="text-sm text-muted-foreground">
                  De: {event.from}
                </p>
                <p className="text-sm text-muted-foreground">À: {event.to}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{formatEther(event.amount)} tokens</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(event.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

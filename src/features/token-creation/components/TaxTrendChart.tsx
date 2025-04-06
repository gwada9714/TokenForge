import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatEther } from "viem";
import { TokenEvent } from "../services/eventMonitorService";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

interface TaxTrendChartProps {
  events: TokenEvent[];
}

type TimeFrame = "day" | "week" | "month";

interface ChartData {
  date: Date;
  taxAmount: bigint;
  transferAmount: bigint;
  count: number;
}

export const TaxTrendChart: React.FC<TaxTrendChartProps> = ({ events }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimeFrame>("week");

  const aggregateEventsByDate = (
    events: TokenEvent[],
    period: "day" | "week" | "month"
  ): ChartData[] => {
    const aggregatedData = new Map<number, ChartData>();

    events.forEach((event) => {
      // Convertir en UTC pour la cohérence
      const date = new Date(event.timestamp);
      const utcDate = Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        period === "month" ? 1 : date.getUTCDate(),
        period === "day" ? date.getUTCHours() : 0
      );

      const key = utcDate;
      const current = aggregatedData.get(key) || {
        date: new Date(utcDate),
        taxAmount: 0n,
        transferAmount: 0n,
        count: 0,
      };

      if (event.type === "TaxCollected") {
        current.taxAmount += event.amount;
      } else if (event.type === "Transfer") {
        current.transferAmount += event.amount;
      }
      current.count++;

      aggregatedData.set(key, current);
    });

    // Trier par date et formater les montants
    return Array.from(aggregatedData.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map((data) => ({
        ...data,
        taxAmount: Number(formatEther(data.taxAmount)),
        transferAmount: Number(formatEther(data.transferAmount)),
      }));
  };

  const formatChartDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    switch (selectedPeriod) {
      case "day":
        return format(date, "HH'h'");
      case "week":
        return format(date, "EEE");
      case "month":
        return format(date, "dd/MM");
      default:
        return format(date, "dd/MM/yyyy");
    }
  };

  const aggregatedData = useMemo(() => {
    const now = new Date();
    const periods = {
      day: 24,
      week: 7,
      month: 30,
    };

    const periodStart = new Date(now);
    switch (selectedPeriod) {
      case "day":
        periodStart.setHours(now.getHours() - 24);
        break;
      case "week":
        periodStart.setDate(now.getDate() - 7);
        break;
      case "month":
        periodStart.setDate(now.getDate() - 30);
        break;
    }

    // Filtrer les événements pour la période
    const filteredEvents = events.filter(
      (event) => event.timestamp >= periodStart.getTime()
    );

    return aggregateEventsByDate(filteredEvents, selectedPeriod);
  }, [events, selectedPeriod]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Tendances des Taxes</CardTitle>
            <CardDescription>
              Évolution des taxes collectées et des transferts
            </CardDescription>
          </div>
          <Select
            value={selectedPeriod}
            onValueChange={(value: TimeFrame) => setSelectedPeriod(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">24 heures</SelectItem>
              <SelectItem value="week">7 jours</SelectItem>
              <SelectItem value="month">30 jours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={aggregatedData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatChartDate}
                stroke="#888888"
                fontSize={12}
              />
              <YAxis
                yAxisId="left"
                stroke="#888888"
                fontSize={12}
                tickFormatter={(value) => `${value} tokens`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#888888"
                fontSize={12}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="taxAmount"
                name="Taxes Collectées"
                stroke="hsl(var(--primary))"
                activeDot={{ r: 8 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="transferAmount"
                name="Nombre de Transferts"
                stroke="hsl(var(--secondary))"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

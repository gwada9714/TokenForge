import React, { useState, useCallback } from 'react';
import { TokenEvent } from '../services/eventMonitorService';
import { EventExportService, ExportOptions } from '../services/eventExportService';
import { Button } from '@/components/ui/button';
import { MultiSelect } from '@/components/ui/multi-select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, FileText, Code } from '@/components/ui/icons';
import { parseEther } from 'viem';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface EventFilterBarProps {
  events: TokenEvent[];
  onFiltersChange: (filters: EventFilters) => void;
}

export interface EventFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  eventTypes: TokenEvent['type'][];
  minAmount?: bigint;
}

export const EventFilterBar: React.FC<EventFilterBarProps> = ({
  events,
  onFiltersChange,
}) => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [minAmount, setMinAmount] = useState<string>('');

  const handleTypeChange = useCallback((types: string[]) => {
    setSelectedTypes(types);
    onFiltersChange({
      eventTypes: types,
      dateRange,
      minAmount: minAmount ? parseEther(minAmount) : undefined,
    });
  }, [dateRange, minAmount, onFiltersChange]);

  const exportEvents = useCallback(
    (events: TokenEvent[], format: 'csv' | 'json', options: ExportOptions) => {
      const exportService = new EventExportService();
      exportService.downloadEvents(events, options);
    },
    []
  );

  return (
    <div className="flex flex-col gap-4 p-4 bg-card rounded-lg shadow-sm">
      <div className="flex flex-wrap gap-4">
        {/* Multi-select pour les types d'événements */}
        <MultiSelect
          value={selectedTypes}
          onValueChange={handleTypeChange}
          options={[
            { label: 'Transferts', value: 'Transfer' },
            { label: 'Taxes', value: 'TaxCollected' },
            { label: 'Mints', value: 'Mint' },
            { label: 'Burns', value: 'Burn' },
          ]}
          placeholder="Filtrer par type"
          className="w-[200px]"
        />

        {/* Sélecteur de plage de dates */}
        <DateRangePicker
          value={dateRange}
          onChange={(range) => {
            setDateRange(range);
            onFiltersChange({
              eventTypes: selectedTypes,
              dateRange: range,
              minAmount: minAmount ? parseEther(minAmount) : undefined,
            });
          }}
          locale={fr}
          placeholder="Sélectionner une période"
        />

        {/* Input pour le montant minimum */}
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={minAmount}
            onChange={(e) => {
              const value = e.target.value;
              setMinAmount(value);
              onFiltersChange({
                eventTypes: selectedTypes,
                dateRange,
                minAmount: value ? parseEther(value) : undefined,
              });
            }}
            placeholder="Montant min."
            className="w-[150px]"
          />
          <span className="text-sm text-muted-foreground">tokens</span>
        </div>

        {/* Boutons d'export */}
        <div className="flex gap-2 ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              exportEvents(events, 'csv', {
                types: selectedTypes,
                dateRange,
                minAmount: minAmount ? parseEther(minAmount) : undefined,
              })
            }
          >
            <FileText className="w-4 h-4 mr-2" />
            Exporter CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              exportEvents(events, 'json', {
                types: selectedTypes,
                dateRange,
                minAmount: minAmount ? parseEther(minAmount) : undefined,
              })
            }
          >
            <Code className="w-4 h-4 mr-2" />
            Exporter JSON
          </Button>
        </div>
      </div>

      {/* Affichage des filtres actifs */}
      {(selectedTypes.length > 0 || dateRange || minAmount) && (
        <div className="flex flex-wrap gap-2">
          {selectedTypes.map((type) => (
            <Badge
              key={type}
              variant="secondary"
              className="cursor-pointer"
              onClick={() =>
                handleTypeChange(selectedTypes.filter((t) => t !== type))
              }
            >
              {type}
              <X className="w-3 h-3 ml-1" />
            </Badge>
          ))}
          {dateRange && (
            <Badge
              variant="secondary"
              className="cursor-pointer"
              onClick={() => {
                setDateRange(undefined);
                onFiltersChange({
                  eventTypes: selectedTypes,
                  dateRange: undefined,
                  minAmount: minAmount ? parseEther(minAmount) : undefined,
                });
              }}
            >
              {format(dateRange.from, 'dd/MM/yyyy')} -{' '}
              {format(dateRange.to, 'dd/MM/yyyy')}
              <X className="w-3 h-3 ml-1" />
            </Badge>
          )}
          {minAmount && (
            <Badge
              variant="secondary"
              className="cursor-pointer"
              onClick={() => {
                setMinAmount('');
                onFiltersChange({
                  eventTypes: selectedTypes,
                  dateRange,
                  minAmount: undefined,
                });
              }}
            >
              Min: {minAmount} tokens
              <X className="w-3 h-3 ml-1" />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

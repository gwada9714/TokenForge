import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventExportService } from "../services/eventExportService";
import type { TokenEvent } from "../services/eventMonitorService";

describe("EventExportService", () => {
  let service: EventExportService;
  let mockEvents: TokenEvent[];

  beforeEach(() => {
    service = new EventExportService();
    mockEvents = [
      {
        type: "TaxCollected",
        from: "0x1234...",
        to: "0x5678...",
        amount: BigInt(1000000000),
        timestamp: 1644515400000, // 2022-02-10
      },
      {
        type: "Transfer",
        from: "0x1234...",
        to: "0x5678...",
        amount: BigInt(5000000000),
        timestamp: 1644601800000, // 2022-02-11
      },
    ];
  });

  describe("exportEvents", () => {
    it("should export to CSV format correctly", () => {
      const result = service.exportEvents(mockEvents, { format: "csv" });
      const lines = result.split("\n");

      expect(lines[0]).toBe("Type,From,To,Amount,Timestamp");
      expect(lines.length).toBe(3); // Header + 2 events
    });

    it("should export to JSON format correctly", () => {
      const result = service.exportEvents(mockEvents, { format: "json" });
      const parsed = JSON.parse(result);

      expect(parsed).toHaveLength(2);
      expect(parsed[0].type).toBe("TaxCollected");
      expect(typeof parsed[0].amount).toBe("string");
    });

    it("should filter by date range", () => {
      const result = service.exportEvents(mockEvents, {
        format: "json",
        dateRange: {
          start: new Date("2022-02-10"),
          end: new Date("2022-02-10"),
        },
      });
      const parsed = JSON.parse(result);

      expect(parsed).toHaveLength(1);
      expect(parsed[0].type).toBe("TaxCollected");
    });

    it("should filter by event type", () => {
      const result = service.exportEvents(mockEvents, {
        format: "json",
        eventTypes: ["Transfer"],
      });
      const parsed = JSON.parse(result);

      expect(parsed).toHaveLength(1);
      expect(parsed[0].type).toBe("Transfer");
    });

    it("should filter by minimum amount", () => {
      const result = service.exportEvents(mockEvents, {
        format: "json",
        minAmount: BigInt(2000000000),
      });
      const parsed = JSON.parse(result);

      expect(parsed).toHaveLength(1);
      expect(parsed[0].type).toBe("Transfer");
    });
  });

  describe("downloadEvents", () => {
    let createObjectURL: typeof URL.createObjectURL;
    let revokeObjectURL: typeof URL.revokeObjectURL;
    let appendChildSpy: jest.SpyInstance;
    let removeChildSpy: jest.SpyInstance;

    beforeEach(() => {
      createObjectURL = URL.createObjectURL;
      revokeObjectURL = URL.revokeObjectURL;
      URL.createObjectURL = vi.fn();
      URL.revokeObjectURL = vi.fn();
      appendChildSpy = vi.spyOn(document.body, "appendChild");
      removeChildSpy = vi.spyOn(document.body, "removeChild");
    });

    afterEach(() => {
      URL.createObjectURL = createObjectURL;
      URL.revokeObjectURL = revokeObjectURL;
      vi.clearAllMocks();
    });

    it("should create and trigger download link", () => {
      service.downloadEvents(mockEvents, { format: "csv" });

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });
  });
});

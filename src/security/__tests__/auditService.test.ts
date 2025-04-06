import { describe, it, expect, vi, beforeEach } from "vitest";
import { auditService } from "../auditService";
import { getFirestore } from "firebase-admin/firestore";
import { TokenForgeError } from "@/utils/errors";
import type { AuditEvent, AuditEventType, AuditLogQuery } from "@/types/audit";

// Mock Firestore
vi.mock("firebase-admin/firestore", () => ({
  getFirestore: vi.fn(() => ({
    collection: vi.fn(() => ({
      add: vi.fn(),
      where: vi.fn(),
      orderBy: vi.fn(),
      limit: vi.fn(),
      get: vi.fn(),
    })),
  })),
}));

describe("Audit Service", () => {
  let mockFirestore: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFirestore = getFirestore();
  });

  describe("logEvent", () => {
    it("logs authentication event successfully", async () => {
      const event: AuditEvent = {
        type: "AUTH" as AuditEventType,
        action: "LOGIN",
        userId: "test-user",
        timestamp: Date.now(),
        metadata: {
          method: "wallet",
          address: "0x1234...",
        },
      };

      const mockAdd = vi.fn().mockResolvedValueOnce({ id: "event-id" });
      vi.mocked(mockFirestore.collection).mockReturnValueOnce({
        add: mockAdd,
      });

      await auditService.logEvent(event);

      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "AUTH",
          action: "LOGIN",
          userId: "test-user",
        })
      );
    });

    it("logs transaction event with details", async () => {
      const event: AuditEvent = {
        type: "TRANSACTION" as AuditEventType,
        action: "SUBMIT",
        userId: "test-user",
        timestamp: Date.now(),
        metadata: {
          txHash: "0xabc...",
          amount: "1.5",
          tokenId: "123",
        },
      };

      const mockAdd = vi.fn().mockResolvedValueOnce({ id: "event-id" });
      vi.mocked(mockFirestore.collection).mockReturnValueOnce({
        add: mockAdd,
      });

      await auditService.logEvent(event);

      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "TRANSACTION",
          metadata: expect.objectContaining({
            txHash: "0xabc...",
          }),
        })
      );
    });

    it("handles logging errors gracefully", async () => {
      const event: AuditEvent = {
        type: "AUTH" as AuditEventType,
        action: "LOGIN",
        userId: "test-user",
        timestamp: Date.now(),
      };

      const mockAdd = vi
        .fn()
        .mockRejectedValueOnce(new Error("Firestore error"));
      vi.mocked(mockFirestore.collection).mockReturnValueOnce({
        add: mockAdd,
      });

      await expect(auditService.logEvent(event)).rejects.toThrow(
        TokenForgeError
      );
    });
  });

  describe("queryEvents", () => {
    it("queries events with filters", async () => {
      const query: AuditLogQuery = {
        type: "AUTH",
        userId: "test-user",
        startDate: new Date(Date.now() - 86400000), // 24 hours ago
        endDate: new Date(),
        limit: 10,
      };

      const mockEvents = [
        {
          id: "event-1",
          data: () => ({
            type: "AUTH",
            action: "LOGIN",
            userId: "test-user",
            timestamp: Date.now(),
          }),
        },
      ];

      const mockGet = vi.fn().mockResolvedValueOnce({ docs: mockEvents });
      const mockWhere = vi.fn().mockReturnThis();
      const mockOrderBy = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockReturnValue({ get: mockGet });

      vi.mocked(mockFirestore.collection).mockReturnValueOnce({
        where: mockWhere,
        orderBy: mockOrderBy,
        limit: mockLimit,
      });

      const results = await auditService.queryEvents(query);

      expect(mockWhere).toHaveBeenCalledWith("type", "==", "AUTH");
      expect(mockWhere).toHaveBeenCalledWith("userId", "==", "test-user");
      expect(mockOrderBy).toHaveBeenCalledWith("timestamp", "desc");
      expect(mockLimit).toHaveBeenCalledWith(10);
      expect(results).toHaveLength(1);
    });

    it("handles empty result set", async () => {
      const query: AuditLogQuery = {
        type: "AUTH",
        limit: 10,
      };

      const mockGet = vi.fn().mockResolvedValueOnce({ docs: [] });
      vi.mocked(mockFirestore.collection).mockReturnValueOnce({
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnValue({ get: mockGet }),
      });

      const results = await auditService.queryEvents(query);
      expect(results).toHaveLength(0);
    });

    it("enforces maximum query limit", async () => {
      const query: AuditLogQuery = {
        limit: 1000, // Exceeds maximum
      };

      const mockGet = vi.fn().mockResolvedValueOnce({ docs: [] });
      const mockLimit = vi.fn().mockReturnValue({ get: mockGet });

      vi.mocked(mockFirestore.collection).mockReturnValueOnce({
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: mockLimit,
      });

      await auditService.queryEvents(query);

      expect(mockLimit).toHaveBeenCalledWith(100); // Maximum limit
    });
  });

  describe("getEventDetails", () => {
    it("retrieves detailed event information", async () => {
      const eventId = "event-id";
      const mockEvent = {
        id: eventId,
        data: () => ({
          type: "TRANSACTION",
          action: "SUBMIT",
          userId: "test-user",
          timestamp: Date.now(),
          metadata: {
            txHash: "0xabc...",
            amount: "1.5",
          },
        }),
      };

      const mockGet = vi.fn().mockResolvedValueOnce(mockEvent);
      vi.mocked(mockFirestore.collection).mockReturnValueOnce({
        doc: vi.fn().mockReturnValue({
          get: mockGet,
        }),
      });

      const event = await auditService.getEventDetails(eventId);

      expect(event).toBeDefined();
      expect(event.type).toBe("TRANSACTION");
      expect(event.metadata.txHash).toBe("0xabc...");
    });

    it("handles non-existent event", async () => {
      const eventId = "non-existent";

      const mockGet = vi.fn().mockResolvedValueOnce({ exists: false });
      vi.mocked(mockFirestore.collection).mockReturnValueOnce({
        doc: vi.fn().mockReturnValue({
          get: mockGet,
        }),
      });

      await expect(auditService.getEventDetails(eventId)).rejects.toThrow(
        TokenForgeError
      );
    });
  });

  describe("getEventsByUser", () => {
    it("retrieves user events with pagination", async () => {
      const userId = "test-user";
      const mockEvents = [
        {
          id: "event-1",
          data: () => ({
            type: "AUTH",
            action: "LOGIN",
            userId,
            timestamp: Date.now(),
          }),
        },
      ];

      const mockGet = vi.fn().mockResolvedValueOnce({ docs: mockEvents });
      vi.mocked(mockFirestore.collection).mockReturnValueOnce({
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnValue({ get: mockGet }),
      });

      const events = await auditService.getEventsByUser(userId, { limit: 10 });

      expect(events).toHaveLength(1);
      expect(events[0].userId).toBe(userId);
    });

    it("handles pagination cursor", async () => {
      const userId = "test-user";
      const cursor = "last-event-id";

      const mockGet = vi.fn().mockResolvedValueOnce({ docs: [] });
      const mockStartAfter = vi.fn().mockReturnValue({
        limit: vi.fn().mockReturnValue({ get: mockGet }),
      });

      vi.mocked(mockFirestore.collection).mockReturnValueOnce({
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        startAfter: mockStartAfter,
      });

      await auditService.getEventsByUser(userId, { cursor, limit: 10 });

      expect(mockStartAfter).toHaveBeenCalledWith(cursor);
    });
  });

  describe("getEventStatistics", () => {
    it("calculates event statistics", async () => {
      const mockEvents = [
        {
          data: () => ({
            type: "AUTH",
            action: "LOGIN",
            timestamp: Date.now(),
          }),
        },
        {
          data: () => ({
            type: "TRANSACTION",
            action: "SUBMIT",
            timestamp: Date.now(),
          }),
        },
      ];

      const mockGet = vi.fn().mockResolvedValueOnce({ docs: mockEvents });
      vi.mocked(mockFirestore.collection).mockReturnValueOnce({
        where: vi.fn().mockReturnThis(),
        get: mockGet,
      });

      const stats = await auditService.getEventStatistics({
        startDate: new Date(Date.now() - 86400000),
        endDate: new Date(),
      });

      expect(stats.totalEvents).toBe(2);
      expect(stats.eventsByType.AUTH).toBe(1);
      expect(stats.eventsByType.TRANSACTION).toBe(1);
    });

    it("handles empty statistics period", async () => {
      const mockGet = vi.fn().mockResolvedValueOnce({ docs: [] });
      vi.mocked(mockFirestore.collection).mockReturnValueOnce({
        where: vi.fn().mockReturnThis(),
        get: mockGet,
      });

      const stats = await auditService.getEventStatistics({
        startDate: new Date(Date.now() - 86400000),
        endDate: new Date(),
      });

      expect(stats.totalEvents).toBe(0);
      expect(Object.keys(stats.eventsByType)).toHaveLength(0);
    });
  });
});

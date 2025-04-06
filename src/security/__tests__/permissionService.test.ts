import { describe, it, expect, vi, beforeEach } from "vitest";
import { permissionService } from "../permissionService";
import { getAuth } from "firebase-admin/auth";
import { TokenForgeError } from "@/utils/errors";
import type { Role, Permission } from "@/types/auth";

// Mock Firebase Admin
vi.mock("firebase-admin/auth", () => ({
  getAuth: vi.fn(() => ({
    getUser: vi.fn(),
    setCustomUserClaims: vi.fn(),
    listUsers: vi.fn(),
  })),
}));

describe("Permission Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup Firebase Admin mock
    vi.mocked(getAuth).mockReturnValue({
      getUser: vi.fn().mockResolvedValue({
        uid: "test-uid",
        email: "test@example.com",
        customClaims: {},
      }),
      setCustomUserClaims: vi.fn(),
      listUsers: vi.fn().mockResolvedValue({
        users: [],
      }),
    } as any);
  });

  describe("assignRole", () => {
    it("assigns admin role successfully", async () => {
      const uid = "test-uid";
      const role: Role = "admin";

      await permissionService.assignRole(uid, role);

      expect(getAuth().setCustomUserClaims).toHaveBeenCalledWith(uid, {
        role: "admin",
        permissions: expect.arrayContaining([
          "manage_users",
          "manage_roles",
          "create_token",
          "manage_contracts",
        ]),
      });
    });

    it("assigns user role successfully", async () => {
      const uid = "test-uid";
      const role: Role = "user";

      await permissionService.assignRole(uid, role);

      expect(getAuth().setCustomUserClaims).toHaveBeenCalledWith(uid, {
        role: "user",
        permissions: expect.arrayContaining(["create_token", "view_contracts"]),
      });
    });

    it("throws error for invalid role", async () => {
      const uid = "test-uid";
      const role = "invalid-role" as Role;

      await expect(permissionService.assignRole(uid, role)).rejects.toThrow(
        TokenForgeError
      );
    });
  });

  describe("grantPermission", () => {
    it("grants new permission successfully", async () => {
      const uid = "test-uid";
      const permission: Permission = "create_token";

      vi.mocked(getAuth().getUser).mockResolvedValueOnce({
        uid,
        customClaims: {
          permissions: ["view_contracts"],
        },
      } as any);

      await permissionService.grantPermission(uid, permission);

      expect(getAuth().setCustomUserClaims).toHaveBeenCalledWith(uid, {
        permissions: expect.arrayContaining(["view_contracts", "create_token"]),
      });
    });

    it("handles duplicate permission", async () => {
      const uid = "test-uid";
      const permission: Permission = "view_contracts";

      vi.mocked(getAuth().getUser).mockResolvedValueOnce({
        uid,
        customClaims: {
          permissions: ["view_contracts"],
        },
      } as any);

      await permissionService.grantPermission(uid, permission);

      expect(getAuth().setCustomUserClaims).not.toHaveBeenCalled();
    });

    it("throws error for invalid permission", async () => {
      const uid = "test-uid";
      const permission = "invalid-permission" as Permission;

      await expect(
        permissionService.grantPermission(uid, permission)
      ).rejects.toThrow(TokenForgeError);
    });
  });

  describe("revokePermission", () => {
    it("revokes permission successfully", async () => {
      const uid = "test-uid";
      const permission: Permission = "create_token";

      vi.mocked(getAuth().getUser).mockResolvedValueOnce({
        uid,
        customClaims: {
          permissions: ["view_contracts", "create_token"],
        },
      } as any);

      await permissionService.revokePermission(uid, permission);

      expect(getAuth().setCustomUserClaims).toHaveBeenCalledWith(uid, {
        permissions: ["view_contracts"],
      });
    });

    it("handles non-existent permission", async () => {
      const uid = "test-uid";
      const permission: Permission = "manage_users";

      vi.mocked(getAuth().getUser).mockResolvedValueOnce({
        uid,
        customClaims: {
          permissions: ["view_contracts"],
        },
      } as any);

      await permissionService.revokePermission(uid, permission);

      expect(getAuth().setCustomUserClaims).not.toHaveBeenCalled();
    });
  });

  describe("hasPermission", () => {
    it("checks existing permission", async () => {
      const uid = "test-uid";
      const permission: Permission = "create_token";

      vi.mocked(getAuth().getUser).mockResolvedValueOnce({
        uid,
        customClaims: {
          permissions: ["create_token", "view_contracts"],
        },
      } as any);

      const result = await permissionService.hasPermission(uid, permission);
      expect(result).toBe(true);
    });

    it("checks missing permission", async () => {
      const uid = "test-uid";
      const permission: Permission = "manage_users";

      vi.mocked(getAuth().getUser).mockResolvedValueOnce({
        uid,
        customClaims: {
          permissions: ["view_contracts"],
        },
      } as any);

      const result = await permissionService.hasPermission(uid, permission);
      expect(result).toBe(false);
    });

    it("handles user without permissions", async () => {
      const uid = "test-uid";
      const permission: Permission = "view_contracts";

      vi.mocked(getAuth().getUser).mockResolvedValueOnce({
        uid,
        customClaims: {},
      } as any);

      const result = await permissionService.hasPermission(uid, permission);
      expect(result).toBe(false);
    });
  });

  describe("getUserRole", () => {
    it("retrieves user role", async () => {
      const uid = "test-uid";

      vi.mocked(getAuth().getUser).mockResolvedValueOnce({
        uid,
        customClaims: {
          role: "admin",
        },
      } as any);

      const role = await permissionService.getUserRole(uid);
      expect(role).toBe("admin");
    });

    it("returns null for user without role", async () => {
      const uid = "test-uid";

      vi.mocked(getAuth().getUser).mockResolvedValueOnce({
        uid,
        customClaims: {},
      } as any);

      const role = await permissionService.getUserRole(uid);
      expect(role).toBeNull();
    });
  });

  describe("getUserPermissions", () => {
    it("retrieves user permissions", async () => {
      const uid = "test-uid";
      const mockPermissions: Permission[] = ["create_token", "view_contracts"];

      vi.mocked(getAuth().getUser).mockResolvedValueOnce({
        uid,
        customClaims: {
          permissions: mockPermissions,
        },
      } as any);

      const permissions = await permissionService.getUserPermissions(uid);
      expect(permissions).toEqual(mockPermissions);
    });

    it("returns empty array for user without permissions", async () => {
      const uid = "test-uid";

      vi.mocked(getAuth().getUser).mockResolvedValueOnce({
        uid,
        customClaims: {},
      } as any);

      const permissions = await permissionService.getUserPermissions(uid);
      expect(permissions).toEqual([]);
    });
  });

  describe("validateRoleHierarchy", () => {
    it("validates admin can manage users", async () => {
      const adminUid = "admin-uid";
      const targetUid = "user-uid";

      vi.mocked(getAuth().getUser)
        .mockResolvedValueOnce({
          uid: adminUid,
          customClaims: { role: "admin" },
        } as any)
        .mockResolvedValueOnce({
          uid: targetUid,
          customClaims: { role: "user" },
        } as any);

      const canManage = await permissionService.validateRoleHierarchy(
        adminUid,
        targetUid
      );
      expect(canManage).toBe(true);
    });

    it("prevents user from managing admin", async () => {
      const userUid = "user-uid";
      const adminUid = "admin-uid";

      vi.mocked(getAuth().getUser)
        .mockResolvedValueOnce({
          uid: userUid,
          customClaims: { role: "user" },
        } as any)
        .mockResolvedValueOnce({
          uid: adminUid,
          customClaims: { role: "admin" },
        } as any);

      const canManage = await permissionService.validateRoleHierarchy(
        userUid,
        adminUid
      );
      expect(canManage).toBe(false);
    });
  });

  describe("updateRolePermissions", () => {
    it("updates role permissions successfully", async () => {
      const role: Role = "user";
      const newPermissions: Permission[] = [
        "create_token",
        "view_contracts",
        "manage_own_tokens",
      ];

      // Mock users with the role
      vi.mocked(getAuth().listUsers).mockResolvedValueOnce({
        users: [
          {
            uid: "user1",
            customClaims: {
              role: "user",
              permissions: ["create_token", "view_contracts"],
            },
          },
          {
            uid: "user2",
            customClaims: {
              role: "user",
              permissions: ["create_token", "view_contracts"],
            },
          },
        ],
      } as any);

      await permissionService.updateRolePermissions(role, newPermissions);

      // Verify all users with the role were updated
      expect(getAuth().setCustomUserClaims).toHaveBeenCalledTimes(2);
      expect(getAuth().setCustomUserClaims).toHaveBeenCalledWith("user1", {
        role: "user",
        permissions: newPermissions,
      });
      expect(getAuth().setCustomUserClaims).toHaveBeenCalledWith("user2", {
        role: "user",
        permissions: newPermissions,
      });
    });

    it("validates required permissions", async () => {
      const role: Role = "user";
      const invalidPermissions: Permission[] = [];

      await expect(
        permissionService.updateRolePermissions(role, invalidPermissions)
      ).rejects.toThrow(TokenForgeError);
    });
  });
});

import { describe, it, expect } from "vitest";
import { RoleLevel, PillarType } from "../types";

describe("Staff Roles & RBAC Allowlist Security", () => {
  const canAccess = (
    role: RoleLevel | null,
    assignedPillars: PillarType[],
    sectionId: string,
  ): boolean => {
    if (!role) return false;
    if (role === "owner" || role === "admin") return true;
    if (role === "manager") {
      const allowed = [
        "overview",
        "goods",
        "food",
        "walks",
        "workshops",
        "queues",
        "manifest",
        "spotlight",
        "whatsapp",
        "roles",
      ];
      return allowed.includes(sectionId);
    }
    if (role === "coordinator") {
      if (["goods", "food", "walks", "workshops"].includes(sectionId)) {
        return assignedPillars.includes(sectionId as PillarType);
      }
      return false;
    }
    if (role === "host") {
      return sectionId === "manifest";
    }
    return false;
  };

  it("blocks unknown or unauthenticated accounts from every section", () => {
    expect(canAccess(null, [], "overview")).toBe(false);
    expect(canAccess(null, [], "food")).toBe(false);
    expect(canAccess(null, [], "payouts")).toBe(false);
  });

  it("gives Owner full access across all sections", () => {
    expect(canAccess("owner", [], "overview")).toBe(true);
    expect(canAccess("owner", [], "payouts")).toBe(true);
    expect(canAccess("owner", [], "coupons")).toBe(true);
    expect(canAccess("owner", [], "roles")).toBe(true);
    expect(canAccess("owner", [], "food")).toBe(true);
  });

  it("restricts Manager to operations-only and blocks financial payouts and coupons", () => {
    expect(canAccess("manager", [], "overview")).toBe(true);
    expect(canAccess("manager", [], "food")).toBe(true);
    expect(canAccess("manager", [], "walks")).toBe(true);
    expect(canAccess("manager", [], "whatsapp")).toBe(true);
    expect(canAccess("manager", [], "payouts")).toBe(false);
    expect(canAccess("manager", [], "coupons")).toBe(false);
  });

  it("strictly bounds Coordinator to their assigned pillar grants", () => {
    expect(canAccess("coordinator", ["food"], "food")).toBe(true);
    expect(canAccess("coordinator", ["food"], "walks")).toBe(false);
    expect(canAccess("coordinator", ["food"], "payouts")).toBe(false);
    expect(canAccess("coordinator", ["walks", "workshops"], "walks")).toBe(true);
    expect(canAccess("coordinator", ["walks", "workshops"], "workshops")).toBe(true);
    expect(canAccess("coordinator", ["walks", "workshops"], "food")).toBe(false);
  });

  it("limits Host to manifest check-in for assigned sessions", () => {
    expect(canAccess("host", [], "manifest")).toBe(true);
    expect(canAccess("host", [], "food")).toBe(false);
    expect(canAccess("host", [], "payouts")).toBe(false);
  });
});

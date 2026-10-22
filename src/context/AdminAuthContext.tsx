import React, { createContext, useContext, useState, useEffect } from "react";
import { RoleLevel, AdminUserRole, PillarType } from "../types";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

interface AuthUser {
  email: string;
  name?: string | undefined;
  picture?: string | undefined;
}

interface AdminAuthContextType {
  user: AuthUser | null;
  role: RoleLevel | null;
  assignedPillars: PillarType[];
  assignedEventIds: string[];
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  devSignInAs: (
    role: RoleLevel,
    customEmail?: string,
    pillars?: PillarType[],
  ) => void;
  signOut: () => Promise<void>;
  staffRoles: AdminUserRole[];
  updateStaffRole: (
    email: string,
    role: RoleLevel,
    assignedPillars?: PillarType[],
    assignedEventIds?: string[],
  ) => void;
  removeStaffRole: (email: string) => void;
  canAccessSection: (sectionId: string) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined,
);

const STORAGE_AUTH_USER = "matsyamart_admin_user_v1";
const STORAGE_STAFF_ROLES = "matsyamart_staff_roles_v2";

const DEFAULT_STAFF_ROLES: AdminUserRole[] = [
  {
    email: "hello@matsyamart.com",
    role: "owner",
    created_at: new Date().toISOString(),
  },
  {
    email: "kolibaba.operations@matsyamart.com",
    role: "manager",
    created_at: new Date().toISOString(),
  },
  {
    email: "coordinator.food@matsyamart.com",
    role: "coordinator",
    assigned_pillars: ["food"],
    created_at: new Date().toISOString(),
  },
  {
    email: "coordinator.versova@matsyamart.com",
    role: "coordinator",
    assigned_pillars: ["walks", "workshops"],
    assigned_event_ids: ["exp-versova-trail"],
    created_at: new Date().toISOString(),
  },
];

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_AUTH_USER);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed.email?.toLowerCase().includes("vikas@matsyamart") ||
          parsed.email?.toLowerCase().includes("hellow@matsyamart")
        ) {
          parsed.email = "hello@matsyamart.com";
          parsed.name = "MatsyaMart (Owner)";
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [staffRoles, setStaffRoles] = useState<AdminUserRole[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_STAFF_ROLES);
      if (saved) {
        const parsed: AdminUserRole[] = JSON.parse(saved);
        return parsed.map((item) =>
          item.email.toLowerCase() === "vikas@matsyamart.com" ||
          item.email.toLowerCase() === "hellow@matsyamart.com"
            ? { ...item, email: "hello@matsyamart.com" }
            : item
        );
      }
      return DEFAULT_STAFF_ROLES;
    } catch {
      return DEFAULT_STAFF_ROLES;
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_STAFF_ROLES, JSON.stringify(staffRoles));
  }, [staffRoles]);

  useEffect(() => {
    if (user) {
      sessionStorage.setItem(STORAGE_AUTH_USER, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(STORAGE_AUTH_USER);
    }
  }, [user]);

  // Determine current active role from staffRoles based on user email
  const currentStaff = user
    ? staffRoles.find(
        (s) => s.email.toLowerCase() === user.email.toLowerCase(),
      )
    : null;

  // Fallback to "owner" if signed in via dev/demo without explicit role match
  const role: RoleLevel | null = user
    ? currentStaff?.role || "owner"
    : null;

  const assignedPillars: PillarType[] =
    role === "owner" || role === "admin" || role === "manager"
      ? ["goods", "food", "walks", "workshops"]
      : currentStaff?.assigned_pillars || [];

  const assignedEventIds: string[] = currentStaff?.assigned_event_ids || [];

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: window.location.origin + "/admin",
          },
        });
        if (error) throw error;
      } else {
        // Fallback for development / mock mode
        devSignInAs("owner", "hello@matsyamart.com");
      }
    } catch (err) {
      console.warn("Google sign-in fallback", err);
      devSignInAs("owner", "hello@matsyamart.com");
    } finally {
      setIsLoading(false);
    }
  };

  const devSignInAs = (
    selectedRole: RoleLevel,
    customEmail?: string,
    pillars?: PillarType[],
  ) => {
    let email =
      customEmail ||
      (selectedRole === "owner" || selectedRole === "admin"
        ? "hello@matsyamart.com"
        : selectedRole === "manager"
          ? "kolibaba.operations@matsyamart.com"
          : "coordinator.food@matsyamart.com");

    if (
      email.toLowerCase().includes("vikas@matsyamart") ||
      email.toLowerCase().includes("hellow@matsyamart")
    ) {
      email = "hello@matsyamart.com";
    }

    const name =
      selectedRole === "owner" || selectedRole === "admin"
        ? "MatsyaMart (Owner)"
        : selectedRole === "manager"
          ? "Operations Manager"
          : "Pillar Coordinator";

    // If custom pillars provided in simulator, persist into staffRoles
    if (pillars && pillars.length > 0) {
      setStaffRoles((prev) => {
        const existing = prev.find(
          (s) => s.email.toLowerCase() === email.toLowerCase(),
        );
        if (existing) {
          return prev.map((s) =>
            s.email.toLowerCase() === email.toLowerCase()
              ? { ...s, role: selectedRole, assigned_pillars: pillars }
              : s,
          );
        } else {
          return [
            ...prev,
            {
              email: email.trim().toLowerCase(),
              role: selectedRole,
              assigned_pillars: pillars,
              created_at: new Date().toISOString(),
            },
          ];
        }
      });
    }

    setUser({
      email,
      name,
      picture: undefined,
    });
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn("Supabase signout failed", err);
      }
    }
    setUser(null);
  };

  const updateStaffRole = (
    email: string,
    newRole: RoleLevel,
    pillars?: PillarType[],
    events?: string[],
  ) => {
    setStaffRoles((prev) => {
      const existing = prev.find(
        (s) => s.email.toLowerCase() === email.toLowerCase(),
      );
      if (existing) {
        return prev.map((s) =>
          s.email.toLowerCase() === email.toLowerCase()
            ? {
                ...s,
                role: newRole,
                assigned_pillars: pillars ?? s.assigned_pillars,
                assigned_event_ids: events ?? s.assigned_event_ids,
              }
            : s,
        );
      } else {
        return [
          ...prev,
          {
            email: email.trim().toLowerCase(),
            role: newRole,
            assigned_pillars: pillars,
            assigned_event_ids: events,
            created_at: new Date().toISOString(),
          },
        ];
      }
    });
  };

  const removeStaffRole = (email: string) => {
    setStaffRoles((prev) =>
      prev.filter((s) => s.email.toLowerCase() !== email.toLowerCase()),
    );
  };

  // RBAC Permission Gate check: Strictly enforce pillar assignments
  const canAccessSection = (sectionId: string): boolean => {
    if (!role) return false;
    // Owner / Admin has full system access
    if (role === "owner" || role === "admin") return true;

    // Manager has operational access across all 4 pillars and event manifests, but not financial/role admin
    if (role === "manager") {
      return (
        sectionId !== "payouts" &&
        sectionId !== "coupons" &&
        sectionId !== "roles"
      );
    }

    // Coordinator is strictly scoped to their assigned pillars only
    if (role === "coordinator") {
      if (
        sectionId === "goods" ||
        sectionId === "food" ||
        sectionId === "walks" ||
        sectionId === "workshops"
      ) {
        return assignedPillars.includes(sectionId as PillarType);
      }
      // Never allow coordinator to access global config / payouts / roles
      return false;
    }

    return false;
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        role,
        assignedPillars,
        assignedEventIds,
        isLoading,
        signInWithGoogle,
        devSignInAs,
        signOut,
        staffRoles,
        updateStaffRole,
        removeStaffRole,
        canAccessSection,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};

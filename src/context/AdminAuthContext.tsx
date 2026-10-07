import React, { createContext, useContext, useState, useEffect } from "react";
import { RoleLevel, AdminUserRole } from "../types";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

interface AuthUser {
  email: string;
  name?: string | undefined;
  picture?: string | undefined;
}

interface AdminAuthContextType {
  user: AuthUser | null;
  role: RoleLevel | null;
  assignedEventIds: string[];
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  devSignInAs: (role: RoleLevel, customEmail?: string) => void;
  signOut: () => Promise<void>;
  staffRoles: AdminUserRole[];
  updateStaffRole: (
    email: string,
    role: RoleLevel,
    assignedEventIds?: string[],
  ) => void;
  removeStaffRole: (email: string) => void;
  canAccessSection: (sectionId: string) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined,
);

const STORAGE_AUTH_USER = "matsyamart_admin_user_v1";
const STORAGE_STAFF_ROLES = "matsyamart_staff_roles_v1";

const DEFAULT_STAFF_ROLES: AdminUserRole[] = [
  {
    email: "vikas@matsyamart.com",
    role: "admin",
    created_at: new Date().toISOString(),
  },
  {
    email: "kolibaba.operations@matsyamart.com",
    role: "manager",
    created_at: new Date().toISOString(),
  },
  {
    email: "coordinator.versova@matsyamart.com",
    role: "coordinator",
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
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [staffRoles, setStaffRoles] = useState<AdminUserRole[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_STAFF_ROLES);
      return saved ? JSON.parse(saved) : DEFAULT_STAFF_ROLES;
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

  // Fallback to "admin" if signed in via dev/demo without explicit role match
  const role: RoleLevel | null = user
    ? currentStaff?.role || "admin"
    : null;

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
        devSignInAs("admin", "vikas@matsyamart.com");
      }
    } catch (err) {
      console.warn("Google sign-in fallback", err);
      devSignInAs("admin", "vikas@matsyamart.com");
    } finally {
      setIsLoading(false);
    }
  };

  const devSignInAs = (selectedRole: RoleLevel, customEmail?: string) => {
    const email =
      customEmail ||
      (selectedRole === "admin"
        ? "vikas@matsyamart.com"
        : selectedRole === "manager"
          ? "kolibaba.operations@matsyamart.com"
          : "coordinator.versova@matsyamart.com");

    const name =
      selectedRole === "admin"
        ? "Vikas (Admin)"
        : selectedRole === "manager"
          ? "Operations Manager"
          : "Jetty Coordinator";

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
    events?: string[],
  ) => {
    setStaffRoles((prev) => {
      const existing = prev.find(
        (s) => s.email.toLowerCase() === email.toLowerCase(),
      );
      if (existing) {
        return prev.map((s) =>
          s.email.toLowerCase() === email.toLowerCase()
            ? { ...s, role: newRole, assigned_event_ids: events }
            : s,
        );
      } else {
        return [
          ...prev,
          {
            email: email.trim().toLowerCase(),
            role: newRole,
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

  // RBAC Permission Gate check
  const canAccessSection = (sectionId: string): boolean => {
    if (!role) return false;
    if (role === "admin") return true;

    if (role === "manager") {
      // Manager has operational access but cannot manage promo codes or staff roles
      return sectionId !== "coupons" && sectionId !== "roles";
    }

    if (role === "coordinator") {
      // Coordinator is on-ground: only Manifest (guest roster) and Slots & Check-in
      return sectionId === "manifest" || sectionId === "slots";
    }

    return false;
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        role,
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

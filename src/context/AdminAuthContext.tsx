import React, { createContext, useContext, useState, useEffect } from "react";
import { RoleLevel, AdminUserRole, PillarType } from "../types";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

interface AuthUser {
  id?: string | undefined;
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

const STORAGE_AUTH_USER = "matsyamart_admin_user_v2";
const STORAGE_STAFF_ROLES = "matsyamart_staff_roles_v3";

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
        return JSON.parse(saved);
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
        return JSON.parse(saved);
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

  // Sync Supabase Auth session if active
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.["full_name"] || session.user.email.split("@")[0],
          picture: session.user.user_metadata?.["avatar_url"],
        });
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user?.email) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.["full_name"] || session.user.email.split("@")[0],
            picture: session.user.user_metadata?.["avatar_url"],
          });
        } else {
          setUser(null);
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Determine current active role from staffRoles based strictly on user email
  const currentStaff = user
    ? staffRoles.find(
        (s) => s.email.toLowerCase() === user.email.toLowerCase(),
      )
    : null;

  // STRICT ZERO-TRUST SECURITY:
  // If the user is not found in staffRoles, they receive role = null and ZERO administrative access.
  // There is NO fallback to "owner"!
  const role: RoleLevel | null = currentStaff ? currentStaff.role : null;

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
        // In local development without Supabase credentials, sign in with verified demo staff
        devSignInAs("owner", "hello@matsyamart.com");
      }
    } catch (err) {
      console.error("Google sign-in failed:", err);
      // Strictly do NOT grant owner access on failure!
      setUser(null);
      throw err;
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
          : selectedRole === "host"
            ? "host.pranay@matsyamart.com"
            : "coordinator.food@matsyamart.com");

    const name =
      selectedRole === "owner" || selectedRole === "admin"
        ? "MatsyaMart (Owner)"
        : selectedRole === "manager"
          ? "Operations Manager"
          : selectedRole === "host"
            ? "Verified Host"
            : "Pillar Coordinator";

    // Ensure this dev user exists in staffRoles with the selected role
    setStaffRoles((prev) => {
      const existing = prev.find(
        (s) => s.email.toLowerCase() === email.toLowerCase(),
      );
      if (existing) {
        return prev.map((s) =>
          s.email.toLowerCase() === email.toLowerCase()
            ? { ...s, role: selectedRole, assigned_pillars: pillars || s.assigned_pillars }
            : s,
        );
      } else {
        return [
          ...prev,
          {
            email: email.trim().toLowerCase(),
            role: selectedRole,
            assigned_pillars: pillars || (selectedRole === "coordinator" ? ["food"] : undefined),
            created_at: new Date().toISOString(),
          },
        ];
      }
    });

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
    // Clear all protected caches on logout
    sessionStorage.removeItem(STORAGE_AUTH_USER);
    setUser(null);
  };

  const updateStaffRole = (
    email: string,
    newRole: RoleLevel,
    pillars?: PillarType[],
    events?: string[],
  ) => {
    // Permission check: Managers can ONLY update Coordinator workspace grants; they CANNOT promote to Owner or Manager
    if (role === "manager") {
      const targetUser = staffRoles.find(
        (s) => s.email.toLowerCase() === email.toLowerCase(),
      );
      if (targetUser && (targetUser.role === "owner" || targetUser.role === "manager")) {
        throw new Error("Managers cannot modify Owner or Manager accounts.");
      }
      if (newRole === "owner" || newRole === "manager" || newRole === "admin") {
        throw new Error("Managers cannot grant Owner or Manager privileges.");
      }
    } else if (role !== "owner" && role !== "admin") {
      throw new Error("Unauthorized to modify staff roles.");
    }

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
    if (role === "manager") {
      const targetUser = staffRoles.find(
        (s) => s.email.toLowerCase() === email.toLowerCase(),
      );
      if (targetUser && (targetUser.role === "owner" || targetUser.role === "manager")) {
        throw new Error("Managers cannot delete Owner or Manager accounts.");
      }
    } else if (role !== "owner" && role !== "admin") {
      throw new Error("Unauthorized to remove staff roles.");
    }

    setStaffRoles((prev) =>
      prev.filter((s) => s.email.toLowerCase() !== email.toLowerCase()),
    );
  };

  // RBAC Permission Gate check: Explicit allowlists for all capabilities
  const canAccessSection = (sectionId: string): boolean => {
    if (!role) return false;

    // Owner / Admin has full system access
    if (role === "owner" || role === "admin") return true;

    // Manager has operational access across all 4 pillars, manifests, spotlight, queues, and WhatsApp
    // Managers are explicitly BLOCKED from payouts, coupons, and staff role elevation
    if (role === "manager") {
      const MANAGER_ALLOWED_SECTIONS = [
        "overview",
        "goods",
        "food",
        "walks",
        "workshops",
        "queues",
        "manifest",
        "spotlight",
        "whatsapp",
        "roles", // Can view staff list and manage coordinator grants only
      ];
      return MANAGER_ALLOWED_SECTIONS.includes(sectionId);
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
      return false;
    }

    // Host role is only allowed to access the manifest/attendance for assigned sessions
    if (role === "host") {
      return sectionId === "manifest";
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

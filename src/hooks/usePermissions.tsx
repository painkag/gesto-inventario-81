import { useCompany } from "./useCompany";
import type { Database } from "@/integrations/supabase/types";

type UserRole = Database["public"]["Enums"]["user_role"];

interface Permissions {
  // Geral
  canAccessDashboard: boolean;
  
  // Gestão
  canManageProducts: boolean;
  canManageInventory: boolean;
  canManageSales: boolean;
  canManagePurchases: boolean;
  
  // Relatórios
  canViewReports: boolean;
  canViewMovements: boolean;
  
  // Administração (apenas OWNER)
  canAccessSettings: boolean;
  canManageUsers: boolean;
  canManagePlans: boolean;
  
  // Utilidades
  hasAccess: (requiredRole: UserRole) => boolean;
  isOwner: boolean;
  isStaff: boolean;
}

export function usePermissions(): Permissions {
  const { role, isOwner, isStaff } = useCompany();

  const hasAccess = (requiredRole: UserRole): boolean => {
    if (!role) return false;
    
    // OWNER tem acesso a tudo
    if (role === "OWNER") return true;
    
    // STAFF só tem acesso se o requiredRole for STAFF
    if (role === "STAFF" && requiredRole === "STAFF") return true;
    
    return false;
  };

  return {
    // Geral
    canAccessDashboard: !!role,
    
    // Gestão (ambos OWNER e STAFF)
    canManageProducts: !!role,
    canManageInventory: !!role,
    canManageSales: !!role,
    canManagePurchases: !!role,
    
    // Relatórios (ambos OWNER e STAFF)
    canViewReports: !!role,
    canViewMovements: !!role,
    
    // Administração (apenas OWNER)
    canAccessSettings: isOwner,
    canManageUsers: isOwner,
    canManagePlans: isOwner,
    
    // Utilidades
    hasAccess,
    isOwner,
    isStaff,
  };
}
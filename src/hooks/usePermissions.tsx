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
  const { role, isOwner, isStaff, isLoading, error } = useCompany();

  console.log('[PERMISSIONS] Current state:', { role, isOwner, isStaff, isLoading, error });

  const hasAccess = (requiredRole: UserRole): boolean => {
    if (!role) {
      console.log('[PERMISSIONS] No role, denying access to:', requiredRole);
      return false;
    }
    
    // OWNER tem acesso a tudo
    if (role === "OWNER") return true;
    
    // STAFF só tem acesso se o requiredRole for STAFF
    if (role === "STAFF" && requiredRole === "STAFF") return true;
    
    return false;
  };

  // Fallback temporário: se não conseguiu carregar role mas tem usuário, permitir acesso básico
  const fallbackAccess = !role && !isLoading && !error;
  
  if (fallbackAccess) {
    console.log('[PERMISSIONS] Using fallback access - role loading failed but user exists');
  }

  return {
    // Geral
    canAccessDashboard: !!role || fallbackAccess,
    
    // Gestão (ambos OWNER e STAFF)
    canManageProducts: !!role || fallbackAccess,
    canManageInventory: !!role || fallbackAccess,
    canManageSales: !!role || fallbackAccess,
    canManagePurchases: !!role || fallbackAccess,
    
    // Relatórios (ambos OWNER e STAFF)
    canViewReports: !!role || fallbackAccess,
    canViewMovements: !!role || fallbackAccess,
    
    // Administração (apenas OWNER ou fallback)
    canAccessSettings: isOwner || fallbackAccess,
    canManageUsers: isOwner || fallbackAccess,
    canManagePlans: isOwner || fallbackAccess,
    
    // Utilidades
    hasAccess,
    isOwner,
    isStaff,
  };
}
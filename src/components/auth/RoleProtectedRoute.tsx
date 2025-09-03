import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { Loader2, ShieldX } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Database } from "@/integrations/supabase/types";

type UserRole = Database["public"]["Enums"]["user_role"];

interface RoleProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  fallbackPath?: string;
  showErrorPage?: boolean;
}

const RoleProtectedRoute = ({ 
  children, 
  requiredRole = "STAFF",
  fallbackPath = "/dashboard",
  showErrorPage = true
}: RoleProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { hasAccess, isOwner, isStaff } = usePermissions();
  const location = useLocation();

  console.log('[ROLE_PROTECTED_ROUTE] State:', { 
    user: !!user, 
    authLoading, 
    requiredRole, 
    path: location.pathname 
  });

  // Loading auth
  if (authLoading) {
    console.log('[ROLE_PROTECTED_ROUTE] Auth still loading...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    console.log('[ROLE_PROTECTED_ROUTE] No user, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role permissions
  const canAccess = hasAccess(requiredRole);
  console.log('[ROLE_PROTECTED_ROUTE] Access check:', { requiredRole, canAccess });

  if (!canAccess) {
    console.log('[ROLE_PROTECTED_ROUTE] Access denied, redirecting to:', fallbackPath);
    
    if (!showErrorPage) {
      return <Navigate to={fallbackPath} replace />;
    }

    // Show error page
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-destructive/10 rounded-full w-fit">
              <ShieldX className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-xl">Acesso Negado</CardTitle>
            <CardDescription>
              Você não tem permissão para acessar esta página.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-sm text-muted-foreground">
              {isStaff && (
                <p>Esta funcionalidade está disponível apenas para administradores da empresa.</p>
              )}
              {!isOwner && !isStaff && (
                <p>Entre em contato com o administrador da sua empresa.</p>
              )}
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.history.back()}
            >
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('[ROLE_PROTECTED_ROUTE] Access granted, rendering children');
  return <>{children}</>;
};

export default RoleProtectedRoute;
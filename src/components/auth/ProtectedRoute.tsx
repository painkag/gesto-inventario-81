import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

const ProtectedRoute = ({ children, redirectTo = '/login' }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log('[PROTECTED_ROUTE] Auth state:', { user: !!user, loading, path: location.pathname });

  if (loading) {
    console.log('[PROTECTED_ROUTE] Still loading auth...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('[PROTECTED_ROUTE] No user, redirecting to:', redirectTo);
    // Salvar a rota atual para redirecionar após login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  console.log('[PROTECTED_ROUTE] User authenticated, rendering children');
  return <>{children}</>;
};

export default ProtectedRoute;
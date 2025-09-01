import { ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBilling } from '@/hooks/useBilling';
import { Loader2, CreditCard, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SystemBlockedGuardProps {
  children: ReactNode;
}

const SystemBlockedGuard = ({ children }: SystemBlockedGuardProps) => {
  const { isBlocked, isLoading, planDisplayName } = useBilling();
  const location = useLocation();
  const navigate = useNavigate();

  // Rotas que podem ser acessadas mesmo com sistema bloqueado
  const allowedWhenBlocked = [
    '/dashboard/plano',
    '/checkout-processing',
    '/login',
    '/register',
    '/forgot-password',
    '/'
  ];

  const isAllowedRoute = allowedWhenBlocked.some(route => 
    location.pathname === route || location.pathname.startsWith(route)
  );

  useEffect(() => {
    if (!isLoading && isBlocked && !isAllowedRoute) {
      navigate('/dashboard/plano', { replace: true });
    }
  }, [isBlocked, isLoading, isAllowedRoute, navigate]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Verificando status da assinatura...</p>
        </div>
      </div>
    );
  }

  // Show blocked screen if user is blocked and not on allowed route
  if (isBlocked && !isAllowedRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-destructive/10 rounded-full w-fit">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-xl">Acesso Suspenso</CardTitle>
            <CardDescription>
              Sua assinatura precisa ser regularizada para continuar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Sistema Bloqueado:</strong> Plano atual: {planDisplayName}. 
                Para reativar o acesso, regularize o pagamento da sua assinatura.
              </AlertDescription>
            </Alert>
            
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                O acesso ao sistema foi temporariamente suspenso devido a problemas com o pagamento. 
                Regularize sua situação para continuar usando todas as funcionalidades.
              </p>
              
              <Button 
                className="w-full gap-2"
                onClick={() => navigate('/dashboard/plano')}
              >
                <CreditCard className="h-4 w-4" />
                Regularizar Pagamento
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/login')}
              >
                Fazer Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Normal flow - render children
  return <>{children}</>;
};

export default SystemBlockedGuard;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Clock, AlertTriangle, XCircle, RefreshCw } from "lucide-react";
import { useBilling, useCheckout } from "@/hooks/useBilling";

interface SubscriptionStatusCardProps {
  onManageSubscription?: () => void;
}

export function SubscriptionStatusCard({ onManageSubscription }: SubscriptionStatusCardProps) {
  const { 
    subscriptionStatus, 
    isActive, 
    isPending, 
    isPastDue,
    daysUntilExpiry,
    hasSystemAccess,
    refreshSubscription,
    subscriptionData,
    isLoading 
  } = useBilling();
  
  const { createCheckout } = useCheckout();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <CardTitle className="text-sm">Verificando status...</CardTitle>
          </div>
        </CardHeader>
      </Card>
    );
  }

  const getStatusInfo = () => {
    switch (subscriptionStatus) {
      case 'ACTIVE':
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-600" />,
          title: "Pagamento em dia",
          description: `Sua assinatura está ativa${daysUntilExpiry ? ` e renova em ${daysUntilExpiry} dias` : ''}`,
          variant: "default" as const,
          color: "bg-green-50 border-green-200",
          badgeColor: "bg-green-100 text-green-800"
        };
      case 'PENDING':
        return {
          icon: <Clock className="h-4 w-4 text-yellow-600" />,
          title: "Pagamento processando",
          description: "Aguardando confirmação do pagamento. Pode levar alguns minutos.",
          variant: "default" as const,
          color: "bg-yellow-50 border-yellow-200",
          badgeColor: "bg-yellow-100 text-yellow-800"
        };
      case 'PAST_DUE':
        return {
          icon: <AlertTriangle className="h-4 w-4 text-red-600" />,
          title: "Pagamento em atraso",
          description: "Regularize seu pagamento para manter o acesso ao sistema.",
          variant: "destructive" as const,
          color: "bg-red-50 border-red-200",
          badgeColor: "bg-red-100 text-red-800"
        };
      case 'CANCELED':
        return {
          icon: <XCircle className="h-4 w-4 text-gray-600" />,
          title: "Assinatura cancelada",
          description: "Sua assinatura foi cancelada. Assine novamente para continuar.",
          variant: "secondary" as const,
          color: "bg-gray-50 border-gray-200",
          badgeColor: "bg-gray-100 text-gray-800"
        };
      default:
        return {
          icon: <XCircle className="h-4 w-4 text-gray-600" />,
          title: "Sem assinatura ativa",
          description: "Escolha um plano para continuar usando o sistema.",
          variant: "secondary" as const,
          color: "bg-gray-50 border-gray-200",
          badgeColor: "bg-gray-100 text-gray-800"
        };
    }
  };

  const statusInfo = getStatusInfo();

  const handleSubscribe = (plan: "essential" | "professional") => {
    createCheckout.mutate(plan);
  };

  return (
    <Card className={`${statusInfo.color} transition-colors`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {statusInfo.icon}
            <CardTitle className="text-sm">{statusInfo.title}</CardTitle>
          </div>
          <Badge className={statusInfo.badgeColor} variant="secondary">
            {subscriptionStatus}
          </Badge>
        </div>
        <CardDescription className="text-sm">
          {statusInfo.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Mostrar plano atual se ativo */}
        {isActive && subscriptionData?.plan && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Plano atual: <span className="font-medium capitalize">{subscriptionData.plan}</span>
              {subscriptionData.ai_enabled && <Badge className="ml-2" variant="secondary">IA Incluída</Badge>}
            </p>
          </div>
        )}

        {/* Ações baseadas no status */}
        <div className="flex flex-col gap-2">
          {isActive && (
            <div className="space-y-2">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Tudo certo! Seu pagamento está em dia.
                </AlertDescription>
              </Alert>
              {onManageSubscription && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onManageSubscription}
                  className="w-full"
                >
                  Gerenciar Assinatura
                </Button>
              )}
            </div>
          )}

          {isPending && (
            <div className="space-y-2">
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Aguardando confirmação do pagamento...
                </AlertDescription>
              </Alert>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshSubscription}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Verificar Status
              </Button>
            </div>
          )}

          {isPastDue && (
            <div className="space-y-2">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Acesso restrito devido ao pagamento em atraso.
                </AlertDescription>
              </Alert>
              {onManageSubscription && (
                <Button 
                  size="sm" 
                  onClick={onManageSubscription}
                  className="w-full"
                >
                  Regularizar Pagamento
                </Button>
              )}
            </div>
          )}

          {(subscriptionStatus === 'INACTIVE' || subscriptionStatus === 'CANCELED') && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSubscribe('essential')}
                  disabled={createCheckout.isPending}
                >
                  Essencial
                </Button>
                <Button 
                  size="sm"
                  onClick={() => handleSubscribe('professional')}
                  disabled={createCheckout.isPending}
                >
                  Profissional
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
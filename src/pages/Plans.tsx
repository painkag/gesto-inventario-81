import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Zap, 
  Star,
  Calendar,
  Users,
  BarChart3,
  Shield
} from "lucide-react";
import { useBilling, useCheckout } from "@/hooks/useBilling";

const Plans = () => {
  const { 
    subscriptionData, 
    subscriptionStatus,
    isActive,
    isPending,
    isPastDue,
    daysUntilExpiry,
    hasSystemAccess,
    isLoading 
  } = useBilling();
  
  const { createCheckout, openCustomerPortal, triggerWebhook, isCreatingCheckout, isOpeningPortal, isTriggeringWebhook } = useCheckout();
  const [showDebug, setShowDebug] = useState(false);

  // Propriedades derivadas para compatibilidade
  const isBlocked = !hasSystemAccess;
  const aiEnabled = subscriptionData?.ai_enabled || false;
  const planDisplayName = subscriptionData?.plan 
    ? (subscriptionData.plan === "professional" ? "Profissional" : "Essencial")
    : "Nenhum plano";

  // Definir planos disponíveis
  const plans = [
    {
      id: "essential",
      name: "Essencial",
      price: 299,
      description: "Para pequenas empresas que querem organizar seu estoque",
      ai_included: false,
      features: [
        "Gestão completa de produtos",
        "Controle de estoque FIFO", 
        "Sistema de vendas (PDV)",
        "Relatórios básicos",
        "3 usuários",
        "Suporte por email",
        "Backup automático"
      ]
    },
    {
      id: "professional",
      name: "Profissional", 
      price: 500,
      description: "Para empresas que querem crescer com inteligência artificial",
      ai_included: true,
      popular: true,
      features: [
        "Tudo do plano Essencial",
        "🤖 Relatórios avançados com IA",
        "🤖 Previsão de demanda",
        "🤖 Análise automática de tendências",
        "Usuários ilimitados",
        "Suporte prioritário",
        "API para integrações",
        "Backup automático avançado"
      ]
    }
  ];

  const currentPlan = plans.find(p => p.id === subscriptionData?.plan);
  const isActivePlan = (planId: string) => subscriptionData?.plan === planId && isActive;

  const handleSubscribe = (planType: "essential" | "professional") => {
    createCheckout.mutate(planType);
  };

  const handleWebhookTest = (eventType: "invoice.paid" | "invoice.payment_failed" | "subscription.canceled", planType?: "essential" | "professional") => {
    triggerWebhook.mutate({ eventType, planType });
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Planos">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Planos & Assinatura">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Planos & Assinatura</h1>
          <p className="text-muted-foreground">
            Gerencie sua assinatura e escolha o melhor plano para sua empresa.
          </p>
        </div>

        {/* Status Alerts */}
        {isBlocked && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Acesso Bloqueado:</strong> Sua assinatura está em atraso. Regularize o pagamento para continuar usando o sistema.
            </AlertDescription>
          </Alert>
        )}

        {subscriptionStatus === "ACTIVE" && daysUntilExpiry && daysUntilExpiry <= 7 && (
          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertDescription>
              <strong>Renovação Próxima:</strong> Sua assinatura vence em {daysUntilExpiry} dias. 
              O pagamento será processado automaticamente.
            </AlertDescription>
          </Alert>
        )}

        {/* Current Subscription Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Status da Assinatura</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Plano Atual</p>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{planDisplayName}</p>
                  {currentPlan?.popular && <Badge variant="default">Popular</Badge>}
                  {aiEnabled && <Badge variant="secondary" className="gap-1">
                    <Zap className="h-3 w-3" />
                    IA
                  </Badge>}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="flex items-center gap-2">
                  {subscriptionStatus === "ACTIVE" && (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-green-600 font-medium">Ativo</span>
                    </>
                  )}
                  {subscriptionStatus === "PENDING" && (
                    <>
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span className="text-yellow-600 font-medium">Pendente</span>
                    </>
                  )}
                  {subscriptionStatus === "PAST_DUE" && (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-red-600 font-medium">Vencido</span>
                    </>
                  )}
                  {subscriptionStatus === "CANCELED" && (
                    <>
                      <XCircle className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 font-medium">Cancelado</span>
                    </>
                  )}
                  {subscriptionStatus === "INACTIVE" && (
                    <>
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span className="text-yellow-600 font-medium">Sem plano</span>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Próxima Cobrança</p>
                <p className="font-medium">
                  {subscriptionData?.current_period_end 
                    ? new Date(subscriptionData.current_period_end).toLocaleDateString('pt-BR')
                    : "N/A"
                  }
                </p>
              </div>
            </div>

            {subscriptionStatus === "PAST_DUE" && (
              <div className="mt-4 space-y-2">
                <Button 
                  onClick={() => handleSubscribe(subscriptionData?.plan as "essential" | "professional")}
                  disabled={isCreatingCheckout}
                  className="gap-2"
                  variant="destructive"
                >
                  <CreditCard className="h-4 w-4" />
                  {isCreatingCheckout ? "Processando..." : "Pagar Agora"}
                </Button>
              </div>
            )}

            {subscriptionStatus === "ACTIVE" && (
              <div className="mt-4">
                <Button 
                  onClick={() => openCustomerPortal.mutate()}
                  disabled={isOpeningPortal}
                  variant="outline"
                  className="gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  {isOpeningPortal ? "Carregando..." : "Gerenciar Assinatura"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Plans */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Planos Disponíveis</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative ${plan.popular ? 'border-primary' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="gap-1">
                      <Star className="h-3 w-3" />
                      Mais Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader>
                  <div className="space-y-2">
                    <CardTitle className="flex items-center gap-2">
                      {plan.name}
                      {isActivePlan(plan.id) && (
                        <Badge variant="outline" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Atual
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">R$ {plan.price}</span>
                      <span className="text-muted-foreground">/mês</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Separator />

                  {isActivePlan(plan.id) ? (
                    <Button disabled className="w-full" variant="outline">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Plano Ativo
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleSubscribe(plan.id as "essential" | "professional")}
                      disabled={isCreatingCheckout}
                      className="w-full gap-2"
                      variant={plan.popular ? "default" : "outline"}
                    >
                      <CreditCard className="h-4 w-4" />
                      {isCreatingCheckout ? "Processando..." : "Assinar Agora"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Debug Panel (Development) */}
        <Card>
          <CardHeader>
            <CardTitle 
              className="cursor-pointer flex items-center gap-2"
              onClick={() => setShowDebug(!showDebug)}
            >
              <BarChart3 className="h-5 w-5" />
              Simulação de Webhooks (Desenvolvimento)
            </CardTitle>
          </CardHeader>
          {showDebug && (
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Esta seção simula eventos de pagamento para testes. Use apenas em desenvolvimento.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleWebhookTest("invoice.paid", "professional")}
                    disabled={isTriggeringWebhook}
                  >
                    ✅ Pagamento Aprovado (Pro)
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleWebhookTest("invoice.payment_failed")}
                    disabled={isTriggeringWebhook}
                  >
                    ❌ Pagamento Recusado
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleWebhookTest("subscription.canceled")}
                    disabled={isTriggeringWebhook}
                  >
                    🚫 Assinatura Cancelada
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Plans;
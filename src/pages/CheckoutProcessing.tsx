import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2, CreditCard, ArrowRight } from "lucide-react";
import { useCheckout } from "@/hooks/useBilling";

const CheckoutProcessing = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { triggerWebhook } = useCheckout();

  const [status, setStatus] = useState<"processing" | "success" | "failed">("processing");
  const [countdown, setCountdown] = useState(5);

  const sessionId = searchParams.get("session_id");
  const plan = searchParams.get("plan");
  const amount = searchParams.get("amount");

  const planName = plan === "professional" ? "Profissional" : "Essencial";
  const hasAI = plan === "professional";

  useEffect(() => {
    if (!sessionId || !plan) {
      navigate("/dashboard/plano");
      return;
    }

    // Simular processamento de pagamento
    const processPayment = async () => {
      // Delay para simular processamento
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 90% de chance de sucesso (para demonstração)
      const success = Math.random() > 0.1;
      
      if (success) {
        setStatus("success");
        
        // Simular webhook de pagamento aprovado após 2 segundos
        setTimeout(() => {
          triggerWebhook.mutate({ eventType: "invoice.paid", planType: plan as "essential" | "professional" });
        }, 2000);
      } else {
        setStatus("failed");
        
        // Simular webhook de pagamento recusado
        setTimeout(() => {
          triggerWebhook.mutate({ eventType: "invoice.payment_failed" });
        }, 2000);
      }
    };

    processPayment();
  }, [sessionId, plan, navigate, triggerWebhook]);

  useEffect(() => {
    if (status === "success" && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (status === "success" && countdown === 0) {
      navigate("/dashboard/plano");
    }
  }, [status, countdown, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            {status === "processing" && (
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            )}
            {status === "success" && (
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            )}
            {status === "failed" && (
              <CreditCard className="h-8 w-8 text-red-500" />
            )}
          </div>
          
          <CardTitle className="text-xl">
            {status === "processing" && "Processando Pagamento"}
            {status === "success" && "Pagamento Aprovado!"}
            {status === "failed" && "Pagamento Recusado"}
          </CardTitle>
          
          <CardDescription>
            {status === "processing" && "Aguarde enquanto processamos seu pagamento..."}
            {status === "success" && "Sua assinatura foi ativada com sucesso"}
            {status === "failed" && "Não foi possível processar o pagamento"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Detalhes da Compra */}
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Plano:</span>
              <div className="flex items-center gap-2">
                <span>{planName}</span>
                {hasAI && (
                  <Badge variant="secondary" className="text-xs">
                    + IA
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Valor:</span>
              <span className="font-semibold">
                R$ {amount ? Number(amount).toLocaleString('pt-BR') : '0'},00/mês
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">ID da Sessão:</span>
              <span className="text-xs text-muted-foreground font-mono">
                {sessionId?.slice(-8)}
              </span>
            </div>
          </div>

          {/* Status Messages */}
          {status === "processing" && (
            <div className="text-center text-sm text-muted-foreground">
              <p>⏳ Validando dados do cartão...</p>
              <p className="mt-2">Isso pode levar alguns segundos.</p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center space-y-3">
              <div className="text-sm text-green-600">
                ✅ Pagamento processado com sucesso!
              </div>
              <div className="text-xs text-muted-foreground">
                Redirecionando em {countdown} segundos...
              </div>
            </div>
          )}

          {status === "failed" && (
            <div className="text-center space-y-3">
              <div className="text-sm text-red-600">
                ❌ Falha no processamento do pagamento
              </div>
              <div className="text-xs text-muted-foreground">
                Verifique os dados do seu cartão e tente novamente.
              </div>
            </div>
          )}

          {/* Actions */}
          {status === "success" && (
            <Button 
              className="w-full gap-2" 
              onClick={() => navigate("/dashboard/plano")}
            >
              <ArrowRight className="h-4 w-4" />
              Ir para Dashboard
            </Button>
          )}

          {status === "failed" && (
            <div className="space-y-2">
              <Button 
                className="w-full" 
                onClick={() => navigate("/dashboard/plano")}
              >
                Tentar Novamente
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => navigate("/dashboard")}
              >
                Voltar ao Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckoutProcessing;
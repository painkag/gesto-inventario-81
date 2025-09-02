import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const sessionId = searchParams.get("session_id");
  const plan = searchParams.get("plan");
  const amount = searchParams.get("amount");

  const planName = plan === "professional" ? "Profissional" : "Essencial";
  const hasAI = plan === "professional";

  useEffect(() => {
    // Se não tem parâmetros necessários, redireciona
    if (!sessionId) {
      const timer = setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [sessionId, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-950 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-green-100 dark:bg-green-900 rounded-full w-fit">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          
          <CardTitle className="text-2xl text-green-700 dark:text-green-400">
            Pagamento Aprovado!
          </CardTitle>
          
          <CardDescription>
            Sua assinatura foi ativada com sucesso. Bem-vindo ao Estoque Manager!
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Detalhes da Assinatura */}
          <div className="space-y-4 p-4 bg-green-50 dark:bg-green-950/50 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex justify-between items-center">
              <span className="font-medium">Plano Ativado:</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{planName}</span>
                {hasAI && (
                  <Badge variant="secondary" className="gap-1">
                    <Sparkles className="h-3 w-3" />
                    IA
                  </Badge>
                )}
              </div>
            </div>
            
            {amount && (
              <div className="flex justify-between items-center">
                <span className="font-medium">Valor:</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  R$ {Number(amount).toLocaleString('pt-BR')},00/mês
                </span>
              </div>
            )}
            
            {sessionId && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">ID da Transação:</span>
                <span className="text-xs font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded">
                  {sessionId.slice(-12)}
                </span>
              </div>
            )}
          </div>

          {/* Benefícios Desbloqueados */}
          <div className="space-y-3">
            <h3 className="font-semibold text-center">🎉 Recursos Desbloqueados:</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Gestão completa de produtos e estoque
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Sistema de vendas (PDV) avançado
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Relatórios detalhados
              </li>
              {hasAI && (
                <>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Análise com Inteligência Artificial
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Previsão de demanda
                    </span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Próximos Passos */}
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Agora você pode aproveitar todos os recursos do sistema!
            </p>
            
            <Button 
              className="w-full gap-2" 
              onClick={() => navigate("/dashboard")}
            >
              <ArrowRight className="h-4 w-4" />
              Ir para Dashboard
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate("/dashboard/plano")}
            >
              Ver Detalhes da Assinatura
            </Button>
          </div>

          {/* Suporte */}
          <div className="text-center pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Tem dúvidas? Entre em contato com nosso suporte.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
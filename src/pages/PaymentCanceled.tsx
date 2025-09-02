import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, RefreshCw, HelpCircle } from "lucide-react";

const PaymentCanceled = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const plan = searchParams.get("plan");
  const planName = plan === "professional" ? "Profissional" : "Essencial";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 dark:from-red-950 dark:to-orange-950 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-red-100 dark:bg-red-900 rounded-full w-fit">
            <XCircle className="h-12 w-12 text-red-500" />
          </div>
          
          <CardTitle className="text-2xl text-red-700 dark:text-red-400">
            Pagamento Cancelado
          </CardTitle>
          
          <CardDescription>
            O processo de pagamento foi cancelado. Nenhuma cobrança foi realizada.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Informações */}
          {plan && (
            <div className="p-4 bg-red-50 dark:bg-red-950/50 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex justify-between items-center">
                <span className="font-medium">Plano Selecionado:</span>
                <span className="font-semibold">{planName}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Este plano não foi ativado.
              </p>
            </div>
          )}

          {/* Possíveis Razões */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Possíveis razões:
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                Cancelamento voluntário durante o processo
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                Problema com os dados do cartão
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                Instabilidade na conexão com internet
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                Limite do cartão insuficiente
              </li>
            </ul>
          </div>

          {/* Ações */}
          <div className="space-y-3">
            <h3 className="font-semibold">O que fazer agora?</h3>
            
            <div className="space-y-2">
              <Button 
                className="w-full gap-2" 
                onClick={() => navigate("/dashboard/plano")}
              >
                <RefreshCw className="h-4 w-4" />
                Tentar Novamente
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar ao Dashboard
              </Button>
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
              💡 Dica
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Você pode continuar usando a versão gratuita ou tentar assinar novamente 
              quando desejar. Seus dados não foram perdidos.
            </p>
          </div>

          {/* Suporte */}
          <div className="text-center pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2">
              Precisa de ajuda com o pagamento?
            </p>
            <Button variant="link" className="text-xs p-0 h-auto">
              Fale com nosso suporte
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCanceled;
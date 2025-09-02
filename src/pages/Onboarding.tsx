import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCompany } from "@/hooks/useCompany";
import SectorStep from "@/components/onboarding/SectorStep";

export default function Onboarding() {
  const { user } = useAuth();
  const { data: company, isLoading } = useCompany();
  const [currentStep, setCurrentStep] = useState(1);

  // Redirect se não autenticado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect se empresa já tem setor definido
  if (!isLoading && company?.sector) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="p-2 bg-gradient-primary rounded-lg shadow-apple">
              <Package className="h-8 w-8 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">Estoque Manager</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Bem-vindo ao Estoque Manager!
            </h1>
            <p className="text-muted-foreground">
              Vamos configurar sua conta em alguns passos rápidos
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-8 rounded-full ${currentStep >= 1 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`h-2 w-8 rounded-full ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`h-2 w-8 rounded-full ${currentStep >= 3 ? 'bg-primary' : 'bg-muted'}`} />
          </div>
        </div>

        {/* Steps */}
        <Card className="shadow-apple-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              {currentStep === 1 && "Escolha o tipo do seu negócio"}
              {currentStep === 2 && "Configurar funcionalidades"}
              {currentStep === 3 && "Tudo pronto!"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Isso nos ajuda a personalizar a experiência para você"}
              {currentStep === 2 && "Selecione as funcionalidades que deseja habilitar"}
              {currentStep === 3 && "Sua conta foi configurada com sucesso"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && (
              <SectorStep onNext={() => setCurrentStep(2)} />
            )}
            
            {currentStep === 2 && (
              <div className="text-center space-y-4">
                <p>Configuração de funcionalidades em desenvolvimento...</p>
                <button 
                  onClick={() => setCurrentStep(3)}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg"
                >
                  Continuar
                </button>
              </div>
            )}
            
            {currentStep === 3 && (
              <div className="text-center space-y-4">
                <div className="text-6xl">🎉</div>
                <p className="text-lg">
                  Sua conta foi configurada com sucesso!
                </p>
                <a 
                  href="/dashboard" 
                  className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Acessar Dashboard
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export const CTASection = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-hero">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Pronto para revolucionar 
              <span className="block text-primary">sua gestão de estoque?</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Junte-se a centenas de empresas que já transformaram 
              suas operações com o Estoque Manager.
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-success" />
              <span>Dados protegidos</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-warning" />
              <span>Setup em 5 minutos</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-success">✓</span>
              <span>LGPD compliant</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button variant="hero" size="hero" className="group" asChild>
              <Link to="/dashboard">
                Começar Teste Grátis Agora
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="group">
              <Play className="h-5 w-5 mr-2" />
              Agendar Demonstração
            </Button>
          </div>

          {/* Trial Details */}
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="font-semibold text-foreground">
              🎉 Teste grátis por 7 dias - Acesso completo a todas as funcionalidades
            </div>
            <div>
              Sem cartão de crédito • Sem compromisso • Suporte incluído
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
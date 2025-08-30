import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Star, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Essencial",
    price: "300",
    period: "mês",
    description: "Perfeito para pequenos negócios que estão começando",
    features: [
      "PDV completo com modo offline",
      "Gestão de estoque e produtos",
      "Relatórios básicos",
      "Até 2 usuários",
      "Suporte por email",
      "App mobile (PWA)",
      "Emissão básica de NF-e"
    ],
    popular: false,
    ctaText: "Começar Teste Grátis"
  },
  {
    name: "Profissional",
    price: "500",
    period: "mês",
    description: "Para empresas que querem crescer com inteligência artificial",
    features: [
      "Tudo do plano Essencial",
      "Relatórios avançados com IA",
      "Previsão de demanda",
      "Análise automática de tendências",
      "Usuários ilimitados",
      "Suporte prioritário",
      "API para integrações",
      "Backup automático avançado",
      "Auditoria completa"
    ],
    popular: true,
    ctaText: "Teste Grátis por 7 dias"
  }
];

export const PricingSection = () => {
  return (
    <section id="precos" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            Preços transparentes
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Sem taxas ocultas, sem pegadinhas. Comece com 7 dias grátis 
            e escolha o plano ideal para seu negócio.
          </p>
        </div>

        {/* Trial Banner */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center space-x-2 bg-success-light border border-success/20 text-success px-6 py-3 rounded-full">
            <Star className="h-5 w-5" />
            <span className="font-semibold">
              7 dias grátis com todas as funcionalidades • Sem cartão de crédito
            </span>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative hover-lift transition-all duration-300 ${
                plan.popular 
                  ? "border-primary shadow-apple-lg scale-105" 
                  : "border-border hover:border-primary/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <Zap className="h-4 w-4" />
                    <span>Mais Popular</span>
                  </div>
                </div>
              )}
              
              <CardHeader className="text-center space-y-4 pt-8">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {plan.description}
                </CardDescription>
                
                <div className="space-y-2">
                  <div className="flex items-baseline justify-center space-x-1">
                    <span className="text-4xl font-bold text-foreground">R$</span>
                    <span className="text-5xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-lg text-muted-foreground">/{plan.period}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Faturamento mensal • Cancele quando quiser
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features List */}
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  variant={plan.popular ? "hero" : "outline"}
                  size="lg"
                  className="w-full"
                  asChild
                >
                  <Link to="/dashboard">{plan.ctaText}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Info */}
        <div className="mt-16 text-center space-y-6">
          <div className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Todos os planos incluem atualizações gratuitas, suporte técnico 
            e conformidade total com a LGPD. Dados protegidos com criptografia de ponta a ponta.
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="ghost">
              Comparar todos os recursos
            </Button>
            <Button variant="link">
              Falar com consultor
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
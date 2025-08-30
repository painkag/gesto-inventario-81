import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Smartphone, 
  Shield, 
  Zap,
  FileText,
  Users,
  Cloud
} from "lucide-react";

const features = [
  {
    icon: ShoppingCart,
    title: "PDV Completo",
    description: "Ponto de venda com scanner de código de barras, múltiplas formas de pagamento e funcionamento offline.",
    color: "text-primary"
  },
  {
    icon: Package,
    title: "Gestão de Estoque",
    description: "Controle automático com sistema FEFO, alertas de validade e baixo estoque em tempo real.",
    color: "text-success"
  },
  {
    icon: BarChart3,
    title: "Relatórios Inteligentes",
    description: "Dashboard com KPIs, gráficos interativos e análises de vendas para tomada de decisão.",
    color: "text-warning"
  },
  {
    icon: Smartphone,
    title: "Mobile & PWA",
    description: "Aplicativo responsivo que funciona perfeitamente em tablets e smartphones como app nativo.",
    color: "text-destructive"
  },
  {
    icon: Shield,
    title: "Segurança & LGPD",
    description: "Conformidade total com LGPD, multi-tenant seguro e auditoria completa de todas as ações.",
    color: "text-primary"
  },
  {
    icon: Zap,
    title: "Integrações",
    description: "Emissão de NF-e, importação de produtos via CSV e sincronização com outros sistemas.",
    color: "text-success"
  },
  {
    icon: FileText,
    title: "Compras & Entradas",
    description: "Gestão completa de fornecedores, controle de lotes e validades com histórico detalhado.",
    color: "text-warning"
  },
  {
    icon: Users,
    title: "Multi-usuário",
    description: "Diferentes níveis de permissão, controle de acesso por módulo e gestão de equipe.",
    color: "text-destructive"
  },
  {
    icon: Cloud,
    title: "Cloud & Backup",
    description: "Dados seguros na nuvem, backup automático e sincronização em tempo real entre dispositivos.",
    color: "text-primary"
  }
];

export const FeaturesSection = () => {
  return (
    <section id="funcionalidades" className="py-16 md:py-24 bg-gradient-surface">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            Tudo que sua empresa precisa
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Uma plataforma completa que cresce junto com seu negócio. 
            Desde o controle básico de estoque até relatórios avançados com IA.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="group hover-lift border-border/50 hover:border-border transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="space-y-4">
                  <div className={`p-3 w-fit rounded-xl bg-gradient-to-br from-primary-light to-secondary ${feature.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">
                      {feature.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-muted-foreground bg-primary-light px-4 py-2 rounded-full">
            <Zap className="h-4 w-4 text-primary" />
            <span>
              <strong className="text-primary">+50 funcionalidades</strong> em constante evolução
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
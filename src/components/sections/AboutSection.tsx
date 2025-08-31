import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Award, 
  Shield, 
  Users, 
  TrendingUp, 
  Clock,
  CheckCircle2,
  Lightbulb
} from "lucide-react";

const stats = [
  { label: "Empresas atendidas", value: "500+", icon: Users },
  { label: "Anos de experiência", value: "8+", icon: Clock },
  { label: "Produtos controlados", value: "2M+", icon: TrendingUp },
  { label: "Tempo de atividade", value: "99.9%", icon: Shield }
];

const values = [
  {
    icon: Target,
    title: "Foco no Cliente",
    description: "Desenvolvemos soluções pensando nas necessidades reais dos nossos clientes."
  },
  {
    icon: Lightbulb,
    title: "Inovação Constante",
    description: "Sempre buscando novas tecnologias para melhorar a experiência do usuário."
  },
  {
    icon: Shield,
    title: "Segurança Total",
    description: "Proteção de dados com criptografia de ponta e conformidade com LGPD."
  },
  {
    icon: Award,
    title: "Excelência",
    description: "Comprometidos em entregar sempre a melhor qualidade em nossos produtos."
  }
];

export const AboutSection = () => {
  return (
    <section id="sobre" className="py-16 md:py-24 bg-gradient-surface">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <Badge variant="outline" className="mb-4">
            Sobre nós
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            Revolucionando a gestão de estoque
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Somos uma empresa brasileira especializada em soluções de gestão empresarial, 
            com foco em simplicidade, eficiência e resultados reais para nossos clientes.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="text-center hover-lift">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="p-3 bg-gradient-primary rounded-full">
                      <Icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground">
              Nossa História
            </h3>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Fundada em 2016, a Estoque Manager nasceu da necessidade de simplificar 
                a gestão de estoque para pequenas e médias empresas brasileiras.
              </p>
              <p>
                Percebemos que muitas empresas ainda utilizavam planilhas ou sistemas 
                complexos e caros para controlar seus produtos. Por isso, desenvolvemos 
                uma solução intuitiva, acessível e poderosa.
              </p>
              <p>
                Hoje, atendemos centenas de empresas em todo o Brasil, desde pequenos 
                comércios até grandes varejistas, sempre mantendo nosso compromisso 
                com a simplicidade e eficiência.
              </p>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <span className="text-muted-foreground">
                Empresa 100% brasileira com suporte local
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-xl">Nossa Missão</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Democratizar o acesso a ferramentas de gestão empresarial de qualidade, 
                  permitindo que empresas de todos os tamanhos possam crescer de forma 
                  organizada e eficiente.
                </p>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-xl">Nossa Visão</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Ser a principal plataforma de gestão de estoque do Brasil, 
                  reconhecida pela inovação, simplicidade e impacto positivo 
                  nos negócios dos nossos clientes.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Values */}
        <div className="space-y-8">
          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Nossos Valores
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Os princípios que guiam todas as nossas decisões e o desenvolvimento 
              dos nossos produtos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="hover-lift text-center">
                  <CardHeader>
                    <div className="mx-auto p-3 bg-primary-light rounded-full w-fit">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">
                      {value.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
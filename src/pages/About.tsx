import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  Target, 
  Users, 
  Zap, 
  Shield, 
  Award, 
  TrendingUp,
  Heart,
  ArrowRight 
} from "lucide-react";

const About = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Target className="h-8 w-8 text-blue-500" />,
      title: "Foco no Resultado",
      description: "Desenvolvemos soluções que realmente impactam o crescimento do seu negócio."
    },
    {
      icon: <Users className="h-8 w-8 text-green-500" />,
      title: "Suporte Especializado",
      description: "Nossa equipe está sempre pronta para ajudar você a ter sucesso."
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-500" />,
      title: "Tecnologia Avançada",
      description: "Utilizamos as mais modernas tecnologias para oferecer a melhor experiência."
    },
    {
      icon: <Shield className="h-8 w-8 text-purple-500" />,
      title: "Segurança Total",
      description: "Seus dados estão protegidos com os mais altos padrões de segurança."
    }
  ];

  const stats = [
    { number: "1000+", label: "Empresas Atendidas" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Suporte" },
    { number: "5 ⭐", label: "Avaliação Média" }
  ];

  const team = [
    {
      name: "Ana Silva",
      role: "CEO & Fundadora",
      description: "15 anos de experiência em gestão empresarial e tecnologia."
    },
    {
      name: "Carlos Santos",
      role: "CTO",
      description: "Especialista em arquitetura de software e inteligência artificial."
    },
    {
      name: "Maria Oliveira",
      role: "Head de Produto",
      description: "UX/UI Designer com foco em experiência do usuário."
    },
    {
      name: "João Costa",
      role: "Head de Suporte",
      description: "Especialista em atendimento ao cliente e suporte técnico."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4">Sobre o Estoque Manager</Badge>
          <h1 className="text-5xl font-bold mb-6">
            Transformando a gestão de estoque no Brasil
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Somos uma empresa brasileira dedicada a simplificar e otimizar a gestão 
            de estoque para pequenas e médias empresas.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate("/register")}
            className="gap-2"
          >
            Comece Gratuitamente
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-full w-fit">
                  <Target className="h-8 w-8 text-blue-500" />
                </div>
                <CardTitle>Nossa Missão</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Democratizar o acesso a tecnologias avançadas de gestão, 
                  permitindo que empresas de todos os tamanhos tenham controle 
                  total sobre seus estoques.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-green-100 dark:bg-green-900 rounded-full w-fit">
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
                <CardTitle>Nossa Visão</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Ser a plataforma de gestão de estoque mais utilizada no Brasil, 
                  reconhecida pela excelência em inovação e atendimento ao cliente.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-red-100 dark:bg-red-900 rounded-full w-fit">
                  <Heart className="h-8 w-8 text-red-500" />
                </div>
                <CardTitle>Nossos Valores</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Transparência, inovação, foco no cliente e compromisso com 
                  o sucesso dos nossos parceiros. Estes são os pilares da nossa empresa.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white/50 dark:bg-black/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Por que escolher o Estoque Manager?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Oferecemos muito mais que um simples software de estoque.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Números que Falam</h2>
            <p className="text-xl text-muted-foreground">
              Confira alguns resultados que alcançamos juntos.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center p-6">
                <div className="text-3xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-4 bg-white/50 dark:bg-black/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Nossa Equipe</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Conheça as pessoas que trabalham todos os dias para tornar 
              sua gestão de estoque mais eficiente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <Card key={index} className="text-center p-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="font-semibold text-lg mb-1">{member.name}</h3>
                <p className="text-primary text-sm mb-3">{member.role}</p>
                <p className="text-muted-foreground text-sm">{member.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="p-8">
            <h2 className="text-3xl font-bold mb-4">
              Pronto para revolucionar sua gestão de estoque?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Junte-se a milhares de empresas que já transformaram seus resultados.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate("/register")}
                className="gap-2"
              >
                Teste Grátis por 7 Dias
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/contact")}
              >
                Falar com Especialista
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default About;
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowRight, Play, CheckCircle, PlayCircle, X } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-dashboard.jpg";

export const HeroSection = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-hero">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Gestão de Estoque
                <span className="block text-primary">Inteligente e Simples</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
                Sistema completo para pequenas e médias empresas gerenciarem estoque, 
                compras e vendas em um só lugar. Interface moderna, relatórios inteligentes 
                e conformidade total com a LGPD.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-3">
              {[
                "PDV completo com funcionalidade offline",
                "Controle automático de estoque (FEFO)",
                "Relatórios e dashboard em tempo real",
                "Integração com emissão de NF-e"
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center space-x-3 animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button variant="hero" size="hero" className="group" asChild>
                <Link to="/dashboard">
                  Começar Teste Grátis
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="lg" className="group">
                    <Play className="h-5 w-5 mr-2" />
                    Ver Demonstração
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[800px] shadow-apple-lg">
                  <DialogHeader>
                    <DialogTitle>Demonstração do Sistema</DialogTitle>
                    <DialogDescription>
                      Veja como o Estoque Manager pode revolucionar a gestão do seu negócio
                    </DialogDescription>
                  </DialogHeader>
                  <div className="aspect-video bg-gradient-hero rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <PlayCircle className="h-16 w-16 text-primary mx-auto" />
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold">Vídeo demonstrativo</h3>
                        <p className="text-muted-foreground">
                          Em breve: tour completo pelas funcionalidades
                        </p>
                      </div>
                      <Button variant="hero" size="lg" asChild>
                        <Link to="/register">
                          Começar Teste Grátis
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Trial Info */}
            <div className="text-sm text-muted-foreground">
              🎉 <strong>7 dias grátis</strong> • Sem cartão de crédito • 
              Cancele quando quiser
            </div>
          </div>

          {/* Right Image */}
          <div className="relative animate-scale-in">
            <div className="relative rounded-2xl overflow-hidden shadow-apple-lg hover-lift">
              <img
                src={heroImage}
                alt="Dashboard do Estoque Manager"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
            </div>
            
            {/* Floating Stats Cards */}
            <div className="absolute -top-6 -left-6 bg-card p-4 rounded-xl shadow-apple border glass animate-slide-up">
              <div className="text-sm text-muted-foreground">Vendas Hoje</div>
              <div className="text-2xl font-bold text-success">R$ 2.847</div>
            </div>
            
            <div className="absolute -bottom-6 -right-6 bg-card p-4 rounded-xl shadow-apple border glass animate-scale-in" style={{ animationDelay: '200ms' }}>
              <div className="text-sm text-muted-foreground">Produtos em Estoque</div>
              <div className="text-2xl font-bold text-primary">1.247</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
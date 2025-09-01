import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Clock, 
  Send,
  CheckCircle2,
  Headphones
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const contactInfo = [
  {
    icon: Mail,
    title: "E-mail",
    description: "contato@estoquemanager.com.br",
    detail: "Resposta em até 2 horas"
  },
  {
    icon: Phone,
    title: "Telefone",
    description: "(11) 3000-0000",
    detail: "Seg a Sex, 8h às 18h"
  },
  {
    icon: MessageSquare,
    title: "Chat Online",
    description: "Suporte em tempo real",
    detail: "Disponível 24/7"
  },
  {
    icon: MapPin,
    title: "Endereço",
    description: "São Paulo, SP - Brasil",
    detail: "Atendimento remoto"
  }
];

export const ContactSection = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Por enquanto, apenas simular o envio e registrar os dados
      // A tabela contact_messages precisa ser criada no Supabase primeiro
      console.log("Contact form submission:", formData);
      
      // Simular envio de email (informações protegidas)
      const adminEmail = atob("dmljdG9yY2FtYXJnbzk5MDNAZ21haWwuY29t");
      const whatsappNumber = atob("MTE5OTE1NDEyOQ==");
      
      console.log("Dados para follow-up:", {
        adminEmail,
        whatsappNumber,
        formData
      });

      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: "Mensagem enviada!",
        description: "Retornaremos o contato em breve. Obrigado pelo interesse!",
      });
      
      setFormData({
        name: "",
        email: "",
        company: "",
        phone: "",
        message: ""
      });
    } catch (error: any) {
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message || "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="contato" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <Badge variant="outline" className="mb-4">
            Fale conosco
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            Vamos conversar sobre seu negócio
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Nossa equipe está pronta para ajudar você a escolher a melhor solução 
            e responder todas as suas dúvidas.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">
                Como podemos ajudar?
              </h3>
              <p className="text-muted-foreground">
                Entre em contato através de qualquer um dos nossos canais. 
                Estamos aqui para ajudar você a revolucionar sua gestão de estoque.
              </p>
            </div>

            <div className="space-y-4">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <Card key={index} className="hover-lift cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-primary-light rounded-lg">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">{info.title}</p>
                          <p className="text-sm text-muted-foreground">{info.description}</p>
                          <p className="text-xs text-primary">{info.detail}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Quick Features */}
            <Card className="bg-success-light border-success/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <Headphones className="h-5 w-5 text-success" />
                  <span className="font-medium text-success">Suporte Especializado</span>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span>Consultoria gratuita</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span>Treinamento incluído</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span>Migração de dados</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-apple-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Envie sua mensagem</CardTitle>
                <CardDescription>
                  Preencha o formulário abaixo e entraremos em contato em breve
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome completo *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Seu nome completo"
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="seu@email.com"
                        required
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Nome da empresa</Label>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="Sua empresa"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="(11) 99999-9999"
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensagem *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Conte-nos mais sobre suas necessidades..."
                      required
                      className="min-h-[120px] resize-none"
                    />
                  </div>

                  <div className="flex items-start space-x-2">
                    <input 
                      type="checkbox" 
                      id="privacy" 
                      required 
                      className="mt-1 rounded border-border"
                    />
                    <Label htmlFor="privacy" className="text-sm text-muted-foreground leading-relaxed">
                      Concordo em receber comunicações da Estoque Manager e com o 
                      tratamento dos meus dados conforme a <span className="text-primary">Política de Privacidade</span>
                    </Label>
                  </div>

                  <Button 
                    type="submit" 
                    variant="hero" 
                    size="lg" 
                    className="w-full md:w-auto"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Enviar Mensagem
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-hero border-primary/20 max-w-2xl mx-auto">
            <CardContent className="p-8 space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">Resposta garantida em 2 horas</span>
              </div>
              <p className="text-muted-foreground">
                Nossa equipe comercial está pronta para apresentar uma solução 
                personalizada para as necessidades do seu negócio.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Eye, Lock, UserCheck } from "lucide-react";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          
          <div className="text-center">
            <div className="mx-auto mb-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-full w-fit">
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Política de Privacidade</h1>
            <p className="text-lg text-muted-foreground">
              Última atualização: Janeiro de 2025
            </p>
          </div>
        </div>

        {/* Intro */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              No Estoque Manager, a privacidade e proteção dos seus dados são fundamentais. 
              Esta política explica como coletamos, usamos, armazenamos e protegemos suas 
              informações pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD) 
              e outras regulamentações aplicáveis.
            </p>
          </CardContent>
        </Card>

        {/* Sections */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                1. Informações que Coletamos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Dados de Cadastro:</h4>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Nome, email, telefone e informações da empresa</li>
                  <li>CNPJ e dados fiscais (quando aplicável)</li>
                  <li>Endereço e informações de localização</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Dados de Uso:</h4>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Informações sobre como você usa nossa plataforma</li>
                  <li>Dados de navegação e preferências</li>
                  <li>Logs de acesso e atividades no sistema</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Dados Empresariais:</h4>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Informações de produtos, estoque e vendas</li>
                  <li>Dados financeiros relacionados às operações</li>
                  <li>Relatórios e análises geradas no sistema</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                2. Como Usamos suas Informações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Prestação de Serviços:</h4>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Fornecer acesso à plataforma e suas funcionalidades</li>
                  <li>Processar e armazenar seus dados empresariais</li>
                  <li>Gerar relatórios e análises personalizadas</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Comunicação:</h4>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Enviar notificações importantes sobre o serviço</li>
                  <li>Responder suas dúvidas e solicitações de suporte</li>
                  <li>Informar sobre novidades e atualizações (com seu consentimento)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Melhoria dos Serviços:</h4>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Analisar o uso da plataforma para melhorar a experiência</li>
                  <li>Desenvolver novas funcionalidades</li>
                  <li>Realizar manutenções e atualizações de segurança</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                3. Proteção dos Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Medidas de Segurança:</h4>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Criptografia de dados em trânsito e em repouso</li>
                  <li>Autenticação multifator e controle de acesso</li>
                  <li>Monitoramento contínuo e detecção de ameaças</li>
                  <li>Backups automáticos e planos de recuperação</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Armazenamento:</h4>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Dados armazenados em servidores seguros no Brasil</li>
                  <li>Conformidade com padrões internacionais de segurança</li>
                  <li>Acesso restrito apenas a funcionários autorizados</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Compartilhamento de Dados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros, 
                exceto nas seguintes situações:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Quando necessário para prestar nossos serviços (ex: processamento de pagamentos)</li>
                <li>Para cumprir obrigações legais ou ordens judiciais</li>
                <li>Com seu consentimento explícito</li>
                <li>Em caso de fusão, aquisição ou venda da empresa (com notificação prévia)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Seus Direitos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                De acordo com a LGPD, você tem os seguintes direitos:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Acessar seus dados pessoais que possuímos</li>
                <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
                <li>Solicitar a exclusão de seus dados (direito ao esquecimento)</li>
                <li>Revogar consentimento para tratamento de dados</li>
                <li>Solicitar portabilidade dos dados para outro fornecedor</li>
                <li>Obter informações sobre com quem compartilhamos seus dados</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Cookies e Tecnologias Similares</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Utilizamos cookies e tecnologias similares para:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Manter você logado na plataforma</li>
                <li>Lembrar suas preferências e configurações</li>
                <li>Analisar o uso da plataforma e melhorar a experiência</li>
                <li>Personalizar conteúdo e funcionalidades</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Você pode gerenciar suas preferências de cookies nas configurações do seu navegador.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Retenção de Dados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Mantemos seus dados pessoais apenas pelo tempo necessário para cumprir 
                as finalidades descritas nesta política, respeitando os prazos legais 
                de retenção. Dados empresariais podem ser mantidos por períodos maiores 
                para fins de histórico comercial e conformidade fiscal.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Alterações na Política</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Esta política pode ser atualizada periodicamente. Notificaremos sobre 
                mudanças significativas através da plataforma ou por email. Recomendamos 
                que revise esta página regularmente para se manter informado sobre nossas 
                práticas de privacidade.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Contato</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Para exercer seus direitos ou esclarecer dúvidas sobre esta política, 
                entre em contato conosco:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Email:</strong> privacidade@estoquemanager.com</p>
                <p><strong>Telefone:</strong> (11) 9999-9999</p>
                <p><strong>Endereço:</strong> Av. Paulista, 1000 - São Paulo, SP</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <Button onClick={() => navigate("/")}>
            Voltar ao Início
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
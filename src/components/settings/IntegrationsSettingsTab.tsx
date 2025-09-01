import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save, Mail, MessageCircle, Plug, AlertTriangle, TestTube2 } from "lucide-react";
import { integrationSettingsSchema, type IntegrationSettingsFormData } from "@/lib/validations/settings";
import { useToast } from "@/hooks/use-toast";

export function IntegrationsSettingsTab() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [isTestingWhatsApp, setIsTestingWhatsApp] = useState(false);

  const form = useForm<IntegrationSettingsFormData>({
    resolver: zodResolver(integrationSettingsSchema),
    defaultValues: {
      smtp_enabled: false,
      smtp_host: "",
      smtp_port: 587,
      smtp_user: "",
      smtp_pass: "",
      smtp_from_email: "",
      smtp_secure: true,
      whatsapp_enabled: false,
      whatsapp_provider: "evolution",
      whatsapp_token: "",
      whatsapp_instance_id: "",
      whatsapp_phone: "",
    },
  });

  const onSubmit = async (data: IntegrationSettingsFormData) => {
    setIsSaving(true);
    
    try {
      // TODO: Implement actual save when tables are created
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Integrações salvas",
        description: "As configurações de integração foram atualizadas com sucesso.",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao salvar integrações",
        description: error.message || "Ocorreu um erro ao salvar as configurações de integração.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const testEmail = async () => {
    setIsTestingEmail(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Email teste enviado",
        description: "O email de teste foi enviado com sucesso.",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Erro no teste de email",
        description: error.message || "Falha ao enviar email de teste.",
        variant: "destructive",
      });
    } finally {
      setIsTestingEmail(false);
    }
  };

  const testWhatsApp = async () => {
    setIsTestingWhatsApp(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "WhatsApp teste enviado",
        description: "A mensagem de teste foi enviada com sucesso.",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Erro no teste de WhatsApp",
        description: error.message || "Falha ao enviar mensagem de teste.",
        variant: "destructive",
      });
    } finally {
      setIsTestingWhatsApp(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Esta funcionalidade está em desenvolvimento. As integrações serão implementadas nas próximas versões.
        </AlertDescription>
      </Alert>

      {/* SMTP Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <CardTitle>Configuração SMTP</CardTitle>
          </div>
          <CardDescription>
            Configure o servidor de email para envio de notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Habilitar SMTP</Label>
              <p className="text-sm text-muted-foreground">
                Permite envio de emails automáticos
              </p>
            </div>
            <Switch
              checked={form.watch("smtp_enabled")}
              onCheckedChange={(checked) => form.setValue("smtp_enabled", checked)}
            />
          </div>

          {form.watch("smtp_enabled") && (
            <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp_host">Servidor SMTP</Label>
                  <Input
                    id="smtp_host"
                    {...form.register("smtp_host")}
                    placeholder="smtp.gmail.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp_port">Porta</Label>
                  <Input
                    id="smtp_port"
                    type="number"
                    {...form.register("smtp_port", { valueAsNumber: true })}
                    placeholder="587"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp_user">Usuário</Label>
                  <Input
                    id="smtp_user"
                    {...form.register("smtp_user")}
                    placeholder="seu@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp_pass">Senha</Label>
                  <Input
                    id="smtp_pass"
                    type="password"
                    {...form.register("smtp_pass")}
                    placeholder="Sua senha ou token"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="smtp_from_email">Email remetente</Label>
                  <Input
                    id="smtp_from_email"
                    type="email"
                    {...form.register("smtp_from_email")}
                    placeholder="noreply@empresa.com"
                  />
                </div>

                <div className="flex items-center space-x-2 md:col-span-2">
                  <Switch
                    id="smtp_secure"
                    checked={form.watch("smtp_secure")}
                    onCheckedChange={(checked) => form.setValue("smtp_secure", checked)}
                  />
                  <Label htmlFor="smtp_secure">Conexão segura (TLS/SSL)</Label>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={testEmail}
                  disabled={isTestingEmail}
                  className="gap-2"
                >
                  {isTestingEmail ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <TestTube2 className="h-4 w-4" />
                  )}
                  {isTestingEmail ? "Testando..." : "Testar Email"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* WhatsApp Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <CardTitle>Configuração WhatsApp</CardTitle>
          </div>
          <CardDescription>
            Configure o provedor WhatsApp para envio de mensagens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Habilitar WhatsApp</Label>
              <p className="text-sm text-muted-foreground">
                Permite envio de mensagens automáticas
              </p>
            </div>
            <Switch
              checked={form.watch("whatsapp_enabled")}
              onCheckedChange={(checked) => form.setValue("whatsapp_enabled", checked)}
            />
          </div>

          {form.watch("whatsapp_enabled") && (
            <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp_provider">Provedor</Label>
                  <Select
                    value={form.watch("whatsapp_provider")}
                    onValueChange={(value: "evolution" | "twilio" | "baileys") => 
                      form.setValue("whatsapp_provider", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o provedor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="evolution">Evolution API</SelectItem>
                      <SelectItem value="twilio">Twilio</SelectItem>
                      <SelectItem value="baileys">Baileys</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp_phone">Número WhatsApp</Label>
                  <Input
                    id="whatsapp_phone"
                    {...form.register("whatsapp_phone")}
                    placeholder="5511999999999"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp_token">Token/API Key</Label>
                  <Input
                    id="whatsapp_token"
                    type="password"
                    {...form.register("whatsapp_token")}
                    placeholder="Token do provedor"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp_instance_id">ID da Instância</Label>
                  <Input
                    id="whatsapp_instance_id"
                    {...form.register("whatsapp_instance_id")}
                    placeholder="ID da instância (Evolution/Baileys)"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={testWhatsApp}
                  disabled={isTestingWhatsApp}
                  className="gap-2"
                >
                  {isTestingWhatsApp ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <TestTube2 className="h-4 w-4" />
                  )}
                  {isTestingWhatsApp ? "Testando..." : "Testar WhatsApp"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </form>
    </div>
  );
}
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Shield, AlertTriangle, Clock, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCompany } from "@/hooks/useCompany";

export function LGPDSettingsTab() {
  const { toast } = useToast();
  const { data: company } = useCompany();
  const [isSaving, setIsSaving] = useState(false);
  const [consentSettings, setConsentSettings] = useState({
    marketing: false,
    analytics: false,
    cookies: true,
  });

  const handleConsentChange = (type: keyof typeof consentSettings, value: boolean) => {
    setConsentSettings(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const onSubmit = async () => {
    setIsSaving(true);
    
    try {
      // TODO: Implement actual save when tables are created
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Configurações de privacidade salvas",
        description: "As preferências de LGPD foram atualizadas com sucesso.",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Esta funcionalidade está em desenvolvimento. O gerenciamento completo de LGPD será implementado nas próximas versões.
        </AlertDescription>
      </Alert>

      {/* Consent Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Status de Consentimento</CardTitle>
          </div>
          <CardDescription>
            Status atual dos consentimentos LGPD da empresa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {company ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">Consentimento Principal</p>
                  <p className="text-sm text-muted-foreground">
                    Processamento de dados para funcionamento do sistema
                  </p>
                </div>
                <Badge variant="default" className="gap-1">
                  <Check className="h-3 w-3" />
                  Ativo
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">Data do Consentimento</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Não registrado (será implementado)
                  </p>
                </div>
                <Badge variant="outline">
                  Versão 1.0
                </Badge>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Carregando informações...</p>
          )}
        </CardContent>
      </Card>

      {/* Consent Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferências de Consentimento</CardTitle>
          <CardDescription>
            Gerencie os tipos de consentimento para diferentes finalidades
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="cookies">Cookies Essenciais</Label>
                <p className="text-sm text-muted-foreground">
                  Cookies necessários para o funcionamento do sistema
                </p>
              </div>
              <Switch
                id="cookies"
                checked={consentSettings.cookies}
                onCheckedChange={(checked) => handleConsentChange("cookies", checked)}
                disabled // Always required
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="analytics">Análise e Performance</Label>
                <p className="text-sm text-muted-foreground">
                  Coleta de dados para melhorar o desempenho do sistema
                </p>
              </div>
              <Switch
                id="analytics"
                checked={consentSettings.analytics}
                onCheckedChange={(checked) => handleConsentChange("analytics", checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="marketing">Marketing e Comunicação</Label>
                <p className="text-sm text-muted-foreground">
                  Envio de emails promocionais e comunicados comerciais
                </p>
              </div>
              <Switch
                id="marketing"
                checked={consentSettings.marketing}
                onCheckedChange={(checked) => handleConsentChange("marketing", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Rights */}
      <Card>
        <CardHeader>
          <CardTitle>Direitos dos Titulares</CardTitle>
          <CardDescription>
            Informações sobre os direitos LGPD dos usuários
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <p><strong>Acesso:</strong> Os usuários podem solicitar acesso aos seus dados</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <p><strong>Correção:</strong> Direito de corrigir dados inexatos ou incompletos</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <p><strong>Exclusão:</strong> Direito ao apagamento dos dados pessoais</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <p><strong>Portabilidade:</strong> Direito de receber os dados em formato estruturado</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <p><strong>Oposição:</strong> Direito de se opor ao tratamento de dados</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={onSubmit}
          disabled={isSaving}
          className="gap-2"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSaving ? "Salvando..." : "Salvar Preferências"}
        </Button>
      </div>
    </div>
  );
}
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
import { Loader2, Save, FileText, AlertTriangle } from "lucide-react";
import { nfeSettingsSchema, type NFeSettingsFormData } from "@/lib/validations/settings";
import { useToast } from "@/hooks/use-toast";

export function NFeSettingsTab() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<NFeSettingsFormData>({
    resolver: zodResolver(nfeSettingsSchema),
    defaultValues: {
      enabled: false,
      cert_alias: "",
      csc_id: "",
      csc_token: "",
      serie_nfe: 1,
      ambiente: "homolog",
    },
  });

  const onSubmit = async (data: NFeSettingsFormData) => {
    setIsSaving(true);
    
    try {
      // TODO: Implement actual save when tables are created
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Configurações NF-e salvas",
        description: "As configurações da NF-e foram atualizadas com sucesso.",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao salvar NF-e",
        description: error.message || "Ocorreu um erro ao salvar as configurações da NF-e.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <CardTitle>Configurações NF-e (Homologação)</CardTitle>
        </div>
        <CardDescription>
          Configure os parâmetros para emissão de NF-e em ambiente de homologação
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Esta funcionalidade está em desenvolvimento. As configurações serão implementadas nas próximas versões.
          </AlertDescription>
        </Alert>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="enabled"
              checked={form.watch("enabled")}
              onCheckedChange={(checked) => form.setValue("enabled", checked)}
            />
            <Label htmlFor="enabled">Habilitar emissão de NF-e</Label>
          </div>

          {form.watch("enabled") && (
            <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ambiente">Ambiente</Label>
                  <Select
                    value={form.watch("ambiente")}
                    onValueChange={(value: "homolog" | "producao") => form.setValue("ambiente", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o ambiente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="homolog">Homologação</SelectItem>
                      <SelectItem value="producao">Produção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serie_nfe">Série da NF-e</Label>
                  <Input
                    id="serie_nfe"
                    type="number"
                    min="1"
                    {...form.register("serie_nfe", { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cert_alias">Alias do Certificado</Label>
                  <Input
                    id="cert_alias"
                    {...form.register("cert_alias")}
                    placeholder="Alias do certificado A1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="csc_id">CSC ID</Label>
                  <Input
                    id="csc_id"
                    {...form.register("csc_id")}
                    placeholder="ID do CSC"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="csc_token">CSC Token</Label>
                  <Input
                    id="csc_token"
                    type="password"
                    {...form.register("csc_token")}
                    placeholder="Token CSC (será criptografado)"
                  />
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Certifique-se de estar utilizando o ambiente de homologação para testes.
                  Nunca utilize certificados de produção em ambiente de desenvolvimento.
                </AlertDescription>
              </Alert>
            </div>
          )}

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
      </CardContent>
    </Card>
  );
}
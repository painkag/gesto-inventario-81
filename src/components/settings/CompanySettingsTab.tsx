import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save, Building2, AlertTriangle } from "lucide-react";
import { useCompanySettings } from "@/hooks/useSettings";
import { companySettingsSchema, type CompanySettingsFormData } from "@/lib/validations/settings";

export function CompanySettingsTab() {
  const { settings, isLoading, updateSettings, isSaving } = useCompanySettings();

  const form = useForm<CompanySettingsFormData>({
    resolver: zodResolver(companySettingsSchema),
    values: settings || {
      name: "",
      document: "",
      phone: "",
    },
  });

  const onSubmit = (data: CompanySettingsFormData) => {
    updateSettings.mutate(data);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <CardTitle>Informações da Empresa</CardTitle>
        </div>
        <CardDescription>
          Configure os dados básicos da sua empresa
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Empresa *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Minha Empresa Ltda"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="document">CNPJ/CPF</Label>
              <Input
                id="document"
                {...form.register("document")}
                placeholder="00.000.000/0000-00"
              />
              {form.formState.errors.document && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.document.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                {...form.register("phone")}
                placeholder="(11) 99999-9999"
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Campos adicionais como cidade, UF, email fiscal e logo serão disponibilizados nas próximas versões.
            </AlertDescription>
          </Alert>

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
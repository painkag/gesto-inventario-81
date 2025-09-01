import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "./useCompany";
import { useToast } from "./use-toast";

export interface CompanySettingsData {
  name: string;
  document?: string;
  phone?: string;
  // Note: Fields below will be available once migrations are applied
  // city?: string;
  // state?: string;
  // postal_code?: string;
  // fiscal_email?: string;
  // logo_url?: string;
}

export interface NFeSettingsData {
  enabled: boolean;
  cert_alias?: string;
  csc_id?: string;
  csc_token?: string;
  serie_nfe: number;
  ambiente: 'homolog' | 'producao';
}

export interface IntegrationSettingsData {
  smtp_enabled: boolean;
  smtp_host?: string;
  smtp_port?: number;
  smtp_user?: string;
  smtp_pass?: string;
  smtp_from_email?: string;
  smtp_secure: boolean;
  whatsapp_enabled: boolean;
  whatsapp_provider?: 'evolution' | 'twilio' | 'baileys';
  whatsapp_token?: string;
  whatsapp_instance_id?: string;
  whatsapp_phone?: string;
}

export interface LGPDSettings {
  consent_opt_in: boolean;
  consent_version?: string;
  consent_timestamp?: string;
}

// Company Settings Hook
export function useCompanySettings() {
  const { data: company } = useCompany();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ["company-settings", company?.id],
    queryFn: async (): Promise<CompanySettingsData> => {
      if (!company?.id) throw new Error("Company not found");

      const { data, error } = await supabase
        .from("companies")
        .select("name, document, phone")
        .eq("id", company.id)
        .single();

      if (error) throw error;
      
      return {
        name: data.name || "",
        document: data.document || "",
        phone: data.phone || "",
      };
    },
    enabled: !!company?.id,
  });

  const updateSettings = useMutation({
    mutationFn: async (data: CompanySettingsData) => {
      if (!company?.id) throw new Error("Company not found");

      const { error } = await supabase
        .from("companies")
        .update(data)
        .eq("id", company.id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-settings", company?.id] });
      toast({
        title: "Configurações salvas",
        description: "As informações da empresa foram atualizadas com sucesso.",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao salvar as configurações.",
        variant: "destructive",
      });
    },
  });

  return {
    settings: settingsQuery.data,
    isLoading: settingsQuery.isLoading,
    error: settingsQuery.error,
    updateSettings,
    isSaving: updateSettings.isPending,
  };
}

// Placeholder hooks for future implementation
export function useNFeSettings() {
  return {
    settings: null,
    isLoading: false,
    error: null,
    updateNFeSettings: { mutate: () => {}, isPending: false },
    isSaving: false,
  };
}

export function useIntegrationSettings() {
  return {
    settings: null,
    isLoading: false,
    error: null,
    updateIntegrationSettings: { mutate: () => {}, isPending: false },
    isSaving: false,
    testEmail: { mutate: () => {}, isPending: false },
    testWhatsApp: { mutate: () => {}, isPending: false },
    isTestingEmail: false,
    isTestingWhatsApp: false,
  };
}
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "./useCompany";
import { useToast } from "./use-toast";
import type { Database } from "@/integrations/supabase/types";

type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"];
type SubscriptionStatus = "ACTIVE" | "PAST_DUE" | "CANCELED" | "TRIALING";

export interface SubscriptionData {
  id: string;
  plan: string;
  status: SubscriptionStatus;
  ai_included: boolean;
  current_period_end: string;
  current_period_start: string;
  created_at: string;
}

export interface BillingData {
  subscription: SubscriptionData | null;
  isBlocked: boolean;
  aiEnabled: boolean;
  canAccessSystem: boolean;
  planDisplayName: string;
  daysUntilExpiry: number;
}

// Hook para gerenciar assinatura e billing
export function useBilling(): BillingData & {
  isLoading: boolean;
  error: any;
  refreshSubscription: () => void;
} {
  const { data: company } = useCompany();
  const queryClient = useQueryClient();

  const subscriptionQuery = useQuery({
    queryKey: ["subscription", company?.id],
    queryFn: async (): Promise<BillingData> => {
      if (!company?.id) {
        return {
          subscription: null,
          isBlocked: true,
          aiEnabled: false,
          canAccessSystem: false,
          planDisplayName: "Nenhum plano",
          daysUntilExpiry: 0,
        };
      }

      // Buscar assinatura da empresa
      const { data: subscription, error: subError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("company_id", company.id)
        .single();

      if (subError && subError.code !== 'PGRST116') {
        throw subError;
      }

      // Buscar informação de bloqueio da empresa
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .select("is_blocked")
        .eq("id", company.id)
        .single();

      if (companyError) {
        throw companyError;
      }

      const isBlocked = companyData?.is_blocked || false;
      const aiEnabled = subscription?.ai_included || false;
      const canAccessSystem = !isBlocked && subscription?.status === "ACTIVE";

      // Calcular dias até expiração
      let daysUntilExpiry = 0;
      if (subscription?.current_period_end) {
        const endDate = new Date(subscription.current_period_end);
        const today = new Date();
        daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      }

      // Nome do plano para exibição
      const planDisplayName = subscription?.plan 
        ? (subscription.plan === "professional" ? "Profissional" : "Essencial")
        : "Nenhum plano";

      return {
        subscription: subscription as SubscriptionData | null,
        isBlocked,
        aiEnabled,
        canAccessSystem,
        planDisplayName,
        daysUntilExpiry,
      };
    },
    enabled: !!company?.id,
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  const refreshSubscription = () => {
    queryClient.invalidateQueries({ queryKey: ["subscription", company?.id] });
  };

  return {
    ...subscriptionQuery.data || {
      subscription: null,
      isBlocked: true,
      aiEnabled: false,
      canAccessSystem: false,
      planDisplayName: "Nenhum plano",
      daysUntilExpiry: 0,
    },
    isLoading: subscriptionQuery.isLoading,
    error: subscriptionQuery.error,
    refreshSubscription,
  };
}

// Hook para controlar recursos de IA
export function useAiEnabled() {
  const { aiEnabled, isLoading } = useBilling();
  
  return {
    aiEnabled,
    isLoading,
    showAiFeature: (fallback?: React.ReactNode) => aiEnabled,
    aiBlockedMessage: "Este recurso está disponível apenas no plano Profissional"
  };
}

// Hook para operações de checkout e pagamento
export function useCheckout() {
  const { data: company } = useCompany();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createCheckout = useMutation({
    mutationFn: async (planType: "essential" | "professional") => {
      if (!company?.id) throw new Error("Empresa não encontrada");

      console.log('Creating checkout for company:', company.id, 'plan:', planType);
      
      const { data, error } = await supabase.functions.invoke('checkout', {
        body: { 
          company_id: company.id,
          plan: planType 
        }
      });

      console.log('Checkout response:', { data, error });
      
      if (error) {
        console.error('Checkout error:', error);
        throw new Error(error.message || 'Erro no checkout');
      }
      
      if (!data || !data.checkout_url) {
        throw new Error('URL de checkout não encontrada');
      }
      
      return data;
    },
    onSuccess: (data) => {
      // Abrir checkout em nova aba para melhor UX
      if (data.checkout_url) {
        window.open(data.checkout_url, '_blank');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro no checkout",
        description: error.message || "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    },
  });

  const triggerWebhook = useMutation({
    mutationFn: async ({ eventType, planType }: { eventType: "invoice.paid" | "invoice.payment_failed" | "subscription.canceled"; planType?: "essential" | "professional" }) => {
      if (!company?.id) throw new Error("Empresa não encontrada");

      const { data, error } = await supabase.functions.invoke('webhook-mock', {
        body: { 
          type: eventType,
          company_id: company.id,
          plan: planType 
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription", company?.id] });
      toast({
        title: "Status atualizado",
        description: "O status da assinatura foi atualizado com sucesso.",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar",
        description: error.message || "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    },
  });

  return {
    createCheckout,
    triggerWebhook,
    isCreatingCheckout: createCheckout.isPending,
    isTriggeringWebhook: triggerWebhook.isPending,
  };
}
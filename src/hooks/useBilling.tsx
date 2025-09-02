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

      // Buscar informações da assinatura diretamente da empresa
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .select(`
          is_blocked,
          ai_enabled,
          plan,
          subscription_status,
          current_period_end,
          stripe_customer_id,
          stripe_subscription_id,
          stripe_price_id_current
        `)
        .eq("id", company.id)
        .single();

      if (companyError) {
        throw companyError;
      }

      const isBlocked = companyData?.is_blocked || false;
      const aiEnabled = companyData?.ai_enabled || false;
      const subscriptionStatus = companyData?.subscription_status || "INACTIVE";
      const canAccessSystem = !isBlocked && subscriptionStatus === "ACTIVE";

      // Calcular dias até expiração
      let daysUntilExpiry = 0;
      if (companyData?.current_period_end) {
        const endDate = new Date(companyData.current_period_end);
        const today = new Date();
        daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      }

      // Nome do plano para exibição
      const planDisplayName = companyData?.plan 
        ? (companyData.plan === "professional" ? "Profissional" : "Essencial")
        : "Nenhum plano";

      // Criar objeto de assinatura compatível
      const subscription: SubscriptionData | null = companyData?.plan ? {
        id: companyData.stripe_subscription_id || "",
        plan: companyData.plan,
        status: subscriptionStatus as SubscriptionStatus,
        ai_included: aiEnabled,
        current_period_end: companyData.current_period_end || "",
        current_period_start: "", // Não temos mais esse campo na companies
        created_at: "", // Não temos mais esse campo na companies
      } : null;

      return {
        subscription,
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
      // Redirecionar diretamente para o Stripe Checkout
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
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

  const openCustomerPortal = useMutation({
    mutationFn: async () => {
      console.log('[BILLING] Abrindo portal do cliente')

      const { data, error } = await supabase.functions.invoke('customer-portal')

      if (error) {
        console.error('[BILLING] Erro na function customer-portal:', error)
        throw new Error(error.message || 'Erro ao abrir portal')
      }

      if (!data.success) {
        console.error('[BILLING] Portal falhou:', data.error)
        throw new Error(data.error || 'Erro ao abrir portal')
      }

      console.log('[BILLING] Portal criado com sucesso:', data)
      return data;
    },
    onSuccess: (data) => {
      // Redirecionar para o portal do cliente
      if (data.portal_url) {
        window.location.href = data.portal_url;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro no portal",
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
    openCustomerPortal,
    triggerWebhook,
    isCreatingCheckout: createCheckout.isPending,
    isOpeningPortal: openCustomerPortal.isPending,
    isTriggeringWebhook: triggerWebhook.isPending,
  };
}
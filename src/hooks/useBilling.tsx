import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "./useCompany";
import { useToast } from "./use-toast";

interface SubscriptionData {
  plan: string | null;
  trial_ends_at: string | null;
  current_period_end: string | null;
  ai_enabled: boolean;
  is_blocked: boolean;
}

interface BillingData {
  subscriptionData: SubscriptionData | null;
  isLoading: boolean;
  error: any;
  daysUntilExpiry: number | null;
  hasSystemAccess: boolean;
  refreshSubscription: () => void;
  subscriptionStatus: string;
  isActive: boolean;
  isPending: boolean;
  isPastDue: boolean;
}

// Hook para gerenciar assinatura e billing
export function useBilling() {
  const { data: company } = useCompany();
  
  const query = useQuery({
    queryKey: ["billing", company?.id],
    queryFn: async (): Promise<BillingData> => {
      if (!company?.id) {
        return {
          subscriptionData: null,
          isLoading: false,
          error: null,
          daysUntilExpiry: null,
          hasSystemAccess: false,
          refreshSubscription: () => {},
          subscriptionStatus: 'INACTIVE',
          isActive: false,
          isPending: false,
          isPastDue: false,
        };
      }

      try {
        console.log('[BILLING] Fetching billing data for company:', company.id);
        
        // Buscar dados da empresa com novos campos
        const { data: companyData, error: companyError } = await supabase
          .from("companies")
          .select(`
            *,
            subscriptions (*)
          `)
          .eq("id", company.id)
          .single();

        if (companyError) {
          console.error('[BILLING] Error fetching company data:', companyError);
          throw companyError;
        }

        if (!companyData) {
          console.warn('[BILLING] No company data found');
          return {
            subscriptionData: null,
            isLoading: false,
            error: null,
            daysUntilExpiry: null,
            hasSystemAccess: false,
            refreshSubscription: () => {},
            subscriptionStatus: 'INACTIVE',
            isActive: false,
            isPending: false,
            isPastDue: false,
          };
        }

        console.log('[BILLING] Company data:', companyData);

        const now = new Date();
        const trialEndsAt = companyData.trial_ends_at ? new Date(companyData.trial_ends_at) : null;
        const currentPeriodEnd = companyData.current_period_end ? new Date(companyData.current_period_end) : null;
        const isBlocked = companyData.is_blocked || false;
        const subscriptionStatus = companyData.subscription_status || 'INACTIVE';

        // Status helpers
        const isActive = subscriptionStatus === 'ACTIVE';
        const isPending = subscriptionStatus === 'PENDING';
        const isPastDue = subscriptionStatus === 'PAST_DUE';

        // Determinar se tem acesso ao sistema baseado no novo status
        let hasSystemAccess = true;
        let daysUntilExpiry: number | null = null;

        if (isBlocked || isPastDue) {
          hasSystemAccess = false;
        } else if (isActive && currentPeriodEnd && currentPeriodEnd > now) {
          // Tem assinatura ativa
          hasSystemAccess = true;
          daysUntilExpiry = Math.ceil((currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        } else if (isPending) {
          // Pagamento pendente - dar acesso temporário por alguns dias
          hasSystemAccess = true;
          daysUntilExpiry = 3; // 3 dias de graça para processar pagamento
        } else if (trialEndsAt && trialEndsAt > now) {
          // Em período de trial
          hasSystemAccess = true;
          daysUntilExpiry = Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        } else {
          // Sem acesso
          hasSystemAccess = false;
        }

        const subscriptionData: SubscriptionData = {
          plan: companyData.plan || 'trial',
          trial_ends_at: companyData.trial_ends_at,
          current_period_end: companyData.current_period_end,
          ai_enabled: companyData.ai_enabled || false,
          is_blocked: isBlocked,
        };

        return {
          subscriptionData,
          isLoading: false,
          error: null,
          daysUntilExpiry,
          hasSystemAccess,
          refreshSubscription: () => {},
          subscriptionStatus,
          isActive,
          isPending,
          isPastDue,
        };
      } catch (error) {
        console.error('[BILLING] Error in billing query:', error);
        return {
          subscriptionData: null,
          isLoading: false,
          error,
          daysUntilExpiry: null,
          hasSystemAccess: false,
          refreshSubscription: () => {},
          subscriptionStatus: 'INACTIVE',
          isActive: false,
          isPending: false,
          isPastDue: false,
        };
      }
    },
    enabled: !!company?.id,
    staleTime: 30000, // 30 segundos
    refetchInterval: 60000, // 1 minuto
  });

  return {
    subscriptionData: query.data?.subscriptionData || null,
    isLoading: query.isLoading,
    error: query.error,
    daysUntilExpiry: query.data?.daysUntilExpiry || null,
    hasSystemAccess: query.data?.hasSystemAccess || false,
    subscriptionStatus: query.data?.subscriptionStatus || 'INACTIVE',
    isActive: query.data?.isActive || false,
    isPending: query.data?.isPending || false,
    isPastDue: query.data?.isPastDue || false,
    refreshSubscription: () => {
      console.log('[BILLING] Manual refresh triggered');
      query.refetch();
    },
  };
}

// Hook para controlar recursos de IA
export function useAiEnabled() {
  const { subscriptionData, isLoading } = useBilling();
  
  return {
    aiEnabled: subscriptionData?.ai_enabled || false,
    isLoading,
    showAiFeature: (fallback?: React.ReactNode) => subscriptionData?.ai_enabled || false,
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
      console.log('[CHECKOUT] Iniciando processo de checkout...');
      console.log('[CHECKOUT] Company data:', company);
      
      if (!company?.id) {
        console.error('[CHECKOUT] Company ID não encontrado');
        throw new Error("Empresa não encontrada");
      }

      console.log('[CHECKOUT] Creating checkout for company:', company.id, 'plan:', planType);
      
      const { data, error } = await supabase.functions.invoke('checkout', {
        body: { 
          company_id: company.id,
          plan: planType 
        }
      });

      console.log('[CHECKOUT] Checkout response received:', { data, error });
      
      if (error) {
        console.error('[CHECKOUT] Checkout error:', error);
        throw new Error(error.message || 'Erro no checkout');
      }
      
      if (!data || !data.checkout_url) {
        console.error('[CHECKOUT] No checkout_url found in response:', data);
        throw new Error('URL de checkout não encontrada');
      }
      
      console.log('[CHECKOUT] Checkout URL received:', data.checkout_url);
      return data;
    },
    onSuccess: (data) => {
      console.log('[CHECKOUT] Success callback triggered with data:', data);
      
      // Verificar se temos a URL de checkout
      if (!data.checkout_url) {
        console.error('[CHECKOUT] Nenhuma checkout_url encontrada na resposta:', data);
        toast({
          title: "Erro no redirecionamento",
          description: "URL de checkout não encontrada na resposta.",
          variant: "destructive",
        });
        return;
      }

      console.log('[CHECKOUT] Abrindo Stripe Checkout em nova aba:', data.checkout_url);
      
      // Mostrar instrução para o usuário
      toast({
        title: "Redirecionando para pagamento",
        description: "Uma nova aba será aberta com o checkout do Stripe",
      });

      // Sempre abrir em nova aba - mais confiável para checkouts externos
      const newWindow = window.open(data.checkout_url, '_blank', 'noopener,noreferrer');
      
      if (!newWindow || newWindow.closed) {
        // Pop-up foi bloqueado - mostrar fallback
        console.warn('[CHECKOUT] Pop-up bloqueado, mostrando fallback');
        toast({
          title: "Pop-up bloqueado",
          description: "Clique no link abaixo para acessar o pagamento",
          variant: "destructive",
        });
        
        // Criar link de fallback
        const link = document.createElement('a');
        link.href = data.checkout_url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'Abrir checkout do Stripe';
        link.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999; background: #007bff; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold;';
        document.body.appendChild(link);
        
        // Remover o link após 10 segundos
        setTimeout(() => {
          if (document.body.contains(link)) {
            document.body.removeChild(link);
          }
        }, 10000);
      } else {
        console.log('[CHECKOUT] Nova aba aberta com sucesso');
      }
    },
    onError: (error: any) => {
      console.error('[CHECKOUT] Error callback triggered:', error);
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
      queryClient.invalidateQueries({ queryKey: ["billing", company?.id] });
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
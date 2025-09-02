import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "./useCompany";
import { useToast } from "@/hooks/use-toast";

export function useSales() {
  const queryClient = useQueryClient();
  const { data: company } = useCompany();
  const { toast } = useToast();

  const sales = useQuery({
    queryKey: ["sales", company?.id],
    queryFn: async () => {
      if (!company?.id) return [];
      
      const { data, error } = await supabase
        .from("sales")
        .select(`
          *,
          sale_items!sale_items_sale_id_fkey (
            id,
            product_id,
            quantity,
            unit_price,
            total_price,
            products!sale_items_product_id_fkey (
              id,
              name,
              code
            )
          )
        `)
        .eq("company_id", company.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching sales:", error);
        throw error;
      }

      return data || [];
    },
    enabled: !!company?.id,
  });

  // Enhanced sale creation with FEFO processing via Edge Function
  const createSale = useMutation({
    mutationFn: async (saleData: {
      customer_name?: string;
      discount?: number;
      notes?: string;
      items: {
        product_id: string;
        quantity: number;
        unit_price: number;
      }[];
    }) => {
      if (!company?.id) {
        throw new Error("Company not found");
      }

      // Transform data for the Edge Function
      const requestBody = {
        companyId: company.id,
        items: saleData.items.map(item => ({
          productId: item.product_id,
          quantity: item.quantity,
          unitPrice: item.unit_price
        })),
        payment: {
          method: 'CASH' as const, // Default payment method
          discountPct: saleData.discount ? (saleData.discount / saleData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)) * 100 : 0
        },
        customerName: saleData.customer_name,
        notes: saleData.notes
      };

      console.log('Creating sale with FEFO processing:', requestBody);

      // Call the Edge Function for FEFO processing
      const { data, error } = await supabase.functions.invoke('process-sale', {
        body: requestBody
      });

      if (error) {
        console.error('Sale processing error:', error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to process sale');
      }

      return {
        id: data.saleId,
        sale_number: data.saleNumber,
        total: data.total
      };
    },
    onSuccess: (data) => {
      console.log('Sale created successfully:', data);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
      
      toast({
        title: "Venda criada com sucesso!",
        description: `Venda ${data.sale_number} processada com FEFO automático.`
      });
    },
    onError: (error: any) => {
      console.error('Sale creation error:', error);
      
      const errorMessage = error?.message || 'Erro desconhecido';
      
      if (errorMessage.includes('Estoque insuficiente')) {
        toast({
          title: "Estoque insuficiente",
          description: "Não há estoque suficiente para completar esta venda.",
          variant: "destructive"
        });
      } else if (errorMessage.includes('Inventory error')) {
        toast({
          title: "Erro de estoque",
          description: "Erro ao processar movimentação de estoque. Verifique o estoque disponível.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro ao criar venda",
          description: errorMessage,
          variant: "destructive"
        });
      }
    },
  });

  const updateSale = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { data: result, error } = await supabase
        .from("sales")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      toast({
        title: "Venda atualizada!",
        description: "Os dados da venda foram atualizados com sucesso."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar venda",
        description: error.message || "Tente novamente.",
        variant: "destructive"
      });
    },
  });

  const deleteSale = useMutation({
    mutationFn: async (saleId: string) => {
      const { error } = await supabase
        .from("sales")
        .delete()
        .eq("id", saleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      toast({
        title: "Venda excluída!",
        description: "A venda foi excluída com sucesso."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir venda",
        description: error.message || "Tente novamente.",
        variant: "destructive"
      });
    },
  });

  const cancelSale = useMutation({
    mutationFn: async (saleId: string) => {
      const { error } = await supabase
        .from("sales")
        .update({ status: "CANCELLED" })
        .eq("id", saleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      toast({
        title: "Venda cancelada!",
        description: "A venda foi cancelada com sucesso."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao cancelar venda",
        description: error.message || "Tente novamente.",
        variant: "destructive"
      });
    },
  });

  return {
    sales: sales.data || [],
    isLoading: sales.isLoading,
    error: sales.error,
    createSale,
    updateSale,
    deleteSale,
    cancelSale,
    isCreating: createSale.isPending,
    isUpdating: updateSale.isPending,
    isDeleting: deleteSale.isPending,
    isCancelling: cancelSale.isPending,
  };
}
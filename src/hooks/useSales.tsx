import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "./useCompany";
import { useToast } from "./use-toast";
import type { Database } from "@/integrations/supabase/types";

type Sale = Database["public"]["Tables"]["sales"]["Row"];
type SaleInsert = Database["public"]["Tables"]["sales"]["Insert"];
type SaleItem = Database["public"]["Tables"]["sale_items"]["Row"];
type SaleItemInsert = Database["public"]["Tables"]["sale_items"]["Insert"];

interface SaleWithItems extends Sale {
  sale_items: (SaleItem & {
    products: {
      id: string;
      name: string;
      short_code: number | null;
    } | null;
  })[];
}

interface CreateSaleData {
  customer_name?: string;
  customer_phone?: string;
  discount?: number;
  notes?: string;
  items: {
    product_id: string;
    quantity: number;
    unit_price: number;
  }[];
}

export function useSales() {
  const { data: company } = useCompany();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const salesQuery = useQuery({
    queryKey: ["sales", company?.id],
    queryFn: async () => {
      if (!company?.id) return [];

      const { data, error } = await supabase
        .from("sales")
        .select(`
          *,
          sale_items!sale_items_sale_id_fkey (
            *,
            products!sale_items_product_id_fkey (
              id,
              name,
              short_code
            )
          )
        `)
        .eq("company_id", company.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Sales query error:", error);
        throw error;
      }
      return data;
    },
    enabled: !!company?.id,
  });

  const createSale = useMutation({
    mutationFn: async (saleData: CreateSaleData) => {
      if (!company?.id) throw new Error("Company not found");

      // Obter próximo número da venda
      const { data: nextNumberData, error: numberError } = await supabase
        .rpc("next_sale_number", { comp_id: company.id });

      if (numberError) throw numberError;

      const total = saleData.items.reduce(
        (sum, item) => sum + item.quantity * item.unit_price,
        0
      );

      const finalTotal = total - (saleData.discount || 0);

      // Criar a venda
      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .insert({
          company_id: company.id,
          sale_number: nextNumberData.toString(),
          customer_name: saleData.customer_name || "",
          total_amount: finalTotal,
          discount_amount: saleData.discount || 0,
          notes: saleData.notes || "",
          status: "COMPLETED",
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Criar os itens da venda
      const saleItems = saleData.items.map((item) => ({
        company_id: company.id,
        sale_id: sale.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
      }));

      const { error: itemsError } = await supabase
        .from("sale_items")
        .insert(saleItems);

      if (itemsError) throw itemsError;

      // Processar cada item da venda com FEFO automático
      for (const item of saleData.items) {
        // Consumir estoque automaticamente via FEFO
        try {
          const { error: fefoError } = await supabase
            .rpc("consume_fefo", {
              p_company: company.id,
              p_product: item.product_id,
              p_qty: item.quantity
            });

          if (fefoError) {
            console.error("FEFO consumption error:", fefoError);
            throw new Error(`Erro no abatimento FEFO: ${fefoError.message}`);
          }

        } catch (error: any) {
          console.error("Error in FEFO consumption:", error);
          throw new Error(`Estoque insuficiente para o produto: ${error.message}`);
        }
      }

      return sale;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales", company?.id] });
      queryClient.invalidateQueries({ queryKey: ["inventory", company?.id] });
      queryClient.invalidateQueries({ queryKey: ["inventory-batches", company?.id] });
      queryClient.invalidateQueries({ queryKey: ["stock-movements", company?.id] });
      toast({
        title: "Venda realizada",
        description: "A venda foi registrada com sucesso.",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao realizar venda",
        description: error.message || "Ocorreu um erro ao registrar a venda.",
        variant: "destructive",
      });
    },
  });

  const cancelSale = useMutation({
    mutationFn: async (saleId: string) => {
      const { data: sale, error: fetchError } = await supabase
        .from("sales")
        .select(`
          *,
          sale_items!sale_items_sale_id_fkey (
            product_id,
            quantity
          )
        `)
        .eq("id", saleId)
        .single();

      if (fetchError) throw fetchError;

      // Atualizar status da venda
      const { error: updateError } = await supabase
        .from("sales")
        .update({ status: "CANCELLED" })
        .eq("id", saleId);

      if (updateError) throw updateError;

      // Estornar movimentações de estoque
      for (const item of sale.sale_items) {
        const { error: movementError } = await supabase
          .from("stock_movements")
          .insert({
            company_id: company?.id,
            product_id: item.product_id,
            type: "adjustment",
            quantity: item.quantity,
            reference_id: saleId,
            reference_type: "sale_cancellation",
            reason: `Cancelamento da venda #${sale.sale_number}`,
          });

        if (movementError) throw movementError;
      }

      return sale;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales", company?.id] });
      queryClient.invalidateQueries({ queryKey: ["inventory", company?.id] });
      queryClient.invalidateQueries({ queryKey: ["stock-movements", company?.id] });
      toast({
        title: "Venda cancelada",
        description: "A venda foi cancelada e o estoque foi estornado.",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao cancelar venda",
        description: error.message || "Ocorreu um erro ao cancelar a venda.",
        variant: "destructive",
      });
    },
  });

  return {
    sales: salesQuery.data || [],
    isLoading: salesQuery.isLoading,
    error: salesQuery.error,
    createSale,
    cancelSale,
    isCreating: createSale.isPending,
    isCancelling: cancelSale.isPending,
  };
}
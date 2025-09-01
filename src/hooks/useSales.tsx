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
          sale_items (
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

      if (error) throw error;
      return data;
    },
    enabled: !!company?.id,
  });

  const createSale = useMutation({
    mutationFn: async (saleData: CreateSaleData) => {
      console.log("Iniciando criação de venda:", saleData);
      
      if (!company?.id) throw new Error("Company not found");

      // Obter próximo número da venda
      console.log("Obtendo próximo número da venda...");
      const { data: nextNumberData, error: numberError } = await supabase
        .rpc("next_sale_number", { comp_id: company.id });

      if (numberError) {
        console.error("Erro ao obter número da venda:", numberError);
        throw numberError;
      }
      console.log("Próximo número da venda:", nextNumberData);

      const total = saleData.items.reduce(
        (sum, item) => sum + item.quantity * item.unit_price,
        0
      );

      const finalTotal = total - (saleData.discount || 0);
      console.log("Total calculado:", { total, discount: saleData.discount, finalTotal });

      // Criar a venda
      console.log("Criando venda...");
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

      if (saleError) {
        console.error("Erro ao criar venda:", saleError);
        throw saleError;
      }
      console.log("Venda criada:", sale);

      // Criar os itens da venda
      console.log("Criando itens da venda...");
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

      if (itemsError) {
        console.error("Erro ao criar itens da venda:", itemsError);
        throw itemsError;
      }
      console.log("Itens da venda criados com sucesso");

      // Registrar movimentações de estoque e atualizar batches
      console.log("Registrando movimentações de estoque...");
      for (const item of saleData.items) {
        // 1. Registrar movimento de estoque
        const { error: movementError } = await supabase
          .from("stock_movements")
          .insert({
            company_id: company.id,
            product_id: item.product_id,
            type: "OUT",
            quantity: -item.quantity,
            reference_id: sale.id,
            reference_type: "sale",
            reason: `Venda #${nextNumberData}`,
          });

        if (movementError) {
          console.error("Erro ao registrar movimento de estoque:", movementError);
          throw movementError;
        }

        // 2. Atualizar inventory_batches (FIFO)
        let remainingQuantity = item.quantity;
        
        const { data: existingBatches, error: batchesError } = await supabase
          .from("inventory_batches")
          .select("*")
          .eq("company_id", company.id)
          .eq("product_id", item.product_id)
          .gt("quantity", 0)
          .order("created_at", { ascending: true });

        if (batchesError) {
          console.error("Erro ao buscar lotes:", batchesError);
          throw batchesError;
        }

        for (const batch of existingBatches || []) {
          if (remainingQuantity <= 0) break;

          const quantityToDeduct = Math.min(batch.quantity, remainingQuantity);
          const newQuantity = batch.quantity - quantityToDeduct;

          const { error: updateError } = await supabase
            .from("inventory_batches")
            .update({ quantity: newQuantity })
            .eq("id", batch.id);

          if (updateError) {
            console.error("Erro ao atualizar lote:", updateError);
            throw updateError;
          }

          remainingQuantity -= quantityToDeduct;
        }

        // Verificar se havia estoque suficiente
        if (remainingQuantity > 0) {
          throw new Error(`Estoque insuficiente para o produto. Faltam ${remainingQuantity} unidades.`);
        }
      }
      console.log("Movimentações de estoque registradas");

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
          sale_items (
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
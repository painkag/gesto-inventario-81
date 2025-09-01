import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "./useCompany";
import { useToast } from "./use-toast";
import type { Database } from "@/integrations/supabase/types";

export interface InventoryBatchWithProduct {
  id: string;
  batch_number: string | null;
  quantity: number;
  expiry_date: string | null;
  cost_price: number | null;
  supplier: string | null;
  created_at: string;
  products: {
    name: string;
    code: string;
    unit: string;
  } | null;
}

export interface StockMovementWithProduct {
  id: string;
  type: string;
  quantity: number;
  unit_price: number | null;
  total_price: number | null;
  reason: string | null;
  reference_type: string | null;
  reference_id: string | null;
  created_at: string;
  created_by: string | null;
  products: {
    name: string;
    code: string;
    unit: string;
  } | null;
}

export interface ProductWithStock {
  id: string;
  name: string;
  code: string;
  short_code: number | null;
  unit: string;
  min_stock: number | null;
  current_stock: number;
  cost_price: number | null;
  selling_price: number | null;
  category: string | null;
  brand: string | null;
  is_active: boolean | null;
}

export function useInventory() {
  const { data: company } = useCompany();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const inventoryQuery = useQuery({
    queryKey: ["inventory", company?.id],
    queryFn: async (): Promise<ProductWithStock[]> => {
      if (!company?.id) return [];

      // Busca manual dos produtos com estoque
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("company_id", company.id)
        .eq("is_active", true)
        .order("name");

      if (productsError) throw productsError;

      const productsWithStock: ProductWithStock[] = [];
      
      for (const product of products || []) {
        const { data: stockData, error: stockError } = await supabase
          .rpc("get_product_stock", {
            comp_id: company.id,
            product_uuid: product.id
          });

        if (stockError) {
          console.error("Erro ao buscar estoque:", stockError);
          // Continua com estoque 0 se houver erro
          productsWithStock.push({
            id: product.id,
            name: product.name,
            code: product.code,
            short_code: product.short_code,
            unit: product.unit,
            min_stock: product.min_stock,
            current_stock: 0,
            cost_price: product.cost_price,
            selling_price: product.selling_price,
            category: product.category,
            brand: product.brand,
            is_active: product.is_active,
          });
          continue;
        }

        productsWithStock.push({
          id: product.id,
          name: product.name,
          code: product.code,
          short_code: product.short_code,
          unit: product.unit,
          min_stock: product.min_stock,
          current_stock: Number(stockData || 0),
          cost_price: product.cost_price,
          selling_price: product.selling_price,
          category: product.category,
          brand: product.brand,
          is_active: product.is_active,
        });
      }

      return productsWithStock;
    },
    enabled: !!company?.id,
  });

  const batches = useQuery({
    queryKey: ["inventory-batches", company?.id],
    queryFn: async () => {
      if (!company?.id) return [];

      const { data, error } = await supabase
        .from("inventory_batches")
        .select(`
          *,
          products!inner (name, code, unit)
        `)
        .eq("company_id", company.id)
        .gt("quantity", 0)
        .order("expiry_date", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!company?.id,
  });

  const movements = useQuery({
    queryKey: ["stock-movements", company?.id],
    queryFn: async () => {
      if (!company?.id) return [];

      const { data, error } = await supabase
        .from("stock_movements")
        .select(`
          *,
          products!inner (name, code, unit)
        `)
        .eq("company_id", company.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    },
    enabled: !!company?.id,
  });

  const adjustStock = useMutation({
    mutationFn: async ({
      productId,
      quantity,
      type,
      reason,
      unitPrice,
    }: {
      productId: string;
      quantity: number;
      type: "IN" | "OUT" | "ADJUSTMENT";
      reason?: string;
      unitPrice?: number;
    }) => {
      if (!company?.id) throw new Error("Company not found");

      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error("User not found");

      // 1. Inserir movimento de estoque
      const { error: movementError } = await supabase.from("stock_movements").insert({
        company_id: company.id,
        product_id: productId,
        quantity,
        type,
        reason,
        unit_price: unitPrice,
        total_price: unitPrice ? unitPrice * Math.abs(quantity) : undefined,
        created_by: user.data.user.id,
      });

      if (movementError) throw movementError;

      // 2. Atualizar inventory_batches para manter consistência
      if (quantity > 0) {
        // ENTRADA: Criar novo lote
        const { error: batchError } = await supabase.from("inventory_batches").insert({
          company_id: company.id,
          product_id: productId,
          batch_number: `ADJ-${Date.now()}`,
          quantity: Math.abs(quantity),
          cost_price: unitPrice || null,
          supplier: type === "IN" ? "Entrada manual" : "Ajuste de estoque",
        });

        if (batchError) throw batchError;
      } else if (quantity < 0) {
        // SAÍDA: Decrementar lotes existentes (FIFO)
        let remainingQuantity = Math.abs(quantity);
        
        // Buscar lotes com quantidade disponível, ordenados por data (FIFO)
        const { data: existingBatches, error: batchesError } = await supabase
          .from("inventory_batches")
          .select("*")
          .eq("company_id", company.id)
          .eq("product_id", productId)
          .gt("quantity", 0)
          .order("created_at", { ascending: true });

        if (batchesError) throw batchesError;

        for (const batch of existingBatches || []) {
          if (remainingQuantity <= 0) break;

          const quantityToDeduct = Math.min(batch.quantity, remainingQuantity);
          const newQuantity = batch.quantity - quantityToDeduct;

          const { error: updateError } = await supabase
            .from("inventory_batches")
            .update({ quantity: newQuantity })
            .eq("id", batch.id);

          if (updateError) throw updateError;

          remainingQuantity -= quantityToDeduct;
        }

        // Se ainda sobrou quantidade a ser deduzida, significa que não há estoque suficiente
        if (remainingQuantity > 0) {
          throw new Error(`Estoque insuficiente. Faltam ${remainingQuantity} unidades.`);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", company?.id] });
      queryClient.invalidateQueries({ queryKey: ["inventory-batches", company?.id] });
      queryClient.invalidateQueries({ queryKey: ["stock-movements", company?.id] });
      toast({
        title: "Estoque ajustado",
        description: "O ajuste de estoque foi realizado com sucesso.",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao ajustar estoque",
        description: error.message || "Ocorreu um erro ao ajustar o estoque.",
        variant: "destructive",
      });
    },
  });

  return {
    inventory: inventoryQuery.data || [],
    batches: batches.data || [],
    movements: movements.data || [],
    isLoading: inventoryQuery.isLoading,
    error: inventoryQuery.error,
    adjustStock,
  };
}
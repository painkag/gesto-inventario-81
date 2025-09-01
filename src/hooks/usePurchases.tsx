import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "./useCompany";
import { useToast } from "./use-toast";
import type { Database } from "@/integrations/supabase/types";

type Purchase = Database["public"]["Tables"]["purchases"]["Row"];
type PurchaseInsert = Database["public"]["Tables"]["purchases"]["Insert"];
type PurchaseItem = Database["public"]["Tables"]["purchase_items"]["Row"];

interface PurchaseWithItems extends Purchase {
  purchase_items: (PurchaseItem & {
    products: {
      id: string;
      name: string;
      short_code: number | null;
    } | null;
  })[];
}

interface CreatePurchaseData {
  supplier_name: string;
  supplier_document?: string;
  notes?: string;
  items: {
    product_id: string;
    quantity: number;
    unit_cost: number;
    expiration_date?: string;
  }[];
}

export function usePurchases() {
  const { data: company } = useCompany();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const purchasesQuery = useQuery({
    queryKey: ["purchases", company?.id],
    queryFn: async () => {
      if (!company?.id) return [];

      const { data, error } = await supabase
        .from("purchases")
        .select(`
          *,
          purchase_items!purchase_items_purchase_id_fkey (
            *,
            products!purchase_items_product_id_fkey (
              id,
              name,
              short_code
            )
          )
        `)
        .eq("company_id", company.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Purchases query error:", error);
        throw error;
      }
      return data;
    },
    enabled: !!company?.id,
  });

  const createPurchase = useMutation({
    mutationFn: async (purchaseData: CreatePurchaseData) => {
      if (!company?.id) throw new Error("Company not found");

      // Obter próximo número da compra
      const { data: nextNumberData, error: numberError } = await supabase
        .rpc("next_purchase_number", { comp_id: company.id });

      if (numberError) throw numberError;

      const total = purchaseData.items.reduce(
        (sum, item) => sum + item.quantity * item.unit_cost,
        0
      );

      // Criar a compra
      const { data: purchase, error: purchaseError } = await supabase
        .from("purchases")
        .insert({
          company_id: company.id,
          purchase_number: nextNumberData.toString(),
          supplier_name: purchaseData.supplier_name,
          supplier_document: purchaseData.supplier_document || "",
          total_amount: total,
          notes: purchaseData.notes || "",
          status: "COMPLETED",
        })
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      // Criar os itens da compra
      const purchaseItems = purchaseData.items.map((item) => ({
        company_id: company.id,
        purchase_id: purchase.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_cost: item.unit_cost,
        total_cost: item.quantity * item.unit_cost,
      }));

      const { error: itemsError } = await supabase
        .from("purchase_items")
        .insert(purchaseItems);

      if (itemsError) throw itemsError;

      // Registrar movimentações de estoque e criar batches
      for (const item of purchaseData.items) {
        // 1. Registrar movimento de estoque
        const { error: movementError } = await supabase
          .from("stock_movements")
          .insert({
            company_id: company.id,
            product_id: item.product_id,
            type: "IN",
            quantity: item.quantity,
            reference_id: purchase.id,
            reference_type: "purchase",
            reason: `Compra #${nextNumberData}`,
          });

        if (movementError) throw movementError;

        // 2. Criar novo batch no estoque
        const { error: batchError } = await supabase
          .from("inventory_batches")
          .insert({
            company_id: company.id,
            product_id: item.product_id,
            quantity: item.quantity,
            cost: item.unit_cost,
            expiration_date: item.expiration_date || null,
          });

        if (batchError) throw batchError;
      }

      return purchase;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases", company?.id] });
      queryClient.invalidateQueries({ queryKey: ["inventory", company?.id] });
      queryClient.invalidateQueries({ queryKey: ["inventory-batches", company?.id] });
      queryClient.invalidateQueries({ queryKey: ["stock-movements", company?.id] });
      toast({
        title: "Compra registrada",
        description: "A compra foi registrada com sucesso.",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao registrar compra",
        description: error.message || "Ocorreu um erro ao registrar a compra.",
        variant: "destructive",
      });
    },
  });

  return {
    purchases: purchasesQuery.data || [],
    isLoading: purchasesQuery.isLoading,
    error: purchasesQuery.error,
    createPurchase,
    isCreating: createPurchase.isPending,
  };
}
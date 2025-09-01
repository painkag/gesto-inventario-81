import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "./useCompany";
import { subDays, startOfDay, endOfDay, format } from "date-fns";

export function useReports() {
  const { data: company } = useCompany();

  // Vendas por período
  const salesReportQuery = useQuery({
    queryKey: ["sales-report", company?.id],
    queryFn: async () => {
      if (!company?.id) return null;

      const last30Days = subDays(new Date(), 30);
      
      const { data: sales, error } = await supabase
        .from("sales")
        .select(`
          id,
          created_at,
          total_amount,
          status,
          sale_items!sale_items_sale_id_fkey (
            quantity,
            total_price,
            products!sale_items_product_id_fkey (
              name,
              category
            )
          )
        `)
        .eq("company_id", company.id)
        .gte("created_at", last30Days.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Processar dados para gráficos
      const dailySales: Record<string, number> = {};
      const categoryRevenue: Record<string, number> = {};
      let totalRevenue = 0;
      let totalSales = 0;

      sales?.forEach(sale => {
        if (sale.status === "COMPLETED") {
          const day = format(new Date(sale.created_at), "yyyy-MM-dd");
          dailySales[day] = (dailySales[day] || 0) + sale.total_amount;
          totalRevenue += sale.total_amount;
          totalSales++;

          sale.sale_items?.forEach(item => {
            const category = item.products?.category || "Sem categoria";
            categoryRevenue[category] = (categoryRevenue[category] || 0) + item.total_price;
          });
        }
      });

      return {
        sales,
        dailySales,
        categoryRevenue,
        totalRevenue,
        totalSales,
        averageTicket: totalSales > 0 ? totalRevenue / totalSales : 0,
      };
    },
    enabled: !!company?.id,
  });

  // Estoque baixo
  const lowStockQuery = useQuery({
    queryKey: ["low-stock-report", company?.id],
    queryFn: async () => {
      if (!company?.id) return [];

      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          code,
          short_code,
          category
        `)
        .eq("company_id", company.id);

      if (error) throw error;

      // Obter estoque atual para cada produto
      const productsWithStock = await Promise.all(
        (data || []).map(async (product) => {
          const { data: batches } = await supabase
            .from("inventory_batches")
            .select("quantity")
            .eq("company_id", company.id)
            .eq("product_id", product.id);

          const currentStock = batches?.reduce((sum, batch) => sum + batch.quantity, 0) || 0;
          const minimumStock = 5; // Valor padrão até termos a coluna no banco

          return {
            ...product,
            current_stock: currentStock,
            minimum_stock: minimumStock,
            is_low_stock: currentStock <= minimumStock,
          };
        })
      );

      return productsWithStock.filter(product => product.is_low_stock);
    },
    enabled: !!company?.id,
  });

  // Top produtos
  const topProductsQuery = useQuery({
    queryKey: ["top-products-report", company?.id],
    queryFn: async () => {
      if (!company?.id) return [];

      const last30Days = subDays(new Date(), 30);

      const { data, error } = await supabase
        .from("sale_items")
        .select(`
          product_id,
          quantity,
          total_price,
          products!sale_items_product_id_fkey (
            name,
            code
          ),
          sales!sale_items_sale_id_fkey (
            created_at,
            status
          )
        `)
        .eq("company_id", company.id)
        .gte("sales.created_at", last30Days.toISOString())
        .eq("sales.status", "COMPLETED");

      if (error) throw error;

      // Agrupar por produto
      const productStats: Record<string, {
        name: string;
        code: string;
        totalQuantity: number;
        totalRevenue: number;
        salesCount: number;
      }> = {};

      data?.forEach(item => {
        const productId = item.product_id;
        const productName = item.products?.name || "Produto sem nome";
        const productCode = item.products?.code || "";

        if (!productStats[productId]) {
          productStats[productId] = {
            name: productName,
            code: productCode,
            totalQuantity: 0,
            totalRevenue: 0,
            salesCount: 0,
          };
        }

        productStats[productId].totalQuantity += item.quantity;
        productStats[productId].totalRevenue += item.total_price;
        productStats[productId].salesCount += 1;
      });

      return Object.values(productStats)
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 10);
    },
    enabled: !!company?.id,
  });

  return {
    salesReport: salesReportQuery.data,
    lowStock: lowStockQuery.data || [],
    topProducts: topProductsQuery.data || [],
    isLoading: salesReportQuery.isLoading || lowStockQuery.isLoading || topProductsQuery.isLoading,
  };
}
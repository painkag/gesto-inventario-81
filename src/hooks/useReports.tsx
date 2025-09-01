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

      try {
        const { data: products, error: productsError } = await supabase
          .from("products")
          .select(`
            id,
            name,
            code,
            short_code,
            category
          `)
          .eq("company_id", company.id);

        if (productsError) {
          console.error("Error fetching products:", productsError);
          return [];
        }

        if (!products?.length) return [];

        // Obter estoque atual de forma mais eficiente
        const { data: batches, error: batchesError } = await supabase
          .from("inventory_batches")
          .select("product_id, quantity")
          .eq("company_id", company.id)
          .gt("quantity", 0);

        if (batchesError) {
          console.error("Error fetching batches:", batchesError);
          return [];
        }

        // Agrupar estoque por produto
        const stockByProduct: Record<string, number> = {};
        batches?.forEach(batch => {
          stockByProduct[batch.product_id] = (stockByProduct[batch.product_id] || 0) + batch.quantity;
        });

        // Criar lista de produtos com estoque baixo
        const lowStockProducts = products.map(product => {
          const currentStock = stockByProduct[product.id] || 0;
          const minimumStock = 5; // Valor padrão
          
          return {
            ...product,
            current_stock: currentStock,
            minimum_stock: minimumStock,
            is_low_stock: currentStock <= minimumStock,
          };
        }).filter(product => product.is_low_stock);

        console.log("Low stock products found:", lowStockProducts.length);
        return lowStockProducts;
      } catch (error) {
        console.error("Error in lowStockQuery:", error);
        return [];
      }
    },
    enabled: !!company?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos
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

  // Análise mensal para BI
  const monthlyAnalysisQuery = useQuery({
    queryKey: ["monthly-analysis", company?.id],
    queryFn: async () => {
      if (!company?.id) return { monthlyData: [], productTrends: [] };

      const last12Months = subDays(new Date(), 365);

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
        .eq("status", "COMPLETED")
        .gte("created_at", last12Months.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Dados mensais
      const monthlyData: Record<string, { revenue: number, sales: number, products: Record<string, number> }> = {};
      
      sales?.forEach(sale => {
        const month = format(new Date(sale.created_at), "yyyy-MM");
        
        if (!monthlyData[month]) {
          monthlyData[month] = { revenue: 0, sales: 0, products: {} };
        }
        
        monthlyData[month].revenue += sale.total_amount;
        monthlyData[month].sales += 1;
        
        sale.sale_items?.forEach(item => {
          const productName = item.products?.name || "Produto";
          monthlyData[month].products[productName] = 
            (monthlyData[month].products[productName] || 0) + item.quantity;
        });
      });

      // Transformar em array ordenado
      const monthlyArray = Object.entries(monthlyData)
        .map(([month, data]) => ({
          month,
          monthName: format(new Date(month + "-01"), "MMM/yy"),
          revenue: data.revenue,
          sales: data.sales,
          topProducts: Object.entries(data.products)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([name, quantity]) => ({ name, quantity }))
        }))
        .sort((a, b) => a.month.localeCompare(b.month));

      return {
        monthlyData: monthlyArray,
        productTrends: monthlyArray
      };
    },
    enabled: !!company?.id,
  });

  return {
    salesReport: salesReportQuery.data,
    lowStock: lowStockQuery.data || [],
    topProducts: topProductsQuery.data || [],
    monthlyAnalysis: monthlyAnalysisQuery.data,
    isLoading: salesReportQuery.isLoading || lowStockQuery.isLoading || topProductsQuery.isLoading || monthlyAnalysisQuery.isLoading,
  };
}
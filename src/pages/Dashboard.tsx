import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SaleForm } from "@/components/sales/SaleForm";
import { ProductForm } from "@/components/products/ProductForm";
import { StockAdjustmentDialog } from "@/components/inventory/StockAdjustmentDialog";
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle,
  Calendar,
  DollarSign,
  Users,
  Plus,
  FileText
} from "lucide-react";
import { useSales } from "@/hooks/useSales";
import { useInventory } from "@/hooks/useInventory";
import { useReports } from "@/hooks/useReports";
import { format, isToday } from "date-fns";

const Dashboard = () => {
  const navigate = useNavigate();
  const { sales, isLoading: salesLoading } = useSales();
  const { inventory, adjustStock, isLoading: inventoryLoading } = useInventory();
  const { salesReport, lowStock, isLoading: reportsLoading } = useReports();
  
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Calculate today's sales
  const todaySales = sales?.filter(sale => 
    isToday(new Date(sale.created_at)) && sale.status === "COMPLETED"
  ) || [];
  
  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total_amount, 0);
  const totalProducts = inventory?.length || 0;
  const monthlyRevenue = salesReport?.totalRevenue || 0;
  const averageTicket = salesReport?.averageTicket || 0;

  // Recent sales (last 5)
  const recentSales = sales?.slice(0, 5).map(sale => ({
    id: sale.sale_number,
    customer: sale.customer_name || "Cliente não identificado",
    value: formatCurrency(sale.total_amount),
    time: format(new Date(sale.created_at), "HH:mm"),
    date: format(new Date(sale.created_at), "dd/MM")
  })) || [];

  const stats = [
    {
      title: "Vendas Hoje",
      value: formatCurrency(todayRevenue),
      change: `${todaySales.length} vendas`,
      trend: "up" as const,
      icon: DollarSign,
      color: "text-success"
    },
    {
      title: "Produtos em Estoque",
      value: totalProducts.toString(),
      change: `${lowStock.length} com estoque baixo`,
      trend: lowStock.length > 0 ? "down" as const : "up" as const,
      icon: Package,
      color: "text-primary"
    },
    {
      title: "Vendas do Mês",
      value: formatCurrency(monthlyRevenue),
      change: `${salesReport?.totalSales || 0} vendas`,
      trend: "up" as const,
      icon: TrendingUp,
      color: "text-success"
    },
    {
      title: "Ticket Médio",
      value: formatCurrency(averageTicket),
      change: "últimos 30 dias",
      trend: "up" as const,
      icon: ShoppingCart,
      color: "text-warning"
    }
  ];

  const alerts = [
    ...(lowStock.length > 0 ? [{
      type: "error" as const,
      title: "Estoque baixo",
      description: `${lowStock.length} produtos abaixo do estoque mínimo`,
      action: "Ver produtos",
      onClick: () => navigate("/dashboard/inventory")
    }] : []),
    {
      type: "info" as const,
      title: "Relatórios disponíveis",
      description: "Visualize análises detalhadas do seu negócio",
      action: "Ver relatórios",
      onClick: () => navigate("/dashboard/reports")
    },
    {
      type: "warning" as const,
      title: "Movimentações",
      description: "Acompanhe todas as movimentações de estoque",
      action: "Ver movimentações",
      onClick: () => navigate("/dashboard/movements")
    }
  ];

  const handleStockAdjustment = async (data: {
    productId: string;
    quantity: number;
    type: "IN" | "OUT" | "ADJUSTMENT";
    reason?: string;
    unitPrice?: number;
  }) => {
    try {
      await adjustStock.mutateAsync({
        productId: data.productId,
        quantity: data.quantity,
        type: data.type,
        reason: data.reason,
        unitPrice: data.unitPrice,
      });
    } catch (error) {
      console.error("Erro ao ajustar estoque:", error);
    }
  };

const openStockAdjustment = () => {
    // Use the first product for demo purposes, or show a product selector
    if (inventory && inventory.length > 0) {
      setSelectedProduct(inventory[0]);
      setAdjustmentDialogOpen(true);
    }
  };

  const isLoading = salesLoading || inventoryLoading || reportsLoading;

  if (isLoading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4 animate-pulse" />
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="hover-lift transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <p className={`text-xs ${stat.trend === 'up' ? 'text-success' : 'text-destructive'} flex items-center`}>
                    <TrendingUp className={`h-3 w-3 mr-1 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Alerts */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <span>Alertas e Notificações</span>
              </CardTitle>
              <CardDescription>
                Itens que precisam da sua atenção
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <h4 className="font-semibold text-foreground">
                      {alert.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {alert.description}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={alert.onClick}
                  >
                    {alert.action}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Sales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <span>Vendas Recentes</span>
              </CardTitle>
              <CardDescription>
                Últimas transações realizadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentSales.map((sale, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {sale.customer}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Venda #{sale.id}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      {sale.value}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {sale.time} - {sale.date}
                    </p>
                  </div>
                </div>
              ))}
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => navigate("/dashboard/sales")}
              >
                Ver todas as vendas
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesse rapidamente as funcionalidades mais usadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SaleForm />
              
              <ProductForm />
              
              <Button 
                variant="outline" 
                className="h-20 flex-col space-y-2"
                onClick={openStockAdjustment}
                disabled={!inventory || inventory.length === 0}
              >
                <TrendingUp className="h-6 w-6" />
                <span>Ajuste de Estoque</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex-col space-y-2"
                onClick={() => navigate("/dashboard/reports")}
              >
                <BarChart3 className="h-6 w-6" />
                <span>Relatórios</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stock Adjustment Dialog */}
        <StockAdjustmentDialog
          product={selectedProduct}
          open={adjustmentDialogOpen}
          onOpenChange={setAdjustmentDialogOpen}
          onSubmit={handleStockAdjustment}
          isLoading={adjustStock.isPending}
        />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
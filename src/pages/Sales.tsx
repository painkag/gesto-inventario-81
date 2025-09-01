import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SalesTable } from "@/components/sales/SalesTable";
import { SaleForm } from "@/components/sales/SaleForm";
import { useSales } from "@/hooks/useSales";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, ShoppingCart, DollarSign, Users } from "lucide-react";

const Sales = () => {
  const { sales, isLoading } = useSales();

  const todaySales = sales.filter(sale => {
    const today = new Date();
    const saleDate = new Date(sale.created_at);
    return saleDate.toDateString() === today.toDateString() && sale.status === 'completed';
  });

  const totalToday = todaySales.reduce((sum, sale) => sum + sale.total_amount, 0);
  const completedSales = sales.filter(sale => sale.status === 'completed');
  const totalSales = completedSales.reduce((sum, sale) => sum + sale.total_amount, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <DashboardLayout title="Vendas">
      <div className="space-y-6">
        {/* Header com botão de nova venda */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Vendas</h1>
          <SaleForm />
        </div>

        {/* Cards de estatísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todaySales.length}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(totalToday)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedSales.length}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(totalSales)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
              <p className="text-xs text-muted-foreground">
                Vendas concluídas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {completedSales.length > 0 
                  ? formatCurrency(totalSales / completedSales.length)
                  : formatCurrency(0)
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Por venda
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de vendas */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Carregando vendas...</p>
              </div>
            ) : (
              <SalesTable />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Sales;
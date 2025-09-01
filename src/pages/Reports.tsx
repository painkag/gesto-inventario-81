import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useReports } from "@/hooks/useReports";
import { MonthlyChart } from "@/components/reports/MonthlyChart";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  AlertTriangle,
  BarChart3,
  PieChart
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

const Reports = () => {
  const { salesReport, lowStock, topProducts, monthlyAnalysis, isLoading } = useReports();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Relatórios">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando relatórios...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Relatórios">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Relatórios e Análises</h1>
          <Badge variant="outline">Últimos 30 dias</Badge>
        </div>

        {/* Resumo Geral */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Receita Total
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(salesReport?.totalRevenue || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Últimos 30 dias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Vendas
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{salesReport?.totalSales || 0}</div>
              <p className="text-xs text-muted-foreground">
                Vendas realizadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ticket Médio
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(salesReport?.averageTicket || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Por venda
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Alertas de Estoque
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {lowStock.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Produtos em falta
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Top Produtos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Top 10 Produtos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.slice(0, 10).map((product, index) => {
                  const maxRevenue = topProducts[0]?.totalRevenue || 1;
                  const percentage = (product.totalRevenue / maxRevenue) * 100;
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium truncate">{product.name}</span>
                        <span className="text-muted-foreground">
                          {formatCurrency(product.totalRevenue)}
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Qtd: {product.totalQuantity}</span>
                        <span>Vendas: {product.salesCount}</span>
                      </div>
                    </div>
                  );
                })}
                {topProducts.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhuma venda registrada no período
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Estoque Baixo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Alertas de Estoque
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowStock.slice(0, 10).map((product, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Código: {product.code}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-destructive">
                        {product.current_stock} unidades
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Mín: {product.minimum_stock || 0}
                      </div>
                    </div>
                  </div>
                ))}
                {lowStock.length === 0 && (
                  <div className="text-center py-4">
                    <Package className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Todos os produtos estão com estoque adequado
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Análise de BI Mensal */}
        {monthlyAnalysis?.monthlyData && monthlyAnalysis.monthlyData.length > 0 && (
          <MonthlyChart data={monthlyAnalysis.monthlyData} />
        )}

        {/* Vendas por Categoria */}
        {salesReport?.categoryRevenue && Object.keys(salesReport.categoryRevenue).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Receita por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(salesReport.categoryRevenue)
                  .sort(([,a], [,b]) => b - a)
                  .map(([category, revenue]) => {
                    const percentage = (revenue / salesReport.totalRevenue) * 100;
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{category}</span>
                          <span className="text-sm text-muted-foreground">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(revenue)}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Reports;
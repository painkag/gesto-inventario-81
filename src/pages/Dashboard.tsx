import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle,
  Calendar,
  DollarSign,
  Users
} from "lucide-react";

const stats = [
  {
    title: "Vendas Hoje",
    value: "R$ 2.847,50",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    color: "text-success"
  },
  {
    title: "Produtos em Estoque",
    value: "1.247",
    change: "-3 hoje",
    trend: "down",
    icon: Package,
    color: "text-primary"
  },
  {
    title: "Vendas do Mês",
    value: "R$ 84.329",
    change: "+18.2%",
    trend: "up",
    icon: TrendingUp,
    color: "text-success"
  },
  {
    title: "Ticket Médio",
    value: "R$ 156,80",
    change: "+5.1%",
    trend: "up",
    icon: ShoppingCart,
    color: "text-warning"
  }
];

const alerts = [
  {
    type: "warning",
    title: "Produtos próximos ao vencimento",
    description: "15 produtos vencem nos próximos 7 dias",
    action: "Revisar estoque"
  },
  {
    type: "error",
    title: "Estoque baixo",
    description: "8 produtos abaixo do estoque mínimo",
    action: "Solicitar compra"
  },
  {
    type: "info",
    title: "Relatório mensal",
    description: "Relatório de novembro está pronto",
    action: "Visualizar"
  }
];

const recentSales = [
  { id: "001", customer: "João Silva", value: "R$ 234,50", time: "há 2 min" },
  { id: "002", customer: "Maria Santos", value: "R$ 89,90", time: "há 15 min" },
  { id: "003", customer: "Pedro Costa", value: "R$ 456,30", time: "há 32 min" },
  { id: "004", customer: "Ana Oliveira", value: "R$ 123,70", time: "há 1h" },
];

const Dashboard = () => {
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
                  <Button variant="outline" size="sm">
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
                      {sale.time}
                    </p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4">
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
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <ShoppingCart className="h-6 w-6" />
                <span>Nova Venda</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Package className="h-6 w-6" />
                <span>Adicionar Produto</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <TrendingUp className="h-6 w-6" />
                <span>Entrada de Estoque</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <BarChart3 className="h-6 w-6" />
                <span>Relatórios</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
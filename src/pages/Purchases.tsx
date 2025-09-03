import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PurchaseForm } from "@/components/purchases/PurchaseForm";
import { PurchasesTable } from "@/components/purchases/PurchasesTable";
import { usePurchases } from "@/hooks/usePurchases";
import { ShoppingBag, TrendingUp, Package, DollarSign } from "lucide-react";

const Purchases = () => {
  const { purchases } = usePurchases();

  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const monthlyPurchases = purchases.filter(
    (purchase) => new Date(purchase.created_at) >= thisMonth
  );

  const totalPurchases = purchases.length;
  const monthlyTotal = monthlyPurchases.reduce(
    (sum, purchase) => sum + purchase.total_amount,
    0
  );
  const completedPurchases = purchases.filter(
    (purchase) => purchase.status === "COMPLETED"
  ).length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <DashboardLayout title="Compras">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gestão de Compras</h1>
          <PurchaseForm />
        </div>

        {/* Estatísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Compras Este Mês
              </CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{monthlyPurchases.length}</div>
              <p className="text-xs text-muted-foreground">
                Total de compras realizadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Compras
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPurchases}</div>
              <p className="text-xs text-muted-foreground">
                Compras registradas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Gasto Mensal
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(monthlyTotal)}</div>
              <p className="text-xs text-muted-foreground">
                Investimento em estoque
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Compras Concluídas
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedPurchases}</div>
              <p className="text-xs text-muted-foreground">
                Status finalizado
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Compras */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Compras</CardTitle>
          </CardHeader>
          <CardContent>
            <PurchasesTable />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Purchases;
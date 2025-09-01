import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { StockAdjustmentDialog } from "@/components/inventory/StockAdjustmentDialog";
import { useInventory, ProductWithStock } from "@/hooks/useInventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Package, AlertTriangle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Inventory = () => {
  const { inventory, isLoading, adjustStock } = useInventory();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductWithStock | null>(null);
  const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false);

  const filteredInventory = inventory.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.short_code && product.short_code.toString().includes(searchTerm))
  );

  const stats = {
    totalProducts: inventory.length,
    lowStock: inventory.filter(p => p.min_stock && p.current_stock <= p.min_stock).length,
    outOfStock: inventory.filter(p => p.current_stock === 0).length,
    totalValue: inventory.reduce((acc, p) => acc + ((p.cost_price || 0) * p.current_stock), 0),
  };

  const handleAdjustStock = (product: ProductWithStock) => {
    setSelectedProduct(product);
    setAdjustmentDialogOpen(true);
  };

  const handleSubmitAdjustment = async (data: {
    productId: string;
    quantity: number;
    type: "IN" | "OUT" | "ADJUSTMENT";
    reason?: string;
    unitPrice?: number;
  }) => {
    await adjustStock.mutateAsync(data);
  };

  return (
    <DashboardLayout title="Estoque">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.lowStock}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sem Estoque</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(stats.totalValue)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, código ou código curto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Inventory Table */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground">Carregando estoque...</div>
          </div>
        ) : (
          <InventoryTable
            inventory={filteredInventory}
            onAdjustStock={handleAdjustStock}
          />
        )}

        {/* Stock Adjustment Dialog */}
        <StockAdjustmentDialog
          product={selectedProduct}
          open={adjustmentDialogOpen}
          onOpenChange={setAdjustmentDialogOpen}
          onSubmit={handleSubmitAdjustment}
          isLoading={adjustStock.isPending}
        />
      </div>
    </DashboardLayout>
  );
};

export default Inventory;
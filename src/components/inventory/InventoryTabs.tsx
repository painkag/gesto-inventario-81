import React, { useState, useMemo } from "react";
import { InventoryTable } from "./InventoryTable";
import { BatchesTable } from "./BatchesTable";
import { StockMovementsTable } from "./StockMovementsTable";
import { StockAlertsCard } from "./StockAlertsCard";
import { StockAdjustmentDialog } from "./StockAdjustmentDialog";
import { useInventory, ProductWithStock, InventoryBatchWithProduct, StockMovementWithProduct } from "@/hooks/useInventory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Package, AlertTriangle, TrendingUp, Archive, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function InventoryTabs() {
  const { inventory, batches, movements, isLoading, adjustStock } = useInventory();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductWithStock | null>(null);
  const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false);

  const filteredInventory = useMemo(() => {
    if (!searchTerm.trim()) return inventory;
    
    const search = searchTerm.toLowerCase();
    return inventory.filter((product) =>
      product.name.toLowerCase().includes(search) ||
      product.code.toLowerCase().includes(search) ||
      (product.short_code && product.short_code.toString().includes(search))
    );
  }, [inventory, searchTerm]);

  const stats = useMemo(() => ({
    totalProducts: inventory.length,
    lowStock: inventory.filter(p => p.min_stock && p.current_stock <= p.min_stock).length,
    outOfStock: inventory.filter(p => p.current_stock === 0).length,
    totalValue: inventory.reduce((acc, p) => acc + ((p.cost_price || 0) * p.current_stock), 0),
  }), [inventory]);

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
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>
        
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.lowStock}</div>
          </CardContent>
        </Card>
        
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sem Estoque</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.outOfStock}</div>
          </CardContent>
        </Card>
        
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
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

      {/* Low Stock Alerts */}
      <StockAlertsCard inventory={inventory} />

      {/* Tabs */}
      <Tabs defaultValue="estoque" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="estoque" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Estoque
          </TabsTrigger>
          <TabsTrigger value="lotes" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Lotes
          </TabsTrigger>
          <TabsTrigger value="movimentacoes" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Movimentações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="estoque" className="space-y-4">
          {/* Search */}
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
        </TabsContent>

        <TabsContent value="lotes" className="space-y-4">
          <BatchesTable batches={batches} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="movimentacoes" className="space-y-4">
          <StockMovementsTable movements={movements} isLoading={isLoading} />
        </TabsContent>
      </Tabs>

      {/* Stock Adjustment Dialog */}
      <StockAdjustmentDialog
        product={selectedProduct}
        open={adjustmentDialogOpen}
        onOpenChange={setAdjustmentDialogOpen}
        onSubmit={handleSubmitAdjustment}
        isLoading={adjustStock.isPending}
      />
    </div>
  );
}
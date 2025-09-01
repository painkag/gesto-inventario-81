import { ProductWithStock } from "@/hooks/useInventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StockAlertsCardProps {
  inventory: ProductWithStock[];
}

export function StockAlertsCard({ inventory }: StockAlertsCardProps) {
  const lowStockProducts = inventory.filter(
    (product) => product.min_stock && product.current_stock <= product.min_stock && product.current_stock > 0
  );

  const outOfStockProducts = inventory.filter(
    (product) => product.current_stock === 0
  );

  const formatQuantity = (quantity: number, unit: string) => {
    return `${quantity.toLocaleString("pt-BR")} ${unit}`;
  };

  if (lowStockProducts.length === 0 && outOfStockProducts.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Out of Stock Alert */}
      {outOfStockProducts.length > 0 && (
        <Card className="border-destructive/50 bg-destructive-light">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Produtos Sem Estoque ({outOfStockProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {outOfStockProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-2 bg-background/50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.code}</p>
                  </div>
                  <Badge variant="destructive" className="ml-2">
                    {formatQuantity(product.current_stock, product.unit)}
                  </Badge>
                </div>
              ))}
            </div>
            {outOfStockProducts.length > 5 && (
              <p className="text-xs text-muted-foreground text-center">
                E mais {outOfStockProducts.length - 5} produtos...
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card className="border-warning/50 bg-warning-light">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <Package className="h-5 w-5" />
              Estoque Baixo ({lowStockProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {lowStockProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-2 bg-background/50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.code}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="warning" className="mb-1">
                      {formatQuantity(product.current_stock, product.unit)}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      Min: {formatQuantity(product.min_stock || 0, product.unit)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {lowStockProducts.length > 5 && (
              <p className="text-xs text-muted-foreground text-center">
                E mais {lowStockProducts.length - 5} produtos...
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
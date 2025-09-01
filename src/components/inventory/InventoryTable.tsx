import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { ProductWithStock } from "@/hooks/useInventory";

interface InventoryTableProps {
  inventory: ProductWithStock[];
  onAdjustStock: (product: ProductWithStock) => void;
}

export function InventoryTable({ inventory, onAdjustStock }: InventoryTableProps) {
  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatQuantity = (quantity: number, unit: string) => {
    return `${quantity.toLocaleString("pt-BR")} ${unit}`;
  };

  const getStockStatus = (current: number, min: number | null) => {
    if (!min) return "normal";
    if (current === 0) return "empty";
    if (current <= min) return "low";
    return "normal";
  };

  const getStockBadge = (status: string) => {
    switch (status) {
      case "empty":
        return <Badge variant="destructive">Sem estoque</Badge>;
      case "low":
        return <Badge variant="secondary">Estoque baixo</Badge>;
      default:
        return <Badge variant="outline">Normal</Badge>;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead>Código</TableHead>
            <TableHead>Estoque Atual</TableHead>
            <TableHead>Estoque Mínimo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Preço de Custo</TableHead>
            <TableHead>Preço de Venda</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inventory.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                Nenhum produto encontrado
              </TableCell>
            </TableRow>
          ) : (
            inventory.map((product) => {
              const stockStatus = getStockStatus(
                product.current_stock,
                product.min_stock
              );

              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{product.name}</div>
                      {product.category && (
                        <div className="text-sm text-muted-foreground">
                          {product.category}
                        </div>
                      )}
                      {product.brand && (
                        <div className="text-xs text-muted-foreground">
                          {product.brand}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-sm">
                      {product.short_code && (
                        <div className="font-bold text-primary">
                          #{product.short_code}
                        </div>
                      )}
                      <div className="text-muted-foreground">{product.code}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {formatQuantity(product.current_stock, product.unit)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.min_stock !== null
                      ? formatQuantity(product.min_stock, product.unit)
                      : "-"}
                  </TableCell>
                  <TableCell>{getStockBadge(stockStatus)}</TableCell>
                  <TableCell>{formatCurrency(product.cost_price)}</TableCell>
                  <TableCell>{formatCurrency(product.selling_price)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAdjustStock(product)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Ajustar
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
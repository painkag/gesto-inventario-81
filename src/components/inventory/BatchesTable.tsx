import { format, isAfter, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle, Package, Calendar } from "lucide-react";

import { InventoryBatchWithProduct } from "@/hooks/useInventory";

interface BatchesTableProps {
  batches: any[];
  isLoading: boolean;
}

export function BatchesTable({ batches, isLoading }: BatchesTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatQuantity = (quantity: number, unit: string) => {
    return `${quantity.toLocaleString("pt-BR")} ${unit}`;
  };

  const getExpiryStatus = (expiryDate: string | null) => {
    if (!expiryDate) return { status: "no-expiry", label: "Sem vencimento", variant: "secondary" as const };

    const expiry = new Date(expiryDate);
    const today = new Date();
    const thirtyDaysFromNow = addDays(today, 30);

    if (isAfter(today, expiry)) {
      return { status: "expired", label: "Vencido", variant: "destructive" as const };
    } else if (isAfter(thirtyDaysFromNow, expiry)) {
      return { status: "expiring", label: "Vencendo", variant: "warning" as const };
    }
    
    return { status: "valid", label: "Válido", variant: "success" as const };
  };

  const expiringBatches = batches.filter(batch => {
    if (!batch.expiry_date) return false;
    const expiry = new Date(batch.expiry_date);
    const thirtyDaysFromNow = addDays(new Date(), 30);
    return isAfter(thirtyDaysFromNow, expiry) && !isAfter(new Date(), expiry);
  });

  const expiredBatches = batches.filter(batch => {
    if (!batch.expiry_date) return false;
    const expiry = new Date(batch.expiry_date);
    return isAfter(new Date(), expiry);
  });

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">Carregando lotes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert Cards */}
      {(expiringBatches.length > 0 || expiredBatches.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {expiredBatches.length > 0 && (
            <Card className="border-destructive/50 bg-destructive-light">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-destructive">
                  Lotes Vencidos
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{expiredBatches.length}</div>
                <p className="text-xs text-destructive/80">
                  Lotes que precisam de atenção imediata
                </p>
              </CardContent>
            </Card>
          )}
          
          {expiringBatches.length > 0 && (
            <Card className="border-warning/50 bg-warning-light">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-warning">
                  Lotes Vencendo
                </CardTitle>
                <Calendar className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{expiringBatches.length}</div>
                <p className="text-xs text-warning/80">
                  Lotes que vencem em até 30 dias
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Batches Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Lotes de Estoque
          </CardTitle>
        </CardHeader>
        <CardContent>
          {batches.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-foreground">Nenhum lote encontrado</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Nenhum lote de produtos foi encontrado no estoque.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Lote</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead className="text-right">Custo Unit.</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.map((batch) => {
                    const expiryStatus = getExpiryStatus(batch.expiry_date);
                    const totalValue = (batch.cost_price || 0) * batch.quantity;
                    
                    return (
                      <TableRow key={batch.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{batch.products?.name}</span>
                            <span className="text-sm text-muted-foreground">{batch.products?.code}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">
                            {batch.batch_number || "—"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatQuantity(batch.quantity, batch.products?.unit || "UN")}
                        </TableCell>
                        <TableCell>
                          {batch.expiry_date ? (
                            format(new Date(batch.expiry_date), "dd/MM/yyyy", { locale: ptBR })
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={expiryStatus.variant}>
                            {expiryStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {batch.supplier || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {batch.cost_price ? formatCurrency(batch.cost_price) : "—"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(totalValue)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
import { format } from "date-fns";
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
import { Activity, TrendingUp, TrendingDown, RotateCcw } from "lucide-react";

import { StockMovementWithProduct } from "@/hooks/useInventory";

interface StockMovementsTableProps {
  movements: any[];
  isLoading: boolean;
}

export function StockMovementsTable({ movements, isLoading }: StockMovementsTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatQuantity = (quantity: number, unit: string) => {
    return `${quantity.toLocaleString("pt-BR")} ${unit}`;
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "IN":
        return <TrendingUp className="h-4 w-4 text-success" />;
      case "OUT":
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      case "ADJUSTMENT":
        return <RotateCcw className="h-4 w-4 text-warning" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getMovementBadge = (type: string) => {
    switch (type) {
      case "IN":
        return <Badge variant="success">Entrada</Badge>;
      case "OUT":
        return <Badge variant="destructive">Saída</Badge>;
      case "ADJUSTMENT":
        return <Badge variant="warning">Ajuste</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getMovementDescription = (movement: any) => {
    if (movement.reason) return movement.reason;
    
    switch (movement.type) {
      case "IN":
        return movement.reference_type === "PURCHASE" ? "Entrada por compra" : "Entrada manual";
      case "OUT":
        return movement.reference_type === "SALE" ? "Saída por venda" : "Saída manual";
      case "ADJUSTMENT":
        return "Ajuste de estoque";
      default:
        return "—";
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">Carregando movimentações...</div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Histórico de Movimentações
        </CardTitle>
      </CardHeader>
      <CardContent>
        {movements.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold text-foreground">Nenhuma movimentação encontrada</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Nenhuma movimentação de estoque foi registrada ainda.
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead className="text-right">Valor Unit.</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead>Descrição</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {format(new Date(movement.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(movement.created_at), "HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{movement.products?.name}</span>
                        <span className="text-sm text-muted-foreground">{movement.products?.code}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getMovementIcon(movement.type)}
                        {getMovementBadge(movement.type)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={movement.type === "OUT" ? "text-destructive" : "text-success"}>
                        {movement.type === "OUT" ? "-" : "+"}
                        {formatQuantity(Math.abs(movement.quantity), movement.products?.unit || "UN")}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {movement.unit_price ? formatCurrency(movement.unit_price) : "—"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {movement.total_price ? formatCurrency(movement.total_price) : "—"}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {getMovementDescription(movement)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
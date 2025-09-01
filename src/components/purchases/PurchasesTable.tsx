import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePurchases } from "@/hooks/usePurchases";

export function PurchasesTable() {
  const { purchases, isLoading } = usePurchases();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      COMPLETED: "default",
      PENDING: "secondary",
      CANCELLED: "destructive",
    };

    const labels: Record<string, string> = {
      COMPLETED: "Concluída",
      PENDING: "Pendente",
      CANCELLED: "Cancelada",
    };

    return (
      <Badge variant={variants[status] || "secondary"}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Carregando compras...</p>
      </div>
    );
  }

  if (!purchases.length) {
    return (
      <div className="text-center py-8">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">Nenhuma compra encontrada</h3>
        <p className="text-muted-foreground">
          Registre sua primeira compra para começar.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Número</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Fornecedor</TableHead>
            <TableHead>Itens</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchases.map((purchase) => (
            <TableRow key={purchase.id}>
              <TableCell className="font-medium">
                #{purchase.purchase_number}
              </TableCell>
              <TableCell>
                {format(new Date(purchase.created_at), "dd/MM/yyyy", {
                  locale: ptBR,
                })}
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{purchase.supplier_name}</div>
                  {purchase.supplier_document && (
                    <div className="text-sm text-muted-foreground">
                      {purchase.supplier_document}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {purchase.purchase_items?.length || 0} item(s)
              </TableCell>
              <TableCell>
                {formatCurrency(purchase.total_amount)}
              </TableCell>
              <TableCell>
                {getStatusBadge(purchase.status)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalhes
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye, X, MoreHorizontal } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useSales } from "@/hooks/useSales";
import { useState } from "react";

export function SalesTable() {
  const { sales, cancelSale, isCancelling } = useSales();
  const [selectedSale, setSelectedSale] = useState<string | null>(null);

  const handleCancelSale = (saleId: string) => {
    cancelSale.mutate(saleId);
    setSelectedSale(null);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "success" as const,
      cancelled: "destructive" as const,
      pending: "secondary" as const,
    };

    const labels = {
      completed: "Concluída",
      cancelled: "Cancelada",
      pending: "Pendente",
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (sales.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhuma venda encontrada</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Itens</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell className="font-medium">
                #{sale.sale_number}
              </TableCell>
              <TableCell>
                {format(new Date(sale.created_at), "dd/MM/yyyy HH:mm", {
                  locale: ptBR,
                })}
              </TableCell>
              <TableCell>
                {sale.customer_name || "Cliente avulso"}
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {sale.sale_items.length} item(s)
                  <div className="text-xs text-muted-foreground">
                    {sale.sale_items
                      .slice(0, 2)
                      .map((item) => item.products?.name)
                      .join(", ")}
                    {sale.sale_items.length > 2 && "..."}
                  </div>
                </div>
              </TableCell>
              <TableCell className="font-medium">
                {formatCurrency(sale.total_amount)}
                {sale.discount_amount > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Desc: {formatCurrency(sale.discount_amount)}
                  </div>
                )}
              </TableCell>
              <TableCell>{getStatusBadge(sale.status)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver detalhes
                    </DropdownMenuItem>
                    {sale.status === "completed" && (
                      <>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                              className="text-destructive"
                            >
                              <X className="mr-2 h-4 w-4" />
                              Cancelar venda
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Cancelar venda #{sale.sale_number}?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação cancelará a venda e estornará o estoque
                                dos produtos. Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleCancelSale(sale.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                disabled={isCancelling}
                              >
                                {isCancelling ? "Cancelando..." : "Confirmar"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
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
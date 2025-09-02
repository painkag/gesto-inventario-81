import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Search,
  Calendar,
  Package,
  ArrowUpDown,
  Filter
} from "lucide-react";
import { useInventory } from "@/hooks/useInventory";
import { format } from "date-fns";

const Movements = () => {
  const { movements, isLoading } = useInventory();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "product" | "quantity">("date");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getMovementTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'entrada':
      case 'purchase':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'saida':
      case 'sale':
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      case 'ajuste':
      case 'adjustment':
        return <RefreshCw className="h-4 w-4 text-warning" />;
      default:
        return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getMovementTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'entrada':
      case 'purchase':
        return <Badge variant="outline" className="text-success border-success/20 bg-success/10">Entrada</Badge>;
      case 'saida':
      case 'sale':
        return <Badge variant="outline" className="text-destructive border-destructive/20 bg-destructive/10">Saída</Badge>;
      case 'ajuste':
      case 'adjustment':
        return <Badge variant="outline" className="text-warning border-warning/20 bg-warning/10">Ajuste</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Filter and sort movements
  const filteredMovements = movements
    .filter(movement => {
      const productName = movement.products?.name || "";
      const productCode = movement.products?.code || "";
      
      const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           productCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "all" || movement.type.toLowerCase() === typeFilter.toLowerCase();
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "product":
          return (a.products?.name || "").localeCompare(b.products?.name || "");
        case "quantity":
          return Math.abs(b.quantity) - Math.abs(a.quantity);
        default:
          return 0;
      }
    });

  // Calculate summary stats
  const entradas = movements.filter(m => m.type.toLowerCase() === 'entrada' || m.type.toLowerCase() === 'purchase').length;
  const saidas = movements.filter(m => m.type.toLowerCase() === 'saida' || m.type.toLowerCase() === 'sale').length;
  const ajustes = movements.filter(m => m.type.toLowerCase() === 'ajuste' || m.type.toLowerCase() === 'adjustment').length;
  const totalMovements = movements.length;

  if (isLoading) {
    return (
      <DashboardLayout title="Movimentações de Estoque">
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Carregando movimentações...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Movimentações de Estoque">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMovements}</div>
              <p className="text-xs text-muted-foreground">movimentações</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entradas</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{entradas}</div>
              <p className="text-xs text-muted-foreground">produtos recebidos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saídas</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{saidas}</div>
              <p className="text-xs text-muted-foreground">produtos vendidos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ajustes</CardTitle>
              <RefreshCw className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{ajustes}</div>
              <p className="text-xs text-muted-foreground">correções manuais</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar por produto ou código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Tipo de movimento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="entrada">Entradas</SelectItem>
                  <SelectItem value="saida">Saídas</SelectItem>
                  <SelectItem value="ajuste">Ajustes</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: "date" | "product" | "quantity") => setSortBy(value)}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Data</SelectItem>
                  <SelectItem value="product">Produto</SelectItem>
                  <SelectItem value="quantity">Quantidade</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Movements Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Histórico de Movimentações
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredMovements.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  Nenhuma movimentação encontrada
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm || typeFilter !== "all" 
                    ? "Tente ajustar os filtros de busca"
                    : "As movimentações aparecerão aqui conforme forem realizadas"
                  }
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
                      <TableHead>Observações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMovements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {format(new Date(movement.created_at), "dd/MM/yyyy")}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(movement.created_at), "HH:mm")}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{movement.products?.name || "Produto não encontrado"}</div>
                            <div className="text-xs text-muted-foreground">
                              {movement.products?.code || "N/A"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getMovementTypeIcon(movement.type)}
                            {getMovementTypeBadge(movement.type)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-medium ${
                            movement.quantity > 0 ? 'text-success' : 'text-destructive'
                          }`}>
                            {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {movement.unit_price ? formatCurrency(movement.unit_price) : '-'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {movement.unit_price 
                            ? formatCurrency(Math.abs(movement.quantity) * movement.unit_price)
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {movement.reason || "-"}
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
      </div>
    </DashboardLayout>
  );
};

export default Movements;
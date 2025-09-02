import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus, 
  Percent, 
  Calendar, 
  Gift, 
  Edit, 
  Trash2, 
  Play, 
  Pause,
  Tag,
  TrendingDown
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Promotion {
  id: string;
  name: string;
  description: string;
  type: "percentage" | "fixed" | "bogo";
  value: number;
  startDate: string;
  endDate: string;
  status: "active" | "inactive" | "scheduled" | "expired";
  products: string[];
  minAmount?: number;
}

const Promotions = () => {
  const { toast } = useToast();
  const [promotions, setPromotions] = useState<Promotion[]>([
    {
      id: "1",
      name: "Black Friday 2024",
      description: "Desconto especial para Black Friday em produtos selecionados",
      type: "percentage",
      value: 25,
      startDate: "2024-11-29",
      endDate: "2024-12-01",
      status: "active",
      products: ["Eletrônicos", "Roupas"],
      minAmount: 100
    },
    {
      id: "2", 
      name: "Leve 2 Pague 1",
      description: "Promoção em produtos de limpeza",
      type: "bogo",
      value: 1,
      startDate: "2024-12-01",
      endDate: "2024-12-15",
      status: "scheduled",
      products: ["Limpeza"]
    },
    {
      id: "3",
      name: "Desconto Natal",
      description: "R$ 20 de desconto em compras acima de R$ 200",
      type: "fixed",
      value: 20,
      startDate: "2024-12-15",
      endDate: "2024-12-25",
      status: "scheduled",
      products: ["Todos"],
      minAmount: 200
    }
  ]);

  const [showDialog, setShowDialog] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "percentage" as "percentage" | "fixed" | "bogo",
    value: 0,
    startDate: "",
    endDate: "",
    products: "",
    minAmount: 0
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { variant: "success" as const, label: "Ativa" },
      inactive: { variant: "secondary" as const, label: "Inativa" },
      scheduled: { variant: "default" as const, label: "Agendada" },
      expired: { variant: "destructive" as const, label: "Expirada" }
    };
    
    const config = variants[status as keyof typeof variants] || variants.inactive;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "percentage":
        return <Percent className="h-4 w-4" />;
      case "fixed":
        return <TrendingDown className="h-4 w-4" />;
      case "bogo":
        return <Gift className="h-4 w-4" />;
      default:
        return <Tag className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "percentage":
        return "Percentual";
      case "fixed":
        return "Valor Fixo";
      case "bogo":
        return "Leve X Pague Y";
      default:
        return type;
    }
  };

  const formatValue = (type: string, value: number) => {
    switch (type) {
      case "percentage":
        return `${value}%`;
      case "fixed":
        return `R$ ${value.toFixed(2)}`;
      case "bogo":
        return `Leve ${value + 1} Pague ${value}`;
      default:
        return value.toString();
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.startDate || !formData.endDate) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const promotion: Promotion = {
      id: editingPromotion?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      type: formData.type,
      value: formData.value,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: new Date(formData.startDate) <= new Date() ? "active" : "scheduled",
      products: formData.products.split(",").map(p => p.trim()).filter(Boolean),
      minAmount: formData.minAmount || undefined
    };

    if (editingPromotion) {
      setPromotions(prev => prev.map(p => p.id === promotion.id ? promotion : p));
      toast({
        title: "Promoção atualizada!",
        description: "A promoção foi atualizada com sucesso."
      });
    } else {
      setPromotions(prev => [...prev, promotion]);
      toast({
        title: "Promoção criada!",
        description: "A nova promoção foi criada com sucesso."
      });
    }

    setShowDialog(false);
    setEditingPromotion(null);
    setFormData({
      name: "",
      description: "",
      type: "percentage" as "percentage" | "fixed" | "bogo",
      value: 0,
      startDate: "",
      endDate: "",
      products: "",
      minAmount: 0
    });
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      name: promotion.name,
      description: promotion.description,
      type: promotion.type,
      value: promotion.value,
      startDate: promotion.startDate,
      endDate: promotion.endDate,
      products: promotion.products.join(", "),
      minAmount: promotion.minAmount || 0
    });
    setShowDialog(true);
  };

  const handleDelete = (id: string) => {
    setPromotions(prev => prev.filter(p => p.id !== id));
    toast({
      title: "Promoção excluída!",
      description: "A promoção foi removida com sucesso."
    });
  };

  const toggleStatus = (id: string) => {
    setPromotions(prev => prev.map(p => 
      p.id === id 
        ? { ...p, status: p.status === "active" ? "inactive" : "active" as any }
        : p
    ));
  };

  return (
    <DashboardLayout title="Promoções">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Promoções</h1>
            <p className="text-muted-foreground">
              Gerencie promoções e descontos para seus produtos
            </p>
          </div>
          
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Promoção
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingPromotion ? "Editar Promoção" : "Nova Promoção"}
                </DialogTitle>
                <DialogDescription>
                  Configure os detalhes da promoção
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Promoção *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Black Friday 2024"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição da promoção..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Desconto</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: "percentage" | "fixed" | "bogo") => setFormData(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentual (%)</SelectItem>
                        <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                        <SelectItem value="bogo">Leve X Pague Y</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="value">Valor</Label>
                    <Input
                      id="value"
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData(prev => ({ ...prev, value: Number(e.target.value) }))}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Data Início *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">Data Fim *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="products">Produtos/Categorias</Label>
                  <Input
                    id="products"
                    value={formData.products}
                    onChange={(e) => setFormData(prev => ({ ...prev, products: e.target.value }))}
                    placeholder="Ex: Eletrônicos, Roupas (separado por vírgula)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minAmount">Valor Mínimo (R$)</Label>
                  <Input
                    id="minAmount"
                    type="number"
                    value={formData.minAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, minAmount: Number(e.target.value) }))}
                    placeholder="0.00"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSave} className="flex-1">
                    {editingPromotion ? "Atualizar" : "Criar"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDialog(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Estatísticas */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Promoções</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{promotions.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ativas</CardTitle>
              <Play className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {promotions.filter(p => p.status === "active").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agendadas</CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {promotions.filter(p => p.status === "scheduled").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Economia Estimada</CardTitle>
              <TrendingDown className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">R$ 1.250</div>
              <p className="text-xs text-muted-foreground">Este mês</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Promoções */}
        <Card>
          <CardHeader>
            <CardTitle>Promoções Cadastradas</CardTitle>
            <CardDescription>
              Gerencie todas as suas promoções ativas e agendadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.map((promotion) => (
                  <TableRow key={promotion.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{promotion.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {promotion.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(promotion.type)}
                        {getTypeLabel(promotion.type)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatValue(promotion.type, promotion.value)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(promotion.startDate).toLocaleDateString('pt-BR')}</div>
                        <div className="text-muted-foreground">
                          até {new Date(promotion.endDate).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(promotion.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleStatus(promotion.id)}
                        >
                          {promotion.status === "active" ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(promotion)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(promotion.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Promotions;
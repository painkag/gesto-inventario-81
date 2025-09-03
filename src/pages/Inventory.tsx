import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useCompany } from "@/hooks/useCompany";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, 
  Package, 
  AlertTriangle, 
  Calendar, 
  Plus, 
  Minus, 
  Eye,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  Filter
} from "lucide-react";
import { format, addDays, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Product {
  id: string;
  name: string;
  code: string;
  unit: string;
  min_stock?: number;
  category?: string;
  selling_price?: number;
}

interface InventoryBatch {
  id: string;
  quantity: number;
  expiry_date?: string;
  cost_price?: number;
  batch_number?: string;
  supplier?: string;
  created_at: string;
}

interface ProductWithStock extends Product {
  current_stock: number;
  low_stock: boolean;
  expiring_soon: boolean;
  next_expiry?: string;
  batches: InventoryBatch[];
}

interface StockMovement {
  id: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason?: string;
  reference_type?: string;
  created_at: string;
  product: {
    name: string;
    code: string;
  };
}

const Inventory = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: company } = useCompany();
  
  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLowStock, setShowLowStock] = useState(false);
  const [showExpiring, setShowExpiring] = useState(false);
  
  // Modal states
  const [selectedProduct, setSelectedProduct] = useState<ProductWithStock | null>(null);
  const [showBatchesModal, setShowBatchesModal] = useState(false);
  const [showQuickEntryModal, setShowQuickEntryModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  
  // Form states
  const [quickEntryForm, setQuickEntryForm] = useState({
    quantity: '',
    expiry_date: '',
    cost_price: '',
    batch_number: '',
    supplier: ''
  });
  
  const [adjustmentForm, setAdjustmentForm] = useState({
    type: 'IN' as 'IN' | 'OUT',
    quantity: '',
    reason: ''
  });

  // Load inventory data
  useEffect(() => {
    if (company?.id) {
      loadInventory();
    }
  }, [company?.id]);

  const loadInventory = async () => {
    if (!company?.id) return;
    
    setIsLoading(true);
    try {
      // Load products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('company_id', company.id)
        .eq('is_active', true)
        .order('name');

      if (productsError) throw productsError;

      // Load inventory batches
      const { data: batchesData, error: batchesError } = await supabase
        .from('inventory_batches')
        .select('*')
        .eq('company_id', company.id)
        .gt('quantity', 0)
        .order('expiry_date');

      if (batchesError) throw batchesError;

      // Process data
      const productsWithStock: ProductWithStock[] = (productsData || []).map(product => {
        const productBatches = (batchesData || []).filter(batch => batch.product_id === product.id);
        const currentStock = productBatches.reduce((sum, batch) => sum + batch.quantity, 0);
        const minStock = product.min_stock || 5; // Default threshold
        const lowStock = currentStock <= minStock;
        
        // Check for expiring batches (30 days or less)
        const expiringThreshold = addDays(new Date(), 30);
        const expiringBatches = productBatches.filter(batch => 
          batch.expiry_date && isBefore(new Date(batch.expiry_date), expiringThreshold)
        );
        const expiringSoon = expiringBatches.length > 0;
        const nextExpiry = expiringBatches.length > 0 ? expiringBatches[0].expiry_date : undefined;

        return {
          ...product,
          current_stock: currentStock,
          low_stock: lowStock,
          expiring_soon: expiringSoon,
          next_expiry: nextExpiry,
          batches: productBatches
        };
      });

      setProducts(productsWithStock);
    } catch (error) {
      console.error('Error loading inventory:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar estoque",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLowStock = !showLowStock || product.low_stock;
    const matchesExpiring = !showExpiring || product.expiring_soon;
    
    return matchesSearch && matchesLowStock && matchesExpiring;
  });

  const handleQuickEntry = async () => {
    if (!selectedProduct || !quickEntryForm.quantity) {
      toast({
        title: "Erro",
        description: "Preencha a quantidade",
        variant: "destructive"
      });
      return;
    }

    try {
      const quantity = parseFloat(quickEntryForm.quantity);
      const costPrice = quickEntryForm.cost_price ? parseFloat(quickEntryForm.cost_price) : null;
      
      // Insert inventory batch
      const { error: batchError } = await supabase
        .from('inventory_batches')
        .insert({
          company_id: company!.id,
          product_id: selectedProduct.id,
          quantity,
          expiry_date: quickEntryForm.expiry_date || null,
          cost_price: costPrice,
          batch_number: quickEntryForm.batch_number || null,
          supplier: quickEntryForm.supplier || null
        });

      if (batchError) throw batchError;

      // Insert stock movement
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert({
          company_id: company!.id,
          product_id: selectedProduct.id,
          type: 'IN',
          quantity,
          unit_price: costPrice,
          total_price: costPrice ? costPrice * quantity : null,
          reference_type: 'QuickEntry',
          reason: 'Entrada rápida'
        });

      if (movementError) throw movementError;

      toast({
        title: "Entrada registrada",
        description: `${quantity} ${selectedProduct.unit} adicionados ao estoque`
      });

      // Reset form and close modal
      setQuickEntryForm({
        quantity: '',
        expiry_date: '',
        cost_price: '',
        batch_number: '',
        supplier: ''
      });
      setShowQuickEntryModal(false);
      setSelectedProduct(null);
      
      // Reload inventory
      loadInventory();

    } catch (error: any) {
      console.error('Error in quick entry:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao registrar entrada",
        variant: "destructive"
      });
    }
  };

  const handleAdjustment = async () => {
    if (!selectedProduct || !adjustmentForm.quantity || !adjustmentForm.reason) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      const quantity = parseFloat(adjustmentForm.quantity);
      
      if (adjustmentForm.type === 'OUT') {
        // For OUT movements, use FEFO consumption
        const { error: consumeError } = await supabase.rpc('consume_fefo', {
          p_company: company!.id,
          p_product: selectedProduct.id,
          p_qty: quantity
        });

        if (consumeError) throw consumeError;
      } else {
        // For IN movements, create a new batch
        const { error: batchError } = await supabase
          .from('inventory_batches')
          .insert({
            company_id: company!.id,
            product_id: selectedProduct.id,
            quantity,
            batch_number: `ADJ-${Date.now()}`
          });

        if (batchError) throw batchError;
      }

      // Insert stock movement record
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert({
          company_id: company!.id,
          product_id: selectedProduct.id,
          type: adjustmentForm.type === 'IN' ? 'IN' : 'OUT',
          quantity,
          reference_type: 'Adjustment',
          reason: adjustmentForm.reason
        });

      if (movementError) throw movementError;

      toast({
        title: "Ajuste registrado",
        description: `${adjustmentForm.type === 'IN' ? 'Entrada' : 'Saída'} de ${quantity} ${selectedProduct.unit}`
      });

      // Reset form and close modal
      setAdjustmentForm({
        type: 'IN',
        quantity: '',
        reason: ''
      });
      setShowAdjustmentModal(false);
      setSelectedProduct(null);
      
      // Reload inventory
      loadInventory();

    } catch (error: any) {
      console.error('Error in adjustment:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao registrar ajuste",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  return (
    <DashboardLayout title="Estoque">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold">Controle de Estoque</h1>
            <p className="text-muted-foreground">
              {filteredProducts.length} produtos • {products.filter(p => p.low_stock).length} com estoque baixo
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => {
                setSelectedProduct(null);
                setShowQuickEntryModal(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Entrada Rápida
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => {
                setSelectedProduct(null);
                setShowAdjustmentModal(true);
              }}
            >
              <TrendingUp className="h-4 w-4" />
              Ajuste
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="low-stock"
                    checked={showLowStock}
                    onCheckedChange={(checked) => setShowLowStock(checked as boolean)}
                  />
                  <Label htmlFor="low-stock" className="text-sm">
                    Estoque baixo
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="expiring"
                    checked={showExpiring}
                    onCheckedChange={(checked) => setShowExpiring(checked as boolean)}
                  />
                  <Label htmlFor="expiring" className="text-sm">
                    Próximo ao vencimento
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Carregando estoque...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum produto encontrado</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-center">Em Estoque</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Próx. Vencimento</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.code}
                            {product.category && ` • ${product.category}`}
                          </p>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <div>
                          <p className="font-semibold">
                            {product.current_stock.toFixed(1)} {product.unit}
                          </p>
                          {product.min_stock && (
                            <p className="text-xs text-muted-foreground">
                              Min: {product.min_stock}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-1">
                          {product.low_stock && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Baixo
                            </Badge>
                          )}
                          {product.expiring_soon && (
                            <Badge variant="secondary" className="text-xs">
                              <Calendar className="h-3 w-3 mr-1" />
                              Vencendo
                            </Badge>
                          )}
                          {!product.low_stock && !product.expiring_soon && (
                            <Badge variant="outline" className="text-xs">
                              OK
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        {product.next_expiry ? (
                          <span className="text-sm">
                            {formatDate(product.next_expiry)}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowBatchesModal(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowQuickEntryModal(true);
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowAdjustmentModal(true);
                            }}
                          >
                            <TrendingUp className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Batches Modal */}
      <Dialog open={showBatchesModal} onOpenChange={setShowBatchesModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Lotes - {selectedProduct?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Estoque Total</p>
                  <p className="text-lg font-semibold">
                    {selectedProduct.current_stock.toFixed(1)} {selectedProduct.unit}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Lotes Ativos</p>
                  <p className="text-lg font-semibold">{selectedProduct.batches.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Próximo Vencimento</p>
                  <p className="text-lg font-semibold">
                    {selectedProduct.next_expiry 
                      ? formatDate(selectedProduct.next_expiry)
                      : '-'
                    }
                  </p>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lote</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Custo</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Criado em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedProduct.batches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-mono text-sm">
                        {batch.batch_number || `#${batch.id.slice(-8)}`}
                      </TableCell>
                      <TableCell>
                        {batch.quantity.toFixed(1)} {selectedProduct.unit}
                      </TableCell>
                      <TableCell>
                        {batch.expiry_date ? formatDate(batch.expiry_date) : '-'}
                      </TableCell>
                      <TableCell>
                        {batch.cost_price ? formatCurrency(batch.cost_price) : '-'}
                      </TableCell>
                      <TableCell>{batch.supplier || '-'}</TableCell>
                      <TableCell>
                        {formatDate(batch.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Quick Entry Modal */}
      <Dialog open={showQuickEntryModal} onOpenChange={setShowQuickEntryModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Entrada Rápida
              {selectedProduct && ` - ${selectedProduct.name}`}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {!selectedProduct && (
              <div>
                <Label htmlFor="product-search">Produto</Label>
                <Input
                  id="product-search"
                  placeholder="Buscar produto..."
                  className="mt-1"
                />
                {/* TODO: Add product search dropdown */}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Quantidade *</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.1"
                  value={quickEntryForm.quantity}
                  onChange={(e) => setQuickEntryForm(prev => ({ ...prev, quantity: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="cost-price">Preço de Custo</Label>
                <Input
                  id="cost-price"
                  type="number"
                  step="0.01"
                  value={quickEntryForm.cost_price}
                  onChange={(e) => setQuickEntryForm(prev => ({ ...prev, cost_price: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry-date">Data de Vencimento</Label>
                <Input
                  id="expiry-date"
                  type="date"
                  value={quickEntryForm.expiry_date}
                  onChange={(e) => setQuickEntryForm(prev => ({ ...prev, expiry_date: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="batch-number">Número do Lote</Label>
                <Input
                  id="batch-number"
                  value={quickEntryForm.batch_number}
                  onChange={(e) => setQuickEntryForm(prev => ({ ...prev, batch_number: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="supplier">Fornecedor</Label>
              <Input
                id="supplier"
                value={quickEntryForm.supplier}
                onChange={(e) => setQuickEntryForm(prev => ({ ...prev, supplier: e.target.value }))}
                className="mt-1"
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowQuickEntryModal(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleQuickEntry}
                disabled={!quickEntryForm.quantity}
              >
                Registrar Entrada
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Adjustment Modal */}
      <Dialog open={showAdjustmentModal} onOpenChange={setShowAdjustmentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Ajuste de Estoque
              {selectedProduct && ` - ${selectedProduct.name}`}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {!selectedProduct && (
              <div>
                <Label htmlFor="adjustment-product-search">Produto</Label>
                <Input
                  id="adjustment-product-search"
                  placeholder="Buscar produto..."
                  className="mt-1"
                />
                {/* TODO: Add product search dropdown */}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Ajuste</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={adjustmentForm.type === 'IN' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAdjustmentForm(prev => ({ ...prev, type: 'IN' }))}
                    className="flex-1"
                  >
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Entrada
                  </Button>
                  <Button
                    variant={adjustmentForm.type === 'OUT' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAdjustmentForm(prev => ({ ...prev, type: 'OUT' }))}
                    className="flex-1"
                  >
                    <TrendingDown className="h-4 w-4 mr-1" />
                    Saída
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="adjustment-quantity">Quantidade *</Label>
                <Input
                  id="adjustment-quantity"
                  type="number"
                  step="0.1"
                  value={adjustmentForm.quantity}
                  onChange={(e) => setAdjustmentForm(prev => ({ ...prev, quantity: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="adjustment-reason">Motivo *</Label>
              <Textarea
                id="adjustment-reason"
                value={adjustmentForm.reason}
                onChange={(e) => setAdjustmentForm(prev => ({ ...prev, reason: e.target.value }))}
                className="mt-1"
                placeholder="Descreva o motivo do ajuste..."
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowAdjustmentModal(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleAdjustment}
                disabled={!adjustmentForm.quantity || !adjustmentForm.reason}
              >
                Registrar Ajuste
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Inventory;
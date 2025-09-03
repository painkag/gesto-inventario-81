import React, { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { useCompany } from "@/hooks/useCompany";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BarcodeScanner } from "@/components/scanner/BarcodeScanner";
import { 
  Search, 
  ShoppingCart, 
  Scan, 
  Trash2, 
  Plus, 
  Minus, 
  Receipt, 
  CreditCard,
  Banknote,
  Smartphone,
  WifiOff
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  code: string;
  selling_price: number;
  unit: string;
  category?: string;
  sell_by_weight?: boolean;
}

interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

type PaymentMethod = 'CASH' | 'CARD' | 'PIX';

const Sales = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: company } = useCompany();
  
  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load products
  useEffect(() => {
    if (company?.id) {
      loadProducts();
    }
  }, [company?.id]);

  // Search products
  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchProducts();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, products]);

  const loadProducts = async () => {
    if (!company?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('company_id', company.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar produtos",
        variant: "destructive"
      });
    }
  };

  const searchProducts = () => {
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(filtered.slice(0, 10)); // Limit to 10 results
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      updateCartItemQuantity(product.id, existingItem.quantity + quantity);
    } else {
      const newItem: CartItem = {
        product,
        quantity,
        unitPrice: product.selling_price,
        discount: 0,
        total: product.selling_price * quantity
      };
      setCart([...cart, newItem]);
    }
    
    setSearchTerm("");
    setSearchResults([]);
    
    toast({
      title: "Produto adicionado",
      description: `${product.name} adicionado ao carrinho`
    });
  };

  const updateCartItemQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(cart.map(item => 
      item.product.id === productId
        ? { 
            ...item, 
            quantity: newQuantity,
            total: (item.unitPrice * newQuantity) * (1 - item.discount / 100)
          }
        : item
    ));
  };

  const updateCartItemDiscount = (productId: string, discount: number) => {
    setCart(cart.map(item => 
      item.product.id === productId
        ? { 
            ...item, 
            discount,
            total: (item.unitPrice * item.quantity) * (1 - discount / 100)
          }
        : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setGlobalDiscount(0);
  };

  const onBarcodeScan = (code: string) => {
    const product = products.find(p => p.code === code);
    if (product) {
      addToCart(product);
      setIsScanning(false);
    } else {
      toast({
        title: "Produto não encontrado",
        description: `Código ${code} não encontrado no estoque`,
        variant: "destructive"
      });
    }
  };

  const finalizeSale = async () => {
    if (cart.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de finalizar",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if online
      if (!navigator.onLine) {
        toast({
          title: "Modo offline",
          description: "Venda será sincronizada quando voltar online",
          variant: "default"
        });
        // TODO: Implement offline queue if exists
        return;
      }

      // Get session for auth
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('Não autorizado');
      }

      // Prepare sale data
      const items = cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount
      }));

      const saleData = {
        companyId: company!.id,
        items,
        paymentMethod,
        globalDiscount
      };

      // Call edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/finalize-sale`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(saleData)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao finalizar venda');
      }

      const result = await response.json();
      
      toast({
        title: "Venda finalizada!",
        description: `Venda ${result.saleNumber} concluída com sucesso`
      });

      // Show receipt link
      const receiptUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sale-receipt?saleId=${result.saleId}`;
      
      toast({
        title: "Recibo disponível",
        description: (
          <div className="flex items-center gap-2">
            <span>Clique para abrir o recibo</span>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => window.open(receiptUrl, '_blank')}
            >
              <Receipt className="h-4 w-4 mr-1" />
              Abrir
            </Button>
          </div>
        )
      });

      clearCart();

    } catch (error: any) {
      console.error('Error finalizing sale:', error);
      toast({
        title: "Erro ao finalizar venda",
        description: error.message || "Tente novamente",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = subtotal * (globalDiscount / 100);
  const total = subtotal - discountAmount;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
      if (e.key === 'Escape') {
        setSearchTerm("");
        setSearchResults([]);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <DashboardLayout title="PDV">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        {/* Left Column - Product Search */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Buscar Produtos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="search-input"
                    placeholder="Digite o nome ou código do produto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && searchResults.length > 0) {
                        addToCart(searchResults[0]);
                      }
                    }}
                    className="pr-10"
                  />
                  <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsScanning(true)}
                  className="flex items-center gap-2"
                >
                  <Scan className="h-4 w-4" />
                  Scanner
                </Button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <Card className="max-h-60 overflow-y-auto">
                  <CardContent className="p-2">
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md cursor-pointer"
                        onClick={() => addToCart(product)}
                      >
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.code} | {formatCurrency(product.selling_price)}
                            {product.category && ` | ${product.category}`}
                          </p>
                        </div>
                        <Plus className="h-4 w-4 text-primary" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Offline Indicator */}
              {!navigator.onLine && (
                <div className="flex items-center gap-2 p-2 bg-yellow-100 border border-yellow-300 rounded-md">
                  <WifiOff className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">Modo offline - Vendas serão sincronizadas</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Shopping Cart */}
        <div className="space-y-4">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Carrinho ({cart.length} {cart.length === 1 ? 'item' : 'itens'})
                </div>
                {cart.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearCart}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col">
              {cart.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-center">
                  <div className="space-y-2">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">Carrinho vazio</p>
                    <p className="text-sm text-muted-foreground">
                      Use a busca ou scanner para adicionar produtos
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 flex-1">
                  {/* Cart Items */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.product.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(item.unitPrice)} / {item.product.unit}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mb-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateCartItemQuantity(item.product.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateCartItemQuantity(item.product.id, Number(e.target.value))}
                            className="w-20 text-center"
                            min="1"
                            step={item.product.sell_by_weight ? "0.1" : "1"}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateCartItemQuantity(item.product.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            {item.product.unit}
                          </span>
                        </div>

                        {/* Discount */}
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            placeholder="Desconto %"
                            value={item.discount}
                            onChange={(e) => updateCartItemDiscount(item.product.id, Number(e.target.value))}
                            className="w-24 text-sm"
                            min="0"
                            max="100"
                          />
                          <span className="text-sm font-medium">
                            Total: {formatCurrency(item.total)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Summary */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    
                    {/* Global Discount */}
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Desconto geral %"
                        value={globalDiscount}
                        onChange={(e) => setGlobalDiscount(Number(e.target.value))}
                        className="w-32 text-sm"
                        min="0"
                        max="100"
                      />
                      <span className="text-sm">
                        -{formatCurrency(discountAmount)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Payment Method */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Método de Pagamento:</p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          <div className="flex items-center gap-2">
                            {paymentMethod === 'CASH' && <Banknote className="h-4 w-4" />}
                            {paymentMethod === 'CARD' && <CreditCard className="h-4 w-4" />}
                            {paymentMethod === 'PIX' && <Smartphone className="h-4 w-4" />}
                            {paymentMethod === 'CASH' && 'Dinheiro'}
                            {paymentMethod === 'CARD' && 'Cartão'}
                            {paymentMethod === 'PIX' && 'PIX'}
                          </div>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        <DropdownMenuItem onClick={() => setPaymentMethod('CASH')}>
                          <Banknote className="h-4 w-4 mr-2" />
                          Dinheiro
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setPaymentMethod('CARD')}>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Cartão
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setPaymentMethod('PIX')}>
                          <Smartphone className="h-4 w-4 mr-2" />
                          PIX
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={clearCart}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={finalizeSale}
                      disabled={isSubmitting || cart.length === 0}
                    >
                      {isSubmitting ? "Finalizando..." : "Finalizar Venda"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Barcode Scanner Modal */}
      <BarcodeScanner 
        onScan={onBarcodeScan}
        onClose={() => setIsScanning(false)}
        isOpen={isScanning}
      />
    </DashboardLayout>
  );
};

export default Sales;
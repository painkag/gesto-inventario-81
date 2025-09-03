import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useProducts } from '@/hooks/useProducts';
import { useSales } from '@/hooks/useSales';
import { useBlueToast } from '@/hooks/useBlueToast';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BarcodeScanner } from '@/components/scanner/BarcodeScanner';
import { Search, ShoppingCart, Scan, Trash2, Plus, Minus } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
}

export default function PDV() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  
  const { products = [], isLoading } = useProducts();
  const { createSale, isCreating } = useSales();
  const { showSuccess, showError } = useBlueToast();

  // Format currency helper
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code?.includes(searchTerm)
  );

  // Add product to cart
  const addToCart = (product: any) => {
    // For now, assume stock is available - in production should check inventory
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        id: product.id,
        name: product.name,
        price: product.selling_price,
        quantity: 1,
        stock: 999 // Placeholder - should get from inventory
      }]);
    }
    setSearchTerm('');
  };

  // Update item quantity
  const updateQuantity = (id: string, change: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) return item;
        if (newQuantity > item.stock) {
          showError('Estoque insuficiente');
          return item;
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  // Remove item from cart
  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal;

  // Handle barcode scan
  const handleBarcodeScan = (code: string) => {
    const product = products.find(p => p.code === code);
    if (product) {
      addToCart(product);
      showSuccess(`${product.name} adicionado ao carrinho`);
    } else {
      showError('Produto não encontrado');
    }
    setIsScannerOpen(false);
  };

  // Finalize sale
  const handleFinalizeSale = async () => {
    if (cart.length === 0) {
      showError('Carrinho vazio');
      return;
    }

    const payment = parseFloat(paymentAmount.replace(',', '.'));
    if (!payment || payment < total) {
      showError('Valor do pagamento inválido');
      return;
    }

    try {
      const saleData = {
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity
        })),
        subtotal,
        discount: 0,
        total,
        payment_method: 'dinheiro',
        customer_name: null,
        notes: null
      };

      await createSale.mutateAsync(saleData);
      
      // Clear cart and payment
      setCart([]);
      setPaymentAmount('');
      
      const change = payment - total;
      if (change > 0) {
        showSuccess(`Troco: ${formatCurrency(change)}`);
      }
    } catch (error) {
      console.error('Erro ao finalizar venda:', error);
    }
  };

  // Auto-focus search when cart is updated
  useEffect(() => {
    const searchInput = document.querySelector('#product-search') as HTMLInputElement;
    if (searchInput) searchInput.focus();
  }, [cart]);

  return (
    <DashboardLayout title="PDV - Ponto de Venda">
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Search */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Produtos</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsScannerOpen(true)}
                  >
                    <Scan className="h-4 w-4 mr-2" />
                    Scanner
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="product-search"
                    placeholder="Buscar produto por nome ou código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {filteredProducts.map(product => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => addToCart(product)}
                      >
                        <div className="flex-1">
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Código: {product.code}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(product.selling_price)}</div>
                          <Badge variant="default">
                            Disponível
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {searchTerm && filteredProducts.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        Nenhum produto encontrado
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Shopping Cart */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Carrinho ({cart.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatCurrency(item.price)} x {item.quantity}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, -1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm min-w-[20px] text-center">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, 1)}
                            disabled={item.quantity >= item.stock}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {cart.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        Carrinho vazio
                      </div>
                    )}
                  </div>
                </ScrollArea>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Valor recebido"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />

                  <Button
                    className="w-full"
                    onClick={handleFinalizeSale}
                    disabled={cart.length === 0 || isCreating}
                  >
                    {isCreating ? 'Finalizando...' : 'Finalizar Venda'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Barcode Scanner */}
      <BarcodeScanner
        isOpen={isScannerOpen}
        onScan={handleBarcodeScan}
        onClose={() => setIsScannerOpen(false)}
      />
    </DashboardLayout>
  );
}
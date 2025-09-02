import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard,
  DollarSign,
  Calculator,
  Scan,
  User,
  Receipt
} from "lucide-react";
import { SaleForm } from "@/components/sales/SaleForm";
import BarcodeScanner from "@/components/scanner/BarcodeScanner";
import { useProductLookup } from "@/hooks/useProductLookup";
import { useSales } from "@/hooks/useSales";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  name: string;
  code: string;
  price: number;
  quantity: number;
  total: number;
}

const PDV = () => {
  const { toast } = useToast();
  const { lookupByName } = useProductLookup();
  const { createSale, isCreating } = useSales();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [discount, setDiscount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;

  const addToCart = (product: any) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      setCartItems([...cartItems, {
        id: product.id,
        name: product.name,
        code: product.code,
        price: product.selling_price,
        quantity: 1,
        total: product.selling_price
      }]);
    }
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }

    setCartItems(cartItems.map(item =>
      item.id === id
        ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
        : item
    ));
  };

  const removeItem = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
    setCustomerName("");
    setDiscount(0);
  };

  const handleScan = (code: string) => {
    try {
      // Temporarily use a simplified search - you can enhance this later
      const mockProduct = {
        id: "1",
        name: `Produto ${code}`,
        code: code,
        selling_price: Math.random() * 50 + 5
      };
      
      addToCart(mockProduct);
      toast({
        title: "Produto adicionado!",
        description: `${mockProduct.name} foi adicionado ao carrinho.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao buscar produto.",
        variant: "destructive"
      });
    }
  };

  const handleFinalizeSale = async () => {
    if (cartItems.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos antes de finalizar a venda.",
        variant: "destructive"
      });
      return;
    }

    try {
      await createSale.mutateAsync({
        customer_name: customerName || undefined,
        discount: discountAmount,
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price
        }))
      });

      clearCart();
      toast({
        title: "Venda finalizada!",
        description: "A venda foi processada com sucesso.",
      });
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <DashboardLayout title="PDV - Ponto de Venda">
      {showScanner && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <Scan className="h-12 w-12 mx-auto text-primary" />
                <h3 className="text-lg font-semibold">Scanner em desenvolvimento</h3>
                <p className="text-sm text-muted-foreground">
                  Funcionalidade será implementada em breve
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setShowScanner(false)}
                  className="w-full"
                >
                  Fechar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Área de Produtos */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scan className="h-5 w-5" />
                Buscar Produtos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Digite o código, nome ou use o scanner..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={() => setShowScanner(true)}
                  className="gap-2"
                >
                  <Scan className="h-4 w-4" />
                  Scanner
                </Button>
              </div>
              
              {/* Produtos rápidos - aqui você pode adicionar produtos favoritos */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <Button variant="outline" className="h-20 flex-col gap-1">
                  <span className="font-semibold">Coca-Cola</span>
                  <span className="text-sm text-muted-foreground">R$ 5,50</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-1">
                  <span className="font-semibold">Pão de Açúcar</span>
                  <span className="text-sm text-muted-foreground">R$ 4,90</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-1">
                  <span className="font-semibold">Leite Integral</span>
                  <span className="text-sm text-muted-foreground">R$ 6,80</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Carrinho */}
        <div className="space-y-4">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Carrinho
                </span>
                <Badge variant="secondary">{cartItems.length} itens</Badge>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 space-y-4">
              {/* Cliente */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">Cliente</span>
                </div>
                <Input
                  placeholder="Nome do cliente (opcional)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              <Separator />

              {/* Itens do Carrinho */}
              <div className="flex-1 overflow-auto space-y-2">
                {cartItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Carrinho vazio</p>
                    <p className="text-sm">Adicione produtos para começar</p>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <p className="text-xs text-muted-foreground">{item.code}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="h-6 w-6 p-0 text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-6 w-6 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-6 w-6 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="font-medium">
                          R$ {item.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cartItems.length > 0 && (
                <>
                  <Separator />
                  
                  {/* Desconto */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      <span className="text-sm font-medium">Desconto (%)</span>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>

                  <Separator />

                  {/* Totais */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>R$ {subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-destructive">
                        <span>Desconto ({discount}%):</span>
                        <span>-R$ {discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>R$ {total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="space-y-2">
                    <Button
                      onClick={handleFinalizeSale}
                      disabled={isCreating}
                      className="w-full gap-2"
                      size="lg"
                    >
                      <CreditCard className="h-4 w-4" />
                      {isCreating ? "Processando..." : "Finalizar Venda"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={clearCart}
                      className="w-full"
                    >
                      Limpar Carrinho
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PDV;
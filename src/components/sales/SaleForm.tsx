import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Minus, Search, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useProducts } from "@/hooks/useProducts";
import { useSales } from "@/hooks/useSales";
import { useInventory } from "@/hooks/useInventory";

const saleSchema = z.object({
  customer_name: z.string().optional(),
  discount: z.number().min(0).optional(),
  notes: z.string().optional(),
});

type SaleFormData = z.infer<typeof saleSchema>;

interface SaleItem {
  product_id: string;
  product_name: string;
  short_code?: number;
  quantity: number;
  unit_price: number;
  available_stock: number;
}

export function SaleForm() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [showProductSearch, setShowProductSearch] = useState(false);

  const { products } = useProducts();
  const { inventory } = useInventory();
  const { createSale, isCreating } = useSales();

  const form = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      discount: 0,
    },
  });

  const getProductStock = (productId: string) => {
    const stock = inventory.find((item) => item.id === productId);
    return stock?.current_stock || 0;
  };

  const filteredProducts = products.filter((product) => {
    const searchTerm = productSearch.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchTerm) ||
      product.short_code?.toString().includes(searchTerm) ||
      product.code?.toLowerCase().includes(searchTerm)
    );
  });

  const addProduct = (product: any) => {
    const existingItem = items.find((item) => item.product_id === product.id);
    const availableStock = getProductStock(product.id);

    if (existingItem) {
      if (existingItem.quantity < availableStock) {
        setItems(
          items.map((item) =>
            item.product_id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
      }
    } else {
      if (availableStock > 0) {
        setItems([
          ...items,
          {
            product_id: product.id,
            product_name: product.name,
            short_code: product.short_code || undefined,
            quantity: 1,
            unit_price: product.selling_price,
            available_stock: availableStock,
          },
        ]);
      }
    }
    setShowProductSearch(false);
    setProductSearch("");
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setItems(items.filter((item) => item.product_id !== productId));
    } else {
      const item = items.find((item) => item.product_id === productId);
      if (item && newQuantity <= item.available_stock) {
        setItems(
          items.map((item) =>
            item.product_id === productId
              ? { ...item, quantity: newQuantity }
              : item
          )
        );
      }
    }
  };

  const updatePrice = (productId: string, newPrice: number) => {
    setItems(
      items.map((item) =>
        item.product_id === productId
          ? { ...item, unit_price: Math.max(0, newPrice) }
          : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setItems(items.filter((item) => item.product_id !== productId));
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );
  const discount = form.watch("discount") || 0;
  const total = Math.max(0, subtotal - discount);

  const onSubmit = async (data: SaleFormData) => {
    if (items.length === 0) return;

    await createSale.mutateAsync({
      ...data,
      items: items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
    });

    // Reset form
    form.reset();
    setItems([]);
    setOpen(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <ShoppingCart className="h-5 w-5" />
          Nova Venda
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Venda</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Informações do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informações do Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="customer_name">Nome do Cliente</Label>
                <Input
                  id="customer_name"
                  placeholder="Nome (opcional)"
                  {...form.register("customer_name")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Produtos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex justify-between items-center">
                Produtos
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProductSearch(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Produto
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showProductSearch && (
                <div className="mb-4 p-4 border rounded-lg bg-muted/50">
                  <Command>
                    <CommandInput
                      placeholder="Buscar produto por nome, código ou SKU..."
                      value={productSearch}
                      onValueChange={setProductSearch}
                    />
                    <CommandList>
                      <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                      <CommandGroup>
                        {filteredProducts.slice(0, 10).map((product) => {
                          const stock = getProductStock(product.id);
                          return (
                            <CommandItem
                              key={product.id}
                              onSelect={() => addProduct(product)}
                              disabled={stock === 0}
                            >
                              <div className="flex-1">
                                <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {product.short_code && (
                                  <Badge variant="outline" className="mr-2">
                                    {product.short_code}
                                  </Badge>
                                )}
                                Código: {product.code} | Estoque: {stock} |{" "}
                                {formatCurrency(product.selling_price)}
                              </div>
                              </div>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowProductSearch(false)}
                    className="mt-2"
                  >
                    Fechar
                  </Button>
                </div>
              )}

              {items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum produto adicionado
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.product_id}
                      className="flex items-center gap-3 p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{item.product_name}</div>
                        {item.short_code && (
                          <Badge variant="outline" className="text-xs">
                            {item.short_code}
                          </Badge>
                        )}
                        <div className="text-xs text-muted-foreground">
                          Estoque: {item.available_stock}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(item.product_id, item.quantity - 1)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(item.product_id, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.available_stock}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="w-32">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unit_price}
                          onChange={(e) =>
                            updatePrice(
                              item.product_id,
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="text-sm"
                        />
                      </div>

                      <div className="w-24 text-right font-medium">
                        {formatCurrency(item.quantity * item.unit_price)}
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeItem(item.product_id)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resumo da Venda */}
          {items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Resumo da Venda</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="discount">Desconto (R$)</Label>
                    <Input
                      id="discount"
                      type="number"
                      step="0.01"
                      min="0"
                      max={subtotal}
                      placeholder="0,00"
                      {...form.register("discount", { valueAsNumber: true })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      placeholder="Observações adicionais"
                      rows={2}
                      {...form.register("notes")}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Desconto:</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 gap-2"
                  disabled={items.length === 0 || isCreating}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {isCreating ? "Processando..." : "Finalizar Venda"}
                </Button>
              </CardFooter>
            </Card>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Minus, Search, ShoppingBag } from "lucide-react";
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
import { usePurchases } from "@/hooks/usePurchases";
import { useDocumentMask } from "@/hooks/useDocumentMask";

const purchaseSchema = z.object({
  supplier_name: z.string().min(1, "Nome do fornecedor é obrigatório"),
  supplier_document: z.string().optional(),
  notes: z.string().optional(),
});

type PurchaseFormData = z.infer<typeof purchaseSchema>;

interface PurchaseItem {
  product_id: string;
  product_name: string;
  short_code?: number;
  quantity: number;
  unit_cost: number;
  expiration_date?: string;
}

export function PurchaseForm() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [showProductSearch, setShowProductSearch] = useState(false);

  const { products } = useProducts();
  const { createPurchase, isCreating } = usePurchases();
  const documentMask = useDocumentMask();

  const form = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema),
  });

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

    if (existingItem) {
      setItems(
        items.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setItems([
        ...items,
        {
          product_id: product.id,
          product_name: product.name,
          short_code: product.short_code || undefined,
          quantity: 1,
          unit_cost: product.cost_price || 0,
        },
      ]);
    }
    setShowProductSearch(false);
    setProductSearch("");
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setItems(items.filter((item) => item.product_id !== productId));
    } else {
      setItems(
        items.map((item) =>
          item.product_id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const updateCost = (productId: string, newCost: number) => {
    setItems(
      items.map((item) =>
        item.product_id === productId
          ? { ...item, unit_cost: Math.max(0, newCost) }
          : item
      )
    );
  };

  const updateExpirationDate = (productId: string, date: string) => {
    setItems(
      items.map((item) =>
        item.product_id === productId
          ? { ...item, expiration_date: date || undefined }
          : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setItems(items.filter((item) => item.product_id !== productId));
  };

  const total = items.reduce(
    (sum, item) => sum + item.quantity * item.unit_cost,
    0
  );

  const onSubmit = async (data: PurchaseFormData) => {
    if (items.length === 0) return;

    await createPurchase.mutateAsync({
      ...data,
      items: items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_cost: item.unit_cost,
        expiration_date: item.expiration_date,
      })),
    });

    // Reset form
    form.reset();
    setItems([]);
    documentMask.reset();
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
          <ShoppingBag className="h-5 w-5" />
          Nova Compra
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Compra</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Informações do Fornecedor */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informações do Fornecedor</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="supplier_name">Nome do Fornecedor *</Label>
                <Input
                  id="supplier_name"
                  placeholder="Nome do fornecedor"
                  {...form.register("supplier_name")}
                />
                {form.formState.errors.supplier_name && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.supplier_name.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="supplier_document">CNPJ/CPF</Label>
                <Input
                  id="supplier_document"
                  placeholder="CNPJ ou CPF (opcional)"
                  value={documentMask.value}
                  onChange={(e) => {
                    const formatted = documentMask.handleChange(e.target.value);
                    form.setValue("supplier_document", formatted);
                  }}
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
                        {filteredProducts.slice(0, 10).map((product) => (
                          <CommandItem
                            key={product.id}
                            onSelect={() => addProduct(product)}
                          >
                            <div className="flex-1">
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {product.short_code && (
                                  <Badge variant="outline" className="mr-2">
                                    {product.short_code}
                                  </Badge>
                                )}
                                Código: {product.code} | Custo: {formatCurrency(product.cost_price || 0)}
                              </div>
                            </div>
                          </CommandItem>
                        ))}
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
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="w-32">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unit_cost}
                          onChange={(e) =>
                            updateCost(
                              item.product_id,
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="text-sm"
                          placeholder="Custo"
                        />
                      </div>

                      <div className="w-32">
                        <Input
                          type="date"
                          value={item.expiration_date || ""}
                          onChange={(e) =>
                            updateExpirationDate(item.product_id, e.target.value)
                          }
                          className="text-sm"
                          placeholder="Validade"
                        />
                      </div>

                      <div className="w-24 text-right font-medium">
                        {formatCurrency(item.quantity * item.unit_cost)}
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

          {/* Resumo da Compra */}
          {items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Resumo da Compra</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    placeholder="Observações adicionais"
                    rows={3}
                    {...form.register("notes")}
                  />
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(total)}</span>
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
                  <ShoppingBag className="h-4 w-4" />
                  {isCreating ? "Processando..." : "Finalizar Compra"}
                </Button>
              </CardFooter>
            </Card>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
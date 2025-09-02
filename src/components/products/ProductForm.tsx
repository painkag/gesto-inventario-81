import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { productSchema, type ProductFormData } from "@/lib/validations/product";
import { useProducts } from "@/hooks/useProducts";
import { Plus } from "lucide-react";
import React, { useState, useEffect } from "react";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];

interface ProductFormProps {
  product?: Product;
  children?: React.ReactNode;
}

export function ProductForm({ product, children }: ProductFormProps) {
  const [open, setOpen] = useState(false);
  const { createProduct, updateProduct } = useProducts();
  
  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      brand: "",
      unit: "UN",
      short_code: undefined,
      cost_price: undefined,
      selling_price: undefined,
      min_stock: undefined,
      is_active: true,
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description || "",
        category: product.category || "",
        brand: product.brand || "",
        unit: product.unit,
        short_code: product.short_code || undefined,
        cost_price: Number(product.cost_price) || undefined,
        selling_price: Number(product.selling_price) || undefined,
        min_stock: Number(product.min_stock) || undefined,
        is_active: product.is_active ?? true,
      });
    }
  }, [product, form]);

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (product) {
        await updateProduct.mutateAsync({ id: product.id, ...data });
      } else {
        await createProduct.mutateAsync(data);
      }
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? "Editar Produto" : "Novo Produto"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do produto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {product && (
              <FormItem>
                <FormLabel>Código</FormLabel>
                <FormControl>
                  <Input value={product.code} disabled className="bg-muted" />
                </FormControl>
                <div className="text-sm text-muted-foreground">
                  Código gerado automaticamente
                </div>
              </FormItem>
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descrição do produto"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="short_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código Curto</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        max="999"
                        placeholder="40"
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? parseInt(value) : undefined);
                        }}
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">
                      1-3 dígitos
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <FormControl>
                      <Input placeholder="Categoria" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <FormControl>
                      <Input placeholder="Marca" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade *</FormLabel>
                    <FormControl>
                      <Input placeholder="UN, KG, L..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="cost_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço de Custo</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0"
                        placeholder="0,00"
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? parseFloat(value) : undefined);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="selling_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço de Venda</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0"
                        placeholder="0,00"
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? parseFloat(value) : undefined);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="min_stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque Mínimo</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        placeholder="0"
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? parseInt(value) : undefined);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Produto Ativo</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Produtos inativos não aparecem nas vendas
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={createProduct.isPending || updateProduct.isPending}
              >
                {product ? "Atualizar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
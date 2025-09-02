import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductWithStock } from "@/hooks/useInventory";

const adjustmentSchema = z.object({
  type: z.enum(["IN", "OUT", "ADJUSTMENT"]),
  quantity: z.string().min(1, "Quantidade é obrigatória"),
  reason: z.string().optional(),
  unitPrice: z.string().optional(),
});

type AdjustmentFormData = z.infer<typeof adjustmentSchema>;

interface StockAdjustmentDialogProps {
  product: ProductWithStock | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    productId: string;
    quantity: number;
    type: "IN" | "OUT" | "ADJUSTMENT";
    reason?: string;
    unitPrice?: number;
  }) => void;
  isLoading?: boolean;
}

export function StockAdjustmentDialog({
  product,
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: StockAdjustmentDialogProps) {
  const form = useForm<AdjustmentFormData>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      type: "ADJUSTMENT",
      quantity: "",
      reason: "",
      unitPrice: "",
    },
  });

  const handleSubmit = (data: AdjustmentFormData) => {
    if (!product) return;

    const quantity = parseFloat(data.quantity);
    const unitPrice = data.unitPrice ? parseFloat(data.unitPrice) : undefined;
    
    onSubmit({
      productId: product.id,
      quantity: data.type === "OUT" ? -Math.abs(quantity) : Math.abs(quantity),
      type: data.type,
      reason: data.reason || undefined,
      unitPrice,
    });

    form.reset();
    onOpenChange(false);
  };

  const movementTypeLabels = {
    IN: "Entrada",
    OUT: "Saída", 
    ADJUSTMENT: "Ajuste",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajustar Estoque</DialogTitle>
        </DialogHeader>

        {product && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted">
              <h4 className="font-medium">{product.name}</h4>
              <p className="text-sm text-muted-foreground">
                Código: {product.code}
              </p>
              <p className="text-sm text-muted-foreground">
                Estoque atual: {product.current_stock.toLocaleString("pt-BR")} {product.unit}
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Movimento</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(movementTypeLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.001"
                          placeholder="Digite a quantidade"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unitPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço Unitário (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="R$ 0,00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motivo (opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva o motivo do ajuste..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Processando..." : "Confirmar Ajuste"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
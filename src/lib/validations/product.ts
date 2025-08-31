import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(255, "Nome muito longo"),
  description: z.string().max(1000, "Descrição muito longa").optional(),
  category: z.string().max(100, "Categoria muito longa").optional(),
  brand: z.string().max(100, "Marca muito longa").optional(),
  unit: z.string().min(1, "Unidade é obrigatória").max(10, "Unidade muito longa"),
  cost_price: z.number().min(0, "Preço de custo não pode ser negativo").optional(),
  selling_price: z.number().min(0, "Preço de venda não pode ser negativo").optional(),
  min_stock: z.number().min(0, "Estoque mínimo não pode ser negativo").optional(),
  is_active: z.boolean().optional().default(true),
});

export type ProductFormData = z.infer<typeof productSchema>;
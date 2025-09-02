import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductForm } from "@/components/products/ProductForm";
import { ProductTable } from "@/components/products/ProductTable";
import { ProductFilters } from "@/components/products/ProductFilters";
import { useProducts } from "@/hooks/useProducts";
import { Plus } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];

const Products = () => {
  const { products, isLoading, error } = useProducts();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Update filtered products when products change
  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  if (error) {
    return (
      <DashboardLayout title="Produtos">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-destructive">
            Erro ao carregar produtos
          </h2>
          <p className="text-muted-foreground mt-2">
            {error instanceof Error ? error.message : "Ocorreu um erro inesperado"}
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Produtos">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Produtos</h1>
            <p className="text-muted-foreground">
              Gerencie o catálogo de produtos da sua empresa
            </p>
          </div>
          
          <ProductForm>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </ProductForm>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            <ProductFilters
              products={products}
              onFilteredProductsChange={setFilteredProducts}
            />
            
            <ProductTable products={filteredProducts} />
            
            {products.length > 0 && (
              <div className="text-center text-sm text-muted-foreground">
                Mostrando {filteredProducts.length} de {products.length} produtos
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Products;
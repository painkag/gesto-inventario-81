import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import React, { useState } from "react";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];

interface ProductFiltersProps {
  products: Product[];
  onFilteredProductsChange: (products: Product[]) => void;
}

export function ProductFilters({ products, onFilteredProductsChange }: ProductFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Get unique categories for filter
  const categories = Array.from(
    new Set(
      products
        .map((p) => p.category)
        .filter((category): category is string => Boolean(category))
    )
  ).sort();

  const applyFilters = (
    search: string,
    status: string,
    category: string
  ) => {
    let filtered = [...products];

    // Search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.code.toLowerCase().includes(searchLower) ||
          product.brand?.toLowerCase().includes(searchLower) ||
          product.category?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (status !== "all") {
      filtered = filtered.filter((product) => 
        status === "active" ? product.is_active : !product.is_active
      );
    }

    // Category filter
    if (category !== "all") {
      filtered = filtered.filter((product) => product.category === category);
    }

    onFilteredProductsChange(filtered);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    applyFilters(value, statusFilter, categoryFilter);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    applyFilters(searchTerm, value, categoryFilter);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    applyFilters(searchTerm, statusFilter, value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
    onFilteredProductsChange(products);
  };

  const hasActiveFilters = 
    searchTerm.trim() !== "" || 
    statusFilter !== "all" || 
    categoryFilter !== "all";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, código, marca ou categoria..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
          </SelectContent>
        </Select>

        {categories.length > 0 && (
          <Select value={categoryFilter} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full sm:w-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Limpar
          </Button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchTerm.trim() && (
            <Badge variant="secondary">
              Busca: "{searchTerm}"
            </Badge>
          )}
          {statusFilter !== "all" && (
            <Badge variant="secondary">
              Status: {statusFilter === "active" ? "Ativo" : "Inativo"}
            </Badge>
          )}
          {categoryFilter !== "all" && (
            <Badge variant="secondary">
              Categoria: {categoryFilter}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useBlueToast } from '@/hooks/useBlueToast';
import { useAuth } from '@/hooks/useAuth';

interface Product {
  id: string;
  name: string;
  code: string;
  selling_price: number;
  cost_price: number;
  description?: string;
  category?: string;
  brand?: string;
  unit: string;
  min_stock: number;
  is_active: boolean;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([
    // Mock data for now to test PDV functionality
    {
      id: '1',
      name: 'Produto Teste 1',
      code: '123456789012',
      selling_price: 10.50,
      cost_price: 8.00,
      unit: 'UN',
      min_stock: 5,
      is_active: true,
      company_id: 'test',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2', 
      name: 'Produto Teste 2',
      code: '123456789013',
      selling_price: 25.99,
      cost_price: 20.00,
      unit: 'UN',
      min_stock: 10,
      is_active: true,
      company_id: 'test',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  return {
    products,
    isLoading,
    error,
    refetch: () => {}
  };
};
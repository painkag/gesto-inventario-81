import { useState } from 'react';
import { useBlueToast } from '@/hooks/useBlueToast';
import { useAuth } from '@/hooks/useAuth';

interface SaleItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface CreateSaleData {
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  payment_method: string;
  customer_name?: string | null;
  notes?: string | null;
}

export const useSales = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { showSuccess, showError } = useBlueToast();

  const createSale = {
    mutateAsync: async (saleData: CreateSaleData) => {
      setIsCreating(true);
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock successful sale creation
        console.log('Mock sale created:', saleData);
        showSuccess('Venda finalizada com sucesso!');
        
        return {
          id: Date.now().toString(),
          ...saleData
        };
        
      } catch (error: any) {
        console.error('Error creating sale:', error);
        showError(error.message || 'Erro ao finalizar venda');
        throw error;
      } finally {
        setIsCreating(false);
      }
    }
  };

  return {
    createSale,
    isCreating
  };
};
import React, { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from './useCompany';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  code: string;
  selling_price: number;
  short_code?: number;
}

export function useProductLookup() {
  const [isLoading, setIsLoading] = useState(false);
  const { data: company } = useCompany();
  const { toast } = useToast();

  const lookupByBarcode = useCallback(async (barcode: string): Promise<Product | null> => {
    if (!company?.id || !barcode.trim()) {
      return null;
    }

    setIsLoading(true);
    
    try {
      console.log('Looking up product by barcode:', barcode);

      const { data, error } = await supabase
        .from('products')
        .select('id, name, code, selling_price, short_code')
        .eq('company_id', company.id)
        .eq('code', barcode.trim())
        .maybeSingle();

      if (error) {
        console.error('Error looking up product:', error);
        toast({
          title: "Erro na busca",
          description: "Erro ao buscar produto no sistema.",
          variant: "destructive"
        });
        return null;
      }

      if (!data) {
        console.log('Product not found for barcode:', barcode);
        toast({
          title: "Produto não encontrado",
          description: `Código ${barcode} não foi encontrado no sistema.`,
          variant: "destructive"
        });
        return null;
      }

      console.log('Product found:', data);
      toast({
        title: "Produto encontrado!",
        description: `${data.name} - ${data.code}`
      });

      return data;

    } catch (error) {
      console.error('Unexpected error in product lookup:', error);
      toast({
        title: "Erro inesperado",
        description: "Erro ao buscar produto. Tente novamente.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [company?.id, toast]);

  const lookupByShortCode = useCallback(async (shortCode: number): Promise<Product | null> => {
    if (!company?.id || !shortCode) {
      return null;
    }

    setIsLoading(true);
    
    try {
      console.log('Looking up product by short code:', shortCode);

      const { data, error } = await supabase
        .from('products')
        .select('id, name, code, selling_price, short_code')
        .eq('company_id', company.id)
        .eq('short_code', shortCode)
        .maybeSingle();

      if (error) {
        console.error('Error looking up product by short code:', error);
        return null;
      }

      if (!data) {
        console.log('Product not found for short code:', shortCode);
        toast({
          title: "Produto não encontrado",
          description: `Código curto ${shortCode} não foi encontrado.`,
          variant: "destructive"
        });
        return null;
      }

      console.log('Product found by short code:', data);
      return data;

    } catch (error) {
      console.error('Unexpected error in short code lookup:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [company?.id, toast]);

  const lookupByName = useCallback(async (searchTerm: string): Promise<Product[]> => {
    if (!company?.id || !searchTerm.trim()) {
      return [];
    }

    setIsLoading(true);
    
    try {
      console.log('Looking up products by name:', searchTerm);

      const { data, error } = await supabase
        .from('products')
        .select('id, name, code, selling_price, short_code')
        .eq('company_id', company.id)
        .ilike('name', `%${searchTerm.trim()}%`)
        .limit(20);

      if (error) {
        console.error('Error looking up products by name:', error);
        return [];
      }

      return data || [];

    } catch (error) {
      console.error('Unexpected error in name lookup:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [company?.id]);

  return {
    lookupByBarcode,
    lookupByShortCode,
    lookupByName,
    isLoading
  };
}